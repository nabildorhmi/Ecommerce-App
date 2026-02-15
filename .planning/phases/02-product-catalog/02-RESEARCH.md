# Phase 2: Product Catalog - Research

**Researched:** 2026-02-15
**Domain:** Laravel medialibrary + query-builder, product/category API, image gallery frontend, admin CRUD
**Confidence:** HIGH (core stack verified via Packagist, official Spatie docs, Laravel 12 docs; critical PHP extension gap verified by inspecting actual php.ini)

---

## Summary

Phase 2 adds two Spatie packages to the backend — `spatie/laravel-medialibrary` v11 and `spatie/laravel-query-builder` v6 — on top of the existing Laravel 12 / Sanctum / RBAC foundation from Phase 1. Both packages are compatible with PHP 8.3 and Laravel 12 as confirmed against current Packagist data (medialibrary 11.19.0, query-builder 6.4.1, both released Feb/Jan 2026). There is one blocking environment issue: the GD and exif PHP extensions are NOT currently enabled in the project's php.ini, but both DLLs (`php_gd.dll`, `php_exif.dll`) are present in the PHP ext directory — enabling them requires adding two lines to php.ini. Without GD, medialibrary cannot generate image conversions.

The categories table already exists from Phase 1 migrations but lacks a translation table — category names need to be translatable (FR/EN). A `category_translations` migration must be added in Phase 2 before any category data is seeded. Product full-text search requires a FULLTEXT index on `product_translations.name` and `product_translations.description`, which needs a new migration (separate from the existing product_translations migration). Image conversions should use `nonQueued()` for local development since the queue connection is `database` and image DLL availability must be confirmed before running the queue worker.

On the frontend, the image gallery for the product detail page should be a self-contained MUI-only implementation (main image + thumbnail row using Box/Stack/ImageList) — no external carousel library is needed at this scale. Admin product CRUD uses react-hook-form + zod with `useMutation` (TanStack Query v5) for create/update/delete operations, and multipart FormData for image uploads. WhatsApp deep linking uses the `wa.me` format with `encodeURIComponent()` on the pre-filled message.

**Primary recommendation:** Enable GD + exif extensions in php.ini on day one of 02-01 implementation. Run `php artisan storage:link` to expose the public disk before any image upload test. Use `QUEUE_CONVERSIONS_BY_DEFAULT=false` in `.env` during local development to keep conversions synchronous.

---

## Standard Stack

### Core — New Backend Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spatie/laravel-medialibrary | ^11.19 | Multi-image upload + auto conversions (thumbnail/card/full) | Official Spatie package; 50M+ downloads; HasMedia trait, registerMediaConversions, toMediaCollection; requires GD or Imagick |
| spatie/laravel-query-builder | ^6.4 | Filter/sort/paginate API endpoints from URL params | AllowedFilter/AllowedSort guard against SQL injection; wraps Eloquent; supports exact, partial, scope, callback, operator filter types |

### Existing Backend (Phase 1 — unchanged)

| Library | Version | Purpose |
|---------|---------|---------|
| Laravel | 12.51 | API framework |
| Laravel Sanctum | bundled | Bearer token auth |
| spatie/laravel-permission | ^6 | RBAC (admin/customer) |
| MySQL | 8.4 | Database; FULLTEXT index on InnoDB required for whereFullText |
| PHP | 8.3 | Runtime |

### Core — Frontend (Phase 1 — all still in package.json)

| Library | Version | Purpose |
|---------|---------|---------|
| React | ^19 | UI library |
| MUI | ^7.3 | Component library — used for gallery, filter bar, specs table, breadcrumb |
| @tanstack/react-query | ^5 | API state; useQuery for catalog/detail; useMutation for admin CRUD |
| react-hook-form | ^7 | Admin product create/edit forms |
| zod | ^4 | Schema validation for admin forms |
| axios | ^1 | HTTP client (already configured with auth + Accept-Language) |
| react-router | ^7 | Client routing — catalog `/products`, detail `/products/:slug`, admin routes |
| zustand | ^5 | Auth store (no new stores needed in Phase 2) |

### No New Frontend Libraries Needed

Phase 2 requires no new npm packages. All required functionality (image gallery, filter bar, breadcrumb, specs table, WhatsApp link) is achievable with existing MUI components.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI ImageList (gallery) | swiper, react-image-gallery | Third-party carousel adds ~50KB bundle; MUI Box/Stack thumbnail row is sufficient for 3-8 images per product; avoid new dependency for a small feature |
| AllowedFilter::callback (price range) | Custom query scope | Callback is simpler for one-off logic; custom scope better if the filter is reused across multiple controllers |
| whereFullText (FULLTEXT index) | LIKE %search% | LIKE does not use indexes and degrades on large tables; FULLTEXT is the correct approach for MySQL 8 product search; requires FULLTEXT index in migration |
| QUEUE_CONVERSIONS_BY_DEFAULT=false | queue worker running | Sync conversions during dev eliminates "where is my thumbnail?" debugging; re-enable queue in production when a worker is configured |

