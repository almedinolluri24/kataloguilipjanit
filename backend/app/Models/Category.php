<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'slug',
        'name',
        'icon',
        'description',
        'color',
    ];

    public function businesses()
    {
        return $this->hasMany(Business::class, 'category_id', 'id');
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'category_id', 'id');
    }
}
