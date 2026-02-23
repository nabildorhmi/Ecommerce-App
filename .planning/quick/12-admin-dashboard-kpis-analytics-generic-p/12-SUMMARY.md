---
phase: quick-12
plan: 01
subsystem: admin-analytics-variations
tags: [dashboard, kpis, analytics, product-variations, generic-system]
dependency_graph:
  requires: [order-backend, product-backend, category-backend]
  provides: [dashboard-api, dashboard-ui, variation-types-crud, product-variants-crud]
  affects: [admin-dashboard, product-management]
tech_stack:
  added: [recharts]
  patterns: [server-side-aggregation, chart-components, generic-variation-system]
key_files:
  created:
    - trotinette-api/app/Services/DashboardService.php
    - trotinette-api/app/Http/Controllers/Admin/DashboardController.php
    - trotinette-api/app/Models/VariationType.php
    - trotinette-api/app/Models/VariationValue.php
    - trotinette-api/app/Models/ProductVariant.php
    - trotinette-api/app/Http/Controllers/Admin/VariationTypeController.php
    - trotinette-api/app/Http/Controllers/Admin/ProductVariantController.php
    - trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx
    - trotinette-frontend/src/features/admin/api/dashboard.ts
    - trotinette-frontend/src/features/admin/api/variations.ts
  modified:
    - trotinette-api/app/Models/Product.php
    - trotinette-api/routes/api.php
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/features/admin/types.ts
decisions:
  - "Generic variation system with dynamic types instead of hardcoded color/size fields — allows any variation dimension"
  - "Server-side SQL aggregation for all dashboard KPIs — no PHP loops, handles large datasets efficiently"
  - "Recharts for dashboard charts — lightweight, responsive, integrates well with React"
  - "Box with CSS Grid for dashboard layout instead of MUI Grid — MUI v7 Grid API deprecation required simpler approach"
  - "Product variants with optional price override and SKU — flexibility for variant-specific pricing"
  - "Variation types cascade delete to values, but protect if values are used in product_variant_values — prevents orphaned product variants"
metrics:
  duration: "11 minutes"
  tasks_completed: 4
  tasks_partial: 2
  completed_date: "2026-02-23"
status: partial
---

# Quick Task 12: Admin Dashboard KPIs + Generic Product Variations

**One-liner:** Admin dashboard with KPIs (orders, revenue, AOV, best products/categories, new customers), charts, filtering, and backend for generic product variation system (color, size, battery, etc.) with full CRUD APIs.

## Completion Status

**Completed (4/6 tasks):**
1. Product variations database schema and models
2. Product variations backend API (CRUD for types and variants)
3. Dashboard backend service and API
4. Dashboard frontend page with KPIs and charts

**Partial (2/6 tasks):**
5. Product variations frontend — API hooks created, UI pages not implemented
6. Navbar integration + storefront variant display — not started

## What Was Built

### Dashboard Feature (Complete)

**Backend:**
- `DashboardService` with server-side SQL aggregation for all KPIs
- Filter support: date range, month, year, status
- KPIs: total orders, orders by status, revenue, AOV, best products, best categories, new customers
- Monthly stats and yearly stats for charts
- `DashboardController` validates filters and returns JSON

**Frontend:**
- AdminDashboardPage at `/admin` (replaced Navigate redirect)
- KPI cards: Commandes totales, Chiffre d'affaires, Panier moyen, Nouveaux clients
- 5 charts using recharts:
  - Status distribution (PieChart)
  - Monthly revenue (BarChart)
  - Monthly orders (LineChart)
  - Best-selling products (Horizontal BarChart)
  - Best-selling categories by revenue (Horizontal BarChart)
- Filter bar: date from/to, month, year, status
- Responsive layout using Box with CSS Grid (MUI v7 compatibility)

### Product Variations Feature (Backend Complete)

**Database Schema:**
- `variation_types` table: id, name (unique), timestamps
- `variation_values` table: id, variation_type_id (FK cascade), value, timestamps — unique (type_id, value)
- `product_variants` table: id, product_id (FK cascade), sku (nullable unique), price_override (centimes nullable), stock_quantity, is_active, timestamps
- `product_variant_values` pivot: product_variant_id, variation_value_id — unique pair

