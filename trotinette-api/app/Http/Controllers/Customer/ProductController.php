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
                ->with(['media', 'category'])
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
                    $query->when((bool) $value, fn ($q) => $q->where('stock_quantity', '>', 0))
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
            ->paginate(perPage: 12)
            ->appends($request->query());

        return ProductResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->where('is_active', true)
            ->where('slug', $slug)
            ->with(['media', 'category', 'variants.values.type'])
            ->firstOrFail();

        return new ProductResource($product);
    }
}