**Installation — Backend:**
```bash
composer require spatie/laravel-medialibrary
composer require spatie/laravel-query-builder

# Publish medialibrary migrations and config
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-config"

# Create public storage symlink (required for image URLs)
php artisan storage:link

# Run new migrations
php artisan migrate
```

**Enable PHP Extensions (php.ini — REQUIRED before medialibrary works):**
```ini
; Add these two lines to php.ini
; File: C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.ini
extension=gd
extension=exif
```

---

## Architecture Patterns

### Recommended Project Structure — Backend (Phase 2 additions)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   │   ├── ProductController.php        # CRUD + image upload (admin only)
│   │   │   └── CategoryController.php       # CRUD (admin only)
│   │   └── Customer/
│   │       ├── ProductController.php        # index (filtered list), show (detail by slug)
│   │       └── CategoryController.php       # index (active categories only)
│   ├── Requests/
│   │   ├── Admin/
│   │   │   ├── StoreProductRequest.php      # validation for create
│   │   │   ├── UpdateProductRequest.php     # validation for update (PATCH)
│   │   │   └── StoreCategoryRequest.php
│   │   └── Customer/
│   │       └── ProductIndexRequest.php      # optional: validate query params
│   └── Resources/
│       ├── ProductResource.php              # used by both customer + admin
│       ├── ProductCollection.php            # wraps paginator for list endpoint
│       ├── CategoryResource.php
│       └── MediaResource.php               # media item with conversion URLs
├── Models/
│   ├── Product.php                          # HasMedia, InteractsWithMedia, relations
│   ├── ProductTranslation.php
│   ├── Category.php                         # hasMany CategoryTranslation + products
│   └── CategoryTranslation.php             # NEW: locale/name per category
├── Services/
│   ├── ProductService.php                   # create/update/delete product + media
│   └── CategoryService.php
│
database/
├── migrations/
│   ├── ..._create_category_translations_table.php   # NEW: category i18n
│   ├── ..._add_fulltext_index_to_product_translations_table.php  # NEW: search
│   └── ..._create_media_table.php                  # published by medialibrary
├── seeders/
│   ├── DeliveryZoneSeeder.php               # DLVR-02: Moroccan cities
│   ├── CategorySeeder.php                   # initial categories
│   └── ProductSeeder.php                    # sample products with translations
```

### Recommended Project Structure — Frontend (Phase 2 additions)

```
src/
├── features/
│   ├── catalog/
│   │   ├── api/
│   │   │   └── products.ts         # useProducts (list), useProduct (detail by slug)
│   │   ├── components/
│   │   │   ├── ProductCard.tsx      # card for listing: image, name, price, stock badge
│   │   │   ├── ProductGrid.tsx      # responsive grid of ProductCard
│   │   │   ├── FilterBar.tsx        # category select, price range, availability toggle
│   │   │   ├── ProductGallery.tsx   # main image + thumbnail row (MUI only)
│   │   │   ├── SpecsTable.tsx       # structured attributes display
│   │   │   ├── StockBadge.tsx       # "In Stock" / "Out of Stock" chip
│   │   │   ├── WhatsAppButton.tsx   # wa.me link button
│   │   │   ├── TrustSignals.tsx     # return policy, official badge, contact
│   │   │   └── CategoryBreadcrumb.tsx
│   │   ├── pages/
│   │   │   ├── CatalogPage.tsx      # /products — list + filter
│   │   │   └── ProductDetailPage.tsx # /products/:slug — full detail
│   │   └── hooks/
│   │       └── useCatalogFilters.ts  # URL search param state for filters
│   └── admin/
│       ├── api/
│       │   ├── products.ts           # useAdminProducts, useCreateProduct, etc.
│       │   └── categories.ts
│       ├── components/
│       │   ├── ProductForm.tsx       # create/edit form with RHF + Zod
│       │   ├── ImageUploader.tsx     # multi-image file input with preview
│       │   └── CategoryForm.tsx
│       └── pages/
│           ├── AdminProductsPage.tsx  # /admin/products — list + actions
│           ├── AdminProductEditPage.tsx
│           └── AdminCategoriesPage.tsx
├── app/
│   └── router.tsx                    # add /products, /products/:slug, /admin/products etc.
```

### Pattern 1: Product Model with HasMedia

**What:** Product implements `HasMedia` interface and uses `InteractsWithMedia` trait. Defines a `images` collection and three conversions.
**When to use:** Applied once to the Product model. Media is accessed via `$product->getMedia('images')`.

```php
// Source: https://spatie.be/docs/laravel-medialibrary/v11/basic-usage/preparing-your-model
// app/Models/Product.php
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Enums\Fit;

