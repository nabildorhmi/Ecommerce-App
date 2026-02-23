---
phase: 12-admin-dashboard-kpis-analytics-generic-p
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-api/database/migrations/2026_02_23_000001_create_variation_types_table.php
  - trotinette-api/database/migrations/2026_02_23_000002_create_variation_values_table.php
  - trotinette-api/database/migrations/2026_02_23_000003_create_product_variants_table.php
  - trotinette-api/database/migrations/2026_02_23_000004_create_product_variant_values_table.php
  - trotinette-api/app/Models/VariationType.php
  - trotinette-api/app/Models/VariationValue.php
  - trotinette-api/app/Models/ProductVariant.php
  - trotinette-api/app/Http/Controllers/Admin/VariationTypeController.php
  - trotinette-api/app/Http/Controllers/Admin/ProductVariantController.php
  - trotinette-api/app/Http/Resources/ProductVariantResource.php
  - trotinette-api/app/Http/Resources/VariationTypeResource.php
  - trotinette-api/app/Http/Requests/Admin/StoreVariationTypeRequest.php
  - trotinette-api/app/Http/Requests/Admin/UpdateVariationTypeRequest.php
  - trotinette-api/app/Http/Requests/Admin/StoreProductVariantRequest.php
  - trotinette-api/app/Http/Requests/Admin/UpdateProductVariantRequest.php
  - trotinette-api/routes/api.php
  - trotinette-api/app/Http/Controllers/Admin/DashboardController.php
  - trotinette-api/app/Services/DashboardService.php
  - trotinette-api/app/Http/Controllers/Admin/ProductController.php
  - trotinette-api/app/Http/Resources/ProductResource.php
  - trotinette-api/app/Models/Product.php
  - trotinette-frontend/src/features/admin/api/dashboard.ts
  - trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx
  - trotinette-frontend/src/features/admin/api/variations.ts
  - trotinette-frontend/src/features/admin/types.ts
  - trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminVariationTypesPage.tsx
  - trotinette-frontend/src/app/router.tsx
autonomous: true
must_haves:
  truths:
    - "Admin sees KPI cards (total orders, revenue, AOV) on dashboard"
    - "Admin can filter dashboard by date range, month, year, status"
    - "Admin sees order status distribution chart"
    - "Admin sees monthly revenue and order count charts"
    - "Admin can manage variation types (CRUD: Color, Size, Battery, etc.)"
    - "Admin can add variant combinations to a product with price override and stock"
    - "Product detail API returns its variants"
  artifacts:
    - path: "trotinette-api/app/Services/DashboardService.php"
      provides: "Server-side KPI aggregation with filtering"
    - path: "trotinette-api/app/Http/Controllers/Admin/DashboardController.php"
      provides: "Dashboard API endpoint"
    - path: "trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx"
      provides: "Dashboard UI with cards, charts, filters"
    - path: "trotinette-api/app/Models/ProductVariant.php"
      provides: "Generic product variant model"
    - path: "trotinette-api/app/Models/VariationType.php"
      provides: "Dynamic variation type model"
  key_links:
    - from: "AdminDashboardPage.tsx"
      to: "/api/admin/dashboard"
      via: "React Query hook"
      pattern: "useAdminDashboard"
    - from: "DashboardController"
      to: "DashboardService"
      via: "constructor injection"
      pattern: "DashboardService"
    - from: "AdminProductEditPage.tsx"
      to: "/api/admin/products/:id/variants"
      via: "React Query hooks"
      pattern: "useProductVariants"
---

<objective>
Implement two features: (1) Admin dashboard with KPIs, charts, and filtering for business analytics; (2) Generic product variations system allowing dynamic variation types and variant combinations per product.

Purpose: Give admins business visibility through KPIs and enable flexible product configuration with variants (color, size, battery, etc.) for any product type.
Output: Dashboard page with KPIs/charts, variation types CRUD, product variant management in product edit page.
</objective>

