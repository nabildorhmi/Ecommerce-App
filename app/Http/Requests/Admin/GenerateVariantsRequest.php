<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GenerateVariantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attribute_values'              => ['required', 'array', 'min:1'],
            'attribute_values.*'            => ['required', 'array', 'min:1'],
            'attribute_values.*.*'          => ['integer', 'exists:attribute_values,id'],
            'default_price'                 => ['nullable', 'integer', 'min:0'],
            'default_stock'                 => ['integer', 'min:0'],
            'skip_existing'                 => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'attribute_values.required' => 'Sélectionnez au moins un attribut / Select at least one attribute.',
            'attribute_values.min'      => 'Sélectionnez au moins un attribut / Select at least one attribute.',
        ];
    }
}
