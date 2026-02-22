---
phase: 9-add-pdf-invoice-generation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-api/composer.json
  - trotinette-api/config/dompdf.php
  - trotinette-api/app/Services/InvoiceService.php
  - trotinette-api/resources/views/invoices/invoice.blade.php
  - trotinette-api/public/images/logo.png
  - trotinette-api/app/Http/Controllers/Admin/OrderController.php
  - trotinette-api/app/Http/Controllers/Customer/OrderController.php
  - trotinette-api/routes/api.php
autonomous: true
must_haves:
  truths:
    - "Admin can download a PDF invoice for any order via GET /api/admin/orders/{order}/invoice"
    - "Customer can download a PDF invoice for their own order via GET /api/orders/{order}/invoice"
    - "PDF contains company logo, order details, items table with correct prices in MAD, and totals"
    - "Customer cannot download invoice for another user's order (403)"
  artifacts:
    - path: "trotinette-api/app/Services/InvoiceService.php"
      provides: "PDF generation logic using barryvdh/laravel-dompdf"
    - path: "trotinette-api/resources/views/invoices/invoice.blade.php"
      provides: "Invoice Blade template with logo, order info, items table, totals"
    - path: "trotinette-api/public/images/logo.png"
      provides: "Company logo accessible to dompdf"
  key_links:
    - from: "Admin/OrderController@invoice"
      to: "InvoiceService@generatePdf"
      via: "dependency injection"
    - from: "Customer/OrderController@invoice"
      to: "InvoiceService@generatePdf"
      via: "dependency injection with ownership check"
    - from: "InvoiceService"
      to: "resources/views/invoices/invoice.blade.php"
      via: "Pdf::loadView()"
---

<objective>
Add PDF invoice generation for orders using barryvdh/laravel-dompdf, accessible by both admins and customers.

Purpose: Allow downloading professional PDF invoices with company logo, order details, items table, and totals in MAD.
Output: InvoiceService, invoice Blade template, two new API endpoints.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-api/app/Models/Order.php
@trotinette-api/app/Models/OrderItem.php
@trotinette-api/app/Services/OrderService.php
@trotinette-api/app/Http/Controllers/Admin/OrderController.php
@trotinette-api/app/Http/Controllers/Customer/OrderController.php
@trotinette-api/routes/api.php
@trotinette-api/resources/views/emails/new-order-customer.blade.php
@trotinette-api/composer.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install dompdf, copy logo, create InvoiceService and Blade template</name>
  <files>
    trotinette-api/composer.json
    trotinette-api/config/dompdf.php
    trotinette-api/app/Services/InvoiceService.php
    trotinette-api/resources/views/invoices/invoice.blade.php
    trotinette-api/public/images/logo.png
  </files>
  <action>
    1. Install barryvdh/laravel-dompdf:
       ```
       cd trotinette-api && composer require barryvdh/laravel-dompdf
       ```
       Then publish the config:
       ```
       php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
       ```

    2. Copy the company logo to the backend public directory:
       ```
       mkdir -p public/images
       cp ../trotinette-frontend/src/assets/miraiTech-Logo.png public/images/logo.png
       ```

    3. Create `app/Services/InvoiceService.php`:
       - Method: `generatePdf(Order $order): \Barryvdh\DomPDF\PDF`
       - Eager-load `$order->load(['items.product', 'user'])` if not already loaded
       - Use `Pdf::loadView('invoices.invoice', ['order' => $order])`
       - Set paper to A4, portrait
       - Return the PDF instance (caller decides stream vs download)

    4. Create `resources/views/invoices/invoice.blade.php` as a standalone HTML document (NOT a mail component -- dompdf needs full HTML). Use inline CSS only (dompdf does not support external stylesheets well). The template must include:
       - Full `<!DOCTYPE html>` with `<html lang="fr">`
       - Company logo at top-left using `<img src="{{ public_path('images/logo.png') }}" style="height: 60px;">` (public_path is required for dompdf to embed local images)
       - Title: "FACTURE" in large text, right-aligned next to logo
       - Order info section: Numero de commande, date (formatted `d/m/Y`), client name, telephone, ville
       - Items table with columns: Produit, Quantite, Prix unitaire, Sous-total
         - Use `$item->product->name ?? $item->product_sku` for product name (same pattern as email template)
         - Format prices: `number_format($item->unit_price / 100, 2, ',', ' ')` with " MAD" suffix
         - All prices divided by 100 (stored in centimes)
       - Totals section below table: Sous-total, Frais de livraison, Total (bold)
       - If `$order->note` exists, show it below totals
       - Footer with "Merci pour votre confiance" and app name
       - Style the table with borders, alternating row backgrounds, proper padding
       - Keep all text in French (this is a French-only app)
  </action>
  <verify>
    Run `cd trotinette-api && php artisan tinker --execute="use Barryvdh\DomPDF\Facade\Pdf; echo 'dompdf OK';"` to confirm package is installed.
    Verify logo exists: `ls trotinette-api/public/images/logo.png`
    Verify template exists: `ls trotinette-api/resources/views/invoices/invoice.blade.php`
    Verify service exists: `ls trotinette-api/app/Services/InvoiceService.php`
  </verify>
  <done>
    - barryvdh/laravel-dompdf installed and config published
    - Logo copied to public/images/logo.png
    - InvoiceService with generatePdf method exists
    - Invoice Blade template renders a professional French invoice with logo, order info, items table, and totals
  </done>