<context>
@trotinette-api/app/Models/Order.php
@trotinette-api/app/Models/Product.php
@trotinette-api/app/Models/OrderItem.php
@trotinette-api/app/Enums/OrderStatus.php
@trotinette-api/routes/api.php
@trotinette-api/app/Http/Controllers/Admin/OrderController.php
@trotinette-frontend/src/features/orders/api/orders.ts
@trotinette-frontend/src/features/orders/types.ts
@trotinette-frontend/src/features/admin/types.ts
@trotinette-frontend/src/features/admin/api/products.ts
@trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
@trotinette-frontend/src/features/orders/pages/AdminOrdersPage.tsx
@trotinette-frontend/src/app/router.tsx
@trotinette-frontend/src/shared/utils/formatCurrency.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Product Variations — Database schema and models</name>
  <files>
    trotinette-api/database/migrations/2026_02_23_000001_create_variation_types_table.php
    trotinette-api/database/migrations/2026_02_23_000002_create_variation_values_table.php
    trotinette-api/database/migrations/2026_02_23_000003_create_product_variants_table.php
    trotinette-api/database/migrations/2026_02_23_000004_create_product_variant_values_table.php
    trotinette-api/app/Models/VariationType.php
    trotinette-api/app/Models/VariationValue.php
    trotinette-api/app/Models/ProductVariant.php
    trotinette-api/app/Models/Product.php
  </files>
  <action>
    Create 4 migration files and 3 new models for a fully generic variation system:

    **variation_types table:** id, name (string, unique — e.g. "Couleur", "Taille", "Batterie"), timestamps. This is the master list of variation dimensions.

    **variation_values table:** id, variation_type_id (FK to variation_types, cascadeOnDelete), value (string — e.g. "Noir", "Blanc", "S", "M", "L"), timestamps. Unique constraint on (variation_type_id, value).

    **product_variants table:** id, product_id (FK to products, cascadeOnDelete), sku (string, nullable, unique when not null), price_override (unsignedBigInteger, nullable — in centimes, null means use product base price), stock_quantity (unsignedInteger, default 0), is_active (boolean, default true), timestamps.

    **product_variant_values (pivot):** id, product_variant_id (FK to product_variants, cascadeOnDelete), variation_value_id (FK to variation_values, cascadeOnDelete). Unique constraint on (product_variant_id, variation_value_id).

    **Models:**

    VariationType: fillable [name], hasMany VariationValue (relationship: values).

    VariationValue: fillable [variation_type_id, value], belongsTo VariationType (relationship: type).

    ProductVariant: fillable [product_id, sku, price_override, stock_quantity, is_active], casts [price_override => 'integer', stock_quantity => 'integer', is_active => 'boolean'], belongsTo Product, belongsToMany VariationValue via product_variant_values (relationship: values).

    **Update Product model:** Add hasMany ProductVariant (relationship: variants).

    Run `php artisan migrate` after creating all migrations.
  </action>
  <verify>Run `php artisan migrate` — all 4 tables created without errors. Run `php artisan tinker` and verify: `Schema::hasTable('variation_types')`, `Schema::hasTable('variation_values')`, `Schema::hasTable('product_variants')`, `Schema::hasTable('product_variant_values')` all return true.</verify>
  <done>Four tables exist in database. Three new Eloquent models with correct relationships. Product model has `variants` relationship.</done>
</task>

