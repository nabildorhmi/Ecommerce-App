<?php

namespace Database\Seeders;

use App\Models\DeliveryZone;
use Illuminate\Database\Seeder;

class DeliveryZoneSeeder extends Seeder
{
    /**
     * DLVR-02: Seed major Moroccan cities with delivery fees.
     * city_ar is null — Arabic removed in Phase 1.
     * Fees are in centimes (e.g., 3000 = 30 MAD).
     */
    public function run(): void
    {
        $zones = [
            ['city' => 'Casablanca', 'city_ar' => null, 'fee' => 3000, 'is_active' => true],
            ['city' => 'Rabat',      'city_ar' => null, 'fee' => 3500, 'is_active' => true],
            ['city' => 'Marrakech',  'city_ar' => null, 'fee' => 4000, 'is_active' => true],
            ['city' => 'Fes',        'city_ar' => null, 'fee' => 4000, 'is_active' => true],
            ['city' => 'Tangier',    'city_ar' => null, 'fee' => 4500, 'is_active' => true],
            ['city' => 'Agadir',     'city_ar' => null, 'fee' => 4500, 'is_active' => true],
            ['city' => 'Meknes',     'city_ar' => null, 'fee' => 4000, 'is_active' => true],
            ['city' => 'Oujda',      'city_ar' => null, 'fee' => 5000, 'is_active' => true],
            ['city' => 'Kenitra',    'city_ar' => null, 'fee' => 3500, 'is_active' => true],
            ['city' => 'Tetouan',    'city_ar' => null, 'fee' => 4500, 'is_active' => true],
        ];

        foreach ($zones as $zone) {
            DeliveryZone::firstOrCreate(
                ['city' => $zone['city']],
                $zone
            );
        }
    }
}
