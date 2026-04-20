<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DeliveryZoneController as AdminDeliveryZoneController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\AttributeController as AdminAttributeController;
use App\Http\Controllers\Admin\VariantController as AdminVariantController;
use App\Http\Controllers\Admin\HeroBannerController as AdminHeroBannerController;
use App\Http\Controllers\Customer\AuthController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\HeroBannerController;
use App\Http\Controllers\Customer\CategoryController;
use App\Http\Controllers\Customer\DeliveryZoneController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\PageController;
use App\Http\Controllers\Customer\PasswordResetController;
use App\Http\Controllers\Customer\ProductController;
use Illuminate\Support\Facades\Route;

// Health check — unauthenticated
Route::get('/ping', fn() => response()->json(['status' => 'ok']));

// Auth routes — unauthenticated (rate-limited to prevent brute-force)
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
Route::post('/auth/login',    [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/auth/reset-password',  [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');

// Public catalog routes — unauthenticated
Route::get('/products',        [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories',      [CategoryController::class, 'index']);
Route::get('/delivery-zones',  [DeliveryZoneController::class, 'index']);
Route::get('/pages',           [PageController::class, 'index']);
Route::get('/pages/{page}',    [PageController::class, 'show']);
Route::get('/hero-banners',    [HeroBannerController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',         [AuthController::class, 'me']);
    Route::put('/user',         [AuthController::class, 'updateProfile']);
    Route::post('/user/password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Cart routes (authenticated users)
    Route::get('/cart',                    [CartController::class, 'index']);
    Route::post('/cart/sync',             [CartController::class, 'sync']);
    Route::post('/cart/items',            [CartController::class, 'store']);
    Route::patch('/cart/items/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('/cart',                [CartController::class, 'clear']);

    // Customer order routes
    Route::get('/orders',                  [OrderController::class, 'index']);
    Route::post('/orders',                 [OrderController::class, 'store']);
    Route::get('/orders/{order}',          [OrderController::class, 'show']);
    Route::get('/orders/{order}/invoice',  [OrderController::class, 'invoice']);

    // Admin-only routes (both admin and global_admin can access)
    Route::middleware('role:admin|global_admin')->prefix('admin')->group(function () {
        Route::get('/ping', fn() => response()->json(['status' => 'admin ok']));

        // Dashboard
        Route::get('/dashboard', AdminDashboardController::class);

        // Product CRUD
        Route::get('/products',                                   [AdminProductController::class, 'index']);
        Route::post('/products',                                  [AdminProductController::class, 'store']);
        Route::get('/products/{product}',                         [AdminProductController::class, 'show']);
        Route::put('/products/{product}',                         [AdminProductController::class, 'update']);
        Route::patch('/products/{product}',                       [AdminProductController::class, 'update']);
        Route::delete('/products/{product}',                      [AdminProductController::class, 'destroy']);
        Route::post('/products/discounts/clear',                  [AdminProductController::class, 'clearDiscounts']);
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
        Route::post('/users',                         [AdminUserController::class, 'store']);
        Route::get('/users/{user}',                   [AdminUserController::class, 'show']);
        Route::patch('/users/{user}/deactivate',      [AdminUserController::class, 'deactivate']);
        Route::patch('/users/{user}/role',            [AdminUserController::class, 'updateRole']);
        Route::patch('/users/{user}/activate',        [AdminUserController::class, 'activate']);

        // Delivery zone CRUD
        Route::get('/delivery-zones',                           [AdminDeliveryZoneController::class, 'index']);
        Route::post('/delivery-zones',                          [AdminDeliveryZoneController::class, 'store']);
        Route::get('/delivery-zones/{delivery_zone}',           [AdminDeliveryZoneController::class, 'show']);
        Route::put('/delivery-zones/{delivery_zone}',           [AdminDeliveryZoneController::class, 'update']);
        Route::patch('/delivery-zones/{delivery_zone}',         [AdminDeliveryZoneController::class, 'update']);
        Route::delete('/delivery-zones/{delivery_zone}',        [AdminDeliveryZoneController::class, 'destroy']);

        // Order management
        Route::get('/orders',                              [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}',                     [AdminOrderController::class, 'show']);
        Route::get('/orders/{order}/invoice',             [AdminOrderController::class, 'invoice']);
        Route::patch('/orders/{order}/status',            [AdminOrderController::class, 'transition']);
        Route::post('/orders/{order}/note',               [AdminOrderController::class, 'addNote']);

        // Page CMS
        Route::get('/pages',           [AdminPageController::class, 'index']);
        Route::post('/pages',          [AdminPageController::class, 'store']);
        Route::put('/pages/{page}',    [AdminPageController::class, 'update']);

        Route::middleware('role:global_admin')->group(function () {
            Route::get('/site-settings', [AdminPageController::class, 'showSiteSettings']);
            Route::put('/site-settings', [AdminPageController::class, 'updateSiteSettings']);
        });

        // Attributes (variation types — generic & scalable)
        Route::get('/attributes',                        [AdminAttributeController::class, 'index']);
        Route::post('/attributes',                       [AdminAttributeController::class, 'store']);
        Route::put('/attributes/{attribute}',            [AdminAttributeController::class, 'update']);
        Route::delete('/attributes/{attribute}',         [AdminAttributeController::class, 'destroy']);

        // Product variants (nested under product)
        Route::get('/products/{product}/variants',              [AdminVariantController::class, 'index']);
        Route::post('/products/{product}/variants',             [AdminVariantController::class, 'store']);
        Route::post('/products/{product}/variants/generate',    [AdminVariantController::class, 'generate']);
        Route::put('/products/{product}/variants/{variant}',    [AdminVariantController::class, 'update']);
        Route::delete('/products/{product}/variants/{variant}', [AdminVariantController::class, 'destroy']);

        // Hero banners (carousel images for the homepage)
        Route::get('/hero-banners',                             [AdminHeroBannerController::class, 'index']);
        Route::post('/hero-banners',                            [AdminHeroBannerController::class, 'store']);
        Route::get('/hero-banners/{heroBanner}',                [AdminHeroBannerController::class, 'show']);
        Route::post('/hero-banners/{heroBanner}',               [AdminHeroBannerController::class, 'update']);
        Route::delete('/hero-banners/{heroBanner}',             [AdminHeroBannerController::class, 'destroy']);
    });
});