<task type="auto">
  <name>Task 2: Product Variations — Backend API (CRUD + product variants)</name>
  <files>
    trotinette-api/app/Http/Controllers/Admin/VariationTypeController.php
    trotinette-api/app/Http/Controllers/Admin/ProductVariantController.php
    trotinette-api/app/Http/Resources/VariationTypeResource.php
    trotinette-api/app/Http/Resources/ProductVariantResource.php
    trotinette-api/app/Http/Requests/Admin/StoreVariationTypeRequest.php
    trotinette-api/app/Http/Requests/Admin/UpdateVariationTypeRequest.php
    trotinette-api/app/Http/Requests/Admin/StoreProductVariantRequest.php
    trotinette-api/app/Http/Requests/Admin/UpdateProductVariantRequest.php
    trotinette-api/app/Http/Controllers/Admin/ProductController.php
    trotinette-api/routes/api.php
  </files>
  <action>
    **VariationTypeController** (admin-only CRUD):
    - `index()`: Return all variation types with their values eager-loaded, no pagination (small dataset). Use VariationTypeResource::collection.
    - `store(StoreVariationTypeRequest)`: Create variation type. Request validates: name (required, string, max:100, unique:variation_types). Also accepts optional `values` array of strings — create VariationValue records for each. Return VariationTypeResource.
    - `update(UpdateVariationTypeRequest, VariationType)`: Update name. Request validates: name (required, string, max:100, unique:variation_types,name,{id}). Also accepts optional `values` array — sync: delete values not in array (only if not used by any product_variant_values), add new ones. Return VariationTypeResource.
    - `destroy(VariationType)`: Delete if no variation values are used in any product_variant_values. If in use, abort(422, 'Ce type de variation est utilisé par des variantes de produit').

    **VariationTypeResource:** id, name, values (array of {id, value}), created_at.

    **StoreVariationTypeRequest:** name required|string|max:100|unique:variation_types,name. values optional|array. values.* required|string|max:100.

    **UpdateVariationTypeRequest:** Same but unique rule ignores current ID.

    **ProductVariantController** (nested under product):
    - `index(Product)`: Return product's variants with values eager-loaded. Use ProductVariantResource::collection.
    - `store(StoreProductVariantRequest, Product)`: Create variant for product. Request validates: sku (nullable, string, unique:product_variants,sku), price_override (nullable, integer, min:0), stock_quantity (required, integer, min:0), is_active (boolean), variation_value_ids (required, array, min:1), variation_value_ids.* (exists:variation_values,id). Create ProductVariant, then attach variation_value_ids via sync. Return ProductVariantResource.
    - `update(UpdateProductVariantRequest, Product, ProductVariant)`: Update variant fields + sync variation_value_ids. Same validation as store but sku unique ignores current. Return ProductVariantResource.
    - `destroy(Product, ProductVariant)`: Delete variant (cascade deletes pivot rows).

    **ProductVariantResource:** id, product_id, sku, price_override, stock_quantity, is_active, values (array of {id, variation_type_id, variation_type_name, value}), effective_price (price_override ?? product.price), created_at.

    **StoreProductVariantRequest:** sku nullable|string|max:50|unique:product_variants,sku. price_override nullable|integer|min:0. stock_quantity required|integer|min:0. is_active boolean. variation_value_ids required|array|min:1. variation_value_ids.* integer|exists:variation_values,id.

    **UpdateProductVariantRequest:** Same but sku unique ignores current variant ID.

    **Update AdminProductController show():** Eager-load variants.values.type alongside existing eager loads so product detail API includes variants.

    **Routes (add to admin group in api.php):**
    ```
    // Variation types
    Route::get('/variation-types', [AdminVariationTypeController::class, 'index']);
    Route::post('/variation-types', [AdminVariationTypeController::class, 'store']);
    Route::put('/variation-types/{variation_type}', [AdminVariationTypeController::class, 'update']);
    Route::delete('/variation-types/{variation_type}', [AdminVariationTypeController::class, 'destroy']);

    // Product variants (nested)
    Route::get('/products/{product}/variants', [AdminProductVariantController::class, 'index']);
    Route::post('/products/{product}/variants', [AdminProductVariantController::class, 'store']);
    Route::put('/products/{product}/variants/{variant}', [AdminProductVariantController::class, 'update']);
    Route::delete('/products/{product}/variants/{variant}', [AdminProductVariantController::class, 'destroy']);
    ```

    Import controllers with aliases: `AdminVariationTypeController`, `AdminProductVariantController`.
  </action>
  <verify>Start Laravel dev server. Test with curl:
    - `curl -X POST /api/admin/variation-types -d '{"name":"Couleur","values":["Noir","Blanc","Rouge"]}' -H 'Authorization: Bearer TOKEN'` returns 201 with type + values.
    - `curl /api/admin/variation-types` returns list with values.
    - `curl -X POST /api/admin/products/1/variants -d '{"stock_quantity":10,"variation_value_ids":[1,2],"is_active":true}' -H 'Authorization: Bearer TOKEN'` returns 201 with variant data.
    - `curl /api/admin/products/1/variants` returns variant list with values.
  </verify>
  <done>Full CRUD for variation types with values. Full CRUD for product variants nested under products. Product show API includes variants. All routes registered and working.</done>
