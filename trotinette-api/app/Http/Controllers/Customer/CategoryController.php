<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryController extends Controller
{
    public function index(): ResourceCollection
    {
        $locale = app()->getLocale();

        $categories = Category::query()
            ->active()
            ->with(['translations' => fn ($q) => $q->where('locale', $locale)])
            ->get();

        return CategoryResource::collection($categories);
    }
}
