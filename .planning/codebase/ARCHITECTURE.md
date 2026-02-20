# Architecture

**Analysis Date:** 2026-02-20

## Pattern Overview

**Overall:** Tiered monorepo with decoupled frontend (React + TypeScript) and backend (Laravel API).

**Key Characteristics:**
- Separated frontend and backend in distinct directories with independent deployment
- Feature-based modular organization on the frontend
- Service-based architecture on the backend with controller-service-model separation
- Stateless REST API with token-based authentication (Laravel Sanctum)
- Client-side state management via Zustand stores
- React Query for server-state caching and synchronization

## Layers

**Frontend Application Layer:**
- Purpose: User interface and interaction logic
- Location: `trotinette-frontend/src/`
- Contains: React components, pages, forms, routing logic
- Depends on: Shared utilities, API client, state stores
- Used by: Browser/client

**Frontend Feature Modules:**
- Purpose: Domain-specific business logic separated by user workflow
- Location: `trotinette-frontend/src/features/*/`
- Contains: Feature-specific API calls, components, pages, hooks
- Depends on: Shared components, shared API client, React Query
- Used by: Router and other feature modules
- Example modules: `admin/`, `auth/`, `catalog/`, `checkout/`, `orders/`, `cart/`, `home/`

**Frontend Shared Layer:**
- Purpose: Reusable components and utilities across features
- Location: `trotinette-frontend/src/shared/`
- Contains: Layout components (`RootLayout`, `Navbar`, `Footer`), API client config, auth/route guards, common hooks, utilities
- Depends on: MUI Material, React Router, i18n, Axios
- Used by: All feature modules

**Frontend App Core:**
- Purpose: Application bootstrap and global configuration
- Location: `trotinette-frontend/src/app/`
- Contains: Router definition, React Query client, i18n setup, theme configuration, Zustand stores initialization
- Depends on: All feature modules, shared layer
- Used by: `main.tsx` entry point

**Backend HTTP Layer:**
- Purpose: Request handling and response transformation
- Location: `trotinette-api/app/Http/`
- Contains: Controllers (by role: Admin, Customer), middleware, request validation, resource transformers
- Depends on: Services, models, enums
- Used by: Routes and Laravel request-response cycle
- Pattern: Thin controllers delegating logic to services

**Backend Service Layer:**
- Purpose: Business logic and domain operations
- Location: `trotinette-api/app/Services/`
- Contains: `AuthService`, `ProductService`, `CategoryService`, `OrderService`
- Depends on: Models, database transactions, enums
- Used by: Controllers
- Pattern: Encapsulates complex operations, handles transactions, validation

**Backend Model Layer:**
- Purpose: Data entities and relationships
- Location: `trotinette-api/app/Models/`
- Contains: Eloquent models with relationships and scopes
- Models: `User`, `Product`, `ProductTranslation`, `Category`, `CategoryTranslation`, `Order`, `OrderItem`, `OrderStatusLog`, `DeliveryZone`
- Depends on: Database schema (migrations)
- Used by: Services and controllers
- Features: Relationships (`hasMany`, `belongsTo`), scopes (`active`), media library integration

**Backend Database Layer:**
- Purpose: Data persistence
- Location: `trotinette-api/database/`
- Contains: Migrations, seeders, factories
- Used by: Models
- Pattern: Migration-first schema definition with factories for testing

## Data Flow

**Product Catalog Browsing (Customer):**

1. User navigates to `/products` → `CatalogPage` component renders
2. `CatalogPage` calls `useProducts(filters)` hook with current filters
3. `useProducts` → `useQuery` with `queryKey: ['products', filters]`
4. Query function calls `apiClient.get('/products', { params })`
5. `apiClient` interceptor adds `Authorization: Bearer {token}` and `Accept-Language` headers
6. Request reaches `CustomerProductController::index()`
7. Controller uses `QueryBuilder` to filter products by locale and applied filters
8. Filters: `category_id`, `min_price`, `max_price`, `in_stock`, `search`
9. Products loaded with relationships: `translations`, `media`, `category.translations`
10. `ProductResource` transforms product data for response
11. Response cached by React Query with 5-minute stale time
12. `CatalogPage` renders grid with products + pagination

**Order Checkout (Customer):**

1. User adds items to cart → `useCartStore` persists to `localStorage`
2. User navigates to `/checkout` (protected route via `ProtectedRoute` component)
3. `CheckoutPage` reads cart from store and renders checkout form
4. Form submission calls `POST /orders` with items, phone, delivery_zone_id
5. Request interceptor adds auth token
6. `AdminOrderController::store()` → calls `OrderService::createOrder()`
7. Service starts database transaction with pessimistic locking:
   - Validates delivery zone is active
   - Checks for duplicate orders (same phone + product within 10 min)
   - Locks products with `lockForUpdate()` to prevent race conditions
   - Validates stock quantities
   - Calculates server-side subtotal and delivery fee
   - Creates Order + OrderItems
   - Decrements product stock
   - Logs initial status as "Pending"
8. Transaction commits or rolls back on validation errors
9. Response returns created order with confirmation details
10. Frontend redirects to `/orders/{orderNumber}/confirmation`

**Admin Product Management:**

1. Admin navigates to `/admin/products` (protected by `AdminRoute` component)
2. Admin sees product list (via `AdminProductsPage`)
3. Admin clicks edit → `/admin/products/{id}/edit` → `AdminProductEditPage`
4. Form submission calls `PUT /admin/products/{id}` with updated data
5. Request includes multipart file upload for product images
6. `AdminProductController::update()` → `ProductService::updateProduct()`
7. Service handles:
   - Product attribute updates
   - Media library handling (upload, delete, optimize)
   - ProductTranslation updates for each locale (fr, en, ar)
