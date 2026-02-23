<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku'                  => ['nullable', 'string', 'max:50', 'unique:variants,sku'],
            'price'                => ['nullable', 'integer', 'min:0'],
            'stock'                => ['required', 'integer', 'min:0'],
            'is_active'            => ['boolean'],
            'attribute_value_ids'  => ['required', 'array', 'min:1'],
            'attribute_value_ids.*' => ['integer', 'exists:attribute_values,id'],
        ];
    }
}
