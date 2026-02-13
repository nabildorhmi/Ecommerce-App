# Project Research Summary

**Project:** TrotinetteApp — Electric Scooter E-Commerce (Morocco)
**Domain:** Local e-commerce, cash-on-delivery, trilingual (FR/AR/EN), single-vendor
**Researched:** 2026-02-12
**Confidence:** HIGH (stack and architecture), MEDIUM-HIGH (features and pitfalls)

## Executive Summary

This is a single-vendor, cash-on-delivery e-commerce platform selling electric scooters to a Moroccan market that is trilingual (French primary, Arabic official, English secondary) and predominantly mobile. The established approach is a decoupled Laravel 12 REST API backend with a React 19 + MUI 7 SPA frontend, sharing no server-rendered templates. This architecture keeps the frontend and backend independently deployable, enables a future mobile app without backend changes, and aligns with the Laravel 12 React starter kit, which ships the exact stack recommended here. The Moroccan market context imposes three hard constraints from day one: RTL layout for Arabic, translatable database schema for product content, and a city-based cash-on-delivery checkout with no online payment. None of these can be retrofitted cheaply — they must be foundational decisions, not late additions.

The recommended stack is mature and well-matched to the domain: Laravel Sanctum for SPA authentication, spatie packages for RBAC, media management, and query filtering, TanStack Query for server state, Zustand for client state (cart, auth), react-hook-form + Zod for form validation, and i18next + react-i18next for trilingual content with RTL switching. The product model must use a translations table (not single-language columns) from the first migration, and the RTL infrastructure (Emotion CacheProvider with stylis-plugin-rtl, MUI theme direction, document.dir) must be wired before any UI components are built. The feature set is well-scoped: a focused v1 of 15 P1 features covers full end-to-end commerce; a comparison tool, admin KPI dashboard, and Arabic product copy belong in v1.x after operational patterns are confirmed.

The two highest-risk areas are the RTL/i18n setup and the COD order workflow. RTL applied late costs 2-4 days of refactoring across every component; a missing order state machine leads to illegal status transitions and no audit trail. Both must be addressed in early phases, not treated as polish. Security-wise, the backend must never trust frontend-calculated prices or delivery fees, must enforce role-based middleware on all admin routes, and must rate-limit order placement to mitigate the 26% fake/no-show COD return rate typical in this market.

---

## Key Findings

### Recommended Stack

The backend is Laravel 12 on PHP 8.3+ with MySQL 8, using Sanctum for SPA bearer-token auth, spatie/laravel-permission for admin/customer roles, spatie/laravel-medialibrary for product image variants, and spatie/laravel-query-builder for filterable API endpoints. The thin-controller/fat-service pattern is mandatory — all business logic (order placement, pricing, stock) lives in injected Service classes, never in controllers. Every model is serialized through an API Resource class; raw Eloquent models are never returned directly. The frontend is React 19 + TypeScript 5 + MUI 7, built with Vite 7. TanStack Query v5 owns all server state; Zustand v5 owns cart contents and auth tokens. React Router v7 handles routing for both the storefront (`/`) and admin panel (`/admin/*`) within a single app.

See full details in [STACK.md](.planning/research/STACK.md).

**Core technologies:**
- Laravel 12 / PHP 8.3+: API backend — active maintenance, ships Sanctum, Eloquent, queues; PHP 8.3 recommended; Laravel 13 will require 8.3 minimum
- Laravel Sanctum (bundled): SPA auth — bearer-token mode avoids cookie/domain complexity for separate-origin deployments; `php artisan install:api` provisions it in one command
- spatie/laravel-permission v6.x: RBAC — 22M+ downloads; admin/customer/delivery roles; use v6 for PHP 8.2/8.3 (v7 requires PHP 8.4)
- spatie/laravel-medialibrary v11: Product images — auto-generates thumbnail and card conversions on upload; use S3-compatible storage (Cloudflare R2, zero egress) from day one
- spatie/laravel-query-builder v6: API filtering — parses filter/sort/include from URL params; eliminates hand-written filter logic in admin product list
- React 19 + TypeScript 5 + Vite 7: Frontend runtime — official Laravel 12 starter kit stack; concurrent rendering; fastest HMR in class
- MUI 7: Component library — built-in RTL support via `@mui/stylis-plugin-rtl`; project specification; complete admin-ready component set
- TanStack Query v5: Server state — caching, background refresh, mutation support; eliminates useEffect/useState boilerplate for API data
- Zustand v5: Client state — cart contents, auth token, locale preference; lightweight; replaces Redux for this scope
- i18next + react-i18next: Trilingual i18n — namespace support, browser language detection, JSON translation files; pairs with MUI RTL plugin
- react-hook-form + Zod: Forms and validation — zero re-render forms; Zod schema serves as TypeScript type source and validation in one definition
- MySQL 8: Database — JSON columns for flexible product attributes (scooter specs); full-text search for catalog; best-documented Laravel hosting target

