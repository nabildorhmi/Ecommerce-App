<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register(
            name: $request->validated('name'),
            email: $request->validated('email'),
            password: $request->validated('password'),
            phone: $request->validated('phone'),
        );

        return response()->json([
            'token' => $result->plainTextToken,
            'user'  => new UserResource($result->user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login(
            email: $request->validated('email'),
            password: $request->validated('password'),
        );

        return response()->json([
            'token' => $result->plainTextToken,
            'user'  => new UserResource($result->user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request);
        return response()->json(['message' => 'Logged out']);
    }
}
