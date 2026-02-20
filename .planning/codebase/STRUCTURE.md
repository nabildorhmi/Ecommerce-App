# Codebase Structure

**Analysis Date:** 2026-02-20

## Directory Layout

```
TrotinetteApp/
├── .planning/                          # GSD planning documents (this tool)
├── .git/                               # Git repository
├── trotinette-frontend/                # React + TypeScript frontend application
│   ├── src/
│   │   ├── main.tsx                    # Entry point: bootstraps React root with providers
│   │   ├── App.tsx                     # Legacy template file (not used by router)
│   │   ├── index.css                   # Global styles
│   │   ├── app/                        # Application core configuration
│   │   │   ├── router.tsx              # React Router configuration with all routes
│   │   │   ├── i18n.ts                 # i18next setup with fr/en/ar preloaded resources
│   │   │   ├── queryClient.ts          # React Query client configuration
│   │   │   ├── theme.ts                # MUI theme definition
│   │   │   └── themeStore.ts           # Theme preference store
│   │   ├── shared/                     # Reusable components and utilities
│   │   │   ├── api/
│   │   │   │   └── client.ts           # Axios instance with request/response interceptors
│   │   │   ├── components/
│   │   │   │   ├── RootLayout.tsx      # Layout wrapper (Navbar, Outlet, Footer)
│   │   │   │   ├── Navbar.tsx          # Navigation bar with language switcher
│   │   │   │   ├── Footer.tsx          # Footer component
│   │   │   │   ├── ProtectedRoute.tsx  # Auth guard for customer routes
│   │   │   │   ├── AdminRoute.tsx      # Auth guard for admin routes
│   │   │   │   ├── LanguageSwitcher.tsx # Language selection dropdown
│   │   │   │   ├── RTLProvider.tsx     # Theme provider + RTL support
│   │   │   │   └── RtlSmokeTest.tsx    # RTL verification component
│   │   │   ├── hooks/                  # Shared custom hooks
│   │   │   └── utils/                  # Utility functions
│   │   ├── features/                   # Feature modules (domain-organized)
│   │   │   ├── auth/                   # Authentication
│   │   │   │   ├── api/
│   │   │   │   │   └── auth.ts         # Login, register, profile queries
│   │   │   │   ├── components/         # Auth-specific components
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx   # /login route
│   │   │   │   │   └── ProfilePage.tsx # /profile route (protected)
│   │   │   │   ├── store.ts            # Zustand auth state (token, user)
│   │   │   │   └── types.ts            # Auth interfaces
│   │   │   ├── catalog/                # Product browsing
│   │   │   │   ├── api/
│   │   │   │   │   ├── products.ts     # useProducts, useProduct, useFeaturedProducts
│   │   │   │   │   └── categories.ts   # useCategories query
│   │   │   │   ├── components/         # ProductCard, FilterBar, etc.
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useCatalogFilters.ts # Filter state management
│   │   │   │   ├── pages/
│   │   │   │   │   ├── CatalogPage.tsx # /products route with filtering
│   │   │   │   │   └── ProductDetailPage.tsx # /products/:slug route
│   │   │   │   └── types.ts            # Product, Category, Filter types
│   │   │   ├── home/                   # Homepage
│   │   │   │   └── pages/
│   │   │   │       └── HomePage.tsx    # / route with hero + featured carousel
│   │   │   ├── cart/                   # Shopping cart
│   │   │   │   ├── components/         # Cart drawer, cart item
│   │   │   │   ├── store.ts            # Zustand cart state (items, actions)
│   │   │   │   └── types.ts            # CartItem interface
│   │   │   ├── checkout/               # Purchase flow
│   │   │   │   ├── api/
│   │   │   │   │   └── orders.ts       # createOrder mutation, deliveryZones query
│   │   │   │   ├── pages/
│   │   │   │   │   ├── CheckoutPage.tsx # /checkout route (protected)
│   │   │   │   │   └── OrderConfirmationPage.tsx # /orders/{id}/confirmation
│   │   │   │   └── types.ts            # Order types
│   │   │   ├── orders/                 # Order history
│   │   │   │   ├── api/
│   │   │   │   │   └── orders.ts       # useOrders, useOrderDetail queries
│   │   │   │   ├── components/         # Order list, status display
│   │   │   │   ├── pages/
│   │   │   │   │   ├── MyOrdersPage.tsx # /orders route (protected, customer)
│   │   │   │   │   └── AdminOrdersPage.tsx # /admin/orders (admin)
│   │   │   │   │   └── AdminOrderDetailPage.tsx # /admin/orders/:id
│   │   │   │   └── types.ts            # Order, OrderItem types
│   │   │   └── admin/                  # Admin dashboard
│   │   │       ├── api/
│   │   │       │   └── admin.ts        # Product CRUD, user management, zone CRUD
│   │   │       ├── components/         # Admin-specific UI components
│   │   │       ├── pages/
│   │   │       │   ├── AdminProductsPage.tsx # /admin/products
│   │   │       │   ├── AdminProductEditPage.tsx # /admin/products/:id/edit
│   │   │       │   ├── AdminCategoriesPage.tsx # /admin/categories
│   │   │       │   ├── AdminUsersPage.tsx # /admin/users
│   │   │       │   ├── AdminUserDetailPage.tsx # /admin/users/:id
│   │   │       │   └── AdminDeliveryZonesPage.tsx # /admin/delivery-zones
│   │   │       └── types.ts            # Admin forms and types
│   │   ├── locales/                    # i18n translation files
│   │   │   ├── fr/
│   │   │   │   └── translation.json    # French translations
│   │   │   └── en/
│   │   │       └── translation.json    # English translations
│   │   ├── assets/                     # Static assets (logos, images)
│   │   └── test/                       # Test utilities and setup
│   │       └── setup.ts                # Vitest configuration
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Frontend dependencies
│   ├── tsconfig.json                   # TypeScript root config (references app/node)
│   ├── tsconfig.app.json               # TypeScript app config
│   ├── tsconfig.node.json              # TypeScript node config
│   ├── vite.config.ts                  # Vite build configuration with Vitest
│   └── node_modules/                   # Installed dependencies (ignored in git)
│
├── trotinette-api/                     # Laravel REST API backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Controller.php      # Base controller class
│   │   │   │   ├── Admin/              # Admin-only endpoints
│   │   │   │   │   ├── ProductController.php # CRUD operations on products
│   │   │   │   │   ├── CategoryController.php # CRUD on categories
│   │   │   │   │   ├── UserController.php # User management
│   │   │   │   │   ├── OrderController.php # Order status transitions
│   │   │   │   │   └── DeliveryZoneController.php # CRUD on delivery zones
│   │   │   │   └── Customer/           # Public + auth customer endpoints
│   │   │   │       ├── AuthController.php # Register, login, logout, profile
│   │   │   │       ├── ProductController.php # List, show (public catalog)
│   │   │   │       ├── CategoryController.php # List (public)
│   │   │   │       ├── OrderController.php # Create order, view orders
│   │   │   │       └── DeliveryZoneController.php # List zones (public)
│   │   │   ├── Requests/               # Form validation classes
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginRequest.php
│   │   │   │   │   ├── RegisterRequest.php
│   │   │   │   │   └── UpdateProfileRequest.php
│   │   │   │   ├── Admin/              # Admin request validation
│   │   │   │   └── StoreOrderRequest.php # Order creation validation
│   │   │   ├── Resources/              # API response transformers
│   │   │   │   ├── ProductResource.php # Transform Product model to JSON
│   │   │   │   ├── ProductCollection.php # Transform paginated products
│   │   │   │   ├── OrderResource.php   # Transform Order with relationships
│   │   │   │   ├── UserResource.php
│   │   │   │   ├── CategoryResource.php
│   │   │   │   ├── DeliveryZoneResource.php
│   │   │   │   ├── MediaResource.php   # Image metadata
│   │   │   │   ├── OrderItemResource.php
│   │   │   │   └── OrderStatusLogResource.php
│   │   │   └── Middleware/
│   │   │       └── SetLocale.php       # Parse Accept-Language header, set app locale
│   │   ├── Models/
│   │   │   ├── User.php                # User with roles (via Spatie/permission)
│   │   │   ├── Product.php             # Product with media, translations, category
│   │   │   ├── ProductTranslation.php  # i18n translations for products
│   │   │   ├── Category.php            # Product category with translations
│   │   │   ├── CategoryTranslation.php # i18n translations for categories
│   │   │   ├── Order.php               # Order with items and status log
│   │   │   ├── OrderItem.php           # Line item in order
│   │   │   ├── OrderStatusLog.php      # Audit trail of order transitions
│   │   │   └── DeliveryZone.php        # Service area with fee
│   │   ├── Services/
│   │   │   ├── AuthService.php         # Register, login, logout logic
│   │   │   ├── ProductService.php      # Product CRUD with media handling
│   │   │   ├── CategoryService.php     # Category CRUD with translations
│   │   │   └── OrderService.php        # Order creation with transactions + locking
│   │   ├── Enums/
│   │   │   └── OrderStatus.php         # Order status with transitions + locale labels
│   │   └── Providers/
│   │       └── AppServiceProvider.php  # Service registration
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 0001_01_01_*.php       # Laravel default tables (users, cache, jobs)
│   │   │   ├── 2026_02_13_000001_create_categories_table.php
│   │   │   ├── 2026_02_13_000002_create_products_table.php
│   │   │   ├── 2026_02_13_000003_create_product_translations_table.php
│   │   │   ├── 2026_02_13_000004_create_delivery_zones_table.php
│   │   │   ├── 2026_02_14_200507_create_permission_tables.php # Spatie/permission
│   │   │   └── 2026_02_14_200934_create_personal_access_tokens_table.php # Sanctum
│   │   ├── factories/
│   │   │   └── UserFactory.php         # Test user factory
│   │   └── seeders/                    # Database seeders for test data
│   ├── routes/
│   │   └── api.php                     # API route definitions with middleware groups
│   ├── config/
│   │   ├── app.php                     # App config (name, timezone, locale)
│   │   ├── database.php                # Database connection config
│   │   ├── auth.php                    # Auth guards and providers
│   │   ├── sanctum.php                 # Sanctum token config
│   │   └── permission.php              # Spatie/permission tables
│   ├── storage/
│   │   ├── app/public/                 # Uploaded product images (media library)
│   │   ├── framework/                  # Session, cache, logs (framework generated)
│   │   └── logs/                       # Application logs
│   ├── public/
│   │   └── index.php                   # Public entry point (Laravel)
│   ├── bootstrap/
│   │   └── cache/                      # Bootstrap cache (generated)
│   ├── vendor/                         # Composer dependencies (ignored in git)
│   ├── .env.example                    # Example environment file
│   ├── composer.json                   # PHP dependencies
│   ├── composer.lock                   # Dependency lock file
│   └── artisan                         # Laravel CLI command
│
├── .gitignore                          # Git ignore rules
├── configure-laravel.ps1               # PowerShell setup script
├── install-deps.ps1                    # PowerShell dependency installation
└── setup-laravel.ps1                   # PowerShell initial setup
```

