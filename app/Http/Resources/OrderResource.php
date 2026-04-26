<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'order_number'        => $this->order_number,
            'phone'               => $this->phone,
            'city'                => $this->city,
            'status'              => $this->status->value,
            'status_label'        => $this->status->label(),
            'subtotal'            => $this->subtotal,
            'delivery_fee'        => $this->delivery_fee,
            'total'               => $this->total,
            'note'                => $this->note,
            'allowed_transitions' => array_map(
                fn ($s) => $s->value,
                $this->status->allowedTransitionsTo()
            ),
            'delivery_zone'       => $this->whenLoaded('deliveryZone', fn () =>
                $this->deliveryZone ? new DeliveryZoneResource($this->deliveryZone) : null
            ),
            'items'               => $this->whenLoaded('items', fn () =>
                OrderItemResource::collection($this->items)
            ),
            'status_logs'         => $this->whenLoaded('statusLogs', fn () =>
                OrderStatusLogResource::collection($this->statusLogs)
            ),
            'user'                => $this->whenLoaded('user', fn () => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
            ]),
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}
