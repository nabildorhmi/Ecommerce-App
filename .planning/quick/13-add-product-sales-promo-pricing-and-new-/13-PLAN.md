---
phase: quick-13
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  # Backend
  - trotinette-api/database/migrations/2026_02_28_000001_add_promo_price_and_is_new_to_products_table.php
  - trotinette-api/app/Models/Product.php
  - trotinette-api/app/Http/Resources/ProductResource.php
  - trotinette-api/app/Http/Controllers/Customer/ProductController.php
  - trotinette-api/app/Services/ProductService.php
  - trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php
  - trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php
  # Frontend
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
autonomous: true
must_haves:
  truths:
    - "Admin can set a promo_price (in MAD) and is_new flag on any product via the edit form"
    - "ProductCard shows a red/orange PROMO badge when product is on sale, and a green NOUVEAU badge when is_new"
    - "ProductCard shows strikethrough original price + highlighted promo price when on sale"
    - "Navbar has Promos and Nouveautes links that navigate to filtered catalog views"
    - "Catalog FilterBar has toggles for promo and new products"
    - "Product detail page shows promo pricing with strikethrough original"
    - "API returns is_on_sale computed field and supports is_on_sale and is_new filters"
  artifacts:
    - path: "trotinette-api/database/migrations/2026_02_28_000001_add_promo_price_and_is_new_to_products_table.php"
      provides: "DB columns promo_price and is_new on products table"
    - path: "trotinette-frontend/src/features/catalog/components/ProductCard.tsx"
      provides: "PROMO and NOUVEAU badges, dual price display"
  key_links:
    - from: "ProductResource"
      to: "Product model"
      via: "is_on_sale computed from promo_price !== null && promo_price < price"
    - from: "Navbar Promos link"
      to: "/products?filter[is_on_sale]=1"
      via: "React Router Link"
    - from: "Customer ProductController"
      to: "QueryBuilder filters"
      via: "AllowedFilter for is_new and is_on_sale"
---

<objective>
Add promo/sale pricing and "New" product tagging across the full stack: migration, model, API resource, filters, admin form, catalog badges, navbar links, and filter toggles.

Purpose: Allow admin to mark products as new or on promo, with automatic badge display and dedicated navigation links for customers.
Output: Working promo_price + is_new system end-to-end.
</objective>

<context>
@trotinette-api/app/Models/Product.php
@trotinette-api/app/Http/Resources/ProductResource.php
@trotinette-api/app/Http/Controllers/Customer/ProductController.php
@trotinette-api/app/Services/ProductService.php
@trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php
@trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php
@trotinette-frontend/src/features/catalog/types.ts
@trotinette-frontend/src/features/admin/types.ts
@trotinette-frontend/src/features/catalog/components/ProductCard.tsx
@trotinette-frontend/src/features/catalog/api/products.ts
@trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts
@trotinette-frontend/src/features/catalog/components/FilterBar.tsx
@trotinette-frontend/src/shared/components/Navbar.tsx
@trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
@trotinette-frontend/src/features/admin/components/ProductForm.tsx
@trotinette-frontend/src/features/admin/api/products.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Backend — migration, model, resource, filters, validation</name>
  <files>
    trotinette-api/database/migrations/2026_02_28_000001_add_promo_price_and_is_new_to_products_table.php
    trotinette-api/app/Models/Product.php
    trotinette-api/app/Http/Resources/ProductResource.php
    trotinette-api/app/Http/Controllers/Customer/ProductController.php
    trotinette-api/app/Services/ProductService.php
    trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php
    trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php
  </files>
  <action>
    1. **Migration** — Create migration `2026_02_28_000001_add_promo_price_and_is_new_to_products_table.php`:
       - Add `promo_price` as `unsignedInteger()->nullable()->after('price')` (value in centimes, like price)
       - Add `is_new` as `boolean()->default(false)->after('promo_price')`
       - Down: drop both columns

    2. **Product model** — Add to `$fillable`: `'promo_price'`, `'is_new'`. Add to `$casts`: `'promo_price' => 'integer'`, `'is_new' => 'boolean'`.

    3. **ProductResource** — Add three fields to the returned array:
       - `'promo_price' => $this->promo_price` (nullable integer in centimes)
       - `'is_new' => (bool) $this->is_new`
       - `'is_on_sale' => $this->promo_price !== null && $this->promo_price < $this->price`
       Place them after `'is_featured'`.

    4. **Customer ProductController** — Add two AllowedFilters to the `allowedFilters` array in `index()`:
       - `AllowedFilter::exact('is_new')` — filters products where is_new = true
       - `AllowedFilter::callback('is_on_sale', fn ($query, $value) => $query->when((bool) $value, fn ($q) => $q->whereNotNull('promo_price')->whereColumn('promo_price', '<', 'price')))` — filters products currently on sale

    5. **ProductService** — In `createProduct()`, add to the `Product::create([...])` array:
       - `'promo_price' => $data['promo_price'] ?? null`
       - `'is_new' => $data['is_new'] ?? false`
       In `updateProduct()`, add to the `array_filter([...])` array:
       - `'promo_price' => array_key_exists('promo_price', $data) ? $data['promo_price'] : null` (use array_key_exists because null is a valid value to clear promo)
       - `'is_new' => $data['is_new'] ?? null`
       IMPORTANT: For promo_price in updateProduct, it must NOT be filtered out by `array_filter` when the value is explicitly null (to allow clearing promo). Handle this by setting promo_price separately after the main update if the key exists in $data:
       ```php
       if (array_key_exists('promo_price', $data)) {
           $product->update(['promo_price' => $data['promo_price']]);
       }
       ```

    6. **StoreProductRequest** — Add rules:
       - `'promo_price' => 'nullable|integer|min:0'`
       - `'is_new' => 'boolean'`

    7. **UpdateProductRequest** — Add rules:
       - `'promo_price' => 'sometimes|nullable|integer|min:0'`
       - `'is_new' => 'sometimes|boolean'`

    8. **Run migration**: `php artisan migrate` from trotinette-api directory.
  </action>
  <verify>
    Run `php artisan migrate` successfully. Then test with:
    - `curl http://localhost:8000/api/products` — response should include `promo_price`, `is_new`, `is_on_sale` fields on each product.
    - Verify is_on_sale is false when promo_price is null.
  </verify>
  <done>Migration applied, Product model has promo_price/is_new in fillable+casts, ProductResource returns promo_price/is_new/is_on_sale, Customer ProductController supports is_new and is_on_sale filters, validation requests accept the new fields, ProductService handles create/update with promo_price (including null clearing) and is_new.</done>