## Directory Purposes

**trotinette-frontend/src/app/:**
- Purpose: Bootstrap and global application setup
- Contains: Router definition, providers (QueryClient, RTLProvider), i18n initialization, theme config
- Key files: `router.tsx` (all route definitions), `i18n.ts` (language setup), `queryClient.ts` (data fetching config)

**trotinette-frontend/src/shared/:**
- Purpose: Reusable components and utilities shared across features
- Contains: Layout components, API client, route guards, common hooks
- Usage: Imported by feature modules and pages
- Pattern: No feature-specific logic, purely shared infrastructure

**trotinette-frontend/src/features/:**
- Purpose: Feature modules organized by business domain
- Structure: Each feature is self-contained with api/, components/, pages/, types/, store.ts
- Modules: `auth` (login/profile), `catalog` (product browsing), `cart` (shopping cart), `checkout` (purchase), `orders` (history), `admin` (management), `home` (landing page)
- Pattern: Features may import from shared/ but not from other features

**trotinette-api/app/Http/Controllers/Admin/ & Customer/:**
- Purpose: Route handlers with role-based separation
- Pattern: Admin controllers handle privileged operations; Customer handle public + authenticated customer flows
- Responsibility: Parse requests, delegate to services, return API resources

**trotinette-api/app/Services/:**
- Purpose: Encapsulate business logic and complex operations
- Usage: Injected into controllers via constructor
- Pattern: Services are stateless, handle transactions, return models or DTOs

