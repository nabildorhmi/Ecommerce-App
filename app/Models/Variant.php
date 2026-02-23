<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Variant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'stock',
        'is_active',
    ];

    protected $casts = [
        'price'     => 'integer',
        'stock'     => 'integer',
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The attribute values that define this variant's combination.
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'variant_attribute_values',
            'variant_id',
            'attribute_value_id'
        );
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * The effective sale price: variant price overrides product base price.
     */
    public function getEffectivePriceAttribute(): int
    {
        return $this->price ?? $this->product?->price ?? 0;
    }
}
