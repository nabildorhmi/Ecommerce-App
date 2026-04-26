<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderStatusLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'from_status'       => $this->from_status?->value,
            'to_status'         => $this->to_status->value,
            'from_status_label' => $this->from_status?->label(),
            'to_status_label'   => $this->to_status->label(),
            'actor_id'          => $this->actor_id,
            'actor_type'        => $this->actor_type,
            'note'              => $this->note,
            'created_at'        => $this->created_at,
        ];
    }
}
