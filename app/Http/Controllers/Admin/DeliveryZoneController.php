<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDeliveryZoneRequest;
use App\Http\Requests\Admin\UpdateDeliveryZoneRequest;
use App\Http\Resources\DeliveryZoneResource;
use App\Models\DeliveryZone;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class DeliveryZoneController extends Controller
{
    public function index(): ResourceCollection
    {
        $zones = DeliveryZone::orderBy('city')->paginate(50);

        return DeliveryZoneResource::collection($zones);
    }

    public function store(StoreDeliveryZoneRequest $request): \Illuminate\Http\JsonResponse
    {
        $zone = DeliveryZone::create($request->validated());

        return (new DeliveryZoneResource($zone))
            ->response()
            ->setStatusCode(201);
    }

    public function show(DeliveryZone $deliveryZone): DeliveryZoneResource
    {
        return new DeliveryZoneResource($deliveryZone);
    }

    public function update(UpdateDeliveryZoneRequest $request, DeliveryZone $deliveryZone): DeliveryZoneResource
    {
        $deliveryZone->update($request->validated());

        return new DeliveryZoneResource($deliveryZone->fresh());
    }

    public function destroy(DeliveryZone $deliveryZone): Response
    {
        $deliveryZone->delete();

        return response()->noContent();
    }
}
