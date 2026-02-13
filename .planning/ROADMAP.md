# Roadmap: TrotinetteApp

## Overview

TrotinetteApp is a single-vendor, cash-on-delivery e-commerce platform for electric scooters in Morocco, built with a Laravel 12 API backend and a React 19 + MUI 7 SPA frontend. The roadmap moves from load-bearing infrastructure (RTL, multilingual schema, auth) through product catalog and user accounts, into the core transaction loop (cart, checkout, orders), and finishes with the wishlist and full trilingual translation pass. Five phases cover all 51 v1 requirements in strict dependency order — nothing is retrofitted.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Scaffold both projects, wire RTL + i18n, establish the multilingual DB schema and Service pattern that every subsequent phase depends on
- [ ] **Phase 2: Product Catalog** - Full product browsing — catalog listing, search/filter, spec detail page, image gallery, stock indicator, WhatsApp contact, trust signals, and admin product/category management
- [ ] **Phase 3: User Accounts** - Customer registration, login, profile, and saved address; admin user management and route protection
- [ ] **Phase 4: Cart, Checkout, and Orders** - Complete transaction loop — cart persistence, city-based delivery fee, COD checkout, order state machine with audit log, and admin order management
- [ ] **Phase 5: Wishlist and Translation Completion** - Wishlist for browse-before-buy behavior and the full FR/AR/EN string translation pass across all UI

## Phase Details

### Phase 1: Foundation
**Goal**: The development environment is fully wired — both projects scaffold, RTL switching works, multilingual DB schema is established, and the Service class pattern is in place before any feature is built
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, INFRA-09, I18N-01, I18N-03, I18N-04
**Success Criteria** (what must be TRUE):
  1. The Laravel API returns a JSON response with Sanctum bearer-token auth working on a protected test route
  2. The React app renders in French by default; the language switcher toggles to Arabic and the entire layout mirrors RTL (including MUI Dialog and Drawer portal components)
  3. A product card renders in Arabic locale showing a MAD price in Latin digits (e.g., "1 500,00 MAD") with correct RTL padding
  4. The `product_translations` table exists in the database and the initial migration establishes the translation-ready schema pattern
  5. Every Axios request from the frontend carries the Authorization and Accept-Language headers; a request without a valid token to a protected route returns 401
**Plans**: TBD

Plans:
- [ ] 01-01: Laravel project scaffold — Sanctum, RBAC (spatie/laravel-permission), CORS, Service class pattern, and base migrations
- [ ] 01-02: React project scaffold — Vite + TypeScript + MUI 7, React Router, TanStack Query, Zustand, Axios client with auth/language headers
- [ ] 01-03: RTL + i18n wiring — RTLProvider with Emotion CacheProvider + stylis-plugin-rtl, i18next with FR/AR/EN locale files, language switcher, formatCurrency utility

### Phase 2: Product Catalog
**Goal**: A customer can browse all products, search and filter the catalog, view full scooter specs and image galleries, see stock status and trust signals, and contact the shop via WhatsApp — and an admin can manage every aspect of the catalog
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, PROD-08, PROD-09, PROD-10, PROD-11
**Success Criteria** (what must be TRUE):
  1. A customer can open the catalog page, filter by category and price range, and see paginated results with stock status indicators
  2. A customer can open a product detail page and see the specs table, image gallery (thumbnail carousel), stock status, price, category breadcrumb, a WhatsApp "ask a question" button, and trust signal badges
  3. A customer searching for a product name or description keyword sees relevant results in the current locale
  4. An admin can create a product with translatable name/description, upload multiple images, set spec attributes, assign a category, and toggle visibility — and those changes appear immediately on the storefront
  5. An out-of-stock product displays an "out of stock" indicator and the add-to-cart button is disabled
**Plans**: TBD

Plans:
- [ ] 02-01: Product and Category backend — models, migrations (product_translations, media), API Resources, spatie/laravel-medialibrary conversions, spatie/laravel-query-builder filtering, full-text search, DLVR-02 seeder
- [ ] 02-02: Product storefront — catalog listing page with filter bar, product detail page with spec table, image gallery, WhatsApp button, trust signals, stock indicator, category breadcrumbs
- [ ] 02-03: Admin product management — product CRUD with image upload, category management, stock quantity editing, visibility toggle