**trotinette-api/app/Models/:**
- Purpose: Eloquent ORM models representing database entities
- Relationships: Defined via methods (hasMany, belongsTo, hasOne)
- Scopes: Query builder methods like `active()` for reusable query filters
- Media: Product uses Spatie Media Library for image handling

**trotinette-api/database/:**
- Purpose: Schema definition and test data
- Migrations: Define and version database schema
- Factories: Generate test models with realistic data
- Seeders: Populate database with initial/test data

## Key File Locations

**Entry Points:**
- `trotinette-frontend/src/main.tsx`: React application bootstrap
- `trotinette-frontend/public/index.html`: HTML entry point for frontend
- `trotinette-api/routes/api.php`: API route definitions
- `trotinette-api/public/index.php`: Laravel entry point

**Configuration:**
- `trotinette-frontend/src/app/router.tsx`: All frontend routes and layout structure
- `trotinette-frontend/src/app/i18n.ts`: Language setup (fr, en, ar with preloaded resources)
- `trotinette-frontend/vite.config.ts`: Build tool config
- `trotinette-api/config/`: Laravel configuration directory (app, auth, database, sanctum)

**Core Logic:**
- `trotinette-frontend/src/shared/api/client.ts`: Axios config with interceptors (auth, language headers)
- `trotinette-api/app/Services/OrderService.php`: Critical order creation with locking and transactions
- `trotinette-api/app/Services/AuthService.php`: User registration and token generation
- `trotinette-api/app/Enums/OrderStatus.php`: Order status state machine with transitions

