---
phase: 01-foundation
plan: 01
subsystem: api
tags: [laravel, sanctum, spatie-permission, mysql, cors, i18n, migrations]

# Dependency graph
requires: []
provides:
  - Laravel 12 API at http://localhost:8000 with Sanctum bearer token auth
  - RBAC with spatie/laravel-permission v6 (admin/customer roles, guard_name=sanctum)
  - Translation-ready DB schema (product_translations with unique(product_id, locale))
  - SetLocale middleware on all API routes (Accept-Language: fr/ar/en)
  - AuthService/AuthController Service pattern established
  - Core migrations: users, categories, products, product_translations, delivery_zones
affects:
  - 01-02 (frontend connects to this API)
  - 01-03 (admin backend builds on this auth/RBAC foundation)
  - All subsequent backend phases

# Tech tracking
tech-stack:
  added:
    - laravel/laravel 12.x (via composer create-project)
    - laravel/sanctum 4.3 (bearer token auth)
    - spatie/laravel-permission 6.x (RBAC)
    - laravel/pint 1.27 (code style)
    - MySQL 8.4 (database)
    - PHP 8.3.30 (via winget)
    - Composer 2.9.5
  patterns:
    - Service class pattern: Controller delegates all business logic to Service class
    - Translation table pattern: product_translations with unique(product_id, locale) constraint
    - Bearer token auth: Sanctum tokens, guard_name=sanctum, no cookie mode
    - User.$guard_name=sanctum for Spatie role resolution with Sanctum bearer tokens

key-files:
  created:
    - trotinette-api/app/Services/AuthService.php
    - trotinette-api/app/Http/Controllers/Customer/AuthController.php
    - trotinette-api/app/Http/Resources/UserResource.php
    - trotinette-api/app/Http/Requests/Auth/LoginRequest.php
    - trotinette-api/app/Http/Requests/Auth/RegisterRequest.php
    - trotinette-api/app/Http/Middleware/SetLocale.php
    - trotinette-api/database/seeders/RoleSeeder.php
    - trotinette-api/database/migrations/2026_02_13_000001_create_categories_table.php
    - trotinette-api/database/migrations/2026_02_13_000002_create_products_table.php
    - trotinette-api/database/migrations/2026_02_13_000003_create_product_translations_table.php
    - trotinette-api/database/migrations/2026_02_13_000004_create_delivery_zones_table.php
    - trotinette-api/config/sanctum.php
    - trotinette-api/config/cors.php
  modified:
    - trotinette-api/app/Models/User.php (added HasApiTokens, HasRoles, guard_name, phone)
    - trotinette-api/bootstrap/app.php (SetLocale middleware, role aliases)
    - trotinette-api/routes/api.php (ping, auth routes, sanctum-protected /user)
    - trotinette-api/.env (MySQL, FR locale, Sanctum stateful domains)
    - trotinette-api/database/migrations/0001_01_01_000000_create_users_table.php (phone column)
    - trotinette-api/database/seeders/DatabaseSeeder.php (calls RoleSeeder)

key-decisions:
  - "guard_name=sanctum for roles + User.$guard_name=sanctum required for Spatie to resolve roles correctly in bearer token auth (not web guard)"
  - "Sanctum must be installed via composer require, not php artisan install:api (which failed silently in non-interactive mode)"
  - "PHP 8.3 installed via winget (no admin rights), MySQL 8.4 run standalone (no service), Composer installed manually"
  - "SetLocale middleware appended to api group in bootstrap/app.php (Laravel 12 middleware pattern)"
  - "Price stored as unsigned bigint in centimes (e.g., 249900 = 2499.00 MAD) — no floating point"

patterns-established:
  - "Service pattern: AuthController has zero business logic — all delegated to AuthService"
  - "Translation table pattern: product_translations(product_id, locale, name, description, slug) with unique(product_id, locale)"
  - "Bearer token auth: Sanctum token guard, no cookie/SPA mode, guard_name=sanctum"
  - "SetLocale middleware: getPreferredLanguage(['fr','ar','en']) from Accept-Language header"

