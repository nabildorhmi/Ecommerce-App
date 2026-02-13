# Requirements: TrotinetteApp

**Defined:** 2026-02-13
**Core Value:** Customers can browse electric scooters, place orders, and pay cash on delivery — with an admin who controls the entire catalog, orders, and delivery zones.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Infrastructure

- [ ] **INFRA-01**: Laravel 12 API project scaffolded with Sanctum bearer-token auth
- [ ] **INFRA-02**: React 19 + TypeScript + Vite + MUI 7 frontend scaffolded
- [ ] **INFRA-03**: RTLProvider wired at app root — synchronizes document.dir, MUI theme direction, and Emotion CacheProvider with stylis-plugin-rtl on locale change
- [ ] **INFRA-04**: i18next configured with FR/AR/EN locale files, browser language detection (localStorage → navigator → htmlTag), FR as fallback
- [ ] **INFRA-05**: Translation-ready database schema — product_translations table pattern established from first migration
- [ ] **INFRA-06**: RBAC with admin and customer roles via spatie/laravel-permission
- [ ] **INFRA-07**: Currency formatting utility using Intl.NumberFormat('ar-MA-u-nu-latn') for MAD prices across all locales
- [ ] **INFRA-08**: Axios API client with auth header injection and Accept-Language header on every request
- [ ] **INFRA-09**: Service/Action class pattern established — no business logic in controllers

### Product Catalog

- [ ] **PROD-01**: Admin can create, edit, and delete products with translatable name and description (FR, placeholder for AR/EN)
- [ ] **PROD-02**: Products have structured spec attributes stored as JSON (speed, battery, range, weight, motor power)
- [ ] **PROD-03**: Products support multiple image uploads with auto-generated conversions (thumbnail, card, full-size) via spatie/laravel-medialibrary
- [ ] **PROD-04**: Products belong to categories; admin can create, edit, and delete categories
- [ ] **PROD-05**: Product listing page with pagination, filterable by category, price range, and availability
- [ ] **PROD-06**: Full-text search on product name and description
- [ ] **PROD-07**: Product detail page shows specs table, image gallery, stock status, price, and category breadcrumb
- [ ] **PROD-08**: Product detail page has WhatsApp "ask a question" button (wa.me link with pre-filled message)
- [ ] **PROD-09**: Product detail page shows trust signals: return policy text, phone/WhatsApp contact, "official store" badge
- [ ] **PROD-10**: Stock quantity tracked per product; out-of-stock products show indicator and cannot be added to cart
- [ ] **PROD-11**: Admin can manage stock quantities and toggle product visibility

### Authentication & User Accounts

- [ ] **AUTH-01**: Customer can register with email, password, and required phone number
- [ ] **AUTH-02**: Customer can log in and log out; session persists via Sanctum bearer token stored in localStorage
- [ ] **AUTH-03**: Customer can view and edit profile (name, email, phone, delivery address with city and street)
- [ ] **AUTH-04**: Admin routes protected by role-based middleware on backend and route guards on frontend
- [ ] **AUTH-05**: Admin can view list of registered users with profile details and order history
- [ ] **AUTH-06**: Admin can deactivate user accounts

### Cart & Checkout

- [ ] **CART-01**: Customer can add products to cart, update quantities, and remove items
- [ ] **CART-02**: Cart persists in localStorage via Zustand store; survives page refresh
- [ ] **CART-03**: Cart displays item subtotals and cart total
- [ ] **CART-04**: Out-of-stock products cannot be added to cart

### Orders & Delivery

- [ ] **ORDR-01**: Customer selects delivery city from list of Moroccan cities; delivery fee displays immediately based on city selection (fetched from API)
- [ ] **ORDR-02**: Checkout shows full order summary: items, subtotal, delivery fee, and grand total before confirmation
- [ ] **ORDR-03**: Order placed as cash-on-delivery — no online payment; confirmation message shown with order number and shop contact (phone/WhatsApp)
- [ ] **ORDR-04**: Order creation validates: required phone number, city exists in delivery_zones, duplicate detection (same phone + same product within 10 min = rejected)
- [ ] **ORDR-05**: Server-side total and delivery fee calculation — backend never trusts amounts from request body
- [ ] **ORDR-06**: Stock decremented atomically in database transaction during order creation
- [ ] **ORDR-07**: Order status follows enforced state machine: pending → confirmed → dispatched → delivered; pending/confirmed → cancelled; all other transitions rejected (422)
- [ ] **ORDR-08**: Status transitions use pessimistic locking (lockForUpdate) and log every change to order_status_logs table (actor, timestamp, from/to status)
- [ ] **ORDR-09**: Customer can view order history with status badges (trilingual labels)
- [ ] **ORDR-10**: Admin can view order list with filters by status, city, and date
- [ ] **ORDR-11**: Admin can transition order status via valid buttons only (invalid transitions not shown)
- [ ] **ORDR-12**: Admin can add notes to orders (for recording phone confirmation outcome)

### Delivery Zones

