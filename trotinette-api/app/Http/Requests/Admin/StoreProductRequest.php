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
            'sku'                             => 'required|string|unique:products,sku',
            'price'                           => 'required|integer|min:0',
            'stock_quantity'                  => 'required|integer|min:0',
            'category_id'                     => 'required|exists:categories,id',
            'is_active'                       => 'boolean',
            'translations'                    => 'required|array',
            'translations.fr'                 => 'required|array',
            'translations.fr.name'            => 'required|string|max:255',
            'translations.fr.slug'            => 'required|string|max:255',
            'translations.fr.description'     => 'nullable|string',
            'translations.en'                 => 'required|array',
            'translations.en.name'            => 'required|string|max:255',
            'translations.en.slug'            => 'required|string|max:255',
            'translations.en.description'     => 'nullable|string',
            'attributes'                      => 'nullable|string',
            'images'                          => 'nullable|array',
            'images.*'                        => 'image|mimes:jpeg,png,webp|max:5120',
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
    }
}
