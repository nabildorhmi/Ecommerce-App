<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class HeroBanner extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'title',
        'subtitle',
        'link',
        'sort_order',
        'is_active',
        'object_position',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    /* ── Media collections ───────────────────────────── */

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('banner')
            ->singleFile()                       // one image per banner entry
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Contain, 400, 200)
            ->nonQueued();

        $this->addMediaConversion('hero')
            ->fit(Fit::Contain, 1920, 900)
            ->nonQueued();
    }

    /* ── Scopes ──────────────────────────────────────── */

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}
