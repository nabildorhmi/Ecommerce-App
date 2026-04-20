---
phase: quick-17
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-api/database/migrations/2026_04_19_000001_create_carts_table.php
  - trotinette-api/app/Models/Cart.php
  - trotinette-api/app/Models/CartItem.php
  - trotinette-api/app/Http/Controllers/Customer/CartController.php
  - trotinette-api/routes/api.php
  - trotinette-frontend/src/features/cart/api/cart.ts
  - trotinette-frontend/src/features/cart/store.ts
  - trotinette-frontend/src/features/auth/pages/LoginPage.tsx
autonomous: true

must_haves:
  truths:
    - "Guest users can add/remove items using localStorage (existing behavior unchanged)"
    - "Authenticated users' cart mutations persist to database"
    - "On login, localStorage cart merges with server cart (quantities summed, capped at stock)"
    - "After login sync, cart UI reflects merged server state"
    - "On logout, local cart state is cleared"
  artifacts:
    - path: "trotinette-api/database/migrations/2026_04_19_000001_create_carts_table.php"
      provides: "carts and cart_items tables"
      contains: "create_carts_table"
    - path: "trotinette-api/app/Models/Cart.php"
      provides: "Cart model with user and items relationships"
      exports: ["Cart"]
    - path: "trotinette-api/app/Models/CartItem.php"
      provides: "CartItem model with cart, product, variant relationships"
      exports: ["CartItem"]
    - path: "trotinette-api/app/Http/Controllers/Customer/CartController.php"
      provides: "Cart CRUD + sync endpoints"
      exports: ["CartController"]
    - path: "trotinette-frontend/src/features/cart/api/cart.ts"
      provides: "Cart API client functions"
      exports: ["fetchCart", "syncCart", "addCartItem", "updateCartItem", "removeCartItem", "clearCartApi"]
    - path: "trotinette-frontend/src/features/cart/store.ts"
      provides: "Hybrid cart store with server sync"
      exports: ["useCartStore"]
  key_links:
    - from: "trotinette-frontend/src/features/cart/store.ts"
      to: "/cart/sync"
      via: "syncWithServer method called after login"
      pattern: "syncCart"
    - from: "trotinette-frontend/src/features/auth/pages/LoginPage.tsx"
      to: "useCartStore.getState().syncWithServer()"
      via: "onSuccess callback in login/register mutations"
      pattern: "syncWithServer"
    - from: "trotinette-api/app/Http/Controllers/Customer/CartController.php"
      to: "Cart model + Product/Variant"
      via: "eager loading and stock validation"
      pattern: "with.*product.*variant"
---

<objective>
Implement hybrid cart persistence: localStorage for guests, database for authenticated users, with merge-on-login sync.

Purpose: Carts currently vanish when users clear browser data or switch devices. Authenticated users should have persistent server-side carts that survive across sessions and devices, while guests keep the existing localStorage behavior.

