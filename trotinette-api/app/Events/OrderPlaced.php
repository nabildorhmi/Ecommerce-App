<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class OrderPlaced
{
    use Dispatchable;

    public function __construct(
        public readonly int $orderId
    ) {}
}
