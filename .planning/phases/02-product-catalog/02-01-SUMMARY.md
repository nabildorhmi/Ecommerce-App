---
phase: 02-product-catalog
plan: 01
subsystem: api
tags: [laravel, spatie, medialibrary, query-builder, mysql, fulltext, product-catalog, seeder]

requires:
  - phase: 01-foundation
    provides: Laravel API scaffold, Sanctum auth, RBAC (admin/customer roles), categories/products/delivery_zones migrations

provides:
  - Product model with HasMedia (3 image conversions: thumbnail/card/full), scopeActive
  - ProductTranslation, Category, CategoryTranslation, DeliveryZone models with relations
  - Customer/ProductController: QueryBuilder filtered+paginated listing, slug-based detail
  - Admin/ProductController: full CRUD with image upload via ProductService
  - Customer/CategoryController + Admin/CategoryController: category listing and CRUD
  - ProductResource (with media URLs), CategoryResource, MediaResource, ProductCollection
  - ProductService (create/update/delete with image handling), CategoryService (with product guard)
  - StoreProductRequest, UpdateProductRequest (PATCH), StoreCategoryRequest
  - category_translations migration (FR/EN translatable names), FULLTEXT index on product_translations
  - medialibrary media table migration, published medialibrary config
  - DeliveryZoneSeeder: 10 Moroccan cities (DLVR-02), CategorySeeder: 4 categories, ProductSeeder: 6 sample products
  - GD+exif extensions enabled, storage symlink created, sync conversions via QUEUE_CONVERSIONS_BY_DEFAULT=false
  - SetLocale middleware: 'ar' removed, FR/EN only

affects:
  - 02-02-storefront (customer catalog UI consumes these API endpoints)
  - 02-03-admin (admin product CRUD UI consumes these admin API endpoints)
  - 04-checkout (delivery zone data seeded here, queried at checkout)

tech-stack:
  added:
    - spatie/laravel-medialibrary v11.20
    - spatie/laravel-query-builder v6.4
    - GD PHP extension (enabled in php.ini)
    - exif PHP extension (enabled in php.ini)
  patterns:
    - QueryBuilder::for(Product::query()) with AllowedFilter for safe client-driven filtering
    - Product implements HasMedia with registerMediaCollections + registerMediaConversions (nonQueued)
    - Service layer (ProductService, CategoryService) — controllers have zero business logic
    - ProductResource with whenLoaded('media') guard for N+1 prevention
    - FULLTEXT search with LIKE fallback for search terms < 4 chars
    - Locale-scoped eager loading: with(['translations' => fn($q) => $q->where('locale', $locale)])
    - Idempotent seeders via firstOrCreate/updateOrCreate

key-files:
  created:
    - trotinette-api/app/Models/Product.php
    - trotinette-api/app/Models/ProductTranslation.php
    - trotinette-api/app/Models/Category.php
    - trotinette-api/app/Models/CategoryTranslation.php
    - trotinette-api/app/Models/DeliveryZone.php
    - trotinette-api/app/Services/ProductService.php
    - trotinette-api/app/Services/CategoryService.php
    - trotinette-api/app/Http/Controllers/Customer/ProductController.php
    - trotinette-api/app/Http/Controllers/Customer/CategoryController.php
    - trotinette-api/app/Http/Controllers/Admin/ProductController.php
    - trotinette-api/app/Http/Controllers/Admin/CategoryController.php
    - trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php
    - trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php
    - trotinette-api/app/Http/Requests/Admin/StoreCategoryRequest.php
    - trotinette-api/app/Http/Resources/ProductResource.php
    - trotinette-api/app/Http/Resources/ProductCollection.php
    - trotinette-api/app/Http/Resources/CategoryResource.php
    - trotinette-api/app/Http/Resources/MediaResource.php
    - trotinette-api/database/migrations/2026_02_15_000001_create_category_translations_table.php
    - trotinette-api/database/migrations/2026_02_15_000002_add_fulltext_index_to_product_translations_table.php
    - trotinette-api/database/migrations/2026_02_16_201159_create_media_table.php
    - trotinette-api/database/seeders/DeliveryZoneSeeder.php
    - trotinette-api/database/seeders/CategorySeeder.php
    - trotinette-api/database/seeders/ProductSeeder.php
    - trotinette-api/config/media-library.php
  modified:
    - trotinette-api/app/Http/Middleware/SetLocale.php (removed 'ar' locale)
    - trotinette-api/routes/api.php (added product/category routes, public + admin)
    - trotinette-api/database/seeders/DatabaseSeeder.php (added 3 new seeders)
    - trotinette-api/composer.json (added medialibrary + query-builder)

