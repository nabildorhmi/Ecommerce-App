<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DeliveryZoneController as AdminDeliveryZoneController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Customer\AuthController;
use App\Http\Controllers\Customer\CategoryController;
use App\Http\Controllers\Customer\DeliveryZoneController;
use App\Http\Controllers\Customer\ProductController;
use Illuminate\Support\Facades\Route;

// Health check — unauthenticated
Route::get('/ping', fn() => response()->json(['status' => 'ok', 'locale' => app()->getLocale()]));

// Auth routes — unauthenticated
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// Public catalog routes — unauthenticated
Route::get('/products',        [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories',      [CategoryController::class, 'index']);
Route::get('/delivery-zones',  [DeliveryZoneController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',         [AuthController::class, 'me']);
    Route::put('/user',         [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin-only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/ping', fn() => response()->json(['status' => 'admin ok']));

        // Product CRUD
        Route::get('/products',                                   [AdminProductController::class, 'index']);
        Route::post('/products',                                  [AdminProductController::class, 'store']);
        Route::get('/products/{product}',                         [AdminProductController::class, 'show']);
        Route::put('/products/{product}',                         [AdminProductController::class, 'update']);
        Route::patch('/products/{product}',                       [AdminProductController::class, 'update']);
        Route::delete('/products/{product}',                      [AdminProductController::class, 'destroy']);
        Route::delete('/products/{product}/media/{mediaId}',      [AdminProductController::class, 'deleteMedia']);

        // Category CRUD
        Route::get('/categories',               [AdminCategoryController::class, 'index']);
        Route::post('/categories',              [AdminCategoryController::class, 'store']);
        Route::get('/categories/{category}',    [AdminCategoryController::class, 'show']);
        Route::put('/categories/{category}',    [AdminCategoryController::class, 'update']);
        Route::patch('/categories/{category}',  [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        // User management
        Route::get('/users',                          [AdminUserController::class, 'index']);
        Route::get('/users/{user}',                   [AdminUserController::class, 'show']);
        Route::patch('/users/{user}/deactivate',      [AdminUserController::class, 'deactivate']);

        // Delivery zone CRUD
        Route::get('/delivery-zones',                           [AdminDeliveryZoneController::class, 'index']);
        Route::post('/delivery-zones',                          [AdminDeliveryZoneController::class, 'store']);
        Route::get('/delivery-zones/{delivery_zone}',           [AdminDeliveryZoneController::class, 'show']);
        Route::put('/delivery-zones/{delivery_zone}',           [AdminDeliveryZoneController::class, 'update']);
        Route::patch('/delivery-zones/{delivery_zone}',         [AdminDeliveryZoneController::class, 'update']);
        Route::delete('/delivery-zones/{delivery_zone}',        [AdminDeliveryZoneController::class, 'destroy']);
    });
});