</task>

<task type="auto">
  <name>Task 3: Dashboard — Backend KPI service and API endpoint</name>
  <files>
    trotinette-api/app/Services/DashboardService.php
    trotinette-api/app/Http/Controllers/Admin/DashboardController.php
    trotinette-api/routes/api.php
  </files>
  <action>
    **DashboardService** — All calculations server-side with DB aggregation (not PHP loops). Accept filters: date_from, date_to, month, year, status.

    Build a base query method that applies filters to Order::query():
    - date_from: whereDate('created_at', '>=', $dateFrom)
    - date_to: whereDate('created_at', '<=', $dateTo)
    - month: whereMonth('created_at', $month)
    - year: whereYear('created_at', $year)
    - status: where('status', $status)

    Methods (all accept filters array):

    `getKpis(array $filters)` returns associative array:
    - total_orders: count from filtered query
    - orders_by_status: groupBy status, count each — returns [{status, label, count}] using OrderStatus enum for label
    - total_revenue: sum of 'total' where status=delivered (apply filters except status filter for this one, always filter delivered)
    - average_order_value: total_revenue / count of delivered orders (0 if none)
    - best_selling_products: top 5 products by sum of order_items.quantity, joined through orders (respecting date filters). Return [{product_id, product_name, total_quantity}]. Use OrderItem::query() joined to orders with date filters, groupBy product_id, selectRaw('product_id, SUM(quantity) as total_quantity'), orderByDesc('total_quantity'), limit(5). Eager load product name.
    - best_selling_categories: top 5 categories by revenue. Join order_items -> products -> categories. Return [{category_id, category_name, total_revenue}].
    - new_customers: count of users created within filter date range (users where created_at in filter range). If no date filters, count all users.

    `getMonthlyStats(array $filters)` returns array of [{month (YYYY-MM), revenue (sum total where delivered), order_count}]. Use selectRaw with DATE_FORMAT for MySQL. Apply year filter if present. Last 12 months by default if no year filter.

    `getYearlyStats()` returns array of [{year, revenue, order_count}]. Group orders by year.

    **DashboardController:**
    - `__invoke(Request $request)`: Validate optional filters (date_from, date_to as date format, month as integer 1-12, year as integer, status as string). Call DashboardService methods. Return JSON:
    ```json
    {
      "kpis": { ... },
      "monthly_stats": [ ... ],
      "yearly_stats": [ ... ]
    }
    ```

    **Route (add to admin group):**
    ```
    Route::get('/dashboard', DashboardController::class);
    ```
    Import as AdminDashboardController.
  </action>
  <verify>Test with curl:
    - `curl /api/admin/dashboard -H 'Authorization: Bearer TOKEN'` returns JSON with kpis, monthly_stats, yearly_stats keys.
    - `curl '/api/admin/dashboard?year=2026' -H 'Authorization: Bearer TOKEN'` returns filtered data.
    - `curl '/api/admin/dashboard?date_from=2026-01-01&date_to=2026-02-28' -H 'Authorization: Bearer TOKEN'` returns date-filtered data.
    - Verify all numeric KPIs are integers (centimes for monetary values).
  </verify>
  <done>Dashboard API returns all required KPIs (total orders, by status, revenue, AOV, best products, best categories, new customers), monthly stats, and yearly stats. All filters work correctly. All aggregation is server-side SQL.</done>
</task>

