---
phase: 8-add-email-notification-service-integrate
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-api/app/Mail/NewOrderCustomer.php
  - trotinette-api/app/Mail/NewOrderAdmin.php
  - trotinette-api/app/Mail/OrderConfirmed.php
  - trotinette-api/app/Mail/OrderCancelled.php
  - trotinette-api/app/Services/OrderService.php
autonomous: false

must_haves:
  truths:
    - "Customer receives email when order is created (pending status)"
    - "All admin users receive email notification when new order is created"
    - "Customer receives email when order is confirmed by admin"
    - "Customer receives email when order is cancelled (with optional reason)"
    - "Emails are queued and sent after successful DB transaction"
  artifacts:
    - path: "trotinette-api/app/Mail/NewOrderCustomer.php"
      provides: "Mailable for customer order creation notification"
      min_lines: 30
    - path: "trotinette-api/app/Mail/NewOrderAdmin.php"
      provides: "Mailable for admin order creation notification"
      min_lines: 30
    - path: "trotinette-api/app/Mail/OrderConfirmed.php"
      provides: "Mailable for order confirmation notification"
      min_lines: 25
    - path: "trotinette-api/app/Mail/OrderCancelled.php"
      provides: "Mailable for order cancellation notification"
      min_lines: 25
    - path: "trotinette-api/app/Services/OrderService.php"
      provides: "Updated OrderService with email dispatching"
      contains: "Mail::to"
  key_links:
    - from: "trotinette-api/app/Services/OrderService.php"
      to: "trotinette-api/app/Mail/NewOrderCustomer.php"
      via: "Mail facade dispatches after createOrder transaction"
      pattern: "Mail::to.*->queue.*NewOrderCustomer"
    - from: "trotinette-api/app/Services/OrderService.php"
      to: "trotinette-api/app/Mail/OrderConfirmed.php"
      via: "Mail facade dispatches after status transition to Confirmed"
      pattern: "Mail::to.*->queue.*OrderConfirmed"
    - from: "trotinette-api/app/Services/OrderService.php"
      to: "User model with admin role"
      via: "Fetch all admin users for notification"
      pattern: "User::role\\('admin'\\)"
---

<objective>
Add a reusable, queued email notification service integrated with the order lifecycle to notify customers and admins about order creation, confirmation, and cancellation.

Purpose: Provide automated email communication for order lifecycle events, keeping customers informed and notifying admins of new orders.
Output: Four Mailable classes and updated OrderService with queued email dispatching after successful DB commits.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-api/app/Models/Order.php
@trotinette-api/app/Models/User.php
@trotinette-api/app/Services/OrderService.php
@trotinette-api/app/Enums/OrderStatus.php
@trotinette-api/config/mail.php
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Mailable Classes for Order Notifications</name>
  <files>
trotinette-api/app/Mail/NewOrderCustomer.php
trotinette-api/app/Mail/NewOrderAdmin.php
trotinette-api/app/Mail/OrderConfirmed.php
trotinette-api/app/Mail/OrderCancelled.php
  </files>
  <action>
Create four Mailable classes using Laravel's `php artisan make:mail` command:

1. **NewOrderCustomer.php** - Customer notification for order creation (pending status)
   - Constructor accepts Order model
   - `content()` method returns view 'emails.new-order-customer' with order data
   - Subject: "Order Confirmation - {order_number}"
   - Passes order with eager-loaded items.product, user

2. **NewOrderAdmin.php** - Admin notification for new orders
   - Constructor accepts Order model
   - `content()` method returns view 'emails.new-order-admin' with order data
   - Subject: "New Order Received - {order_number}"
   - Passes order with eager-loaded items.product, user

3. **OrderConfirmed.php** - Customer notification for order confirmation
   - Constructor accepts Order model
   - `content()` method returns view 'emails.order-confirmed' with order data
   - Subject: "Your Order Has Been Confirmed - {order_number}"
   - Passes order with eager-loaded items.product

