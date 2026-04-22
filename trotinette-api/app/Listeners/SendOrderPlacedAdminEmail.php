<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\NewOrderAdmin;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderPlacedAdminEmail implements ShouldQueue
{
    public function handle(OrderPlaced $event): void
    {
        $order = Order::with(['user', 'items.product', 'items.variant.attributeValues.attribute'])->find($event->orderId);

        if (! $order) {
            return;
        }

        $admins = User::role(['admin', 'global_admin'])->get();

        foreach ($admins as $admin) {
            if ($admin->email) {
                Mail::to($admin->email)->send(new NewOrderAdmin($order));
            }
        }
    }
}
