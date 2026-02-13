# Pitfalls Research

**Domain:** Local e-commerce — electric scooters, Morocco, trilingual (FR/AR/EN), Laravel API + React MUI, cash on delivery
**Researched:** 2026-02-12
**Confidence:** MEDIUM-HIGH (RTL/MUI claims verified via official MUI docs and GitHub issues; COD patterns from industry reports; Laravel patterns from production articles; database i18n from multiple technical sources)

---

## Critical Pitfalls

### Pitfall 1: RTL/LTR Direction Not Applied Globally — Causing Layout Chaos Mid-Project

**What goes wrong:**
When Arabic is selected, the entire layout must flip to RTL. Developers often apply `dir="rtl"` to a single component or section but forget to update `document.dir`, the MUI theme `direction: 'rtl'`, and the Emotion CacheProvider with `stylis-plugin-rtl`. The result: MUI components use RTL styles, native HTML elements stay LTR, and the layout becomes a broken mix. Worse, fixing this late means hunting down every hardcoded `margin-left`, `padding-right`, `text-align: left` across the entire codebase.

**Why it happens:**
RTL is treated as "just a CSS tweak" rather than a system-level concern. Developers ship the LTR version first and bolt on RTL later, discovering that Emotion's CSS-in-JS does not automatically flip directional properties without `stylis-plugin-rtl`.

