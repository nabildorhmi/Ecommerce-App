<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending    = 'pending';
    case Confirmed  = 'confirmed';
    case Dispatched = 'dispatched';
    case Delivered  = 'delivered';
    case Cancelled  = 'cancelled';

    /**
     * Returns the allowed next states from the current state.
     */
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

    /**
     * Check whether this status can transition to the given target status.
     */
    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitionsTo(), true);
    }

    /**
     * Returns human-readable label in the requested locale (fr/en/ar).
     */
    public function label(string $locale = 'fr'): string
    {
        return match ($locale) {
            'en' => match ($this) {
                self::Pending    => 'Pending',
                self::Confirmed  => 'Confirmed',
                self::Dispatched => 'Dispatched',
                self::Delivered  => 'Delivered',
                self::Cancelled  => 'Cancelled',
            },
            'ar' => match ($this) {
                self::Pending    => 'قيد الانتظار',
                self::Confirmed  => 'مؤكد',
                self::Dispatched => 'تم الإرسال',
                self::Delivered  => 'تم التسليم',
                self::Cancelled  => 'ملغى',
            },
            default => match ($this) {
                self::Pending    => 'En attente',
                self::Confirmed  => 'Confirmée',
                self::Dispatched => 'Expédiée',
                self::Delivered  => 'Livrée',
                self::Cancelled  => 'Annulée',
            },
        };
    }
}
