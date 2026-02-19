<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductService
{
    public function createProduct(array $data, Request $request): Product
    {
        $product = Product::create([
            'sku'            => $data['sku'],
            'price'          => $data['price'],
            'stock_quantity' => $data['stock_quantity'],
            'attributes'     => $data['attributes'] ?? [],
            'category_id'    => $data['category_id'],
            'is_active'      => $data['is_active'] ?? true,
            'is_featured'    => $data['is_featured'] ?? false,
        ]);

        // Store translations for each provided locale
        foreach ($data['translations'] as $locale => $translation) {
            $product->translations()->create([
                'locale'      => $locale,
                'name'        => $translation['name'],
                'description' => $translation['description'] ?? null,
                'slug'        => $translation['slug'],
            ]);
        }

        // Upload images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $product->addMedia($image)
                    ->toMediaCollection('images');
            }
        }

        return $product->load(['translations', 'media', 'category']);
    }

    public function updateProduct(Product $product, array $data, Request $request): Product
    {
        $product->update(array_filter([
            'sku'            => $data['sku'] ?? null,
            'price'          => $data['price'] ?? null,
            'stock_quantity' => $data['stock_quantity'] ?? null,
            'attributes'     => $data['attributes'] ?? null,
            'category_id'    => $data['category_id'] ?? null,
            'is_active'      => $data['is_active'] ?? null,
            'is_featured'    => $data['is_featured'] ?? null,
        ], fn ($v) => $v !== null));

        // Sync translations if provided
        if (isset($data['translations'])) {
            foreach ($data['translations'] as $locale => $translation) {
                $product->translations()->updateOrCreate(
                    ['locale' => $locale],
                    [
                        'name'        => $translation['name'],
                        'description' => $translation['description'] ?? null,
                        'slug'        => $translation['slug'],
                    ]
                );
            }
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

        return $product->load(['translations', 'media', 'category']);
    }

    public function deleteProduct(Product $product): void
    {
        // Media cascade handled by medialibrary on model deletion
        $product->delete();
    }
}