**How to avoid:**
- Set up RTL infrastructure in Phase 1 before writing a single page component.
- Three places must be synchronized on every language switch: (1) `document.dir = 'rtl'|'ltr'`, (2) MUI `createTheme({ direction: 'rtl' })`, (3) Emotion's `CacheProvider` with `createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] })`.
- For LTR mode, do NOT remove the `CacheProvider` — keep it with an empty cache to avoid re-render thrashing (confirmed in MUI GitHub issue #33892).
- Use CSS logical properties (`padding-inline-start` not `padding-left`, `margin-inline-end` not `margin-right`) from the very first line of custom CSS.
- Portal components (Dialog, Drawer, Tooltip, Menu) render outside the parent DOM and do NOT inherit `dir` from parent. Apply `dir` directly to each portal component.

**Warning signs:**
- A dialog box opens in LTR while the page is in RTL mode.
- Product card prices appear on the wrong side of the layout.
- Icons (arrows, chevrons) point in the wrong direction in RTL mode.
- Text alignment looks correct but padding/margins are not mirrored.

**Phase to address:**
Phase 1 (Project Foundation / Design System setup) — before any UI components are built. Validate with a simple RTL smoke test: render a card with text, an icon, and a price in Arabic, and confirm full mirror.

---

### Pitfall 2: Multilingual Database Schema Added as Afterthought — Requires Full Migration

**What goes wrong:**
Product names, descriptions, and category names are stored as single-language columns (`name VARCHAR`, `description TEXT`). When Arabic and French support is added later, the migration requires restructuring every product, category, and content table — and all existing API queries and frontend rendering must be updated simultaneously. This is a rewrite, not a feature.

**Why it happens:**
Developers start with the "simplest thing that works" (single-language columns) and plan to "add i18n later." But the database schema is the foundation — changing it after data exists requires complex migration scripts, downtime, and risk.

**How to avoid:**
Use a translation table pattern from day one. For each translatable model (products, categories, delivery zones, etc.):
- Main table holds non-translatable data: `price`, `stock`, `sku`, `created_at`.
- Translation table holds locale-specific data: `product_translations(product_id, locale, name, description, slug)`.
- Default locale fallback: if Arabic translation is missing, fall back to French.
- Use `spatie/laravel-translatable` or `astrotomic/laravel-translatable` — both have stable Laravel 11 support and handle the translation table pattern cleanly.

Avoid JSON column approach for this project: JSON columns in MySQL make full-text search hard, translation completeness is invisible to the database, and concurrent updates cause consistency issues.

**Warning signs:**
- Any column named `name`, `description`, `title` without a `_fr`, `_ar`, `_en` suffix or a corresponding `_translations` table.
- The API returns a `name` field as a plain string rather than a locale-keyed object.
- Frontend shows hardcoded French text in the product catalog.

**Phase to address:**
Phase 1 (Database design) — schema must be translation-ready before the first seed or migration is run.

---

### Pitfall 3: COD Fake/Phantom Orders With No Validation Gate — Destroys Operational Efficiency

**What goes wrong:**
Cash on delivery has a 26% average return-to-origin (RTO) rate industry-wide. Without any order validation layer, the system accepts every order placed — including prank orders, duplicate submissions, and orders from addresses outside the delivery zone. Admin time is wasted confirming orders that will never be collected. Delivery personnel make wasted trips. Inventory is reserved for phantom orders.

**Why it happens:**
The COD model is "pay later" — there is no payment friction to filter out non-serious buyers. Without compensating controls, the backend becomes an order dumping ground.

**How to avoid:**
- Require phone number verification (SMS OTP) before order placement. Morocco SMS with Arabic content uses UCS-2 encoding — a 150-character Arabic confirmation message costs 3x a standard SMS segment. Keep OTP messages in French or transliterated to stay within 1 segment.
- Implement duplicate order detection: flag if the same phone number submits an order for the same product within 10 minutes.
- City/zone validation at order creation: reject orders for cities not in the delivery zone table before the order record is written.
- Show a clear order review screen ("confirm before submit") with delivery fee calculated, not after.
- Admin confirmation queue should surface phone number, address, and order history for the customer — not just order details.

**Warning signs:**
- No phone verification on checkout.
- Orders are accepted for cities with no delivery zone entry.
- The same customer submits 3+ orders for the same item within 1 hour.
- No duplicate/fraud detection in order creation logic.

**Phase to address:**
Phase 2 (Order workflow) — bake validation into the order creation endpoint, not as a later moderation feature.

---

### Pitfall 4: Order Status Machine Is Implicit — Enabling Illegal State Transitions

**What goes wrong:**
Order statuses (pending → confirmed → dispatched → delivered → cancelled) are stored as a free-text or enum column but never enforced as a state machine. Admin users can transition an already-delivered order back to "pending," cancel a dispatched order without a reason, or confirm the same order twice in a race condition (two admin users confirming simultaneously). The database ends up with logically inconsistent order histories.

**Why it happens:**
The state machine is assumed to be enforced by the UI (only showing valid actions), but UI-only enforcement is fragile: direct API calls bypass it, and race conditions bypass it entirely.

**How to avoid:**
- Define allowed transitions explicitly in the backend: `pending → confirmed`, `confirmed → dispatched`, `dispatched → delivered`, `{pending,confirmed} → cancelled`. Any other transition throws a 422.
- Use Laravel's database transactions with pessimistic locking (`lockForUpdate()`) on the order row when changing status. This prevents two admin users from confirming the same order simultaneously.
- Log every status change with: actor (admin user ID), timestamp, previous status, new status, optional note. Use a `order_status_logs` table, not just updated `status` column.
- Consider `spatie/laravel-model-states` for formalized state machine with transition guards.

**Warning signs:**
- Order `status` is a plain `string` column with no transition validation in the model or service layer.
- No `order_status_logs` table or audit trail.
- Admin panel allows clicking "Confirm" on an already-dispatched order without an error.
- No database locking on order status updates.

**Phase to address:**
Phase 2 (Order management backend) — state machine must be part of the initial order model design.

---

### Pitfall 5: Arabic Number Display — Eastern vs Western Arabic Numerals

**What goes wrong:**
When the app locale is set to `ar` and prices or quantities are formatted with `Intl.NumberFormat('ar-MA')`, some browsers render Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) instead of Western Arabic numerals (0123456789). Moroccan Arabic users expect Western Arabic numerals for prices — Eastern numerals look wrong and reduce trust. Additionally, Arabic text in the same input field as a number can have incorrect punctuation placement due to Unicode bidirectional algorithm conflicts.

**Why it happens:**
`ar-MA` (Morocco) locale defaults to Western Arabic numerals in modern browsers, but the behavior varies. Developers assume "Arabic locale = Arabic numerals" without testing, and the variation between devices and browsers causes inconsistency.

**How to avoid:**
- Always use `Intl.NumberFormat('ar-MA-u-nu-latn')` to explicitly force Latin numerals for prices across all locales in this app (Morocco convention).
- Never use `parseFloat()` on localized price strings — it only handles Latin digits. Use a locale-aware parser or strip formatting before parsing.
- Test price display on at least two browsers and one mobile device when Arabic locale is active.
- For currency: Morocco uses MAD. Format as `Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' })` — French locale + Morocco region gives the most familiar format for Moroccan users (`1 234,00 MAD`).

