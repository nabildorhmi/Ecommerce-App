<?php

namespace App\Events;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Events\Dispatchable;

class OrderStatusChanged
{
    use Dispatchable;

    public function __construct(
        public readonly int $orderId,
        public readonly OrderStatus $newStatus,
        public readonly ?string $note = null
    ) {}
}
