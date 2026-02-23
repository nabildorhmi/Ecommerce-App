<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'max:100', 'unique:attributes,name'],
            'values'  => ['nullable', 'array'],
            'values.*' => ['required', 'string', 'max:100'],
        ];
    }
}