### Phase 3: User Accounts
**Goal**: A customer can create an account, log in and stay logged in, manage their profile and saved delivery address, and view their order history placeholder — and an admin can view, manage, and deactivate any user account
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. A new customer can register with email, password, and phone number; an existing customer can log in and their session persists across page refreshes
  2. A logged-in customer can update their name, email, phone, and delivery address (city and street) from their profile page
  3. A customer attempting to access an admin route is redirected to the storefront; an unauthenticated user is redirected to the login page
  4. An admin can view the registered user list, open a user's profile with their order history, and deactivate their account
**Plans**: TBD

Plans:
- [ ] 03-01: Auth backend — registration, login, logout, profile update endpoints with Sanctum bearer token; role-based middleware on all /api/admin/* routes
- [ ] 03-02: Auth frontend — register/login/logout UI, profile edit page, Zustand auth store with localStorage persistence, admin route guards, admin user management page

### Phase 4: Cart, Checkout, and Orders
**Goal**: A customer can add products to a persistent cart, proceed through checkout with a city-selected delivery fee, place a cash-on-delivery order, and track its status — while the backend enforces a tamper-proof order state machine with full audit logging, and an admin can manage every order
**Depends on**: Phase 2, Phase 3
**Requirements**: CART-01, CART-02, CART-03, CART-04, ORDR-01, ORDR-02, ORDR-03, ORDR-04, ORDR-05, ORDR-06, ORDR-07, ORDR-08, ORDR-09, ORDR-10, ORDR-11, ORDR-12, DLVR-01, DLVR-02, DLVR-03
**Success Criteria** (what must be TRUE):
  1. A customer can add products to the cart, adjust quantities, remove items, and see the correct subtotals and cart total — and the cart survives a page refresh
  2. A customer at checkout selects a Moroccan city, sees the delivery fee update immediately from the API (not a cached calculation), reviews the full order summary, and places a cash-on-delivery order receiving a confirmation screen with the order number and shop contact
  3. A duplicate order (same phone number + same product within 10 minutes) is rejected with a clear error message; an order for an out-of-stock product cannot be placed
  4. An admin can view the order list filtered by status, city, or date; transition an order through valid states only (invalid buttons are not shown); add a note to an order; and all status changes are recorded in the audit log with actor and timestamp
  5. Order totals and delivery fees stored in the database always match what the backend calculated — no frontend-submitted amounts are trusted
**Plans**: TBD

Plans:
- [ ] 04-01: Delivery zones backend — DeliveryZone model and migration, admin CRUD endpoints, seeder with major Moroccan cities, GET /api/delivery-zones public endpoint
- [ ] 04-02: Order backend — OrderService with state machine (pending → confirmed → dispatched → delivered; cancellation paths), pessimistic locking, order_status_logs audit table, COD validation (phone required, duplicate detection, city validation, server-side pricing), stock decrement in transaction
- [ ] 04-03: Cart and checkout frontend — Zustand cart store with localStorage persistence, cart drawer/page, checkout flow (city selector with live delivery fee, order review, COD confirmation, confirmation screen)
- [ ] 04-04: Order history and admin order management — customer order history with trilingual status badges, admin order list with filters, order detail view, valid-state-only transition buttons, order notes

### Phase 5: Wishlist and Translation Completion
**Goal**: Logged-in customers can save products to a wishlist for later purchase, and every UI string across the entire application is fully translated in French, Arabic, and English
**Depends on**: Phase 2, Phase 3
**Requirements**: WISH-01, WISH-02, I18N-02
**Success Criteria** (what must be TRUE):
  1. A logged-in customer can add a product to their wishlist from the product detail page, view all saved products in their account, navigate to any wishlist item, and remove products they no longer want
  2. Every button, label, error message, status badge, and notification visible to the customer is correctly rendered in French, Arabic, and English when the language is switched — with no missing translation keys (no raw key strings visible in the UI)
  3. Switching between FR, AR, and EN at any point in the application (catalog, cart, checkout, order history, account) produces a complete translation with no untranslated fallback text visible to the user
**Plans**: TBD

Plans:
- [ ] 05-01: Wishlist backend and frontend — Wishlist model and endpoints, add/remove from product detail page, wishlist view in user account
- [ ] 05-02: Full translation pass — audit and complete FR/AR/EN locale JSON files for all UI strings added in Phases 2, 3, and 4; verify no missing keys across all routes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Product Catalog | 0/3 | Not started | - |
| 3. User Accounts | 0/2 | Not started | - |
| 4. Cart, Checkout, and Orders | 0/4 | Not started | - |
| 5. Wishlist and Translation Completion | 0/2 | Not started | - |