8. Product resource cached by React Query invalidates and refetches

**Authentication Flow:**

1. User enters credentials → `/login` page
2. Form submission → `POST /auth/register` or `POST /auth/login`
3. `AuthController::login()` or `register()` → `AuthService::login()` or `register()`
4. Service validates credentials and creates Sanctum token
5. Response includes user object and `plainTextToken`
6. Frontend stores in `useAuthStore` (persisted to `localStorage`)
7. `apiClient` interceptor reads token on subsequent requests
8. Protected routes check `useAuthStore.token` via `ProtectedRoute` component
9. 401 response triggers `clearAuth()` and redirects to `/login`

**Internationalization:**

1. i18n configured in `app/i18n.ts` with preloaded resources (fr, en, ar)
2. Language detected from: localStorage → navigator → HTML lang attribute
3. Backend locale set by `SetLocale` middleware from `Accept-Language` header
4. Products loaded with translations matching current locale
5. ProductTranslation and CategoryTranslation polymorphic relationships
6. Order status labels rendered with locale-aware enum methods

## Key Abstractions

**React Query Hooks:**
- Purpose: Manage server-state fetching, caching, invalidation
- Examples: `useProducts`, `useProduct`, `useCategories`, `useOrders`
- Location: `trotinette-frontend/src/features/*/api/`
- Pattern: Custom hooks wrapping `useQuery` and `useMutation` with configured query keys and parameters

**Zustand Stores:**
- Purpose: Client-side state persistence
- Examples: `useAuthStore`, `useCartStore`
- Location: `trotinette-frontend/src/features/*/store.ts`
- Pattern: Functional stores with persist middleware to localStorage

**Laravel Services:**
- Purpose: Encapsulate complex business logic and transactions
- Examples: `AuthService`, `OrderService`, `ProductService`, `CategoryService`
- Location: `trotinette-api/app/Services/`
- Pattern: Constructor dependency injection, atomic database transactions, validation

**Route Guards:**
- Purpose: Control access based on authentication and roles
- Components: `ProtectedRoute`, `AdminRoute`
- Location: `trotinette-frontend/src/shared/components/`
- Pattern: Wrapper components checking `useAuthStore` and redirecting if unauthorized

**API Resources:**
- Purpose: Transform model data for API responses
- Examples: `ProductResource`, `OrderResource`, `UserResource`
- Location: `trotinette-api/app/Http/Resources/`
- Pattern: Eloquent API Resources with relationships and computed properties

**Form Validation:**
- Purpose: Validate user input on submission
- Libraries: React Hook Form (frontend), Laravel FormRequest (backend)
- Pattern: Backend validation is source of truth; frontend for UX

**Theme System:**
- Purpose: Centralized styling and color system
- Location: `trotinette-frontend/src/app/theme.ts`
- Provider: `RTLProvider` (wraps theme setup, CssBaseline, RTL direction handling)
- Uses: MUI Material + Emotion CSS-in-JS

## Entry Points

**Frontend Entry:**
- Location: `trotinette-frontend/src/main.tsx`
- Triggers: Browser loads application
- Responsibilities: Bootstrap React root, setup providers (QueryClient, RTLProvider, RouterProvider, i18n)

**Backend Entry:**
- Location: `trotinette-api/routes/api.php`
- Triggers: HTTP request to `/api/*` endpoint
- Responsibilities: Route registration with middleware and controller mapping

**Router:**
- Location: `trotinette-frontend/src/app/router.tsx`
- Root layout: `RootLayout` wraps all routes with Navbar + Footer
- Public routes: `/`, `/products`, `/products/:slug`, `/login`
- Protected routes: `/profile`, `/checkout`, `/orders`, `/orders/:orderNumber/confirmation`
- Admin routes: `/admin/*` prefix with `AdminRoute` guard

## Error Handling

**Strategy:** Boundary pattern with fallback UI; axios response interceptor for auth errors

**Patterns:**
- 401 responses: Trigger `clearAuth()` and redirect to login
- Validation errors: Returned in response body with field-level detail
- Service layer: Throws `ValidationException` with labeled messages
- Frontend: React Query captures errors in `error` state; components render error UI conditionally

**Axios Interceptors:**
- Request: Inject auth token and Accept-Language header
- Response: Catch 401 and clear auth + redirect

## Cross-Cutting Concerns

**Logging:** Frontend uses `console` methods; backend uses Laravel's `Log` facade (configurable handler)

**Validation:**
- Frontend: React Hook Form with Zod schema validation (user experience)
- Backend: Laravel FormRequest with custom rules (source of truth)

**Authentication:**
- Token-based via Laravel Sanctum (stateless)
- Bearer token in Authorization header
- Roles enforced via Spatie permissions middleware
- Frontend session stored in localStorage via Zustand persist

**Localization:**
- Frontend: i18next with preloaded resources (fr, en, ar)
- Backend: Accept-Language header parsed by middleware to set `app()->getLocale()`
- Models: Polymorphic translations via ProductTranslation, CategoryTranslation tables

**Media Handling:**
- Spatie Media Library for product images
- Automatic conversions: thumbnail (200x200), card (600x400), full (1200x900)
- Non-queued conversions (synchronous optimization)
- Accepted types: JPEG, PNG, WebP

**Concurrency:**
- Backend: Pessimistic locking via `lockForUpdate()` for critical resources (products during checkout)
- Database transactions wrap complex operations (order creation)
- Duplicate order detection within 10-minute window per phone + product

---

*Architecture analysis: 2026-02-20*
