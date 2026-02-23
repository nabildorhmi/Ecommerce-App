<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariationTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:variation_types,name'],
            'values' => ['nullable', 'array'],
            'values.*' => ['required', 'string', 'max:100'],
        ];
    }
}
