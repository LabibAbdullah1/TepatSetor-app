<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deposit_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_id')->constrained('deposits')->onDelete('cascade');
            $table->integer('denomination');
            $table->integer('quantity')->default(0);
            $table->bigInteger('subtotal')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposit_details');
    }
};
