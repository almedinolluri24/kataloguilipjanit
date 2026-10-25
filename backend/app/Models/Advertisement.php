<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'title',
        'sponsor',
        'placement',
        'image_url',
        'alt_text',
        'destination_url',
        'start_time',
        'end_time',
        'priority',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'priority' => 'integer',
        ];
    }

    public function business()
    {
        return $this->belongsTo(Business::class, 'business_id', 'id');
    }
}
