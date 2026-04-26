<?php
// ONE-TIME DATABASE SETUP
// Visit: https://trotinette-api.vercel.app/api/setup.php
// DELETE THIS FILE AFTER USE!

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: application/json');

try {
    // Run migrations
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    $migrateOutput = \Illuminate\Support\Facades\Artisan::output();

    // Create roles
    $globalAdminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'global_admin', 'guard_name' => 'web']);
    $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $customerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

    // Create admin user
    $user = \App\Models\User::firstOrCreate(
        ['email' => 'nabil.dorhmi26@gmail.com'],
        [
            'name' => 'Nabil Dorhmi',
            'password' => bcrypt('nabil2001'),
            'phone' => null,
            'status' => 'active',
        ]
    );

    // Assign role
    if (!$user->hasRole('global_admin')) {
        $user->assignRole('global_admin');
    }

    echo json_encode([
        'success' => true,
        'message' => '✓ Database setup complete!',
        'admin' => [
            'email' => 'nabil.dorhmi26@gmail.com',
            'password' => 'nabil2001',
            'role' => 'global_admin'
        ],
        'migrations' => $migrateOutput,
        'warning' => '⚠️ DELETE /api/setup.php NOW FOR SECURITY!'
    ], JSON_PRETTY_PRINT);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => explode("\n", $e->getTraceAsString())
    ], JSON_PRETTY_PRINT);
}
