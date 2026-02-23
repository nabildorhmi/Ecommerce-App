<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['nullable', 'string', 'max:50', 'unique:product_variants,sku'],
            'price_override' => ['nullable', 'integer', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'variation_value_ids' => ['required', 'array', 'min:1'],
            'variation_value_ids.*' => ['integer', 'exists:variation_values,id'],
        ];
    }
}
