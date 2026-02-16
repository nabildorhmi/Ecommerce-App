---
phase: 02-product-catalog
plan: 02
subsystem: ui
tags: [react, mui, tanstack-query, react-router, i18n, whatsapp, product-catalog, storefront]

requires:
  - phase: 02-product-catalog
    plan: 01
    provides: Product/Category REST API with paginated filtering, slug-based detail, image URLs (thumbnail/card/full)

provides:
  - CatalogPage at /products: paginated product grid with category/price/stock/search filters, URL state persistence
  - ProductDetailPage at /products/:slug: gallery, specs table, WhatsApp button, trust signals, breadcrumb
  - useProducts(filters) and useProduct(slug) TanStack Query hooks
  - useCategories() hook with 10-min staleTime
  - useCatalogFilters: URL search param state management (useSearchParams)
  - ProductCard, ProductGrid, FilterBar, StockBadge components
  - ProductGallery: main image + thumbnail row (MUI-only, no external carousel)
  - SpecsTable: two-column table with key formatting and unit suffixes
  - WhatsAppButton: wa.me deep link with pre-filled French message
  - TrustSignals: 7-day return, official store, contact phone badges
  - CategoryBreadcrumb: navigates back to catalog filtered by category
  - CatalogFilters type with URL param keys matching API filter format
  - FR/EN i18n strings for all catalog and product detail UI

affects:
  - 02-03-admin (admin UI uses same Category type from catalog types)
  - 04-checkout (product detail Add to Cart button placeholder wired here, will be connected in Phase 4)

tech-stack:
  added: []
  patterns:
    - useSearchParams from react-router v7 for URL-persisted filter state
    - TanStack Query useQuery with filter-object queryKey for automatic refetch on filter change
    - Debounced search input (300ms) with local state + URL sync to prevent URL thrashing
    - Price in MAD on UI, centimes in URL/API (multiply by 100 for API, divide by 100 for display)
    - ProductCard as react-router Link with MUI Card — entire card is clickable, no nested anchors
    - MUI Box/Stack with useState for image gallery — avoids 3rd-party carousel dependency
    - Spec key formatting: underscore -> spaces + capitalize, with unit suffix map per known key
    - formatCurrency() utility reused for all MAD price displays

key-files:
  created:
    - trotinette-frontend/src/features/catalog/types.ts
    - trotinette-frontend/src/features/catalog/api/products.ts
    - trotinette-frontend/src/features/catalog/api/categories.ts
    - trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts
    - trotinette-frontend/src/features/catalog/components/StockBadge.tsx
    - trotinette-frontend/src/features/catalog/components/ProductCard.tsx
    - trotinette-frontend/src/features/catalog/components/ProductGrid.tsx
    - trotinette-frontend/src/features/catalog/components/FilterBar.tsx
    - trotinette-frontend/src/features/catalog/components/ProductGallery.tsx
    - trotinette-frontend/src/features/catalog/components/SpecsTable.tsx
    - trotinette-frontend/src/features/catalog/components/WhatsAppButton.tsx
    - trotinette-frontend/src/features/catalog/components/TrustSignals.tsx
    - trotinette-frontend/src/features/catalog/components/CategoryBreadcrumb.tsx
    - trotinette-frontend/src/features/catalog/pages/CatalogPage.tsx
    - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
  modified:
    - trotinette-frontend/src/features/admin/components/ProductForm.tsx (fixed Zod v4 API errors)
    - trotinette-frontend/.env (added VITE_WHATSAPP_NUMBER)

key-decisions:
  - "Price MAD<->centimes conversion: user enters MAD in FilterBar (multiply by 100 for API), URL stores centimes, display divides by 100 — keeps API contract intact"
  - "ProductGallery uses full-res image for main view (not card) — detail page justifies higher resolution; card conversion used in listing"
  - "WhatsApp message hardcoded in French — primary market is Moroccan French speakers; EN UI users still get French WA message (acceptable per business context)"
  - "VITE_WHATSAPP_NUMBER in .env with placeholder 212600000000 — user must replace before production"
  - "ProductDetailPage Add to Cart button disabled (not hidden) for out-of-stock — better UX than hiding; will be wired to cart in Phase 4"

patterns-established:
  - "Filter URL key format: filter[category_id], filter[min_price] etc. — matches Laravel QueryBuilder AllowedFilter names exactly"
  - "All price inputs in MAD (human-friendly), all API calls in centimes (integer-safe)"
  - "useCategories() vs useAdminCategories() separation — storefront uses /categories, admin uses /admin/categories"

duration: 6min
completed: 2026-02-16
---

# Phase 2 Plan 2: Product Catalog Storefront UI Summary

**MUI product storefront with URL-persisted filters, TanStack Query hooks, WhatsApp contact, and full detail page — gallery, specs table, trust signals, breadcrumb**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-02-16T20:26:17Z
- **Completed:** 2026-02-16T20:32:56Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- Customer-facing catalog at /products with paginated product grid, four filters (category, price range, stock, search) and URL state persistence via useSearchParams
- Product detail page at /products/:slug with MUI-only image gallery, two-column specs table with unit suffixes, WhatsApp wa.me button, three trust signal badges, and category breadcrumb navigation
- All UI text translated in FR and EN; out-of-stock products show red badge and disabled Add to Cart button

## Task Commits

Each task was committed atomically:

1. **Task 1: Catalog listing page with API hooks, filter bar, product grid, and search** - `80dde10` (feat)
2. **Task 2: Product detail page with gallery, specs, WhatsApp, trust signals, breadcrumb** - `2298631` (feat)