key-decisions:
  - "nonQueued() on all media conversions — sync processing in dev, no queue worker needed; QUEUE_CONVERSIONS_BY_DEFAULT=false in .env"
  - "LIKE fallback for search terms < 4 chars — MySQL FULLTEXT ignores words below ft_min_word_len (default 4 InnoDB)"
  - "CategoryService.deleteCategory throws ValidationException if products exist — prevents orphaned product data"
  - "UpdateProductRequest uses PATCH semantics — all fields optional; sku unique rule ignores current product ID"
  - "Seeder uses firstOrCreate+updateOrCreate — idempotent, safe to re-run without duplicates"

patterns-established:
  - "QueryBuilder::for(Model::query()) with AllowedFilter whitelist — safe URL-driven filtering"
  - "Locale-filtered eager loading on translations relation — prevents N+1 and returns only current locale data"
  - "whenLoaded('media') in ProductResource — N+1 guard: media only included if eager-loaded"
  - "Service layer for business logic — Controller calls Service, Service calls Model"
  - "PrepareForValidation decodes JSON attributes string from multipart FormData"

duration: 17min
completed: 2026-02-16
---

# Phase 2 Plan 1: Product Catalog Backend API Summary

**Spatie medialibrary + query-builder product catalog API with FULLTEXT search, locale-scoped translations, image upload/conversions, and 10-city Moroccan delivery zone seeder**

## Performance

- **Duration:** ~17 min
- **Started:** 2026-02-16T20:05:56Z
- **Completed:** 2026-02-16T20:22:46Z
- **Tasks:** 3
- **Files modified:** 27

## Accomplishments

- Complete product catalog REST API: filtered listing (category/price/stock/search), slug-based detail, admin CRUD with image upload
- spatie/laravel-medialibrary installed with GD extension enabled; 3 auto-generated image conversions (thumbnail 200x200, card 600x400, full 1200x900) run synchronously
- FULLTEXT index on product_translations with LIKE fallback for short search terms; category_translations table added for translatable category names
- 10 Moroccan delivery zones seeded (DLVR-02), 4 categories (FR/EN), 6 sample products with spec attributes and varied stock levels for frontend development

## Task Commits

Each task was committed atomically:

1. **Task 1: Install packages, enable GD, run migrations, create models** - `78b1321` (feat)
2. **Task 2: Controllers, Services, Resources, Form Requests, and Routes** - `d0e307f` (feat)
3. **Task 3: Seeders for delivery zones, categories, and sample products** - `c066cf5` (feat)

**Plan metadata:** (docs commit — see state updates)

## Files Created/Modified