</task>

<task type="auto">
  <name>Task 2: Add invoice download endpoints for admin and customer</name>
  <files>
    trotinette-api/app/Http/Controllers/Admin/OrderController.php
    trotinette-api/app/Http/Controllers/Customer/OrderController.php
    trotinette-api/routes/api.php
  </files>
  <action>
    1. Update `app/Http/Controllers/Admin/OrderController.php`:
       - Add `use App\Services\InvoiceService;` import
       - Update constructor to inject both OrderService and InvoiceService:
         `public function __construct(private readonly OrderService $orderService, private readonly InvoiceService $invoiceService)`
       - Add method `invoice(Order $order)`:
         ```php
         public function invoice(Order $order)
         {
             $pdf = $this->invoiceService->generatePdf($order);
             return $pdf->download("facture-{$order->order_number}.pdf");
         }
         ```

    2. Update `app/Http/Controllers/Customer/OrderController.php`:
       - Add `use App\Services\InvoiceService;` import
       - Update constructor to inject both OrderService and InvoiceService
       - Add method `invoice(Request $request, Order $order)`:
         ```php
         public function invoice(Request $request, Order $order)
         {
             if ($order->user_id !== $request->user()->id) {
                 abort(403, 'This order does not belong to you.');
             }
             $pdf = $this->invoiceService->generatePdf($order);
             return $pdf->download("facture-{$order->order_number}.pdf");
         }
         ```

    3. Update `routes/api.php`:
       - In the customer orders section (inside `auth:sanctum` middleware), add:
         `Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice']);`
         Place it after the existing `GET /orders/{order}` route.
       - In the admin orders section (inside `role:admin|global_admin` middleware), add:
         `Route::get('/orders/{order}/invoice', [AdminOrderController::class, 'invoice']);`
         Place it after the existing admin order routes.
  </action>
  <verify>
    Run `cd trotinette-api && php artisan route:list --path=invoice` to confirm both invoice routes are registered.
    Expected output should show:
    - GET api/orders/{order}/invoice (customer)
    - GET api/admin/orders/{order}/invoice (admin)
  </verify>
  <done>
    - Admin can GET /api/admin/orders/{order}/invoice to download PDF
    - Customer can GET /api/orders/{order}/invoice to download PDF for own orders only
    - Both routes are protected by auth:sanctum, admin route additionally by role middleware
    - PDF downloads with filename "facture-{order_number}.pdf"
  </done>
</task>

</tasks>

<verification>
1. `cd trotinette-api && php artisan route:list --path=invoice` shows both routes
2. `php artisan tinker --execute="use App\Services\InvoiceService; echo 'Service loads OK';"` confirms no syntax errors
3. If test orders exist in DB, test with: `php artisan tinker --execute="use App\Services\InvoiceService; use App\Models\Order; \$o = Order::first(); if(\$o) { (new InvoiceService)->generatePdf(\$o)->save(storage_path('app/test-invoice.pdf')); echo 'PDF generated'; } else { echo 'No orders in DB'; }"`
</verification>

<success_criteria>
- barryvdh/laravel-dompdf is installed and functional
- InvoiceService generates PDF invoices with logo, French text, order details, items table, and totals in MAD
- Admin endpoint GET /api/admin/orders/{order}/invoice returns PDF download
- Customer endpoint GET /api/orders/{order}/invoice returns PDF download (own orders only, 403 for others)
- All prices correctly converted from centimes (divide by 100) with French number formatting
</success_criteria>

<output>
After completion, create `.planning/quick/9-add-pdf-invoice-generation-service-using/9-SUMMARY.md`
</output>
