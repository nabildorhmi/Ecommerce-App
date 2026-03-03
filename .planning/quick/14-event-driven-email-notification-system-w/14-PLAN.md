---
phase: 14-event-driven-email-notification-system
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-api/app/Events/OrderPlaced.php
  - trotinette-api/app/Events/OrderStatusChanged.php
  - trotinette-api/app/Listeners/SendOrderPlacedCustomerEmail.php
  - trotinette-api/app/Listeners/SendOrderPlacedAdminEmail.php
  - trotinette-api/app/Listeners/SendOrderStatusChangedEmail.php
  - trotinette-api/app/Mail/NewOrderCustomer.php
  - trotinette-api/app/Mail/NewOrderAdmin.php
  - trotinette-api/app/Mail/OrderConfirmed.php
  - trotinette-api/app/Mail/OrderDispatched.php
  - trotinette-api/app/Mail/OrderDelivered.php
  - trotinette-api/app/Mail/OrderCancelled.php
  - trotinette-api/app/Services/OrderService.php
autonomous: true
must_haves:
  truths:
    - "Order placement triggers customer confirmation email asynchronously"
    - "Order placement notifies all admin/global_admin users asynchronously"
    - "Order status transitions trigger appropriate customer email asynchronously"
    - "OrderService contains no direct Mail:: calls"
    - "Email sending does not block the HTTP response"
  artifacts:
    - path: "trotinette-api/app/Events/OrderPlaced.php"
      provides: "Event dispatched after order creation"
      contains: "class OrderPlaced"
    - path: "trotinette-api/app/Events/OrderStatusChanged.php"
      provides: "Event dispatched after status transition"
      contains: "class OrderStatusChanged"
    - path: "trotinette-api/app/Listeners/SendOrderPlacedCustomerEmail.php"
      provides: "Queued listener sending customer confirmation"
      contains: "implements ShouldQueue"
    - path: "trotinette-api/app/Listeners/SendOrderPlacedAdminEmail.php"
      provides: "Queued listener notifying admins"
      contains: "implements ShouldQueue"
    - path: "trotinette-api/app/Listeners/SendOrderStatusChangedEmail.php"
      provides: "Queued listener for status transition emails"
      contains: "implements ShouldQueue"
  key_links:
    - from: "trotinette-api/app/Services/OrderService.php"
      to: "App\\Events\\OrderPlaced"
      via: "event() helper or Event::dispatch()"
      pattern: "OrderPlaced::dispatch|event\\(new OrderPlaced"
    - from: "trotinette-api/app/Services/OrderService.php"
      to: "App\\Events\\OrderStatusChanged"
      via: "event() helper or Event::dispatch()"
      pattern: "OrderStatusChanged::dispatch|event\\(new OrderStatusChanged"
    - from: "trotinette-api/app/Listeners/SendOrderPlacedCustomerEmail.php"
      to: "App\\Mail\\NewOrderCustomer"
      via: "Mail::to()->send()"
      pattern: "Mail::to.*send.*NewOrderCustomer"
---

<objective>
Refactor email sending in OrderService to use Laravel Events/Listeners pattern, making emails asynchronous (queued) and decoupled from business logic.

Purpose: Currently OrderService directly calls Mail::to()->send() inline, blocking the HTTP response and tightly coupling email logic to order processing. This refactoring introduces proper event-driven architecture: OrderService dispatches events, listeners handle email sending via the queue.

Output: Event classes, queued listener classes, updated OrderService without Mail imports, Mailable classes implementing ShouldQueue.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-api/app/Services/OrderService.php
@trotinette-api/app/Enums/OrderStatus.php
@trotinette-api/app/Models/Order.php
@trotinette-api/app/Mail/NewOrderCustomer.php
@trotinette-api/app/Mail/NewOrderAdmin.php
@trotinette-api/app/Mail/OrderConfirmed.php
@trotinette-api/app/Mail/OrderDispatched.php
@trotinette-api/app/Mail/OrderDelivered.php
@trotinette-api/app/Mail/OrderCancelled.php
@trotinette-api/config/queue.php
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Events and Queued Listeners</name>
  <files>
    trotinette-api/app/Events/OrderPlaced.php
    trotinette-api/app/Events/OrderStatusChanged.php
    trotinette-api/app/Listeners/SendOrderPlacedCustomerEmail.php
    trotinette-api/app/Listeners/SendOrderPlacedAdminEmail.php
    trotinette-api/app/Listeners/SendOrderStatusChangedEmail.php
  </files>
  <action>
    Create two event classes and three queued listeners:

    **Events:**

    1. `OrderPlaced` — accepts `Order $order` (already loaded with relations). Implements `Illuminate\Foundation\Events\Dispatchable` and `Illuminate\Queue\SerializesModels`. Public readonly `Order $order` property via constructor promotion.

    2. `OrderStatusChanged` — accepts `Order $order`, `OrderStatus $newStatus`, `?string $note = null`. Same traits. Public readonly properties for all three.

    **Listeners:**

    3. `SendOrderPlacedCustomerEmail` — implements `ShouldQueue`, uses `InteractsWithQueue` and `Queueable` traits. In `handle(OrderPlaced $event)`: check `$event->order->user && $event->order->user->email`, then `Mail::to($event->order->user->email)->send(new NewOrderCustomer($event->order))`. Set `public int $tries = 3` and `public int $backoff = 60`.

    4. `SendOrderPlacedAdminEmail` — implements `ShouldQueue`. In `handle(OrderPlaced $event)`: query `User::role(['admin', 'global_admin'])->get()`, loop and send `new NewOrderAdmin($event->order)` to each admin with email. Same retry config.

    5. `SendOrderStatusChangedEmail` — implements `ShouldQueue`. In `handle(OrderStatusChanged $event)`: check customer has email, then match `$event->newStatus` to the appropriate Mailable (Confirmed, Dispatched, Delivered, Cancelled — same match logic currently in OrderService::transitionStatus). For Cancelled, pass `$event->note` to `OrderCancelled`. Same retry config.

    Laravel 12 uses auto-discovery for event-listener mapping via type-hinted `handle()` method signatures — no need for EventServiceProvider registration.
  </action>
  <verify>
    Run `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-api && php artisan event:list` — should show OrderPlaced with its two listeners, and OrderStatusChanged with its listener. Also `php artisan lint` or syntax check: `php -l app/Events/OrderPlaced.php && php -l app/Events/OrderStatusChanged.php && php -l app/Listeners/SendOrderPlacedCustomerEmail.php && php -l app/Listeners/SendOrderPlacedAdminEmail.php && php -l app/Listeners/SendOrderStatusChangedEmail.php`
  </verify>
  <done>
    Two event classes exist with proper properties. Three listener classes exist, all implementing ShouldQueue with retry config. Laravel auto-discovers the event-listener bindings (visible in event:list).
  </done>
