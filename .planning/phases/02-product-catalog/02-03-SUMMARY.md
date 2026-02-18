---
phase: 02-product-catalog
plan: 03
subsystem: ui
tags: [react, tanstack-query, react-hook-form, zod, mui, formdata, multipart, admin, product-crud, category-crud]

requires:
  - phase: 02-product-catalog
    plan: 01
    provides: Admin product/category REST API endpoints (CRUD, image upload, PATCH semantics, /admin/products, /admin/categories)

provides:
  - AdminProductsPage at /admin/products with inline stock editing, visibility toggle, delete confirmation
  - AdminProductEditPage at /admin/products/create and /admin/products/:id/edit with full ProductForm
  - ProductForm: RHF + Zod, FR/EN translatable name/slug/description, SKU, price (MAD), stock, category, specs, multi-image upload (FormData)
  - ImageUploader: existing image thumbnails with delete, new image previews with remove, max 10 images
  - AdminCategoriesPage at /admin/categories with dialog-based create/edit, delete guard for categories with products
  - CategoryForm: RHF + Zod, FR/EN names, slug auto-generated from FR name, active toggle
  - TanStack Query mutations for all admin operations with dual invalidation (admin + customer query keys)
  - Admin translation keys in FR and EN locale files (admin.products.* and admin.categories.*)

affects:
  - 02-02-storefront (query invalidation means storefront updates immediately when admin changes product/category)
  - 03-auth (admin routes currently unguarded — auth guards will be added in Phase 3)