Output: Backend cart API (migration + models + controller + routes) and frontend cart store upgraded with server sync capabilities.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-api/app/Models/Product.php
@trotinette-api/app/Models/Variant.php
@trotinette-api/routes/api.php
@trotinette-frontend/src/features/cart/store.ts
@trotinette-frontend/src/features/cart/types.ts
@trotinette-frontend/src/features/auth/store.ts
@trotinette-frontend/src/features/auth/api/auth.ts
@trotinette-frontend/src/features/auth/pages/LoginPage.tsx
@trotinette-frontend/src/shared/api/client.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Backend — Cart migration, models, controller, and routes</name>
  <files>
    trotinette-api/database/migrations/2026_04_19_000001_create_carts_table.php
    trotinette-api/app/Models/Cart.php
    trotinette-api/app/Models/CartItem.php
    trotinette-api/app/Http/Controllers/Customer/CartController.php
    trotinette-api/routes/api.php
  </files>
  <action>
    **Migration** (`2026_04_19_000001_create_carts_table.php`):
    - `carts` table: id (auto-increment), user_id (foreignId, unique, constrained to users, cascadeOnDelete), timestamps
    - `cart_items` table: id (auto-increment), cart_id (foreignId, constrained to carts, cascadeOnDelete), product_id (foreignId, constrained to products, cascadeOnDelete), variant_id (foreignId nullable, constrained to variants, cascadeOnDelete), quantity (unsignedInteger, default 1), timestamps
    - Unique composite index on cart_items: [cart_id, product_id, variant_id] — use `->unique(['cart_id', 'product_id', 'variant_id'], 'cart_items_unique')` (name required because nullable variant_id column)

    **Cart model** (`App\Models\Cart`):
    - fillable: ['user_id']
    - Relations: `user()` → belongsTo(User), `items()` → hasMany(CartItem)

    **CartItem model** (`App\Models\CartItem`):
    - fillable: ['cart_id', 'product_id', 'variant_id', 'quantity']
    - casts: quantity → integer
    - Relations: `cart()` → belongsTo(Cart), `product()` → belongsTo(Product), `variant()` → belongsTo(Variant)

    **CartController** (`App\Http\Controllers\Customer\CartController`):

    `index()` — GET /cart:
    - Get or create cart for `$request->user()` using `Cart::firstOrCreate(['user_id' => $user->id])`
    - Eager load `items.product`, `items.variant.attributeValues` (for variant labels)
    - Filter out items where product is null or `product.is_active === false` (cleanup stale items)
    - Return JSON array of cart items, each with: `id` (cart_item ID), `product_id`, `variant_id`, `quantity`, `name` (product.name), `sku` (variant.sku ?? product.sku), `price` (variant.effective_price ?? product.price — use promo_price if on sale), `stock_quantity` (variant.stock ?? product.stock_quantity), `thumbnail_url` (product.getFirstMediaUrl('images', 'thumbnail')), `variant_label` (variant attributeValues joined by ' / ' or null)

    `sync(Request $request)` — POST /cart/sync:
    - Validate: `items` array required, each with `product_id` (required, exists:products,id), `variant_id` (nullable, exists:variants,id), `quantity` (required, integer, min:1)
    - Get or create cart for user
    - Wrap in DB::transaction
    - For each incoming item:
      - Verify product is_active (skip if not)
      - If variant_id provided, verify variant is_active and belongs to product (skip if not)
      - Check if cart already has this product_id + variant_id combo: `$cart->items()->where('product_id', $item['product_id'])->where('variant_id', $item['variant_id'])->first()`
      - If exists: sum quantities, cap at stock (variant.stock or product.stock_quantity)
      - If not: insert new CartItem, cap quantity at stock
    - After merge, reload and return full cart (same format as index)

    `store(Request $request)` — POST /cart/items:
    - Validate: product_id (required, exists:products,id), variant_id (nullable, exists:variants,id), quantity (integer, min:1, default:1)
    - Verify product is_active, variant is_active if provided
    - Get or create cart
    - Use updateOrCreate on cart_items: match on [cart_id, product_id, variant_id], increment quantity (capped at stock)
    - Return created/updated cart item (same format as index items)

    `update(Request $request, CartItem $cartItem)` — PATCH /cart/items/{cartItem}:
    - Verify $cartItem belongs to auth user's cart: `abort_unless($cartItem->cart->user_id === $request->user()->id, 403)`
    - Validate: quantity (required, integer, min:1)
    - Cap at stock, update
    - Return updated item

    `destroy(Request $request, CartItem $cartItem)` — DELETE /cart/items/{cartItem}:
    - Verify ownership same as update
    - Delete item, return 204

    `clear(Request $request)` — DELETE /cart:
    - Get user's cart, delete all items: `$cart->items()->delete()`
    - Return 204

    **Routes** — add inside `auth:sanctum` middleware group in `routes/api.php`, BEFORE the admin routes block:
    ```php
    // Cart routes (authenticated users)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/sync', [CartController::class, 'sync']);
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::patch('/cart/items/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    ```
    Add the use statement at top: `use App\Http\Controllers\Customer\CartController;`

    Run migration: `php artisan migrate`
  </action>
  <verify>
    Run `php artisan migrate` succeeds.
    Run `php artisan route:list --path=cart` shows all 6 cart routes.
    Test with curl (requires running API server):
    - `curl -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" http://localhost:8000/api/cart` returns `[]` (empty cart)
  </verify>
  <done>
    carts and cart_items tables exist in database. Cart and CartItem models with proper relationships. CartController with index/sync/store/update/destroy/clear methods. All 6 routes registered under auth:sanctum. Migration runs without errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Frontend — Cart API client, hybrid store, and login sync integration</name>
  <files>
    trotinette-frontend/src/features/cart/api/cart.ts
    trotinette-frontend/src/features/cart/store.ts
    trotinette-frontend/src/features/auth/pages/LoginPage.tsx
  </files>
  <action>
    **Cart API file** (`trotinette-frontend/src/features/cart/api/cart.ts`):
    Create new file with functions using `apiClient` from `@/shared/api/client`:

    ```typescript
    import { apiClient } from '@/shared/api/client';

    export interface ServerCartItem {
      id: number;
      product_id: number;
      variant_id: number | null;
      quantity: number;
      name: string;
      sku: string;
      price: number;
      stock_quantity: number;
      thumbnail_url: string;
      variant_label: string | null;
    }

    export async function fetchCart(): Promise<ServerCartItem[]> {
      const res = await apiClient.get<ServerCartItem[]>('/cart');
      return res.data;
    }

    export async function syncCart(items: { product_id: number; variant_id: number | null; quantity: number }[]): Promise<ServerCartItem[]> {
      const res = await apiClient.post<ServerCartItem[]>('/cart/sync', { items });
      return res.data;
    }

    export async function addCartItem(data: { product_id: number; variant_id?: number; quantity?: number }): Promise<ServerCartItem> {
      const res = await apiClient.post<ServerCartItem>('/cart/items', data);
      return res.data;
    }

    export async function updateCartItem(id: number, quantity: number): Promise<ServerCartItem> {
      const res = await apiClient.patch<ServerCartItem>(`/cart/items/${id}`, { quantity });
      return res.data;
    }

    export async function removeCartItem(id: number): Promise<void> {
      await apiClient.delete(`/cart/items/${id}`);
    }

    export async function clearCartApi(): Promise<void> {
      await apiClient.delete('/cart');
    }
    ```

    **Modified cart store** (`trotinette-frontend/src/features/cart/store.ts`):
    Keep ALL existing logic intact. Add server sync capabilities:

    1. Import `useAuthStore` from `@/features/auth/store` and all cart API functions from `./api/cart`
    2. Add a helper function `isAuthenticated()` outside the store: `() => useAuthStore.getState().token !== null`
    3. Add a helper `mapServerToLocal(item: ServerCartItem): CartItem` that maps server format to local CartItem format:
       - `productId: item.product_id`
       - `sku: item.sku`
       - `name: item.name`
       - `price: item.price`
       - `thumbnailUrl: item.thumbnail_url`
       - `quantity: item.quantity`
       - `stockQuantity: item.stock_quantity`
       - `variantId: item.variant_id ?? undefined`
       - `variantSku: item.sku` (same as sku for simplicity)
       - `variantLabel: item.variant_label ?? undefined`
    4. Modify `addItem`: After the existing `set()` call, add a fire-and-forget server sync:
       ```typescript
       if (isAuthenticated()) {
         addCartItem({ product_id: product.id, variant_id: variant?.id, quantity: 1 }).catch(() => {});
       }
       ```
    5. Modify `updateQuantity`: After existing `set()`, add:
       ```typescript
       // For server sync, we need the cart_item ID — but we only have productId/variantId locally.
       // Server sync happens via syncWithServer on login; individual updates use syncWithServer too.
       // For real-time sync: re-sync entire cart to server after local mutation.
       if (isAuthenticated()) {
         const currentItems = get().items;
         syncCart(currentItems.map(i => ({ product_id: i.productId, variant_id: i.variantId ?? null, quantity: i.quantity }))).catch(() => {});
       }
       ```
       Wait — this approach is simpler but less efficient. Better approach: use the sync endpoint for all mutations when authenticated. But that's too many API calls.

       **Revised approach for mutations (add/update/remove):**
       - After ANY local state mutation (addItem, updateQuantity, removeItem), if authenticated, debounce-sync the full cart to server using a simple fire-and-forget `syncCart()` call. This avoids needing server-side cart_item IDs on the frontend.
       - Add a private `_syncToServer` function that sends the current local items to POST /cart/sync. Use a simple debounce (300ms) to batch rapid changes.
       - Import nothing extra — just use setTimeout/clearTimeout for debounce.

       ```typescript
       let syncTimeout: ReturnType<typeof setTimeout> | null = null;

       function debouncedSync(items: CartItem[]) {
         if (!isAuthenticated()) return;
         if (syncTimeout) clearTimeout(syncTimeout);
         syncTimeout = setTimeout(() => {
           syncCart(items.map(i => ({
             product_id: i.productId,
             variant_id: i.variantId ?? null,
             quantity: i.quantity,
           }))).catch(() => {});
         }, 500);
       }
       ```

       After each set() in addItem, updateQuantity, removeItem — call `debouncedSync(get().items)` (read after set). For clearCart, if authenticated call `clearCartApi().catch(() => {})` directly (no debounce needed).

    5. Add `syncWithServer` method to CartState interface and implementation:
       ```typescript
       syncWithServer: async () => {
         const { items } = get();
         try {
           const localItems = items.map(i => ({
             product_id: i.productId,
             variant_id: i.variantId ?? null,
             quantity: i.quantity,
           }));
           const serverItems = await syncCart(localItems);
           set({ items: serverItems.map(mapServerToLocal) });
         } catch {
           // Sync failed — keep local state, log error
           console.error('Cart sync failed');
         }
       },
       ```

    6. Add `loadFromServer` method:
       ```typescript
       loadFromServer: async () => {
         try {
           const serverItems = await fetchCart();
           set({ items: serverItems.map(mapServerToLocal) });
         } catch {
           console.error('Cart load failed');
         }
       },
       ```

    7. Update persist version to 3 with migration from v2 (just return persisted state as-is, new methods don't affect persisted shape).

    **LoginPage integration** (`trotinette-frontend/src/features/auth/pages/LoginPage.tsx`):
    1. Add import: `import { useCartStore } from '@/features/cart/store';`
    2. In `loginMutation.onSuccess`: after `useAuthStore.getState().setAuth(token, loggedInUser)` and BEFORE the navigate call, add:
       ```typescript
       await useCartStore.getState().syncWithServer();
       ```
       This merges any guest cart items with the user's server cart.
    3. In `registerMutation.onSuccess`: same — after setAuth, before navigate:
       ```typescript
       await useCartStore.getState().syncWithServer();
       ```
       On register, server cart is empty so this just pushes localStorage items to server.

    Note: The `handleLogin` and `handleRegister` functions already use `mutateAsync` (which is async), and the `onSuccess` callbacks execute before the promise resolves. However, `onSuccess` in react-query does NOT await async callbacks. So instead, modify `handleLogin` directly:

    ```typescript
    const handleLogin = async (data: { email: string; password: string }) => {
      setLoginError(null);
      const { token, user: loggedInUser } = await loginMutation.mutateAsync(data);
      useAuthStore.getState().setAuth(token, loggedInUser);
      await useCartStore.getState().syncWithServer();
      if (loggedInUser.role === 'admin') {
        void navigate('/admin/products');
      } else {
        void navigate('/products');
      }
    };
    ```

    Move the auth set + navigate logic from `onSuccess` to `handleLogin`/`handleRegister` directly (after mutateAsync resolves). Remove `onSuccess` from both mutations — the logic moves into the handler functions. Keep `onError` as-is.

    Same pattern for handleRegister:
    ```typescript
    const handleRegister = async (data: { ... }) => {
      setRegisterError(null);
      const { token, user: newUser } = await registerMutation.mutateAsync(data);
      useAuthStore.getState().setAuth(token, newUser);
      await useCartStore.getState().syncWithServer();
      void navigate('/products');
    };
    ```
  </action>
  <verify>
    - `cd trotinette-frontend && npx tsc --noEmit` — no TypeScript errors
    - Start dev server: `npm run dev` — loads without console errors
    - Manual test flow: Add items to cart as guest (check localStorage has cart-store). Login. Verify cart items persist (merged to server). Refresh page — cart items still present (loaded from localStorage which was updated from server response).
  </verify>
  <done>
    Cart API client created with all 6 functions. Cart store upgraded: guest behavior identical to before, authenticated mutations debounce-sync to server, syncWithServer/loadFromServer methods available. Login and register flows call syncWithServer after authentication, merging guest cart with server cart before navigation.
  </done>
</task>

</tasks>

<verification>
1. Guest flow: Add items to cart without logging in. Items persist in localStorage. Refresh page — items still there. No API calls made (check Network tab).
2. Login merge: Add 2 items as guest. Login. Cart should still show those items (now synced to server DB). Check `carts` and `cart_items` tables have entries.
3. Cross-session: After login sync, clear localStorage manually. Refresh page. Cart loads from localStorage (which was populated from server on last sync). For full server persistence, user would need to login again.
4. Logout: Logout clears cart state. Login again — server cart restored via sync.
5. Quantity merge: As guest, add Product A (qty 2). Login to account that already has Product A (qty 1) in server cart. After sync, Product A should have qty 3 (or capped at stock).
</verification>

<success_criteria>
- Backend: 6 cart API endpoints functional under auth:sanctum
- Frontend: Zero changes to CartDrawer, CartItem, CheckoutPage components
- Guest users: Identical behavior to current (localStorage only)
- Authenticated users: Cart mutations sync to server via debounced POST /cart/sync
- Login/register: Guest cart merges with server cart, UI reflects merged state
- TypeScript compiles without errors
</success_criteria>

<output>
After completion, create `.planning/quick/17-hybrid-cart-persistence-localstorage-for/17-SUMMARY.md`
</output>
