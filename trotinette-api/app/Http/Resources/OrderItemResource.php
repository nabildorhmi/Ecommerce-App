<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Get product name from translation in the current locale
        $productName = null;
        if ($this->relationLoaded('product') && $this->product) {
            $locale      = $request->header('Accept-Language', 'fr');
            $translation = $this->product->translations
                ->where('locale', $locale)
                ->first()
                ?? $this->product->translations->first();
            $productName = $translation?->name;
        }

        return [
            'id'          => $this->id,
            'product_id'  => $this->product_id,
            'product_sku' => $this->product_sku,
            'unit_price'  => $this->unit_price,
            'quantity'    => $this->quantity,
            'subtotal'    => $this->subtotal,
            'product'     => $this->whenLoaded('product', fn () => [
                'id'   => $this->product->id,
                'name' => $productName,
            ]),
        ];
    }
}
