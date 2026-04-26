<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;

class ProductService
{
    /**
     * Calculate promo_price from base price and discount percentage.
     */
    private function computePromoPrice(int $price, ?int $discountPercentage): ?int
    {
        if ($discountPercentage === null || $discountPercentage <= 0 || $discountPercentage > 100) {
            return null;
        }

        return (int) round($price * (1 - $discountPercentage / 100));
    }

    public function createProduct(array $data, Request $request): Product
    {
        $price = $data['price'];
        $discountPercentage = $data['discount_percentage'] ?? null;
        $promoPrice = $this->computePromoPrice($price, $discountPercentage);

        $product = Product::create([
            'sku'                 => $data['sku'],
            'name'                => $data['name'],
            'slug'                => $data['slug'],
            'description'         => $data['description'] ?? null,
            'price'               => $price,
            'promo_price'         => $promoPrice,
            'discount_percentage' => $discountPercentage,
            'stock_quantity'      => $data['stock_quantity'] ?? 0,
            'attributes'          => $data['attributes'] ?? [],
            'category_id'         => $data['category_id'],
            'is_active'           => $data['is_active'] ?? true,
            'is_featured'         => $data['is_featured'] ?? false,
            'is_new'              => $data['is_new'] ?? false,
        ]);

        // Auto-create default variant (Shopify-style: every product has at least one variant)
        $product->variants()->create([
            'sku'        => $data['sku'],
            'price'      => $price,
            'stock'      => $data['stock_quantity'] ?? 0,
            'is_active'  => true,
            'is_default' => true,
        ]);

        // Upload images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $product->addMedia($image)
                    ->toMediaCollection('images');
            }
        }

        return $product->load(['media', 'category', 'variants.attributeValues.attribute']);
    }

    public function updateProduct(Product $product, array $data, Request $request): Product
    {
        $product->update(array_filter([
            'sku'            => $data['sku'] ?? null,
            'name'           => $data['name'] ?? null,
            'slug'           => $data['slug'] ?? null,
            'description'    => array_key_exists('description', $data) ? $data['description'] : null,
            'price'          => $data['price'] ?? null,
            'stock_quantity' => $data['stock_quantity'] ?? null,
            'attributes'     => $data['attributes'] ?? null,
            'category_id'    => $data['category_id'] ?? null,
            'is_active'      => $data['is_active'] ?? null,
            'is_featured'    => $data['is_featured'] ?? null,
            'is_new'         => $data['is_new'] ?? null,
        ], fn ($v) => $v !== null));

        // Handle discount_percentage (replaces promo_price direct input)
        if (array_key_exists('discount_percentage', $data)) {
            $discountPercentage = $data['discount_percentage'];
            $price = $data['price'] ?? $product->price;
            $promoPrice = $this->computePromoPrice($price, $discountPercentage);

            $product->update([
                'discount_percentage' => $discountPercentage,
                'promo_price'         => $promoPrice,
            ]);
        } elseif (isset($data['price']) && $product->discount_percentage) {
            // Price changed but discount stays — recompute promo_price
            $promoPrice = $this->computePromoPrice($data['price'], $product->discount_percentage);
            $product->update(['promo_price' => $promoPrice]);
        }

        // Sync default variant stock & price with product-level values
        $defaultVariant = $product->variants()->where('is_default', true)->first();
        if ($defaultVariant) {
            $updates = [];
            if (isset($data['stock_quantity'])) {
                $updates['stock'] = $data['stock_quantity'];
            }
            if (isset($data['price'])) {
                $updates['price'] = $data['price'];
            }
            if (isset($data['sku'])) {
                if ($defaultVariant->sku === $product->getOriginal('sku') || $defaultVariant->sku === $data['sku']) {
                    $updates['sku'] = $data['sku'];
                }
            }
            if (! empty($updates)) {
                $defaultVariant->update($updates);
            }
        } else {
            $product->variants()->create([
                'sku'        => $product->sku,
                'price'      => $product->price,
                'stock'      => $product->stock_quantity ?? 0,
                'is_active'  => true,
                'is_default' => true,
            ]);
        }

        // Delete specific images if requested
        if (!empty($data['delete_images'])) {
            foreach ($data['delete_images'] as $mediaId) {
                $media = $product->media()->find($mediaId);
                if ($media) {
                    $media->delete();
                }
            }
        }

        // Upload new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $product->addMedia($image)
                    ->toMediaCollection('images');
            }
        }

        return $product->load(['media', 'category', 'variants.attributeValues.attribute']);
    }

    public function deleteProduct(Product $product): void
    {
        $product->delete();
    }
}