**Do not use:** Inertia.js (blurs API/SPA boundary, blocks future mobile app), Laravel Passport (OAuth2 overkill for first-party SPA), Redux (excessive boilerplate), Create React App (deprecated), Lunar/GetCandy (adds complexity with no benefit for this custom business domain), moment.js (67KB, deprecated).

### Expected Features

The Morocco market is defined by three facts that drive every feature decision: COD is the only viable payment method (54-80% of transactions), WhatsApp is the primary customer communication channel, and 82% of users browse multiple times before buying. This makes wishlist and detailed spec pages essential at MVP, not optional additions. Admin manual confirmation before dispatch is a business necessity, not a design choice — COD without phone confirmation produces unacceptable return rates.

See full details in [FEATURES.md](.planning/research/FEATURES.md).

**Must have at launch (P1):**
- Product catalog with categories, search, filters, and spec-structured detail pages — buyers evaluate scooters technically; specs must be structured data, not free text
- Product detail page with WhatsApp "ask a question" button — spec-driven buyers need detail; WhatsApp is the primary contact channel
- User registration, login, profile with saved delivery address — required for checkout and order history; phone number is a required field (COD model)
- Shopping cart with persistent state (localStorage)
- Checkout: city selection, city-based delivery fee display before confirmation, COD as only payment method — fee transparency is a trust requirement
- Order confirmation screen with order number and shop contact info — trust signal critical for COD; shows phone/WhatsApp for post-order questions
- User order history with status tracking (Pending / Confirmed / Dispatched / Delivered)
- Wishlist — high browse-before-buy behavior makes this P1 in the Moroccan market, not optional
- Admin: product CRUD with image upload, stock management, category management
- Admin: order list and status management — manual phone confirmation before dispatch is the business model
- Admin: delivery zone / city fee configuration — must be seeded before checkout can function
- Admin: user management — view buyer profiles and order history
- Trilingual UI strings (FR/AR/EN) with RTL layout for Arabic — cannot be retrofitted; design-time decision
- Stock availability indicator — prevents orders for unavailable high-value items
- Trust signals on product pages: return policy, phone/WhatsApp contact, "official store" badge

**Should have, after validation (P2):**
- Scooter comparison tool — spec-driven buyers; differentiator vs. Jumia; requires structured spec data from Phase 1
- Admin: order notes / call log field — records phone confirmation conversation outcome
- Admin: bulk CSV export of filtered order list — bridges to offline delivery logistics
- Delivery date estimate at checkout — simple city-to-days business rule, no real-time tracking
- Admin: KPI dashboard — orders by status, revenue by week, top 5 products (meaningful after 20+ orders)
- Recently viewed products (localStorage, no backend needed)
- Related products — admin-curated tag-based upsell for accessories

**Defer to v2+ (P3):**
- Online payment (CMI, Stripe, PayPal) — cultural and compliance reasons; revisit when COD failure rate is the problem
- Product reviews and ratings — moderation overhead; requires order volume for credibility
- SMS/WhatsApp order notification automation — manage manually at launch
- Arabic per-product content — design DB schema in v1 (translations table), populate content in v2
- Multi-language SEO (hreflang, per-language URLs)

**Anti-features (do not build):** Real-time GPS tracking, multi-vendor/marketplace, loyalty points, AI recommendations, social login (Google/Facebook), abandoned cart emails, live chatbot.

### Architecture Approach

The system uses a strict two-tier decoupled architecture: Laravel 12 API backend serving JSON over HTTPS with Sanctum bearer-token auth, and a single React 19 SPA consuming that API. The SPA hosts both the customer storefront (`/`) and admin panel (`/admin/*`) within one React Router v7 app, sharing auth logic, API clients, and component primitives. The backend follows a layered pattern: thin Controllers delegating to Service classes containing all business logic, Form Requests for validation, API Resources for JSON serialization, Eloquent Models with Policies for authorization. State management on the frontend splits cleanly: TanStack Query owns all server-fetched data; Zustand owns true client state. The architecture's build order is strict and must be followed.

