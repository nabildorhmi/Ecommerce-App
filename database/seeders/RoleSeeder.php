<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // guard_name MUST be 'sanctum' for bearer token auth
        Role::firstOrCreate(['name' => 'admin',        'guard_name' => 'sanctum']);
        Role::firstOrCreate(['name' => 'customer',     'guard_name' => 'sanctum']);
        Role::firstOrCreate(['name' => 'global_admin', 'guard_name' => 'sanctum']);
    }
}
