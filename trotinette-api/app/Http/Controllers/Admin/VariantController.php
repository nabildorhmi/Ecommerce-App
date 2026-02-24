<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GenerateVariantsRequest;
use App\Http\Requests\Admin\StoreVariantRequest;
use App\Http\Requests\Admin\UpdateVariantRequest;
use App\Http\Resources\VariantResource;
use App\Models\Product;
use App\Models\Variant;
use App\Services\VariantGeneratorService;
use Illuminate\Support\Facades\DB;

class VariantController extends Controller
{
    public function __construct(private readonly VariantGeneratorService $generator)
    {
    }

    public function index(Product $product)
    {
        $variants = $product->variants()->with(['attributeValues.attribute', 'product'])->get();
        return VariantResource::collection($variants);
    }

    public function store(StoreVariantRequest $request, Product $product)
    {
        $variant = DB::transaction(function () use ($request, $product) {
            $variant = Variant::create([
                'product_id' => $product->id,
                'sku'        => $request->input('sku'),
                'price'      => $request->input('price'),
                'stock'      => $request->input('stock'),
                'is_active'  => $request->input('is_active', true),
            ]);

            $variant->attributeValues()->sync($request->input('attribute_value_ids'));

            // Sync product_attributes for any new attribute types introduced
            $attributeIds = \App\Models\AttributeValue::whereIn('id', $request->input('attribute_value_ids'))
                ->pluck('attribute_id')
                ->unique();
            $product->attributes()->syncWithoutDetaching($attributeIds);

            // Deactivate bare default variant when real attribute variants are added
            $product->variants()
                ->where('is_default', true)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            return $variant->load(['attributeValues.attribute', 'product']);
        });

        return new VariantResource($variant);
    }

    public function update(UpdateVariantRequest $request, Product $product, Variant $variant)
    {
        $variant = DB::transaction(function () use ($request, $product, $variant) {
            $variant->update([
                'sku'       => $request->input('sku'),
                'price'     => $request->input('price'),
                'stock'     => $request->input('stock'),
                'is_active' => $request->input('is_active', true),
            ]);

            // Only sync attribute values if provided (default variants have none)
            if ($request->has('attribute_value_ids') && !empty($request->input('attribute_value_ids'))) {
                $variant->attributeValues()->sync($request->input('attribute_value_ids'));

                $attributeIds = \App\Models\AttributeValue::whereIn('id', $request->input('attribute_value_ids'))
                    ->pluck('attribute_id')
                    ->unique();
                $product->attributes()->syncWithoutDetaching($attributeIds);
            }

            // Sync default variant stock/price back to product
            if ($variant->is_default) {
                $productUpdates = ['stock_quantity' => $variant->stock];
                if ($variant->price !== null) {
                    $productUpdates['price'] = $variant->price;
                }
                $product->update($productUpdates);
            }

            return $variant->load(['attributeValues.attribute', 'product']);
        });

        return new VariantResource($variant);
    }

    public function destroy(Product $product, Variant $variant)
    {
        if ($variant->is_default) {
            return response()->json([
                'message' => 'Impossible de supprimer la variante par défaut / Cannot delete the default variant.',
            ], 422);
        }

        $variant->delete();

        // If no non-default variants remain, re-activate the default variant
        $remainingAttributeVariants = $product->variants()
            ->where('is_default', false)
            ->count();

        if ($remainingAttributeVariants === 0) {
            $product->variants()
                ->where('is_default', true)
                ->update(['is_active' => true]);
        }

        return response()->json(['message' => 'Variante supprimée / Variant deleted.']);
    }

    /**
     * Auto-generate variants from a Cartesian product of selected attribute values.
     * Skips existing combos by default. Auto-generates SKUs.
     */
    public function generate(GenerateVariantsRequest $request, Product $product)
    {
        $created = $this->generator->generate(
            product: $product,
            attributeValueMap: $request->input('attribute_values'),
            defaultPrice: $request->input('default_price'),
            defaultStock: $request->input('default_stock', 0),
            skipExisting: $request->boolean('skip_existing', true),
        );

        return response()->json([
            'message' => $created->count() . ' variante(s) créée(s) / variant(s) created.',
            'created' => $created->count(),
            'data'    => VariantResource::collection($created),
        ], 201);
    }
}