- [ ] **DLVR-01**: Admin can manage delivery zones: add/edit/remove cities with associated delivery fees
- [ ] **DLVR-02**: Delivery zones seeded with major Moroccan cities (Casablanca, Rabat, Marrakech, Fes, Tangier) and default fees
- [ ] **DLVR-03**: Delivery fee API endpoint returns city list with fees; frontend fetches from this endpoint only

### Wishlist

- [ ] **WISH-01**: Logged-in customer can add and remove products from wishlist
- [ ] **WISH-02**: Wishlist accessible from user account with product links

### Internationalization

- [ ] **I18N-01**: Language switcher in header allows toggling between French, Arabic, and English
- [ ] **I18N-02**: All UI strings (buttons, labels, messages, status labels) translated in FR/AR/EN
- [ ] **I18N-03**: Arabic layout is fully RTL — including MUI portal components (Dialog, Drawer, Menu)
- [ ] **I18N-04**: CSS uses logical properties (padding-inline-start, not padding-left) throughout

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Product Enhancements

- **PROD-V2-01**: Product comparison tool — select up to 3 products, side-by-side spec table
- **PROD-V2-02**: Recently viewed products (localStorage, no backend)
- **PROD-V2-03**: Related products on detail page (admin-curated, tag-based)
- **PROD-V2-04**: Arabic product content (translations table ready from v1, content populated in v2)

### Checkout Enhancements

- **ORDR-V2-01**: Delivery date estimate at checkout (city → business-days rule in delivery_zones table)

### Admin Enhancements

- **ADMN-V2-01**: KPI dashboard — orders by status, revenue by week, top 5 products
- **ADMN-V2-02**: Bulk CSV export of filtered order list
- **ADMN-V2-03**: Admin order call log field

### Future (v3+)

- **PAY-V3-01**: Online payment integration (CMI, Stripe, PayPal)
- **SOCL-V3-01**: Product reviews and ratings with moderation
- **NOTF-V3-01**: Automated SMS/WhatsApp order notifications
- **SEO-V3-01**: Multi-language SEO (hreflang, per-language URLs)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Online payment gateway | Local market — cash on delivery is product-market fit (54-80% of Moroccan e-commerce) |
| Real-time GPS delivery tracking | Admin handles logistics offline; overkill for launch volume |
| Multi-vendor marketplace | Single-vendor store; marketplace adds massive complexity |
| Loyalty points / rewards | Premature without order volume data |
| AI product recommendations | Premature optimization; manual curation sufficient |
| Social login (Google/Facebook) | Email+password sufficient; adds OAuth complexity |
| Abandoned cart emails | Requires email service integration; defer to v2+ |
| Live chatbot | WhatsApp contact button covers customer communication |
| Mobile native app | Web-first; API architecture supports future mobile app |
| Guest checkout | COD with phone confirmation requires customer identity |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| INFRA-06 | Phase 1 | Pending |
| INFRA-07 | Phase 1 | Pending |
| INFRA-08 | Phase 1 | Pending |
| INFRA-09 | Phase 1 | Pending |
| PROD-01 | Phase 2 | Pending |
| PROD-02 | Phase 2 | Pending |
| PROD-03 | Phase 2 | Pending |
| PROD-04 | Phase 2 | Pending |
| PROD-05 | Phase 2 | Pending |
| PROD-06 | Phase 2 | Pending |
| PROD-07 | Phase 2 | Pending |
| PROD-08 | Phase 2 | Pending |
| PROD-09 | Phase 2 | Pending |
| PROD-10 | Phase 2 | Pending |
| PROD-11 | Phase 2 | Pending |
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| AUTH-05 | Phase 3 | Pending |
| AUTH-06 | Phase 3 | Pending |
| CART-01 | Phase 4 | Pending |
| CART-02 | Phase 4 | Pending |
| CART-03 | Phase 4 | Pending |
| CART-04 | Phase 4 | Pending |
| ORDR-01 | Phase 4 | Pending |
| ORDR-02 | Phase 4 | Pending |
| ORDR-03 | Phase 4 | Pending |
| ORDR-04 | Phase 4 | Pending |
| ORDR-05 | Phase 4 | Pending |
| ORDR-06 | Phase 4 | Pending |
| ORDR-07 | Phase 4 | Pending |
| ORDR-08 | Phase 4 | Pending |
| ORDR-09 | Phase 4 | Pending |
| ORDR-10 | Phase 4 | Pending |
| ORDR-11 | Phase 4 | Pending |
| ORDR-12 | Phase 4 | Pending |
| DLVR-01 | Phase 4 | Pending |
| DLVR-02 | Phase 4 | Pending |
| DLVR-03 | Phase 4 | Pending |
| WISH-01 | Phase 5 | Pending |
| WISH-02 | Phase 5 | Pending |
| I18N-01 | Phase 1 | Pending |
| I18N-02 | Phase 6 | Pending |
| I18N-03 | Phase 1 | Pending |
| I18N-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after initial definition*
