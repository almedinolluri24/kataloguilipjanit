<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('business_id', 50)->nullable();
            $table->string('title', 150);
            $table->string('sponsor', 150);
            $table->string('placement', 50)->default('banner-home');
            $table->text('image_url')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('destination_url')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->integer('priority')->default(0);
            $table->enum('status', ['active', 'scheduled', 'expired', 'disabled'])->default('active');
            $table->timestamps();

            $table->foreign('business_id')->references('id')->on('businesses')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
