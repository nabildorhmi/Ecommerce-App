<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add name, slug, description directly to products table
        Schema::table('products', function (Blueprint $table) {
            $table->string('name')->after('sku')->default('');
            $table->string('slug')->after('name')->default('');
            $table->text('description')->nullable()->after('slug');
        });

        // 2. Copy FR translations (primary locale) into products table
        DB::statement("
            UPDATE products p
            JOIN product_translations pt ON pt.product_id = p.id AND pt.locale = 'fr'
            SET p.name = pt.name, p.slug = pt.slug, p.description = pt.description
        ");

        // Fallback: copy any locale for products that had no FR translation
        DB::statement("
            UPDATE products p
            JOIN product_translations pt ON pt.product_id = p.id
            SET p.name = COALESCE(NULLIF(p.name, ''), pt.name),
                p.slug = COALESCE(NULLIF(p.slug, ''), pt.slug),
                p.description = COALESCE(p.description, pt.description)
            WHERE p.name = ''
        ");

        // Add fulltext index and unique slug on products
        Schema::table('products', function (Blueprint $table) {
            $table->fullText(['name', 'description']);
            $table->unique('slug');
        });

        // 3. Add name directly to categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->string('name')->after('slug')->default('');
        });

        // Copy FR translations into categories table
        DB::statement("
            UPDATE categories c
            JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = 'fr'
            SET c.name = ct.name
        ");

        // Fallback
        DB::statement("
            UPDATE categories c
            JOIN category_translations ct ON ct.category_id = c.id
            SET c.name = COALESCE(NULLIF(c.name, ''), ct.name)
            WHERE c.name = ''
        ");

        // 4. Drop translation tables
        Schema::dropIfExists('product_translations');
        Schema::dropIfExists('category_translations');
    }

    public function down(): void
    {
        // Recreate product_translations
        Schema::create('product_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('slug');
            $table->timestamps();
            $table->unique(['product_id', 'locale']);
            $table->unique(['locale', 'slug']);
            $table->index('locale');
            $table->fullText(['name', 'description']);
        });

        // Copy data back
        DB::statement("
            INSERT INTO product_translations (product_id, locale, name, description, slug, created_at, updated_at)
            SELECT id, 'fr', name, description, slug, NOW(), NOW() FROM products
        ");

        // Recreate category_translations
        Schema::create('category_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 5);
            $table->string('name');
            $table->timestamps();
            $table->unique(['category_id', 'locale']);
            $table->index('locale');
        });

        // Copy data back
        DB::statement("
            INSERT INTO category_translations (category_id, locale, name, created_at, updated_at)
            SELECT id, 'fr', name, NOW(), NOW() FROM categories
        ");

        // Remove columns from products
        Schema::table('products', function (Blueprint $table) {
            $table->dropFullText(['name', 'description']);
            $table->dropUnique(['slug']);
            $table->dropColumn(['name', 'slug', 'description']);
        });

        // Remove name from categories
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
};