4. **OrderCancelled.php** - Customer notification for order cancellation
   - Constructor accepts Order model and optional string $reason
   - `content()` method returns view 'emails.order-cancelled' with order and reason
   - Subject: "Order Cancelled - {order_number}"
   - Passes order and reason (default to latest status log note if not provided)

All Mailables should:
- Use `Illuminate\Mail\Mailable`
- Implement `Illuminate\Contracts\Queue\ShouldQueue` for queueing
- Use `Queueable` trait
- Set queue name to 'emails' via `onQueue('emails')` in constructor
- Store Order as public property for view access
- Use markdown views (not HTML) — create placeholder blade files under resources/views/emails/ with basic structure (order number, items list, total, status)

Run artisan commands:
```bash
cd trotinette-api
php artisan make:mail NewOrderCustomer --markdown=emails.new-order-customer
php artisan make:mail NewOrderAdmin --markdown=emails.new-order-admin
php artisan make:mail OrderConfirmed --markdown=emails.order-confirmed
php artisan make:mail OrderCancelled --markdown=emails.order-cancelled
```

After generating, update each class:
- Add `implements ShouldQueue`
- Add `use Queueable;` in class body
- Constructor: accept Order (and reason for OrderCancelled), store as public property, call `$this->onQueue('emails')`
- Update `content()` to pass order (and reason) to view
- Set subject in `envelope()` method

