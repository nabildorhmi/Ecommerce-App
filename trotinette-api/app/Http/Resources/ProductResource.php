<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'sku'            => $this->sku,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'price'          => $this->price,
            'stock_quantity' => $this->stock_quantity,
            'in_stock'       => $this->stock_quantity > 0,
            'attributes'     => $this->attributes,
            'is_active'      => $this->is_active,
            'is_featured'    => $this->is_featured,
            'category'       => $this->whenLoaded('category', fn () =>
                new CategoryResource($this->category)
            ),
            'images'         => $this->whenLoaded('media', fn () =>
                $this->getMedia('images')->map(fn ($media) => [
                    'id'        => $media->id,
                    'thumbnail' => $media->getUrl('thumbnail'),
                    'card'      => $media->getUrl('card'),
                    'full'      => $media->getUrl('full'),
                    'original'  => $media->original_url,
                ])
            ),
            'created_at'     => $this->created_at,
        ];
    }
}
