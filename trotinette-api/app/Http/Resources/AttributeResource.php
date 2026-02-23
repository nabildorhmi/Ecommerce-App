<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttributeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'slug'       => $this->slug,
            'values'     => $this->whenLoaded('values', fn () =>
                $this->values->map(fn ($v) => [
                    'id'    => $v->id,
                    'value' => $v->value,
                    'slug'  => $v->slug,
                ])
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
