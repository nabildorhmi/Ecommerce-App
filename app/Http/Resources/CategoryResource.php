<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $translation = $this->translations->first();

        return [
            'id'         => $this->id,
            'slug'       => $this->slug,
            'is_active'  => $this->is_active,
            'name'       => $translation?->name,
            'created_at' => $this->created_at,
        ];
    }
}
