# Phase 7: Backend Refactoring - Research

**Researched:** 2026-03-01
**Domain:** Laravel 12 backend refactoring — architecture patterns, security hardening, performance optimization, error handling
**Confidence:** HIGH

## Summary

This research covers four interconnected domains for Laravel 12 backend refactoring: code architecture patterns (Service/Action, Repository, DTOs), security hardening (rate limiting, input sanitization, CORS, SQL injection prevention, XSS, CSRF, file uploads, Sanctum), performance optimization (N+1 detection, eager loading, caching with Redis, database indexing, API response optimization), and structured error code systems (RFC 7807 Problem Details).

The codebase already follows Service pattern with FormRequest validation and uses Spatie QueryBuilder for filtering. Key improvements needed: consistent Service layer usage, Action pattern for complex operations, security middleware (rate limiting, stricter CORS), performance tooling (Telescope, Larastan), caching migration from database to Redis, database indexing audit, and standardized error response format.

**Primary recommendation:** Implement incremental refactoring in priority order: (1) security hardening first (rate limiting, CORS tightening, input sanitization audit), (2) performance optimization (Redis caching, database indexing, N+1 detection with Telescope), (3) code architecture improvements (Action pattern for complex business logic, DTO introduction where beneficial), (4) structured error codes (RFC 7807 implementation).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Laravel | 12.x | Framework | Current LTS, modern architecture |
| PHP | 8.3+ | Language | Required for Laravel 12, readonly properties for DTOs |
| MySQL | 8.4 | Database | Already in use, supports functional indexes |
| Laravel Sanctum | 12.x | API authentication | Already implemented, industry standard for API tokens |
| Spatie laravel-permission | 6.x | RBAC | Already implemented |
| Spatie laravel-medialibrary | 11.x | Media handling | Already implemented |
| Spatie laravel-query-builder | 6.x | API filtering/sorting | Already in use |

### Supporting — Performance & Debugging
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Laravel Telescope | 5.x | Debug assistant, query monitoring | Development/staging for N+1 detection |
| Laravel Debugbar | 3.x | Alternative debugging tool | Development alternative to Telescope |
| Larastan | 2.x | Static analysis (PHPStan for Laravel) | CI/CD, pre-commit hooks for code quality |
| Redis | 7.x | Caching and queues | Production caching (replace database cache) |
| Laravel Pint | 1.x | Code formatting | Development, CI/CD for consistent code style |

### Supporting — Security
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| protonemedia/laravel-xss-protection | 1.x | XSS middleware | Optional: adds voku/anti-xss sanitization |
| Laravel built-in rate limiting | 12.x | Throttle middleware | Required for all API routes |

### Supporting — Architecture Patterns
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| WendellAdriel/laravel-validated-dto | 3.x | DTOs with validation | Optional: for complex data transfer scenarios |
| cerbero90/laravel-dto | 4.x | Alternative DTO package | Optional alternative |

### Supporting — Error Handling
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| API-Skeletons/laravel-api-problem | 3.x | RFC 7807 Problem Details | Standardized API error responses |
| kamranahmedse/laravel-faulty | 2.x | Alternative RFC 7807 package | Alternative approach |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Service pattern | Repository pattern | Adds abstraction layer, beneficial for very large teams or complex data access, but adds boilerplate for typical Laravel apps |
| Custom DTO classes | Arrays with FormRequest | DTOs provide type safety and IDE autocomplete but add complexity for simple use cases |
| Telescope | Clockwork | Clockwork is lighter, browser extension-based; Telescope is heavier but more comprehensive |
| Redis | Memcached | Memcached is simpler key-value only; Redis supports complex data types, pub/sub, queues |
| File cache | Database cache (current) | File cache is faster than database but slower than Redis; only use for local development |

