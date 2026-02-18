<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderStatusLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->header('Accept-Language', 'fr');

        return [
            'id'                => $this->id,
            'from_status'       => $this->from_status?->value,
            'to_status'         => $this->to_status->value,
            'from_status_label' => $this->from_status?->label($locale),
            'to_status_label'   => $this->to_status->label($locale),
            'actor_id'          => $this->actor_id,
            'actor_type'        => $this->actor_type,
            'note'              => $this->note,
            'created_at'        => $this->created_at,
        ];
    }
}
