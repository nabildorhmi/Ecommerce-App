---
phase: quick-1
plan: 01
subsystem: checkout, orders, catalog, navbar
tags: [ux-improvement, visual-polish, admin-tooling, accessibility]
dependency_graph:
  requires: []
  provides:
    - City-based checkout (no zone selection)
    - Guest checkout with inline registration
    - Background-image product cards
    - Admin pending orders badge
    - Light mode navbar compatibility
  affects:
    - trotinette-api/app/Services/OrderService.php
    - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    - trotinette-frontend/src/shared/components/Navbar.tsx
    - trotinette-frontend/src/features/catalog/components/ProductCard.tsx
tech_stack:
  added:
    - Inline registration pattern at checkout
    - CSS background-image for product cards
    - React Query polling for admin badge
  patterns:
    - Guest-to-authenticated transition via inline form
    - Badge notifications with polling
    - Theme-aware color tokens throughout Navbar
key_files:
  created:
    - trotinette-api/database/migrations/2026_02_20_000001_make_delivery_zone_optional_add_city.php
  modified:
    - trotinette-api/app/Http/Requests/StoreOrderRequest.php
    - trotinette-api/app/Http/Resources/OrderResource.php
    - trotinette-api/app/Models/Order.php
    - trotinette-api/app/Services/OrderService.php
    - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    - trotinette-frontend/src/features/checkout/types.ts
    - trotinette-frontend/src/features/orders/types.ts
    - trotinette-frontend/src/features/orders/pages/AdminOrdersPage.tsx
    - trotinette-frontend/src/features/orders/pages/AdminOrderDetailPage.tsx
    - trotinette-frontend/src/features/orders/pages/MyOrdersPage.tsx
    - trotinette-frontend/src/features/catalog/components/ProductCard.tsx
    - trotinette-frontend/src/features/home/pages/HomePage.tsx
    - trotinette-frontend/src/shared/components/Navbar.tsx
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/app/theme.ts
    - trotinette-frontend/src/locales/fr/translation.json
    - trotinette-frontend/src/locales/en/translation.json
decisions:
  - summary: "Replace delivery zone dropdown with free-text city input and zero delivery fee"
    rationale: "Simpler UX — no need to pre-populate delivery zones, no zone management overhead. Customer types their city, delivery is always free."
  - summary: "Inline registration at checkout for guests instead of redirect to /login"
    rationale: "Reduces friction — guest can register and complete order in one flow without leaving checkout page."
  - summary: "Product card images as CSS background-image (cover) instead of <img> tag (contain)"
    rationale: "Better visual presentation — images fill the card area completely, no empty padding/gaps."
  - summary: "Admin pending orders badge with 30s polling instead of websockets"
    rationale: "Simpler implementation — React Query polling provides real-time-ish updates without websocket infrastructure."
  - summary: "Replace hardcoded Navbar colors with theme tokens (background.paper, text.primary, divider)"
    rationale: "Light mode compatibility — theme-aware tokens ensure Navbar menus are readable in both dark and light modes."
metrics:
  duration_minutes: 9.5
  tasks_completed: 2
  files_modified: 24
  commits: 2
  completed_at: "2026-02-20"
---

# Phase quick-1 Plan 01: Quick Improvements Summary

**One-liner:** Simplified checkout with city text input, inline guest registration, background-image product cards, admin pending orders badge, and light mode navbar fixes.

## What Was Built

### Task 1: Replace delivery zones with city text input
- **Migration:** Added `city` column to `orders` table, made `delivery_zone_id` nullable
- **Backend:** Updated `StoreOrderRequest` to validate `city` string, removed delivery zone lookup in `OrderService`, set delivery fee to 0 for all new orders
- **Frontend:** Replaced delivery zone `Autocomplete` with simple `TextField` for city, updated order types to include `city` field and make `delivery_zone` optional, updated admin/customer order pages to display `city ?? delivery_zone?.city` for backward compatibility
- **Translations:** Added `checkout.freeDelivery` key
- **Result:** Checkout now accepts free-text city, no zone selection required, zero delivery fee for all orders

