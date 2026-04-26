<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariationTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'values' => $this->whenLoaded('values', fn() =>
                $this->values->map(fn($v) => [
                    'id' => $v->id,
                    'value' => $v->value,
                ])
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