tech-stack:
  added: []
  patterns:
    - FormData with nested fields (translations[fr][name]) + Content-Type undefined for multipart boundary
    - POST + _method=PATCH for Laravel PATCH with FormData (Laravel doesn't support multipart PUT/PATCH natively)
    - Dual query invalidation on mutations (admin + customer query keys) for immediate storefront sync
    - Auto-slug generation from translatable name with manual-edit detection via boolean flag
    - Inline editing pattern (click text -> input field, save on blur/Enter, cancel on Escape)
    - Dialog-based CRUD for simple entities (categories), separate page for complex entities (products)

key-files:
  created:
    - trotinette-frontend/src/features/admin/types.ts
    - trotinette-frontend/src/features/admin/api/products.ts
    - trotinette-frontend/src/features/admin/api/categories.ts
    - trotinette-frontend/src/features/admin/components/ImageUploader.tsx
    - trotinette-frontend/src/features/admin/components/ProductForm.tsx
    - trotinette-frontend/src/features/admin/components/CategoryForm.tsx
    - trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
    - trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
    - trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx
  modified:
    - trotinette-frontend/src/app/router.tsx (added 4 admin routes, merged alongside 02-02 catalog routes)
    - trotinette-frontend/src/locales/fr/translation.json (added admin.products and admin.categories keys)
    - trotinette-frontend/src/locales/en/translation.json (added admin.products and admin.categories keys)

key-decisions:
  - "FormData with Content-Type undefined for product mutations — apiClient has application/json default; override to undefined so browser sets multipart/form-data with correct boundary"
  - "POST + _method=PATCH for product updates with FormData — Laravel does not parse multipart PATCH requests; _method field spoofs the HTTP method"
  - "Dual query invalidation on every mutation — invalidate both ['admin', 'products'] and ['products'] so storefront reflects admin changes immediately without page reload"
  - "Dialog-based CRUD for categories, separate edit page for products — categories are simple (3 fields), products are complex (20+ fields); separate edit page gives better UX for products"
  - "Auto-slug generation with manual-edit detection — track frSlugManual/enSlugManual boolean; auto-slug only fires when user hasn't manually edited the slug field"
  - "Zod v4 uses { error: '...' } not { invalid_type_error: '...' } — linter automatically corrected this during file creation (Zod v4.3.6 API change)"

patterns-established:
  - "FormData for multipart: buildProductFormData() helper constructs nested FormData from typed input; Content-Type set to undefined on request config to let browser inject boundary"
  - "POST+_method spoof: fd.append('_method', 'PATCH') for any Laravel PATCH+FormData scenario"
  - "Admin page structure: list page (table + dialogs) + edit page (full form) pattern for complex entities"
  - "Inline edit: InlineStockEditor pattern — render span with underline, click -> input, save on blur/Enter"

duration: 4min
completed: 2026-02-16
---

# Phase 2 Plan 3: Admin Product & Category Management UI Summary

**MUI admin CRUD interface for products (FormData multipart with image upload, inline stock edit, visibility toggle) and categories (dialog-based, FR/EN translatable), both using RHF + Zod + TanStack Query with dual query invalidation for immediate storefront sync**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-16T20:25:59Z
- **Completed:** 2026-02-16T20:30:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Complete admin product management at /admin/products and /admin/products/:id/edit — create/edit form with FR/EN translations, SKU, price (MAD->centimes conversion), stock, category select, spec attributes, multi-image upload via FormData
- Admin category management at /admin/categories — dialog-based CRUD with FR/EN names, auto-slug, active toggle, and delete guard showing product count warning
- Dual TanStack Query invalidation on every mutation ensures storefront product listing and category filter update immediately without page reload

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin product CRUD — list, create, edit, delete with image upload** - `d97353f` (feat)
2. **Task 2: Admin category management — CRUD with translatable names** - `ee7a63e` (feat)

**Plan metadata:** (docs commit — see state updates)

## Files Created/Modified

- `trotinette-frontend/src/features/admin/types.ts` - AdminProduct, AdminCategory, ProductFormData, CategoryFormData, PaginatedProducts TypeScript types
- `trotinette-frontend/src/features/admin/api/products.ts` - useAdminProducts, useAdminProduct, useCreateProduct, useUpdateProduct, useDeleteProduct, useDeleteProductImage TanStack Query hooks
- `trotinette-frontend/src/features/admin/api/categories.ts` - useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory hooks
- `trotinette-frontend/src/features/admin/components/ImageUploader.tsx` - Multi-image uploader with existing server images + new file previews, max 10 total
- `trotinette-frontend/src/features/admin/components/ProductForm.tsx` - RHF+Zod product form: 5 sections (basic info, FR/EN translations, specs, images), auto-slug, loading states
- `trotinette-frontend/src/features/admin/components/CategoryForm.tsx` - RHF+Zod category form: FR/EN names, slug (auto from FR name), active toggle
- `trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx` - Product table with inline InlineStockEditor, visibility Chip toggle, DeleteDialog confirmation
- `trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx` - Create/edit page using useParams to detect create vs edit mode
- `trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx` - Category table with Dialog-based CRUD and delete guard for categories with products
- `trotinette-frontend/src/app/router.tsx` - Added 4 admin routes, merged alongside 02-02 storefront catalog routes
- `trotinette-frontend/src/locales/fr/translation.json` - Added admin.products.* and admin.categories.* translation keys (merged)
- `trotinette-frontend/src/locales/en/translation.json` - Added admin.products.* and admin.categories.* translation keys (merged)

## Decisions Made

- FormData with `Content-Type: undefined` override — the global apiClient defaults to `application/json`; overriding to `undefined` lets the browser set `multipart/form-data` with the correct multipart boundary on image upload requests.
- POST + `_method=PATCH` for product updates with FormData — Laravel's routing system doesn't parse multipart/form-data for PATCH requests; spoofing via `_method` field is the standard Laravel workaround.
- Dual query invalidation (`['admin', 'products']` AND `['products']`) — ensures the storefront catalog reflects admin changes immediately without requiring a page reload or manual refresh.
- Dialog-based CRUD for categories vs. separate edit page for products — categories are 3-field forms; products have 20+ fields across 5 sections. Separate pages give better UX for complex forms.
- Auto-slug with manual-override detection — boolean flags `frSlugManual`/`enSlugManual` track whether the user has typed in the slug field; auto-generation only fires when the user hasn't overridden it.
- Zod v4 uses `{ error: '...' }` instead of `{ invalid_type_error: '...' }` — this was auto-corrected by the linter during execution (Zod v4.3.6 breaking API change from v3).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] CategoryForm created in Task 1 scope**
- **Found during:** Task 1 (AdminCategoriesPage references CategoryForm)
- **Issue:** AdminCategoriesPage.tsx (created in Task 1 for the router placeholder) imports CategoryForm which is planned for Task 2. Creating a stub would cause a build error.
- **Fix:** Created CategoryForm.tsx fully during Task 1 so AdminCategoriesPage could compile. Task 2 then committed both files together (no rework needed).
- **Files modified:** trotinette-frontend/src/features/admin/components/CategoryForm.tsx
- **Verification:** npm run build passes without TypeScript errors
- **Committed in:** ee7a63e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (dependency ordering — CategoryForm created early to unblock build)
**Impact on plan:** Zero scope creep — CategoryForm was always Task 2 work; it was simply created during Task 1 execution because AdminCategoriesPage requires it at compile time. Committed in Task 2's commit.

## Issues Encountered

- **Parallel agent conflict on router.tsx:** The 02-02 storefront agent had already updated router.tsx to add CatalogPage and ProductDetailPage routes when this agent went to write its admin routes. Used Read + Edit (not Write) to merge admin routes into the 02-02 changes without overwriting them.
- **Zod v4 API change:** `z.number({ invalid_type_error: '...' })` was auto-corrected by linter to `z.number({ error: '...' })` — Zod v4 changed this parameter name. Build still passed.

## User Setup Required

None - no external service configuration required. Admin UI connects to the same backend API as the storefront. MySQL must be started manually before API requests: `"C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqld.exe" --datadir="C:/Users/User/mysql-data" --console &`

## Next Phase Readiness

- Admin product and category management fully wired to the backend API from 02-01
- All mutations invalidate both admin and customer query caches — storefront updates immediately
- Admin routes are at /admin/products and /admin/categories — currently unguarded (auth guards come in Phase 3)
- Phase 3 can add an auth guard wrapping the admin routes without any changes to the admin page components themselves

---
*Phase: 02-product-catalog*
*Completed: 2026-02-16*

## Self-Check: PASSED

- All 9 key files verified present on disk
- All 2 task commits verified in git log (d97353f, ee7a63e)
- Build passes: `npm run build` — 0 TypeScript errors, 841 modules transformed
- router.tsx successfully merged with 02-02 storefront routes (no overwrites)
