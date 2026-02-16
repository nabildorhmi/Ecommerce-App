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
        $locale = app()->getLocale();

        $products = QueryBuilder::for(
            Product::query()
                ->where('is_active', true)
                ->with([
                    'translations' => fn ($q) => $q->where('locale', $locale),
                    'media',
                    'category.translations' => fn ($q) => $q->where('locale', $locale),
                ])
        )
            ->allowedFilters([
                AllowedFilter::exact('category_id'),
                AllowedFilter::callback('min_price', fn ($query, $value) =>
                    $query->where('price', '>=', (int) $value)
                ),
                AllowedFilter::callback('max_price', fn ($query, $value) =>
                    $query->where('price', '<=', (int) $value)
                ),
                AllowedFilter::callback('in_stock', fn ($query, $value) =>
                    $query->when((bool) $value, fn ($q) => $q->where('stock_quantity', '>', 0))
                ),
                AllowedFilter::callback('search', function ($query, $value) use ($locale) {
                    $query->whereHas('translations', function ($q) use ($value, $locale) {
                        $q->where('locale', $locale)
                            ->when(
                                strlen($value) >= 4,
                                fn ($inner) => $inner->whereFullText(['name', 'description'], $value),
                                fn ($inner) => $inner->where(fn ($qq) =>
                                    $qq->where('name', 'LIKE', "%{$value}%")
                                       ->orWhere('description', 'LIKE', "%{$value}%")
                                )
                            );
                    });
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
        $locale = app()->getLocale();

        $product = Product::query()
            ->where('is_active', true)
            ->whereHas('translations', fn ($q) =>
                $q->where('locale', $locale)->where('slug', $slug)
            )
            ->with([
                'translations' => fn ($q) => $q->where('locale', $locale),
                'media',
                'category.translations' => fn ($q) => $q->where('locale', $locale),
            ])
            ->firstOrFail();

        return new ProductResource($product);
    }
}
