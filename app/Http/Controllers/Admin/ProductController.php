<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Variant;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
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
            Product::query()->with(['media', 'category', 'variants.attributeValues.attribute'])
        )
            ->allowedFilters([
                AllowedFilter::exact('category_id'),
                AllowedFilter::exact('is_active'),
                AllowedFilter::exact('is_featured'),
                AllowedFilter::exact('is_new'),
                AllowedFilter::callback('search', fn ($query, $value) =>
                    $query->where(fn ($q) =>
                        $q->where('name', 'like', '%' . $value . '%')
                          ->orWhere('sku', 'like', '%' . $value . '%')
                          ->orWhere('slug', 'like', '%' . $value . '%')
                          ->orWhereHas('category', fn ($cq) =>
                              $cq->where('name', 'like', '%' . $value . '%')
                          )
                    )
                ),
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
                AllowedFilter::callback('is_on_sale', fn ($query, $value) =>
                    $query->when($value === '1', fn ($q) =>
                        $q->whereNotNull('promo_price')->where('promo_price', '>', 0)
                    )->when($value === '0', fn ($q) =>
                        $q->whereNull('promo_price')->orWhere('promo_price', '=', 0)
                    )
                ),
            ])
            ->allowedSorts(['price', 'created_at', 'sku'])
            ->defaultSort('-created_at')
            ->paginate(perPage: min($request->integer('per_page', 20), 100))
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

    public function clearDiscounts(): JsonResponse
    {
        [$productsUpdated, $variantsUpdated] = DB::transaction(function () {
            $productsUpdated = Product::query()->update([
                'promo_price' => null,
                'discount_percentage' => null,
            ]);

            $variantsUpdated = Variant::query()->update([
                'promo_price' => null,
                'discount_percentage' => null,
            ]);

            return [$productsUpdated, $variantsUpdated];
        });

        return response()->json([
            'message' => 'Toutes les remises ont ete desactivees.',
            'products_updated' => $productsUpdated,
            'variants_updated' => $variantsUpdated,
        ]);
    }

    public function clearFeatured(): JsonResponse
    {
        $productsUpdated = Product::query()->where('is_featured', true)->update([
            'is_featured' => false,
        ]);

        return response()->json([
            'message' => 'Toutes les vedettes ont ete retirees.',
            'products_updated' => $productsUpdated,
        ]);
    }

    public function clearNew(): JsonResponse
    {
        $productsUpdated = Product::query()->where('is_new', true)->update([
            'is_new' => false,
        ]);

        return response()->json([
            'message' => 'Toutes les nouveautes ont ete retirees.',
            'products_updated' => $productsUpdated,
        ]);
    }
}
