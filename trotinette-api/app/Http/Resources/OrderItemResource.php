<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'product_id'    => $this->product_id,
            'variant_id'    => $this->variant_id,
            'product_sku'   => $this->product_sku,
            'unit_price'    => $this->unit_price,
            'quantity'      => $this->quantity,
            'subtotal'      => $this->subtotal,
            'product'       => $this->whenLoaded('product', fn () => [
                'id'   => $this->product->id,
                'name' => $this->product->name,
            ]),
            'variant_label' => $this->whenLoaded('variant', fn () =>
                $this->variant?->attributeValues
                    ->sortBy(fn ($av) => $av->attribute?->name ?? '')
                    ->map(fn ($av) => $av->value)
                    ->implode(' / ')
                    ?: null
            ),
        ];
    }
}
