# Phase 4: Cart, Checkout, and Orders - Research

**Researched:** 2026-02-17
**Domain:** E-commerce cart/checkout/order management — Laravel 12 backend, React 19 / Zustand / TanStack Query frontend
**Confidence:** HIGH (stack already installed and in use; key patterns verified against official docs)

---

## Summary

Phase 4 is the largest and most critical phase in this project. It touches four distinct subsystems: the cart (pure frontend state), the checkout flow (frontend + backend integration), order lifecycle management (backend state machine with audit logging), and admin order management. The existing codebase already provides the foundation — DeliveryZone model, migration, and seeder are done; the Zustand `persist` pattern is established by the auth store; the `useMutation` + `invalidateQueries` TanStack Query pattern is established by admin product CRUD; and the Spatie QueryBuilder pattern is established for filtered lists.

The two technically hard problems are: (1) the order creation transaction, which must atomically check stock, decrement it, write the order and items, and check for duplicate orders — all under a pessimistic row lock; and (2) the order state machine, which must refuse invalid transitions with a 422, log every change to `order_status_logs`, and present only valid transition buttons in the admin UI. Both have clear Laravel patterns and do not require third-party packages beyond what is already installed.

The duplicate-detection requirement (same phone + same product within 10 minutes = reject) is best implemented as a database query inside the transaction rather than a cache-based atomic lock. The reason: we need to check across multiple products in one cart, and a DB query is more precise than a lock-name approach. Cache::lock is the right tool for preventing concurrent *identical* requests hitting the server simultaneously, which is a different (and simpler) problem.

**Primary recommendation:** Build the OrderService as the single authoritative source for order creation and state transitions. Do not put business logic in controllers. The state machine is a plain PHP backed enum with an `allowedTransitionsFrom(OrderStatus $current): array` method — no third-party state machine package needed for this simple four-state flow.

---

## Codebase State (What Already Exists)

This section tells the planner what NOT to build and what to extend:

### Already Shipped
| What | Where | Notes |
|------|-------|-------|
| DeliveryZone model | `app/Models/DeliveryZone.php` | `city`, `city_ar`, `fee` (centimes), `is_active` |
| DeliveryZone migration | `database/migrations/2026_02_13_000004_create_delivery_zones_table.php` | Complete |
| DeliveryZone seeder | `database/seeders/DeliveryZoneSeeder.php` | 10 Moroccan cities, fees 30–50 MAD |
| Zustand persist pattern | `trotinette-frontend/src/features/auth/store.ts` | `persist` + `createJSONStorage(() => localStorage)` |
| TanStack Query mutation pattern | `trotinette-frontend/src/features/admin/api/products.ts` | `useMutation` + `onSuccess: invalidateQueries` |
| Spatie QueryBuilder filter pattern | `app/Http/Controllers/Admin/ProductController.php` | `AllowedFilter::exact`, `AllowedFilter::callback`, paginate |
| API client with auth | `trotinette-frontend/src/shared/api/client.ts` | Axios with Bearer token + Accept-Language interceptors |
| Feature folder structure | `trotinette-frontend/src/features/{auth,catalog,admin}/` | Each has `api/`, `components/`, `pages/` + `store.ts` or `types.ts` |
| Router with AdminRoute guard | `trotinette-frontend/src/app/router.tsx` | `ProtectedRoute` and `AdminRoute` wrappers ready |
| Translation files | `src/locales/{fr,en}/translation.json` | Nav keys `cart` already present; no order/cart body keys yet |
| Product `stock_quantity` field | `app/Models/Product.php` | Integer, in existing migration |
| User model with `phone` | `app/Models/User.php` | `phone` nullable string on users table |
| i18n: FR + EN only | Locale setup | NOTE: "trilingual" in requirements — verify if Arabic (ar) is truly needed or if it means FR/EN/AR status labels only |

### What Phase 4 Must Build (nothing pre-exists for these)
- `orders` table + migration
- `order_items` table + migration
- `order_status_logs` table + migration
- `Order`, `OrderItem`, `OrderStatusLog` models
- `OrderStatus` PHP backed enum
- `OrderService` (creation + state transitions)
- `DeliveryZoneController` (admin CRUD, already has model/migration)
- `OrderController` (admin + customer)
- Cart Zustand store with localStorage persist
- Cart drawer component
- Checkout page (city select, order summary, COD confirm)
- Order confirmation screen
- Customer order history page
- Admin order list + detail + status transition UI