## Files Created/Modified

- `trotinette-frontend/src/features/catalog/types.ts` - Product, Category, ProductImage, PaginatedResponse, CatalogFilters TypeScript interfaces
- `trotinette-frontend/src/features/catalog/api/products.ts` - useProducts (filtered+paginated list) and useProduct (by slug) TanStack Query hooks
- `trotinette-frontend/src/features/catalog/api/categories.ts` - useCategories with 10-min staleTime
- `trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts` - URL search param state via useSearchParams, setFilter resets page on filter change
- `trotinette-frontend/src/features/catalog/components/StockBadge.tsx` - Green/red MUI Chip for in_stock status
- `trotinette-frontend/src/features/catalog/components/ProductCard.tsx` - Card with image, name, formatCurrency price, StockBadge, category — entire card links to detail
- `trotinette-frontend/src/features/catalog/components/ProductGrid.tsx` - Responsive 1/2/3/4 column grid with skeleton loading and empty state
- `trotinette-frontend/src/features/catalog/components/FilterBar.tsx` - Search (debounced 300ms), category select from API, price range MAD->centimes, in-stock switch, clear button
- `trotinette-frontend/src/features/catalog/components/ProductGallery.tsx` - Main full-res image + thumbnail row with active border, error fallback to card URL
- `trotinette-frontend/src/features/catalog/components/SpecsTable.tsx` - Two-column table with key formatting and unit suffixes (km/h, Ah, km, kg, W)
- `trotinette-frontend/src/features/catalog/components/WhatsAppButton.tsx` - wa.me deep link from VITE_WHATSAPP_NUMBER env, pre-filled French message, opens new tab
- `trotinette-frontend/src/features/catalog/components/TrustSignals.tsx` - Three badges: 7-day return (AssignmentReturn icon), official store (VerifiedUser icon), formatted phone (+212)
- `trotinette-frontend/src/features/catalog/components/CategoryBreadcrumb.tsx` - MUI Breadcrumbs: Home > Category (filtered catalog link)
- `trotinette-frontend/src/features/catalog/pages/CatalogPage.tsx` - Composes FilterBar + ProductGrid + MUI Pagination at /products
- `trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx` - Gallery (md=7) + info stack (md=5), skeleton loading, 404/not-found state
- `trotinette-frontend/src/features/admin/components/ProductForm.tsx` - Fixed Zod v4 API errors (invalid_type_error->error, resolver cast, category comparison)
- `trotinette-frontend/.env` - Added VITE_WHATSAPP_NUMBER=212600000000

## Decisions Made

- Price MAD/centimes conversion: FilterBar shows MAD to users (friendly), stores centimes in URL (integer-safe, matches API contract)
- ProductGallery main image uses `full` conversion (1200x900) not `card` (600x400) — detail page justifies higher resolution fetch
- WhatsApp pre-filled message is hardcoded in French — Moroccan French is primary market language
- VITE_WHATSAPP_NUMBER placeholder `212600000000` — user must replace with real number before production
- Add to Cart is disabled but visible for out-of-stock products — better UX than hiding, consistent layout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing TypeScript errors in ProductForm.tsx**
- **Found during:** Task 1 (initial build verification)
- **Issue:** `ProductForm.tsx` (committed as part of 02-03 plan which ran out-of-order) had 4 TypeScript errors caused by Zod v4 API changes: `invalid_type_error` renamed to `error`, resolver type mismatch with optional `.default('')` fields, and MUI Select `onChange` comparing `number` to `''`
- **Fix:** Changed `invalid_type_error` to `error`, cast `zodResolver` to `any`, changed `description` from `.optional().default('')` to `.default('')`, converted `e.target.value` to string before comparison
- **Files modified:** `trotinette-frontend/src/features/admin/components/ProductForm.tsx`
- **Verification:** `npm run build` passes with zero TypeScript errors
- **Committed in:** `80dde10` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** The fix was required to unblock the build verification. Pre-existing code committed by 02-03 plan (which ran before 02-02) had Zod v4 incompatibilities.

## Issues Encountered

- **02-03 plan ran before 02-02:** The admin UI (02-03 plan) was already committed to the repo before 02-02 was executed. The router.tsx already had admin routes alongside the catalog routes. Locale files already had admin translation strings. The catalog feature directory was missing — this plan created it.
- **Pre-existing build errors:** Because 02-03 ran first and included `ProductForm.tsx` with Zod v4 incompatibilities, the initial build failed. Auto-fixed per Rule 1.

## User Setup Required

- Replace `VITE_WHATSAPP_NUMBER=212600000000` in `trotinette-frontend/.env` with the actual shop WhatsApp number before production deployment.

## Next Phase Readiness

- Catalog storefront fully operational — /products and /products/:slug render with real API data
- All components translated FR/EN; locale keys added for catalog, product detail, and trust signals
- Add to Cart button visible but disabled — ready to be wired in Phase 4 (checkout)
- WhatsApp number placeholder must be replaced before go-live

---
*Phase: 02-product-catalog*
*Completed: 2026-02-16*

## Self-Check: PASSED

- All 16 key files verified present on disk (15 catalog files + .env)
- All 2 task commits verified in git log (80dde10, 2298631)
- Build verified: `npm run build` passes with 0 TypeScript errors after Zod v4 fix
- SUMMARY.md created at `.planning/phases/02-product-catalog/02-02-SUMMARY.md`
- STATE.md updated with 02-02 decisions
