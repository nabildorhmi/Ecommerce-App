<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['sometimes', 'string', 'max:255'],
            'email'          => ['sometimes', 'email', Rule::unique('users')->ignore($this->user()->id)],
            'phone'          => ['sometimes', 'string', 'max:20'],
            'address_city'   => ['sometimes', 'nullable', 'string', 'max:100'],
            'address_street' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
