<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Mail\NewOrderAdmin;
use App\Mail\NewOrderCustomer;
use App\Mail\OrderCancelled;
use App\Mail\OrderConfirmed;
use App\Mail\OrderDelivered;
use App\Mail\OrderDispatched;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Atomically create an order with pessimistic locking, server-side pricing,
     * stock decrement, and duplicate detection.
     */
    public function createOrder(array $data, int $userId): Order
    {
        $order = DB::transaction(function () use ($data, $userId) {
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

            // c. Lock products with pessimistic locking (also eager-load default variant)
            $products = Product::whereIn('id', $productIds)
                ->where('is_active', true)
                ->with(['variants' => fn ($q) => $q->lockForUpdate()])
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // d. Validate stock and calculate subtotal
            $subtotal = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
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

                if (! $variant) {
                    throw ValidationException::withMessages([
                        'items' => ["No variant found for product '{$product->sku}'."],
                    ]);
                }

                // Stock is always on the variant
                if ($variant->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for '{$variant->sku}'. Available: {$variant->stock}, requested: {$quantity}."],
                    ]);
                }

                $unitPrice    = $variant->price ?? $product->price;
                $itemSubtotal = $unitPrice * $quantity;
                $subtotal    += $itemSubtotal;

                $itemsData[] = [
                    'product_id'  => $productId,
                    'variant_id'  => $variant->id,
                    'product_sku' => $variant->sku ?? $product->sku,
                    'unit_price'  => $unitPrice,
                    'quantity'    => $quantity,
                    'subtotal'    => $itemSubtotal,
                ];
            }

            // e. Decrement variant stock and sync product.stock_quantity
            foreach ($itemsData as $item) {
                Variant::where('id', $item['variant_id'])
                    ->decrement('stock', $item['quantity']);
                // Keep product.stock_quantity in sync (sum of variant stocks)
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
            return $order->load(['items.product', 'items.variant.attributeValues', 'statusLogs', 'user']);
        });

        // k. Send emails AFTER successful DB transaction
        if ($order->user && $order->user->email) {
            Mail::to($order->user->email)->send(new NewOrderCustomer($order));
        }

        // l. Notify all admin users about the new order
        $admins = User::role(['admin', 'global_admin'])->get();
        foreach ($admins as $admin) {
            if ($admin->email) {
                Mail::to($admin->email)->send(new NewOrderAdmin($order));
            }
        }

        return $order;
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

        $order = $order->fresh(['items.product', 'items.variant.attributeValues', 'statusLogs', 'user']);

        // Dispatch queued email to the customer AFTER successful DB transaction
        if ($order->user && $order->user->email) {
            $mail = match ($newStatus) {
                OrderStatus::Confirmed  => new OrderConfirmed($order),
                OrderStatus::Dispatched => new OrderDispatched($order),
                OrderStatus::Delivered  => new OrderDelivered($order),
                OrderStatus::Cancelled  => new OrderCancelled($order, $note),
                default                 => null,
            };

            if ($mail) {
                Mail::to($order->user->email)->send($mail);
            }
        }

        return $order;
    }

    /**
     * Append/update a note on an order.
     */
    public function addNote(Order $order, string $note, int $actorId): Order
    {
        $order->update(['note' => $note]);

        return $order->fresh(['items.product', 'items.variant.attributeValues', 'statusLogs']);
    }
}