# Metrics
duration: 24min
completed: 2026-02-14
---

# Phase 1 Plan 01: Laravel API Foundation Summary

**Laravel 12 API with Sanctum bearer token auth, spatie/laravel-permission RBAC, translation-ready DB schema, and SetLocale i18n middleware — all verified via curl tests**

## Performance

- **Duration:** 24 min
- **Started:** 2026-02-14T19:47:49Z
- **Completed:** 2026-02-14T20:12:21Z
- **Tasks:** 2
- **Files modified:** 22+

## Accomplishments
- Complete Laravel 12 API scaffold with Sanctum bearer token authentication working end-to-end
- RBAC with spatie/laravel-permission v6 — admin and customer roles seeded with guard_name=sanctum
- Translation-ready schema: product_translations table with unique(product_id, locale) constraint established as pattern for all future translated content
- SetLocale middleware on all API routes — verified Accept-Language: ar returns locale=ar in /api/ping
- AuthController/AuthService service pattern established as the architectural baseline for all future controllers

## Task Commits

Each task was committed atomically:

1. **Task 1: Laravel scaffold, Sanctum, RBAC, CORS, SetLocale** - `9269112` (feat)
2. **Task 2: Migrations, AuthService pattern, API routes, verified endpoints** - `7231c44` (feat)

## Files Created/Modified
- `trotinette-api/app/Services/AuthService.php` - Register/login/logout business logic (Service pattern baseline)
- `trotinette-api/app/Http/Controllers/Customer/AuthController.php` - Thin HTTP controller delegating to AuthService
- `trotinette-api/app/Http/Resources/UserResource.php` - User JSON serialization with role field
- `trotinette-api/app/Http/Requests/Auth/LoginRequest.php` - Validated login form request
- `trotinette-api/app/Http/Requests/Auth/RegisterRequest.php` - Validated register form request with password confirmation
- `trotinette-api/app/Http/Middleware/SetLocale.php` - Accept-Language header processing
- `trotinette-api/app/Models/User.php` - HasApiTokens, HasRoles traits, phone field, guard_name=sanctum
- `trotinette-api/bootstrap/app.php` - SetLocale registered in api group, Spatie middleware aliases
- `trotinette-api/routes/api.php` - /ping, /auth/register, /auth/login, /user, /auth/logout
- `trotinette-api/config/cors.php` - Restricted to http://localhost:5173
- `trotinette-api/config/sanctum.php` - Sanctum configuration
- `trotinette-api/database/migrations/2026_02_13_000001_create_categories_table.php`
- `trotinette-api/database/migrations/2026_02_13_000002_create_products_table.php`
- `trotinette-api/database/migrations/2026_02_13_000003_create_product_translations_table.php`
- `trotinette-api/database/migrations/2026_02_13_000004_create_delivery_zones_table.php`
- `trotinette-api/database/seeders/RoleSeeder.php` - admin and customer roles with guard_name=sanctum

## Decisions Made
- **guard_name=sanctum for roles**: Plan requires sanctum guard for bearer token auth. Fixed by setting `protected string $guard_name = 'sanctum'` on User model so Spatie resolves roles against the sanctum guard (not web).
- **Sanctum via composer require**: `php artisan install:api` runs non-interactively and silently failed to add Sanctum to composer.json. Installed Sanctum directly via `composer require laravel/sanctum`.
- **PHP/MySQL via winget**: No PHP, Composer, or MySQL were installed on the machine. Installed PHP 8.3 and MySQL 8.4 via winget, ran MySQL standalone (without Windows service due to admin rights restriction), installed Composer manually.
- **prices in centimes**: Product price stored as `unsignedBigInteger` in centimes — avoids floating point issues (e.g., 249900 = 2499.00 MAD).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] PHP, Composer, MySQL not installed on machine**
- **Found during:** Task 1 setup
- **Issue:** PHP, Composer, and MySQL were not installed. Chocolatey installation failed (no admin rights). Docker Desktop was not running.
- **Fix:** Installed PHP 8.3.30 via winget, configured php.ini with required extensions (pdo_mysql, openssl, mbstring, curl, etc.), installed Composer 2.9.5 manually via installer, installed MySQL 8.4 via winget, initialized MySQL data directory and ran mysqld standalone.
- **Files modified:** PHP system installation, php.ini
- **Verification:** `php --version` returned PHP 8.3.30; `mysql -u root` connected; `composer --version` returned Composer 2.9.5
- **Committed in:** `9269112` (part of Task 1)