class Product extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $casts = [
        'attributes'   => 'array',
        'is_active'    => 'boolean',
        'stock_quantity' => 'integer',
        'price'        => 'integer',    // centimes
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Contain, 200, 200)
            ->nonQueued();                // sync during development

        $this->addMediaConversion('card')
            ->fit(Fit::Contain, 600, 400)
            ->nonQueued();

        $this->addMediaConversion('full')
            ->fit(Fit::Contain, 1200, 900)
            ->nonQueued();
    }

    public function translations(): HasMany
    {
        return $this->hasMany(ProductTranslation::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Scope: active products only (customer-facing)
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
```

### Pattern 2: QueryBuilder with Filters, Sorts, Pagination

**What:** Customer `ProductController@index` uses `QueryBuilder::for()` with allowed filters and sorts. Returns a paginated resource collection.
**When to use:** Every public catalog endpoint that accepts user-supplied query parameters.

```php
// Source: https://spatie.be/docs/laravel-query-builder/v6/features/filtering
// app/Http/Controllers/Customer/ProductController.php
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class ProductController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $locale = app()->getLocale(); // set by SetLocale middleware from Accept-Language

        $products = QueryBuilder::for(
                Product::query()
                    ->where('is_active', true)
                    ->whereHas('translations', fn ($q) => $q->where('locale', $locale))
                    ->with(['translations' => fn ($q) => $q->where('locale', $locale), 'media', 'category'])
            )
            ->allowedFilters([
                AllowedFilter::exact('category_id'),
                AllowedFilter::exact('is_active'),
                AllowedFilter::callback('min_price', fn ($query, $value) =>
                    $query->where('price', '>=', (int) $value)
                ),
                AllowedFilter::callback('max_price', fn ($query, $value) =>
                    $query->where('price', '<=', (int) $value)
                ),
                AllowedFilter::callback('in_stock', fn ($query, $value) =>
                    $query->when($value, fn ($q) => $q->where('stock_quantity', '>', 0))
                ),
                AllowedFilter::callback('search', function ($query, $value) use ($locale) {
                    $query->whereHas('translations', function ($q) use ($value, $locale) {
                        $q->where('locale', $locale)
                          ->whereFullText(['name', 'description'], $value);
                    });
                }),
            ])
            ->allowedSorts(['price', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(perPage: 12)
            ->appends($request->query());

        return ProductResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        $locale = app()->getLocale();

        $product = Product::query()
            ->where('is_active', true)
            ->whereHas('translations', fn ($q) =>
                $q->where('locale', $locale)->where('slug', $slug)
            )
            ->with([
                'translations' => fn ($q) => $q->where('locale', $locale),
                'media',
                'category.translations' => fn ($q) => $q->where('locale', $locale),
            ])
            ->firstOrFail();

        return new ProductResource($product);
    }
}
```

### Pattern 3: ProductResource with Media URLs

**What:** `ProductResource` exposes the current-locale translation fields and an `images` array with all three conversion URLs per media item.
**When to use:** All product endpoints. The `whenLoaded` guard prevents N+1 queries when media/translations are not eager-loaded.

```php
// Source: https://laravel.com/docs/12.x/eloquent-resources#conditional-relationships
// app/Http/Resources/ProductResource.php
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // First loaded translation (eager-loaded filtered to current locale)
        $translation = $this->translations->first();

        return [
            'id'             => $this->id,
            'sku'            => $this->sku,
            'price'          => $this->price,             // centimes
            'stock_quantity' => $this->stock_quantity,
            'in_stock'       => $this->stock_quantity > 0,
            'attributes'     => $this->attributes,        // JSON spec data
            'is_active'      => $this->is_active,
            'name'           => $translation?->name,
            'description'    => $translation?->description,
            'slug'           => $translation?->slug,
            'category'       => $this->whenLoaded('category', fn () =>
                new CategoryResource($this->category)
            ),
            'images'         => $this->whenLoaded('media', fn () =>
                $this->getMedia('images')->map(fn ($media) => [
                    'id'        => $media->id,
                    'thumbnail' => $media->getUrl('thumbnail'),
                    'card'      => $media->getUrl('card'),
                    'full'      => $media->getUrl('full'),
                    'original'  => $media->original_url,
                ])
            ),
            'created_at'     => $this->created_at,
        ];
    }
}
```

### Pattern 4: Admin Image Upload (multipart FormData)

**What:** Admin `ProductController@store` accepts multipart/form-data with `images[]` file array, stores files to the `images` media collection, and triggers conversions.
**When to use:** Product create and image-add operations.

```php
// Source: https://spatie.be/docs/laravel-medialibrary/v11/api/adding-files
// app/Services/ProductService.php (excerpt)
public function createProduct(array $data, Request $request): Product
{
    $product = Product::create([
        'sku'            => $data['sku'],
        'price'          => $data['price'],          // centimes
        'stock_quantity' => $data['stock_quantity'],
        'attributes'     => $data['attributes'] ?? [],
        'category_id'    => $data['category_id'],
        'is_active'      => $data['is_active'] ?? true,
    ]);

    // Store translations for each provided locale
    foreach ($data['translations'] as $locale => $translation) {
        $product->translations()->create([
            'locale'      => $locale,
            'name'        => $translation['name'],
            'description' => $translation['description'] ?? null,
            'slug'        => $translation['slug'],
        ]);
    }

    // Upload images (addMultipleMediaFromRequest handles file array)
    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $image) {
            $product->addMedia($image)
                ->toMediaCollection('images');
        }
    }

    return $product;
}
```

```typescript
// Frontend: useMutation with FormData for multipart upload
// Source: https://tanstack.com/query/v5/docs/framework/react/guides/mutations
// src/features/admin/api/products.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      formData.append('sku', data.sku);
      formData.append('price', String(data.price));
      formData.append('stock_quantity', String(data.stock_quantity));
      formData.append('category_id', String(data.category_id));
      formData.append('is_active', String(data.is_active ? 1 : 0));

      // Translations as nested fields
      Object.entries(data.translations).forEach(([locale, t]) => {
        formData.append(`translations[${locale}][name]`, t.name);
        formData.append(`translations[${locale}][description]`, t.description ?? '');
        formData.append(`translations[${locale}][slug]`, t.slug);
      });

      // Attributes JSON
      formData.append('attributes', JSON.stringify(data.attributes));

      // Images
      data.images?.forEach((file) => formData.append('images[]', file));

      const response = await apiClient.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}
