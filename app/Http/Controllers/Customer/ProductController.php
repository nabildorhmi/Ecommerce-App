<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $products = QueryBuilder::for(
            Product::query()
                ->where('is_active', true)
                ->with(['media', 'category', 'variants'])
        )
            ->allowedFilters([
                AllowedFilter::exact('category_id'),
                AllowedFilter::exact('is_featured'),
                AllowedFilter::callback('min_price', fn ($query, $value) =>
                    $query->where('price', '>=', (int) $value)
                ),
                AllowedFilter::callback('max_price', fn ($query, $value) =>
                    $query->where('price', '<=', (int) $value)
                ),
                AllowedFilter::callback('in_stock', fn ($query, $value) =>
                    $query->when((bool) $value, fn ($q) =>
                        $q->whereHas('variants', fn ($vq) => $vq->where('is_active', true)->where('stock', '>', 0))
                    )
                ),
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->when(
                        strlen($value) >= 4,
                        fn ($q) => $q->whereFullText(['name', 'description'], $value),
                        fn ($q) => $q->where(fn ($qq) =>
                            $qq->where('name', 'LIKE', "%{$value}%")
                               ->orWhere('description', 'LIKE', "%{$value}%")
                        )
                    );
                }),
            ])
            ->allowedSorts(['price', 'created_at'])
            ->defaultSort('-created_at')
            ->paginate(perPage: min($request->integer('per_page', 12), 48))
            ->appends($request->query());

        return ProductResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->where('is_active', true)
            ->where('slug', $slug)
            ->with(['media', 'category', 'variants.attributeValues.attribute'])
            ->firstOrFail();

        return new ProductResource($product);
    }
}
