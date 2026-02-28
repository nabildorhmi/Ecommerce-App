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
        'promo_price',
        'stock',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'price'       => 'integer',
        'promo_price' => 'integer',
        'stock'       => 'integer',
        'is_active'   => 'boolean',
        'is_default'  => 'boolean',
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

    /**
     * The effective promo price: variant promo_price overrides product promo_price.
     */
    public function getEffectivePromoPriceAttribute(): ?int
    {
        return $this->promo_price ?? $this->product?->promo_price;
    }

    /**
     * Whether this variant is on sale (has an effective promo price lower than effective price).
     */
    public function getIsOnSaleAttribute(): bool
    {
        $promoPrice = $this->effective_promo_price;
        return $promoPrice !== null && $promoPrice < $this->effective_price;
    }
}
