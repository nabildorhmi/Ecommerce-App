<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\NewOrderCustomer;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderPlacedCustomerEmail implements ShouldQueue
{
    public function handle(OrderPlaced $event): void
    {
        $order = Order::with(['user', 'items.product', 'items.variant.attributeValues.attribute'])->find($event->orderId);

        if ($order?->user?->email) {
            Mail::to($order->user->email)->send(new NewOrderCustomer($order));
        }
    }
}
