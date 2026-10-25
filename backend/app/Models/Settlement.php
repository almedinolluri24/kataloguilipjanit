<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Settlement extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'is_town',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'is_town' => 'boolean',
        ];
    }

    public function businesses()
    {
        return $this->hasMany(Business::class, 'settlement_id', 'id');
    }
}
