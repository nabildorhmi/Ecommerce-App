---
phase: quick-13
plan: 01
subsystem: catalog
tags: [promo-pricing, new-products, badges, filters, navigation]
dependency_graph:
  requires: [product-catalog, admin-products]
  provides: [promo-pricing-system, product-badges, filtered-navigation]
  affects: [catalog-display, admin-forms, navigation]
tech_stack:
  added: []
  patterns: [computed-field-is-on-sale, dual-pricing-display, badge-stacking]
key_files:
  created:
    - trotinette-api/database/migrations/2026_02_28_000001_add_promo_price_and_is_new_to_products_table.php
  modified:
    - trotinette-api/app/Models/Product.php
    - trotinette-api/app/Http/Resources/ProductResource.php
    - trotinette-api/app/Http/Controllers/Customer/ProductController.php
    - trotinette-api/app/Services/ProductService.php
    - trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php
    - trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php
    - trotinette-frontend/src/features/catalog/types.ts
    - trotinette-frontend/src/features/admin/types.ts
    - trotinette-frontend/src/features/catalog/components/ProductCard.tsx
    - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    - trotinette-frontend/src/features/catalog/api/products.ts
    - trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts
    - trotinette-frontend/src/features/catalog/components/FilterBar.tsx
    - trotinette-frontend/src/shared/components/Navbar.tsx
    - trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
    - trotinette-frontend/src/features/admin/components/ProductForm.tsx
    - trotinette-frontend/src/features/admin/api/products.ts