**Warning signs:**
- Price displays correctly in dev tools (Chrome on Windows) but looks different on a tester's Android phone.
- A price input field shows garbled text when mixing Arabic text and numbers.
- Prices show `٢٤٩٩ درهم` instead of `2 499 MAD`.

**Phase to address:**
Phase 1 (Internationalization setup) — establish the price/number formatting utility function before any price display is built.

---

## Moderate Pitfalls

### Pitfall 6: Laravel N+1 Queries on Product Listing Endpoints

**What goes wrong:**
The product listing endpoint loads products, then for each product makes separate queries for category, images, and translations. With 50 products on a page, this generates 150+ queries per request. The endpoint responds in milliseconds locally (SQLite or small dataset) but takes 3-5 seconds in production with real data.

**Why it happens:**
Eloquent's lazy loading makes N+1 invisible during development. Each `$product->category->name` or `$product->images` call triggers a query that does not appear when testing with 5 products.

**How to avoid:**
- Call `Model::preventLazyLoading(!app()->isProduction())` in `AppServiceProvider::boot()` to throw an exception during development when a relationship is accessed without eager loading.
- All product listing queries must use explicit eager loading: `Product::with(['category.translations', 'images', 'translations'])->paginate(20)`.
- Use `select()` to limit columns — never `SELECT *` on product joins.
- Install Laravel Debugbar during development to monitor query counts on every request.

**Warning signs:**
- Product listing API takes >500ms locally with 20+ products.
- Laravel Debugbar shows 30+ queries on a single page load.
- `preventLazyLoading` throws exceptions on the product list route.

**Phase to address:**
Phase 2 (Product catalog API) — eager loading strategy established at query authoring time.

---

### Pitfall 7: Sanctum Auth CORS Misconfiguration Between Separate React SPA and Laravel API

**What goes wrong:**
Laravel Sanctum's SPA authentication uses HttpOnly cookies and requires the frontend and backend to share the same top-level domain. When React dev server runs on `localhost:3000` and Laravel runs on `localhost:8000`, cookie-based auth breaks with 401 errors or CSRF mismatch — even with `withCredentials: true`. In production, if frontend is on `app.trotinette.ma` and API is on `api.trotinette.ma`, the domains must be explicitly configured in Sanctum's `stateful` domains list and CORS `supports_credentials` must be `true`.

**How to avoid:**
- Add both `localhost:3000` and `localhost:8000` to `SANCTUM_STATEFUL_DOMAINS` during development.
- Set `supports_credentials: true` in `config/cors.php`.
- Always call `/sanctum/csrf-cookie` before the first non-GET request (login, register).
- Set `axios.defaults.withCredentials = true` globally.
- In production, ensure both SPA and API share the root domain (`trotinette.ma`).
- Alternative: use API token authentication (Bearer tokens) instead of cookie-based auth for the SPA — simpler to configure for a separate-origin architecture, though less secure against XSS. For an admin panel on a separate domain, token auth is the pragmatic choice.

**Warning signs:**
- 401 Unauthenticated errors immediately after login.
- CORS errors in browser console for POST requests.
- Login appears to succeed but subsequent authenticated requests fail.

**Phase to address:**
Phase 1 (Authentication foundation) — auth stack must work end-to-end before any protected features are built.

---

### Pitfall 8: Delivery Zone/Fee Logic Duplicated Between Frontend and Backend

**What goes wrong:**
Delivery fee calculation based on city is implemented in the React frontend for "instant" display to the user and again in the Laravel backend for order creation validation. When an admin changes a city's delivery fee in the database, only one side updates. Orders are created with a frontend-displayed fee that no longer matches the backend-calculated fee. Users see one price at checkout but the order total shows a different price.

**How to avoid:**
- Delivery fee calculation lives exclusively in the backend. The frontend calls a `/api/delivery-fee?city_id=X` endpoint when the user selects a city — it never calculates fees independently.
- City and delivery zone data is fetched fresh at checkout start, never cached in component state from a previous session.
- Order creation endpoint recalculates and stores the delivery fee at the moment of order creation. The stored fee is the source of truth, not a re-query from the zone table.
- Admin changes to delivery zones take effect immediately — no cached stale fee in open browser tabs matters because checkout always fetches fresh.

