<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'sku',
        'name',
        'slug',
        'description',
        'price',
        'stock_quantity',
        'attributes',
        'category_id',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'attributes'     => 'array',
        'is_active'      => 'boolean',
        'is_featured'    => 'boolean',
        'stock_quantity' => 'integer',
        'price'          => 'integer',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Contain, 200, 200)
            ->nonQueued();

        $this->addMediaConversion('card')
            ->fit(Fit::Contain, 600, 400)
            ->nonQueued();

        $this->addMediaConversion('full')
            ->fit(Fit::Contain, 1200, 900)
            ->nonQueued();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(Variant::class);
    }

    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(
            Attribute::class,
            'product_attributes',
            'product_id',
            'attribute_id'
        );
    }

    /**
     * The default variant (always exists — Shopify-style).
     */
    public function defaultVariant()
    {
        return $this->hasOne(Variant::class)->where('is_default', true);
    }

    /**
     * Computed stock: sum of all active variants' stock.
     */
    public function getComputedStockAttribute(): int
    {
        return (int) $this->variants()->where('is_active', true)->sum('stock');
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
