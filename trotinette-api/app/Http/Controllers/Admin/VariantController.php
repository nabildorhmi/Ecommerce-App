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

            $variant->attributeValues()->sync($request->input('attribute_value_ids'));

            $attributeIds = \App\Models\AttributeValue::whereIn('id', $request->input('attribute_value_ids'))
                ->pluck('attribute_id')
                ->unique();
            $product->attributes()->syncWithoutDetaching($attributeIds);

            return $variant->load(['attributeValues.attribute', 'product']);
        });

        return new VariantResource($variant);
    }

    public function destroy(Product $product, Variant $variant)
    {
        $variant->delete();
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