**Warning signs:**
- A `calculateDeliveryFee(cityId)` function exists in the React codebase.
- The delivery fee shown in the order confirmation email differs from what the user saw at checkout.
- Admin updates a city fee but existing browser sessions show the old fee.

**Phase to address:**
Phase 2 (Order creation flow) — delivery fee API endpoint built before checkout UI.

---

### Pitfall 9: Fat Controllers — Business Logic in API Controllers

**What goes wrong:**
Order creation, status updates, and product management logic accumulates inside controller methods. Controllers grow to 300+ lines. Testing business rules requires booting the full HTTP stack. When the same logic is needed in a queue job or a CLI command, it gets duplicated.

**How to avoid:**
- Controllers receive requests, validate via Form Request classes, call a Service or Action class, return a response. Nothing more.
- Order placement logic (validation, fee calculation, inventory check, status initialization, notification dispatch) lives in an `OrderService` or `PlaceOrderAction`.
- Authorization logic lives in Policies, not in `if ($user->role === 'admin')` checks inside controllers.
- Use Laravel Form Request classes for all validation — never validate inline in a controller method.

**Warning signs:**
- A controller method exceeds 50 lines.
- `if ($request->user()->role === 'admin')` appears in a controller.
- The same validation rules appear in two different controller methods.

**Phase to address:**
Phase 1 (Backend architecture setup) — establish the Service/Action pattern before the first business feature.

---

### Pitfall 10: Images Served Through PHP / Stored in `public/` Without CDN Strategy

**What goes wrong:**
Product images are uploaded, stored in Laravel's `storage/app/public/` directory, and served via PHP through the `public/storage` symlink. Every image request hits the PHP/Laravel process, consuming server memory and blocking web workers. On a shared VPS with 20 concurrent users browsing the scooter catalog, this causes visible slowdown. When the server is redeployed or the storage volume is not persisted, all uploaded images vanish.

**How to avoid:**
- Configure Laravel to use a cloud storage driver (S3-compatible, e.g. Cloudflare R2 which has zero egress fees) from day one.
- Even in MVP, store images in `local` disk but document the migration path to S3 clearly.
- Product images must be resized and compressed on upload — use `spatie/laravel-medialibrary` or `intervention/image` to generate multiple sizes (thumbnail, medium, full) at upload time, not at request time.
- Never store original uncompressed uploads in a path served to the public.
- Image URLs in API responses should be absolute URLs, not relative paths, to survive CDN migration.

**Warning signs:**
- Image paths in API responses look like `/storage/products/...` (relative, server-tied).
- No image compression or resizing on upload.
- After deployment, old images are missing because `storage/` was not preserved.

**Phase to address:**
Phase 2 (Product management) — image upload infrastructure established before admin can upload the first product photo.

---

### Pitfall 11: i18next Language Detection Misconfigured — FOUC and Wrong Locale on First Load

**What goes wrong:**
The React frontend initializes with the browser's default language (often `en` or `fr`). There is a flash of untranslated content (FOUC) as i18next loads the correct locale asynchronously. Worse, if `localStorage` is the detection source, a user who previously used the site in French is shown French on their next visit even if they have since changed their browser language. Arabic users who have never visited get English by default because the browser detection order is not configured to prefer `ar-MA`.

**How to avoid:**
- Use `i18next-browser-languageDetector` with detection order: `['localStorage', 'navigator', 'htmlTag']`.
- Preload all three locale files at bundle time (not lazy-loaded) — at 3 locales × ~10KB each, this is 30KB extra, which is acceptable for avoiding FOUC.
- Set `lng: 'fr'` as fallback (French is the primary commercial language in Morocco).
- On language change, update: (1) i18next locale, (2) `localStorage`, (3) `document.dir`, (4) MUI theme direction, (5) `<html lang="...">` attribute. These five must be atomic.
- The backend API response `Accept-Language` header must match the frontend locale — ensure Axios sends the current locale header on every request for server-side locale-aware responses.

**Warning signs:**
- Page flashes English text before switching to Arabic for 200ms.
- Browser language is Arabic but the app loads in French.
- Changing language updates the UI text but not the document direction.
- API validation error messages return in a different language than the UI.

