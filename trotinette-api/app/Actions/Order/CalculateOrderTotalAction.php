<?php

namespace App\Actions\Order;

class CalculateOrderTotalAction
{
    /**
     * Calculate subtotal and total from prepared items data.
     * Returns [subtotal, delivery_fee, total].
     */
    public function execute(array $itemsData): array
    {
        $subtotal = array_sum(array_column($itemsData, 'subtotal'));
        $deliveryFee = 0; // Currently no delivery zone fees

        return [
            'subtotal'     => $subtotal,
            'delivery_fee' => $deliveryFee,
            'total'        => $subtotal + $deliveryFee,
        ];
    }
}