---

## Standard Stack

No new packages are needed. All required libraries are already installed.

### Core (Already Installed)
| Library | Version | Purpose | Role in Phase 4 |
|---------|---------|---------|----------------|
| Zustand | 5.0.11 | Client state | Cart store with localStorage persist |
| `zustand/middleware` persist | bundled | Persist cart to localStorage | `createJSONStorage(() => localStorage)` |
| TanStack Query | 5.90.x | Server state | Order creation mutation, order list queries |
| MUI 7 | 7.3.8 | UI components | Cart Drawer, Stepper (checkout), Badge, Table, Chip |
| React Hook Form | 7.71.x | Form handling | Checkout form (phone, city select) |
| Zod | 4.3.6 | Schema validation | Checkout form schema |
| React Router v7 | 7.13.x | Navigation | Cart route, checkout route, order history, admin orders |
| Axios | 1.13.x | HTTP | Already configured in `apiClient` |
| i18next / react-i18next | 25.x / 16.x | Translations | Order status labels (FR/EN/AR), cart/checkout strings |
| Laravel 12 | 12.x | Backend framework | OrderService, migrations, state machine |
| `spatie/laravel-query-builder` | 6.4 | Filtered queries | Admin order list filter by status, city, date |

### No New Packages Required
The stack is complete for this phase. Do not add:
- No Laravel state machine package (the 4-state machine is simple enough for a plain PHP enum method)
- No Laravel audit package (custom `order_status_logs` table is the audit log — simpler, better controlled)
- No cache-based duplicate-order package (a DB query inside the transaction is sufficient)

---

## Architecture Patterns

### Recommended File Structure (new files only)

**Backend:**
```
app/
├── Enums/
│   └── OrderStatus.php              # Backed enum: pending/confirmed/dispatched/delivered/cancelled
├── Models/
│   ├── Order.php
│   ├── OrderItem.php
│   └── OrderStatusLog.php
├── Services/
│   └── OrderService.php             # createOrder(), transitionStatus()
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   │   ├── DeliveryZoneController.php    # CRUD for zones
│   │   │   └── OrderController.php           # admin order list, detail, transition, note
│   │   └── Customer/
│   │       ├── DeliveryZoneController.php    # GET /api/delivery-zones (public)
│   │       └── OrderController.php           # create order, list own orders
│   ├── Requests/
│   │   ├── StoreOrderRequest.php
│   │   └── TransitionOrderRequest.php
│   └── Resources/
│       ├── OrderResource.php
│       └── OrderStatusLogResource.php
database/
├── migrations/
│   ├── 2026_02_18_000001_create_orders_table.php
│   ├── 2026_02_18_000002_create_order_items_table.php
│   └── 2026_02_18_000003_create_order_status_logs_table.php
```

**Frontend:**
```
trotinette-frontend/src/features/
├── cart/
│   ├── store.ts                     # Zustand cart store (persist to localStorage)
│   ├── types.ts                     # CartItem, CartState types
│   └── components/
│       ├── CartDrawer.tsx           # MUI Drawer, cart item list
│       ├── CartItem.tsx             # qty controls, remove, subtotal
│       └── CartBadge.tsx            # item count badge in navbar
├── checkout/
│   ├── api/
│   │   ├── deliveryZones.ts         # useDeliveryZones()
│   │   └── orders.ts               # usePlaceOrder mutation
│   ├── types.ts
│   └── pages/
│       ├── CheckoutPage.tsx         # City select, order summary, confirm button
│       └── OrderConfirmationPage.tsx # Order number, shop contact
├── orders/
│   ├── api/
│   │   └── orders.ts               # useMyOrders, useAdminOrders, useTransitionOrder
│   ├── types.ts                     # Order, OrderItem, OrderStatusLog
│   └── pages/
│       ├── MyOrdersPage.tsx         # Customer order history
│       ├── AdminOrdersPage.tsx      # Filtered list with DataGrid/Table
│       └── AdminOrderDetailPage.tsx # Status machine buttons, notes, audit log
```

### Pattern 1: Cart Store with Zustand Persist

**What:** Zustand store with `persist` middleware backed by `localStorage`. Cart items are persisted on every state change.
**When to use:** All cart operations — add, update quantity, remove, clear after order.