See full details in [ARCHITECTURE.md](.planning/research/ARCHITECTURE.md).

**Major components:**
1. Customer SPA (React + MUI + i18next, routes `/`) — product browsing, cart, checkout, order tracking; trilingual, RTL-aware
2. Admin SPA (same React app, routes `/admin/*`) — product/order/user/zone management; shares API client and auth with customer routes; French primary
3. Laravel API (`routes/api.php`) — thin controllers delegating to Services; Sanctum bearer-token auth; AdminOnly middleware on all `/api/admin/*` routes; versioned at `/api/v1/`
4. Service layer (OrderService, PricingService, ProductService, DeliveryZoneService) — all business logic; injectable; reusable from controllers, jobs, and CLI commands
5. MySQL database — relational schema with product_translations table for multilingual content; JSON column for scooter attributes (motor power, range, weight, speed); DeliveryZone table for city-to-fee mapping
6. RTLProvider (`shared/components/RTLProvider.tsx`) — wraps entire app; synchronizes document.dir + MUI theme direction + Emotion CacheProvider with stylis-plugin-rtl on every locale change
7. Media storage (spatie/laravel-medialibrary + S3-compatible driver) — product images with auto-generated conversions; CDN-ready absolute URLs in API responses

**Key patterns:**
- Thin controllers calling Services, returning Resources — never raw Eloquent models; no business logic in controllers
- Feature-scoped API hooks in React — each feature owns its `api.ts` + hooks directory, eliminating cross-feature coupling
- RTL-aware Theme Factory — Emotion cache recreated on locale switch with `stylis-plugin-rtl`; MUI theme direction + document.dir synchronized atomically
- Delivery fee and pricing calculated server-side only — frontend fetches via API, never calculates independently

**Strict build order (from ARCHITECTURE.md):** DB schema and migrations → Eloquent models + relationships → API Resources (JSON contract) → Services (business logic) → Form Requests (validation) → Controllers (HTTP wrappers) → API routes → React API client + TanStack Query → Feature hooks → Feature components → RTLProvider + i18n (layered over stable UI) → Admin features (mirrors customer, same services).

### Critical Pitfalls

See full details in [PITFALLS.md](.planning/research/PITFALLS.md).

1. **RTL not applied globally in Phase 1** — Emotion CSS does not flip directional properties without `stylis-plugin-rtl` in the CacheProvider. Adding RTL after LTR is built requires auditing every CSS rule (2-4 days). Set up `RTLProvider` with synchronized document.dir + MUI theme + Emotion cache before any UI component is written. Portal components (Dialog, Drawer, Tooltip, Menu) render outside the DOM tree and do not inherit `dir` — configure them explicitly. Use CSS logical properties (`padding-inline-start`, not `padding-left`) from line 1.

2. **Multilingual schema missing from database design** — Single-language columns (`name`, `description`) require full table restructure, data migration, and simultaneous API + frontend rewrites to add translations later (3-5 days). Use a `product_translations(product_id, locale, name, description, slug)` table from the first migration. Avoid JSON columns for translatable content: they break MySQL full-text search and make translation completeness invisible to the database.

3. **COD fake/phantom orders with no validation gate** — COD has a 26% average return-to-origin rate without compensating controls. Without phone number validation, duplicate order detection, and city zone enforcement at order creation, admin wastes time on phantom orders and delivery personnel make wasted trips. Enforce at Phase 2: required phone number, duplicate detection (same phone + same product within 10 minutes = 422), city must exist in delivery_zones table.

4. **Order status machine implicit, not enforced** — Free-text or enum status column without backend transition guards allows illegal transitions (delivered → pending), race conditions (two admins confirming simultaneously), and no audit trail. Define allowed transitions in OrderService. Use `lockForUpdate()` in database transactions. Write every transition to an `order_status_logs` table with actor ID, timestamp, previous and new status.

5. **Delivery fee duplicated between frontend and backend** — If React calculates fees from cached zone data, admin database updates cause price mismatches (displayed fee vs. stored order total). Delivery fee lives exclusively in the backend. Frontend calls `GET /api/delivery-zones` for display and never calculates independently. Order creation always recalculates and stores the fee from the server — never trusts the fee submitted in the request body.