**Installation:**
```bash
# Performance & Debugging (development)
composer require --dev laravel/telescope barryvdh/laravel-debugbar larastan/larastan laravel/pint

# Redis (production caching)
# Already in composer.json, just configure .env

# Static Analysis (CI/CD)
composer require --dev nunomaduro/larastan --with-all-dependencies

# Error Handling (optional, can implement manually)
composer require api-skeletons/laravel-api-problem

# XSS Protection (optional, evaluate necessity)
composer require protonemedia/laravel-xss-protection
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── Actions/              # Single-purpose business logic classes
│   ├── Order/
│   │   ├── CreateOrderAction.php
│   │   ├── TransitionOrderStatusAction.php
│   │   └── CalculateOrderTotalAction.php
│   └── Product/
│       ├── CreateProductWithVariantsAction.php
│       └── SyncProductStockAction.php
├── Services/             # Orchestration layer, delegates to Actions
│   ├── OrderService.php
│   ├── ProductService.php
│   └── AuthService.php
├── DTOs/                 # Data transfer objects (optional, use where beneficial)
│   ├── CreateOrderDTO.php
│   └── ProductDataDTO.php
├── Http/
│   ├── Controllers/      # Thin controllers, delegate to Services
│   ├── Requests/         # FormRequest validation (keep using)
│   ├── Resources/        # API resources (keep using)
│   └── Middleware/       # Custom middleware (rate limiting, logging)
├── Models/               # Eloquent models (keep lean)
└── Enums/                # Type-safe enums (already using OrderStatus)
```

### Pattern 1: Service + Action Pattern (Recommended)
**What:** Controllers delegate to Services, Services orchestrate Actions, Actions contain focused business logic
**When to use:** For complex operations like order creation, product variant generation
**Current state:** OrderService.createOrder is well-structured but monolithic (220 lines). Extract to Actions.

**Example:**
```php
// Source: https://medium.com/@harryespant/understanding-the-action-pattern-in-laravel-a-cleaner-way-to-organize-your-code-3c7f04666c23
// app/Actions/Order/CreateOrderAction.php
namespace App\Actions\Order;

use App\DTOs\CreateOrderDTO;
use App\Models\Order;

class CreateOrderAction
{
    public function __construct(
        private readonly ValidateStockAction $validateStock,
        private readonly CalculateOrderTotalAction $calculateTotal,
        private readonly DecrementStockAction $decrementStock,
    ) {}

    public function execute(CreateOrderDTO $data, int $userId): Order
    {
        return DB::transaction(function () use ($data, $userId) {
            $this->validateStock->execute($data->items);
            $total = $this->calculateTotal->execute($data->items);

            $order = Order::create([
                'user_id' => $userId,
                'total' => $total,
                // ...
            ]);

            $this->decrementStock->execute($data->items);

            return $order->load('items.product');
        });
    }
}

// Controller stays thin
class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, CreateOrderAction $action)
    {
        $order = $action->execute(
            CreateOrderDTO::fromRequest($request),
            $request->user()->id
        );

        return new OrderResource($order);
    }
}
```

### Pattern 2: Data Transfer Objects (DTOs) with Readonly Properties
**What:** Immutable data containers using PHP 8.2+ readonly properties
**When to use:** When passing data between layers, especially for complex operations with many parameters
**Current state:** Not in use. Consider for OrderService::createOrder, ProductService methods.

**Example:**
```php
// Source: https://medium.com/@zulfikarditya/data-transfer-objects-in-laravel-a-complete-guide-f80de8ee06e6
namespace App\DTOs;

readonly class CreateOrderDTO
{
    public function __construct(
        public array $items,
        public string $phone,
        public string $city,
        public ?string $note = null,
    ) {}

    public static function fromRequest(FormRequest $request): self
    {
        return new self(
            items: $request->validated('items'),
            phone: $request->validated('phone'),
            city: $request->validated('city'),
            note: $request->validated('note'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            items: $data['items'],
            phone: $data['phone'],
            city: $data['city'],
            note: $data['note'] ?? null,
        );
    }
}
```

### Pattern 3: Query Scopes and Repository Pattern (Use Sparingly)
**What:** Eloquent query scopes for reusable queries; Repository pattern for data access abstraction
**When to use:** Query scopes: always for reusable filters. Repository pattern: only if team requires strict data access abstraction.
**Current state:** Query scopes used (Product::active()). No repositories. **Don't add repositories unless specific need arises.**

**Example:**
```php
// Source: https://laravel.com/docs/12.x/eloquent#query-scopes
// Good: Query scopes (already using)
class Product extends Model
{
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function scopeInStock(Builder $query): void
    {
        $query->whereHas('variants', fn($q) =>
            $q->where('is_active', true)->where('stock', '>', 0)
        );
    }
}

// Usage
Product::active()->inStock()->get();
```

