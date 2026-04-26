<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $electricCategory  = Category::where('slug', 'trotinettes-electriques')->first();
        $accessoryCategory = Category::where('slug', 'accessoires')->first();
        $kidsCategory      = Category::where('slug', 'trotinettes-enfants')->first();

        if (! $electricCategory || ! $accessoryCategory || ! $kidsCategory) {
            $this->command->warn('Categories not found. Run CategorySeeder first.');
            return;
        }

        $products = [
            [
                'sku'            => 'TROT-001',
                'name'           => 'Trotinette Electrique Pro 500W',
                'slug'           => 'trotinette-electrique-pro-500w',
                'description'    => 'Trotinette electrique puissante avec moteur 500W. Ideale pour les trajets urbains quotidiens. Autonomie de 35 km.',
                'price'          => 249900,
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
            ],
            [
                'sku'            => 'TROT-002',
                'name'           => 'Trotinette Electrique Ultra 800W',
                'slug'           => 'trotinette-electrique-ultra-800w',
                'description'    => 'Trotinette electrique haute performance avec moteur 800W. Vitesse maximale de 35 km/h. Parfaite pour les longues distances.',
                'price'          => 349900,
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
            ],
            [
                'sku'            => 'TROT-003',
                'name'           => 'Trotinette Electrique City 250W',
                'slug'           => 'trotinette-electrique-city-250w',
                'description'    => 'Trotinette electrique legere et compacte. Ideale pour les petits trajets en ville.',
                'price'          => 149900,
                'stock_quantity' => 0,
                'category_id'    => $electricCategory->id,
                'is_active'      => true,
                'attributes'     => [
                    'motor_power' => '250W',
                    'max_speed'   => '20 km/h',
                    'battery'     => '24V 7.5Ah',
                    'range_km'    => 20,
                    'weight_kg'   => 9.8,
                ],
            ],
            [
                'sku'            => 'TROT-004',
                'name'           => 'Trotinette Electrique Enfant 150W',
                'slug'           => 'trotinette-electrique-enfant-150w',
                'description'    => 'Trotinette electrique speciale enfants. Securisee avec limiteur de vitesse. Pour les enfants de 6 a 12 ans.',
                'price'          => 129900,
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
            ],
            [
                'sku'            => 'ACC-001',
                'name'           => 'Casque de Protection Urbain',
                'slug'           => 'casque-de-protection-urbain',
                'description'    => 'Casque de protection certifie CE pour trotinette electrique. Leger et bien ventile.',
                'price'          => 15900,
                'stock_quantity' => 50,
                'category_id'    => $accessoryCategory->id,
                'is_active'      => true,
                'attributes'     => [
                    'type'          => 'Casque',
                    'taille'        => 'M/L',
                    'certification' => 'CE EN1078',
                ],
            ],
            [
                'sku'            => 'TROT-005',
                'name'           => 'Trotinette Electrique Sport 1200W',
                'slug'           => 'trotinette-electrique-sport-1200w',
                'description'    => 'Trotinette electrique de performance extreme. Pour les passionnes de vitesse.',
                'price'          => 459900,
                'stock_quantity' => 3,
                'category_id'    => $electricCategory->id,
                'is_active'      => false,
                'attributes'     => [
                    'motor_power' => '1200W',
                    'max_speed'   => '45 km/h',
                    'battery'     => '52V 20Ah',
                    'range_km'    => 80,
                    'weight_kg'   => 22,
                ],
            ],
        ];

        foreach ($products as $data) {
            $product = Product::firstOrCreate(
                ['sku' => $data['sku']],
                $data
            );

            // Create default variant if the product doesn't have one
            if (! $product->variants()->where('is_default', true)->exists()) {
                $product->variants()->create([
                    'sku'        => $data['sku'],
                    'price'      => $data['price'],
                    'stock'      => $data['stock_quantity'],
                    'is_active'  => true,
                    'is_default' => true,
                ]);
            }
        }
    }
}
