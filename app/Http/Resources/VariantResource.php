<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'product_id'     => $this->product_id,
            'sku'            => $this->sku,
            'price'          => $this->price,
            'promo_price'    => $this->promo_price,
            'stock'          => $this->stock,
            'is_active'      => $this->is_active,
            'is_default'     => (bool) $this->is_default,
            'is_on_sale'     => $this->is_on_sale,
            'status'         => $this->is_active ? 'active' : 'inactive',
            'attribute_values' => $this->whenLoaded('attributeValues', fn () =>
                $this->attributeValues->map(fn ($av) => [
                    'id'             => $av->id,
                    'attribute_id'   => $av->attribute_id,
                    'attribute_name' => $av->attribute?->name,
                    'attribute_slug' => $av->attribute?->slug,
                    'value'          => $av->value,
                    'slug'           => $av->slug,
                ])
            ),
            'effective_price'       => $this->price ?? $this->product?->price,
            'effective_promo_price' => $this->effective_promo_price,
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
