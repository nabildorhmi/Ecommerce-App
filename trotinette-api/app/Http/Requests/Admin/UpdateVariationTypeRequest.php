<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVariationTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('variation_types', 'name')->ignore($this->route('variation_type')),
            ],
            'values' => ['nullable', 'array'],
            'values.*' => ['required', 'string', 'max:100'],
        ];
    }
}
