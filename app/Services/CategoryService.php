<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    public function createCategory(array $data): Category
    {
        return Category::create([
            'slug'      => $data['slug'],
            'name'      => $data['name'],
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateCategory(Category $category, array $data): Category
    {
        $category->update(array_filter([
            'slug'      => $data['slug'] ?? null,
            'name'      => $data['name'] ?? null,
            'is_active' => $data['is_active'] ?? null,
        ], fn ($v) => $v !== null));

        return $category;
    }

    public function deleteCategory(Category $category): void
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => ['Cannot delete a category that has products assigned to it.'],
            ]);
        }

        $category->delete();
    }
}
