---
phase: 04-cart-checkout-orders
plan: 01
subsystem: api
tags: [laravel, delivery-zones, crud, sanctum, form-requests, api-resources]

# Dependency graph
requires:
  - phase: 02-product-catalog
    provides: DeliveryZone model and migration (DLVR-02 seeder with Moroccan cities)

provides:
  - Public GET /api/delivery-zones endpoint returning active zones ordered by city with fees in centimes
  - Admin CRUD for delivery zones (GET/POST/GET/{id}/PUT/{id}/PATCH/{id}/DELETE/{id})
  - DeliveryZoneResource for consistent JSON serialization across customer and admin contexts

affects:
  - 04-03 (checkout flow reads GET /api/delivery-zones for city selection dropdown)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - FormRequest with Rule::unique()->ignore() for PATCH-semantics update validation
    - Separate Customer and Admin controllers aliased in routes/api.php to avoid class name collision
    - paginate(50) on admin index, get() on public customer index (customer gets all active, admin sees all)

key-files:
  created:
    - trotinette-api/app/Http/Resources/DeliveryZoneResource.php
    - trotinette-api/app/Http/Requests/Admin/StoreDeliveryZoneRequest.php
    - trotinette-api/app/Http/Requests/Admin/UpdateDeliveryZoneRequest.php
    - trotinette-api/app/Http/Controllers/Customer/DeliveryZoneController.php
    - trotinette-api/app/Http/Controllers/Admin/DeliveryZoneController.php
  modified:
    - trotinette-api/routes/api.php

key-decisions:
  - "Admin DeliveryZoneController aliased as AdminDeliveryZoneController in routes/api.php — avoids PHP class name collision with Customer\\DeliveryZoneController"
  - "Admin index() uses paginate(50) — admin sees all zones (including inactive) paginated; customer index uses get() — only active zones, no pagination needed"
  - "destroy() lets DB FK constraint bubble as 500 for now — orders table not yet created in Phase 4, constraint enforcement deferred to 04-02"
  - "DeliveryZone fee stored and returned as integer centimes — consistent with product pricing contract"

patterns-established:
  - "Customer/Admin controller split: Customer returns filtered active-only data, Admin returns full dataset with pagination"
  - "Admin form requests use authorize(): return true — admin middleware (role:admin) handles authentication upstream"

# Metrics
duration: 1min
completed: 2026-02-18
---

# Phase 4 Plan 01: Delivery Zones Backend Summary

**Laravel delivery zone API with public customer endpoint and full admin CRUD — 7 routes, DeliveryZoneResource serialization, fee in centimes for Moroccan city checkout selection**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-18T20:06:35Z
- **Completed:** 2026-02-18T20:07:40Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- DeliveryZoneResource serializing id, city, city_ar, fee (centimes), is_active, timestamps
- Public GET /api/delivery-zones returns active zones alphabetically ordered by city (for DLVR-03 checkout)
- Admin CRUD with StoreDeliveryZoneRequest (city uniqueness) and UpdateDeliveryZoneRequest (Rule::unique()->ignore() for PATCH semantics)
- All 7 routes registered and verified via `php artisan route:list --path=delivery`

## Task Commits

Each task was committed atomically:

1. **Task 1: DeliveryZone resource, form requests, and customer endpoint** - `8b5920f` (feat)
2. **Task 2: Admin CRUD controller and route registration** - `bba368a` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `trotinette-api/app/Http/Resources/DeliveryZoneResource.php` - Serializes all DeliveryZone fields (id, city, city_ar, fee, is_active, timestamps)
- `trotinette-api/app/Http/Requests/Admin/StoreDeliveryZoneRequest.php` - Validates city uniqueness, fee as integer min:0
- `trotinette-api/app/Http/Requests/Admin/UpdateDeliveryZoneRequest.php` - PATCH semantics with Rule::unique()->ignore() for city
- `trotinette-api/app/Http/Controllers/Customer/DeliveryZoneController.php` - Public index: active zones ordered by city
- `trotinette-api/app/Http/Controllers/Admin/DeliveryZoneController.php` - Admin CRUD: index (paginated), store (201), show, update, destroy (204)
- `trotinette-api/routes/api.php` - Added 7 delivery zone routes (1 public + 6 admin in role:admin group)

## Decisions Made

- Admin DeliveryZoneController aliased as `AdminDeliveryZoneController` in routes/api.php to avoid PHP class name collision with `Customer\DeliveryZoneController`
- Admin `index()` uses `paginate(50)` — admin sees all zones including inactive; customer `index()` uses `get()` — only active zones, no pagination needed since list is small
- `destroy()` lets DB FK constraint surface as 500 for now — orders table doesn't exist yet in Phase 4; constraint enforcement deferred to when orders are added in 04-02

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- MySQL not running during verification — seeder could not execute. Route list verification (`php artisan route:list`) confirmed all 7 routes are correctly registered without needing DB. Database connectivity is a known pre-requisite (see STATE.md Blockers/Concerns).

## User Setup Required

None - no external service configuration required. MySQL must be running for live API testing (see existing STATE.md blocker note).

## Next Phase Readiness

- GET /api/delivery-zones is ready for 04-03 checkout flow to consume
- Admin CRUD is ready for frontend 04-04 admin delivery zone management
- DeliveryZoneSeeder data accessible once MySQL is started with `"C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqld.exe" --datadir="C:/Users/User/mysql-data" --console &`
- No blockers for next plans in Phase 4

---
*Phase: 04-cart-checkout-orders*
*Completed: 2026-02-18*

## Self-Check: PASSED

- FOUND: trotinette-api/app/Http/Resources/DeliveryZoneResource.php
- FOUND: trotinette-api/app/Http/Requests/Admin/StoreDeliveryZoneRequest.php
- FOUND: trotinette-api/app/Http/Requests/Admin/UpdateDeliveryZoneRequest.php
- FOUND: trotinette-api/app/Http/Controllers/Customer/DeliveryZoneController.php
- FOUND: trotinette-api/app/Http/Controllers/Admin/DeliveryZoneController.php
- FOUND: .planning/phases/04-cart-checkout-orders/04-01-SUMMARY.md
- COMMIT 8b5920f: verified in git log
- COMMIT bba368a: verified in git log
- ROUTES: 7 routes showing (php artisan route:list --path=delivery)
