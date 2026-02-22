<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending    = 'pending';
    case Confirmed  = 'confirmed';
    case Dispatched = 'dispatched';
    case Delivered  = 'delivered';
    case Cancelled  = 'cancelled';

    public function allowedTransitionsTo(): array
    {
        return match ($this) {
            self::Pending    => [self::Confirmed, self::Cancelled],
            self::Confirmed  => [self::Dispatched, self::Cancelled],
            self::Dispatched => [self::Delivered],
            self::Delivered  => [],
            self::Cancelled  => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitionsTo(), true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Pending    => 'En attente',
            self::Confirmed  => 'Confirmée',
            self::Dispatched => 'Expédiée',
            self::Delivered  => 'Livrée',
            self::Cancelled  => 'Annulée',
        };
    }
}