```typescript
// Source: https://zustand.docs.pmnd.rs/middlewares/persist
// Pattern: mirrors auth/store.ts already in the codebase
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '../catalog/types';

export interface CartItem {
  productId: number;
  sku: string;
  name: string;            // snapshot at add-time (current locale)
  price: number;           // centimes snapshot at add-time
  thumbnailUrl: string;
  quantity: number;
  inStock: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, localeName: string) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotalCentimes: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, localeName) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                sku: product.sku,
                name: localeName,
                price: product.price,
                thumbnailUrl: product.images[0]?.thumbnail ?? '',
                quantity: 1,
                inStock: product.in_stock,
              },
            ],
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalCentimes: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // If cart schema changes in future, add migrate() here
    }
  )
);
```

**Key decision:** Store price as centimes snapshot at add-time. If price changes server-side after adding to cart, the cart shows the price at add-time. This is correct behavior for COD — final total is recalculated server-side anyway.

### Pattern 2: OrderStatus Backed Enum with Transition Guard

**What:** PHP 8.1 backed enum that encodes the allowed state machine. No package needed.
**When to use:** Every status transition — both validation in the request and enforcement in the service.

```php
// Source: Laravel 12 + PHP 8.1 enum docs; pattern from Martin Joo DDD article
namespace App\Enums;

enum OrderStatus: string
{
    case Pending    = 'pending';
    case Confirmed  = 'confirmed';
    case Dispatched = 'dispatched';
    case Delivered  = 'delivered';
    case Cancelled  = 'cancelled';

    /**
     * Returns the statuses that are valid targets FROM this status.
     * This is the state machine definition. All other transitions are illegal.
     */
    public function allowedTransitionsTo(): array
    {
        return match ($this) {
            self::Pending    => [self::Confirmed, self::Cancelled],
            self::Confirmed  => [self::Dispatched, self::Cancelled],
            self::Dispatched => [self::Delivered],
            self::Delivered  => [],   // terminal
            self::Cancelled  => [],   // terminal
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitionsTo(), strict: true);
    }

    /** Human-readable labels for admin UI (FR/EN/AR) */
    public function label(string $locale = 'fr'): string
    {
        return match ([$this, $locale]) {
            [self::Pending,    'fr'] => 'En attente',
            [self::Pending,    'en'] => 'Pending',
            [self::Pending,    'ar'] => 'قيد الانتظار',
            [self::Confirmed,  'fr'] => 'Confirmée',
            [self::Confirmed,  'en'] => 'Confirmed',
            [self::Confirmed,  'ar'] => 'مؤكد',
            [self::Dispatched, 'fr'] => 'Expédiée',
            [self::Dispatched, 'en'] => 'Dispatched',
            [self::Dispatched, 'ar'] => 'تم الشحن',
            [self::Delivered,  'fr'] => 'Livrée',
            [self::Delivered,  'en'] => 'Delivered',
            [self::Delivered,  'ar'] => 'تم التسليم',
            [self::Cancelled,  'fr'] => 'Annulée',
            [self::Cancelled,  'en'] => 'Cancelled',
            [self::Cancelled,  'ar'] => 'ملغاة',
            default => $this->value,
        };
    }
}
```

### Pattern 3: OrderService — Atomic Order Creation

**What:** Single-method service that creates an order inside `DB::transaction()` with pessimistic locking on products to prevent overselling.
**When to use:** POST /api/orders only. Never build this in the controller.