**Phase to address:**
Phase 1 (i18n foundation) — language detection, switching, and persistence fully wired before any UI is translated.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single-language columns (`name`, `description`) | Simpler schema, faster to start | Full schema migration + API changes needed for i18n; likely a rewrite | Never for this project |
| RTL added after LTR is built | Faster initial delivery | Every custom CSS rule must be audited and fixed; layout bugs take weeks | Never for this project |
| Frontend delivery fee calculation | Instant display without API call | Fee drift when admin updates zones; orders with wrong fees in DB | Never |
| `SELECT *` on product queries | Less boilerplate | N+1 risk; over-fetching 30+ columns on product list | Never in production |
| No order state machine validation | Simpler CRUD controllers | Illegal status transitions, audit trail gaps, race conditions in admin | Never |
| Images in `public/storage/` only | No cloud setup needed for MVP | Images lost on redeploy; PHP serves images; no CDN | MVP only, must document migration path |
| No lazy loading prevention flag | Fewer exceptions during dev | N+1 queries go undetected until production load | Never — enable in development always |
| API token auth over Sanctum cookies for admin | Avoids CSRF/domain complexity | Less secure vs XSS, requires secure token storage | Acceptable for admin panel on different subdomain |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| MUI + Emotion RTL | Adding `stylis-plugin-rtl` only to theme, not CacheProvider | Wrap entire app in `CacheProvider` with rtl-keyed cache; provide empty cache for LTR — never toggle CacheProvider presence |
| Laravel Sanctum | Testing auth only in same-origin dev setup | Test CORS explicitly with separate port dev servers from the start |
| i18next + MUI | Changing i18next locale but not MUI theme direction | Create a single `useLanguage()` hook that synchronizes both simultaneously |
| Laravel file storage | Using `Storage::url()` returning relative paths | Configure `APP_URL` and `FILESYSTEM_DISK` properly; use `Storage::url()` only after confirming it returns absolute URLs |
| SMS (Morocco) | Arabic message text triggering UCS-2 encoding (70-char limit vs 160) | Use French for order confirmation SMS to avoid 3x cost; reserve Arabic for display-only notifications |
| React i18next + Laravel API | Frontend locale and backend `Accept-Language` getting out of sync | Axios interceptor: always attach `Accept-Language: {currentLocale}` header; Laravel middleware reads it to set app locale |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No eager loading on product list | API response >2s with 50+ products | `Product::with([...])`, `preventLazyLoading()` in dev | ~20 products in DB |
| Serving images via PHP | High server CPU, slow image loads | Cloud storage or nginx to serve `/storage/` directly | ~10 concurrent users |
| All locale files in one bundle | Large initial JS payload | Preload all 3 small locale files (acceptable at 30KB) OR use lazy loading per route | At 1000+ translation strings |
| Re-creating RTL Emotion cache on every render | UI jitter, excessive re-renders | Create cache instances once outside component tree | Immediately visible |
| Order history loading all orders for admin | Admin panel slows as orders accumulate | Paginate from day one; never `Order::all()` | ~500 orders |
| Delivery zone query on every order API call | Latency on order-heavy endpoints | Cache delivery zones in Redis/cache with TTL; invalidate when admin updates zones | ~100 concurrent orders |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No role-based middleware on admin routes | Customers access admin panel | Laravel Policies + Gates + `auth:sanctum` + role check on every admin route group |
| Accepting order price from frontend | Customers manipulate order total | Never trust frontend price; always calculate total server-side from product prices in DB |
| No rate limiting on order placement | Flood of fake COD orders | Laravel `throttle:5,1` on order creation endpoint per IP and per phone number |
| Exposing internal user IDs in sequential order | Order ID enumeration attack | Use UUIDs for orders or non-sequential public IDs |
| No file type validation on image uploads | Malicious file upload | Validate MIME type server-side (not just extension); use `Intervention/Image` to force re-encode |
| Admin API endpoints without activity logging | No audit trail for order confirmations | Log every admin action: who changed what order, when, from what status to what status |
| Missing HTTPS in production | Session cookies transmitted in plaintext | Enforce HTTPS; set `SESSION_SECURE_COOKIE=true` in production `.env` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing delivery fee only at final checkout step | User frustration, cart abandonment | Show delivery fee as soon as city is selected; recalculate in real-time via API |
| Order confirmation page with no contact info for questions | Customer anxiety post-order (especially COD) | Show phone number of shop on confirmation; send SMS confirmation |
| Language switcher changes URL or reloads page | Jarring experience, loses cart state | Language switch updates UI in-place via i18next; no navigation required |
| Arabic product descriptions with Latin letter-spacing CSS | Letters visually disconnected (Arabic requires connected glyphs) | Zero `letter-spacing` for `ar` locale; override any global letter-spacing with `[lang="ar"] { letter-spacing: 0 }` |
| Price displayed in Eastern Arabic numerals | Moroccan users confused by ١٢٣ | Always use `nu-latn` in `Intl.NumberFormat` for this market |
| Order status page uses technical status labels (`dispatched`) | Non-French-speaking admin confused | Show human-readable trilingual status labels; "En cours de livraison" / "قيد التسليم" / "Out for delivery" |
| No "out of stock" indicator on product cards | Users add unavailable scooter to cart | Stock check in product list API; disable Add to Cart on `stock: 0`; never hide out-of-stock products from catalog |

