<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAttributeRequest;
use App\Http\Requests\Admin\UpdateAttributeRequest;
use App\Http\Resources\AttributeResource;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Support\Facades\DB;

class AttributeController extends Controller
{
    public function index()
    {
        $attributes = Attribute::with('values')->get();
        return AttributeResource::collection($attributes);
    }

    public function store(StoreAttributeRequest $request)
    {
        $attribute = DB::transaction(function () use ($request) {
            $attribute = Attribute::create([
                'name' => $request->input('name'),
            ]);

            foreach ($request->input('values', []) as $value) {
                AttributeValue::create([
                    'attribute_id' => $attribute->id,
                    'value'        => $value,
                ]);
            }

            return $attribute->load('values');
        });

        return new AttributeResource($attribute);
    }

    public function update(UpdateAttributeRequest $request, Attribute $attribute)
    {
        $attribute = DB::transaction(function () use ($request, $attribute) {
            $attribute->update(['name' => $request->input('name')]);

            if ($request->has('values')) {
                $newValues      = $request->input('values');
                $existingValues = $attribute->values;

                // Remove values no longer listed (only if not in use)
                foreach ($existingValues as $existing) {
                    if (!in_array($existing->value, $newValues)) {
                        $inUse = DB::table('variant_attribute_values')
                            ->where('attribute_value_id', $existing->id)
                            ->exists();
                        if (!$inUse) {
                            $existing->delete();
                        }
                    }
                }

                // Add new values
                $existingStrings = $existingValues->pluck('value')->toArray();
                foreach ($newValues as $value) {
                    if (!in_array($value, $existingStrings)) {
                        AttributeValue::create([
                            'attribute_id' => $attribute->id,
                            'value'        => $value,
                        ]);
                    }
                }
            }

            return $attribute->load('values');
        });

        return new AttributeResource($attribute);
    }

    public function destroy(Attribute $attribute)
    {
        $inUse = DB::table('variant_attribute_values')
            ->join('attribute_values', 'attribute_values.id', '=', 'variant_attribute_values.attribute_value_id')
            ->where('attribute_values.attribute_id', $attribute->id)
            ->exists();

        if ($inUse) {
            return response()->json(
                ['message' => 'Impossible de supprimer : cet attribut est utilisé par des variantes / Cannot delete: this attribute is used by variants.'],
                422
            );
        }

        $attribute->delete();
        return response()->json(['message' => 'Attribut supprimé / Attribute deleted.']);
    }
}
