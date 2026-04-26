<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add discount_percentage to products table
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedTinyInteger('discount_percentage')->nullable()->after('promo_price');
        });

        // Add discount_percentage to variants table
        Schema::table('variants', function (Blueprint $table) {
            $table->unsignedTinyInteger('discount_percentage')->nullable()->after('promo_price');
        });

        // Migrate existing promo_price data to discount_percentage
        // For products that have promo_price set, calculate the percentage
        DB::table('products')
            ->whereNotNull('promo_price')
            ->where('price', '>', 0)
            ->update([
                'discount_percentage' => DB::raw('ROUND((1 - (promo_price / price)) * 100)'),
            ]);

        // For variants that have promo_price set, calculate the percentage
        DB::table('variants')
            ->whereNotNull('promo_price')
            ->where('price', '>', 0)
            ->update([
                'discount_percentage' => DB::raw('ROUND((1 - (promo_price / price)) * 100)'),
            ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('discount_percentage');
        });

        Schema::table('variants', function (Blueprint $table) {
            $table->dropColumn('discount_percentage');
        });
    }
};