```

### Pattern 5: FULLTEXT Index Migration

**What:** Separate migration to add a FULLTEXT index on `product_translations.name` and `product_translations.description`. Must be a standalone migration because `fullText()` cannot be chained in the original `create` migration if the table already exists.
**When to use:** Required before using `whereFullText` in the ProductController search filter.

```php
// Source: https://laravel.com/docs/12.x/migrations#creating-indexes
// database/migrations/..._add_fulltext_index_to_product_translations_table.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_translations', function (Blueprint $table) {
            $table->fullText(['name', 'description']);
        });
    }

    public function down(): void
    {
        Schema::table('product_translations', function (Blueprint $table) {
            $table->dropFullText(['name', 'description']);
        });
    }
};
```

### Pattern 6: Category Translations Migration

**What:** New `category_translations` table for translatable category names. Categories currently have a global `slug` for routing, but names need FR/EN translations.
**When to use:** Required in 02-01 before CategorySeeder runs.

```php
// database/migrations/..._create_category_translations_table.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->timestamps();
            $table->unique(['category_id', 'locale']);
            $table->index('locale');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_translations');
    }
};
```

### Pattern 7: WhatsApp Deep Link

**What:** A simple anchor tag using the `wa.me` format with a pre-filled message that includes the product name.
**When to use:** Product detail page WhatsApp button. Phone number stored in frontend config (env var or i18n config).

```typescript
// Source: https://faq.whatsapp.com/425247423114725
// src/features/catalog/components/WhatsAppButton.tsx
import Button from '@mui/material/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '212600000000';

interface WhatsAppButtonProps {
  productName: string;
}

export function WhatsAppButton({ productName }: WhatsAppButtonProps) {
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par : ${productName}`
  );
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <Button
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="contained"
      color="success"
      startIcon={<WhatsAppIcon />}
    >
      Demander sur WhatsApp
    </Button>
  );
}
```

### Pattern 8: Product Image Gallery (MUI-only)

**What:** Selected main image state + thumbnail row using MUI `Box` and `Stack`. No external carousel library required.
**When to use:** Product detail page.

```typescript
// src/features/catalog/components/ProductGallery.tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

interface ProductImage {
  id: number;
  thumbnail: string;
  card: string;
  full: string;
}

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selected, setSelected] = useState(0);

  if (!images.length) return null;

  return (
    <Box>
      {/* Main image */}
      <Box
        component="img"
        src={images[selected].card}
        alt="Product"
        sx={{ width: '100%', maxHeight: 480, objectFit: 'contain', mb: 1 }}
      />
      {/* Thumbnails */}
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
        {images.map((img, i) => (
          <Box
            key={img.id}
            component="img"
            src={img.thumbnail}
            onClick={() => setSelected(i)}
            sx={{
              width: 80,
              height: 60,
              objectFit: 'cover',
              cursor: 'pointer',
              border: selected === i ? '2px solid' : '2px solid transparent',
              borderColor: selected === i ? 'primary.main' : 'transparent',
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
```

### Pattern 9: Filter Bar with URL State Sync

**What:** Catalog filter bar persists state in URL search params so filters survive page reload and are shareable. Uses `useSearchParams` from react-router v7.
**When to use:** CatalogPage filter bar.

```typescript
// src/features/catalog/hooks/useCatalogFilters.ts
import { useSearchParams } from 'react-router';

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    category_id: searchParams.get('filter[category_id]') ?? '',
    min_price:   searchParams.get('filter[min_price]') ?? '',
    max_price:   searchParams.get('filter[max_price]') ?? '',
    in_stock:    searchParams.get('filter[in_stock]') ?? '',
    search:      searchParams.get('filter[search]') ?? '',
    sort:        searchParams.get('sort') ?? '-created_at',
    page:        Number(searchParams.get('page') ?? '1'),
  };

  const setFilter = (key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page'); // reset to page 1 on filter change
      return next;
    });
  };

  return { filters, setFilter };
}
```

### Anti-Patterns to Avoid

- **Media without eager loading:** Calling `$product->getMedia('images')` inside a resource loop without `->with('media')` on the query creates one query per product (N+1). Always include `'media'` in the `with()` array when listing products.
- **Conversions on default queue without a worker:** If `QUEUE_CONVERSIONS_BY_DEFAULT=true` (the default) and no queue worker is running, conversion jobs queue up indefinitely. Images appear but thumbnails are missing. Use `nonQueued()` on each conversion OR set `QUEUE_CONVERSIONS_BY_DEFAULT=false` in `.env` for local development.
- **Missing `php artisan storage:link`:** Medialibrary defaults to the `public` disk which serves files from `storage/app/public`. Without the symlink (`public/storage → storage/app/public`), all image URLs 404. Run `storage:link` once after install.
- **Sending raw Eloquent in admin responses:** Admin product responses should still go through `ProductResource`. Never `return $product` or `return Product::all()`.
- **Hardcoding WhatsApp number in code:** The shop's WhatsApp number should be in `.env` as `VITE_WHATSAPP_NUMBER` on the frontend. Frontend `.env` is client-visible, so this is acceptable (it's a public phone number), but it must not be hardcoded in source.
- **Creating categories without translations:** Categories need at least an `fr` translation row to display names. The CategorySeeder must insert both `categories` and `category_translations` rows. Forgetting translations results in null category names on the storefront.
- **AllowedFilter exposes unintended columns:** Any filter not in `allowedFilters()` is silently ignored, not an error (by default). Ensure the allowed list is explicit and never pass `AllowedFilter::partial('*')`.
- **whereFullText on empty strings:** MySQL `MATCH AGAINST` with an empty search string returns 0 rows, not all rows. Wrap the search filter in a conditional: only apply it when the search value is non-empty. The `callback` filter approach handles this naturally.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File upload + conversions | Custom file move + GD resize code | `spatie/laravel-medialibrary` | Handles S3/local disk, conversion queuing, responsive images, collection validation, deletion cascades; 50M+ downloads |
| Filtered/sorted/paginated API | Manual `if ($request->has('filter'))` chains | `spatie/laravel-query-builder` | Prevents unallowed filter injection, handles type coercion, pagination, sorting, includes in one fluent API |
| Full-text search | `LIKE '%query%'` on every column | `whereFullText()` + FULLTEXT index | LIKE does full table scan; MySQL FULLTEXT index uses inverted index for O(log n) lookup; handles word stemming |
| URL filter state (catalog) | `useState` + manual URL sync | `useSearchParams` (react-router v7) | Built-in; survives page reload; shareable filter URLs; back-button works |
| Product image gallery | Third-party carousel library | MUI Box + Stack + useState | 3-8 images per product doesn't need a full carousel; avoids 50KB bundle cost; no animation dependencies |
| Price formatting | Custom string builder for MAD | `formatCurrency()` utility (Phase 1) | Already built with `Intl.NumberFormat('ar-MA-u-nu-latn')`; reuse it |

