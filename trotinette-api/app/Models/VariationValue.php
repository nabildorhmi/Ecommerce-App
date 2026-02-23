<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VariationValue extends Model
{
    protected $fillable = [
        'variation_type_id',
        'value',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(VariationType::class, 'variation_type_id');
    }
}