```php
// Source: https://laravel.com/docs/12.x/queries#pessimistic-locking
// Source: https://laravel.com/docs/12.x/database#database-transactions
namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\{Order, OrderItem, Product, DeliveryZone};
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Creates an order atomically.
     * - Validates city exists in delivery_zones
     * - Checks for duplicate order (same phone + same product within 10 min)
     * - Locks product rows (lockForUpdate) and checks stock
     * - Decrements stock
     * - Calculates totals server-side (never trusts request amounts)
     * - Writes order, order_items, and first order_status_log in one transaction
     *
     * @param array{
     *   phone: string,
     *   delivery_zone_id: int,
     *   items: array<array{product_id: int, quantity: int}>,
     *   note?: string
     * } $data
     * @param int $userId
     */
    public function createOrder(array $data, int $userId): Order
    {
        return DB::transaction(function () use ($data, $userId) {

            // 1. Resolve delivery zone (validates it is active)
            $zone = DeliveryZone::where('id', $data['delivery_zone_id'])
                ->where('is_active', true)
                ->firstOrFail();

            $productIds = array_column($data['items'], 'product_id');

            // 2. Duplicate order check — same phone + any same product within 10 min
            $duplicate = Order::where('phone', $data['phone'])
                ->where('created_at', '>=', now()->subMinutes(10))
                ->whereHas('items', fn ($q) => $q->whereIn('product_id', $productIds))
                ->lockForUpdate()
                ->exists();

            if ($duplicate) {
                throw ValidationException::withMessages([
                    'phone' => ['Une commande identique a déjà été passée. Veuillez patienter avant de réessayer.'],
                ]);
            }

            // 3. Lock products — prevent concurrent overselling
            $products = Product::whereIn('id', $productIds)
                ->where('is_active', true)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $quantityMap = collect($data['items'])->pluck('quantity', 'product_id');

            // 4. Validate stock for each item
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id'])
                    ?? throw ValidationException::withMessages([
                        'items' => ["Produit #{$item['product_id']} introuvable ou inactif."],
                    ]);

                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["{$product->sku}: stock insuffisant ({$product->stock_quantity} disponible)."],
                    ]);
                }

                $subtotal += $product->price * $item['quantity'];
            }

            // 5. Decrement stock
            foreach ($data['items'] as $item) {
                Product::where('id', $item['product_id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }

            // 6. Generate human-readable order number: ORD-YYYYMMDD-XXXXX
            $orderNumber = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            // 7. Create order (server calculates totals — never trust request)
            $order = Order::create([
                'user_id'          => $userId,
                'order_number'     => $orderNumber,
                'phone'            => $data['phone'],
                'delivery_zone_id' => $zone->id,
                'subtotal'         => $subtotal,
                'delivery_fee'     => $zone->fee,
                'total'            => $subtotal + $zone->fee,
                'status'           => OrderStatus::Pending,
                'note'             => $data['note'] ?? null,
            ]);

            // 8. Create order items (snapshot prices at order time)
            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['product_id'],
                    'product_sku'=> $product->sku,
                    'unit_price' => $product->price,   // centimes snapshot
                    'quantity'   => $item['quantity'],
                    'subtotal'   => $product->price * $item['quantity'],
                ]);
            }

            // 9. Audit log — first entry
            $order->statusLogs()->create([
                'from_status' => null,
                'to_status'   => OrderStatus::Pending,
                'actor_id'    => $userId,
                'actor_type'  => 'customer',
            ]);

            return $order->load(['items.product', 'deliveryZone', 'statusLogs']);
        });
    }

    public function transitionStatus(Order $order, OrderStatus $newStatus, int $actorId, string $actorType, ?string $note = null): Order
    {
        if (! $order->status->canTransitionTo($newStatus)) {
            abort(422, "Transition invalide: {$order->status->value} → {$newStatus->value}");
        }

        return DB::transaction(function () use ($order, $newStatus, $actorId, $actorType, $note) {
            // Lock the order row before updating
            $order = Order::lockForUpdate()->find($order->id);

            $fromStatus = $order->status;
            $order->update(['status' => $newStatus]);

            $order->statusLogs()->create([
                'from_status' => $fromStatus,
                'to_status'   => $newStatus,
                'actor_id'    => $actorId,
                'actor_type'  => $actorType,
                'note'        => $note,
            ]);

            return $order->fresh(['items.product', 'deliveryZone', 'statusLogs']);
        });
    }
}
```

### Pattern 4: Database Schema

**What:** Three new migration files for the order domain.

```php
// orders table
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('delivery_zone_id')->constrained()->restrictOnDelete();
    $table->string('order_number')->unique();
    $table->string('phone', 20);
    $table->string('status')->default('pending'); // cast to OrderStatus enum
    $table->unsignedInteger('subtotal');         // centimes, server-calculated
    $table->unsignedInteger('delivery_fee');     // centimes, from delivery_zone at time of order
    $table->unsignedInteger('total');            // centimes = subtotal + delivery_fee
    $table->text('note')->nullable();            // admin note (phone confirmation outcome)
    $table->timestamps();

    $table->index(['status', 'created_at']);
    $table->index('phone');
});

// order_items table
Schema::create('order_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->cascadeOnDelete();
    $table->foreignId('product_id')->constrained()->restrictOnDelete();
    $table->string('product_sku');               // snapshot — product SKU may change
    $table->unsignedInteger('unit_price');       // centimes snapshot at order time
    $table->unsignedSmallInteger('quantity');
    $table->unsignedInteger('subtotal');         // unit_price * quantity, server-calculated
    $table->timestamps();
});

// order_status_logs table (audit log)
Schema::create('order_status_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->cascadeOnDelete();
    $table->string('from_status')->nullable();   // null for initial 'pending' entry
    $table->string('to_status');
    $table->unsignedBigInteger('actor_id');      // user_id
    $table->string('actor_type');                // 'customer' | 'admin'
    $table->text('note')->nullable();
    $table->timestamps();

    $table->index(['order_id', 'created_at']);
});
```