- `trotinette-api/app/Models/Product.php` - HasMedia model with 3 image conversions, scopeActive, category/translations relations
- `trotinette-api/app/Models/ProductTranslation.php` - Translation model with product relation
- `trotinette-api/app/Models/Category.php` - Category with translations/products relations, scopeActive
- `trotinette-api/app/Models/CategoryTranslation.php` - Category translation for FR/EN names
- `trotinette-api/app/Models/DeliveryZone.php` - Delivery zone model with fee/is_active casts
- `trotinette-api/app/Services/ProductService.php` - createProduct/updateProduct/deleteProduct with image handling
- `trotinette-api/app/Services/CategoryService.php` - createCategory/updateCategory/deleteCategory (guards against orphaned products)
- `trotinette-api/app/Http/Controllers/Customer/ProductController.php` - QueryBuilder filtered index + slug show
- `trotinette-api/app/Http/Controllers/Customer/CategoryController.php` - Active categories with locale translations
- `trotinette-api/app/Http/Controllers/Admin/ProductController.php` - Full CRUD with image upload
- `trotinette-api/app/Http/Controllers/Admin/CategoryController.php` - Full CRUD with translations
- `trotinette-api/app/Http/Resources/ProductResource.php` - Product with images array (thumbnail/card/full/original URLs)
- `trotinette-api/app/Http/Resources/CategoryResource.php` - Category with locale name
- `trotinette-api/app/Http/Resources/MediaResource.php` - Media with all conversion URLs and metadata
- `trotinette-api/app/Http/Resources/ProductCollection.php` - Paginated product collection
- `trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php` - Full product validation with FR/EN translations required
- `trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php` - PATCH semantics, sku unique ignores self
- `trotinette-api/app/Http/Requests/Admin/StoreCategoryRequest.php` - Category with FR/EN translation names
- `trotinette-api/routes/api.php` - 3 public routes + 13 admin routes (products CRUD+media delete, categories CRUD)
- `trotinette-api/database/seeders/DeliveryZoneSeeder.php` - 10 Moroccan cities with fees in centimes
- `trotinette-api/database/seeders/CategorySeeder.php` - 4 scooter categories with FR/EN names
- `trotinette-api/database/seeders/ProductSeeder.php` - 6 sample products (5 active, 1 inactive; 1 out-of-stock)
- `trotinette-api/config/media-library.php` - Published medialibrary config
- `trotinette-api/app/Http/Middleware/SetLocale.php` - Removed 'ar' locale, FR/EN only

## Decisions Made

- `nonQueued()` on all 3 media conversions AND `QUEUE_CONVERSIONS_BY_DEFAULT=false` in `.env` — prevents silent conversion queue buildup with no worker running in development
- FULLTEXT search falls back to LIKE for search terms < 4 chars — MySQL InnoDB ignores words below minimum word length (default 4), making short searches return no results without the fallback
- `CategoryService::deleteCategory` throws `ValidationException` when category has products — prevents admin from orphaning products (Rule 2: missing critical functionality)
- PATCH semantics in `UpdateProductRequest` — all fields `sometimes`, sku uniqueness ignores the product being updated via `Rule::unique()->ignore()`
- MySQL was not running as a Windows service — started it manually with `mysqld.exe --datadir=C:/Users/User/mysql-data`

## Deviations from Plan

None - plan executed exactly as written.

The CategoryService product-guard behavior (`deleteCategory` blocks if products exist) was specified in the plan and implemented as designed.

## Issues Encountered

- **MySQL not running:** MySQL data directory was at `C:/Users/User/mysql-data` (not the default `C:/Program Files/MySQL/MySQL Server 8.4/data/`). Started with `mysqld.exe --datadir=C:/Users/User/mysql-data --console &`.
- **Composer not in PATH:** Composer found at `/c/Users/User/AppData/Local/Programs/composer` (phar). Used full path for all composer commands.
- **GD and exif not enabled:** As expected from research — added `extension=gd` and `extension=exif` to php.ini at `C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe/php.ini`.

## User Setup Required

None - no external service configuration required. MySQL must be started manually before API can serve requests (known blocker from Phase 1 STATE.md).

## Next Phase Readiness

- Product catalog API fully operational — 02-02 (storefront UI) can start consuming endpoints immediately
- Admin CRUD API ready — 02-03 (admin product management UI) can start building forms
- All data seeded: 4 categories, 5 active products (1 out-of-stock), 10 delivery zones
- Search, filtering, and pagination all verified working
- Image upload ready — GD enabled, storage symlink created, conversions synchronous

---
*Phase: 02-product-catalog*
*Completed: 2026-02-16*

## Self-Check: PASSED

- All 9 key files verified present on disk
- All 3 task commits verified in git log (78b1321, d0e307f, c066cf5)
- API verified returning real data: GET /api/products (5 items), GET /api/categories (4 items), DeliveryZone count = 10
