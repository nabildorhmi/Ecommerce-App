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
            'slug'            => 'required|string|max:255|unique:products,slug',
            'description'     => 'nullable|string',
            'price'           => 'required|integer|min:0',
            'stock_quantity'  => 'nullable|integer|min:0',
            'category_id'     => 'required|exists:categories,id',
            'is_active'       => 'boolean',
            'is_featured'     => 'boolean',
            'promo_price'         => 'nullable|integer|min:0',
            'discount_percentage' => 'nullable|integer|min:0|max:100',
            'is_new'          => 'boolean',
            'attributes'      => 'nullable|array',
            'images'          => 'nullable|array',
            'images.*'        => 'image|mimes:jpeg,png,webp|max:5120',
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
