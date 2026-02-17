<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'sku'                             => ['sometimes', 'string', Rule::unique('products', 'sku')->ignore($productId)],
            'price'                           => 'sometimes|integer|min:0',
            'stock_quantity'                  => 'sometimes|integer|min:0',
            'category_id'                     => 'sometimes|exists:categories,id',
            'is_active'                       => 'sometimes|boolean',
            'translations'                    => 'sometimes|array',
            'translations.fr'                 => 'sometimes|array',
            'translations.fr.name'            => 'required_with:translations.fr|string|max:255',
            'translations.fr.slug'            => 'required_with:translations.fr|string|max:255',
            'translations.fr.description'     => 'nullable|string',
            'translations.en'                 => 'sometimes|array',
            'translations.en.name'            => 'required_with:translations.en|string|max:255',
            'translations.en.slug'            => 'required_with:translations.en|string|max:255',
            'translations.en.description'     => 'nullable|string',
            'attributes'                      => 'sometimes|nullable|string',
            'images'                          => 'sometimes|nullable|array',
            'images.*'                        => 'image|mimes:jpeg,png,webp|max:5120',
            'delete_images'                   => 'sometimes|array',
            'delete_images.*'                 => 'integer|exists:media,id',
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