### Anti-Patterns to Avoid
- **Fat Controllers:** Controllers should not contain business logic. Current ProductController is good (delegates to ProductService).
- **Fat Models:** Don't put complex business logic in models. Keep models for relationships, scopes, accessors/mutators only.
- **Service God Classes:** OrderService::createOrder is approaching this. Split into Actions.
- **Repository Pattern Overuse:** Don't wrap Eloquent in repositories unless team/project scale demands it. Eloquent is already a repository pattern.
- **Premature DTO Introduction:** Don't create DTOs for every request. Use where complexity justifies it (5+ parameters, reused across layers).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| N+1 Query Detection | Custom query logging | Laravel Telescope, Debugbar | Built-in watchers, thresholds, source tracing |
| Rate Limiting | Custom throttle logic | Laravel RateLimiter facade, throttle middleware | Battle-tested, Redis-backed, per-user/IP, dynamic limits |
| Input Sanitization | Manual strip_tags loops | FormRequest validation + Blade auto-escaping | Laravel sanitizes by default; FormRequest validates |
| SQL Injection Prevention | Manual escaping | Eloquent/Query Builder | Uses PDO prepared statements automatically |
| CSRF Protection | Custom token generation | Laravel CSRF middleware (VerifyCsrfToken) | Auto-generates, validates, rotates tokens |
| API Error Responses | Custom JSON formatters | RFC 7807 package or custom Handler with consistent format | Industry standard, predictable for API consumers |
| Token Revocation | Custom token blacklists | Sanctum's built-in token deletion | Server-side state, immediate revocation |
| Caching | File-based custom cache | Redis with Laravel Cache facade | Atomic operations, 100x faster than disk, supports tags |
| Code Quality Analysis | Regex-based custom linters | Larastan (PHPStan for Laravel) | Static analysis, type checking, Laravel-aware rules |
| Database Indexing | Guess-based index creation | EXPLAIN queries + performance profiling | Index only proven bottlenecks, measure impact |

**Key insight:** Laravel's ecosystem provides battle-tested solutions for 95% of refactoring needs. Custom solutions accumulate edge cases and maintenance burden. Use framework tools first.

## Common Pitfalls

### Pitfall 1: Over-Engineering Architecture with Repository Pattern
**What goes wrong:** Adding Repository classes between Services and Eloquent models creates boilerplate without benefits for typical Laravel apps.
**Why it happens:** Developers apply enterprise patterns from other frameworks (Java, .NET) without considering Laravel's Eloquent is already a repository/active record pattern.
**How to avoid:** Use Service + Action pattern. Reserve Repository pattern for teams with strict data layer abstraction requirements or polyglot persistence needs.
**Warning signs:** Repositories with methods like `find()`, `create()`, `update()` that just call Eloquent methods directly. No custom query logic.

### Pitfall 2: N+1 Queries Not Caught Until Production
**What goes wrong:** Eager loading missing in controllers/services. 1 user = 1 query, 100 users = 101 queries.
**Why it happens:** Development uses small datasets where performance issues don't surface. No query monitoring in dev environment.
**How to avoid:** Install Telescope/Debugbar in development. Enable strict query logging. Use `Model::preventLazyLoading()` in AppServiceProvider (dev only).
**Warning signs:** API response times degrade with more data. Telescope shows duplicate queries with only ID changing.

**Detection code:**
```php
// Source: https://laravel.com/docs/12.x/eloquent-relationships#preventing-lazy-loading
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    if ($this->app->environment('local')) {
        Model::preventLazyLoading(); // Throws exception on lazy load
    }
}
```

### Pitfall 3: Database Cache in Production
**What goes wrong:** Cache stored in `cache` table. Every cache read = database query, defeating purpose of caching.
**Why it happens:** Default Laravel config uses `CACHE_STORE=database` for simplicity.
**How to avoid:** Switch to Redis for production caching. Use `CACHE_STORE=redis` in production .env.
**Warning signs:** High database query counts despite caching implementation. Cache operations show up in slow query logs.

**Current state:** `.env.example` shows `CACHE_STORE=database`. **Must migrate to Redis for Phase 7.**

