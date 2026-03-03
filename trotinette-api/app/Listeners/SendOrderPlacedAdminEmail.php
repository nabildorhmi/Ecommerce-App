<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\NewOrderAdmin;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderPlacedAdminEmail implements ShouldQueue
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
        $admins = User::role(['admin', 'global_admin'])->get();

        foreach ($admins as $admin) {
            if ($admin->email) {
                Mail::to($admin->email)->send(new NewOrderAdmin($event->order));
            }
        }
    }
}
