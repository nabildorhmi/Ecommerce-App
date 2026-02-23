<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttributeRequest extends FormRequest
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
                Rule::unique('attributes', 'name')->ignore($this->route('attribute')),
            ],
            'values'   => ['nullable', 'array'],
            'values.*' => ['required', 'string', 'max:100'],
        ];
    }
}
