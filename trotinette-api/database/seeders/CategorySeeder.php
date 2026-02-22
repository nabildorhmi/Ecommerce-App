<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'trotinettes-electriques', 'name' => 'Trotinettes Electriques'],
            ['slug' => 'accessoires',              'name' => 'Accessoires'],
            ['slug' => 'pieces-detachees',         'name' => 'Pieces Detachees'],
            ['slug' => 'trotinettes-enfants',      'name' => 'Trotinettes Enfants'],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(
                ['slug' => $data['slug']],
                [...$data, 'is_active' => true]
            );
        }
    }
}
