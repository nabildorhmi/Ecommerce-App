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
            'slug'            => ['sometimes', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'description'     => 'nullable|string',
            'price'           => 'sometimes|integer|min:0',
            'stock_quantity'  => 'sometimes|integer|min:0',
            'category_id'     => 'sometimes|exists:categories,id',
            'is_active'       => 'sometimes|boolean',
            'is_featured'     => 'sometimes|boolean',
            'promo_price'         => 'sometimes|nullable|integer|min:0',
            'discount_percentage' => 'sometimes|nullable|integer|min:0|max:100',
            'is_new'          => 'sometimes|boolean',
            'attributes'      => 'sometimes|nullable|array',
            'images'          => 'sometimes|nullable|array',
            'images.*'        => 'image|mimes:jpeg,png,webp|max:5120',
            'delete_images'   => 'sometimes|array',
            'delete_images.*' => 'integer|exists:media,id',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('attributes') && is_string($this->input('attributes'))) {
            $decoded = json_decode($this->input('attributes'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['attributes' => $decoded]);
            }
        }
    }
}