**2. [Rule 3 - Blocking] `php artisan install:api` failed to install Sanctum**
- **Found during:** Task 2 verification
- **Issue:** `install:api` ran non-interactively and only updated lock files. Sanctum was never added to composer.json. Error: "Auth guard [sanctum] is not defined" when hitting /api/user.
- **Fix:** Installed Sanctum via `composer require laravel/sanctum`, published Sanctum config and personal_access_tokens migration.
- **Files modified:** `composer.json`, `composer.lock`, `config/sanctum.php`, `database/migrations/2026_02_14_200934_create_personal_access_tokens_table.php`
- **Verification:** Personal access tokens table created, /api/user returned {"message":"Unauthenticated."} correctly
- **Committed in:** `7231c44` (part of Task 2)

**3. [Rule 1 - Bug] Spatie role assignment failed due to guard mismatch**
- **Found during:** Task 2 verification
- **Issue:** Register endpoint returned "There is no role named `customer` for guard `web`". RoleSeeder created roles with `guard_name=sanctum` but User model defaulted to `web` guard for Spatie.
- **Fix:** Added `protected string $guard_name = 'sanctum'` to User model so Spatie's HasRoles resolves roles against the sanctum guard.
- **Files modified:** `app/Models/User.php`
- **Verification:** POST /api/auth/register successfully assigned customer role and returned `{"role":"customer"}`
- **Committed in:** `7231c44` (part of Task 2)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All fixes essential for correct operation. Missing PHP/MySQL/Sanctum were environment gaps. Guard mismatch was an integration subtlety between Sanctum and Spatie. No scope creep.

## Issues Encountered
- PHP extensions were disabled by default in winget PHP install — required manual php.ini configuration with extension_dir and individual extension=XXX lines
- MySQL required manual standalone initialization (`mysqld --initialize-insecure --datadir=...`) since Windows service registration requires admin rights

## User Setup Required
None — no external service configuration required. All setup is local.

**Note for other developers:** PHP 8.3, Composer, and MySQL 8.4 must be installed locally. Run `php artisan migrate:fresh --seed` and `php artisan serve --port=8000`. MySQL must be running on port 3306 with empty root password and `trotinette` database created.

## Next Phase Readiness
- Laravel API fully operational at http://localhost:8000
- Sanctum bearer token auth verified working end-to-end
- Service class pattern established — all future controllers follow this pattern
- Translation-ready schema pattern established via product_translations
- Ready for Plan 02 (frontend scaffold) and Plan 03 (admin backend features)
- Blocker: MySQL must be running (mysqld process) before API can serve requests

---
*Phase: 01-foundation*
*Completed: 2026-02-14*

## Self-Check: PASSED

All files verified present:
- FOUND: `trotinette-api/app/Services/AuthService.php`
- FOUND: `trotinette-api/app/Http/Controllers/Customer/AuthController.php`
- FOUND: `trotinette-api/app/Http/Middleware/SetLocale.php`
- FOUND: `trotinette-api/database/migrations/2026_02_13_000003_create_product_translations_table.php`
- FOUND: `trotinette-api/routes/api.php`
- FOUND: `.planning/phases/01-foundation/01-01-SUMMARY.md`

All commits verified present:
- FOUND: `9269112` feat(01-01): scaffold Laravel 12 API with Sanctum, RBAC, CORS, and SetLocale middleware
- FOUND: `7231c44` feat(01-01): add migrations, AuthService pattern, and verified API endpoints
