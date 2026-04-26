<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeliveryZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city'      => 'required|string|max:100|unique:delivery_zones,city',
            'city_ar'   => 'nullable|string|max:100',
            'fee'       => 'required|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