### Task 2: Inline registration, product cards, admin badge, light mode
- **A. Inline registration:** Moved `/checkout` out of `ProtectedRoute`, added `RegisterForm` component inline at checkout for guests, registration mutation sets auth and pre-fills phone, place order button disabled until authenticated
- **B. Product card bg-image:** Changed `ProductCard.tsx` and `HomePage.tsx` featured cards from `<img>` to CSS `background-image` with `cover` sizing for better visual fill
- **C. Admin pending badge:** Added React Query polling (30s interval) for pending orders count, added red dot badge on `AdminPanelSettings` icon, added red badge with count on Orders menu item
- **D. Light mode fixes:** Replaced all hardcoded colors in `Navbar.tsx` (`#111116`, `#F5F7FA`, `#9CA3AF`, `#1E1E28`) with theme tokens (`background.paper`, `text.primary`, `text.secondary`, `divider`), updated `theme.ts` Alert color overrides for better light mode contrast

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed AdminOrderFilters type to include city filter**
- **Found during:** Task 1 — TypeScript build error
- **Issue:** `AdminOrderFilters` interface missing `'filter[city]'` property after replacing delivery zone filter with city filter
- **Fix:** Added `'filter[city]'?: string;` to interface
- **Files modified:** `trotinette-frontend/src/features/orders/api/orders.ts`
- **Commit:** Included in Task 1 commit (85111b3)

**2. [Rule 1 - Bug] Fixed OrderConfirmationPage delivery zone null handling**
- **Found during:** Task 1 — TypeScript build error
- **Issue:** `order.delivery_zone` accessed without null check after making it optional in types
- **Fix:** Changed to `order.city ?? order.delivery_zone?.city ?? '—'` with optional chaining
- **Files modified:** `trotinette-frontend/src/features/checkout/pages/OrderConfirmationPage.tsx`
- **Commit:** Included in Task 1 commit (85111b3)

**3. [Rule 1 - Bug] Removed unused imports causing build errors**
- **Found during:** Task 1 — TypeScript build warnings converted to errors
- **Issue:** Unused imports in `HomePage.tsx` (`useState`, `useEffect`, `BoltIcon`) and `FilterBar.tsx` (`InputLabel`)
- **Fix:** Removed unused imports
- **Files modified:** `trotinette-frontend/src/features/home/pages/HomePage.tsx`, `trotinette-frontend/src/features/catalog/components/FilterBar.tsx`
- **Commit:** Included in Task 1 commit (85111b3)

---

No architectural decisions or auth gates encountered. All auto-fixes were Rule 1 (bugs) found during build verification.

## Verification

- [x] Backend migration applied successfully: `php artisan migrate`
- [x] Frontend builds with zero TypeScript errors: `npm run build`
- [x] Task 1 commit (85111b3): 15 files changed, migration created, delivery zone logic removed
- [x] Task 2 commit (3a30b62): 8 files changed, inline registration added, theme tokens applied

## Testing Notes

**Manual testing recommended:**
1. **Guest checkout flow:** Visit checkout as guest → see inline registration form → register → see checkout form enabled → place order
2. **City text input:** Verify checkout shows text field for city (not dropdown), order confirmation shows city
3. **Product card images:** Verify product cards show images filling the entire card area (no padding gaps)
4. **Admin pending badge:** As admin, verify red dot on admin icon and count badge on Orders menu item (create pending order to test)
5. **Light mode:** Toggle to light mode → verify Navbar menus are readable, no white-on-white text, borders visible

## Known Issues

None.

## Self-Check

### Created Files
```bash
[ -f "trotinette-api/database/migrations/2026_02_20_000001_make_delivery_zone_optional_add_city.php" ] && echo "FOUND" || echo "MISSING"
```
FOUND: trotinette-api/database/migrations/2026_02_20_000001_make_delivery_zone_optional_add_city.php

### Commits
```bash
git log --oneline --all | grep -E "85111b3|3a30b62"
```
FOUND: 85111b3 feat(quick-1): replace delivery zones with city text input
FOUND: 3a30b62 feat(quick-1): inline registration, product card bg-image, admin badge, light mode fixes

## Self-Check: PASSED

All files created and commits exist as documented.

---

**Execution complete.** Both tasks executed successfully with minor auto-fixes for TypeScript errors. Quick task improves checkout UX, visual polish, admin tooling, and light mode accessibility without requiring ROADMAP.md updates (quick tasks are separate from planned phases per constraints).
