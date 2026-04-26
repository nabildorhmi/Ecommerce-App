<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // auth:sanctum middleware handles authentication
        return true;
    }

    public function rules(): array
    {
        return [
            'phone'               => ['required', 'string', 'max:20'],
            'city'                => ['required', 'string', 'max:100'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.product_id'  => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id'  => ['nullable', 'integer', 'exists:variants,id'],
            'items.*.quantity'    => ['required', 'integer', 'min:1', 'max:10'],
            'note'                => ['nullable', 'string', 'max:500'],
        ];
        // NOTE: No price fields accepted — backend calculates everything from DB prices
    }
}
