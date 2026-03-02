<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Compute stock from variants (sum of active variants' stock)
        $computedStock = $this->relationLoaded('variants')
            ? $this->variants->where('is_active', true)->sum('stock')
            : $this->computed_stock;

        // Filter out the default variant from the variant list shown to customers
        // (default variant = no attribute values, just holds base stock/price)
        $displayVariants = $this->whenLoaded('variants', function () {
            return $this->variants
                ->where('is_active', true)
                ->filter(fn ($v) => ! $v->is_default)
                ->map(function ($variant) {
                    $vPrice      = $variant->price ?? $this->price;
                    $vPromoPrice = $variant->promo_price ?? $this->promo_price;
                    $vIsOnSale   = $vPromoPrice !== null && $vPromoPrice < $vPrice;
                    return [
                        'id'               => $variant->id,
                        'sku'              => $variant->sku,
                        'price'            => $vPrice,
                        'promo_price'      => $vIsOnSale ? $vPromoPrice : null,
                        'is_on_sale'       => $vIsOnSale,
                        'stock'            => $variant->stock,
                        'attribute_values' => $variant->attributeValues->map(fn ($av) => [
                            'attribute' => $av->attribute?->name,
                            'value'     => $av->value,
                        ]),
                    ];
                })
                ->values();
        });

        // Default variant info (always present)
        $defaultVariant = $this->whenLoaded('variants', function () {
            $dv = $this->variants->firstWhere('is_default', true);
            if (! $dv) return null;
            $dvPrice      = $dv->price ?? $this->price;
            // Fall back to product-level promo_price when the variant has none set
            $dvPromoPrice = $dv->promo_price ?? $this->promo_price;
            $dvIsOnSale   = $dvPromoPrice !== null && $dvPromoPrice < $dvPrice;
            return [
                'id'          => $dv->id,
                'sku'         => $dv->sku,
                'price'       => $dvPrice,
                'promo_price' => $dvIsOnSale ? $dvPromoPrice : null,
                'is_on_sale'  => $dvIsOnSale,
                'stock'       => $dv->stock,
            ];
        });

        // Product-level is_on_sale: true if default variant is effectively on sale
        $isOnSale = $this->whenLoaded('variants', function () {
            $dv = $this->variants->firstWhere('is_default', true);
            if (! $dv) return false;
            $dvPrice      = $dv->price ?? $this->price;
            $dvPromoPrice = $dv->promo_price ?? $this->promo_price;
            return $dvPromoPrice !== null && $dvPromoPrice < $dvPrice;
        }, false);

        return [
            'id'              => $this->id,
            'sku'             => $this->sku,
            'name'            => $this->name,
            'slug'            => $this->slug,
            'description'     => $this->description,
            'price'           => $this->price,
            'stock_quantity'  => $computedStock,
            'in_stock'        => $computedStock > 0,
            'attributes'      => $this->attributes,
            'is_active'       => $this->is_active,
            'is_featured'     => $this->is_featured,
            'promo_price'     => $this->promo_price,
            'is_new'          => (bool) $this->is_new,
            'is_on_sale'      => $isOnSale,
            'category'        => $this->whenLoaded('category', fn () =>
                new CategoryResource($this->category)
            ),
            'images'          => $this->whenLoaded('media', fn () =>
                $this->getMedia('images')->map(fn ($media) => [
                    'id'        => $media->id,
                    'thumbnail' => $media->getUrl('thumbnail'),
                    'card'      => $media->getUrl('card'),
                    'full'      => $media->getUrl('full'),
                    'original'  => $media->original_url,
                ])
            ),
            'default_variant' => $defaultVariant,
            'variants'        => $displayVariants,
            'created_at'      => $this->created_at,
        ];
    }
}
