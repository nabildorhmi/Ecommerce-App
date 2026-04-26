<?php

namespace App\Actions\Order;

use App\Models\Product;
use App\Models\Variant;

class DecrementStockAction
{
    /**
     * Decrement variant stock and sync product.stock_quantity.
     * Executes atomic decrements for each item.
     */
    public function execute(array $itemsData): void
    {
        foreach ($itemsData as $item) {
            Variant::where('id', $item['variant_id'])
                ->decrement('stock', $item['quantity']);
            Product::where('id', $item['product_id'])
                ->decrement('stock_quantity', $item['quantity']);
        }
    }
}
