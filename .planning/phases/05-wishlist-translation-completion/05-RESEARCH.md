# Phase 5: Wishlist and Translation Completion - Research

**Researched:** 2026-02-19
**Domain:** Wishlist (Laravel pivot table + React feature) + i18n audit (i18next FR/EN)
**Confidence:** HIGH — entire stack already in place; patterns verified against live codebase

---

## Summary

Phase 5 has two unrelated sub-problems that share no code. The wishlist (05-01) is a standard authenticated-user feature: a pivot table between `users` and `products`, two REST endpoints (toggle and list), a new `features/wishlist/` frontend folder with a TanStack Query hook, a heart icon button on the product detail page, and a wishlist view inside the user account section. The translation audit (05-02) is a systematic diff between the keys actually called by `t()` in the frontend source and the keys present in the two translation files, followed by filling every gap.

The good news on the translation audit: the codebase is already well-structured. Every call to `t()` in `.tsx` files was inventoried in this research. The EN and FR `translation.json` files appear to contain keys for every namespace used in production screens. The only verified gap is a single hardcoded string `"Order not found"` in `AdminOrderDetailPage.tsx` line 99 that bypasses `t()` entirely. A thorough audit pass is still warranted because the `deliveryZones.cityAr` key exists in both translation files (leftover from when Arabic was supported) but the field was removed from the UI — this is dead weight that should be cleaned up but does not cause missing-key errors. The `smoke_test.*` namespace is dev-only scaffolding that can stay or be removed.

The wishlist backend requires one migration, one model, and one controller — no new service class is needed because the logic is trivial (attach/detach pivot row, no business rules beyond "user must own the wishlist entry"). The frontend requires one new Zustand store is NOT needed — wishlist state is server-authoritative and should live in TanStack Query alone (no localStorage persistence required). The wishlist page lives at `/wishlist` behind `ProtectedRoute`, and a nav link should be added to the Navbar user menu alongside "My Orders" and "Profile".

**Primary recommendation:** Build wishlist as a simple pivot-table feature (no dedicated service class, no Zustand store). Run the i18n audit as a key-diff script rather than manual inspection — extract all `t('key')` patterns from source, compare against the JSON trees, and fill gaps systematically.

---

## Codebase State (What Already Exists)

### Already Shipped — Do Not Rebuild

| What | Where | Notes |
|------|-------|-------|
| User model | `trotinette-api/app/Models/User.php` | `HasApiTokens`, `HasRoles`, `HasFactory` — add `wishlists()` relation here |
| Product model | `trotinette-api/app/Models/Product.php` | `HasMedia`, full fillable list — add `wishlistedBy()` relation here |
| Auth guard | `trotinette-api/app/Http/Controllers/Customer/AuthController.php` | `auth:sanctum` middleware enforces authentication on protected routes |
| API routes file | `trotinette-api/routes/api.php` | Wishlist routes go inside the existing `auth:sanctum` group |
| TanStack Query pattern | `trotinette-frontend/src/features/orders/api/orders.ts` | `useQuery` + `useMutation` + `useQueryClient` + `invalidateQueries` |
| Axios API client | `trotinette-frontend/src/shared/api/client.ts` | Bearer token + Accept-Language injected automatically |
| ProtectedRoute | `trotinette-frontend/src/shared/components/ProtectedRoute.tsx` | Wrap `/wishlist` route here |
| Router | `trotinette-frontend/src/app/router.tsx` | Add `/wishlist` inside `ProtectedRoute` children |
| Navbar user menu | `trotinette-frontend/src/shared/components/Navbar.tsx` | Add wishlist menu item alongside Profile and My Orders |
| Product types | `trotinette-frontend/src/features/catalog/types.ts` | `Product` interface — API can return `is_wishlisted: boolean` |
| ProductDetailPage | `trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx` | Add wishlist toggle button here |
| EN translation file | `trotinette-frontend/src/locales/en/translation.json` | Add `wishlist.*` namespace; audit all other keys |
| FR translation file | `trotinette-frontend/src/locales/fr/translation.json` | Add `wishlist.*` namespace; audit all other keys |
| i18n config | `trotinette-frontend/src/app/i18n.ts` | FR + EN only, `fallbackLng: 'fr'`, imports both JSON files directly |
| useLanguage hook | `trotinette-frontend/src/shared/hooks/useLanguage.ts` | Sole entry point for locale changes — do not call `i18n.changeLanguage()` elsewhere |

