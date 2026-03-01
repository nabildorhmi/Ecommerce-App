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
- [ ] **Phase 6: UI/UX Futuristic Design Refactoring** - Futuristic high-tech redesign with glassmorphism, 3D hero scene, micro-interactions, animated dashboards, and premium component styling — preserving existing color palette

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
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Laravel scaffold: Sanctum bearer-token auth, RBAC, CORS, Service pattern, migrations (products, product_translations, delivery_zones)
- [ ] 01-02-PLAN.md — React scaffold: Vite + TS + MUI 7, React Router v7, TanStack Query, Zustand, Axios client with auth + Accept-Language headers
- [ ] 01-03-PLAN.md — RTL + i18n: RTLProvider with Emotion CacheProvider + stylis-plugin-rtl, i18next FR/AR/EN, language switcher, formatCurrency utility, smoke test

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
**Plans:** 3 plans

Plans:
- [ ] 02-01-PLAN.md — Product catalog backend: models (Product, Category with translations), migrations (category_translations, fulltext index, media), Spatie medialibrary + query-builder, API controllers (customer listing/detail + admin CRUD), services, resources, seeders (delivery zones, categories, products)
- [ ] 02-02-PLAN.md — Product storefront: catalog listing page with filter bar (category, price, stock, search), product grid with pagination, product detail page with image gallery, specs table, WhatsApp button, trust signals, stock indicator, category breadcrumb
- [ ] 02-03-PLAN.md — Admin product management: product CRUD with image upload and translatable fields, category CRUD with FR/EN names, inline stock editing, visibility toggle

### Phase 3: User Accounts
**Goal**: A customer can create an account, log in and stay logged in, manage their profile and saved delivery address, and view their order history placeholder — and an admin can view, manage, and deactivate any user account
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. A new customer can register with email, password, and phone number; an existing customer can log in and their session persists across page refreshes
  2. A logged-in customer can update their name, email, phone, and delivery address (city and street) from their profile page
  3. A customer attempting to access an admin route is redirected to the storefront; an unauthenticated user is redirected to the login page
  4. An admin can view the registered user list, open a user's profile with their order history, and deactivate their account
**Plans:** 2 plans

Plans:
- [ ] 03-01-PLAN.md — Auth backend: migration (is_active, address columns), phone required fix, profile update endpoint, admin user controller (list, detail, deactivate), login deactivation check
- [ ] 03-02-PLAN.md — Auth frontend: login/register pages, profile edit page, ProtectedRoute + AdminRoute guards, admin user management page + detail page, router rewiring

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
**Plans:** 4 plans

Plans:
- [ ] 04-01-PLAN.md — Delivery zones backend: admin CRUD endpoints, public GET /api/delivery-zones, DeliveryZoneResource (model/migration/seeder already exist from Phase 2)
- [ ] 04-02-PLAN.md — Order backend: OrderStatus enum with state machine, 3 migrations (orders, order_items, order_status_logs), 3 models, OrderService (atomic creation with lockForUpdate, duplicate detection, server-side pricing), customer + admin controllers, form requests, resources
- [ ] 04-03-PLAN.md — Cart and checkout frontend: Zustand cart store with localStorage persist, CartDrawer + CartBadge, checkout page (city selector with live delivery fee, order review, COD confirmation), order confirmation screen, Add to Cart wiring on ProductDetailPage
- [ ] 04-04-PLAN.md — Order history and admin order management: customer order history with status badges, admin order list with filters, admin order detail with valid-only status transitions + notes + audit log, admin delivery zone CRUD page

### Phase 5: Wishlist and Translation Completion
**Goal**: Logged-in customers can save products to a wishlist for later purchase, and every UI string across the entire application is fully translated in French, Arabic, and English
**Depends on**: Phase 2, Phase 3
**Requirements**: WISH-01, WISH-02, I18N-02
**Success Criteria** (what must be TRUE):
  1. A logged-in customer can add a product to their wishlist from the product detail page, view all saved products in their account, navigate to any wishlist item, and remove products they no longer want
  2. Every button, label, error message, status badge, and notification visible to the customer is correctly rendered in French, Arabic, and English when the language is switched — with no missing translation keys (no raw key strings visible in the UI)
  3. Switching between FR, AR, and EN at any point in the application (catalog, cart, checkout, order history, account) produces a complete translation with no untranslated fallback text visible to the user
**Plans:** 2 plans

