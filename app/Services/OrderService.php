<?php

namespace App\Services;

use App\Actions\Order\CalculateOrderTotalAction;
use App\Actions\Order\CheckDuplicateOrderAction;
use App\Actions\Order\DecrementStockAction;
use App\Actions\Order\ValidateStockAction;
use App\DTOs\CreateOrderDTO;
use App\Enums\OrderStatus;
use App\Mail\NewOrderAdmin;
use App\Mail\NewOrderCustomer;
use App\Mail\OrderCancelled;
use App\Mail\OrderConfirmed;
use App\Mail\OrderDelivered;
use App\Mail\OrderDispatched;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderService
{
    public function __construct(
        private readonly CheckDuplicateOrderAction $checkDuplicate,
        private readonly ValidateStockAction $validateStock,
        private readonly CalculateOrderTotalAction $calculateTotal,
        private readonly DecrementStockAction $decrementStock,
    ) {}

    /**
     * Atomically create an order with pessimistic locking, server-side pricing,
     * stock decrement, and duplicate detection.
     */
    public function createOrder(CreateOrderDTO $dto, int $userId): Order
    {
        $order = DB::transaction(function () use ($dto, $userId) {
            // a. Check for duplicate orders
            $this->checkDuplicate->execute($dto->phone, $dto->productIds());

            // b. Lock products and validate stock
            $products = $this->validateStock->execute($dto->productIds());
            $itemsData = $this->validateStock->validateItems($dto->items, $products);

            // c. Calculate totals
            $totals = $this->calculateTotal->execute($itemsData);

            // d. Decrement stock
            $this->decrementStock->execute($itemsData);

            // e. Generate order number
            $orderNumber = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            // f. Create order
            $order = Order::create([
                'user_id'          => $userId,
                'delivery_zone_id' => null,
                'city'             => $dto->city,
                'order_number'     => $orderNumber,
                'phone'            => $dto->phone,
                'status'           => OrderStatus::Pending->value,
                'subtotal'         => $totals['subtotal'],
                'delivery_fee'     => $totals['delivery_fee'],
                'total'            => $totals['total'],
                'note'             => $dto->note,
            ]);

            // g. Create order items
            foreach ($itemsData as $item) {
                $order->items()->create($item);
            }

            // h. Log initial status
            $order->statusLogs()->create([
                'from_status' => null,
                'to_status'   => OrderStatus::Pending->value,
                'actor_id'    => $userId,
                'actor_type'  => 'customer',
                'note'        => null,
            ]);

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
