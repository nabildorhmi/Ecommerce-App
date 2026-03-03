<?php

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderStatusChanged;
use App\Mail\OrderCancelled;
use App\Mail\OrderConfirmed;
use App\Mail\OrderDelivered;
use App\Mail\OrderDispatched;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusChangedEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Handle the event.
     */
    public function handle(OrderStatusChanged $event): void
    {
        if (! $event->order->user || ! $event->order->user->email) {
            return;
        }

        $mail = match ($event->newStatus) {
            OrderStatus::Confirmed  => new OrderConfirmed($event->order),
            OrderStatus::Dispatched => new OrderDispatched($event->order),
            OrderStatus::Delivered  => new OrderDelivered($event->order),
            OrderStatus::Cancelled  => new OrderCancelled($event->order, $event->note),
            default                 => null,
        };

        if ($mail) {
            Mail::to($event->order->user->email)->send($mail);
        }
    }
}
