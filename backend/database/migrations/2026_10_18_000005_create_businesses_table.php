<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 150);
            $table->string('slug', 160)->unique();
            $table->string('category_id', 50);
            $table->string('settlement_id', 50);
            $table->string('address');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->text('short_description');
            $table->longText('description');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('review_count')->default(1);
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->json('opening_hours')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('services')->nullable();
            $table->text('cover_image')->nullable();
            $table->text('logo')->nullable();
            $table->boolean('is_demo')->default(true);
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->onDelete('restrict');
            $table->foreign('settlement_id')->references('id')->on('settlements')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