### Pitfall 4: Missing Database Indexes on Foreign Keys and Status Fields
**What goes wrong:** Queries on `orders.status`, `products.category_id`, `order_items.product_id` perform full table scans.
**Why it happens:** Foreign key constraints don't automatically create indexes in all scenarios. Status/filter fields overlooked.
**How to avoid:** Audit queries with EXPLAIN. Index: foreign keys, status fields, frequently filtered columns, composite indexes for common WHERE clauses.
**Warning signs:** EXPLAIN shows `type: ALL` (full table scan). Queries slow down proportionally with table size.

**Current state:** `orders` table has indexes on `status,created_at` and `phone`. **Need to audit all tables.**

### Pitfall 5: Rate Limiting Not Applied to Authentication Routes
**What goes wrong:** Brute-force attacks on `/auth/login`, `/auth/register`, `/auth/forgot-password` succeed.
**Why it happens:** Developers protect authenticated routes but forget public auth endpoints.
**How to avoid:** Apply throttle middleware to auth routes: `throttle:5,1` (5 attempts per minute) for login/register.
**Warning signs:** Sudden spike in failed login attempts. Account enumeration attacks via password reset.

**Current state:** No rate limiting visible in `routes/api.php`. **Critical security gap.**

### Pitfall 6: CORS Allowing `allowed_headers: ['*']` and `allowed_origins` Mismatch
**What goes wrong:** CORS config allows all headers but specific origin. Attackers can exploit loose header policies.
**Why it happens:** Copy-paste from tutorials without understanding CORS security model.
**How to avoid:** Restrict allowed headers to only those needed: `['Content-Type', 'Authorization', 'X-Requested-With']`. Match origins to production domains.
**Warning signs:** CORS errors in legitimate frontend requests despite loose config. Security audit flags overly permissive CORS.

**Current state:** `config/cors.php` has `allowed_headers: ['*']`. **Should restrict to specific headers.**

### Pitfall 7: Sanctum Token Expiration Set to `null` (Never Expires)
**What goes wrong:** Stolen API tokens remain valid indefinitely. No automatic token rotation.
**Why it happens:** Default Sanctum config has `expiration: null` for SPA convenience.
**How to avoid:** Set reasonable expiration (e.g., 60 days for API tokens). Implement token refresh flow or require re-authentication periodically.
**Warning signs:** Tokens from months ago still work. No token cleanup cron job.

**Current state:** `config/sanctum.php` shows `expiration: null`. **Security concern for long-lived tokens.**

### Pitfall 8: File Upload Validation by Extension Instead of MIME Type
**What goes wrong:** Attacker uploads `malicious.php` renamed to `malicious.jpg`. Execution possible if webserver misconfigured.
**Why it happens:** Trusting client-provided file extension instead of server-verified MIME type.
**How to avoid:** Validate with `mimes:jpeg,png,webp` (checks MIME type). Store uploads outside webroot or with random names.
**Warning signs:** File uploads accepted based on extension only. Security scanners flag upload directory.

**Current state:** ProductRequest uses `image|mimes:jpeg,png,webp|max:5120`. **Good: validates MIME type.**

### Pitfall 9: Raw SQL Queries with User Input (SQL Injection Risk)
**What goes wrong:** `DB::raw("WHERE name = '{$input}'")` allows SQL injection if input not escaped.
**Why it happens:** Developer needs raw SQL for complex query, forgets parameterization.
**How to avoid:** Always use bindings: `DB::raw('WHERE name = ?', [$input])` or whereRaw with bindings. Never concatenate user input.
**Warning signs:** `DB::raw()` or `whereRaw()` calls with string interpolation. Security scanners flag potential injection points.

**Current state:** No obvious raw SQL in reviewed code, but **needs full audit of all DB::raw/whereRaw usage.**

### Pitfall 10: Returning Different Error Formats from Different Controllers
**What goes wrong:** One controller returns `{"error": "..."}`, another returns `{"message": "..."}`, breaking frontend error handling.
**Why it happens:** No centralized error handling. Each developer uses different format.
**How to avoid:** Implement RFC 7807 Problem Details or custom consistent format in `App\Exceptions\Handler`.
**Warning signs:** Frontend has multiple error parsing strategies. API documentation shows inconsistent error schemas.

**Current state:** No standardized error format visible. **Needs implementation.**

## Code Examples

