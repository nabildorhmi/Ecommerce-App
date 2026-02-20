<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku'             => 'required|string|unique:products,sku',
            'name'            => 'required|string|max:255',
            'slug'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'required|integer|min:0',
            'stock_quantity'  => 'required|integer|min:0',
            'category_id'     => 'required|exists:categories,id',
            'is_active'       => 'boolean',
            'is_featured'     => 'boolean',
            'translations'    => 'sometimes|array',
            'translations.fr.name'        => 'sometimes|string|max:255',
            'translations.fr.slug'        => 'sometimes|string|max:255',
            'translations.fr.description' => 'nullable|string',
            'translations.en.name'        => 'sometimes|string|max:255',
            'translations.en.slug'        => 'sometimes|string|max:255',
            'translations.en.description' => 'nullable|string',
            'attributes'      => 'nullable|array',
            'images'          => 'nullable|array',
            'images.*'        => 'image|mimes:jpeg,png,webp|max:5120',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Decode attributes JSON string if provided
        if ($this->has('attributes') && is_string($this->attributes)) {
            $decoded = json_decode($this->attributes, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['attributes' => $decoded]);
            }
        }

        // Map flat name/slug/description to both locales when no nested translations sent
        if ($this->has('name') && ! $this->has('translations')) {
            $slug = $this->input('slug', \Illuminate\Support\Str::slug($this->input('name', '')));
            $desc = $this->input('description', '');
            $this->merge([
                'translations' => [
                    'fr' => ['name' => $this->input('name'), 'slug' => $slug, 'description' => $desc],
                    'en' => ['name' => $this->input('name'), 'slug' => $slug, 'description' => $desc],
                ],
            ]);
        }
    }
}