**Key insight:** The Spatie packages eliminate the two hardest parts of a product catalog API — safe parameterized filtering and media file management with conversions. Both have been solving edge cases in production for years.

---

## Common Pitfalls

### Pitfall 1: GD Extension Not Enabled (BLOCKING)

**What goes wrong:** `php artisan tinker` works, migrations run, but when you upload an image and trigger a conversion, PHP throws `Class "GdImage" not found` or `Call to undefined function imagecreatefromjpeg()`. Medialibrary silently fails to generate thumbnails.
**Why it happens:** The GD and exif DLLs (`php_gd.dll`, `php_exif.dll`) exist in the PHP ext directory but are NOT enabled in the current project's php.ini (verified: only curl, fileinfo, intl, mbstring, openssl, pdo_mysql, pdo_sqlite, sqlite3, zip are enabled).
**How to avoid:** Add `extension=gd` and `extension=exif` to php.ini before any image upload test. Verify with `php -r "var_dump(extension_loaded('gd'));"` — must return `bool(true)`.
**Warning signs:** `var_dump(extension_loaded('gd'))` returns `bool(false)`; image upload succeeds but `$product->getMedia()->first()->getUrl('thumbnail')` returns the original URL (conversion was skipped).

### Pitfall 2: Missing `storage:link` — All Image URLs 404

**What goes wrong:** Products upload successfully, media records appear in the `media` table, `getUrl('thumbnail')` returns a URL like `http://localhost:8000/storage/1/conversions/product-thumbnail.jpg`, but the browser gets 404.
**Why it happens:** Laravel's `public` filesystem disk serves files from `storage/app/public` but this directory is not web-accessible by default. The symlink `public/storage → storage/app/public` must be created with `php artisan storage:link`.
**How to avoid:** Run `php artisan storage:link` once during setup. Check that `public/storage` exists as a symlink after running it.
**Warning signs:** Image URLs in API responses look correct but return 404 in browser; `ls public/storage` returns "No such file or directory" or is missing.

### Pitfall 3: Conversion Jobs Silently Queue Without a Worker

**What goes wrong:** Images upload, but thumbnails never appear. The media table shows the original file but conversions are empty. The API returns `thumbnail: null` or the original URL instead of the conversion URL.
**Why it happens:** `queue_conversions_by_default` in medialibrary config defaults to `true`. The project uses `QUEUE_CONNECTION=database`. No queue worker is running during development.
**How to avoid:** Add `QUEUE_CONVERSIONS_BY_DEFAULT=false` to `.env` for local development. Alternatively, add `->nonQueued()` to each conversion in `registerMediaConversions()`. For production, start a queue worker: `php artisan queue:work`.
**Warning signs:** Conversion files missing from `storage/app/public/{model_id}/conversions/`; `getUrl('thumbnail')` returns the original URL; conversion column in media table is `null`.

