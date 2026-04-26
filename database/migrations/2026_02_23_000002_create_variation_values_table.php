<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variation_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variation_type_id')
                ->constrained('variation_types')
                ->cascadeOnDelete();
            $table->string('value', 100);
            $table->timestamps();

            $table->unique(['variation_type_id', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variation_values');
    }
};