<task type="auto">
  <name>Task 4: Dashboard — Frontend page with KPI cards, charts, and filters</name>
  <files>
    trotinette-frontend/src/features/admin/api/dashboard.ts
    trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx
    trotinette-frontend/src/features/admin/types.ts
    trotinette-frontend/src/app/router.tsx
  </files>
  <action>
    **Install recharts:** Run `npm install recharts` in trotinette-frontend directory. Recharts is the standard lightweight charting library for React — no config needed.

    **Types (add to admin/types.ts):**
    ```typescript
    export interface DashboardKpis {
      total_orders: number;
      orders_by_status: { status: string; label: string; count: number }[];
      total_revenue: number;
      average_order_value: number;
      best_selling_products: { product_id: number; product_name: string; total_quantity: number }[];
      best_selling_categories: { category_id: number; category_name: string; total_revenue: number }[];
      new_customers: number;
    }
    export interface MonthlyStats { month: string; revenue: number; order_count: number; }
    export interface YearlyStats { year: number; revenue: number; order_count: number; }
    export interface DashboardData {
      kpis: DashboardKpis;
      monthly_stats: MonthlyStats[];
      yearly_stats: YearlyStats[];
    }
    export interface DashboardFilters {
      date_from?: string;
      date_to?: string;
      month?: number;
      year?: number;
      status?: string;
    }
    ```

    **API hook (dashboard.ts):**
    ```typescript
    export function useAdminDashboard(filters: DashboardFilters = {}) {
      return useQuery<DashboardData>({
        queryKey: ['admin', 'dashboard', filters],
        queryFn: async () => {
          const params: Record<string, string | number> = {};
          if (filters.date_from) params.date_from = filters.date_from;
          if (filters.date_to) params.date_to = filters.date_to;
          if (filters.month) params.month = filters.month;
          if (filters.year) params.year = filters.year;
          if (filters.status) params.status = filters.status;
          const res = await apiClient.get('/admin/dashboard', { params });
          return res.data;
        },
      });
    }
    ```

    **AdminDashboardPage.tsx:**

    Layout: Full-width page with filter bar at top, then KPI summary cards row, then charts grid.

    **Filter bar** (matches AdminOrdersPage pattern — URL search params):
    - Date range: two TextField type="date" (date_from, date_to)
    - Month: Select with options 1-12 (Janvier...Decembre)
    - Year: Select with dynamic years from yearly_stats (or current year +/- 2)
    - Status: Select from ORDER_STATUSES array
    - All filters stored in URL search params, read on mount

    **KPI Cards** (MUI Paper with padding, arranged in a responsive Grid — 4 columns on lg, 2 on md, 1 on sm):
    1. "Commandes totales" — total_orders (large number)
    2. "Chiffre d'affaires" — formatCurrency(total_revenue) (revenue from delivered only)
    3. "Panier moyen" — formatCurrency(average_order_value)
    4. "Nouveaux clients" — new_customers

    **Charts section** (Grid layout, 2 columns on lg):
    1. **Status distribution** — PieChart (recharts) from orders_by_status. Each slice colored by status (pending=orange, confirmed=blue, dispatched=purple, delivered=green, cancelled=red). Show labels with count.
    2. **Monthly revenue** — BarChart (recharts) from monthly_stats. X-axis: month, Y-axis: revenue in MAD (divide centimes by 100 for display). Show bar label.
    3. **Monthly orders** — LineChart (recharts) from monthly_stats. X-axis: month, Y-axis: order_count.
    4. **Best-selling products** — Horizontal BarChart from best_selling_products. Y-axis: product_name, X-axis: total_quantity.
    5. **Best-selling categories** — Horizontal BarChart from best_selling_categories. Y-axis: category_name, X-axis: total_revenue in MAD.

    Use ResponsiveContainer from recharts for all charts (width="100%", height={300}).

    All text in French: "Tableau de bord", "Commandes totales", "Chiffre d'affaires", "Panier moyen", "Nouveaux clients", "Commandes par statut", "Chiffre d'affaires mensuel", "Commandes mensuelles", "Produits les plus vendus", "Meilleures categories".

    Loading state: CircularProgress centered. Error state: Alert severity="error".

    **Router update:** Import AdminDashboardPage. Change AdminHomePage from `<Navigate to="/admin/products" replace />` to `<AdminDashboardPage />` so `/admin` lands on dashboard. Keep `/admin/products` route as-is.
  </action>
  <verify>Run `npm run build` in trotinette-frontend — no TypeScript errors. Navigate to `/admin` — dashboard loads with KPI cards and charts. Apply date filter — data updates. Apply status filter — data updates.</verify>
  <done>Admin dashboard page shows all KPI cards (total orders, revenue, AOV, new customers), 5 charts (status pie, monthly revenue bar, monthly orders line, best products, best categories), and all filters (date range, month, year, status) are functional.</done>
