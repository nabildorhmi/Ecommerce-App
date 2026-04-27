<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Set CORS headers before Laravel loads
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: '*');

if (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Accept-Language, X-CSRF-TOKEN');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Bootstrap Laravel for Vercel serverless
define('LARAVEL_START', microtime(true));

// Ensure writable directories exist in /tmp for serverless
$tmpDirs = [
    '/tmp/views',
    '/tmp/cache',
    '/tmp/sessions',
    '/tmp/logs',
];

foreach ($tmpDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Check maintenance mode
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register Composer autoloader
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle request
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Force JSON responses by setting Accept header
$_SERVER['HTTP_ACCEPT'] = 'application/json';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
