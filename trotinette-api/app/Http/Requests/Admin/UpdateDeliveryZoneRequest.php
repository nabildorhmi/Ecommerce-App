<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeliveryZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city'      => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('delivery_zones')->ignore($this->route('delivery_zone')),
            ],
            'city_ar'   => 'sometimes|nullable|string|max:100',
            'fee'       => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
