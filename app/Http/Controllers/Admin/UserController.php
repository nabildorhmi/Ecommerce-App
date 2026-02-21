<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        // Only global_admin can deactivate users
        if (!auth()->user()->hasRole('global_admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Prevent deactivating global_admin users
        if ($user->hasRole('global_admin')) {
            return response()->json(['message' => 'Cannot deactivate global admin.'], 422);
        }

        $user->update(['is_active' => false]);

        return response()->json(new UserResource($user->fresh()->load('roles')));
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        // Only global_admin can update roles
        if (!auth()->user()->hasRole('global_admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Validate role is admin or customer only (global_admin cannot be assigned via API)
        $validated = $request->validate([
            'role' => 'required|in:admin,customer',
        ]);

        // Sync roles (remove all current roles and assign the new one)
        $user->syncRoles([]);
        $user->assignRole($validated['role']);

        return response()->json(new UserResource($user->fresh()->load('roles')));
    }

    public function activate(User $user): JsonResponse
    {
        // Only global_admin can activate users
        if (!auth()->user()->hasRole('global_admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $user->update(['is_active' => true]);

        return response()->json(new UserResource($user->fresh()->load('roles')));
    }
}