### Pitfall 4: N+1 Queries on Product Listing

**What goes wrong:** Listing 12 products executes 13+ queries: one for the products, one per product for translations, one per product for media. Laravel Debugbar shows 25+ queries on a single page load.
**Why it happens:** Not eager-loading `translations`, `media`, and `category` in the QueryBuilder query. `getMedia()` and accessing `$product->translations->first()` in a loop each trigger lazy loads.
**How to avoid:** Always include `->with(['translations', 'media', 'category'])` on the QueryBuilder query (filtered by locale for translations). In `ProductResource`, use `$this->whenLoaded('media', ...)` to only include media when it was eager-loaded.
**Warning signs:** Debugbar shows repeated identical queries with different `product_id`; page load gets slower as product count grows linearly.

### Pitfall 5: FULLTEXT Minimum Word Length

**What goes wrong:** Searching for short words (2-3 characters like "go", "v8") returns no results even though products contain those strings. The `whereFullText` call silently ignores the term.
**Why it happens:** MySQL has a minimum word length for FULLTEXT search (default 4 characters for InnoDB in MySQL 8). Words shorter than `ft_min_word_len` are not indexed.
**How to avoid:** For catalog search, consider supplementing `whereFullText` with a fallback `orWhere('product_translations.name', 'LIKE', "%{$value}%")` for very short queries (< 4 chars). Alternatively, accept the limitation — most product searches are for model names/descriptions which are longer.
**Warning signs:** Short search terms return empty results while longer searches work; the issue is database-configuration-level and not visible in application logs.

### Pitfall 6: Multipart FormData Axios Content-Type

**What goes wrong:** Image upload request fails with Laravel 422 "The images field is required" or images array is empty on the server.
**Why it happens:** When `Content-Type: multipart/form-data` is explicitly set but the `boundary` is missing, browsers don't auto-generate it. Alternatively, if Axios is configured with a global `Content-Type: application/json` header, it overrides the per-request multipart header.
**How to avoid:** When building FormData for file uploads, either let the browser set Content-Type automatically (omit `Content-Type` header on the request entirely — Axios will do it with the correct boundary), or set `'Content-Type': 'multipart/form-data'` per-request which allows Axios to append the boundary. Never rely on the global Axios instance header for multipart requests.
**Warning signs:** Laravel shows the file field as missing in validation errors; `dd($request->allFiles())` returns empty array; browser DevTools shows Content-Type header missing the boundary parameter.

### Pitfall 7: product_translations locale field still contains 'ar'

