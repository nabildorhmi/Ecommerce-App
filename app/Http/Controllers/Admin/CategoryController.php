<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService)
    {
    }

    public function index(): ResourceCollection
    {
        $categories = Category::all();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): \Illuminate\Http\JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        return (new CategoryResource($category))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category);
    }

    public function update(Request $request, Category $category): CategoryResource
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'slug'      => 'sometimes|string|unique:categories,slug,' . $category->id,
            'is_active' => 'sometimes|boolean',
        ]);

        $category = $this->categoryService->updateCategory($category, $validated);

        return new CategoryResource($category);
    }

    public function destroy(Category $category): Response
    {
        $this->categoryService->deleteCategory($category);

        return response()->noContent();
    }
}