For views (resources/views/emails/*.blade.php), create simple markdown structure:
```blade
@component('mail::message')
# Order {order_number}

**Status:** {{ $order->status->label() }}
**Total:** {{ number_format($order->total / 100, 2) }} MAD

@component('mail::table')
| Product | Quantity | Price |
| ------- | -------- | ----- |
@foreach($order->items as $item)
| {{ $item->product->name ?? $item->product_sku }} | {{ $item->quantity }} | {{ number_format($item->subtotal / 100, 2) }} MAD |
@endforeach
@endcomponent

Thank you,<br>
{{ config('app.name') }}
@endcomponent
```

Customize each view appropriately (e.g., OrderCancelled includes reason if present).
  </action>
  <verify>
Run `ls trotinette-api/app/Mail/*.php` to confirm four Mailable classes exist.
Run `ls trotinette-api/resources/views/emails/*.blade.php` to confirm four markdown views exist.
Check each Mailable implements ShouldQueue and uses Queueable trait.
  </verify>
  <done>
Four Mailable classes exist (NewOrderCustomer, NewOrderAdmin, OrderConfirmed, OrderCancelled), all implement ShouldQueue, use onQueue('emails'), and have corresponding markdown blade views with order details.
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate Email Dispatching into OrderService</name>
  <files>
trotinette-api/app/Services/OrderService.php
  </files>
  <action>
Update OrderService to dispatch queued emails AFTER successful DB transaction commits.

**In `createOrder()` method:**
After the `DB::transaction()` completes successfully (after line 118 where order is returned):

1. Dispatch NewOrderCustomer to the customer:
```php
use Illuminate\Support\Facades\Mail;
use App\Mail\NewOrderCustomer;
use App\Mail\NewOrderAdmin;

// After DB::transaction but before final return
Mail::to($order->user->email)->queue(new NewOrderCustomer($order));
```

2. Fetch all admin users and dispatch NewOrderAdmin to each:
```php
$admins = \App\Models\User::role(['admin', 'global_admin'])->get();
foreach ($admins as $admin) {
    Mail::to($admin->email)->queue(new NewOrderAdmin($order));
}
```

**In `transitionStatus()` method:**
After the `DB::transaction()` completes and before returning (after line 147):

1. Check if new status is Confirmed:
```php
use App\Mail\OrderConfirmed;

if ($newStatus === OrderStatus::Confirmed) {
    Mail::to($order->user->email)->queue(new OrderConfirmed($order));
}
```

2. Check if new status is Cancelled:
```php
use App\Mail\OrderCancelled;

if ($newStatus === OrderStatus::Cancelled) {
    Mail::to($order->user->email)->queue(new OrderCancelled($order, $note));
}
```

**Important:**
- Use `->queue()` method, NOT `->send()` (asynchronous processing)
- Dispatch AFTER DB transaction to ensure order is committed before email queuing
- Load order fresh with relations if needed for email views
- Add all Mail use statements at top of file

Handle gracefully if user email is missing (guard with `if ($order->user->email)`).
  </action>
  <verify>
Run `grep -n "Mail::to" trotinette-api/app/Services/OrderService.php` to confirm Mail dispatching exists in both methods.
Run `grep -n "->queue(" trotinette-api/app/Services/OrderService.php` to confirm queued dispatch (not synchronous send).
Check that email dispatching happens after DB::transaction() completes, not inside transaction.
  </verify>
  <done>
OrderService dispatches queued emails after successful transactions: NewOrderCustomer + NewOrderAdmin on order creation, OrderConfirmed on confirmation, OrderCancelled on cancellation. All emails use ->queue() method.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Email notification system with four Mailable classes (NewOrderCustomer, NewOrderAdmin, OrderConfirmed, OrderCancelled) integrated into OrderService. Emails are queued after successful DB commits.
  </what-built>
  <how-to-verify>
**Setup:**
1. Ensure queue is running: `cd trotinette-api && php artisan queue:work --queue=emails --stop-when-empty`
2. Set MAIL_MAILER=log in .env (emails logged to storage/logs/laravel.log)

**Test Order Creation:**
1. Create a new order via API (POST /api/customer/orders) as a customer
2. Check storage/logs/laravel.log for TWO emails:
   - NewOrderCustomer sent to customer email
   - NewOrderAdmin sent to each admin user email
3. Verify email content includes order number, items, total, pending status

**Test Order Confirmation:**
1. Transition an order to Confirmed via admin API (POST /api/admin/orders/{id}/transition with status=confirmed)
2. Check logs for OrderConfirmed email sent to customer
3. Verify email content shows confirmed status

**Test Order Cancellation:**
1. Transition an order to Cancelled via admin API (POST /api/admin/orders/{id}/transition with status=cancelled, note="Out of stock")
2. Check logs for OrderCancelled email sent to customer
3. Verify email includes cancellation reason ("Out of stock")

**Expected Outcomes:**
- All emails appear in logs with correct recipients
- Email content displays order details (number, items, total, status)
- Queue processes emails without errors
- No emails sent before DB transaction commits (check timing)
  </how-to-verify>
  <resume-signal>Type "approved" if emails are sent correctly and queued, or describe any issues found.</resume-signal>
</task>

</tasks>

<verification>
1. Four Mailable classes exist and implement ShouldQueue
2. Four markdown email views exist with order details
3. OrderService dispatches emails after DB transactions
4. Emails use ->queue() method for asynchronous processing
5. Customer receives emails on order creation, confirmation, cancellation
6. Admins receive email on new order creation
7. Queue processes emails without errors
</verification>

<success_criteria>
- [ ] NewOrderCustomer.php, NewOrderAdmin.php, OrderConfirmed.php, OrderCancelled.php exist in app/Mail/
- [ ] All Mailables implement ShouldQueue and use onQueue('emails')
- [ ] Four markdown blade views exist in resources/views/emails/
- [ ] OrderService.php dispatches queued emails after successful DB commits
- [ ] Emails contain order number, items, total, and appropriate status
- [ ] Queue successfully processes emails when `php artisan queue:work` runs
- [ ] Customer email sent on order creation (pending)
- [ ] Admin emails sent to all admin users on order creation
- [ ] Customer email sent on order confirmation
- [ ] Customer email sent on order cancellation (with reason)
- [ ] Manual testing confirms emails logged/sent correctly
</success_criteria>

<output>
After completion, create `.planning/quick/8-add-email-notification-service-integrate/8-01-SUMMARY.md`
</output>
