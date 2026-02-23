<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'price_override',
        'stock_quantity',
        'is_active',
    ];

    protected $casts = [
        'price_override' => 'integer',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function values(): BelongsToMany
    {
        return $this->belongsToMany(
            VariationValue::class,
            'product_variant_values',
            'product_variant_id',
            'variation_value_id'
        )->withTimestamps();
    }
}