</task>

<task type="auto">
  <name>Task 5: Product Variations — Frontend (variation types page + variant management in product edit)</name>
  <files>
    trotinette-frontend/src/features/admin/api/variations.ts
    trotinette-frontend/src/features/admin/types.ts
    trotinette-frontend/src/features/admin/pages/AdminVariationTypesPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
    trotinette-frontend/src/app/router.tsx
  </files>
  <action>
    **Types (add to admin/types.ts):**
    ```typescript
    export interface VariationValue { id: number; value: string; }
    export interface VariationType { id: number; name: string; values: VariationValue[]; created_at: string; }
    export interface ProductVariantValue { id: number; variation_type_id: number; variation_type_name: string; value: string; }
    export interface ProductVariant {
      id: number; product_id: number; sku: string | null; price_override: number | null;
      stock_quantity: number; is_active: boolean; values: ProductVariantValue[];
      effective_price: number; created_at: string;
    }
    ```

    **API hooks (variations.ts):**
    - `useVariationTypes()`: GET /admin/variation-types, queryKey ['admin','variation-types']
    - `useCreateVariationType()`: POST /admin/variation-types, invalidates ['admin','variation-types']
    - `useUpdateVariationType()`: PUT /admin/variation-types/:id, invalidates ['admin','variation-types']
    - `useDeleteVariationType()`: DELETE /admin/variation-types/:id, invalidates ['admin','variation-types']
    - `useProductVariants(productId: number)`: GET /admin/products/:id/variants, queryKey ['admin','products',productId,'variants'], enabled: productId > 0
    - `useCreateProductVariant()`: POST /admin/products/:id/variants, invalidates ['admin','products',productId,'variants'] and ['admin','products',productId]
    - `useUpdateProductVariant()`: PUT /admin/products/:id/variants/:variantId, invalidates same
    - `useDeleteProductVariant()`: DELETE /admin/products/:id/variants/:variantId, invalidates same

    **AdminVariationTypesPage.tsx:**
    Dialog-based CRUD (same pattern as AdminCategoriesPage):
    - Table listing variation types with their values as Chips
    - "Ajouter un type" button opens dialog
    - Dialog fields: name (TextField), values (dynamic list — TextField for each value + "Ajouter une valeur" button, delete icon per value)
    - Edit button opens same dialog pre-filled
    - Delete button with confirmation
    - All text in French: "Types de variations", "Nom", "Valeurs", "Ajouter un type de variation", "Ajouter une valeur"

    **Update AdminProductEditPage.tsx:**
    Add a new section BELOW existing form fields (after images section), only shown when editing an existing product (id > 0):

    Section title: "Variantes du produit"

    - Load variation types via useVariationTypes() and product variants via useProductVariants(productId)
    - Show existing variants in a Table: columns = variation value labels joined (e.g. "Noir / Standard"), SKU, Price (effective_price formatted), Stock, Active (Chip), Actions (edit/delete)
    - "Ajouter une variante" button opens a Dialog with:
      - For each loaded variation type: a Select (multiple=false) to pick one value from that type's values. Label = type name. Only show types that have values.
      - SKU: TextField (optional)
      - Price override: TextField type="number" in MAD (convert to centimes on submit * 100). If empty, shows "Prix de base" hint.
      - Stock: TextField type="number" (required)
      - Active: Switch (default true)
    - Edit variant: same dialog pre-filled
    - Delete variant: confirmation dialog
    - On create/update mutation: collect selected variation_value_ids from the selects, send along with sku, price_override (in centimes or null), stock_quantity, is_active

    **Router update:** Add route `/admin/variation-types` pointing to AdminVariationTypesPage. Add import. Add in admin routes section after `/admin/pages`.
  </action>
  <verify>Run `npm run build` — no TypeScript errors. Navigate to `/admin/variation-types` — can create a type "Couleur" with values "Noir", "Blanc". Navigate to `/admin/products/:id/edit` — see "Variantes du produit" section below images. Can add a variant selecting "Noir" for Couleur, stock=10 — variant appears in table.</verify>
  <done>Variation types page with full CRUD (create/edit/delete types with their values). Product edit page has variant management section: list variants, add/edit/delete variant combinations with price override, stock, SKU, active status. Router has both new routes.</done>