Verified patterns from official sources:

### Rate Limiting API Routes
```php
// Source: https://laravel.com/docs/12.x/rate-limiting
// routes/api.php
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // 5 attempts per minute

Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:3,1'); // 3 attempts per minute

// Custom rate limiter in App\Providers\AppServiceProvider
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Apply to all API routes
Route::middleware(['throttle:api'])->group(function () {
    // API routes
});
```

### Preventing N+1 Queries in Development
```php
// Source: https://laravel.com/docs/12.x/eloquent-relationships#preventing-lazy-loading
// app/Providers/AppServiceProvider.php
namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Throw exception on lazy loading in development
        Model::preventLazyLoading(! $this->app->isProduction());

        // Prevent silent attribute access (non-fillable fields)
        Model::preventAccessingMissingAttributes(! $this->app->isProduction());
    }
}
```

### Database Indexing in Migrations
```php
// Source: https://laravel.com/docs/12.x/migrations#indexes
// database/migrations/xxxx_add_indexes_to_products_table.php
Schema::table('products', function (Blueprint $table) {
    // Single column index for filtering
    $table->index('is_active');
    $table->index('is_featured');

    // Composite index for common query: WHERE category_id = ? AND is_active = ?
    $table->index(['category_id', 'is_active']);

    // Composite index with sort: WHERE is_active = ? ORDER BY created_at DESC
    $table->index(['is_active', 'created_at']);
});

Schema::table('order_items', function (Blueprint $table) {
    // Foreign keys need indexes for JOIN performance
    $table->index('product_id');
    $table->index('variant_id');
});
```

### Redis Cache Configuration
```php
// Source: https://laravel.com/docs/12.x/cache
// .env
CACHE_STORE=redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

// Usage in Service classes
use Illuminate\Support\Facades\Cache;

class ProductService
{
    public function getFeaturedProducts(): Collection
    {
        return Cache::remember('featured_products', 3600, function () {
            return Product::with('media', 'category')
                ->where('is_featured', true)
                ->where('is_active', true)
                ->get();
        });
    }

    public function clearProductCache(): void
    {
        Cache::forget('featured_products');
        Cache::tags(['products'])->flush(); // Requires Redis
    }
}
```

### Sanctum Token Security and Revocation
```php
// Source: https://laravel.com/docs/12.x/sanctum
// config/sanctum.php
'expiration' => 60 * 24 * 60, // 60 days in minutes

// Creating token with abilities
$token = $user->createToken('api-token', ['order:create', 'product:read']);

// Revoking tokens on logout
public function logout(Request $request)
{
    // Revoke current token
    $request->user()->currentAccessToken()->delete();

    // Or revoke all tokens
    $request->user()->tokens()->delete();

    return response()->json(['message' => 'Logged out']);
}

// Scheduled cleanup of expired tokens
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('sanctum:prune-expired --hours=24')->daily();
}
```

### RFC 7807 Problem Details Error Response
```php
// Source: https://www.rfc-editor.org/rfc/rfc7807 and https://github.com/API-Skeletons/laravel-api-problem
// app/Exceptions/Handler.php
namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson()) {
            return $this->renderJsonException($request, $exception);
        }

        return parent::render($request, $exception);
    }

    private function renderJsonException($request, Throwable $exception)
    {
        $status = method_exists($exception, 'getStatusCode')
            ? $exception->getStatusCode()
            : 500;

        return response()->json([
            'type' => 'https://api.trotinette.com/problems/' . class_basename($exception),
            'title' => $this->getTitle($exception),
            'status' => $status,
            'detail' => $exception->getMessage(),
            'instance' => $request->fullUrl(),
            'timestamp' => now()->toIso8601String(),
        ], $status);
    }

    private function getTitle(Throwable $exception): string
    {
        return match ($exception::class) {
            ValidationException::class => 'Validation Failed',
            AuthenticationException::class => 'Authentication Required',
            AuthorizationException::class => 'Forbidden',
            ModelNotFoundException::class => 'Resource Not Found',
            default => 'Server Error',
        };
    }
}
```

