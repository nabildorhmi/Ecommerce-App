<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TransitionOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // role:admin middleware handles authorization
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:pending,confirmed,dispatched,delivered,cancelled'],
            'note'   => ['nullable', 'string', 'max:500'],
        ];
    }
}
