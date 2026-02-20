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
            'sku'             => ['sometimes', 'string', Rule::unique('products', 'sku')->ignore($productId)],
            'name'            => 'sometimes|string|max:255',
            'slug'            => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'sometimes|integer|min:0',
            'stock_quantity'  => 'sometimes|integer|min:0',
            'category_id'     => 'sometimes|exists:categories,id',
            'is_active'       => 'sometimes|boolean',
            'is_featured'     => 'sometimes|boolean',
            'translations'    => 'sometimes|array',
            'translations.fr.name'        => 'sometimes|string|max:255',
            'translations.fr.slug'        => 'sometimes|string|max:255',
            'translations.fr.description' => 'nullable|string',
            'translations.en.name'        => 'sometimes|string|max:255',
            'translations.en.slug'        => 'sometimes|string|max:255',
            'translations.en.description' => 'nullable|string',
            'attributes'      => 'sometimes|nullable|array',
            'images'          => 'sometimes|nullable|array',
            'images.*'        => 'image|mimes:jpeg,png,webp|max:5120',
            'delete_images'   => 'sometimes|array',
            'delete_images.*' => 'integer|exists:media,id',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Decode attributes JSON string if provided
        if ($this->has('attributes') && is_string($this->input('attributes'))) {
            $decoded = json_decode($this->input('attributes'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['attributes' => $decoded]);
            }
        }

        // Map flat name/slug/description to fr locale when no nested translations sent
        if ($this->has('name') && ! $this->has('translations')) {
            $slug = $this->input('slug', \Illuminate\Support\Str::slug($this->input('name', '')));
            $desc = $this->input('description', '');
            $this->merge([
                'translations' => [
                    'fr' => ['name' => $this->input('name'), 'slug' => $slug, 'description' => $desc],
                ],
            ]);
        }
    }
}