### Pattern 5: TanStack Query — Place Order Mutation

**What:** `useMutation` that posts the order, clears the cart on success, and navigates to confirmation.
**When to use:** Checkout page confirm button.

```typescript
// Source: established pattern from trotinette-frontend/src/features/admin/api/products.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { apiClient } from '../../../shared/api/client';
import { useCartStore } from '../../cart/store';
import type { PlaceOrderInput, OrderConfirmation } from '../types';

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  return useMutation<OrderConfirmation, Error, PlaceOrderInput>({
    mutationFn: async (input) => {
      const res = await apiClient.post<{ data: OrderConfirmation }>('/orders', input);
      return res.data.data;
    },
    onSuccess: (data) => {
      clearCart();
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/orders/${data.order_number}/confirmation`);
    },
  });
}
```

### Pattern 6: Admin Order Status Transition Buttons

**What:** Render only valid transition buttons based on current status (from the enum's `allowedTransitionsTo()`). Invalid transitions are simply not rendered — not disabled.
**When to use:** Admin order detail page.

```typescript
// Frontend mirrors the backend enum — same transition logic
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered:  [],
  cancelled:  [],
};

// In AdminOrderDetailPage:
const validTargets = ALLOWED_TRANSITIONS[order.status] ?? [];
// Only render buttons for valid targets — invalid transitions have no button at all
{validTargets.map((targetStatus) => (
  <Button
    key={targetStatus}
    variant="contained"
    color={targetStatus === 'cancelled' ? 'error' : 'primary'}
    onClick={() => transitionMutation.mutate({ orderId: order.id, status: targetStatus })}
    loading={transitionMutation.isPending}
  >
    {t(`orders.status.${targetStatus}`)}
  </Button>
))}
```

### Anti-Patterns to Avoid

- **Calculating order totals on the frontend and trusting them:** The backend MUST recalculate from DB prices. The request body for order creation should only contain `product_id` + `quantity`, never prices.
- **Allowing any status transition without checking the enum:** A `PATCH /orders/{id}/status` that accepts any status value without going through `OrderStatus::canTransitionTo()` will create illegal state.
- **Persisting cart as React state (no Zustand persist):** Cart would be lost on page refresh. Use the persist middleware as the auth store already does.
- **Storing cart items with stale names:** Snapshot the product name in the current locale at add-time. Don't try to re-fetch names from the server per cart item — it's fragile and slow.
- **Running duplicate-check and stock-check outside the DB transaction:** Race conditions will create duplicate orders. Both checks MUST be inside `DB::transaction()`.
- **Using `lockForUpdate()` on the orders table for every list query:** Only use it on the specific order or product row being modified. The admin order list uses no locking.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cart persistence | Custom localStorage hooks | Zustand `persist` middleware | Already configured for auth store; handles rehydration, versioning, partialize |
| Order filtered list | Custom query params handling | Spatie QueryBuilder | Already in ProductController; supports `AllowedFilter::exact('status')`, `AllowedFilter::callback` for date range |
| Admin delivery zone CRUD | Custom CRUD controller | Same pattern as `AdminCategoryController` | Dialog-based simple entity CRUD (3 fields) |
| Order number generation | UUID or auto-increment | `'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5))` | Human-readable, no package needed, `uniqid()` uses microseconds |
| State machine | Third-party package | PHP backed enum with `allowedTransitionsTo()` | 5-state machine is simple enough; packages add complexity without benefit |
| Audit log | Spatie laravel-auditing | Custom `order_status_logs` table | More control, simpler schema, exactly what ORDR-08 requires |
| Order resource serialization | Raw array | `OrderResource` extending `JsonResource` | Consistent pattern with existing `ProductResource` |

**Key insight:** This phase's complexity lives in business rules (state machine, duplicate detection, atomic stock decrement), not in infrastructure. All infrastructure is already installed and demonstrated in earlier phases.

---

## Common Pitfalls

