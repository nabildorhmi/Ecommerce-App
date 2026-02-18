---
phase: 04-cart-checkout-orders
plan: 02
subsystem: api
tags: [laravel, eloquent, state-machine, pessimistic-locking, order-management]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Laravel + Sanctum API, Spatie permissions, MySQL database
  - phase: 02-product-catalog
    provides: Product model with price/stock_quantity, DeliveryZone model with fee
  - phase: 04-cart-checkout-orders/04-01
    provides: DeliveryZone CRUD routes, DeliveryZoneResource

provides:
  - OrderStatus backed string enum with state machine (allowedTransitionsTo, canTransitionTo, trilingual labels)
  - Three migrations: orders, order_items, order_status_logs tables
  - Order, OrderItem, OrderStatusLog Eloquent models with relations and casts
  - OrderService.createOrder() — atomic with lockForUpdate, duplicate detection, server-side pricing, stock decrement
  - OrderService.transitionStatus() — state machine enforcement with audit logging
  - StoreOrderRequest, TransitionOrderRequest, AddOrderNoteRequest form validation
  - OrderResource, OrderItemResource, OrderStatusLogResource API serialization
  - Customer order routes: POST/GET /api/orders, GET /api/orders/{order}
  - Admin order routes: GET/index, GET/show, PATCH/status, POST/note under /api/admin/orders

affects: [04-03-customer-frontend, 04-04-admin-frontend]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pessimistic locking with lockForUpdate for stock decrement and order creation
    - State machine via PHP 8.1 enum with allowedTransitionsTo + canTransitionTo guard
    - Server-side pricing — request body accepts zero price fields, prices come from locked DB rows
    - Audit log pattern — every status change creates an OrderStatusLog entry with actor
    - Thin controllers — all business logic in OrderService, controllers are wrappers
    - allowed_transitions field in OrderResource — frontend knows which buttons to show without hardcoding

key-files:
  created:
    - trotinette-api/app/Enums/OrderStatus.php
    - trotinette-api/database/migrations/2026_02_18_000001_create_orders_table.php
    - trotinette-api/database/migrations/2026_02_18_000002_create_order_items_table.php
    - trotinette-api/database/migrations/2026_02_18_000003_create_order_status_logs_table.php
    - trotinette-api/app/Models/Order.php
    - trotinette-api/app/Models/OrderItem.php
    - trotinette-api/app/Models/OrderStatusLog.php
    - trotinette-api/app/Services/OrderService.php
    - trotinette-api/app/Http/Controllers/Customer/OrderController.php
    - trotinette-api/app/Http/Controllers/Admin/OrderController.php
    - trotinette-api/app/Http/Requests/StoreOrderRequest.php
    - trotinette-api/app/Http/Requests/Admin/TransitionOrderRequest.php
    - trotinette-api/app/Http/Requests/Admin/AddOrderNoteRequest.php
    - trotinette-api/app/Http/Resources/OrderResource.php
    - trotinette-api/app/Http/Resources/OrderItemResource.php
    - trotinette-api/app/Http/Resources/OrderStatusLogResource.php
  modified:
    - trotinette-api/routes/api.php

key-decisions:
  - "OrderStatus::from() used in Admin\\OrderController::transition() — validates status string against enum values before calling transitionStatus()"
  - "abort(422, msg) in transitionStatus() for invalid state machine transitions — returns HTTP 422 with message field (standard Laravel abort behavior)"
  - "from_status=null in first OrderStatusLog entry — explicitly documents the initial pending state rather than faking a from_status"
  - "lockForUpdate on duplicate check query — prevents race condition where two concurrent requests with same phone+product slip through"
  - "order_number format: ORD-{Ymd}-{5-char-uniqid} — human readable + reasonably unique for COD operations"
  - "DeliveryZone::where('is_active', true)->firstOrFail() in createOrder — rejects orders to inactive zones at creation time"
  - "allowed_transitions in OrderResource — surfaces state machine options to frontend, avoids hardcoding transitions in UI"

patterns-established:
  - "State machine via PHP 8.1 backed enum: allowedTransitionsTo() returns array of valid next states, canTransitionTo() checks membership"
  - "Server-side price enforcement: StoreOrderRequest accepts NO price fields, OrderService reads prices from locked DB rows"
  - "Audit log pattern: every status transition creates OrderStatusLog with from_status, to_status, actor_id, actor_type, note"
  - "Pessimistic locking order: duplicate check lockForUpdate -> product lockForUpdate -> order lockForUpdate in transition"

# Metrics
duration: 6min
completed: 2026-02-18
---

# Phase 4 Plan 02: Order Backend Summary

**Atomic order creation with pessimistic locking (lockForUpdate), server-side pricing, 10-minute duplicate detection, OrderStatus PHP enum state machine, full audit log on every transition, and thin customer/admin controllers wired to 7 routes.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-18T20:06:43Z
- **Completed:** 2026-02-18T20:13:42Z
- **Tasks:** 5
- **Files modified:** 17

