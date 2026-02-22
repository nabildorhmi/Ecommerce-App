<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    /**
     * Generate a PDF invoice for an order
     *
     * @param Order $order
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generatePdf(Order $order): \Barryvdh\DomPDF\PDF
    {
        // Eager-load relationships if not already loaded
        if (!$order->relationLoaded('items')) {
            $order->load(['items.product', 'user']);
        } elseif (!$order->items->first()?->relationLoaded('product')) {
            $order->load(['items.product', 'user']);
        }
        if (!$order->relationLoaded('user')) {
            $order->load('user');
        }

        // Generate PDF from Blade view
        $pdf = Pdf::loadView('invoices.invoice', [
            'order' => $order,
        ]);

        // Set paper to A4 portrait
        $pdf->setPaper('a4', 'portrait');

        return $pdf;
    }
}