### What Phase 5 Must Build (nothing pre-exists for these)

- `wishlists` pivot table migration
- `Wishlist` model (or use direct pivot attach/detach on User)
- `Customer\WishlistController` (index + toggle)
- Wishlist routes in `api.php`
- `WishlistResource` or inline resource in controller
- `features/wishlist/` frontend folder with `api/wishlist.ts`, `pages/WishlistPage.tsx`, `types.ts`
- Wishlist toggle button in `ProductDetailPage`
- `is_wishlisted` flag on product API responses (only for authenticated requests)
- `/wishlist` route in router, link in Navbar
- New `wishlist.*` i18n keys in both JSON files
- Translation audit: diff all `t('key')` calls against JSON trees and fill gaps
- Remove/replace hardcoded `"Order not found"` string in `AdminOrderDetailPage.tsx`

---

## Standard Stack

### Core (no new packages needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Laravel 12 | `^12.0` | Backend framework | Already installed |
| Laravel Sanctum | `^4.3` | API auth | Already installed — wishlist endpoints use `auth:sanctum` |
| TanStack Query | `^5.90.21` | Server state (wishlist list + toggle) | Already installed — no Zustand needed for wishlist |
| React + MUI 7 | `^19.2.0` / `^7.3.8` | UI components | Already installed |
| i18next + react-i18next | `^25.8.7` / `^16.5.4` | Translations | Already installed |
| Zod | `^4.3.6` | Form validation | Available if wishlist ever needs a form (it does not in this phase) |

No new `npm install` or `composer require` commands are needed for Phase 5.

---

## Architecture Patterns

### Backend: Wishlist as Pivot (No Service Class)

The wishlist is a many-to-many pivot between `users` and `products`. The controller is responsible for:
1. List: return the authenticated user's wishlisted products (eager-loaded with translations)
2. Toggle: if the product is already in the wishlist, detach it; if not, attach it

No service class is warranted because there are no complex business rules (no stock checks, no transactions, no state machines). A thin controller calling `$user->wishlist()->toggle($productId)` is the correct pattern.

**Migration pattern** (matches existing project style):
```php
// Source: existing migrations in trotinette-api/database/migrations/
Schema::create('wishlists', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('product_id')->constrained()->cascadeOnDelete();
    $table->timestamps();

    $table->unique(['user_id', 'product_id']); // prevent duplicate pivot rows
});
```

**Model relation pattern** (matches `User.php` and `Product.php` existing style):
```php
// In User.php
public function wishlist(): BelongsToMany
{
    return $this->belongsToMany(Product::class, 'wishlists')->withTimestamps();
}

// In Product.php
public function wishlistedBy(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'wishlists')->withTimestamps();
}
```

**Controller pattern** (matches `Customer\OrderController.php` style — thin, no service):
```php
// Customer\WishlistController
public function index(Request $request): ResourceCollection
{
    $products = $request->user()
        ->wishlist()
        ->with(['translations', 'media'])
        ->paginate(20);

    return ProductResource::collection($products);
}

public function toggle(Request $request, Product $product): JsonResponse
{
    $result = $request->user()->wishlist()->toggle($product->id);
    $added = count($result['attached']) > 0;

    return response()->json([
        'is_wishlisted' => $added,
        'product_id'    => $product->id,
    ]);
}
```

**Routes** (inside existing `auth:sanctum` group in `api.php`):
```php
Route::get('/wishlist',           [WishlistController::class, 'index']);
Route::post('/wishlist/{product}', [WishlistController::class, 'toggle']);
```

