<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    protected $fillable = [
        'city',
        'city_ar',
        'fee',
        'is_active',
    ];

    protected $casts = [
        'fee'       => 'integer',
        'is_active' => 'boolean',
    ];
}
