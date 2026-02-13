# Architecture Research

**Domain:** Local e-commerce — Electric scooters (Morocco), Laravel API + React SPA
**Researched:** 2026-02-12
**Confidence:** HIGH (core architecture), MEDIUM (project-specific patterns)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
├──────────────────────────────┬──────────────────────────────────────┤
│     Customer SPA             │           Admin SPA                  │
│  React + MUI + i18next       │      React + MUI + i18next           │
│  Routes: /                   │      Routes: /admin/*                │
│  (FR / AR / EN, RTL-aware)   │      (French primary)                │
└──────────────┬───────────────┴────────────────┬─────────────────────┘
               │  HTTPS + JSON                  │  HTTPS + JSON
               │  Bearer Token (Sanctum)        │  Bearer Token (Sanctum)
               ▼                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                             │
│              Laravel 12 — routes/api.php                            │
│          Middleware: auth:sanctum, locale, cors                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      APPLICATION LAYER                              │
├────────────────┬───────────────┬──────────────────┬─────────────────┤
│   Controllers  │   Services    │  Form Requests   │   API Resources │
│ (HTTP in/out)  │ (business     │  (validation)    │ (JSON transform)│
│                │  logic)       │                  │                 │
└────────────────┴───────────────┴──────────────────┴─────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                       DOMAIN LAYER                                  │
├─────────────┬─────────────┬──────────────┬──────────────────────────┤
│   Models    │  Policies   │    Events    │    Jobs / Queues         │
│  (Eloquent) │  (authz)    │  (dispatch)  │  (async tasks)           │
└─────────────┴─────────────┴──────────────┴──────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     PERSISTENCE LAYER                               │
├──────────────────────┬──────────────────────────────────────────────┤
│    MySQL             │   Laravel Cache (file/Redis)                 │
│  (primary store)     │   (product catalog, delivery fees)           │
└──────────────────────┴──────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Customer SPA | Product browsing, cart, checkout, order tracking | React + React Router + MUI + i18next |
| Admin SPA | Product/order/user/zone management dashboard | Same React app, `/admin/*` route prefix |
| API Gateway | Route registration, auth, CORS, locale middleware | `routes/api.php`, Laravel middleware stack |
| Controllers | Receive HTTP requests, delegate to Service, return Resource | `app/Http/Controllers/` — thin, no business logic |
| Services | Business logic (pricing, order placement, stock) | `app/Services/` — called by controllers |
| Form Requests | Validate and authorize incoming data | `app/Http/Requests/` — one per operation |
| API Resources | Transform Eloquent → JSON (field control, hiding internals) | `app/Http/Resources/` — one per model |
| Models | Database schema, relationships, scopes | `app/Models/` — Eloquent |
| Policies | Authorization rules (who can do what) | `app/Policies/` — used in controllers/resources |
| Jobs | Async work (order confirmation emails, stock checks) | `app/Jobs/` — dispatched via queue |

---

## Recommended Project Structure

### Laravel Backend

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   │   ├── ProductController.php
│   │   │   ├── OrderController.php
│   │   │   ├── UserController.php
│   │   │   └── DeliveryZoneController.php
│   │   └── Customer/
│   │       ├── CatalogController.php
│   │       ├── CartController.php
│   │       ├── OrderController.php
│   │       └── AuthController.php
│   ├── Middleware/
│   │   ├── SetLocale.php          # Sets app locale from Accept-Language or query param
│   │   └── AdminOnly.php          # Restricts /admin routes
│   └── Requests/
│       ├── Admin/
│       └── Customer/
├── Models/
│   ├── Product.php                # Generic product model, JSON attributes field
│   ├── Category.php
│   ├── Order.php                  # Includes status, delivery_zone_id
│   ├── OrderItem.php
│   ├── User.php                   # Covers customers + admins (role field)
│   ├── DeliveryZone.php           # City → delivery fee mapping
│   └── ProductTranslation.php    # Spatie translatable or JSON column
├── Services/
│   ├── OrderService.php           # Place order, transition status
│   ├── PricingService.php         # Calculate total + delivery fee by zone
│   ├── ProductService.php         # CRUD + stock management
│   └── DeliveryZoneService.php    # Zone lookup, fee calculation
├── Http/
│   └── Resources/
│       ├── ProductResource.php
│       ├── OrderResource.php
│       ├── UserResource.php
│       └── DeliveryZoneResource.php
├── Policies/
│   ├── OrderPolicy.php
│   └── ProductPolicy.php
└── Jobs/
    └── SendOrderConfirmation.php

routes/
├── api.php                        # All API routes
└── web.php                        # Single catch-all → React SPA index.html

database/
├── migrations/
└── seeders/
    └── DeliveryZoneSeeder.php     # Morocco city zones + fees
```

### React Frontend

```
src/
├── app/
│   ├── router.tsx                 # createBrowserRouter, splits customer vs /admin
│   ├── i18n.ts                    # i18next init with fr/ar/en namespaces
│   ├── theme.tsx                  # MUI theme factory (LTR/RTL toggle)
│   └── queryClient.ts             # TanStack Query config
│
├── features/
│   ├── catalog/
│   │   ├── components/            # ProductCard, ProductGrid, FilterBar
│   │   ├── hooks/                 # useProducts, useProduct
│   │   └── api.ts                 # API calls for catalog
│   ├── cart/
│   │   ├── components/            # CartDrawer, CartItem, CartSummary
│   │   ├── store.ts               # Zustand cart slice
│   │   └── hooks.ts               # useCart
│   ├── checkout/
│   │   ├── components/            # CheckoutForm, DeliveryZoneSelect
│   │   ├── hooks/                 # useCheckout, useDeliveryZones
│   │   └── api.ts
│   ├── orders/
│   │   ├── components/            # OrderList, OrderDetail, OrderStatusBadge
│   │   ├── hooks/                 # useOrders, useOrder
│   │   └── api.ts
│   ├── auth/
│   │   ├── components/            # LoginForm, RegisterForm
│   │   ├── store.ts               # Zustand auth slice (token + user)
│   │   └── api.ts
│   └── admin/
│       ├── products/              # Admin product CRUD
│       ├── orders/                # Order management + status updates
│       ├── users/                 # User list + management
│       └── delivery-zones/        # City + fee management
│
├── shared/
│   ├── components/
│   │   ├── Layout/                # AppShell, Navbar, Footer
│   │   ├── RTLProvider.tsx        # Wraps MUI CacheProvider with stylis-plugin-rtl
│   │   └── LanguageSwitcher.tsx
│   ├── hooks/
│   │   ├── useDirection.ts        # Returns 'ltr'|'rtl' based on current locale
│   │   └── useApi.ts              # Axios instance with auth header
│   └── utils/
│       └── formatCurrency.ts      # MAD formatting
│
├── locales/
│   ├── fr/
│   │   └── translation.json
│   ├── ar/
│   │   └── translation.json
│   └── en/
│       └── translation.json
│
└── main.tsx                       # App entry — RTLProvider + ThemeProvider + QueryProvider
```

### Structure Rationale

- **features/:** Groups all code (components, hooks, API calls) by business domain. A developer working on checkout finds everything in one place. Scale to dozens of features without collision.
- **shared/:** Cross-feature utilities only. RTLProvider and LanguageSwitcher live here because every feature uses them.
- **admin/ under features/:** Admin and customer share one React app to avoid duplicating API clients, auth logic, and components. Separate sub-tree keeps admin and customer code isolated.
- **locales/:** Flat JSON files per language. i18next loads them lazily. Backend locale (for validation messages) mirrors this with `lang/fr/`, `lang/ar/`, `lang/en/`.

---

## Architectural Patterns

### Pattern 1: Thin Controller, Fat Service

**What:** Controllers handle only HTTP concerns (auth, validation delegation, response). Business logic lives in Service classes injected via constructor.
**When to use:** Any operation with more than one step (create order = validate stock + compute total + persist + dispatch email).
**Trade-offs:** Slightly more files. Dramatically easier to test and reuse logic between controllers.

**Example:**
```php
class OrderController extends Controller
{
    public function __construct(private OrderService $orders) {}

    public function store(PlaceOrderRequest $request): OrderResource
    {
        $order = $this->orders->place(
            customer: $request->user(),
            data: $request->validated()
        );
        return new OrderResource($order);
    }
}
```

### Pattern 2: API Resources as Contract

**What:** Every model exposed via API has a dedicated Resource class. The Resource defines exactly what fields are returned and in what shape — internal fields never leak.
**When to use:** Always. Even simple models benefit from having one place to control serialization.
**Trade-offs:** One extra file per model. Pays back immediately when you need to hide a field or add a computed property.

**Example:**
```php
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->getTranslation('name', app()->getLocale()),
            'slug'        => $this->slug,
            'price'       => $this->price,
            'images'      => $this->images,
            'attributes'  => $this->attributes, // Generic JSON column
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'in_stock'    => $this->stock_quantity > 0,
        ];
    }
}
```

### Pattern 3: Feature-Scoped API Hooks (React)

**What:** Each feature owns its own API layer (`features/catalog/api.ts`) and TanStack Query hooks (`features/catalog/hooks/`). No shared API client calls scattered across components.
**When to use:** Always in a feature-based structure.
**Trade-offs:** Some duplication of query boilerplate. Completely eliminates cross-feature coupling.

**Example:**
```typescript
// features/catalog/api.ts
export const catalogApi = {
  getProducts: (params: ProductsParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }),
  getProduct: (slug: string) =>
    apiClient.get<Product>(`/products/${slug}`),
};

// features/catalog/hooks/useProducts.ts
export function useProducts(params: ProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => catalogApi.getProducts(params),
  });
}
```

### Pattern 4: RTL-Aware Theme Factory

**What:** MUI theme and Emotion cache are recreated when locale changes. The `dir` attribute flips, and `@mui/stylis-plugin-rtl` transforms all CSS rules automatically.
**When to use:** Required for correct Arabic layout. Without this, MUI components render mirrored margins/padding in Arabic.
**Trade-offs:** Slight performance cost on locale switch (theme recreation). Acceptable — locale switching is rare.

**Example:**
```typescript
// shared/components/RTLProvider.tsx
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

function createRtlCache() {
  return createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });
}
function createLtrCache() {
  return createCache({ key: 'muiltr', stylisPlugins: [prefixer] });
}

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const cache = isRTL ? createRtlCache() : createLtrCache();

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={createTheme({ direction: isRTL ? 'rtl' : 'ltr' })}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
```

---

## Data Flow

### Customer Checkout Flow (critical path)

```
[Customer selects city]
        |
[DeliveryZoneSelect] --> GET /api/delivery-zones
        |                    |
        |               [DeliveryZoneController]
        |               [DeliveryZoneService]
        |               [DeliveryZone model]
        |               JSON: { city, fee }
        |
[Cart recalculates total + delivery fee]
        |
[Customer submits order form]
        |
POST /api/orders
  { items[], delivery_zone_id, address, phone }
        |
[Sanctum auth:sanctum middleware]
[PlaceOrderRequest validates]
        |
[OrderController -> OrderService]
        |
    [OrderService]
        ├── Check stock (ProductService)
        ├── Fetch zone fee (DeliveryZoneService)
        ├── Persist Order + OrderItems
        ├── Decrement stock
        └── Dispatch SendOrderConfirmation job
        |
[OrderResource returns]
  { id, status: "pending", total, delivery_fee, items[] }
        |
[React updates order history, clears cart]
```

### Admin Order Status Update Flow

```
[Admin clicks "Mark as Delivered"]
        |
PATCH /api/admin/orders/{id}
  { status: "delivered" }
        |
[AdminOnly middleware]
[UpdateOrderRequest validates]
        |
[Admin\OrderController -> OrderService]
        |
    [OrderService::transition(order, 'delivered')]
        ├── Validates allowed status transition
        ├── Persists new status
        └── Dispatches CustomerNotification event
        |
[OrderResource returns updated order]
```

### State Management

```
[Zustand Auth Store]          [Zustand Cart Store]
   token, user                  items[], zone_id
        |                              |
        |----- persisted to localStorage (cart) -------|
        |
[TanStack Query Cache]
   server state: products, orders, zones
   auto-invalidates after mutations
        |
[React Components]
   read from Query cache
   write via useMutation hooks
   optimistic updates on cart
```

### Key Data Flows

1. **Locale propagation:** User picks language → i18next switches locale → `useDirection` hook returns 'rtl' or 'ltr' → RTLProvider recreates Emotion cache + MUI theme → document `dir` attribute flips → all MUI and custom components reflow.
2. **Authentication:** Login → `POST /api/auth/login` → Sanctum issues token → stored in Zustand auth store (memory) + localStorage → Axios interceptor attaches `Authorization: Bearer <token>` to every subsequent request.
3. **Generic product attributes:** `attributes` is a JSON column on `Product`. Admin sends arbitrary key-value pairs. Frontend renders them from translation namespace (`attributes.motor_power` etc). No schema migration needed when adding new scooter specs.
4. **Delivery fee resolution:** Frontend fetches all zones once, caches via TanStack Query. User selects city → fee applied locally. Recalculated server-side during order placement to prevent tampering.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith Laravel on single VPS. File cache. No queue worker needed for email. Suitable for MVP. |
| 1k-100k users | Add Redis for cache and queue. Add dedicated queue worker process. Separate DB reads to read replica if query load spikes. Consider image CDN for scooter photos. |
| 100k+ users | Extract product catalog to read-heavy API with caching layer. Consider splitting admin into separate Laravel app. Evaluate Elasticsearch for product search. |

### Scaling Priorities

1. **First bottleneck:** Product image delivery. Scooter product images are large. Solve with Cloudflare R2 or S3 + CDN from day one. This is architectural (storage driver) not scale-driven.
2. **Second bottleneck:** Product catalog queries with filters. Add database indexes on `category_id`, `price`, `stock_quantity` early. Use Query Builder for filtered lists, not raw collection filtering.

---

## Anti-Patterns

### Anti-Pattern 1: Business Logic in Controllers

**What people do:** Write full order placement logic (stock check, fee calc, persist, email) inside a controller method.
**Why it's wrong:** Cannot be reused from CLI commands, jobs, or tests. Controllers grow to 500+ lines. Testing requires HTTP context.
**Do this instead:** Push all logic into `OrderService`. Controller calls one method, returns one Resource.

### Anti-Pattern 2: Returning Eloquent Models Directly

**What people do:** Return `$product` or `Product::all()` directly from a controller method.
**Why it's wrong:** Leaks internal fields (timestamps, pivot data, hidden passwords if relationship forgotten). Breaking change if model changes. No control over nested resource shape.
**Do this instead:** Always wrap in a Resource: `return new ProductResource($product)` or `ProductResource::collection($products)`.

### Anti-Pattern 3: Global State for Server Data in React

**What people do:** Fetch products/orders into Redux or Zustand and manually manage loading/error/stale states.
**Why it's wrong:** Reinvents caching, deduplication, and background refresh. 300+ lines of boilerplate per feature.
**Do this instead:** Use TanStack Query for all server state. Zustand only for true client state (cart contents, auth token, language preference).

### Anti-Pattern 4: Single Direction MUI Theme

**What people do:** Create one MUI theme and add `dir="rtl"` to the HTML element but skip the Emotion cache with `stylis-plugin-rtl`.
**Why it's wrong:** MUI generates CSS with physical properties (`margin-left`, `padding-right`). Without the stylis plugin, these are NOT flipped. Arabic layout breaks on all components.
**Do this instead:** Use `RTLProvider` pattern (see Pattern 4 above) that recreates both theme direction and Emotion cache together.

### Anti-Pattern 5: Hard-Coding Delivery Fee in Frontend

**What people do:** Store delivery fees in frontend constants or environment variables.
**Why it's wrong:** Admin cannot update fees without a deployment. City list diverges from backend.
**Do this instead:** Delivery zones and fees are admin-managed data in the database. Frontend fetches from `/api/delivery-zones`. Server recalculates on order placement.

### Anti-Pattern 6: Mixing Admin and Customer Routes Without Middleware

**What people do:** Protect admin routes only by hiding them in the UI.
**Why it's wrong:** API routes are accessible regardless of frontend. Any user with a token can call admin endpoints.
**Do this instead:** Apply `AdminOnly` middleware (checks `user->role === 'admin'`) to all `/api/admin/*` routes in `routes/api.php`. Defense in depth: both UI routing and API middleware.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Email (SMTP / Mailgun) | Laravel Mail + Queue job | Send order confirmation async. Use `SendOrderConfirmation` job to avoid blocking checkout response. |
| File Storage (images) | Laravel Filesystem — S3 driver | Scooter product images. Use `Storage::disk('s3')->put()`. CDN URL returned in ProductResource. Configure from day one even if using local disk initially. |
| SMS (optional, Moroccan carriers) | HTTP client wrapper in Service class | For order status notifications in Morocco. Infobip or Twilio cover Morocco. Defer to Phase 2+. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| React SPA <-> Laravel API | REST JSON over HTTPS. Sanctum Bearer token. | Single base URL (`/api/v1/`). Versioned prefix allows future breaking changes. |
| Customer routes <-> Admin routes | Separate controller namespaces in same app. Shared Models and Services. | Admin and Customer controllers call the same Services — no duplicated business logic. |
| OrderService <-> PricingService | Direct PHP method call (constructor injection) | PricingService is a dependency of OrderService. Never call from frontend — pricing authoritative on server only. |
| Laravel <-> Queue Worker | Laravel Queue (database driver → Redis) | Jobs dispatched from Services. Worker runs as separate process. Start with database driver; switch to Redis when load justifies. |
| Frontend features <-> Shared state | Zustand stores (auth, cart) accessed by any feature | Auth and cart are the only truly global client state. All other state is local or in TanStack Query. |

---

## Build Order Implications

Architecture dependencies determine what must be built before what:

```
1. Database schema + migrations
       |
2. Eloquent models + relationships
       |
3. API Resources (define the JSON contract)
       |
4. Services (business logic, depend on models)
       |
5. Form Requests (validation rules)
       |
6. Controllers (thin wrappers calling services)
       |
7. routes/api.php (register all endpoints)
       |
8. React API client + TanStack Query setup
       |
9. Feature hooks (useProducts, useOrders, etc.)
       |
10. Feature components (consume hooks)
        |
11. RTLProvider + i18n (layer over completed UI)
        |
12. Admin feature (mirrors customer, same services)
```

**Why this order:**
- Models before Resources because Resources reference model fields.
- Resources before frontend because frontend TypeScript types are derived from the JSON contract.
- Services before Controllers because controllers are just HTTP wrappers around services.
- RTL/i18n added as a layer after component structure is stable — avoids fighting layout while also debugging translation keys.
- Admin built after customer because admin is mostly CRUD over the same data; the data model, services, and API patterns are proven by then.

---

## Sources

- [Laravel 12.x Directory Structure](https://laravel.com/docs/12.x/structure) — HIGH confidence (official docs)
- [Laravel 12.x Eloquent API Resources](https://laravel.com/docs/12.x/eloquent-resources) — HIGH confidence (official docs)
- [Laravel 12.x Sanctum](https://laravel.com/docs/12.x/sanctum) — HIGH confidence (official docs)
- [MUI Right-to-Left Support](https://mui.com/material-ui/customization/right-to-left/) — HIGH confidence (official docs)
- [react-i18next Documentation](https://react.i18next.com/) — HIGH confidence (official docs)
- [React Feature-Based Folder Structure 2025](https://www.robinwieruch.de/react-folder-structure/) — MEDIUM confidence (widely cited, multiple sources agree)
- [Mastering the Service-Repository Pattern in Laravel](https://medium.com/@binumathew1988/mastering-the-service-repository-pattern-in-laravel-751da2bd3c86) — MEDIUM confidence (consistent with official Laravel best practices)
- [Laravel API Best Practices 2025](https://hafiz.dev/blog/laravel-api-development-restful-best-practices-for-2025) — MEDIUM confidence (verified against official docs)
- [React-admin Architecture Patterns](https://marmelab.com/react-admin/Architecture.html) — MEDIUM confidence (reference for admin routing separation)
- [Building Role-Based REST API with Laravel Sanctum](https://www.amezmo.com/laravel-hosting-guides/role-based-api-authentication-with-laravel-sanctum) — MEDIUM confidence (consistent with Sanctum official docs)

---
*Architecture research for: Local e-commerce — Electric scooters Morocco (Laravel API + React SPA)*
*Researched: 2026-02-12*
