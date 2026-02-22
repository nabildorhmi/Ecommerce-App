---
phase: quick-9
plan: 01
subsystem: orders
tags: [invoice, pdf, dompdf, admin, customer]
dependency_graph:
  requires:
    - Order model with items, user, delivery zone relationships
    - Admin and Customer OrderController endpoints
  provides:
    - PDF invoice generation service
    - Admin invoice download endpoint
    - Customer invoice download endpoint
  affects:
    - Admin order management workflow
    - Customer order viewing experience
tech_stack:
  added:
    - barryvdh/laravel-dompdf v3.1.1
    - dompdf/dompdf v3.1.4
  patterns:
    - Service layer pattern for PDF generation
    - Blade templates for invoice layout
    - Ownership validation for customer endpoints
key_files:
  created:
    - trotinette-api/app/Services/InvoiceService.php
    - trotinette-api/resources/views/invoices/invoice.blade.php
    - trotinette-api/config/dompdf.php
    - trotinette-api/public/images/logo.png
  modified:
    - trotinette-api/app/Http/Controllers/Admin/OrderController.php
    - trotinette-api/app/Http/Controllers/Customer/OrderController.php
    - trotinette-api/routes/api.php
    - trotinette-api/composer.json
    - trotinette-api/composer.lock
decisions:
  - "InvoiceService.generatePdf() returns PDF instance instead of directly downloading — allows caller flexibility (download vs stream vs save)"
  - "Invoice template uses public_path() for logo — dompdf requires absolute filesystem paths for local images"
  - "French number formatting (comma as decimal separator, space as thousands separator) — matches MAD price display conventions"
  - "Customer invoice endpoint includes ownership check (403 if wrong user) — prevents unauthorized access to other users' invoices"
  - "Invoice filename format facture-{order_number}.pdf — consistent with French invoice terminology"
  - "Inline CSS only in Blade template — dompdf does not support external stylesheets reliably"
  - "Professional invoice design with company logo, order info section, items table, and totals — provides complete invoice document"
metrics:
  duration_minutes: 5
  completed_date: 2026-02-22
  tasks_completed: 2
  files_created: 4
  files_modified: 5
  commits: 2
---

# Quick Task 9: Add PDF Invoice Generation Service

**One-liner:** Professional PDF invoice generation using dompdf with French formatting, company logo, and dual endpoints for admins and customers.

## Implementation Summary

Added complete PDF invoice generation functionality using barryvdh/laravel-dompdf. Admins can download invoices for any order via `/api/admin/orders/{order}/invoice`, while customers can download their own order invoices via `/api/orders/{order}/invoice` with ownership validation. The invoice template is a professional French-language document featuring the company logo, order details, items table with proper MAD price formatting (divided by 100 from centimes, formatted with comma decimal separator), delivery fee, totals, and optional notes.

### Task Breakdown

**Task 1: Install dompdf, copy logo, create InvoiceService and Blade template**
- Installed barryvdh/laravel-dompdf v3.1.1 and published config
- Copied company logo from frontend to `trotinette-api/public/images/logo.png` (414KB)
- Created `InvoiceService` with `generatePdf(Order $order)` method that:
  - Eager-loads relationships (items.product, user) if not already loaded
  - Uses `Pdf::loadView('invoices.invoice', ['order' => $order])`
  - Sets paper to A4 portrait
  - Returns PDF instance for caller flexibility
- Created professional invoice Blade template with:
  - Full HTML5 document structure (dompdf requires standalone HTML)
  - Inline CSS only (dompdf limitation with external stylesheets)
  - Company logo at top-left using `public_path('images/logo.png')` for dompdf
  - "FACTURE" title right-aligned next to logo
  - Order info section with order number, date (d/m/Y), client name, phone, city
  - Items table with columns: Produit, Quantité, Prix unitaire, Sous-total
  - French number formatting: `number_format($price / 100, 2, ',', ' ')` with "MAD" suffix
  - Totals section with subtotal, delivery fee, and bold total
  - Conditional note display if order has note
  - Footer with "Merci pour votre confiance" and app name
  - Professional styling with blue header, alternating row backgrounds, proper spacing
- **Commit:** `2ad3afb` feat(9-01): install dompdf and create invoice service

**Task 2: Add invoice download endpoints for admin and customer**
- Updated `Admin\OrderController`:
  - Added `InvoiceService` dependency injection to constructor
  - Added `invoice(Order $order)` method that generates PDF and returns download
- Updated `Customer\OrderController`:
  - Added `InvoiceService` dependency injection to constructor
  - Added `invoice(Request $request, Order $order)` method with ownership check
  - Returns 403 if order doesn't belong to authenticated user
- Updated `routes/api.php`:
  - Added `GET /api/orders/{order}/invoice` in customer section (auth:sanctum middleware)
  - Added `GET /api/admin/orders/{order}/invoice` in admin section (role:admin|global_admin middleware)
- Both endpoints return `$pdf->download("facture-{$order->order_number}.pdf")`
- **Commit:** `47fa414` feat(9-01): add invoice download endpoints for admin and customer

### Verification Results

