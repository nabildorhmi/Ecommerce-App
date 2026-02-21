<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@trotinette.test'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('password'),
                'phone'    => '+33600000000',
                'is_active' => true,
            ]
        );

        $admin->assignRole('admin');

        $globalAdmin = User::firstOrCreate(
            ['email' => 'globaladmin@trotinette.test'],
            [
                'name'     => 'Global Admin',
                'password' => Hash::make('password'),
                'phone'    => '+33600000001',
                'is_active' => true,
            ]
        );

        $globalAdmin->assignRole('global_admin');
    }
}
