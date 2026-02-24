<?php

namespace App\Services;

use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VariantGeneratorService
{
    /**
     * Generate all Cartesian-product variants for a product from selected attribute values.
     *
     * @param  Product  $product
     * @param  array<int, int[]>  $attributeValueMap  [attribute_id => [value_id, value_id, ...], ...]
     * @param  int|null  $defaultPrice   Price in centimes (null = use product base price)
     * @param  int       $defaultStock   Default stock for each generated variant
     * @param  bool      $skipExisting   Skip combinations that already exist as variants
     * @return Collection<int, Variant>  The newly created variants
     */
    public function generate(
        Product $product,
        array $attributeValueMap,
        ?int $defaultPrice = null,
        int $defaultStock = 0,
        bool $skipExisting = true,
    ): Collection {
        // Load the attribute values we'll work with, keyed by id
        $allValueIds = collect($attributeValueMap)->flatten()->unique()->values()->all();
        $attributeValues = AttributeValue::with('attribute')
            ->whereIn('id', $allValueIds)
            ->get()
            ->keyBy('id');

        // Build arrays per attribute:  [[val_id, val_id], [val_id, val_id], ...]
        $groups = [];
        foreach ($attributeValueMap as $attrId => $valueIds) {
            $validIds = collect($valueIds)->filter(fn ($id) => $attributeValues->has($id))->values()->all();
            if (count($validIds) > 0) {
                $groups[] = $validIds;
            }
        }

        if (count($groups) === 0) {
            return collect();
        }

        // Cartesian product
        $combinations = $this->cartesian($groups);

        // Get existing variant combos (sorted value-id sets) to skip duplicates
        $existingCombos = collect();
        if ($skipExisting) {
            $existingCombos = $product->variants()
                ->with('attributeValues')
                ->get()
                ->map(fn (Variant $v) => $v->attributeValues->pluck('id')->sort()->values()->implode('-'));
        }

        $created = collect();

        DB::transaction(function () use (
            $product,
            $combinations,
            $attributeValues,
            $defaultPrice,
            $defaultStock,
            $existingCombos,
            &$created,
        ) {
            // Track attribute IDs to sync product_attributes
            $allAttributeIds = collect();

            foreach ($combinations as $combo) {
                $comboKey = collect($combo)->sort()->values()->implode('-');

                // Skip if this exact combination already exists
                if ($existingCombos->contains($comboKey)) {
                    continue;
                }

                // Auto-generate SKU: PRODUCT-SKU-slug1-slug2
                $sku = $this->generateSku($product, $combo, $attributeValues);

                $variant = Variant::create([
                    'product_id' => $product->id,
                    'sku'        => $sku,
                    'price'      => $defaultPrice,
                    'stock'      => $defaultStock,
                    'is_active'  => true,
                ]);

                $variant->attributeValues()->sync($combo);

                // Collect attribute IDs
                foreach ($combo as $valueId) {
                    $av = $attributeValues->get($valueId);
                    if ($av) {
                        $allAttributeIds->push($av->attribute_id);
                    }
                }

                $created->push($variant->load('attributeValues.attribute'));
            }

            // Sync product_attributes for any attribute types used
            if ($allAttributeIds->isNotEmpty()) {
                $product->attributes()->syncWithoutDetaching($allAttributeIds->unique()->all());
            }

            // Deactivate the bare default variant now that real attribute variants exist.
            // Keep is_default=true so ProductResource still recognises it as the base.
            $defaultVariant = $product->variants()
                ->where('is_default', true)
                ->whereDoesntHave('attributeValues')
                ->first();

            if ($defaultVariant && $created->isNotEmpty()) {
                // Transfer stock from default to the first generated variant if needed
                if ($defaultVariant->stock > 0 && $created->first()->stock === 0) {
                    $created->first()->update(['stock' => $defaultVariant->stock]);
                }
                // Deactivate default variant but keep is_default flag
                $defaultVariant->update(['is_active' => false]);
            }
        });

        return $created;
    }

    /**
     * Generate a unique SKU for a variant combination.
     *
     * Format: {PRODUCT_SKU}-{value-slug-1}-{value-slug-2}
     * Falls back to product ID if no product SKU.
     */
    private function generateSku(Product $product, array $valueIds, Collection $attributeValues): string
    {
        $base = $product->sku ?: ('P' . $product->id);

        $suffixes = collect($valueIds)
            ->map(fn ($id) => $attributeValues->get($id)?->slug ?? Str::slug((string) $id))
            ->implode('-');

        $sku = Str::upper($base . '-' . $suffixes);

        // Ensure uniqueness — append counter if needed
        $original = $sku;
        $counter = 1;
        while (Variant::where('sku', $sku)->exists()) {
            $sku = $original . '-' . $counter;
            $counter++;
        }

        return $sku;
    }

    /**
     * Compute the Cartesian product of multiple arrays.
     *
     * @param  array<int, int[]>  $groups
     * @return array<int, int[]>  Each element is one combination of value IDs
     */
    private function cartesian(array $groups): array
    {
        $result = [[]];

        foreach ($groups as $group) {
            $newResult = [];
            foreach ($result as $existing) {
                foreach ($group as $item) {
                    $newResult[] = array_merge($existing, [$item]);
                }
            }
            $result = $newResult;
        }

        return $result;
    }
}