</task>

<task type="auto">
  <name>Task 2: Frontend — types, badges, prices, navbar links, admin form, filters</name>
  <files>
    trotinette-frontend/src/features/catalog/types.ts
    trotinette-frontend/src/features/admin/types.ts
    trotinette-frontend/src/features/catalog/components/ProductCard.tsx
    trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    trotinette-frontend/src/features/catalog/api/products.ts
    trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts
    trotinette-frontend/src/features/catalog/components/FilterBar.tsx
    trotinette-frontend/src/shared/components/Navbar.tsx
    trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
    trotinette-frontend/src/features/admin/components/ProductForm.tsx
    trotinette-frontend/src/features/admin/api/products.ts
  </files>
  <action>
    **Types:**

    1. **catalog/types.ts** — Add to `Product` interface: `promo_price: number | null;`, `is_new: boolean;`, `is_on_sale: boolean;` (after `is_featured`). Add to `CatalogFilters`: `'filter[is_new]'?: string;`, `'filter[is_on_sale]'?: string;`.

    2. **admin/types.ts** — Add to `AdminProduct` interface: `promo_price: number | null;`, `is_new: boolean;`, `is_on_sale: boolean;` (after `is_featured`).

    **ProductCard badges and pricing:**

    3. **ProductCard.tsx** — Add badges in the image area (positioned top-left, stacked vertically with gap):
       - If `product.is_on_sale`: Show a "PROMO" `Chip` with `backgroundColor: 'rgba(255,107,53,0.15)'`, `color: '#FF6B35'`, `border: '1px solid rgba(255,107,53,0.3)'` — same sizing pattern as existing "Vedette" chip. Position: top 10, left 10, zIndex 1.
       - If `product.is_new`: Show a "NOUVEAU" `Chip` with `backgroundColor: 'rgba(0,200,83,0.15)'`, `color: '#00C853'`, `border: '1px solid rgba(0,200,83,0.3)'`. Position below PROMO if both present (use a Stack or flex column with gap 0.5 at top-left for all left badges including Vedette).
       - Refactor the badge area: Create a flex column container at `position: absolute, top: 10, left: 10, zIndex: 1, gap: 0.5` that holds Vedette, PROMO, and NOUVEAU chips conditionally.

       For pricing section: When `product.is_on_sale` is true, show the original price with strikethrough (small, gray, `textDecoration: 'line-through'`) and the promo_price as the main price in a warm color (use `#FF6B35` instead of `#00C2FF` for the promo price badge background: `rgba(255,107,53,0.08)` bg, `rgba(255,107,53,0.2)` border). When not on sale, show normal price as before.

    **Product Detail Page:**

    4. **ProductDetailPage.tsx** — Find the price display section. When `product.is_on_sale`: show original price with strikethrough styling + "PROMO" label, then the promo_price as the prominent price. Also show a "NOUVEAU" chip near the product name if `product.is_new`. Use same color scheme as ProductCard badges.

    **API & Filters:**

    5. **catalog/api/products.ts** — In `useProducts`, add filter forwarding for the two new params:
       ```
       if (filters['filter[is_new]']) params['filter[is_new]'] = filters['filter[is_new]']!;
       if (filters['filter[is_on_sale]']) params['filter[is_on_sale]'] = filters['filter[is_on_sale]']!;
       ```

    6. **useCatalogFilters.ts** — Add to the filters object:
       ```
       'filter[is_new]': searchParams.get('filter[is_new]') ?? '',
       'filter[is_on_sale]': searchParams.get('filter[is_on_sale]') ?? '',
       ```

    7. **FilterBar.tsx** — Add two `Switch` toggles after the existing "En stock uniquement" toggle:
       - "Promotions" toggle: controls `filter[is_on_sale]` = '1' or ''
       - "Nouveautes" toggle: controls `filter[is_new]` = '1' or ''
       Add these filters to the `hasActiveFilters` check.

    **Navbar:**

    8. **Navbar.tsx** — In the desktop nav (the `Box` with `display: { xs: 'none', md: 'flex' }}`), add two `Button` links AFTER the "TOUS LES PRODUITS" button and BEFORE the categories dropdown:
       - "PROMOS" button: `component={Link} to="/products?filter[is_on_sale]=1"` — use `#FF6B35` as the active/highlight color instead of `#00C2FF`. Active when URL contains `is_on_sale`.
       - "NOUVEAUTES" button: `component={Link} to="/products?filter[is_new]=1"` — use `#00C853` as the active/highlight color. Active when URL contains `is_new`.
       Same styling pattern as existing nav buttons (fontSize 0.75rem, fontWeight 600, letterSpacing 0.08em).

       In the mobile drawer `Stack`, add the same two links after "TOUS LES PRODUITS" button and before the categories section divider. Same color scheme.

    **Admin:**

    9. **AdminProductsPage.tsx** — Add a "Promo" column in the table between "Prix" and "Stock":
       - Show promo price (formatted) if set, or "—" if null
       - If on sale, show the original price strikethrough + promo price
       Add an "is_new" toggle icon button (similar pattern to the is_featured star toggle) using a `FiberNewIcon` or `NewReleasesIcon` from MUI icons. Place it in a column after "Vedette".

    10. **ProductForm.tsx** — Add two fields in the "Informations de base" section:
        - `promo_price` number field: label "Prix promo (MAD)", nullable. Place after the Prix field in the grid. Default value: `product ? (product.promo_price !== null ? product.promo_price / 100 : '') : ''`. On submit, convert to centimes (multiply by 100) or null if empty.
        - `is_new` Switch toggle: label "Nouveau produit", after the "En vedette" switch. Default: `product?.is_new ?? false`.

        Update the Zod schema:
        - Add `promo_price: z.union([z.number().min(0), z.literal('')]).optional()` (allow empty string for "no promo")
        - Add `is_new: z.boolean()`

        Update defaultValues, onSubmit payload to include promo_price (convert MAD to centimes, or null if empty) and is_new.

    11. **admin/api/products.ts** — Update `buildProductFormData` to handle:
        - `promo_price?: number | null` — if number, append as string. If null, append `'promo_price'` with empty string or don't append (let backend handle null). Actually, for clearing promo, append `promo_price` as empty string so it appears in $data. Add to FormData: `if (data.promo_price !== undefined) fd.append('promo_price', data.promo_price !== null ? String(data.promo_price) : '');`
        - `is_new?: boolean` — append as '1' or '0' like is_active.

        Update `CreateProductInput` and `UpdateProductInput` interfaces to include `promo_price?: number | null` (in MAD) and `is_new?: boolean`.

        In `useCreateProduct` mutationFn, add promo_price conversion: `promo_price: input.promo_price != null ? Math.round(input.promo_price * 100) : null`.
        In `useUpdateProduct` mutationFn, add same conversion for promo_price.
  </action>
  <verify>
    Run `npm run build` from trotinette-frontend to verify no TypeScript errors. Start the dev server and visually confirm:
    - Admin product edit form shows promo_price and is_new fields
    - Setting a promo price on a product shows PROMO badge on the catalog card
    - Setting is_new shows NOUVEAU badge
    - Navbar shows PROMOS and NOUVEAUTES links
    - Clicking those links navigates to filtered catalog views
    - FilterBar shows promo and new toggles
  </verify>
  <done>All frontend components updated: Product/AdminProduct types include promo_price/is_new/is_on_sale, ProductCard shows PROMO (orange) and NOUVEAU (green) badges with dual pricing, ProductDetailPage shows promo pricing, Navbar has Promos and Nouveautes nav links, FilterBar has promo/new toggles, admin form has promo_price field and is_new switch, admin products table shows promo column and new toggle.</done>
</task>

</tasks>

<verification>
- `php artisan migrate` succeeds
- `npm run build` passes with no errors
- GET /api/products returns promo_price, is_new, is_on_sale on each product
- GET /api/products?filter[is_on_sale]=1 returns only products with valid promo pricing
- GET /api/products?filter[is_new]=1 returns only new products
- Admin can set/clear promo_price and toggle is_new on product edit form
- ProductCard shows correct badges and price display
- Navbar PROMOS and NOUVEAUTES links work
</verification>

<success_criteria>
Full promo pricing and "new" tag system working end-to-end: admin can manage promo_price and is_new, customers see badges and filtered views, navbar provides quick access to promos and new products.
</success_criteria>

<output>
After completion, create `.planning/quick/13-add-product-sales-promo-pricing-and-new-/13-SUMMARY.md`
</output>
