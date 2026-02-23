<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService)
    {
    }

    public function index(Request $request): ResourceCollection
    {
        $products = QueryBuilder::for(
            Product::query()->with(['media', 'category', 'variants'])
        )
            ->allowedFilters([
                AllowedFilter::exact('category_id'),
                AllowedFilter::exact('is_active'),
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
            ])
            ->allowedSorts(['price', 'created_at', 'sku'])
            ->defaultSort('-created_at')
            ->paginate(perPage: 20)
            ->appends($request->query());

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): \Illuminate\Http\JsonResponse
    {
        $product = $this->productService->createProduct($request->validated(), $request);

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Product $product): ProductResource
    {
        $product->load(['media', 'category', 'variants.attributeValues.attribute']);

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $product = $this->productService->updateProduct($product, $request->validated(), $request);

        return new ProductResource($product);
    }

    public function destroy(Product $product): Response
    {
        $this->productService->deleteProduct($product);

        return response()->noContent();
    }

    public function deleteMedia(Product $product, int $mediaId): Response
    {
        $media = $product->media()->findOrFail($mediaId);
        $media->delete();

        return response()->noContent();
    }
}
