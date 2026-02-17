<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    public function createCategory(array $data): Category
    {
        $category = Category::create([
            'slug'      => $data['slug'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        foreach ($data['translations'] as $locale => $translation) {
            $category->translations()->create([
                'locale' => $locale,
                'name'   => $translation['name'],
            ]);
        }

        return $category->load('translations');
    }

    public function updateCategory(Category $category, array $data): Category
    {
        $category->update(array_filter([
            'slug'      => $data['slug'] ?? null,
            'is_active' => $data['is_active'] ?? null,
        ], fn ($v) => $v !== null));

        if (isset($data['translations'])) {
            foreach ($data['translations'] as $locale => $translation) {
                $category->translations()->updateOrCreate(
                    ['locale' => $locale],
                    ['name' => $translation['name']]
                );
            }
        }

        return $category->load('translations');
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
