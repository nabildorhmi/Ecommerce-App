---
phase: 04-cart-checkout-orders
plan: 03
subsystem: ui
tags: [zustand, react-hook-form, zod, mui, localStorage, cart, checkout, i18n]

# Dependency graph
requires:
  - phase: 04-01
    provides: Delivery zones API endpoint (GET /delivery-zones) with city + fee data
  - phase: 04-02
    provides: Order creation API endpoint (POST /orders) and OrderConfirmation response shape
  - phase: 02-02
    provides: ProductDetailPage shell with stubbed Add to Cart button
  - phase: 01-02
    provides: apiClient, queryClient, router infrastructure
  - phase: 01-03
    provides: i18n/RTL infrastructure, formatCurrency utility, LanguageSwitcher component
provides:
  - Zustand cart store with localStorage persistence (useCartStore)
  - CartBadge, CartDrawer, CartItem components
  - Navbar with cart icon, auth actions, language switcher
  - RootLayout wrapping all routes with Navbar
  - CheckoutPage: city selector with live delivery fee, phone, order summary, place order
  - OrderConfirmationPage: order number, totals, WhatsApp contact, nav buttons
  - FR/EN translations for cart and checkout namespaces
affects: [04-04, 05-i18n-pass]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useCartStore.getState().clearCart() inside useMutation onSuccess (outside React render tree)"
    - "Price/stock snapshot in CartItem at add-time — cart survives catalog updates"
    - "location.state for confirmation data — avoids extra API call on confirmation page"
    - "RootLayout as root layout route in React Router v7 — wraps all routes with Navbar"

key-files:
  created:
    - trotinette-frontend/src/features/cart/types.ts
    - trotinette-frontend/src/features/cart/store.ts
    - trotinette-frontend/src/features/cart/components/CartItem.tsx
    - trotinette-frontend/src/features/cart/components/CartDrawer.tsx
    - trotinette-frontend/src/features/cart/components/CartBadge.tsx
    - trotinette-frontend/src/features/checkout/types.ts
    - trotinette-frontend/src/features/checkout/api/deliveryZones.ts
    - trotinette-frontend/src/features/checkout/api/orders.ts
    - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    - trotinette-frontend/src/features/checkout/pages/OrderConfirmationPage.tsx
    - trotinette-frontend/src/shared/components/Navbar.tsx
    - trotinette-frontend/src/shared/components/RootLayout.tsx
  modified:
    - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/locales/fr/translation.json
    - trotinette-frontend/src/locales/en/translation.json

key-decisions:
  - "Product name snapshotted at add-time using API-localized product.name (Accept-Language header already set by apiClient interceptor)"
  - "useCartStore.getState().clearCart() inside usePlaceOrder onSuccess — mutations run outside React render tree"
  - "location.state carries OrderConfirmation to confirmation page — avoids extra GET /orders/:number call"
  - "OrderConfirmationPage redirects to /orders if accessed without location.state (direct URL / page refresh)"
  - "RootLayout wraps all routes so Navbar is global without repeating in every page component"
  - "CheckoutPage redirects to /products if cart is empty (useEffect on items.length)"
  - "isAtMaxStock check on Add to Cart button — prevents adding beyond snapshotted stockQuantity"

patterns-established:
  - "Cart store: Zustand persist middleware with version field for future migrations"
  - "Checkout API: POST /orders sends only product_id + quantity + delivery_zone_id + phone — backend is source of truth for prices"
  - "Delivery fee: always fetched from API (useDeliveryZones), never a frontend constant"

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 4 Plan 3: Cart and Checkout Frontend Summary

**Zustand cart store with localStorage persistence, MUI CartDrawer/Badge in Navbar, checkout flow with API-driven delivery fees, COD order placement, and order confirmation with WhatsApp contact**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-18T20:17:44Z
- **Completed:** 2026-02-18T20:23:31Z
- **Tasks:** 3
- **Files modified:** 16 (12 created, 4 modified)

## Accomplishments
- Zustand cart store with localStorage persistence, quantity caps at stockQuantity, out-of-stock guard
- Cart badge + drawer in global Navbar; Add to Cart wired on ProductDetailPage with Snackbar feedback
- CheckoutPage: city selector with live delivery fee from API, phone pre-fill from auth store, RHF+Zod form, place order button with double-click prevention
- OrderConfirmationPage: order number, item breakdown, WhatsApp shop contact, redirects to /orders if accessed directly
- FR/EN translations for cart and checkout namespaces (22 new keys)

## Task Commits

Each task was committed atomically:

