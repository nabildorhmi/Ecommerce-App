<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserController extends Controller
{
    public function index(): ResourceCollection
    {
        $users = User::with('roles')->paginate(25);

        return UserResource::collection($users);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('roles');

        return response()->json([
            'data'          => new UserResource($user),
            'order_history' => [],
        ]);
    }

    public function deactivate(User $user): JsonResponse
    {
        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Cannot deactivate admin.'], 422);
        }

        $user->update(['is_active' => false]);

        return response()->json(new UserResource($user->fresh()->load('roles')));
    }
}
