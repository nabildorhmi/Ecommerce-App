<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Shopify-style: every product always has at least one variant.
 * 1. Add `is_default` boolean to variants.
 * 2. Create a default variant for every product that has none.
 * 3. For products that already have variants, mark the first as default.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Add is_default column
        Schema::table('variants', function (Blueprint $table) {
            $table->boolean('is_default')->default(false)->after('is_active');
        });

        // 2. Create default variants for products that have no variant yet
        $products = DB::table('products')
            ->leftJoin('variants', 'products.id', '=', 'variants.product_id')
            ->whereNull('variants.id')
            ->select('products.id', 'products.sku', 'products.price', 'products.stock_quantity')
            ->get();

        foreach ($products as $product) {
            DB::table('variants')->insert([
                'product_id' => $product->id,
                'sku'        => $product->sku,
                'price'      => $product->price,
                'stock'      => $product->stock_quantity ?? 0,
                'is_active'  => true,
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. For products that already have variants but none is marked default,
        //    mark the first one as default
        $productsWithVariants = DB::table('products')
            ->join('variants', 'products.id', '=', 'variants.product_id')
            ->whereNotIn('products.id', $products->pluck('id')->toArray())
            ->select('products.id')
            ->distinct()
            ->pluck('products.id');

        foreach ($productsWithVariants as $productId) {
            $firstVariant = DB::table('variants')
                ->where('product_id', $productId)
                ->orderBy('id')
                ->first();

            if ($firstVariant) {
                DB::table('variants')
                    ->where('id', $firstVariant->id)
                    ->update(['is_default' => true]);
            }
        }
    }

    public function down(): void
    {
        // Remove default variants that were auto-created (those with no attribute values)
        DB::table('variants')
            ->where('is_default', true)
            ->whereNotIn('id', function ($q) {
                $q->select('variant_id')->from('variant_attribute_values');
            })
            ->delete();

        Schema::table('variants', function (Blueprint $table) {
            $table->dropColumn('is_default');
        });
    }
};
