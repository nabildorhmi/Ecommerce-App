<?php

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderStatusChanged;
use App\Mail\OrderCancelled;
use App\Mail\OrderConfirmed;
use App\Mail\OrderDelivered;
use App\Mail\OrderDispatched;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusChangedEmail implements ShouldQueue
{
    public function handle(OrderStatusChanged $event): void
    {
        $order = Order::with(['user', 'items.product', 'items.variant.attributeValues.attribute'])->find($event->orderId);

        if (! $order?->user?->email) {
            return;
        }

        $mail = match ($event->newStatus) {
            OrderStatus::Confirmed  => new OrderConfirmed($order),
            OrderStatus::Dispatched => new OrderDispatched($order),
            OrderStatus::Delivered  => new OrderDelivered($order),
            OrderStatus::Cancelled  => new OrderCancelled($order, $event->note),
            default                 => null,
        };

        if ($mail) {
            Mail::to($order->user->email)->send($mail);
        }
    }
}