**What goes wrong:** Code uses `app()->getLocale()` which returns `'fr'` or `'en'` (since Arabic was removed in Phase 1), but the product_translations table schema still has a comment noting `'fr', 'ar', 'en'`. If any old seeder or code creates an `ar` locale row, the locale filter returns empty results for FR/EN users because two rows exist per product.
**Why it happens:** The migration comment says 'ar' but the application no longer supports Arabic. Seeders written before the Arabic removal decision may still insert `ar` rows.
**How to avoid:** All Phase 2 seeders must only insert translations for `fr` and `en` locales. The `SetLocale` middleware already restricts to `['fr', 'en']` (updated from Phase 1's `['fr', 'ar', 'en']`). Add a database comment or check constraint note in the seeder: only `fr` and `en` are valid locales.
**Warning signs:** Products appear in admin but not on storefront; `product_translations` table has rows where `locale = 'ar'` which confuse the UI locale detection.

---

## Code Examples

Verified patterns from official sources:

### FULLTEXT Search on product_translations (locale-scoped)

```php
// Source: https://laravel.com/docs/12.x/queries#full-text-where-clauses
// Used in AllowedFilter::callback('search', ...) in ProductController
Product::query()
    ->whereHas('translations', function ($query) use ($searchTerm, $locale) {
        $query->where('locale', $locale)
              ->when(strlen($searchTerm) >= 4, fn ($q) =>
                  $q->whereFullText(['name', 'description'], $searchTerm),
                fn ($q) =>
                  $q->where(fn ($qq) =>
                      $qq->where('name', 'LIKE', "%{$searchTerm}%")
                         ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                  )
              );
    })
    ->with(['translations' => fn ($q) => $q->where('locale', $locale)])
    ->get();
```

### Spatie Query Builder — Full Catalog Query

```php
// Source: https://spatie.be/docs/laravel-query-builder/v6/features/filtering
// Combined: filters + sort + pagination
$products = QueryBuilder::for(
        Product::query()
            ->where('is_active', true)
            ->with(['translations', 'media', 'category.translations'])
    )
    ->allowedFilters([
        AllowedFilter::exact('category_id'),
        AllowedFilter::callback('min_price', fn ($q, $v) => $q->where('price', '>=', (int) $v)),
        AllowedFilter::callback('max_price', fn ($q, $v) => $q->where('price', '<=', (int) $v)),
        AllowedFilter::callback('in_stock', fn ($q, $v) => $q->where('stock_quantity', '>', 0)),
        AllowedFilter::callback('search', fn ($q, $v) => /* see above */),
    ])
    ->allowedSorts(['price', 'created_at'])
    ->defaultSort('-created_at')
    ->paginate(12)
    ->appends(request()->query());

return ProductResource::collection($products);
```

### MediaResource (for admin image management)

```php
// Source: https://spatie.be/docs/laravel-medialibrary/v11/basic-usage/retrieving-media
// app/Http/Resources/MediaResource.php
class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'thumbnail' => $this->getUrl('thumbnail'),
            'card'      => $this->getUrl('card'),
            'full'      => $this->getUrl('full'),
            'original'  => $this->original_url,
            'size'      => $this->human_readable_size,
            'mime_type' => $this->mime_type,
        ];
    }
}
```

### TanStack Query useQuery for Product Catalog

```typescript
// Source: https://tanstack.com/query/v5/docs/framework/react/overview
// src/features/catalog/api/products.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';

interface CatalogFilters {
  'filter[category_id]'?: string;
  'filter[min_price]'?: string;
  'filter[max_price]'?: string;
  'filter[in_stock]'?: string;
  'filter[search]'?: string;
  sort?: string;
  page?: number;
}

export function useProducts(filters: CatalogFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await apiClient.get('/products', { params: filters });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${slug}`);
      return response.data;
    },
    enabled: Boolean(slug),
  });
}
```

### Delivery Zone Seeder (DLVR-02)

```php
// database/seeders/DeliveryZoneSeeder.php
// Note: delivery_zones.city_ar column exists but AR was removed in Phase 1
// Leave city_ar as null for now; it can be populated in v2 content pass
class DeliveryZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            ['city' => 'Casablanca',  'city_ar' => null, 'fee' => 3000],  // 30 MAD
            ['city' => 'Rabat',       'city_ar' => null, 'fee' => 3500],
            ['city' => 'Marrakech',   'city_ar' => null, 'fee' => 4000],
            ['city' => 'Fes',         'city_ar' => null, 'fee' => 4000],
            ['city' => 'Tangier',     'city_ar' => null, 'fee' => 4500],
        ];
        foreach ($zones as $zone) {
            \App\Models\DeliveryZone::firstOrCreate(['city' => $zone['city']], $zone);
        }
    }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate `intervention/image` for resize | `spatie/laravel-medialibrary` with `spatie/image` dependency | Medialibrary v8+ | Medialibrary now handles the full file + conversion pipeline; no need for separate Intervention/Image package |
| `whereRaw('MATCH(...) AGAINST(?)')` | `->whereFullText(['col1','col2'], $query)` | Laravel 9+ | Eloquent-native; database-agnostic syntax; MySQL generates `MATCH AGAINST` |
| `react-router-dom` | `react-router` (v7) | Nov 2024 | Already established in Phase 1; applies to new routes added in Phase 2 |
| Query string filtering by hand | `spatie/laravel-query-builder` | Ongoing best practice | Consistent pattern; prevents SQL injection via allowedFilters whitelist |
| `addMediaFromRequest()` for single file | `addMultipleMediaFromRequest()` or loop with `addMedia($file)` | Medialibrary v7+ | Multiple images via file array requires iteration; `addMultipleMediaFromRequest` handles array inputs |

**Deprecated/outdated:**
- `intervention/image` standalone: No longer needed — `spatie/laravel-medialibrary` bundles `spatie/image` which uses GD or Imagick internally.
- `php_gd2.dll` on Windows: Renamed to `php_gd.dll` in PHP 8.0. Use `extension=gd` (not `extension=gd2`) in php.ini.

---

## Open Questions

1. **SetLocale middleware: still references 'ar'**
   - What we know: Phase 1 SetLocale middleware has `$supported = ['fr', 'ar', 'en']` — Arabic was removed but the middleware may not have been updated.
   - What's unclear: Whether the middleware was updated to `['fr', 'en']` as part of the Arabic removal commit (5f7d38c).
   - Recommendation: In 02-01, verify SetLocale middleware contains `['fr', 'en']` and update if still showing `'ar'`. This is low-risk but ensures locale resolution is clean.

2. **Category naming: slug-only vs. translated name**
   - What we know: The existing categories table has a global `slug` column (not per-locale). Category names need to be displayed in the UI in FR/EN.
   - What's unclear: Whether a `category_translations` migration is the right scope for 02-01 or if a simpler approach (e.g., a `name` column in `categories`) is acceptable given only 2 locales.
   - Recommendation: Use the `category_translations` table pattern (consistent with `product_translations`) since REQUIREMENTS.md states "admin can create, edit, and delete categories" with the implication of translatable content (PROD-04). One table pattern across the app is cleaner than mixing approaches.

3. **Admin image deletion**
   - What we know: PROD-11 requires admin to manage stock/visibility, PROD-03 requires multiple images. The spec doesn't explicitly mention deleting individual images from a product.
   - What's unclear: Whether 02-03 (admin product management) should include per-image delete functionality.
   - Recommendation: Include basic image delete in 02-03. Medialibrary provides `$media->delete()` which also removes the file from disk. This is simple to implement and avoids a later cleanup plan.

