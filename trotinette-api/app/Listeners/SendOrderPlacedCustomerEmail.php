<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\NewOrderCustomer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderPlacedCustomerEmail implements ShouldQueue
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
    public function handle(OrderPlaced $event): void
    {
        if ($event->order->user && $event->order->user->email) {
            Mail::to($event->order->user->email)->send(new NewOrderCustomer($event->order));
        }
    }
}