### Pitfall 1: Overselling Under Concurrency
**What goes wrong:** Two simultaneous requests for the last item in stock both pass the stock check, both decrement, stock goes negative.
**Why it happens:** The check and the decrement are not atomic.
**How to avoid:** Use `lockForUpdate()` on the product rows inside `DB::transaction()`. See Pattern 3 above. The lock prevents other transactions from reading the product row until the first transaction commits.
**Warning signs:** Negative `stock_quantity` values appearing in the database.

### Pitfall 2: Duplicate Orders From Double-Click
**What goes wrong:** Customer double-clicks the order button; two identical orders are created within milliseconds.
**Why it happens:** The duplicate detection query checks `created_at >= now() - 10 minutes`, but neither order exists yet when both requests arrive simultaneously.
**How to avoid:** Disable the submit button immediately on first click (`isPending` flag from `useMutation`). On the backend, the `lockForUpdate()` on the Orders table in the duplicate check ensures only one transaction wins if they arrive simultaneously.
**Warning signs:** Two orders with the same `phone` and same `product_id` in `order_items` within seconds of each other.

### Pitfall 3: Cart Items Showing Wrong Prices After Admin Price Change
**What goes wrong:** Admin changes a product price; customers who had the old price in their cart now see the new price — or worse, the checkout calculates wrong.
**Why it happens:** Storing product ID only in cart and reading price at checkout time.
**How to avoid:** Snapshot `unit_price` at add-to-cart time in `CartItem`. Display the snapshotted price in the cart. The backend OrderService recalculates from the current DB price anyway — the cart snapshot is only for display. Add a note on the confirmation screen if you want to show "final price may differ."
**Warning signs:** Price shown in cart doesn't match price stored in `order_items`.

### Pitfall 4: State Machine Bypass via Direct Status Update
**What goes wrong:** Admin can PATCH any status to any other status because validation only checks the enum values, not the transitions.
**Why it happens:** Using `in_array($status, OrderStatus::values())` instead of `$order->status->canTransitionTo($newStatus)`.
**How to avoid:** In `TransitionOrderRequest`, validate the target status is a valid enum value. In `OrderService::transitionStatus()`, call `canTransitionTo()` before writing. Return 422 if invalid.
**Warning signs:** Orders appearing in `delivered` state directly from `pending` without intermediate states in `order_status_logs`.

### Pitfall 5: Delivery Fee Fetched Client-Side, Trusted by Backend
**What goes wrong:** Frontend passes `delivery_fee: 3000` in the order request body; backend uses that value instead of re-fetching from `delivery_zones`.
**Why it happens:** Attempting to save a DB query by trusting the frontend.
**How to avoid:** `StoreOrderRequest` accepts `delivery_zone_id` only. The backend fetches the delivery zone and uses `$zone->fee`. Never read `delivery_fee` from the request body.
**Warning signs:** Orders with delivery fees that don't match any delivery zone's fee.

### Pitfall 6: Zustand Persist + Schema Migration
**What goes wrong:** You change the CartItem shape (add a field, rename one), and existing localStorage data breaks the store because it no longer matches the TypeScript interface.
**Why it happens:** `persist` rehydrates whatever is in localStorage without runtime type validation.
**How to avoid:** Set `version: 1` in the persist config. When the schema changes in future, increment to `version: 2` and add a `migrate` function. For Phase 4 initial implementation, set `version: 1` so future migrations work correctly.
**Warning signs:** Runtime TypeScript errors after a deployment that changes CartItem shape.

### Pitfall 7: Admin Order List N+1 Query
**What goes wrong:** The admin order list endpoint loads orders, then for each order makes a separate query for the items, zone, or user.
**Why it happens:** Missing eager loading.
**How to avoid:** Always `->with(['items', 'deliveryZone', 'user'])` on the order query. Verify with Laravel Debugbar or query count in tests.
**Warning signs:** Slow admin order list with 50+ orders.

### Pitfall 8: Order Number Collisions on High Traffic
**What goes wrong:** Two orders created at the same microsecond get the same `order_number`.
**Why it happens:** `uniqid()` relies on microseconds — collision is theoretically possible under extreme concurrency.
**How to avoid:** The `orders` table has `$table->string('order_number')->unique()`. If a collision occurs, the DB constraint catches it. The transaction will throw a `UniqueConstraintViolation` exception. Retry with a fresh `uniqid()` call inside a loop (max 3 retries). For this app's scale (small Moroccan trotinette shop), this scenario is extremely unlikely.
**Warning signs:** Occasional 500 errors on order creation with `SQLSTATE[23000] Duplicate entry` messages.

