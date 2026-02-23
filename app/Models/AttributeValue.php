<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class AttributeValue extends Model
{
    protected $fillable = [
        'attribute_id',
        'value',
        'slug',
    ];

    protected static function booted(): void
    {
        static::creating(function (AttributeValue $model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->value);
            }
        });

        static::updating(function (AttributeValue $model) {
            if ($model->isDirty('value') && !$model->isDirty('slug')) {
                $model->slug = Str::slug($model->value);
            }
        });
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(
            Variant::class,
            'variant_attribute_values',
            'attribute_value_id',
            'variant_id'
        );
    }
}
