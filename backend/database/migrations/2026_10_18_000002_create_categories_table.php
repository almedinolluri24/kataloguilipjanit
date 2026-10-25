<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('slug', 60)->unique();
            $table->string('name', 100);
            $table->string('icon', 50)->default('Layers');
            $table->text('description')->nullable();
            $table->string('color', 20)->nullable()->default('#0d9488');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