**Models:**
- `VariationType` hasMany `VariationValue`
- `VariationValue` belongsTo `VariationType`
- `ProductVariant` belongsTo `Product`, belongsToMany `VariationValue`
- `Product` hasMany `ProductVariant`

**Backend API:**
- `GET /admin/variation-types` — list all types with values
- `POST /admin/variation-types` — create type with optional values array
- `PUT /admin/variation-types/{id}` — update name + sync values (protect used values)
- `DELETE /admin/variation-types/{id}` — abort 422 if values are used in product_variant_values

- `GET /admin/products/{product}/variants` — list product's variants with values
- `POST /admin/products/{product}/variants` — create variant with variation_value_ids, price override, stock, sku
- `PUT /admin/products/{product}/variants/{variant}` — update variant
- `DELETE /admin/products/{product}/variants/{variant}` — delete variant

- Admin ProductController `show()` now eager-loads `variants.values.type`

**Frontend API Hooks (Partial):**
- `useVariationTypes`, `useCreateVariationType`, `useUpdateVariationType`, `useDeleteVariationType`
- `useProductVariants`, `useCreateProductVariant`, `useUpdateProductVariant`, `useDeleteProductVariant`
- All hooks with proper React Query cache invalidation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed import paths in dashboard files**
- **Found during:** Task 4 build
- **Issue:** Used `@/shared/lib/apiClient` path which doesn't exist in project
- **Fix:** Changed to `../../../shared/api/client` matching project structure
- **Files modified:** dashboard.ts, AdminDashboardPage.tsx
- **Commit:** b2892c1

**2. [Rule 1 - Bug] Replaced MUI Grid with Box + CSS Grid**
- **Found during:** Task 4 build
- **Issue:** MUI v7 deprecated old Grid API (`item`, `xs`, `sm` props), Grid2 not exported from @mui/material
- **Fix:** Used Box with `display: 'grid'` and `gridTemplateColumns` for responsive layout
- **Files modified:** AdminDashboardPage.tsx
- **Commit:** b2892c1

## What's Left (Tasks 5 & 6)

### Task 5: Variation Types UI + Product Variant Management

**Admin Variation Types Page (`/admin/variation-types`):**
- Dialog-based CRUD (like AdminCategoriesPage pattern)
- Table listing variation types
- Values shown as Chips
- Dialog fields: name (TextField), values (dynamic list with add/delete per value)
- Edit/delete with confirmation

**Admin Product Edit Page Update:**
- Add "Variantes du produit" section (only when editing existing product, id > 0)
- Table showing existing variants: value labels joined, SKU, Price (effective_price), Stock, Active chip, Actions
- "Ajouter une variante" button opens dialog:
  - For each variation type: Select to pick one value
  - SKU: TextField (optional)
  - Price override: TextField type="number" in MAD (convert to centimes * 100)
  - Stock: TextField type="number" (required)
  - Active: Switch (default true)
- Edit/delete variant dialogs

### Task 6: Navbar + Storefront Variant Display

**Navbar (RootLayout.tsx):**
- Add "Tableau de bord" link to `/admin` (first in admin dropdown, before products)
- Add "Types de variations" link to `/admin/variation-types` (after Pages)

**Backend Customer API:**
- Update customer ProductController `show()` to eager-load `variants.values.type`
- Update customer ProductResource to include variants (filter is_active=true only):
  ```php
  'variants' => $this->whenLoaded('variants', fn() =>
      $this->variants->where('is_active', true)->map(fn($v) => [
          'id' => $v->id,
          'sku' => $v->sku,
          'price' => $v->price_override ?? $this->price,
          'stock_quantity' => $v->stock_quantity,
          'values' => $v->values->map(fn($val) => [
              'type' => $val->type->name,
              'value' => $val->value,
          ]),
      ])->values()
  ),
  ```

**Frontend Storefront (ProductDetailPage):**
- Add `ProductVariantDisplay` interface to catalog/types.ts
- Add `variants?: ProductVariantDisplay[]` to Product type
- If product has variants, show variant selector section above "Add to Cart":
  - For each unique variation type: Chips or ToggleButtonGroup for selecting value
  - On selection change: find matching variant, update displayed price
  - Show variant stock, disable Add to Cart if stock=0
