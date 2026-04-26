<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_translations', function (Blueprint $table) {
            // Drop the global unique index on slug alone
            $table->dropUnique(['slug']);
            // Add a composite unique index: same slug allowed per locale
            $table->unique(['locale', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::table('product_translations', function (Blueprint $table) {
            $table->dropUnique(['locale', 'slug']);
            $table->unique(['slug']);
        });
    }
};