**Testing:**
- `trotinette-frontend/src/test/setup.ts`: Vitest configuration and globals
- `trotinette-frontend/vitest.config.ts`: Test runner configuration

**Styling & Theme:**
- `trotinette-frontend/src/app/theme.ts`: MUI theme definition
- `trotinette-frontend/src/index.css`: Global CSS
- `trotinette-frontend/src/shared/components/RTLProvider.tsx`: Theme provider with RTL support

**State Management:**
- `trotinette-frontend/src/features/auth/store.ts`: Auth token and user info (localStorage-persisted)
- `trotinette-frontend/src/features/cart/store.ts`: Shopping cart items (localStorage-persisted)

## Naming Conventions

**Files:**

**Frontend:**
- Components: PascalCase `.tsx` (e.g., `ProductCard.tsx`, `ProtectedRoute.tsx`)
- Pages: PascalCase with Page suffix `.tsx` (e.g., `CatalogPage.tsx`, `LoginPage.tsx`)
- Hooks: camelCase with use prefix `.ts` (e.g., `useCatalogFilters.ts`, `useProducts.ts`)
- Stores: camelCase with .store.ts suffix (e.g., `auth/store.ts`, `cart/store.ts`)
- APIs: camelCase `.ts` (e.g., `products.ts`, `categories.ts`)
- Types: camelCase with .types.ts suffix (e.g., `catalog/types.ts`)
- Utilities: camelCase `.ts` (e.g., `formatPrice.ts`)

