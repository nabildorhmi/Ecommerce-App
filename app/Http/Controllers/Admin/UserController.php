<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $users = User::query()
            ->with('roles')
            ->when(
                $request->filled('filter.search') || $request->filled('filter[search]'),
                function ($query) use ($request) {
                    $search = (string) ($request->input('filter.search') ?? $request->input('filter[search]'));
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%')
                            ->orWhere('phone', 'like', '%' . $search . '%');
                    });
                }
            )
            ->when(
                $request->filled('filter.role') || $request->filled('filter[role]'),
                function ($query) use ($request) {
                    $role = (string) ($request->input('filter.role') ?? $request->input('filter[role]'));
                    $query->whereHas('roles', fn ($rq) => $rq->where('name', $role));
                }
            )
            ->when(
                $request->filled('filter.is_active') || $request->filled('filter[is_active]'),
                function ($query) use ($request) {
                    $isActive = (int) ($request->input('filter.is_active') ?? $request->input('filter[is_active]'));
                    $query->where('is_active', $isActive === 1);
                }
            )
            ->latest('id')
            ->paginate(min($request->integer('per_page', 25), 100));

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

    public function store(Request $request): JsonResponse
    {
        // Only global_admin can create users
        if (!auth()->user()->hasRole('global_admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:admin,customer',
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'phone'     => $validated['phone'] ?? null,
            'password'  => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        return response()->json(new UserResource($user->load('roles')), 201);
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