1. **Task 1: Cart types, Zustand store, and cart components** - `b86bdf4` (feat)
2. **Task 2: Checkout types, API hooks, and checkout page** - `6b84d27` (feat)
3. **Task 3: Wire cart into ProductDetailPage, Navbar, and router** - `012b769` (feat)

## Files Created/Modified
- `trotinette-frontend/src/features/cart/types.ts` - CartItem interface with price/stock snapshots
- `trotinette-frontend/src/features/cart/store.ts` - useCartStore (Zustand persist, localStorage)
- `trotinette-frontend/src/features/cart/components/CartItem.tsx` - Item with quantity controls, subtotal, remove
- `trotinette-frontend/src/features/cart/components/CartDrawer.tsx` - MUI Drawer, subtotal footer, checkout CTA
- `trotinette-frontend/src/features/cart/components/CartBadge.tsx` - MUI Badge wrapping cart icon
- `trotinette-frontend/src/features/checkout/types.ts` - DeliveryZone, PlaceOrderInput, OrderConfirmation types
- `trotinette-frontend/src/features/checkout/api/deliveryZones.ts` - useDeliveryZones (GET /delivery-zones, 10-min stale)
- `trotinette-frontend/src/features/checkout/api/orders.ts` - usePlaceOrder (POST /orders, clears cart on success)
- `trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx` - Full checkout form with city selector
- `trotinette-frontend/src/features/checkout/pages/OrderConfirmationPage.tsx` - Success page with WhatsApp link
- `trotinette-frontend/src/shared/components/Navbar.tsx` - Global navbar with cart, auth, language switcher
- `trotinette-frontend/src/shared/components/RootLayout.tsx` - Root layout route wrapping all pages
- `trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx` - Add to Cart wired + Snackbar
- `trotinette-frontend/src/app/router.tsx` - RootLayout added, /checkout and /orders/:orderNumber/confirmation routes
- `trotinette-frontend/src/locales/fr/translation.json` - cart + checkout + common namespaces added
- `trotinette-frontend/src/locales/en/translation.json` - cart + checkout + common namespaces added

## Decisions Made
- Product name snapshotted at add-time using API-localized `product.name` (Accept-Language header set by apiClient interceptor handles locale)
- `useCartStore.getState().clearCart()` inside `usePlaceOrder` onSuccess — same pattern as auth store for outside-render-tree access
- `location.state` carries `OrderConfirmation` to confirmation page — avoids extra GET /orders/:number API call
- `OrderConfirmationPage` redirects to `/orders` if accessed without `location.state` (direct URL or page refresh)
- `RootLayout` as root layout route — global Navbar without repeating import in every page component
- `CheckoutPage` redirects to `/products` via `useEffect` when cart is empty

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created Navbar.tsx from scratch**
- **Found during:** Task 3 (Navbar update)
- **Issue:** Plan said to "Update Navbar.tsx" but the file didn't exist in the codebase — no Navbar had been created in prior phases
- **Fix:** Created `Navbar.tsx` with brand link, CartBadge, CartDrawer toggle, LanguageSwitcher, auth-aware user actions (profile/logout/admin)
- **Files modified:** trotinette-frontend/src/shared/components/Navbar.tsx (created)
- **Verification:** TypeScript check passes, all imports resolve
- **Committed in:** 012b769 (Task 3 commit)

**2. [Rule 2 - Missing Critical] Created RootLayout to mount Navbar globally**
- **Found during:** Task 3 (Navbar integration)
- **Issue:** No layout wrapper existed; adding Navbar directly to individual pages would require repeating it across all pages and wouldn't cover new routes
- **Fix:** Created `RootLayout` as a React Router v7 layout route wrapping all routes, nested router under it
- **Files modified:** trotinette-frontend/src/shared/components/RootLayout.tsx (created), src/app/router.tsx (modified)
- **Verification:** TypeScript check passes, all routes still resolve
- **Committed in:** 012b769 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both auto-fixes were necessary to complete the plan correctly. Navbar didn't exist; a layout route was needed to mount it globally. No scope creep.

## Issues Encountered
None - all tasks executed cleanly. TypeScript check passed with zero errors after each task.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cart and checkout frontend complete; ready for 04-04 (order history page)
- `/orders` route referenced in OrderConfirmationPage "View My Orders" button — will be registered in 04-04
- Cart persists across sessions (localStorage); survives API being down

## Self-Check: PASSED

All 12 created files verified on disk. All 3 task commits (b86bdf4, 6b84d27, 012b769) confirmed in git log. TypeScript check passes with zero errors.

---
*Phase: 04-cart-checkout-orders*
*Completed: 2026-02-18*
