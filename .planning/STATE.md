# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Customers can browse electric scooters, place orders, and pay cash on delivery — with an admin who controls the entire catalog, orders, and delivery zones.
**Current focus:** Phase 7 — Backend Refactoring (COMPLETE)

## Current Position

Phase: 8 of 8 (Frontend Refactoring)
Plan: 3 of 3 in current phase — 08-03 COMPLETE. Route-level lazy loading and bundle splitting.
Status: Phase 8 COMPLETE — All refactoring plans finished.
Last activity: 2026-03-01 - Completed 08-03: Route-level lazy loading (254KB gzipped initial load, 47 chunks, 92% bundle reduction)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: ~4min
- Total execution time: ~1.4 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | ~13 min | ~4 min |
| 02-product-catalog | 3 | ~25 min | ~8 min |
| 03-user-accounts | 2 | ~10 min | ~5 min |
| 04-cart-checkout-orders | 4 | ~17 min | ~4 min |
| 07-backend-refactoring | 4 | ~15 min | ~4 min |
| 08-frontend-refactoring | 3 | ~12 min | ~4 min |

**Recent Trend:**
- Last 5 plans: 08-03 (lazy loading + bundle splitting), 08-02 (path aliases), 08-01 (frontend cleanup), 07-04 (Action pattern), 07-03 (performance)
- Trend: Phase 8 complete — 16 total plans completed, consistent ~4min velocity

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [08-02]: TypeScript path alias @/ configured with baseUrl + paths in tsconfig.app.json — matches industry standard React/TypeScript pattern
- [08-02]: Vite resolve.alias matches TypeScript paths using ESM __dirname (import.meta.url + fileURLToPath) — ensures dev + build both resolve @/ imports
- [08-02]: Single-level relative imports within same feature preserved (../types) — co-located files benefit from relative clarity
- [04-04]: Accordion-based order detail for customers — no separate customer detail page; inline expansion sufficient for COD use case
- [04-04]: Dialog-based delivery zone CRUD mirrors AdminCategoriesPage pattern — simple entity, same CRUD approach
- [04-04]: Per-transition note textarea shown only after clicking transition button — two-step UX avoids always-visible textarea clutter
- [04-04]: Navbar refactored to dropdown menus (user + admin) — accommodates growing nav items without horizontal overflow
- [04-04]: AdminDeliveryZonesPage fee input in MAD, converts to centimes on submit (multiply by 100) — consistent with checkout/product patterns
- [04-03]: Product name snapshotted at add-time using API-localized product.name (Accept-Language header already set by apiClient interceptor)
- [04-03]: useCartStore.getState().clearCart() inside usePlaceOrder onSuccess — same outside-render-tree pattern as useAuthStore.getState()
- [04-03]: location.state carries OrderConfirmation to confirmation page — avoids extra GET /orders/:number API call on confirmation
- [04-03]: OrderConfirmationPage redirects to /orders if accessed without location.state (direct URL or page refresh)
- [04-03]: RootLayout as root React Router v7 layout route — global Navbar without repeating import in every page
- [04-03]: CheckoutPage redirects to /products via useEffect when cart is empty
- [04-03]: isAtMaxStock check on Add to Cart button — prevents adding beyond snapshotted stockQuantity
- [04-02]: OrderStatus::from() in Admin controller validates status string against enum before passing to transitionStatus()
- [04-02]: abort(422, msg) for invalid state machine transitions — returns HTTP 422 with clear message
- [04-02]: from_status=null in first OrderStatusLog entry — documents initial pending state without fabricating a from_status
- [04-02]: lockForUpdate on duplicate check query — prevents race condition between concurrent identical orders
- [04-02]: Order number format ORD-{Ymd}-{5-char-uniqid} — human-readable for COD delivery operations
- [04-02]: DeliveryZone::where('is_active', true)->firstOrFail() in createOrder — rejects inactive delivery zones at creation time
- [04-02]: allowed_transitions in OrderResource — frontend knows which action buttons to render without hardcoding the state machine
- [04-01]: Admin DeliveryZoneController aliased as AdminDeliveryZoneController in routes/api.php — avoids PHP class name collision with Customer\DeliveryZoneController
- [04-01]: Admin index() uses paginate(50), customer index() uses get() — admin sees all zones (including inactive), customer gets only active (small list, no pagination needed)
- [04-01]: destroy() lets DB FK constraint bubble as 500 for now — orders table not yet created; constraint enforcement deferred to 04-02
- [03-02]: layout route pattern for guards ({ element: <Guard />, children: [...] }) — React Router v7 recommended; avoids HOC wrapping
- [03-02]: password_confirmation field name kept exact (not confirm_password) — Laravel confirmed rule requires base_field + _confirmation naming
- [03-02]: useAuthStore.getState() inside useMutation onSuccess — mutations run outside React render tree, cannot use hook
- [03-02]: AdminHomePage simplified to Navigate redirect to /admin/products — products page is primary admin entry, no dashboard needed
- [03-01]: $user->refresh() after User::create() — surfaces DB column defaults (is_active=true) on new user registration response
- [03-01]: Deactivation check before password check in AuthService::login() — prevents timing attack leaking valid emails
- [03-01]: Admin cannot deactivate admin users (422) — prevents admin lockout
- [03-01]: order_history returned as empty array in GET /admin/users/{user} — Phase 4 will populate
- [03-01]: UpdateProfileRequest uses Rule::unique()->ignore() for email — allows user to submit same email
- [03-01]: Phone required at registration (was nullable) — enforces AUTH-01
- [02-03]: FormData with Content-Type undefined override on apiClient — browser sets multipart/form-data boundary correctly; POST + _method=PATCH for Laravel multipart PATCH workaround
- [02-03]: Dual query invalidation on admin mutations (['admin','products'] AND ['products']) — storefront reflects admin changes immediately
- [02-03]: Dialog-based CRUD for categories, separate edit page for products — categories are simple (3 fields), products are complex (20+ fields)
- [02-03]: Zod v4 uses { error: '...' } not { invalid_type_error: '...' } — breaking API change from v3; linter auto-corrected
- [02-02]: Price MAD/centimes conversion: FilterBar shows MAD, URL stores centimes (multiply by 100 for API); keeps API integer contract intact
- [02-02]: ProductGallery uses full-res image for main view (not card) — detail page justifies higher resolution
- [02-02]: WhatsApp message hardcoded in French — Moroccan French is primary market language
- [02-02]: VITE_WHATSAPP_NUMBER placeholder in .env — user must replace with real number before production
- [02-02]: Add to Cart disabled (not hidden) for out-of-stock — consistent layout, wired in Phase 4
- [02-01]: nonQueued() on all media conversions + QUEUE_CONVERSIONS_BY_DEFAULT=false in .env — sync conversions in dev, no queue worker needed
- [02-01]: LIKE fallback for search terms < 4 chars — MySQL FULLTEXT ignores words below ft_min_word_len (default 4 InnoDB)
- [02-01]: CategoryService.deleteCategory throws ValidationException if products exist — prevents orphaned product data
- [02-01]: UpdateProductRequest uses PATCH semantics — all fields optional; sku unique rule ignores current product ID via Rule::unique()->ignore()
- [02-01]: MySQL data directory at C:/Users/User/mysql-data — must start mysqld with --datadir=C:/Users/User/mysql-data
- [02-01]: Composer at /c/Users/User/AppData/Local/Programs/composer (phar) — use full path in scripts
- [Phase 1]: USER DECISION: Arabic language removed — only FR and EN supported going forward. RTL infrastructure (RTLProvider, rtlCache, ar locale) to be simplified before Phase 2 begins.
- [01-03]: Module-level Emotion caches (rtlCache/ltrCache) created outside component — prevents CSS re-injection on every render (MUI issue #33892)
- [01-03]: i18n.ts imported before ReactDOM.createRoot in main.tsx — prevents flash of untranslated content
- [01-03]: useLanguage hook is sole entry point for locale changes — never call i18n.changeLanguage() directly in components
- [01-03]: formatCurrency always uses ar-MA-u-nu-latn — Latin digits for MAD prices regardless of UI locale
- [01-03]: @types/stylis required as devDependency — stylis ships without bundled TypeScript declarations
- [Roadmap]: RTL + i18n wired in Phase 1 before any UI component — non-negotiable per research pitfall analysis
- [Roadmap]: DLVR-02 (city seeder) placed in Phase 2 because checkout (Phase 4) depends on delivery zone data; seeder must exist before checkout testing
- [Roadmap]: I18N-02 (full translation pass) placed in Phase 5 — strings accumulate across Phases 2-4 and a single audit pass is more efficient than incremental per-phase translation
- [Roadmap]: Phase 4 flagged for research before planning — phone OTP vs. duplicate-detection tradeoff for COD fraud prevention is unresolved (see SUMMARY.md)
- [01-02]: Used react-router (not react-router-dom) — React Router v7 library mode ships as single package
- [01-02]: useAuthStore.getState() (static) in Axios interceptors — interceptors are outside React component tree
- [01-02]: Accept-Language fallback to 'fr' (not 'en') — French is primary language for Morocco
- [01-02]: vitest triple-slash reference in vite.config.ts — avoids separate vitest.config.ts file
- [01-01]: guard_name=sanctum for roles + User.$guard_name=sanctum required for Spatie to resolve roles correctly in Sanctum bearer token auth (not web guard)
- [01-01]: Sanctum must be installed via composer require, not php artisan install:api (fails silently in non-interactive mode)
- [01-01]: PHP 8.3 via winget, MySQL 8.4 standalone (no service), Composer manual install — no admin rights required
- [07-01]: Rate limit thresholds: login/reset 5/min, register/forgot 3/min — higher for frequent legitimate use (login), lower for rare/abusable (register)
- [07-01]: Sanctum token expiration default 43200 minutes (30 days) — balances security with UX, configurable via SANCTUM_TOKEN_EXPIRATION env var
- [07-01]: CORS allowed_headers whitelist (Content-Type, Authorization, X-Requested-With, Accept, Accept-Language) — reduces attack surface vs wildcard
- [07-02]: ErrorCode enum follows OrderStatus pattern with string-backed values and label() method for consistency
- [07-02]: RFC 7807 error rendering via renderable callbacks in withExceptions closure - Laravel 12 pattern, not separate Handler class
- [07-02]: ValidationException returns RFC 7807 envelope PLUS errors field with field-level details for frontend parsing
- [07-03]: Conditional index checks use raw DB::select("SHOW INDEX FROM...") for MySQL compatibility
- [07-03]: Auth routes needed eager loading for roles relationship — UserResource::getRoleNames() triggers lazy load without it
- [07-04]: Service+Action pattern extracts concerns from monolithic OrderService::createOrder
- [07-04]: CreateOrderDTO provides type-safe, immutable parameter object with fromRequest/fromArray factories
- [07-04]: Constructor injection for Actions enables independent testability
- [07-04]: API contract unchanged — same request/response behavior for POST /orders
- [08-01]: animations.css as single source of truth for all CSS keyframes — prevents duplicate keyframe definitions that cause specificity bugs
- [08-01]: Replace any types with unknown in error handlers — follows project pattern from ProfilePage/LoginPage (type-safe casting)

### Roadmap Evolution

- Phase 6 added: UI/UX Futuristic Design Refactoring — futuristic high-tech redesign with glassmorphism, 3D hero (React Three Fiber), Framer Motion micro-interactions, animated dashboards, premium component styling
- Phase 7 added: Backend Refactoring — Code Architecture, Security Hardening, Performance Optimization, and Error Code System
- Phase 8 added: Frontend Refactoring — Code Architecture, Performance Optimization, and Cleanup

### Pending Todos

None.

### Blockers/Concerns

- [Pre-Phase 2]: MySQL must be started manually before API: `"C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqld.exe" --datadir="C:/Users/User/mysql-data" --console &`

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Remove delivery zones table (city text input), inline registration at checkout, light mode UI fixes, product card image as bg, admin pending orders badge | 2026-02-20 | 3a30b62 | [1-remove-delivery-zones-table-city-text-in](./quick/1-remove-delivery-zones-table-city-text-in/) |
| 2 | Remove i18n infrastructure (French-only app), fix attributes double-encoding, fix product card images | 2026-02-20 | 451f35a, eae31ad | [2-remove-i18n-french-only-fix-specs-displa](./quick/2-remove-i18n-french-only-fix-specs-displa/) |
| 4 | Add global_admin role with user/role management, WhatsApp FAB on all pages, footer info pages with store address | 2026-02-21 | 3987cc3, 1cdb9a1 | [4-add-global-admin-role-user-role-manageme](./quick/4-add-global-admin-role-user-role-manageme/) |
| 5 | Remove footer tech section, dynamic category links in footer, per-category featured product sections on homepage | 2026-02-21 | e6b97ac, 6a9ddcb | [5-remove-footer-tech-section-dynamic-categ](./quick/5-remove-footer-tech-section-dynamic-categ/) |
| 6 | Per-category "Voir tous" buttons on homepage, global_admin user creation dialog, navbar search bar | 2026-02-21 | 3e4fa90, dce44ff | [6-per-category-voir-tous-les-modeles-butto](./quick/6-per-category-voir-tous-les-modeles-butto/) |
| 9 | Add PDF invoice generation service using barryvdh/laravel-dompdf with logo and order items table | 2026-02-22 | f3af677 | [9-add-pdf-invoice-generation-service-using](./quick/9-add-pdf-invoice-generation-service-using/) |
| 10 | Redesign PDF invoice (neutral palette), editable CMS pages, change password, forgot/reset password | 2026-02-22 | b53002d, aebfd39, c681864, a96507c, 87e03db | [10-redesign-pdf-invoice-template-editable-s](./quick/10-redesign-pdf-invoice-template-editable-s/) |
| 11 | Inline WYSIWYG page editing for admins, PDF invoice layout improvements | 2026-02-22 | bd727db, d43c30b | [11-inline-page-editing-with-wysiwyg-on-stat](./quick/11-inline-page-editing-with-wysiwyg-on-stat/) |
| 12 | Admin dashboard with KPIs/analytics, generic product variations backend (PARTIAL: frontend variations UI not complete) | 2026-02-23 | 3fad26b, 5d67cca, afbcf9c, b2892c1, 8fca210, c7a3294 | [12-admin-dashboard-kpis-analytics-generic-p](./quick/12-admin-dashboard-kpis-analytics-generic-p/) |
| 13 | Add product sales/promo pricing and New tag system with frontend badges and navbar promo/new links | 2026-02-28 | 059fdbe, b7c1757, 493c8d0 | [13-add-product-sales-promo-pricing-and-new-](./quick/13-add-product-sales-promo-pricing-and-new-/) |
| 14 | Event-driven email notification system with queued listeners for async email sending | 2026-03-03 | 3608d89, a779eec | [14-event-driven-email-notification-system-w](./quick/14-event-driven-email-notification-system-w/) |

## Session Continuity

Last session: 2026-03-03
Stopped at: Completed quick task 14 — Event-driven email notification system (OrderService dispatches events, queued listeners handle async email sending)
Resume file: None
