<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed sample products with FR/EN translations and spec attributes.
     * No images in seeder — products will have empty image collections.
     * No 'ar' locale rows — Arabic removed in Phase 1.
     */
    public function run(): void
    {
        $electricCategory   = Category::where('slug', 'trotinettes-electriques')->first();
        $accessoryCategory  = Category::where('slug', 'accessoires')->first();
        $kidsCategory       = Category::where('slug', 'trotinettes-enfants')->first();

        if (! $electricCategory || ! $accessoryCategory || ! $kidsCategory) {
            $this->command->warn('Categories not found. Run CategorySeeder first.');
            return;
        }

        $products = [
            [
                'sku'            => 'TROT-001',
                'price'          => 249900,  // 2499 MAD
                'stock_quantity' => 15,
                'category_id'    => $electricCategory->id,
                'is_active'      => true,
                'attributes'     => [
                    'motor_power' => '500W',
                    'max_speed'   => '25 km/h',
                    'battery'     => '36V 10Ah',
                    'range_km'    => 35,
                    'weight_kg'   => 12.5,
                ],
                'translations' => [
                    'fr' => [
                        'name'        => 'Trotinette Electrique Pro 500W',
                        'slug'        => 'trotinette-electrique-pro-500w',
                        'description' => 'Trotinette electrique puissante avec moteur 500W. Ideale pour les trajets urbains quotidiens. Autonomie de 35 km.',
                    ],
                    'en' => [
                        'name'        => 'Electric Scooter Pro 500W',
                        'slug'        => 'electric-scooter-pro-500w',
                        'description' => 'Powerful electric scooter with 500W motor. Ideal for daily urban commuting. Range of 35 km.',
                    ],
                ],
            ],
            [
                'sku'            => 'TROT-002',
                'price'          => 349900,  // 3499 MAD
                'stock_quantity' => 8,
                'category_id'    => $electricCategory->id,
                'is_active'      => true,
                'attributes'     => [
                    'motor_power' => '800W',
                    'max_speed'   => '35 km/h',
                    'battery'     => '48V 13Ah',
                    'range_km'    => 50,
                    'weight_kg'   => 14.8,
                ],
                'translations' => [
                    'fr' => [
                        'name'        => 'Trotinette Electrique Ultra 800W',
                        'slug'        => 'trotinette-electrique-ultra-800w',
                        'description' => 'Trotinette electrique haute performance avec moteur 800W. Vitesse maximale de 35 km/h. Parfaite pour les longues distances.',
                    ],
                    'en' => [
                        'name'        => 'Electric Scooter Ultra 800W',
                        'slug'        => 'electric-scooter-ultra-800w',
                        'description' => 'High-performance electric scooter with 800W motor. Maximum speed of 35 km/h. Perfect for long distances.',
                    ],
                ],
            ],
            [
                'sku'            => 'TROT-003',
                'price'          => 149900,  // 1499 MAD
                'stock_quantity' => 0,       // out of stock for testing
                'category_id'    => $electricCategory->id,
                'is_active'      => true,
                'attributes'     => [
                    'motor_power' => '250W',
                    'max_speed'   => '20 km/h',
                    'battery'     => '24V 7.5Ah',
                    'range_km'    => 20,
                    'weight_kg'   => 9.8,
                ],
                'translations' => [
                    'fr' => [
                        'name'        => 'Trotinette Electrique City 250W',
                        'slug'        => 'trotinette-electrique-city-250w',
                        'description' => 'Trotinette electrique legere et compacte. Ideale pour les petits trajets en ville.',
                    ],
                    'en' => [
                        'name'        => 'Electric Scooter City 250W',
                        'slug'        => 'electric-scooter-city-250w',
                        'description' => 'Light and compact electric scooter. Ideal for short city trips.',
                    ],
                ],
            ],
            [
                'sku'            => 'TROT-004',
                'price'          => 129900,  // 1299 MAD
                'stock_quantity' => 20,
                'category_id'    => $kidsCategory->id,
                'is_active'      => true,
                'attributes'     => [
                    'motor_power' => '150W',
                    'max_speed'   => '15 km/h',
                    'battery'     => '24V 5Ah',
                    'range_km'    => 15,
                    'weight_kg'   => 7.2,
                    'age_min'     => 6,
                    'age_max'     => 12,
                ],
                'translations' => [
                    'fr' => [
                        'name'        => 'Trotinette Electrique Enfant 150W',
                        'slug'        => 'trotinette-electrique-enfant-150w',
                        'description' => 'Trotinette electrique speciale enfants. Securisee avec limiteur de vitesse. Pour les enfants de 6 a 12 ans.',
                    ],
                    'en' => [
                        'name'        => 'Kids Electric Scooter 150W',
                        'slug'        => 'kids-electric-scooter-150w',
                        'description' => 'Electric scooter specially designed for children. Safe with speed limiter. For children aged 6 to 12.',
                    ],
                ],
            ],
            [
                'sku'            => 'ACC-001',
                'price'          => 15900,   // 159 MAD
                'stock_quantity' => 50,
                'category_id'    => $accessoryCategory->id,
                'is_active'      => true,
                'attributes'     => [
                    'type'         => 'Casque',
                    'taille'       => 'M/L',
                    'certification' => 'CE EN1078',
                ],
                'translations' => [
                    'fr' => [
                        'name'        => 'Casque de Protection Urbain',
                        'slug'        => 'casque-de-protection-urbain',
                        'description' => 'Casque de protection certifie CE pour trotinette electrique. Leger et bien ventile.',
                    ],
                    'en' => [
                        'name'        => 'Urban Protection Helmet',
                        'slug'        => 'urban-protection-helmet',
                        'description' => 'CE certified protection helmet for electric scooter. Lightweight and well ventilated.',
                    ],
                ],
            ],
            [
                'sku'            => 'TROT-005',
                'price'          => 459900,  // 4599 MAD
                'stock_quantity' => 3,
                'category_id'    => $electricCategory->id,
                'is_active'      => false,   // inactive for testing
                'attributes'     => [
                    'motor_power' => '1200W',
                    'max_speed'   => '45 km/h',
                    'battery'     => '52V 20Ah',
                    'range_km'    => 80,
                    'weight_kg'   => 22,
                ],
                'translations' => [
                    'fr' => [
                        'name'        => 'Trotinette Electrique Sport 1200W',
                        'slug'        => 'trotinette-electrique-sport-1200w',
                        'description' => 'Trotinette electrique de performance extreme. Pour les passionnes de vitesse.',
                    ],
                    'en' => [
                        'name'        => 'Electric Scooter Sport 1200W',
                        'slug'        => 'electric-scooter-sport-1200w',
                        'description' => 'Extreme performance electric scooter. For speed enthusiasts.',
                    ],
                ],
            ],
        ];

        foreach ($products as $data) {
            $translations = $data['translations'];
            unset($data['translations']);

            $product = Product::firstOrCreate(
                ['sku' => $data['sku']],
                $data
            );

            // Only insert translations for fr and en — no ar rows
            foreach ($translations as $locale => $translation) {
                $product->translations()->updateOrCreate(
                    ['locale' => $locale],
                    [
                        'name'        => $translation['name'],
                        'slug'        => $translation['slug'],
                        'description' => $translation['description'] ?? null,
                    ]
                );
            }
        }
    }
}
