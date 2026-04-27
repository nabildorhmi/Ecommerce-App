<?php

return [
    'paths' => [
        resource_path('views'),
    ],

    'compiled' => env('VIEW_COMPILED_PATH') ?: (
        isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL'])
            ? '/tmp/views'
            : realpath(storage_path('framework/views'))
    ),
];
