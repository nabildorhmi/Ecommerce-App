<?php

namespace App\Actions\Order;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class ValidateStockAction
{
    /**
     * Lock products and eager-load variants with pessimistic locking.
     * Returns keyed Product collection.
     */
    public function execute(array $productIds): Collection
    {
        $products = Product::whereIn('id', $productIds)
            ->where('is_active', true)
            ->with(['variants' => fn ($q) => $q->lockForUpdate()])
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        return $products;
    }

    /**
     * Validate stock for each item and return prepared items data array.
     * Resolves variants, validates stock, calculates subtotals.
     */
    public function validateItems(array $items, Collection $products): array
    {
        $itemsData = [];

        foreach ($items as $item) {
            $productId = $item['product_id'];
            $variantId = $item['variant_id'] ?? null;
            $quantity  = $item['quantity'];

            if (! isset($products[$productId])) {
                throw ValidationException::withMessages([
                    'items' => ["Product ID {$productId} is not available."],
                ]);
            }

            $product = $products[$productId];

            // Resolve variant: use explicitly specified or fall back to default
            $variant = $variantId
                ? $product->variants->firstWhere('id', $variantId)
                : $product->variants->firstWhere('is_default', true);

            if (! $variant || ! $variant->is_active) {
                throw ValidationException::withMessages([
                    'items' => ["No active variant found for product '{$product->sku}'."],
                ]);
            }

            // Stock is always on the variant
            if ($variant->stock < $quantity) {
                throw ValidationException::withMessages([
                    'items' => ["Insufficient stock for '{$variant->sku}'. Available: {$variant->stock}, requested: {$quantity}."],
                ]);
            }

            $basePrice = $variant->price ?? $product->price;
            $promoPrice = $variant->promo_price ?? $product->promo_price;
            $unitPrice = ($promoPrice !== null && $promoPrice < $basePrice)
                ? $promoPrice
                : $basePrice;
            $itemSubtotal = $unitPrice * $quantity;

            $itemsData[] = [
                'product_id'  => $productId,
                'variant_id'  => $variant->id,
                'product_sku' => $variant->sku ?? $product->sku,
                'unit_price'  => $unitPrice,
                'quantity'    => $quantity,
                'subtotal'    => $itemSubtotal,
            ];
        }

        return $itemsData;
    }
}