### Backend: `is_wishlisted` on ProductResource

The product detail page needs to show whether the current user has wishlisted a product. This requires a context-aware flag in `ProductResource`. The cleanest approach: pass the authenticated user's wishlist product IDs as additional data when rendering the resource, or use `whenLoaded` with a boolean.

**Simpler approach** (verified against existing `ProductResource` pattern):
```php
// In ProductResource::toArray()
'is_wishlisted' => $this->whenLoaded('wishlistedBy', fn () =>
    $this->wishlistedBy->contains(auth()->id())
),
```

The controller eager-loads `wishlistedBy` only for authenticated requests. For unauthenticated catalog browsing, the field is omitted via `whenLoaded`.

Alternatively: in the single product detail endpoint, add a raw check:
```php
'is_wishlisted' => auth()->check()
    ? $this->wishlistedBy()->where('user_id', auth()->id())->exists()
    : false,
```

The single-product check (`exists()`) is one DB query and is acceptable for the product detail page. The catalog list should NOT include `is_wishlisted` per product (N+1 risk for a public endpoint).

### Frontend: Wishlist Feature Folder

Pattern is identical to `features/orders/` — `api/`, `pages/`, `types.ts`:

```
trotinette-frontend/src/features/wishlist/
├── api/
│   └── wishlist.ts       # useWishlist, useToggleWishlist
├── pages/
│   └── WishlistPage.tsx  # /wishlist route — list of wishlisted products
└── types.ts              # WishlistProduct type (extends Product + is_wishlisted)
```

