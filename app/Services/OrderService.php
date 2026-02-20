<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Atomically create an order with pessimistic locking, server-side pricing,
     * stock decrement, and duplicate detection.
     */
    public function createOrder(array $data, int $userId): Order
    {
        return DB::transaction(function () use ($data, $userId) {
            // a. Extract city (no delivery zone, delivery fee = 0)
            $city = $data['city'];

            $productIds = array_column($data['items'], 'product_id');

            // b. Duplicate order check (same phone + overlapping product within 10 min)
            $duplicate = Order::where('phone', $data['phone'])
                ->where('created_at', '>=', now()->subMinutes(10))
                ->whereHas('items', fn ($q) => $q->whereIn('product_id', $productIds))
                ->lockForUpdate()
                ->exists();

            if ($duplicate) {
                throw ValidationException::withMessages([
                    'order' => ['A duplicate order with the same phone and product was placed within the last 10 minutes.'],
                ]);
            }

            // c. Lock products with pessimistic locking
            $products = Product::whereIn('id', $productIds)
                ->where('is_active', true)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // d. Validate stock and calculate subtotal
            $subtotal = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $productId = $item['product_id'];
                $quantity  = $item['quantity'];

                if (! isset($products[$productId])) {
                    throw ValidationException::withMessages([
                        'items' => ["Product ID {$productId} is not available."],
                    ]);
                }

                $product = $products[$productId];

                if ($product->stock_quantity < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for product '{$product->sku}'. Available: {$product->stock_quantity}, requested: {$quantity}."],
                    ]);
                }

                $itemSubtotal = $product->price * $quantity;
                $subtotal    += $itemSubtotal;

                $itemsData[] = [
                    'product_id'  => $productId,
                    'product_sku' => $product->sku,
                    'unit_price'  => $product->price,
                    'quantity'    => $quantity,
                    'subtotal'    => $itemSubtotal,
                ];
            }

            // e. Decrement stock for each item
            foreach ($itemsData as $item) {
                Product::where('id', $item['product_id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }

            // f. Generate unique order number
            $orderNumber = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            // g. Create order with server-calculated amounts
            $order = Order::create([
                'user_id'          => $userId,
                'delivery_zone_id' => null,
                'city'             => $city,
                'order_number'     => $orderNumber,
                'phone'            => $data['phone'],
                'status'           => OrderStatus::Pending->value,
                'subtotal'         => $subtotal,
                'delivery_fee'     => 0,
                'total'            => $subtotal,
                'note'             => $data['note'] ?? null,
            ]);

            // h. Create order items with price snapshots
            foreach ($itemsData as $item) {
                $order->items()->create($item);
            }

            // i. Create initial status log entry (from_status = null for initial pending)
            $order->statusLogs()->create([
                'from_status' => null,
                'to_status'   => OrderStatus::Pending->value,
                'actor_id'    => $userId,
                'actor_type'  => 'customer',
                'note'        => null,
            ]);

            // j. Return with eager-loaded relations
            return $order->load(['items.product', 'statusLogs']);
        });
    }

    /**
     * Transition an order to a new status, enforcing the state machine and logging the change.
     */
    public function transitionStatus(Order $order, OrderStatus $newStatus, int $actorId, string $actorType, ?string $note = null): Order
    {
        if (! $order->status->canTransitionTo($newStatus)) {
            abort(422, "Cannot transition order from '{$order->status->value}' to '{$newStatus->value}'.");
        }

        DB::transaction(function () use ($order, $newStatus, $actorId, $actorType, $note) {
            // Lock the order row to prevent concurrent transitions
            $order = Order::where('id', $order->id)->lockForUpdate()->first();

            $fromStatus = $order->status;

            $order->update(['status' => $newStatus->value]);

            $order->statusLogs()->create([
                'from_status' => $fromStatus->value,
                'to_status'   => $newStatus->value,
                'actor_id'    => $actorId,
                'actor_type'  => $actorType,
                'note'        => $note,
            ]);
        });

        return $order->fresh(['items.product', 'statusLogs']);
    }

    /**
     * Append/update a note on an order.
     */
    public function addNote(Order $order, string $note, int $actorId): Order
    {
        $order->update(['note' => $note]);

        return $order->fresh(['items.product', 'statusLogs']);
    }
}
