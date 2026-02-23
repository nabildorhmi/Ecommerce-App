<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductVariantRequest;
use App\Http\Requests\Admin\UpdateProductVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class ProductVariantController extends Controller
{
    public function index(Product $product)
    {
        $variants = $product->variants()->with(['attributeValues.attribute', 'product'])->get();
        return ProductVariantResource::collection($variants);
    }

    public function store(StoreProductVariantRequest $request, Product $product)
    {
        $variant = DB::transaction(function () use ($request, $product) {
            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $request->input('sku'),
                'price_override' => $request->input('price_override'),
                'stock_quantity' => $request->input('stock_quantity'),
                'is_active' => $request->input('is_active', true),
            ]);

            $variant->values()->sync($request->input('variation_value_ids'));

            return $variant->load(['values.type', 'product']);
        });

        return new ProductVariantResource($variant);
    }

    public function update(UpdateProductVariantRequest $request, Product $product, ProductVariant $variant)
    {
        $variant = DB::transaction(function () use ($request, $variant) {
            $variant->update([
                'sku' => $request->input('sku'),
                'price_override' => $request->input('price_override'),
                'stock_quantity' => $request->input('stock_quantity'),
                'is_active' => $request->input('is_active', true),
            ]);

            $variant->values()->sync($request->input('variation_value_ids'));

            return $variant->load(['values.type', 'product']);
        });

        return new ProductVariantResource($variant);
    }

    public function destroy(Product $product, ProductVariant $variant)
    {
        $variant->delete();
        return response()->json(['message' => 'Variante supprimée']);
    }
}
