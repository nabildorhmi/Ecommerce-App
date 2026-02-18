<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryZoneResource;
use App\Models\DeliveryZone;
use Illuminate\Http\Resources\Json\ResourceCollection;

class DeliveryZoneController extends Controller
{
    /**
     * Return active delivery zones ordered by city name.
     * Used by the checkout flow (DLVR-03) for city selection.
     */
    public function index(): ResourceCollection
    {
        $zones = DeliveryZone::where('is_active', true)
            ->orderBy('city')
            ->get();

        return DeliveryZoneResource::collection($zones);
    }
}