**Additional Phase 1 pitfalls:** Arabic numeral display — use `Intl.NumberFormat('ar-MA-u-nu-latn')` to force Latin digits for MAD prices across all locales; Sanctum CORS misconfiguration — configure `SANCTUM_STATEFUL_DOMAINS` and `supports_credentials: true` before any protected feature is built; i18next FOUC — preload all 3 locale files (30KB acceptable), set detection order `['localStorage', 'navigator', 'htmlTag']`, fallback to `fr`.

---

## Implications for Roadmap

Based on architecture build-order constraints, feature dependencies, and pitfall prevention phases, the following 6-phase structure is recommended. The shape is: foundations first (infra + auth + i18n), then core customer flows, then admin operations, then enhancements.

### Phase 1: Foundation — Infrastructure, Auth, and i18n

**Rationale:** Architecture mandates DB schema before models, models before Resources, and RTL/i18n before any UI component. All Phase 1 pitfalls (RTL, multilingual schema, Sanctum CORS, i18next FOUC, fat controllers, Arabic number formatting) have HIGH recovery costs if deferred. This phase has no user-visible features, but determines the quality ceiling of every subsequent phase.

**Delivers:**
- Laravel project with Sanctum API auth (Bearer token), RBAC roles (admin/customer), CORS configured for dev ports
- Translation-ready DB schema: `product_translations` table pattern established; `delivery_zones` table; generic JSON `attributes` column on products
- React project with Vite 7 + TypeScript + MUI 7 + React Router v7 + TanStack Query + Zustand
- RTLProvider with Emotion CacheProvider + `stylis-plugin-rtl` wired at app root; MUI theme direction + document.dir synchronized on locale change
- i18next with browser language detection (localStorage → navigator → htmlTag), FR/AR/EN locale files preloaded, `fr` as fallback
- `formatCurrency` utility using `Intl.NumberFormat('ar-MA-u-nu-latn')` for MAD prices in all locales
- Axios instance with auth header injection and `Accept-Language` header sent on every request
- Service/Action class pattern established; no business logic in controllers from the start
- RTL smoke test: Arabic locale renders a product card + Dialog + Drawer with full mirror (Latin price numerals, correct padding/margin direction)

**Addresses features:** Trilingual UI strings + RTL for Arabic (P1 — highest implementation cost feature), auth foundation for all subsequent features

**Avoids pitfalls:** Pitfall 1 (RTL global), Pitfall 2 (multilingual schema), Pitfall 5 (Arabic numeral display), Pitfall 7 (Sanctum CORS), Pitfall 9 (fat controllers), Pitfall 11 (i18next FOUC)

