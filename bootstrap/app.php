<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Force JSON responses for Vercel API deployment
        $middleware->prepend(function ($request, $next) {
            $request->headers->set('Accept', 'application/json');
            return $next($request);
        });

        $middleware->alias([
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // ValidationException - status 422
        $exceptions->renderable(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'type' => 'https://httpstatuses.com/422',
                    'title' => 'Validation Failed',
                    'status' => 422,
                    'detail' => $e->getMessage(),
                    'code' => \App\Enums\ErrorCode::VAL_FAILED->value,
                    'errors' => $e->errors(),
                    'instance' => $request->fullUrl(),
                    'timestamp' => now()->toIso8601String(),
                ], 422);
            }
        });

        // AuthenticationException - status 401
        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'type' => 'https://httpstatuses.com/401',
                    'title' => 'Authentication Required',
                    'status' => 401,
                    'detail' => $e->getMessage() ?: 'Unauthenticated.',
                    'code' => \App\Enums\ErrorCode::AUTH_UNAUTHORIZED->value,
                    'instance' => $request->fullUrl(),
                    'timestamp' => now()->toIso8601String(),
                ], 401);
            }
        });

        // AuthorizationException - status 403
        $exceptions->renderable(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'type' => 'https://httpstatuses.com/403',
                    'title' => 'Access Forbidden',
                    'status' => 403,
                    'detail' => $e->getMessage() ?: 'This action is unauthorized.',
                    'code' => \App\Enums\ErrorCode::AUTH_FORBIDDEN->value,
                    'instance' => $request->fullUrl(),
                    'timestamp' => now()->toIso8601String(),
                ], 403);
            }
        });

        // ModelNotFoundException - status 404
        $exceptions->renderable(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                $model = class_basename($e->getModel());
                return response()->json([
                    'type' => 'https://httpstatuses.com/404',
                    'title' => "{$model} Not Found",
                    'status' => 404,
                    'detail' => "The requested {$model} could not be found.",
                    'code' => \App\Enums\ErrorCode::SYS_NOT_FOUND->value,
                    'instance' => $request->fullUrl(),
                    'timestamp' => now()->toIso8601String(),
                ], 404);
            }
        });

        // NotFoundHttpException - status 404 (route not found)
        $exceptions->renderable(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'type' => 'https://httpstatuses.com/404',
                    'title' => 'Not Found',
                    'status' => 404,
                    'detail' => $e->getMessage() ?: 'The requested resource was not found.',
                    'code' => \App\Enums\ErrorCode::SYS_NOT_FOUND->value,
                    'instance' => $request->fullUrl(),
                    'timestamp' => now()->toIso8601String(),
                ], 404);
            }
        });

        // ThrottleRequestsException - status 429
        $exceptions->renderable(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'type' => 'https://httpstatuses.com/429',
                    'title' => 'Too Many Requests',
                    'status' => 429,
                    'detail' => $e->getMessage() ?: 'Rate limit exceeded. Please try again later.',
                    'code' => \App\Enums\ErrorCode::SYS_RATE_LIMITED->value,
                    'instance' => $request->fullUrl(),
                    'timestamp' => now()->toIso8601String(),
                ], 429);
            }
        });

        // HttpException - catch-all for abort() calls
        $exceptions->renderable(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'type' => 'https://httpstatuses.com/' . $e->getStatusCode(),
                    'title' => \Symfony\Component\HttpFoundation\Response::$statusTexts[$e->getStatusCode()] ?? 'Error',
                    'status' => $e->getStatusCode(),
                    'detail' => $e->getMessage() ?: 'An error occurred.',
                    'code' => \App\Enums\ErrorCode::SYS_INTERNAL->value,
                    'instance' => $request->fullUrl(),
                    'timestamp' => now()->toIso8601String(),
                ], $e->getStatusCode());
            }
        });
    })->create();
