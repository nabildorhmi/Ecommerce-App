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
            'name'      => 'required|string|max:255',
            'slug'      => 'required|string|unique:categories,slug',
            'is_active' => 'boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Build translations.fr from flat name so CategoryService works unchanged
        if ($this->has('name') && ! $this->has('translations')) {
            $this->merge([
                'translations' => [
                    'fr' => ['name' => $this->input('name')],
                ],
            ]);
        }
    }
}