**TanStack Query hook pattern** (matches `features/orders/api/orders.ts`):
```typescript
// Source: existing pattern in features/orders/api/orders.ts

export function useWishlist() {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<Product>>('/wishlist');
      return res.data;
    },
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiClient.post<{ is_wishlisted: boolean; product_id: number }>(
        `/wishlist/${productId}`
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate both wishlist list and the specific product detail cache
      void queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

**Wishlist toggle button in ProductDetailPage** — add an IconButton with FavoriteIcon / FavoriteBorderIcon from `@mui/icons-material` (already installed), visible only when user is authenticated (read from `useAuthStore`). Use optimistic UI only if the toggle is visually slow; otherwise pessimistic (wait for mutation to complete) is simpler and safer.

**WishlistPage** — the `/wishlist` page should display a grid of product cards (reuse or adapt the existing product card component from the catalog). Each card links to `/products/:slug`. An empty state shows a message + "Browse Catalog" link (matching the `noOrders` empty state pattern in `MyOrdersPage`).

### Frontend: i18n Audit Strategy

**Audit approach:**
1. Extract all `t('key')` patterns from every `.tsx` and `.ts` file
2. Flatten both `en/translation.json` and `fr/translation.json` into dot-notation key lists
3. Find keys in source that are not in JSON (missing translations)
4. Find keys in JSON that are not in source (dead keys — `deliveryZones.cityAr`, `smoke_test.*`)

**Known gaps found during research:**

| Location | Issue | Fix |
|----------|-------|-----|
| `AdminOrderDetailPage.tsx:99` | Hardcoded `"Order not found"` — bypasses `t()` | Add `orders.notFound` key, use `t('orders.notFound')` |
| `AdminDeliveryZonesPage.tsx:352,360` | `title="Edit"` and `title="Delete"` on icon buttons | Add `common.edit` / `common.delete` or use existing `admin.products.edit` / `admin.products.delete` |
| `CategoryForm.tsx:126` | `label="Slug"` hardcoded | Add `admin.categories.slug` (already exists in JSON) — just needs `t()` call |
| `ProductForm.tsx:226` | `label="Stock"` hardcoded | Add `admin.products.stock` (already exists in JSON) — just needs `t()` call |
| `ProductGallery.tsx:44` | `alt="Product"` hardcoded | Add `product.imageAlt` key to both locales |
| Both JSON files | `deliveryZones.cityAr` key exists but Arabic was removed | Remove this dead key from both files |
| Both JSON files | `smoke_test.*` namespace is dev-only scaffolding | Remove or retain (no user impact) |

**New `wishlist.*` namespace needed in both JSON files:**

EN keys to add:
```json
"wishlist": {
  "title": "My Wishlist",
  "empty": "Your wishlist is empty",
  "browseCatalog": "Browse Catalog",
  "add": "Add to wishlist",
  "remove": "Remove from wishlist",
  "added": "Added to wishlist",
  "removed": "Removed from wishlist",
  "navLabel": "Wishlist"
}
```

FR keys to add:
```json
"wishlist": {
  "title": "Ma liste de souhaits",
  "empty": "Votre liste de souhaits est vide",
  "browseCatalog": "Parcourir le catalogue",
  "add": "Ajouter aux souhaits",
  "remove": "Retirer des souhaits",
  "added": "Ajouté à la liste de souhaits",
  "removed": "Retiré de la liste de souhaits",
  "navLabel": "Liste de souhaits"
}
```

**Also needed:** `orders.notFound` in both files for the hardcoded string in `AdminOrderDetailPage`.

EN: `"notFound": "Order not found"`
FR: `"notFound": "Commande introuvable"`

### Anti-Patterns to Avoid

- **Zustand for wishlist state:** Wishlist is server-authoritative. Do not replicate it in localStorage-persisted Zustand. Use TanStack Query's cache — toggling invalidates `['wishlist']` and `['products']` queries.
- **Calling `i18n.changeLanguage()` directly:** The project decision is to use `useLanguage` hook exclusively. Do not bypass this.
- **Adding `is_wishlisted` to the public catalog list endpoint:** This would cause N+1 queries for unauthenticated catalog browsing. Only add it to the authenticated single-product detail endpoint.
- **Separate WishlistService class:** The business logic is two lines (attach/detach). A service class would be over-engineering. The controller handles it directly.
- **Assuming `t()` with a `defaultValue` fallback means the key is "done":** In `CheckoutPage.tsx:86`, the pattern `t('checkout.orderError', 'An error occurred...')` passes a fallback string. This key IS in both JSON files, so this is fine. But any key using a fallback without a JSON entry is a bug.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pivot table toggle | Custom insert/delete logic | `belongsToMany()->toggle()` | Laravel returns attached/detached arrays; handles unique constraint |
| Wishlist count badge in nav | Custom counter | TanStack Query `data.meta.total` from `useWishlist` | Server-authoritative, no stale state |
| Translation key audit | Manual JSON inspection | Grep all `t('key')` patterns, flatten JSON, diff | Exhaustive; no missed keys |
| Duplicate wishlist entries | Application-level check | Unique DB constraint on `(user_id, product_id)` | DB enforces it; no race conditions |

---

## Common Pitfalls

### Pitfall 1: `is_wishlisted` on Public Catalog Endpoint
**What goes wrong:** Adding `is_wishlisted` to the product list (`GET /products`) endpoint causes `auth()->check()` to run for every product on every page load for unauthenticated users, and if you try to eager-load `wishlistedBy` for the full catalog, it's an N+1.
**How to avoid:** Only include `is_wishlisted` on the authenticated single-product detail endpoint (`GET /products/{slug}`). The toggle button on `ProductDetailPage` has the data it needs. The `WishlistPage` already knows which products are wishlisted (it only shows wishlisted products).
**Warning signs:** If `GET /products` adds an auth check or a `wishlistedBy` join.

### Pitfall 2: Stale Wishlist State After Toggle
**What goes wrong:** User toggles wishlist, UI updates via optimistic state, but the product detail page reloads and shows the old state because the query cache wasn't invalidated.
**How to avoid:** In `useToggleWishlist.onSuccess`, invalidate both `['wishlist']` and `['products', slug]` (or the broader `['products']` key). The `useProduct` hook uses `queryKey: ['products', slug]` so `invalidateQueries({ queryKey: ['products'] })` covers it.
**Warning signs:** Wishlist toggle appears to work but refreshing the page shows wrong state.

### Pitfall 3: Missing Translation Keys with Fallback Hiding the Bug
**What goes wrong:** A component uses `t('some.key', 'English fallback')` — the fallback text appears correct, so the missing key is never noticed. Switch to FR and the fallback shows English text.
**How to avoid:** During the audit, search for `t('key', '` patterns (t() with two arguments where the second is a string) — these are potential missing-key disguises. Verify each has a corresponding JSON entry.
**Warning signs:** Language switch leaves some strings in English when FR is selected.

### Pitfall 4: Forgetting to Add `wishlist` Nav Link for Mobile / User Menu
**What goes wrong:** Wishlist page exists at `/wishlist` but there is no navigation link to it. The Navbar user dropdown menu is the correct place (alongside Profile and My Orders).
**How to avoid:** The Navbar user menu already has `ReceiptLongIcon` for Orders and `PersonOutlineIcon` for Profile. Add `FavoriteIcon` for Wishlist in the same pattern.
**Warning signs:** `/wishlist` is reachable by URL but not discoverable through the UI.

### Pitfall 5: `deliveryZones.cityAr` Dead Key Left in JSON
**What goes wrong:** Arabic was removed in Phase 1 but `deliveryZones.cityAr` remains in both JSON files. The `AdminDeliveryZonesPage` form still has a `cityAr` field label referencing this key. If the field was removed from the UI, the key is dead weight. If the field still exists in the admin UI, it needs to be verified or removed.
**How to avoid:** Audit whether `cityAr` is still used in `AdminDeliveryZonesPage.tsx`. If the form field was removed, delete the JSON key and any `deliveryZones.cityAr` usage.
**Warning signs:** `cityAr` appears in JSON but not in any `t()` call in source.

---

## Code Examples

### ProductResource with Conditional `is_wishlisted` (Backend)
```php
// Source: adapted from existing trotinette-api/app/Http/Resources/ProductResource.php
public function toArray(Request $request): array
{
    $translation = $this->translations->first();

    return [
        'id'             => $this->id,
        'sku'            => $this->sku,
        // ... existing fields ...
        'is_wishlisted'  => auth()->check()
            ? $this->wishlistedBy->contains(auth()->id())
            : false,
    ];
}
```

Note: Only eager-load `wishlistedBy` in the single product endpoint, not the catalog list.

### WishlistController (Backend)
```php
// Source: pattern from trotinette-api/app/Http/Controllers/Customer/OrderController.php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class WishlistController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $products = $request->user()
            ->wishlist()
            ->with(['translations', 'media'])
            ->paginate(20);

        return ProductResource::collection($products);
    }

    public function toggle(Request $request, Product $product): JsonResponse
    {
        $result = $request->user()->wishlist()->toggle($product->id);
        $added  = count($result['attached']) > 0;

        return response()->json([
            'is_wishlisted' => $added,
            'product_id'    => $product->id,
        ]);
    }
}
```

### Wishlist Toggle Button in ProductDetailPage (Frontend)
```tsx
// Source: adapted from trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import { useToggleWishlist } from '../../wishlist/api/wishlist';
import { useAuthStore } from '../../auth/store';

// Inside the component:
const user = useAuthStore((s) => s.user);
const toggleWishlist = useToggleWishlist();
const isWishlisted = product.is_wishlisted ?? false;

// In the JSX actions Stack:
{user && (
  <IconButton
    onClick={() => toggleWishlist.mutate(product.id)}
    aria-label={isWishlisted ? t('wishlist.remove') : t('wishlist.add')}
    color={isWishlisted ? 'error' : 'default'}
    disabled={toggleWishlist.isPending}
  >
    {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
  </IconButton>
)}
```

### Wishlist Route in Router (Frontend)
```tsx
// Source: trotinette-frontend/src/app/router.tsx — add inside ProtectedRoute children
import { WishlistPage } from '../features/wishlist/pages/WishlistPage';

// Inside ProtectedRoute children array:
{
  path: '/wishlist',
  element: <WishlistPage />,
},
```

### i18n Audit — Key Extraction (Development Utility)
```bash
# Extract all t('key') patterns from source
grep -roh "t('[^']*')" src/ --include="*.tsx" --include="*.ts" \
  | grep -oP "t\('\K[^']+" \
  | sort -u > /tmp/used-keys.txt

# Then compare against flattened JSON to find missing keys
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Server-side wishlist with session | Client-agnostic REST pivot table | Works with Sanctum stateless API |
| i18next namespace files per feature | Single `translation.json` per locale | Project already uses single-file approach — continue this pattern |
| RTL + Arabic | FR + EN only | Arabic removed in Phase 1 — no RTL work needed in Phase 5 |

---

## Open Questions

1. **Should `cityAr` form field be removed from AdminDeliveryZonesPage?**
   - What we know: Arabic was removed as a language in Phase 1. The `deliveryZones.cityAr` key exists in both JSON files and the `DeliveryZone` model likely still has a `city_ar` column.
   - What's unclear: Whether the admin UI still renders a `city_ar` input. If yes, should it be removed or kept as internal-only Arabic label (for the admin's reference)?
   - Recommendation: Audit `AdminDeliveryZonesPage.tsx` during 05-02. If the field still renders, keep it and leave the JSON key. If not, remove the dead JSON key.

2. **Should WishlistPage use a card grid (matching CatalogPage) or a list layout?**
   - What we know: MUI 7 Grid and the product card components from catalog already exist.
   - What's unclear: No user decision was made (no CONTEXT.md).
   - Recommendation: Use a card grid (same layout as CatalogPage) — reuse the existing product card component or a simplified version of it. This is Claude's discretion.

3. **Should the `smoke_test.*` namespace be removed from both JSON files?**
   - What we know: `smoke_test.*` is dev scaffolding from Phase 1. It causes no errors.
   - Recommendation: Remove it during the 05-02 translation audit — it is dead weight and will confuse future developers.

---

## Sources

### Primary (HIGH confidence)
- Live codebase at `C:/Users/User/Desktop/TrotinetteApp/` — all patterns verified by direct file reads
- `trotinette-api/routes/api.php` — verified existing auth middleware group structure
- `trotinette-api/app/Http/Controllers/Customer/OrderController.php` — thin controller pattern
- `trotinette-api/app/Models/User.php` — model structure for adding `wishlist()` relation
- `trotinette-api/app/Models/Product.php` — model structure for adding `wishlistedBy()` relation
- `trotinette-frontend/src/features/orders/api/orders.ts` — TanStack Query mutation/query pattern
- `trotinette-frontend/src/locales/en/translation.json` — full EN key inventory
- `trotinette-frontend/src/locales/fr/translation.json` — full FR key inventory
- `trotinette-frontend/src/app/i18n.ts` — confirmed FR+EN only, no Arabic
- `trotinette-frontend/src/shared/hooks/useLanguage.ts` — confirmed sole locale change entry point
- Grep of all `t('key')` patterns from every `.tsx`/`.ts` file — full key inventory

### Secondary (MEDIUM confidence)
- Laravel `BelongsToMany::toggle()` method — standard Laravel pivot behavior, present since Laravel 5.x; confirmed available in Laravel 12 through documentation knowledge
- MUI 7 `FavoriteIcon` and `FavoriteBorderIcon` — in `@mui/icons-material` v7.3.8 (already installed)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; entire stack is installed and in use
- Architecture patterns: HIGH — all patterns copied directly from live codebase
- i18n audit gaps: HIGH for verified hardcoded strings; MEDIUM for completeness (audit pass will confirm)
- Wishlist backend: HIGH — standard Laravel pivot; `toggle()` is well-documented
- Pitfalls: HIGH — all identified from direct codebase inspection

**Research date:** 2026-02-19
**Valid until:** 2026-03-20 (stable stack; translations and feature folder patterns are stable)
