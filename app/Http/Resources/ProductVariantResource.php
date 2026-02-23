<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'price_override' => $this->price_override,
            'stock_quantity' => $this->stock_quantity,
            'is_active' => $this->is_active,
            'values' => $this->whenLoaded('values', fn() =>
                $this->values->map(fn($v) => [
                    'id' => $v->id,
                    'variation_type_id' => $v->variation_type_id,
                    'variation_type_name' => $v->type?->name,
                    'value' => $v->value,
                ])
            ),
            'effective_price' => $this->price_override ?? $this->product->price,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
