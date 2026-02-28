<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('variants', 'sku')->ignore($this->route('variant')),
            ],
            'price'                => ['nullable', 'integer', 'min:0'],
            'promo_price'          => ['sometimes', 'nullable', 'integer', 'min:0'],
            'stock'                => ['required', 'integer', 'min:0'],
            'is_active'            => ['boolean'],
            'attribute_value_ids'  => ['sometimes', 'array'],
            'attribute_value_ids.*' => ['integer', 'exists:attribute_values,id'],
        ];
    }
}
