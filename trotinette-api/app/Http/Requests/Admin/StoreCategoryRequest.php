<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slug'                 => 'required|string|unique:categories,slug',
            'is_active'            => 'boolean',
            'translations'         => 'required|array',
            'translations.fr'      => 'required|array',
            'translations.fr.name' => 'required|string|max:255',
            'translations.en'      => 'required|array',
            'translations.en.name' => 'required|string|max:255',
        ];
    }
}