### Input Validation Best Practices
```php
// Source: https://laravel.com/docs/12.x/validation
// app/Http/Requests/Admin/UpdateProductRequest.php
class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255|min:3',
            'price' => 'sometimes|integer|min:0|max:99999999', // Prevent integer overflow
            'description' => 'sometimes|string|max:5000',
            'category_id' => 'sometimes|exists:categories,id',
            'images.*' => 'image|mimes:jpeg,png,webp|max:5120', // 5MB max, MIME validation
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitize input before validation
        if ($this->has('name')) {
            $this->merge([
                'name' => strip_tags($this->input('name')),
            ]);
        }
    }
}
```

### Query Performance Optimization
```php
// Source: https://laravel.com/docs/12.x/eloquent-relationships#eager-loading
// BAD: N+1 query problem
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name; // Lazy loads user, N+1 queries
}

// GOOD: Eager loading
$orders = Order::with('user', 'items.product', 'items.variant')->get();
foreach ($orders as $order) {
    echo $order->user->name; // Already loaded, no additional queries
}

// BETTER: Selective column loading to reduce memory
$orders = Order::with([
    'user:id,name,email',
    'items.product:id,name,sku',
])->get();

// BEST: Paginate and cache
$orders = Cache::remember('recent_orders_page_1', 300, function () {
    return Order::with(['user:id,name', 'items.product:id,name'])
        ->latest()
        ->paginate(20);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lumen for APIs | Laravel with Octane (Swoole/RoadRunner) | 2023-2024 | Lumen deprecated; Octane provides same performance with full Laravel features |
| Manual DTO classes | PHP 8.2+ readonly properties | PHP 8.2 (Dec 2022) | Immutable DTOs without custom setters, IDE type checking |
| Custom rate limiting | Laravel RateLimiter facade | Laravel 8+ | Built-in Redis-backed throttling, dynamic limits |
| File/Database cache | Redis with cache tags | Current best practice | 100x faster, supports atomic operations, tag-based invalidation |
| PHPStan | Larastan (PHPStan for Laravel) | Ongoing | Laravel-specific static analysis rules, Eloquent magic method detection |
| Manual error responses | RFC 7807 Problem Details | RFC published 2016, adoption growing | Industry standard, predictable for API consumers |
| Prevent lazy loading (Laravel 8.43+) | Model::preventLazyLoading() | Laravel 8.43 (2021) | Catches N+1 in development before production |
| Repository pattern overuse | Service + Action pattern | Modern Laravel architecture | Less boilerplate, Eloquent-friendly, testable |
| BCRYPT_ROUNDS=10 | BCRYPT_ROUNDS=12 | Security hardening 2020+ | Slower but more resistant to brute force (current .env already uses 12) |

**Deprecated/outdated:**
- **Lumen:** No longer maintained. Use Laravel with Octane for high-performance APIs.
- **Repository pattern as default:** Community consensus shifted to Service + Action pattern for typical Laravel apps. Repositories add unnecessary abstraction unless specific need (polyglot persistence, strict DDD).
- **File-based caching in production:** Too slow. Redis is standard for production caching and sessions.
- **Manual token blacklisting:** Sanctum provides server-side token state with immediate revocation.

## Open Questions

### 1. Should we implement full Repository pattern or stick with Service + Action?
- **What we know:** Current code uses Services (ProductService, OrderService) that interact directly with Eloquent. Works well.
- **What's unclear:** Whether team/project scale justifies Repository abstraction layer.
- **Recommendation:** Stick with Service + Action pattern. Refactor OrderService to use Actions for complex logic. Only introduce Repositories if future requirements demand strict data layer abstraction (e.g., switching from MySQL to MongoDB for specific models).

### 2. Redis vs Database Cache — Migration Impact?
- **What we know:** Current `.env.example` uses `CACHE_STORE=database`. Redis provides 100x performance improvement.
- **What's unclear:** Production environment Redis availability, infrastructure setup required.
- **Recommendation:** Verify Redis is available in production environment. If yes, migrate cache and queues to Redis. If no, provision Redis as part of Phase 7 (Docker Compose for local, cloud Redis for production).

### 3. How strict should Larastan level be?
- **What we know:** Larastan levels range from 0 (lenient) to 9 (strictest). Higher levels catch more bugs but require more type hints.
- **What's unclear:** Team's tolerance for strict type checking and refactoring effort required.
- **Recommendation:** Start with level 5 (balanced strictness), address errors, incrementally increase to level 6-7 over time. Level 9 is overkill for most projects.

### 4. DTO Introduction — Where and When?
- **What we know:** DTOs provide type safety and immutability. PHP 8.2+ readonly properties make implementation clean.
- **What's unclear:** Which Services/Actions benefit most from DTOs vs. continuing with FormRequest validated arrays.
- **Recommendation:** Introduce DTOs for complex operations with 5+ parameters: OrderService::createOrder (CreateOrderDTO), ProductService methods with many fields. Don't create DTOs for simple 1-3 parameter methods.

### 5. Error Code System — RFC 7807 Package vs Manual Implementation?
- **What we know:** RFC 7807 provides standardized JSON error format. Packages available (API-Skeletons/laravel-api-problem).
- **What's unclear:** Package maintenance status, customization flexibility vs. manual implementation in Handler.
- **Recommendation:** Implement manually in `App\Exceptions\Handler` first (full control, no dependency). Can switch to package later if needed. Provide error code enum for structured codes (e.g., `ORD_001` for order errors).

### 6. Database Indexing — Which tables/columns need audit?
- **What we know:** `orders` table has some indexes. 30+ migrations indicate multiple tables.
- **What's unclear:** Full list of missing indexes causing slow queries.
- **Recommendation:** Install Telescope, run performance profiling on all endpoints, use EXPLAIN on slow queries, create migration with missing indexes. Priority: foreign keys (order_items.product_id), status fields, frequently filtered columns.

## Sources

### Primary (HIGH confidence)

**Laravel Official Documentation:**
- [Laravel 12 Rate Limiting](https://laravel.com/docs/12.x/rate-limiting) - Official rate limiting guide
- [Laravel 12 CSRF Protection](https://laravel.com/docs/12.x/csrf) - CSRF middleware and best practices
- [Laravel 12 Sanctum](https://laravel.com/docs/12.x/sanctum) - API authentication and token security
- [Laravel 12 Telescope](https://laravel.com/docs/12.x/telescope) - Debug assistant for query monitoring
- [Laravel 12 Eloquent](https://laravel.com/docs/12.x/eloquent) - Preventing lazy loading, query optimization
- [Laravel 12 Cache](https://laravel.com/docs/12.x/cache) - Redis caching strategies
- [Laravel 12 Migrations](https://laravel.com/docs/12.x/migrations) - Database indexing

**RFC Specifications:**
- [RFC 7807: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc7807) - Error response standard

**Official GitHub Repositories:**
- [laravel/telescope](https://github.com/laravel/telescope) - Debug assistant
- [larastan/larastan](https://github.com/larastan/larastan) - Static analysis for Laravel
- [API-Skeletons/laravel-api-problem](https://github.com/API-Skeletons/laravel-api-problem) - RFC 7807 implementation

### Secondary (MEDIUM confidence)

**Architecture Patterns:**
- [Understanding the Action Pattern in Laravel (Medium)](https://medium.com/@harryespant/understanding-the-action-pattern-in-laravel-a-cleaner-way-to-organize-your-code-3c7f04666c23) - Action pattern guide
- [Structuring Laravel with Repository Pattern and Services (DEV)](https://dev.to/blamsa0mine/structuring-a-laravel-project-with-repository-pattern-and-services-11pm) - Architecture comparison
- [Laravel 12: Services, Repositories, Interfaces & Policies (Medium)](https://tugrul-yildirim.medium.com/implementing-service-repository-interface-and-policy-patterns-in-laravel-5a2fdd9005d3) - Pattern implementation
- [Service Pattern in Laravel: Why it is meaningless](https://nabilhassen.com/laravel-service-pattern-issues) - Critical perspective on patterns

**Security Best Practices:**
- [15 Laravel Security Best Practices in 2025 (DEV)](https://dev.to/sharifcse58/15-laravel-security-best-practices-in-2025-2lco) - Comprehensive security guide
- [7 Laravel Security Best Practices Developers Should Follow In 2026](https://wpwebinfotech.com/blog/laravel-security-best-practices/) - Updated security practices
- [Laravel SQL Injection Guide (Escape)](https://escape.tech/blog/laravel-sql-injection-guide/) - SQL injection prevention
- [Laravel SQL Injection Prevention (StackHawk)](https://www.stackhawk.com/blog/sql-injection-prevention-laravel/) - Security patterns
- [How to Implement Authentication with Laravel Sanctum (OneUpTime, 2026-01-26)](https://oneuptime.com/blog/post/2026-01-26-laravel-sanctum-authentication/view) - Sanctum security guide

**Performance Optimization:**
- [Laravel 12 Eloquent Power-Up: Query Optimization Playbook (Medium)](https://medium.com/@s.h.siddiqui5830/mastering-eloquent-the-ultimate-guide-to-optimizing-queries-in-laravel-12-ce3200fe87ac) - Query optimization
- [Database Optimization Techniques for Laravel 12 (NeedLaravelSite)](https://needlaravelsite.com/blog/database-optimization-techniques-for-laravel-12-applications) - Database tuning
- [Database Indexing in Laravel (Hafiz.dev)](https://hafiz.dev/blog/database-indexing-in-laravel-boost-mysql-performance-with-smart-indexes) - Indexing strategies
- [How I Optimized a Laravel API 287x Faster (DEV)](https://dev.to/abstractmusa/how-i-optimized-a-laravel-api-287x-faster-from-27s-to-under-100ms-4cd7) - Real-world optimization case study
- [Advanced Laravel Caching Techniques with Redis (Medium)](https://medium.com/@zulfikarditya/advanced-laravel-caching-techniques-with-redis-299ab43e09dd) - Redis caching patterns

**DTOs and Code Quality:**
- [Data Transfer Objects in Laravel: A Complete Guide (Medium)](https://medium.com/@zulfikarditya/data-transfer-objects-in-laravel-a-complete-guide-f80de8ee06e6) - DTO implementation
- [Using Data Transfer Objects (DTO) in Laravel (DEV)](https://dev.to/blamsa0mine/using-data-transfer-objects-dto-in-laravel-for-a-clean-and-scalable-architecture-172o) - DTO best practices
- [Using Static Analysis in Laravel: PHPStan Guide (Labrodev)](https://labrodev.substack.com/p/using-static-analysis-in-laravel) - Static analysis setup
- [Supercharge Your Laravel Codebase with PHPStan (Medium)](https://sandeeppant.medium.com/supercharge-your-laravel-codebase-with-phpstan-a-guide-to-static-analysis-90b7021ae2e6) - PHPStan best practices

**Error Handling:**
- [Laravel API Errors and Exceptions (Laravel Daily)](https://laraveldaily.com/post/laravel-api-errors-and-exceptions-how-to-return-responses) - Error response patterns
- [Global Exception Handling in Laravel 12 (Medium)](https://medium.com/@habibur.rahman.0927/global-exception-handling-and-api-response-setup-in-laravel-11-bc014b7b8880) - Exception handler setup
- [APIs, we have a Problem JSON (Glaforge)](https://glaforge.dev/posts/2022/11/14/apis-we-have-a-problem-json/) - RFC 7807 overview

### Tertiary (LOW confidence - use for context only)

**Community Discussions:**
- [What's Your Opinion on Service + Repository Pattern? (Laracasts)](https://laracasts.com/discuss/channels/laravel/whats-your-opinion-on-the-service-repository-pattern) - Community perspectives on patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on official Laravel 12 docs, current codebase analysis, established packages
- Architecture patterns: MEDIUM-HIGH - Service/Action pattern well-documented, DTO usage emerging best practice (PHP 8.2+), Repository pattern controversial
- Security hardening: HIGH - Official Laravel docs + 2025-2026 security guides, RFC standards
- Performance optimization: HIGH - Official docs + verified real-world case studies with metrics
- Error code system: MEDIUM - RFC 7807 is standard, but Laravel package ecosystem less mature than custom implementation
- Pitfalls: HIGH - Based on official Laravel warnings, common production issues documented across multiple sources

**Research date:** 2026-03-01
**Valid until:** 2026-06-01 (90 days - Laravel 12 is current LTS, patterns stable, security practices evolve slowly)

**Notes:**
- Security practices require ongoing monitoring (CVEs, package updates) — revisit before production deployment
- Performance benchmarks are environment-dependent — validate with production-like data volumes
- Architecture patterns are team-preference dependent — Service+Action recommended but not mandated
- Redis availability in production environment needs verification before cache migration planning