</task>

<task type="auto">
  <name>Task 2: Refactor OrderService to dispatch events and make Mailables queueable</name>
  <files>
    trotinette-api/app/Services/OrderService.php
    trotinette-api/app/Mail/NewOrderCustomer.php
    trotinette-api/app/Mail/NewOrderAdmin.php
    trotinette-api/app/Mail/OrderConfirmed.php
    trotinette-api/app/Mail/OrderDispatched.php
    trotinette-api/app/Mail/OrderDelivered.php
    trotinette-api/app/Mail/OrderCancelled.php
  </files>
  <action>
    **OrderService changes:**

    1. Remove ALL `use App\Mail\*` imports and `use Illuminate\Support\Facades\Mail`.
    2. Remove `use App\Models\User` (no longer needed for admin query).
    3. Add `use App\Events\OrderPlaced` and `use App\Events\OrderStatusChanged`.
    4. In `createOrder()`: replace the two email blocks (lines 86-96) with a single line: `OrderPlaced::dispatch($order);`
    5. In `transitionStatus()`: replace the email block (lines 130-142) with a single line: `OrderStatusChanged::dispatch($order, $newStatus, $note);`
    6. Keep all other business logic untouched — transaction, duplicate check, stock validation, status log creation all remain identical.

    **Mailable changes (all 6 files):**

    Add `implements ShouldQueue` and `use Queueable` trait to each Mailable class. This makes emails queued even if a listener calls `Mail::send()` directly (belt-and-suspenders with the queued listener). Import `Illuminate\Contracts\Queue\ShouldQueue` and `Illuminate\Bus\Queueable`.

    Files: NewOrderCustomer, NewOrderAdmin, OrderConfirmed, OrderDispatched, OrderDelivered, OrderCancelled.
  </action>
  <verify>
    Run `php -l app/Services/OrderService.php` — no syntax errors. Verify no `Mail::` usage remains: `grep -r "Mail::" app/Services/OrderService.php` should return empty. Verify events are dispatched: `grep -r "::dispatch" app/Services/OrderService.php` should show OrderPlaced and OrderStatusChanged. Run `php artisan route:list` to confirm no boot errors. Verify Mailables: `grep -l "ShouldQueue" app/Mail/*.php | wc -l` should return 6.
  </verify>
  <done>
    OrderService has zero Mail imports — only dispatches OrderPlaced and OrderStatusChanged events. All 6 Mailable classes implement ShouldQueue. The email logic is fully decoupled: OrderService -> Event -> Listener -> Mailable -> Queue. HTTP responses are no longer blocked by email sending.
  </done>
</task>

</tasks>

<verification>
1. `php artisan event:list` shows correct event-listener bindings
2. `grep -r "Mail::" app/Services/OrderService.php` returns nothing
3. `grep -r "::dispatch" app/Services/OrderService.php` shows both events
4. `grep -l "ShouldQueue" app/Mail/*.php` returns all 6 Mailable files
5. `grep -l "ShouldQueue" app/Listeners/*.php` returns all 3 listener files
6. `php artisan route:list` runs without errors (no broken imports)
7. All PHP files pass syntax check (`php -l`)
</verification>

<success_criteria>
- OrderService dispatches events instead of sending emails directly
- Listeners are queued (ShouldQueue) with retry config (3 tries, 60s backoff)
- Mailables implement ShouldQueue for defense-in-depth
- Event auto-discovery works (event:list confirms bindings)
- No regression in OrderService business logic (transactions, state machine, stock management untouched)
- Pattern is extensible: adding new email triggers means creating a new Event + Listener, not modifying OrderService
</success_criteria>

<output>
After completion, create `.planning/quick/14-event-driven-email-notification-system-w/14-SUMMARY.md`
</output>