**Backend (Laravel):**
- Controllers: PascalCase with Controller suffix (e.g., `ProductController.php`)
- Models: PascalCase singular (e.g., `Product.php`, `Order.php`)
- Services: PascalCase with Service suffix (e.g., `AuthService.php`)
- Requests: PascalCase with Request suffix (e.g., `LoginRequest.php`)
- Resources: PascalCase with Resource suffix (e.g., `ProductResource.php`)
- Enums: PascalCase (e.g., `OrderStatus.php`)
- Migrations: snake_case with timestamp prefix (e.g., `2026_02_13_000002_create_products_table.php`)

**Directories:**

**Frontend:**
- Feature folders: lowercase singular (e.g., `auth`, `catalog`, `orders`)
- Subdirs: lowercase plural when containing multiple items (e.g., `components/`, `pages/`, `api/`)

**Backend:**
- Namespace folders: PascalCase (e.g., `Http/`, `Models/`, `Services/`)
- Controller subdirs: PascalCase role-based (e.g., `Admin/`, `Customer/`)

## Where to Add New Code

**New Feature (e.g., Wishlist):**
- Create directory: `trotinette-frontend/src/features/wishlist/`
- Structure:
  ```
  wishlist/
  ├── api/wishlist.ts          # useWishlistItems, addToWishlist queries
  ├── components/              # WishlistCard, WishlistButton
  ├── pages/WishlistPage.tsx   # /wishlist route
  ├── store.ts                 # Zustand for wishlist items
  └── types.ts                 # Wishlist interfaces
  ```
- Register route in `trotinette-frontend/src/app/router.tsx`
- Backend:
  - Create `WishlistController` in `app/Http/Controllers/Customer/`
  - Create `Wishlist` model in `app/Models/`
  - Add routes in `routes/api.php`

**New Component (Shared):**
- Create in: `trotinette-frontend/src/shared/components/ComponentName.tsx`
- Export from: `trotinette-frontend/src/shared/components/index.ts` (if barrel file exists)
- Import across features as needed

**New Admin Feature (e.g., Reports):**
- Backend controller: `trotinette-api/app/Http/Controllers/Admin/ReportController.php`
- Create route group under admin middleware in `routes/api.php`
- Service if complex: `trotinette-api/app/Services/ReportService.php`
- Frontend:
  - Create `trotinette-frontend/src/features/admin/pages/AdminReportsPage.tsx`
  - Create queries in `trotinette-frontend/src/features/admin/api/admin.ts`
  - Add route to router: `/admin/reports`

**Utilities (Frontend):**
- Shared utilities: `trotinette-frontend/src/shared/utils/`
- Feature-specific utilities: `trotinette-frontend/src/features/{feature}/utils.ts` or `utils/` folder
- Pattern: Export pure functions, keep dependencies minimal

**API Integration (Backend):**
- Validation: `trotinette-api/app/Http/Requests/`
- Response transformation: `trotinette-api/app/Http/Resources/`
- Query builder: Use Spatie QueryBuilder in controllers (see `ProductController::index`)

## Special Directories

**trotinette-frontend/src/locales/:**
- Purpose: i18n translation files
- Generated: No (manually maintained)
- Committed: Yes
- Structure: Language codes (fr, en) with translation.json files
- Usage: Imported in `app/i18n.ts` and consumed via `useTranslation()` hook

**trotinette-frontend/node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)
- Rebuild: `npm install` at project root

**trotinette-api/vendor/:**
- Purpose: Installed Composer dependencies
- Generated: Yes (by composer install)
- Committed: No (in .gitignore)
- Rebuild: `composer install` in api directory

**trotinette-api/storage/app/public/**:**
- Purpose: Uploaded product images and media
- Generated: Yes (by media library on upload)
- Committed: No (in .gitignore)
- Location: Served via `/storage` symlink in public directory

**trotinette-api/bootstrap/cache/:**
- Purpose: Laravel framework cache (compiled config, services)
- Generated: Yes (by artisan commands)
- Committed: No (in .gitignore)
- Clear: `php artisan cache:clear`

**.planning/codebase/:**
- Purpose: GSD analysis documents (this tool's output)
- Generated: Yes (by mapping agent)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

---

*Structure analysis: 2026-02-20*