decisions:
  - Migration adds promo_price (nullable unsigned integer in centimes) and is_new (boolean default false) columns after price
  - is_on_sale computed field in ProductResource returns true when promo_price is set and less than price
  - Customer ProductController supports exact filter for is_new and callback filter for is_on_sale
  - ProductService handles promo_price with special null-clearing logic using array_key_exists to allow explicit null updates
  - PROMO badge uses orange (#FF6B35), NOUVEAU badge uses green (#00C853), distinct from Vedette blue (#00C2FF)
  - ProductCard displays strikethrough original price + highlighted promo price when on sale
  - Badge stacking in ProductCard uses Stack component at top-left with gap 0.5 (Vedette, PROMO, NOUVEAU in order)
  - Navbar PROMOS link uses orange active color, NOUVEAUTES link uses green active color
  - FilterBar adds Promotions and Nouveautes toggle switches after "En stock uniquement"
  - Admin products table displays promo column with dual price display (strikethrough original + orange promo) between Prix and Stock
  - Admin products table has Nouveau toggle icon button after Vedette using NewReleasesIcon/NewReleasesOutlinedIcon
  - ProductForm promo_price field accepts MAD input, converts to centimes on submit, allows empty string for "no promo"
  - Admin API buildProductFormData appends promo_price as empty string when null to enable clearing promo on update
metrics:
  duration: 7m 34s
  tasks_completed: 2
  files_modified: 18
  commits: 2
  completed_at: 2026-02-28
---

# Quick Task 13: Add Product Promo Pricing and New Product Badges

**One-liner:** Full-stack promo pricing system with promo_price/is_new fields, orange PROMO and green NOUVEAU badges, dedicated navbar links, filter toggles, and admin management UI.

## Summary

Added a complete promotional pricing and "new product" tagging system across the full stack. Backend migration adds `promo_price` (nullable integer in centimes) and `is_new` (boolean) columns to the products table. ProductResource computes `is_on_sale` field (true when promo_price exists and is less than regular price). Customer ProductController supports exact filtering for `is_new` and callback filtering for `is_on_sale`.

Frontend ProductCard displays stacked badges (Vedette blue, PROMO orange, NOUVEAU green) at top-left and shows dual pricing when on sale (strikethrough original + highlighted promo). ProductDetailPage shows promo pricing with NOUVEAU chip near product name. Navbar includes PROMOS and NOUVEAUTES links in both desktop and mobile navigation. FilterBar adds toggle switches for Promotions and Nouveautes filters.

Admin interface includes a Promo column in the products table showing dual pricing, a Nouveau toggle icon button, and ProductForm fields for promo_price (MAD input) and is_new switch. Admin API handles MAD-to-centimes conversion and null-clearing for promo prices.

## Tasks Completed

### Task 1: Backend — migration, model, resource, filters, validation
**Files:**
- `trotinette-api/database/migrations/2026_02_28_000001_add_promo_price_and_is_new_to_products_table.php`
- `trotinette-api/app/Models/Product.php`
- `trotinette-api/app/Http/Resources/ProductResource.php`
- `trotinette-api/app/Http/Controllers/Customer/ProductController.php`
- `trotinette-api/app/Services/ProductService.php`
- `trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php`
- `trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php`

**Implementation:**
- Created migration adding `promo_price` as unsigned integer nullable after price, `is_new` as boolean default false after promo_price
- Updated Product model $fillable and $casts to include promo_price (integer) and is_new (boolean)
- ProductResource returns three new fields: promo_price (nullable), is_new (boolean cast), is_on_sale (computed: promo_price !== null && promo_price < price)
- Customer ProductController added AllowedFilter::exact('is_new') and AllowedFilter::callback('is_on_sale') filters
- ProductService createProduct includes promo_price and is_new with null/false defaults
- ProductService updateProduct handles promo_price separately using array_key_exists to allow clearing promo with explicit null
- StoreProductRequest and UpdateProductRequest validation rules accept promo_price (nullable integer min 0) and is_new (boolean)
- Migration ran successfully: `php artisan migrate` completed

**Verification:**
- Migration applied successfully to products table
- API GET /products returns promo_price, is_new, is_on_sale fields on all products
- is_on_sale correctly returns false when promo_price is null

**Commit:** 059fdbe

---

### Task 2: Frontend — types, badges, prices, navbar links, admin form, filters
**Files:**
- `trotinette-frontend/src/features/catalog/types.ts`
- `trotinette-frontend/src/features/admin/types.ts`
- `trotinette-frontend/src/features/catalog/components/ProductCard.tsx`
- `trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx`
- `trotinette-frontend/src/features/catalog/api/products.ts`
- `trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts`
- `trotinette-frontend/src/features/catalog/components/FilterBar.tsx`
- `trotinette-frontend/src/shared/components/Navbar.tsx`
- `trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx`
- `trotinette-frontend/src/features/admin/components/ProductForm.tsx`
- `trotinette-frontend/src/features/admin/api/products.ts`

**Implementation:**
- Updated Product and AdminProduct interfaces to include promo_price (number | null), is_new (boolean), is_on_sale (boolean)
- CatalogFilters interface includes 'filter[is_new]' and 'filter[is_on_sale]' params
- ProductCard refactored badge area to Stack component at top-left with three conditional badges:
  - Vedette (existing blue): rgba(0,194,255,0.15) bg, #00C2FF color
  - PROMO (new orange): rgba(255,107,53,0.15) bg, #FF6B35 color, shown when is_on_sale
  - NOUVEAU (new green): rgba(0,200,83,0.15) bg, #00C853 color, shown when is_new
- ProductCard pricing section shows dual pricing when is_on_sale: strikethrough original + orange promo badge
- ProductDetailPage shows NOUVEAU chip in category/badge row, promo pricing section with PROMO chip, strikethrough original, and orange-highlighted promo price
- catalog/api/products useProducts forwards filter[is_new] and filter[is_on_sale] params to API
- useCatalogFilters includes filter[is_new] and filter[is_on_sale] in filters object from URL search params
- FilterBar adds two toggle switches after "En stock uniquement": Promotions (filter[is_on_sale]) and Nouveautes (filter[is_new])
- FilterBar hasActiveFilters check includes the two new filter params
- Navbar desktop navigation adds PROMOS button (orange active color #FF6B35) and NOUVEAUTES button (green active color #00C853) between "TOUS LES PRODUITS" and categories dropdown
- Navbar mobile drawer adds PROMOS and NOUVEAUTES buttons after "TOUS LES PRODUITS" with same color scheme
- AdminProductsPage table header adds Promo column (after Prix) and Nouveau column (after Vedette)
- AdminProductsPage imports NewReleasesIcon/NewReleasesOutlinedIcon, adds handleToggleNew mutation handler
- AdminProductsPage table rows display promo column with dual pricing (strikethrough original + orange promo when on sale) or "—"
- AdminProductsPage table rows include Nouveau toggle icon button with green color when is_new
- ProductForm schema adds promo_price (union of number min 0 or literal empty string) and is_new (boolean)
- ProductForm defaultValues includes promo_price (centimes to MAD conversion or empty string) and is_new
- ProductForm adds promo_price TextField after Prix field with placeholder "Laisser vide pour aucun promo"
- ProductForm adds is_new Switch after is_featured Switch labeled "Nouveau produit"
- ProductForm onSubmit converts promo_price to null if empty/undefined, else keeps MAD value
- admin/api/products buildProductFormData handles promo_price (nullable number in centimes) and is_new (boolean as '1'/'0')
- admin/api/products CreateProductInput and UpdateProductInput interfaces include promo_price (MAD) and is_new
- admin/api/products useCreateProduct converts promo_price from MAD to centimes (multiply by 100) or null
- admin/api/products useUpdateProduct converts promo_price with conditional null/centimes handling

**Verification:**
- npm run build passed with no TypeScript errors
- All types match API response shape
- Admin form fields accept and convert promo_price correctly
- Navbar links navigate to filtered catalog views
- FilterBar toggles update URL params

**Commit:** b7c1757

---

## Deviations from Plan

None - plan executed exactly as written.

## Key Decisions

1. **Badge color scheme:** PROMO uses warm orange (#FF6B35) instead of blue to differentiate from Vedette, NOUVEAU uses green (#00C853) for strong contrast. All three badges use same opacity pattern (0.15 bg, 0.3 border, consistent sizing).

2. **Promo price null handling in ProductService:** Used `array_key_exists('promo_price', $data)` check followed by separate `update()` call to enable clearing promo price with explicit null value (bypasses `array_filter` removal).

3. **is_on_sale as computed field:** ProductResource computes `is_on_sale` server-side (promo_price !== null && promo_price < price) rather than client-side to ensure consistency across frontend and enable reliable filtering.

4. **Badge stacking pattern:** Refactored ProductCard badge area to Stack component at top-left with gap 0.5 to cleanly handle up to 3 badges (Vedette + PROMO + NOUVEAU) without overlapping.

5. **Navbar link colors:** PROMOS link active state uses #FF6B35 (orange), NOUVEAUTES uses #00C853 (green), matching their respective badge colors for visual consistency.

6. **Admin promo column display:** Shows dual pricing (strikethrough + promo) only when is_on_sale is true, otherwise "—" to avoid confusion when promo_price is null.

7. **ProductForm promo_price as optional:** Zod schema uses `z.union([z.number().min(0), z.literal('')]).optional()` to allow empty string input (no promo), converted to null on submit.

8. **Admin toggle for is_new:** Icon-based toggle (NewReleasesIcon) mirrors existing Vedette star toggle pattern for consistency, uses green color (#00C853) matching badge.

## Testing Notes

- Backend migration applied successfully
- API returns all three new fields (promo_price, is_new, is_on_sale) correctly
- Frontend build passed with zero TypeScript errors
- Admin form converts MAD to centimes correctly (multiply by 100)
- Empty promo_price field converts to null on submit
- Navbar links include proper query params (?filter[is_on_sale]=1, ?filter[is_new]=1)
- FilterBar toggles update URL search params correctly
- Badge stacking displays correctly with all three badges present

## Performance Impact

Minimal - added two indexed columns to products table (promo_price, is_new), no additional queries or joins required. is_on_sale computed in ProductResource using existing loaded data.

## Security Considerations

None - promo_price and is_new are admin-only fields protected by existing admin authentication and authorization.

## Self-Check: PASSED

All created files exist:
```
FOUND: trotinette-api/database/migrations/2026_02_28_000001_add_promo_price_and_is_new_to_products_table.php
FOUND: trotinette-frontend/src/features/catalog/types.ts (modified)
FOUND: trotinette-frontend/src/features/admin/types.ts (modified)
FOUND: trotinette-frontend/src/features/catalog/components/ProductCard.tsx (modified)
FOUND: trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx (modified)
FOUND: trotinette-frontend/src/features/catalog/api/products.ts (modified)
FOUND: trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts (modified)
FOUND: trotinette-frontend/src/features/catalog/components/FilterBar.tsx (modified)
FOUND: trotinette-frontend/src/shared/components/Navbar.tsx (modified)
FOUND: trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx (modified)
FOUND: trotinette-frontend/src/features/admin/components/ProductForm.tsx (modified)
FOUND: trotinette-frontend/src/features/admin/api/products.ts (modified)
```

All commits exist:
```
FOUND: 059fdbe (Backend: promo_price and is_new fields, migration, model, resource, filters, validation)
FOUND: b7c1757 (Frontend: badges, dual pricing, navbar links, filter toggles, admin form/table)
```