- Store selected variant values in component state
- Pass variant info to cart on "Add to Cart" (optional, prices already snapshotted)

## Verification Checklist

- [x] Dashboard API returns correct KPIs with and without filters
- [x] Dashboard page renders KPI cards and charts
- [x] Filtering works (date range, month, year, status)
- [x] `php artisan migrate` runs without errors (4 new tables)
- [x] Variation types CRUD API routes registered
- [x] Product variants CRUD API routes registered (nested under products)
- [x] Frontend builds without TypeScript errors
- [ ] Variation types CRUD works end-to-end (API + frontend UI)
- [ ] Product edit page shows variant management section
- [ ] Storefront product page shows variant selectors
- [ ] Admin navbar has dashboard and variation types links

## Success Criteria (Partial)

- [x] Admin can visit /admin and see dashboard with KPI cards
- [x] Admin can filter dashboard — data updates accordingly
- [x] All monetary values stored in centimes, displayed in MAD
- [ ] Admin can CRUD variation types with values at /admin/variation-types
- [ ] Admin can add/edit/delete variant combinations on any product's edit page
- [ ] Each variant has optional price override, stock quantity, SKU, and active status
- [ ] Storefront product detail shows variant selectors and updates price/stock dynamically

## Technical Notes

**Dashboard aggregation performance:**
- All KPI calculations use SQL aggregations (SUM, COUNT, groupBy)
- No PHP loops over order collections
- Filters applied at query level before aggregation
- Handles large datasets efficiently

**Variation system flexibility:**
- Admins can create any variation type: Couleur, Taille, Batterie, Puissance, etc.
- Each type can have unlimited values
- Products can have multiple variants combining values from different types
- Price override per variant enables variant-specific pricing
- SKU per variant for inventory tracking

**Frontend chart library:**
- Recharts chosen for lightweight footprint and responsive design
- ResponsiveContainer ensures charts adapt to screen size
- Formatted currency values in tooltips and axes
- Color-coded status distribution for quick visual recognition

## Git Commits

1. **3fad26b** — feat(quick-12): add product variations schema and models
2. **5d67cca** — feat(quick-12): add product variations backend API
3. **afbcf9c** — feat(quick-12): add dashboard backend service and API
4. **b2892c1** — feat(quick-12): add dashboard frontend with KPIs and charts
5. **8fca210** — feat(quick-12): add variation types and API hooks (partial Task 5)

## Next Steps

To complete this quick task:

1. **Implement AdminVariationTypesPage** — Dialog-based CRUD matching AdminCategoriesPage pattern
2. **Update AdminProductEditPage** — Add "Variantes du produit" section with variant table and add/edit/delete dialogs
3. **Update RootLayout navbar** — Add dashboard and variation types links to admin dropdown
4. **Update customer Product API and resource** — Include active variants with values
5. **Update ProductDetailPage** — Add variant selector UI with dynamic price/stock updates

Estimated time to complete: ~20-30 minutes (2 UI pages + nav updates + storefront integration)

## Self-Check: PARTIAL

**Files created (verified):**
- [x] DashboardService.php exists
- [x] DashboardController.php exists
- [x] VariationType.php model exists
- [x] VariationValue.php model exists
- [x] ProductVariant.php model exists
- [x] VariationTypeController.php exists
- [x] ProductVariantController.php exists
- [x] AdminDashboardPage.tsx exists
- [x] dashboard.ts API hooks exist
- [x] variations.ts API hooks exist
- [ ] AdminVariationTypesPage.tsx NOT CREATED (Task 5 incomplete)
- [ ] ProductDetailPage variant selector NOT IMPLEMENTED (Task 6 incomplete)

**Routes verified:**
- [x] `/api/admin/dashboard` route exists
- [x] `/api/admin/variation-types` routes exist
- [x] `/api/admin/products/{product}/variants` routes exist

**Database migrations:**
- [x] variation_types table created
- [x] variation_values table created
- [x] product_variants table created
- [x] product_variant_values table created

**Commits (verified):**
- [x] 3fad26b exists
- [x] 5d67cca exists
- [x] afbcf9c exists
- [x] b2892c1 exists
- [x] 8fca210 exists
