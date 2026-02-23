<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVariationTypeRequest;
use App\Http\Requests\Admin\UpdateVariationTypeRequest;
use App\Http\Resources\VariationTypeResource;
use App\Models\VariationType;
use App\Models\VariationValue;
use Illuminate\Support\Facades\DB;

class VariationTypeController extends Controller
{
    public function index()
    {
        $types = VariationType::with('values')->get();
        return VariationTypeResource::collection($types);
    }

    public function store(StoreVariationTypeRequest $request)
    {
        $type = DB::transaction(function () use ($request) {
            $type = VariationType::create([
                'name' => $request->input('name'),
            ]);

            if ($request->has('values')) {
                foreach ($request->input('values') as $value) {
                    VariationValue::create([
                        'variation_type_id' => $type->id,
                        'value' => $value,
                    ]);
                }
            }

            return $type->load('values');
        });

        return new VariationTypeResource($type);
    }

    public function update(UpdateVariationTypeRequest $request, VariationType $variationType)
    {
        $type = DB::transaction(function () use ($request, $variationType) {
            $variationType->update([
                'name' => $request->input('name'),
            ]);

            if ($request->has('values')) {
                $newValues = $request->input('values');
                $existingValues = $variationType->values;

                // Delete values not in the new list (if not used)
                foreach ($existingValues as $existingValue) {
                    if (!in_array($existingValue->value, $newValues)) {
                        // Check if used in any product_variant_values
                        $isUsed = DB::table('product_variant_values')
                            ->where('variation_value_id', $existingValue->id)
                            ->exists();

                        if (!$isUsed) {
                            $existingValue->delete();
                        }
                    }
                }

                // Add new values
                $existingValueStrings = $existingValues->pluck('value')->toArray();
                foreach ($newValues as $value) {
                    if (!in_array($value, $existingValueStrings)) {
                        VariationValue::create([
                            'variation_type_id' => $variationType->id,
                            'value' => $value,
                        ]);
                    }
                }
            }

            return $variationType->load('values');
        });

        return new VariationTypeResource($type);
    }

    public function destroy(VariationType $variationType)
    {
        // Check if any values are used in product_variant_values
        $isUsed = DB::table('product_variant_values')
            ->whereIn('variation_value_id', $variationType->values->pluck('id'))
            ->exists();

        if ($isUsed) {
            abort(422, 'Ce type de variation est utilisé par des variantes de produit');
        }

        $variationType->delete();

        return response()->json(['message' => 'Type de variation supprimé']);
    }
}
