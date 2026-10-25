<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'slug',
        'category_id',
        'settlement_id',
        'address',
        'phone',
        'email',
        'website',
        'short_description',
        'description',
        'rating',
        'review_count',
        'featured',
        'status',
        'opening_hours',
        'latitude',
        'longitude',
        'services',
        'cover_image',
        'logo',
        'is_demo',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'review_count' => 'integer',
            'featured' => 'boolean',
            'is_demo' => 'boolean',
            'opening_hours' => 'array',
            'services' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function settlement()
    {
        return $this->belongsTo(Settlement::class, 'settlement_id', 'id');
    }

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class, 'business_id', 'id');
    }
}