Plans:
- [ ] 05-01-PLAN.md — Wishlist backend and frontend: pivot table migration, model relations, toggle/list controller, ProductResource is_wishlisted, TanStack Query hooks, WishlistPage with card grid, heart toggle on ProductDetailPage, router and navbar wiring, FR/EN wishlist i18n keys
- [ ] 05-02-PLAN.md — Full translation pass: fix hardcoded strings in AdminOrderDetailPage, AdminDeliveryZonesPage, CategoryForm, ProductForm, ProductGallery; audit all t() keys against JSON files; add missing keys; remove dead keys (deliveryZones.cityAr, smoke_test.*); verify FR translations are genuine French

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-02-14 |
| 2. Product Catalog | 3/3 | Complete | 2026-02-15 |
| 3. User Accounts | 2/2 | Complete | 2026-02-17 |
| 4. Cart, Checkout, and Orders | 4/4 | Complete | 2026-02-19 |
| 5. Wishlist and Translation Completion | 0/2 | Not started | - |
| 6. UI/UX Futuristic Design Refactoring | 0/5 | Not started | - |

### Phase 6: UI/UX Futuristic Design Refactoring
**Goal**: The entire storefront and admin UI is refactored to a futuristic, high-tech, premium aesthetic — with glassmorphism surfaces, 3D interactive hero, smooth micro-interactions via Framer Motion, animated dashboards with count-up KPIs, and modernized components (buttons, modals, sidebar, tables) — while preserving the existing color palette and brand identity
**Depends on**: Phase 5
**Requirements**: UX-01 (futuristic redesign)
**Success Criteria** (what must be TRUE):
  1. The homepage hero section features an interactive 3D scene (React Three Fiber) with floating shapes/particles reacting to cursor movement, smooth entrance animations, and a glowing CTA button
  2. Login/register pages use centered glassmorphic cards with soft background animations, floating labels, animated input focus states, and loading/success transitions
  3. Admin tables have rounded rows, hover elevation, animated sorting/filtering, sticky headers with blur; dashboard KPI cards animate with count-up numbers and charts have smooth transitions
  4. Navigation sidebar is collapsible with smooth animation and active-item glow; buttons have ripple/magnetic hover effects; modals and drawers use scale + blur entrance animations
  5. All animations maintain 60fps performance, all interactive elements remain accessible (keyboard navigable, proper ARIA), and the existing color palette is unchanged
**Plans:** 5 plans

Plans:
- [ ] 06-01-PLAN.md — Animation infrastructure: install R3F, Framer Motion, react-countup; Vite bundle splitting; shared animation presets and hooks; MotionConfig wrapper with reduced-motion support
- [ ] 06-02-PLAN.md — 3D hero and homepage animations: R3F particle hero with cursor interaction, lazy-loaded with 2D fallback, Framer Motion entrance animations on all homepage sections
- [ ] 06-03-PLAN.md — Auth page animations: glassmorphic cards with floating background orbs, animated tab transitions, input focus glow states, loading/success transitions
- [ ] 06-04-PLAN.md — Admin dashboard and tables: AnimatedKPICard with count-up, AnimatedChart wrappers, sticky blur table headers, hover elevation rows
- [ ] 06-05-PLAN.md — Modals, drawers, navbar, and catalog: AnimatedModal (scale+blur), AnimatedDrawer (slide+blur), navbar active-item glow, product card hover effects, catalog staggered entrance

### Phase 7: Backend Refactoring — Code Architecture, Security Hardening, Performance Optimization, and Error Code System

**Goal:** The Laravel API is hardened with rate limiting on auth routes, restricted CORS, token expiration, strict Eloquent mode, database performance indexes, consistent eager loading, standardized RFC 7807 error responses, and a refactored OrderService using the Action pattern with DTOs for testability
**Depends on:** Phase 6
**Plans:** 4 plans

Plans:
- [ ] 07-01-PLAN.md — Security hardening: rate-limit auth routes, tighten CORS allowed headers, set Sanctum token expiration, enable preventLazyLoading and preventAccessingMissingAttributes
- [ ] 07-02-PLAN.md — Error code system: ErrorCode enum with AUTH/ORD/PROD/VAL/SYS categories, RFC 7807 Problem Details rendering in bootstrap/app.php
- [ ] 07-03-PLAN.md — Performance optimization: database index migration for all foreign keys and filter columns, eager loading audit across all controllers
- [ ] 07-04-PLAN.md — Architecture refactoring: extract OrderService into Action classes (CheckDuplicate, ValidateStock, CalculateTotal, DecrementStock), CreateOrderDTO with readonly properties

### Phase 8: Frontend Refactoring — Code Architecture, Performance Optimization, and Cleanup

**Goal:** The frontend codebase is cleaned of dead code, has zero TypeScript errors, uses @/ path aliases instead of deep relative imports, and achieves under 1MB initial bundle via route-level lazy loading with optimized vendor chunk splitting
**Depends on:** Phase 7
**Plans:** 3 plans

Plans:
- [ ] 08-01-PLAN.md — Dead code removal, TypeScript error fixes, CSS keyframe consolidation, `any` type elimination
- [ ] 08-02-PLAN.md — Path alias configuration (tsconfig + Vite) and conversion of all deep relative imports to @/ aliases
- [ ] 08-03-PLAN.md — Route-level lazy loading with React.lazy + Suspense, optimized Vite manual chunks for vendor splitting
