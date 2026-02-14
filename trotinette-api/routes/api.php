<?php

use App\Http\Controllers\Customer\AuthController;
use Illuminate\Support\Facades\Route;

// Health check — unauthenticated
Route::get('/ping', fn() => response()->json(['status' => 'ok', 'locale' => app()->getLocale()]));

// Auth routes — unauthenticated
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',         [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin-only routes (placeholder for future phases)
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/ping', fn() => response()->json(['status' => 'admin ok']));
    });
});
