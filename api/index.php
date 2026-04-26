<?php

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

// Vercel serverless entrypoint for Laravel
require __DIR__ . '/../public/index.php';