**Research flag:** Standard patterns. RTL + MUI setup is fully documented in official MUI docs and PITFALLS.md provides specific implementation guidance including the empty CacheProvider for LTR mode (GitHub issue #33892).

---

### Phase 2: Product Catalog

**Rationale:** The product catalog is the highest-value user-facing feature (no catalog = no store) and establishes the data model that every other phase reuses. Structured spec data (scooter attributes as JSON key-value pairs) must be designed now because the comparison tool in Phase 5 depends on it. Image storage infrastructure established here prevents performance failures in production.

**Delivers:**
- Category and Product models with `product_translations` table fully wired; JSON `attributes` column for scooter specs
- spatie/laravel-medialibrary conversions (thumbnail, product_card, full-size); S3-compatible storage driver configured from day one; API responses return absolute URLs
- Product listing API: paginated, filterable by price/category/availability via spatie/laravel-query-builder; eager loading with `preventLazyLoading()` active in dev
- Product detail API: full specs, images, category breadcrumb, stock status (`in_stock: bool`)
- MySQL full-text search on translatable name/description fields
- Morocco city + delivery fee seeder (Casablanca, Rabat, Marrakech, Fes, Tangier pre-seeded)
- Storefront: product catalog page with filter bar, product grid, product detail page with spec table, WhatsApp button, stock indicator, trust signals
- Category navigation and breadcrumbs
- Admin: product CRUD with image upload; category management; stock toggle; slug generation

**Addresses features:** Product catalog with photos (P1), Product detail page (P1), Search and filters (P1), Stock indicator (P1), WhatsApp button (P1), Trust signals (P1), Admin product CRUD (P1), Product categories (P2)

**Avoids pitfalls:** Pitfall 6 (N+1 queries — eager loading from query authoring time; `preventLazyLoading()` throws in dev), Pitfall 10 (images served via PHP — cloud storage driver and absolute URLs from day one)

**Research flag:** Standard patterns. spatie/laravel-medialibrary and spatie/laravel-query-builder are comprehensively documented. No additional research needed.

---

### Phase 3: User Accounts and Auth UI

**Rationale:** Auth is a dependency of checkout and order history but is independent of the product catalog. Building it after the catalog allows Phase 2 UI to be validated without auth complexity. The full auth flow is a self-contained unit. Admin user management completes the admin operational baseline.

**Delivers:**
- Customer registration (email + password + required phone number field)
- Customer login / logout (Sanctum Bearer token, stored in Zustand auth store + localStorage)
- Customer profile page: name, phone, saved delivery address (city, street)
- Admin-protected route guard on all `/admin/*` React routes (reads from Zustand auth store)
- Admin user management: list users, view profile and order history, deactivate account

**Addresses features:** User account registration and login (P1), User profile with saved address (P1), Admin user management (P1)

**Avoids pitfalls:** Pitfall 7 (Sanctum CORS — auth end-to-end validated in Phase 1; this phase confirms the production auth flow with real registration and profile data)

**Research flag:** Standard patterns. Sanctum Bearer token SPA auth is official Laravel documentation with clear implementation steps.

---

### Phase 4: Cart, Checkout, and Orders

**Rationale:** This is the core transaction flow and the highest-risk phase for operational correctness. The COD validation gate, order state machine, and delivery fee calculation must all be built correctly here — they cannot be patched later without business disruption. This phase depends on auth (Phase 3), product data (Phase 2), and delivery zones (seeded in Phase 2).

**Delivers:**
- Shopping cart: Zustand cart store with localStorage persistence, quantity management, remove item, cart total
- Delivery fee API endpoint (`GET /api/delivery-zones`) — frontend fetches from this; never calculates fees independently
- Checkout flow: city selection with real-time delivery fee display (via API call), order review screen with full summary, COD confirmation
- Order creation endpoint (OrderService): required phone number, duplicate order detection (same phone + same product within 10 minutes = 422), city validation against delivery_zones table, server-side total + delivery fee calculation (never trusts request body), stock decrement in transaction
- Order state machine in OrderService: explicit allowed transitions (pending → confirmed, confirmed → dispatched, dispatched → delivered, {pending|confirmed} → cancelled; all others return 422), `lockForUpdate()` on status updates, every transition logged to `order_status_logs` (actor ID, timestamp, from/to status)
- Order confirmation page: order number, summary, shop phone/WhatsApp contact info
- User order history with status badges (trilingual labels: FR/AR/EN)
- Admin: order management dashboard — list with filter by status/city/date, order detail view, status transition buttons (valid transitions only), order notes field

**Addresses features:** Shopping cart (P1), Checkout with COD + city fee (P1), Order confirmation (P1), User order history + status (P1), Admin order management (P1), Admin delivery zone config (P1), Admin manual confirmation (P1), Admin order notes (P2 — included here since it's part of order workflow)

**Avoids pitfalls:** Pitfall 3 (COD fake orders — phone required, duplicate detection, city validation), Pitfall 4 (order state machine — explicit transitions, locking, audit log), Pitfall 8 (delivery fee duplication — server-side only, never in frontend)

**Research flag:** Needs `/gsd:research-phase` before planning. Two unresolved decisions: (1) phone OTP vs. simpler duplicate detection for COD fraud prevention — OTP adds friction and Morocco SMS costs 3x for Arabic messages (UCS-2 encoding); (2) `spatie/laravel-model-states` package vs. hand-coded transition map in OrderService. Research scope: 30-60 minutes to evaluate OTP friction vs. cost tradeoff and state machine library fit.

---

### Phase 5: Wishlist and Customer Enhancements

**Rationale:** Wishlist is P1 (Moroccan browse-before-buy behavior) but depends on stable catalog and auth. Phase 5 completes the P1 feature set and adds high-value P2 enhancements that require enough catalog SKUs to be meaningful. No new infrastructure required — all patterns established.

**Delivers:**
- Wishlist: add/remove from product detail pages, saved list view in user account (auth-required)
- Recently viewed products (localStorage only, no backend)
- Related products (admin-curated tag-based, shown on product detail page)
- Delivery date estimate at checkout (simple city → business-days rule stored in delivery_zones table, displayed at checkout)
- Product comparison tool (select up to 3 SKUs, side-by-side spec table from JSON attributes column — no backend changes needed)

**Addresses features:** Wishlist (P1), Delivery date estimate (P2), Product comparison tool (P2), Recently viewed (P2), Related products (P2)

**Avoids pitfalls:** No new pitfalls. Comparison tool works correctly only because structured spec data was designed in Phase 2 — no retrofitting needed.

**Research flag:** Standard patterns. Wishlist is straightforward CRUD. Comparison tool is client-side rendering from structured data already in the API response. No research needed.

---

### Phase 6: Admin Dashboard and Operational Tools

**Rationale:** KPI dashboard requires data volume to be meaningful (20+ orders). CSV export and analytics are operational tools that unblock business growth but are not required to take first orders. Admin operational necessity (order management) was covered in Phase 4; Phase 6 completes the admin panel.

**Delivers:**
- Admin KPI dashboard: orders by status (today / this week), revenue by week, top 5 products by order count, count of pending confirmations needing action — using MUI X Charts or Recharts
- Admin bulk CSV export of filtered order list (order ID, customer name, phone, address, city, items, total)

**Addresses features:** Admin KPI dashboard (P2), Admin CSV export (P2)

**Research flag:** Standard patterns. MUI X Charts and CSV generation (Laravel Excel or manual string construction) are well-documented. No research needed.

---

### Phase Ordering Rationale

- **Foundation before features:** RTL + multilingual DB schema must precede every other phase. Recovery cost if deferred: 2-5 days per pitfall. They are load-bearing, not cosmetic.
- **Catalog before cart:** Users need to see products before adding them to a cart. Admin needs product management before the catalog is populated. Image storage and query performance established here apply to all subsequent data loading.
- **Auth before checkout:** Checkout requires a logged-in user. No guest checkout is the correct decision for this domain — COD with phone confirmation requires customer identity. Building auth as its own phase also makes it testable in isolation.
- **Cart and checkout in one phase:** The checkout flow, delivery zones, order creation, and order status management are tightly coupled through shared state (cart total + delivery fee + order total + stock). Building them together prevents the delivery fee duplication pitfall and ensures the state machine is part of initial design, not a retrofit.
- **Enhancements after core transaction loop:** Wishlist, comparison tool, and recently viewed products require catalog stability. Comparison tool specifically requires the JSON attributes column to be populated with real data.
- **Admin dashboard last:** KPI charts are only useful with accumulated data. Core admin operations (product and order management) are handled in Phases 2 and 4. Dashboard analytics in Phase 6 when there is something meaningful to measure.

### Research Flags

**Needs `/gsd:research-phase` before planning:**
- **Phase 4 (Cart, Checkout, Orders):** Phone OTP vs. simpler duplicate-order detection for COD fraud prevention — Morocco SMS cost/complexity tradeoff is not fully resolved. Also evaluate `spatie/laravel-model-states` vs. hand-coded order state machine. Estimated research: 30-60 minutes, focused scope.

**Standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** MUI RTL + i18next setup is fully documented; PITFALLS.md provides specific implementation guidance.
- **Phase 2 (Product Catalog):** spatie/laravel-medialibrary + spatie/laravel-query-builder are comprehensively documented with official examples.
- **Phase 3 (Auth):** Sanctum Bearer token auth is official Laravel documentation with clear steps.
- **Phase 5 (Enhancements):** Wishlist CRUD and localStorage patterns are standard React patterns.
- **Phase 6 (Admin Dashboard):** MUI X Charts and CSV generation are well-documented; no novel integration.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core packages verified via official docs and changelogs with exact version numbers. Version compatibility matrix explicitly confirmed. spatie/laravel-permission v6 vs v7 PHP requirement verified on GitHub. |
| Features | MEDIUM-HIGH | Morocco e-commerce market data (COD dominance 54-80%, browse behavior, WhatsApp preference) from multiple corroborating industry sources. Specific UX patterns observed from Jumia/Avito, not from formal UX research. |
| Architecture | HIGH | Core patterns (thin controllers, API Resources, feature-scoped React structure, RTLProvider) verified against official Laravel and MUI docs. Build order follows documented dependency constraints. |
| Pitfalls | MEDIUM-HIGH | RTL/MUI pitfalls verified via official MUI docs and GitHub issue #33892. COD patterns from industry e-commerce reports. N+1 prevention from official Laravel sources. State machine race conditions from production case studies. |

**Overall confidence:** HIGH for technical decisions. MEDIUM for Morocco market behavior specifics (no formal user research, industry reports only).

### Gaps to Address

- **Phone OTP for COD validation:** Research recommends it but notes Arabic SMS costs 3x due to UCS-2 encoding (70-char limit vs. 160). Which Moroccan SMS provider to use (Infobip, Twilio, local partner), and whether OTP friction outweighs COD fraud benefit, is unresolved. Address in Phase 4 research-phase or during requirements definition with the business owner.

- **Hosting environment:** No research was conducted on the specific VPS or hosting target in Morocco. MySQL is recommended partly because it has better compatibility with shared Moroccan VPS providers. If the target environment supports PostgreSQL, it may be preferable for full-text search on JSON translation columns. Confirm before Phase 1.

- **Arabic product content timeline:** The DB schema supports it from Phase 1 (translations table), but actual Arabic copywriting is deferred to v2. No research was done on the content production workflow — who writes Arabic copy, how it is entered in the admin, and what QA looks like. Flag for requirements definition.

- **WhatsApp Business API lead time:** The project launches with manual WhatsApp confirmations. Automating via the WhatsApp Business API (v2+ goal) requires Meta partner approval and business verification, which can take weeks in Morocco. If automation is a near-term priority, initiate the API application process during Phase 1, not after launch.

---

## Sources

### Primary (HIGH confidence)
- [Laravel 12.x Official Docs](https://laravel.com/docs/12.x/) — installation, Sanctum, Eloquent Resources, directory structure, queues, Form Requests
- [Material UI v7 Docs — Right-to-left support](https://mui.com/material-ui/customization/right-to-left/) — RTL setup, `@mui/stylis-plugin-rtl`, portal gotcha
- [MUI GitHub Issue #33892](https://github.com/mui/material-ui/issues/33892) — LTR CacheProvider must remain present (empty) when switching to RTL direction
- [TanStack Query v5 Docs](https://tanstack.com/query/v5/docs/framework/react/overview) — server state patterns, mutation support
- [react-i18next Official Docs](https://react.i18next.com/) — i18n React integration, language detection
- [spatie/laravel-permission GitHub](https://github.com/spatie/laravel-permission) — RBAC version compatibility (v6 for PHP 8.2/8.3, v7 for PHP 8.4)
- [spatie/laravel-medialibrary Packagist](https://packagist.org/packages/spatie/laravel-medialibrary) — v11, Laravel 12 support confirmed
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — `nu-latn` extension for Latin numerals in Arabic locale

### Secondary (MEDIUM confidence)
- [Morocco E-Commerce Market $1.7B 2025 — Morocco World News](https://www.moroccoworldnews.com/2025/12/271615/) — market size, COD dominance, consumer behavior
- [Payment Methods in Morocco — NORBr](https://norbr.com/library/payworldtour/payment-methods-in-morocco/) — COD accounts for 54-80% of transactions
- [Complete Guide to COD Automation Morocco — CODSPOT](https://www.codspot.io/post/complete-guide-to-cash-on-delivery-automation-in-morocco) — Morocco-specific COD operations, phone confirmation workflow
- [Cash on Delivery Problems Guide — Qikink 2026](https://qikink.com/blog/cash-on-delivery-problems/) — 26% RTO rate, fraud prevention patterns
- [Morocco SMS Networks — ASPSMS](https://www.aspsms.com/en/networks/morocco/home.asp) — Arabic UCS-2 encoding cost multiplier for SMS
- [React Feature-Based Folder Structure 2025 — Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/) — feature-scoped architecture pattern
- [Mastering Service-Repository Pattern in Laravel — Medium](https://medium.com/@binumathew1988/mastering-the-service-repository-pattern-in-laravel-751da2bd3c86) — thin controller / fat service validation
- [Best Practices for Multi-Language Database Design — Redgate](https://www.red-gate.com/blog/multi-language-database-design) — translation table pattern vs. JSON column tradeoffs
- [Moroccan Online Purchasing Behavior: Trust and Culture — ResearchGate](https://www.researchgate.net/publication/344405844) — trust factors, browse-before-buy patterns

### Tertiary (LOW confidence — validate during implementation)
- WebSearch results for Zustand v5 vs. Redux 2025 — Zustand consensus from multiple community sources, not official benchmarks
- WebSearch results for Morocco consumer UX patterns — inferred from regional market reports, not direct user research studies

---
*Research completed: 2026-02-12*
*Ready for roadmap: yes*