---

## Code Examples

### Delivery Zones API (backend — already modeled, needs controller + route)

```php
// Customer-facing (public): GET /api/delivery-zones
// Source: established pattern from Customer/ProductController
class DeliveryZoneController extends Controller
{
    public function index(): JsonResponse
    {
        $zones = DeliveryZone::where('is_active', true)
            ->orderBy('city')
            ->get(['id', 'city', 'fee']);

        return response()->json(['data' => $zones]);
    }
}
```

### Delivery Zones Query (frontend)

```typescript
// Source: pattern from src/features/catalog/api/products.ts
export function useDeliveryZones() {
  return useQuery({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DeliveryZone[] }>('/delivery-zones');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 min — zones don't change often
  });
}
```

### Order Status Transition (admin frontend)

```typescript
// Source: established pattern from admin/api/products.ts
export function useTransitionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: number; status: string; note?: string }) => {
      const res = await apiClient.patch(`/admin/orders/${orderId}/status`, { status, note });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders', variables.orderId] });
    },
  });
}
```

### Admin Order Filters (backend — Spatie QueryBuilder)

```php
// Source: established pattern from Admin/ProductController.php
$orders = QueryBuilder::for(
    Order::query()->with(['user', 'items', 'deliveryZone', 'statusLogs'])
)
    ->allowedFilters([
        AllowedFilter::exact('status'),
        AllowedFilter::exact('delivery_zone_id'),
        AllowedFilter::callback('date_from', fn ($query, $value) =>
            $query->whereDate('created_at', '>=', $value)
        ),
        AllowedFilter::callback('date_to', fn ($query, $value) =>
            $query->whereDate('created_at', '<=', $value)
        ),
    ])
    ->defaultSort('-created_at')
    ->allowedSorts(['created_at', 'total', 'status'])
    ->paginate(20)
    ->appends($request->query());
```

### Order Status Badge (frontend — trilingual)

```typescript
// Translation keys needed in translation.json (FR + EN at minimum; AR is a question — see Open Questions)
// orders.status.pending / confirmed / dispatched / delivered / cancelled

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending:    'warning',
  confirmed:  'info',
  dispatched: 'primary',
  delivered:  'success',
  cancelled:  'error',
};

export function OrderStatusChip({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <Chip
      label={t(`orders.status.${status}`)}
      color={STATUS_COLORS[status] ?? 'default'}
      size="small"
    />
  );
}
```

### Cart Total Display (MAD conversion — existing pattern)