## Accomplishments
- Atomic order creation with lockForUpdate preventing oversells and race conditions, server-calculated subtotals (no client-submitted prices trusted)
- OrderStatus PHP 8.1 backed enum with state machine (Pending→Confirmed/Cancelled, Confirmed→Dispatched/Cancelled, Dispatched→Delivered, terminals: Delivered/Cancelled) and trilingual FR/EN/AR labels
- Every status transition logged in order_status_logs with actor_id, actor_type, from_status, to_status, note — full audit trail
- All 7 routes verified live: POST /api/orders returns 201 with server-calculated totals; duplicate returns 422; out-of-stock returns 422; PATCH /api/admin/orders/{id}/status transitions with log; GET /api/admin/orders?filter[status] works

## Task Commits

Each task was committed atomically:

1. **Task 1: OrderStatus enum and database migrations** - `6736622` (feat)
2. **Task 2: Order, OrderItem, OrderStatusLog models** - `db5b7cc` (feat)
3. **Task 3: OrderService — atomic order creation and state machine** - `6e1c91c` (feat)
4. **Task 4: Form requests and API resources** - `a102f0f` (feat)
5. **Task 5: Customer and admin order controllers + routes** - `5b9b559` (feat)

## Files Created/Modified

- `trotinette-api/app/Enums/OrderStatus.php` - PHP 8.1 backed string enum, state machine, trilingual labels
- `trotinette-api/database/migrations/2026_02_18_000001_create_orders_table.php` - orders table with phone, status, subtotal, delivery_fee, total, note
- `trotinette-api/database/migrations/2026_02_18_000002_create_order_items_table.php` - order_items with price snapshots
- `trotinette-api/database/migrations/2026_02_18_000003_create_order_status_logs_table.php` - audit log table
- `trotinette-api/app/Models/Order.php` - model with OrderStatus cast, relations, scopeForUser
- `trotinette-api/app/Models/OrderItem.php` - price snapshot model with order/product relations
- `trotinette-api/app/Models/OrderStatusLog.php` - audit log model with nullable from_status cast
- `trotinette-api/app/Services/OrderService.php` - createOrder() (atomic), transitionStatus() (state machine), addNote()
- `trotinette-api/app/Http/Controllers/Customer/OrderController.php` - store/index/show (ownership check)
- `trotinette-api/app/Http/Controllers/Admin/OrderController.php` - index (QueryBuilder filters)/show/transition/addNote
- `trotinette-api/app/Http/Requests/StoreOrderRequest.php` - phone, delivery_zone_id, items[], note — no price fields
- `trotinette-api/app/Http/Requests/Admin/TransitionOrderRequest.php` - status enum values, note
- `trotinette-api/app/Http/Requests/Admin/AddOrderNoteRequest.php` - required note max:1000
- `trotinette-api/app/Http/Resources/OrderResource.php` - full order with allowed_transitions, locale-aware labels
- `trotinette-api/app/Http/Resources/OrderItemResource.php` - price snapshots + product name from translations
- `trotinette-api/app/Http/Resources/OrderStatusLogResource.php` - from/to with locale labels, actor info
- `trotinette-api/routes/api.php` - added OrderController imports + 7 order routes

## Decisions Made

- `OrderStatus::from()` in Admin controller validates status string against enum before passing to transitionStatus()
- `abort(422, msg)` for invalid state machine transitions — returns HTTP 422 with clear message
- `from_status=null` in first OrderStatusLog entry — documents initial pending state without fabricating a from_status
- `lockForUpdate` on duplicate check query — prevents race condition between concurrent identical orders
- Order number format `ORD-{Ymd}-{5-char-uniqid}` — human-readable for COD delivery operations
- `DeliveryZone::where('is_active', true)->firstOrFail()` in createOrder — rejects inactive delivery zones at creation time
- `allowed_transitions` field in OrderResource — frontend knows which action buttons to render without hardcoding the state machine

## Deviations from Plan

None - plan executed exactly as written. MySQL startup was handled per the documented blocker in STATE.md (not a deviation).

## Issues Encountered

- MySQL was not running at execution start (known blocker in STATE.md). Started mysqld with documented command `--datadir=C:/Users/User/mysql-data`. All migrations applied successfully after start.
- curl tests without `Accept: application/json` header got HTML redirect responses (standard Laravel behavior when no Accept header). Added header to all test calls — API responses correct.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Order backend is complete and live-tested. All 7 endpoints verified: order creation (201), out-of-stock (422), duplicate (422), admin status transition, admin filters.
- Phase 04-03 (customer frontend) can now build: order placement form, order history page, order detail page.
- Phase 04-04 (admin frontend) can build: order list with status filters, order detail, status transition buttons (powered by `allowed_transitions` field), note form.

---
*Phase: 04-cart-checkout-orders*
*Completed: 2026-02-18*

## Self-Check: PASSED

- All 16 created files confirmed present on disk
- All 5 task commits (6736622, db5b7cc, 6e1c91c, a102f0f, 5b9b559) confirmed in git log
