<?php

namespace App\Actions\Order;

use App\Models\Order;
use Illuminate\Validation\ValidationException;

class CheckDuplicateOrderAction
{
    /**
     * Check for duplicate orders within the last 10 minutes.
     * Throws ValidationException if duplicate found.
     */
    public function execute(string $phone, array $productIds): void
    {
        $duplicate = Order::where('phone', $phone)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->whereHas('items', fn ($q) => $q->whereIn('product_id', $productIds))
            ->lockForUpdate()
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'order' => ['A duplicate order with the same phone and product was placed within the last 10 minutes.'],
            ]);
        }
    }
}