</task>

<task type="auto">
  <name>Task 6: Navbar integration + storefront variant display</name>
  <files>
    trotinette-frontend/src/shared/components/RootLayout.tsx
    trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    trotinette-frontend/src/features/catalog/types.ts
    trotinette-api/app/Http/Resources/ProductResource.php
    trotinette-api/app/Http/Controllers/Customer/ProductController.php
  </files>
  <action>
    **Navbar:** In the admin dropdown menu within RootLayout.tsx (or wherever the admin navbar links are), add two new links:
    - "Tableau de bord" linking to `/admin` (should be first admin link, before products)
    - "Types de variations" linking to `/admin/variation-types` (after "Pages" or at end of admin links)

    **Backend — Customer product API:**
    Update the customer ProductController show() to eager-load `variants.values.type` on the product. Update ProductResource (the customer-facing one, NOT the admin one) to conditionally include variants if they exist:
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

    **Frontend — Catalog types:** Add to catalog/types.ts (or wherever the storefront Product type lives):
    ```typescript
    export interface ProductVariantDisplay {
      id: number; sku: string | null; price: number; stock_quantity: number;
      values: { type: string; value: string }[];
    }
    ```
    Add `variants?: ProductVariantDisplay[]` to the Product type.

    **Frontend — ProductDetailPage:**
    If `product.variants` exists and has items, show a variant selector section above the "Add to Cart" button:
    - For each unique variation type in the variants, show a row of MUI Chips or ToggleButtonGroup for selecting a value (e.g., "Couleur: [Noir] [Blanc] [Rouge]")
    - When selection changes, find the matching variant combination and update displayed price (use variant price instead of base price)
    - Show variant stock. If selected variant has stock_quantity=0, disable Add to Cart
    - If product has no variants, behavior unchanged (use base price/stock as before)
    - Store selected variant values in component state. When "Add to Cart" is clicked with a variant selected, optionally pass variant info (this can use existing cart logic since prices are snapshotted at order time)
  </action>
  <verify>Run `npm run build` — no TypeScript errors. Visit a product detail page that has variants — variant selectors appear, selecting different values updates price display. Admin navbar shows "Tableau de bord" and "Types de variations" links.</verify>
  <done>Admin navbar has dashboard and variation types links. Storefront product detail page shows variant selectors when product has variants, with dynamic price and stock updates. Products without variants behave unchanged.</done>
</task>

</tasks>

<verification>
1. `php artisan migrate` runs without errors (4 new tables)
2. Dashboard API returns correct KPIs with and without filters
3. Variation types CRUD works end-to-end (API + frontend)
4. Product variants CRUD works nested under products
5. Dashboard page renders KPI cards and charts
6. Product edit page shows variant management section
7. Storefront product page shows variant selectors
8. `npm run build` produces no TypeScript errors
</verification>

<success_criteria>
- Admin can visit /admin and see dashboard with KPI cards (total orders, revenue, AOV, new customers) and 5 charts
- Admin can filter dashboard by date range, month, year, status — data updates accordingly
- Admin can CRUD variation types with values at /admin/variation-types
- Admin can add/edit/delete variant combinations on any product's edit page
- Each variant has optional price override, stock quantity, SKU, and active status
- Storefront product detail shows variant selectors and updates price/stock dynamically
- All monetary values stored in centimes, displayed in MAD
</success_criteria>
