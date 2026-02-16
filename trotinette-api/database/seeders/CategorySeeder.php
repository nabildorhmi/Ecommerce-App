<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed scooter categories with FR/EN translations only.
     * No 'ar' locale rows — Arabic removed in Phase 1.
     */
    public function run(): void
    {
        $categories = [
            [
                'slug' => 'trotinettes-electriques',
                'translations' => [
                    'fr' => 'Trotinettes Electriques',
                    'en' => 'Electric Scooters',
                ],
            ],
            [
                'slug' => 'accessoires',
                'translations' => [
                    'fr' => 'Accessoires',
                    'en' => 'Accessories',
                ],
            ],
            [
                'slug' => 'pieces-detachees',
                'translations' => [
                    'fr' => 'Pieces Detachees',
                    'en' => 'Spare Parts',
                ],
            ],
            [
                'slug' => 'trotinettes-enfants',
                'translations' => [
                    'fr' => 'Trotinettes Enfants',
                    'en' => 'Kids Scooters',
                ],
            ],
        ];

        foreach ($categories as $data) {
            $category = Category::firstOrCreate(
                ['slug' => $data['slug']],
                ['slug' => $data['slug'], 'is_active' => true]
            );

            foreach ($data['translations'] as $locale => $name) {
                $category->translations()->updateOrCreate(
                    ['locale' => $locale],
                    ['name' => $name]
                );
            }
        }
    }
}
