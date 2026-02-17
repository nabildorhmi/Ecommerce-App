---
phase: 03-user-accounts
plan: 01
subsystem: auth
tags: [sanctum, spatie-permissions, laravel, php, api, user-management]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Sanctum auth, Spatie roles, User model, AuthService, routes/api.php
  - phase: 02-product-catalog
    provides: Admin controller pattern (ProductController)
provides:
  - is_active, address_city, address_street columns on users table
  - PUT /user — authenticated profile update with address fields
  - GET /admin/users — paginated user list with roles
  - GET /admin/users/{user} — user detail with order_history placeholder
  - PATCH /admin/users/{user}/deactivate — customer deactivation (admin-protected)
  - Login blocked for deactivated users (is_active check in AuthService)
  - RegisterRequest enforces phone as required
affects: [03-02-user-accounts-frontend, 04-orders-checkout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PATCH semantics on UpdateProfileRequest (all fields use 'sometimes')
    - Admin controller pattern: UserController mirrors ProductController structure
    - DB refresh after model create to surface DB column defaults

key-files:
  created:
    - trotinette-api/database/migrations/2026_02_16_000001_add_account_fields_to_users_table.php
    - trotinette-api/app/Http/Requests/Auth/UpdateProfileRequest.php
    - trotinette-api/app/Http/Controllers/Admin/UserController.php
  modified:
    - trotinette-api/app/Models/User.php
    - trotinette-api/app/Http/Requests/Auth/RegisterRequest.php
    - trotinette-api/app/Http/Resources/UserResource.php
    - trotinette-api/app/Services/AuthService.php
    - trotinette-api/app/Http/Controllers/Customer/AuthController.php
    - trotinette-api/routes/api.php

key-decisions:
  - "Phone required at registration (was nullable) — enforces AUTH-01 from research"
  - "Deactivation check placed before password check in AuthService::login() — avoids timing attack leaking valid emails"
  - "Admin deactivate endpoint rejects admin role users with 422 — prevents admin lockout"
  - "order_history returned as empty array in admin show endpoint — Phase 4 will fill this in"
  - "UpdateProfileRequest uses Rule::unique()->ignore() for email — allows user to submit same email without validation error"
  - "$user->refresh() after User::create() — surfaces DB column defaults (is_active=true) immediately on registration response"

patterns-established:
  - "Admin user routes under /admin/users prefix inside role:admin middleware"
  - "Profile update via PUT /user (not PATCH /user/me) — consistent with existing GET /user pattern"

# Metrics
duration: 5min
completed: 2026-02-17
---

# Phase 3 Plan 01: Auth Backend — User Account Fields and Management API

**Sanctum auth backend extended with user account fields (is_active, address, phone), profile update endpoint, admin user CRUD, and login deactivation guard.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-17T20:02:36Z
- **Completed:** 2026-02-17T20:07:09Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Users table extended with is_active (default true), address_city, address_street via migration
- Sanctum-protected PUT /user endpoint for profile updates with PATCH semantics
- Admin user management API: list (paginated), detail (with order_history placeholder), deactivate
- Login blocked for deactivated users with AuthenticationException before token is issued
- RegisterRequest now enforces phone as required (was nullable)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migration, model update, and request fixes** - `d477cbd` (feat)
2. **Task 2: Profile update, admin user controller, deactivation check, routes** - `d915508` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `trotinette-api/database/migrations/2026_02_16_000001_add_account_fields_to_users_table.php` - Adds is_active, address_city, address_street to users table
- `trotinette-api/app/Models/User.php` - Added new fields to fillable, is_active cast to boolean
- `trotinette-api/app/Http/Requests/Auth/RegisterRequest.php` - phone changed from nullable to required
- `trotinette-api/app/Http/Resources/UserResource.php` - Added is_active, address_city, address_street to output
- `trotinette-api/app/Http/Requests/Auth/UpdateProfileRequest.php` - New: PATCH semantics, email uniqueness ignore
- `trotinette-api/app/Services/AuthService.php` - Added is_active check in login(), refresh() after register
- `trotinette-api/app/Http/Controllers/Customer/AuthController.php` - Added updateProfile method
- `trotinette-api/app/Http/Controllers/Admin/UserController.php` - New: index, show, deactivate
- `trotinette-api/routes/api.php` - Added PUT /user, GET/PATCH admin user routes

## Decisions Made

- **Phone required at registration:** RegisterRequest phone changed from `nullable` to `required` — enforces AUTH-01 (phone mandatory for order tracking and COD follow-up)
- **Deactivation check before password check:** Avoids a timing-based email enumeration attack where a valid email would get past the deactivation gate before password fails
- **Admin cannot deactivate admin:** Returns 422 with `Cannot deactivate admin.` — prevents accidental admin lockout
- **order_history as empty array:** Phase 4 (orders) will inject real order history into this endpoint; placeholder keeps the API shape stable
- **$user->refresh() after create:** Laravel does not automatically populate DB column defaults on the in-memory model after `create()` — refresh() re-reads the row so `is_active=true` is returned to the caller
- **UpdateProfileRequest uses Rule::unique()->ignore():** Allows users to submit their existing email without a uniqueness error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed is_active returning null on registration response**
- **Found during:** Task 2 (verification — registration response)
- **Issue:** New users returned `is_active: null` because `User::create()` doesn't populate DB column defaults on the in-memory model instance. The DB had `is_active=true` correctly, but the API response reflected the null model state.
- **Fix:** Added `$user->refresh()` in `AuthService::register()` after role assignment, before token creation. Forces re-read from DB.
- **Files modified:** `trotinette-api/app/Services/AuthService.php`
- **Verification:** Registration response now shows `is_active: true` for new users
- **Committed in:** `d915508` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix was required for correctness — API contract for `is_active` must reflect true DB state. No scope creep.

## Issues Encountered

- MySQL was not running at start — started manually per established project convention: `"C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqld.exe" --datadir="C:/Users/User/mysql-data" --console &`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All auth API endpoints ready for Phase 3 Plan 02 (frontend: registration form, login, profile page, admin user list)
- Admin user management API fully functional and tested
- Deactivated user login guard active and verified

---
*Phase: 03-user-accounts*
*Completed: 2026-02-17*

## Self-Check: PASSED

- All 9 source files present and verified
- All 2 task commits found: d477cbd, d915508
- Migration ran successfully (is_active, address_city, address_street in users table)
- All 8 verification scenarios passed via curl testing