---

## "Looks Done But Isn't" Checklist

- [ ] **RTL Layout:** Tested by switching to Arabic locale AND resizing window — verify Dialog, Drawer, and dropdown menus all flip correctly, not just page text.
- [ ] **Translation completeness:** Every string in all 3 locales present — missing keys show key name in UI, not empty string. Configure i18next `missingKeyHandler` to warn in development.
- [ ] **Order total calculation:** Verified that manipulating the React request payload to send a lower price does not affect the stored order total in the database.
- [ ] **City validation:** Placing an order with a city ID not in the delivery zones table returns a 422, not a 500.
- [ ] **Image persistence:** After `php artisan storage:link` re-run (which happens on deploy), uploaded images are still accessible.
- [ ] **Admin authorization:** A request to `GET /api/admin/orders` with a customer-role token returns 403, not 200.
- [ ] **Locale in API errors:** Laravel validation errors return translated messages matching the `Accept-Language` header, not always in English.
- [ ] **Phone OTP flow:** Duplicate order protection: placing the same order twice within 5 minutes shows an error on the second attempt.
- [ ] **Delivery fee on order record:** The `delivery_fee` column on the orders table is set at order creation time from the server-side zone lookup — not copied from the request body.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Single-language columns in production | HIGH | Add `*_translations` table, migrate existing data, update all API serializers, update all frontend rendering — potentially 3-5 days |
| LTR-only CSS in production | HIGH | Audit every custom CSS rule, replace directional properties with logical properties, test every page in RTL — 2-4 days |
| N+1 queries discovered in production | MEDIUM | Add eager loading to specific endpoints, add Debugbar/Telescope in staging to find remaining cases — 1-2 days |
| Images lost on redeploy | MEDIUM | If no cloud backup: retrieve from server snapshots; going forward, migrate to S3 — 1 day for migration |
| Fake order flood | MEDIUM | Add rate limiting and phone OTP immediately; purge fake orders from DB; implement blacklist for flagged phones — 1 day |
| State machine violation in orders | MEDIUM | Add transition validation to service layer; manually fix inconsistent order records; add audit log — 1-2 days |
| CORS auth failure discovered in staging | LOW | Update `SANCTUM_STATEFUL_DOMAINS` and `cors.php` `allowed_origins` — 30 minutes |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RTL not global (Pitfall 1) | Phase 1: Design System / i18n Foundation | Smoke test: Arabic locale, verify Dialog + Drawer + card layout all RTL |
| Multilingual schema missing (Pitfall 2) | Phase 1: Database Design | Schema review: no single-language content columns exist |
| COD fake orders (Pitfall 3) | Phase 2: Order Workflow | Place order without OTP → rejected; city not in zones → rejected |
| Order state machine (Pitfall 4) | Phase 2: Order Management Backend | Attempt illegal transition via API → 422; confirm same order twice → second 422 |
| Arabic numeral display (Pitfall 5) | Phase 1: i18n Foundation | Visual test: prices render as `2 499 MAD` not `٢٤٩٩` in Arabic locale |
| N+1 queries (Pitfall 6) | Phase 2: Product Catalog API | `preventLazyLoading()` enabled; Debugbar shows ≤5 queries on product list |
| Sanctum CORS (Pitfall 7) | Phase 1: Auth Foundation | Auth E2E test across separate dev server ports |
| Fee duplication (Pitfall 8) | Phase 2: Order Creation Flow | No fee calculation function in React codebase |
| Fat controllers (Pitfall 9) | Phase 1: Backend Architecture | Code review: no controller method >50 lines |
| Image storage (Pitfall 10) | Phase 2: Product Management | Images survive `storage:link` re-run; API returns absolute URLs |
| i18next FOUC (Pitfall 11) | Phase 1: i18n Foundation | Hard-reload in Arabic locale → no text flicker |