4. **GD image quality on Windows for JPEG**
   - What we know: GD on Windows can produce slightly different compression artifacts than on Linux. The thumbnails will work but quality may differ between dev and production.
   - What's unclear: Whether the current Windows dev environment needs specific GD quality config in `config/media-library.php`.
   - Recommendation: Accept default GD settings for Phase 2. Tune quality in a later phase if needed. This is a polish concern, not a blocking one.

---

## Sources

### Primary (HIGH confidence)

- [spatie/laravel-medialibrary Packagist](https://packagist.org/packages/spatie/laravel-medialibrary) — version 11.19.0, PHP ^8.2, Laravel ^12.0 compatibility confirmed
- [spatie/laravel-query-builder Packagist](https://packagist.org/packages/spatie/laravel-query-builder) — version 6.4.1, PHP ^8.2, Laravel 12 compatibility confirmed
- [Medialibrary v11 Installation](https://spatie.be/docs/laravel-medialibrary/v11/installation-setup) — install steps, disk config, queue config
- [Medialibrary v11 Defining Conversions](https://spatie.be/docs/laravel-medialibrary/v11/converting-images/defining-conversions) — `registerMediaConversions`, `addMediaConversion`, `nonQueued()`
- [Medialibrary v11 Preparing Model](https://spatie.be/docs/laravel-medialibrary/v11/basic-usage/preparing-your-model) — `HasMedia`, `InteractsWithMedia`, `registerMediaCollections`
- [Medialibrary v11 Adding Files](https://spatie.be/docs/laravel-medialibrary/v11/api/adding-files) — `addMedia`, `addMultipleMediaFromRequest`, `toMediaCollection`
- [Medialibrary v11 Retrieving Media](https://spatie.be/docs/laravel-medialibrary/v11/basic-usage/retrieving-media) — `getMedia`, `getFirstMediaUrl`, `getUrl('conversion')`
- [Medialibrary v11 Collections](https://spatie.be/docs/laravel-medialibrary/v11/working-with-media-collections/defining-media-collections) — `singleFile`, `acceptsMimeTypes`, `onlyKeepLatest`
- [Query Builder v6 Filtering](https://spatie.be/docs/laravel-query-builder/v6/features/filtering) — all filter types, operator filters, callback filters
- [Query Builder v6 Pagination](https://spatie.be/docs/laravel-query-builder/v6/advanced-usage/pagination) — `paginate()`, `appends()`
- [Laravel 12 whereFullText](https://laravel.com/docs/12.x/queries#full-text-where-clauses) — method signature, MySQL MATCH AGAINST generation
- [Laravel 12 fullText() migration](https://laravel.com/docs/12.x/migrations#creating-indexes) — `$table->fullText()`, `dropFullText()`
- [Laravel 12 Eloquent Resources](https://laravel.com/docs/12.x/eloquent-resources) — `whenLoaded`, ResourceCollection, pagination structure
- [TanStack Query v5 Mutations](https://tanstack.com/query/v5/docs/framework/react/guides/mutations) — useMutation, onSuccess invalidateQueries
- [WhatsApp API FAQ](https://faq.whatsapp.com/425247423114725/) — wa.me link format, ?text= pre-filled message
- Actual project php.ini inspection — confirmed GD/exif DLLs present but NOT enabled (direct file read)

### Secondary (MEDIUM confidence)

- [Spatie queue_conversions_by_default issues](https://github.com/spatie/laravel-medialibrary/issues/1484) — community-confirmed: `nonQueued()` or `QUEUE_CONVERSIONS_BY_DEFAULT=false` for sync conversions
- [Medialibrary N+1 eager loading](https://github.com/spatie/laravel-medialibrary/issues/1536) — `with('media')` required; community-confirmed pattern
- [GD renamed to php_gd.dll in PHP 8.0](https://php.watch/versions/8.0/gd2-gd-windows) — extension name change verified

### Tertiary (LOW confidence — validate during implementation)

- FULLTEXT minimum word length MySQL 8 default (4 chars for InnoDB) — documented in MySQL manual but not re-verified against MySQL 8.4 release notes; test during implementation
- Image quality difference GD Windows vs Linux — LOW confidence, LOW risk; accept defaults for Phase 2

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed against Packagist (Feb 2026 releases); PHP/Laravel compatibility confirmed
- Architecture: HIGH — patterns sourced from official Spatie docs and Laravel 12 docs; project-specific adaptations are logical extensions of Phase 1 patterns
- Pitfalls: HIGH for GD/storage link/queue (directly verified against project php.ini + documented Spatie issues); MEDIUM for FULLTEXT min-word-length (MySQL documentation, not re-tested on 8.4)
- Code examples: HIGH for medialibrary/query-builder patterns (official docs); HIGH for frontend patterns (established Phase 1 stack, TanStack Query v5 official docs)

**Research date:** 2026-02-15
**Valid until:** 2026-03-17 (30 days — spatie packages are in stable maintenance; Laravel 12, React 19, MUI 7 are active with no imminent breaking releases)