```typescript
// Pattern from Phase 2: centimes / 100 for display
// Source: established convention from FilterBar.tsx price handling
function formatMAD(centimes: number): string {
  return (centimes / 100).toLocaleString('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
  });
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Store full order calculation in frontend | Backend recalculates from DB — ORDR-05 | Cannot tamper with total |
| Session-based cart (Laravel) | Zustand + localStorage (React) | SPA-native, no server round-trip for cart ops |
| String status fields with no enforcement | PHP 8.1 backed enum with `canTransitionTo()` | Compile-time exhaustiveness, type-safe transitions |
| Manual audit trail with timestamps | Dedicated `order_status_logs` table | Clear actor attribution, queryable history |
| Status machine packages (e.g., winzou/state-machine) | Plain enum method | Zero dependencies, simpler for 5-state flow |

**Deprecated/outdated for this project:**
- Phone OTP verification: Roadmap flagged this as unresolved (OTP vs duplicate-detection). **Decision: use duplicate-detection** (same phone + product within 10 min). OTP requires SMS provider integration, extra cost, and is disproportionate for a small COD shop. The duplicate detection approach is sufficient fraud prevention for this scale.
- Redux for cart: Zustand is already in the project and already used with persist. Do not introduce Redux.

---

## Open Questions

1. **Is Arabic (ar) a third locale for the frontend, or just server-side enum labels?**
   - What we know: The `DeliveryZone` model has a `city_ar` column (seeded as null). The OrderStatus enum above includes Arabic labels. The requirements say "trilingual status badges" but the frontend only has `fr` and `en` locale files.
   - What's unclear: Does "trilingual" mean the frontend i18next files need an `ar` locale, or does it mean the status badges should display in the user's current language (FR/EN only, 2 actual locales)?
   - Recommendation: Treat it as FR/EN only for frontend i18next, matching the existing locale setup. The `label(string $locale)` method on the enum can serve Arabic to future API consumers. Do NOT add an `ar` translation file to the frontend unless explicitly requested — it would also require RTL layout (`dir="rtl"`) which is a significant UI change.

2. **Checkout page: Route or Drawer?**
   - What we know: The cart drawer pattern (MUI Drawer) is a common UX for reviewing cart. The checkout flow (city + summary + confirm) is multi-step and benefits from a dedicated page.
   - What's unclear: Whether the cart review should be in a side drawer (opens from any page) or a separate `/cart` page.
   - Recommendation: Implement **cart as a Drawer** (accessible from any page via the navbar cart badge) and **checkout as a dedicated `/checkout` page** that the drawer links to. This is the most common e-commerce pattern and works well with React Router navigation.

3. **Customer authentication required for ordering?**
   - What we know: The auth store exists and `ProtectedRoute` is implemented. The order schema has a `user_id` foreign key.
   - What's unclear: The requirements don't explicitly state whether a customer must be logged in to place an order. COD shops sometimes allow guest checkout (just phone + city).
   - Recommendation: Require authentication. The `user_id` is on the order (the admin detail page in ORDR-12 links to user), and the order history (ORDR-09) requires a user to own the orders. The `ProtectedRoute` guard is already built. Wrap `/checkout` in `ProtectedRoute`.

4. **Order number format confirmed?**
   - What we know: Nothing in the requirements specifies format.
   - Recommendation: Use `ORD-YYYYMMDD-XXXXX` (e.g., `ORD-20260217-A3F9C`). Human-readable, roughly sortable, short enough for phone support agents to reference.

---

## Sources

### Primary (HIGH confidence)
- **Official Laravel 12 docs** — https://laravel.com/docs/12.x/queries#pessimistic-locking — `lockForUpdate()` syntax and DB::transaction usage
- **Official Laravel 12 docs** — https://laravel.com/docs/12.x/cache#atomic-locks — `Cache::lock()` API
- **Official MUI 7 docs** — https://mui.com/material-ui/react-drawer/ — Drawer anchor, open, onClose, PaperProps
- **Zustand official docs** — https://zustand.docs.pmnd.rs/middlewares/persist — `persist`, `createJSONStorage`, `version`, `migrate`, `partialize`
- **Codebase** — `trotinette-frontend/src/features/auth/store.ts` — persist pattern in use
- **Codebase** — `trotinette-frontend/src/features/admin/api/products.ts` — `useMutation` + `invalidateQueries` pattern
- **Codebase** — `trotinette-api/app/Http/Controllers/Admin/ProductController.php` — Spatie QueryBuilder pattern
- **Codebase** — `trotinette-api/database/migrations/2026_02_13_000004_create_delivery_zones_table.php` — DeliveryZone already migrated
- **Codebase** — `trotinette-api/database/seeders/DeliveryZoneSeeder.php` — 10 Moroccan cities seeded

### Secondary (MEDIUM confidence)
- **laravel.io article** — https://laravel.io/articles/preventing-duplicate-form-submissions-using-atomic-locks — atomic lock pattern for COD duplicate prevention (using Cache::lock); research concluded a DB-side duplicate check is more appropriate for multi-product orders
- **TanStack Query v5 docs** — https://tanstack.com/query/v5/docs/react/guides/optimistic-updates — mutation/invalidation patterns (site returned 303, but multiple WebSearch results confirmed pattern matches codebase usage)

### Tertiary (LOW confidence — informational only)
- WebSearch results on state machine packages (tamkeen-tech/laravel-enum-state-machine, HPWebdeveloper/laravel-stateflow) — reviewed and rejected in favor of plain PHP enum
- WebSearch on order number generation — confirmed `uniqid()` + formatted prefix approach is community standard for small apps

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed; versions confirmed from package.json and composer.json
- Database schema: HIGH — follows established migrations in codebase; all field types confirmed with existing models
- OrderService transaction pattern: HIGH — verified against official Laravel 12 docs for lockForUpdate and DB::transaction
- Zustand cart persist: HIGH — pattern already working in auth/store.ts; API confirmed in official docs
- Architecture patterns: HIGH — all follow existing feature structure in codebase
- Duplicate detection: MEDIUM — DB query approach is sound; no official benchmark comparing it to Cache::lock for multi-product orders
- Order number format: LOW — no requirement specified; recommendation is based on common practice

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days — stack is stable; no fast-moving dependencies in this phase)
