<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('delivery_zone_id')->constrained()->restrictOnDelete();
            $table->string('order_number')->unique();
            $table->string('phone', 20);
            $table->string('status')->default('pending');
            $table->unsignedInteger('subtotal');   // centimes, server-calculated
            $table->unsignedInteger('delivery_fee'); // centimes, from delivery_zone at order time
            $table->unsignedInteger('total');      // centimes = subtotal + delivery_fee
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