All verification steps passed:
- ✅ `php artisan tinker --execute="use Barryvdh\DomPDF\Facade\Pdf; echo 'dompdf OK';"` — package installed
- ✅ Logo exists at `public/images/logo.png` (414KB)
- ✅ Template exists at `resources/views/invoices/invoice.blade.php`
- ✅ Service exists at `app/Services/InvoiceService.php`
- ✅ `php artisan route:list --path=invoice` shows both routes:
  - `GET api/admin/orders/{order}/invoice` → Admin\OrderController@invoice
  - `GET api/orders/{order}/invoice` → Customer\OrderController@invoice
- ✅ `php artisan tinker --execute="use App\Services\InvoiceService; echo 'Service loads OK';"` — no syntax errors
- ✅ Test PDF generation with real order data: 1.2MB PDF generated successfully

## Deviations from Plan

None — plan executed exactly as written.

## Technical Decisions

**InvoiceService returns PDF instance instead of response**
The `generatePdf()` method returns the PDF instance rather than directly calling `download()` or `stream()`. This allows controller methods to decide the response type (download, stream, or save to storage). This pattern provides flexibility for potential future use cases (like emailing invoices, batch PDF generation, etc.).

**Using public_path() for logo in Blade template**
Dompdf requires absolute filesystem paths for local images. Using `public_path('images/logo.png')` instead of `asset()` or relative paths ensures dompdf can locate and embed the image in the PDF.

**French number formatting with comma decimal separator**
Applied `number_format($price / 100, 2, ',', ' ')` to all prices, following Moroccan French conventions where comma is the decimal separator and space is the thousands separator. This matches the existing frontend display patterns.

**Ownership validation in customer invoice endpoint**
Added explicit check `if ($order->user_id !== $request->user()->id)` before PDF generation. This prevents customers from accessing other users' invoices via sequential order ID guessing. Admin endpoint has no such check (admins can download any invoice).

**Inline CSS in invoice template**
Dompdf has limited support for external stylesheets and modern CSS features. All styles are inlined in `<style>` tag within the template, using CSS compatible with dompdf (table-based layout, basic positioning, no flexbox/grid).

## Files Created

1. **trotinette-api/app/Services/InvoiceService.php** — PDF generation service with eager loading
2. **trotinette-api/resources/views/invoices/invoice.blade.php** — Professional French invoice template
3. **trotinette-api/config/dompdf.php** — Dompdf configuration (published from vendor)
4. **trotinette-api/public/images/logo.png** — Company logo for invoices (414KB)

## Files Modified

1. **trotinette-api/app/Http/Controllers/Admin/OrderController.php** — Added InvoiceService injection and invoice method
2. **trotinette-api/app/Http/Controllers/Customer/OrderController.php** — Added InvoiceService injection and invoice method with ownership check
3. **trotinette-api/routes/api.php** — Added two invoice download routes
4. **trotinette-api/composer.json** — Added barryvdh/laravel-dompdf dependency
5. **trotinette-api/composer.lock** — Updated with dompdf and dependencies

## Integration Points

**Admin Order Management**
Admins can now download PDF invoices for any order from the admin panel. The invoice route follows the existing pattern: `/api/admin/orders/{order}/invoice` alongside show, transition, and addNote routes.

**Customer Order History**
Customers can download invoices for their own orders. The route `/api/orders/{order}/invoice` is protected by auth:sanctum middleware and includes ownership validation to ensure users can only access their own invoices.

**Order Model Relationships**
The invoice service relies on existing Order relationships (items.product, user, deliveryZone) being properly eager-loaded. The service handles loading if relationships aren't already loaded, but controllers typically eager-load these for efficiency.

## Future Enhancements

Potential improvements (not part of current scope):
- Email invoice attachment when order is confirmed
- Batch invoice download for admin (multiple orders as ZIP)
- Invoice customization settings (company address, tax ID, terms)
- Invoice storage for historical record keeping
- Invoice preview (stream instead of download)

## Success Criteria Met

✅ barryvdh/laravel-dompdf is installed and functional
✅ InvoiceService generates PDF invoices with logo, French text, order details, items table, and totals in MAD
✅ Admin endpoint GET /api/admin/orders/{order}/invoice returns PDF download
✅ Customer endpoint GET /api/orders/{order}/invoice returns PDF download (own orders only, 403 for others)
✅ All prices correctly converted from centimes (divide by 100) with French number formatting

## Self-Check

**Created Files:**
```bash
FOUND: trotinette-api/app/Services/InvoiceService.php
FOUND: trotinette-api/resources/views/invoices/invoice.blade.php
FOUND: trotinette-api/config/dompdf.php
FOUND: trotinette-api/public/images/logo.png
```

**Commits:**
```bash
FOUND: 2ad3afb (Task 1: install dompdf and create invoice service)
FOUND: 47fa414 (Task 2: add invoice download endpoints)
```

**Test PDF Generation:**
```bash
VERIFIED: 1.2MB PDF generated successfully with real order data
```

## Self-Check: PASSED

All claims verified. Files exist, commits recorded, PDF generation tested successfully.