---

## Sources

- [Right-to-left support — Material UI (official docs)](https://mui.com/material-ui/customization/right-to-left/)
- [RTL support for Material UI Emotion — GitHub Issue #33892](https://github.com/mui/material-ui/issues/33892)
- [Right to Left in React: Developer's Guide — LeanCode](https://leancode.co/blog/right-to-left-in-react)
- [Toggle Theme-Mode and Direction in MUI (including Date Pickers) — Itay Perry, Medium](https://medium.com/@itayperry91/react-and-mui-change-muis-theme-mode-direction-and-language-including-date-pickers-ad8e91af30ae)
- [Common Laravel Mistakes in Production — Laravel.io](https://laravel.io/articles/common-laravel-mistakes-i-see-in-production-and-how-to-avoid-them)
- [Solving the N+1 Problem in Laravel with Eloquent — Medium](https://medium.com/@kamrankhalid06/solving-the-n-1-problem-in-laravel-with-eloquent-d91a22770ef1)
- [Automatic Eager Loading in Laravel 12 — Laravel12.com](https://laravel12.com/posts/2025-05-07-automatic-eager-loading-antidote-to-n-plus-1-queries/)
- [Cash on Delivery Problems Guide — Qikink (2026)](https://qikink.com/blog/cash-on-delivery-problems/)
- [Addressing COD Order Challenges — Cybez](https://www.cybez.com/addressing-cod-order-challenges-in-e-commerce-effective-solutions-and-best-practices/)
- [Complete Guide to Cash on Delivery Automation in Morocco — CODSPOT](https://www.codspot.io/post/complete-guide-to-cash-on-delivery-automation-in-morocco)
- [Send SMS to Morocco: ANRT Compliance Guide — Sent.dm](https://www.sent.dm/resources/morocco-sms-guide)
- [Morocco SMS Networks — Arabic Characters Unicode — ASPSMS](https://www.aspsms.com/en/networks/morocco/home.asp)
- [Best Practices for Multi-Language Database Design — Redgate](https://www.red-gate.com/blog/multi-language-database-design)
- [Building Multilingual Relational Databases — The Honest Coder](https://thehonestcoder.com/building-multilingual-relational-databases/)
- [Number Localization Guide — Phrase](https://phrase.com/blog/posts/number-localization/)
- [Intl.NumberFormat — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Laravel Sanctum SPA Auth: Setup and Common Mistakes — cdruc.com](https://cdruc.com/laravel-spa-auth-extended)
- [Laravel 11 Sanctum + CORS Errors — Medium](https://medium.com/@kbarman1015/laravel-11-errors-with-fortify-and-sanctum-and-how-to-handle-them-cors-policy-cookies-not-saved-4380042921fa)
- [Race Conditions in Inventory/Order Status — Sylius GitHub Issue #2776](https://github.com/Sylius/Sylius/issues/2776)
- [ACSD-51036: Race Conditions During Concurrent REST API Calls — Adobe Commerce](https://experienceleague.adobe.com/en/docs/commerce-operations/tools/quality-patches-tool/patches-available-in-qpt/v1-1-31/acsd-51036-race-conditions-during-concurrent-rest-api-calls-cause-overwrite-of-shipping-status)
- [Laravel File Upload and Storage Best Practices — Lexo.ch (2025)](https://www.lexo.ch/blog/2025/08/file-upload-and-storage-in-laravel-best-practices/)
- [Why Laravel Image Handling Still Sucks — byteMyCache](https://bytemycache.com/posts/why-laravel-image-handling-still-sucks-and-how-to-fix-it/)
- [i18next-browser-languageDetector GitHub](https://github.com/i18next/i18next-browser-languageDetector)
- [RTL Styling 101 — rtlstyling.com](https://rtlstyling.com/posts/rtl-styling/)

---
*Pitfalls research for: Local e-commerce — electric scooters, Morocco, trilingual FR/AR/EN, Laravel + React MUI, cash on delivery*
*Researched: 2026-02-12*
