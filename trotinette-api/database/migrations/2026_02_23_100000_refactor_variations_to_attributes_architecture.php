<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Refactor variations system to generic attributes architecture:
 *   variation_types        → attributes         (+ slug)
 *   variation_values       → attribute_values   (+ slug, FK renamed)
 *   product_variants       → variants           (price_override→price, stock_quantity→stock)
 *   product_variant_values → variant_attribute_values (FKs renamed)
 *   NEW: product_attributes pivot
 *   ADD: order_items.variant_id
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Drop old tables (reverse dependency order) ──────────────────────
        Schema::dropIfExists('product_variant_values');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('variation_values');
        Schema::dropIfExists('variation_types');

        // ── 2. attributes  (replaces variation_types) ──────────────────────────
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 110)->unique();
            $table->timestamps();
        });

        // ── 3. attribute_values  (replaces variation_values) ───────────────────
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')
                ->constrained('attributes')
                ->cascadeOnDelete();
            $table->string('value', 100);
            $table->string('slug', 110);
            $table->timestamps();

            $table->unique(['attribute_id', 'value']);
            $table->unique(['attribute_id', 'slug']);
        });

        // ── 4. product_attributes  (NEW: which attributes a product supports) ──
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->foreignId('attribute_id')
                ->constrained('attributes')
                ->cascadeOnDelete();

            $table->primary(['product_id', 'attribute_id']);
        });

        // ── 5. variants  (replaces product_variants) ───────────────────────────
        Schema::create('variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->string('sku', 50)->nullable()->unique();
            $table->unsignedBigInteger('price')->nullable(); // null = use product.price
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── 6. variant_attribute_values  (replaces product_variant_values) ─────
        Schema::create('variant_attribute_values', function (Blueprint $table) {
            $table->foreignId('variant_id')
                ->constrained('variants')
                ->cascadeOnDelete();
            $table->foreignId('attribute_value_id')
                ->constrained('attribute_values')
                ->cascadeOnDelete();

            $table->primary(['variant_id', 'attribute_value_id'], 'vav_primary');
        });

        // ── 7. Add variant_id to order_items ───────────────────────────────────
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('variant_id')
                ->nullable()
                ->after('product_id')
                ->constrained('variants')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['variant_id']);
            $table->dropColumn('variant_id');
        });

        Schema::dropIfExists('variant_attribute_values');
        Schema::dropIfExists('variants');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');

        // Restore old tables
        Schema::create('variation_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->timestamps();
        });

        Schema::create('variation_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variation_type_id')
                ->constrained('variation_types')
                ->cascadeOnDelete();
            $table->string('value', 100);
            $table->timestamps();
            $table->unique(['variation_type_id', 'value']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('sku', 50)->nullable()->unique();
            $table->unsignedBigInteger('price_override')->nullable();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('product_variant_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')
                ->constrained('product_variants')
                ->cascadeOnDelete();
            $table->foreignId('variation_value_id')
                ->constrained('variation_values')
                ->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['product_variant_id', 'variation_value_id'], 'pvv_unique');
        });
    }
};
