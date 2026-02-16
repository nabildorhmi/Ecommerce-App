# Phase 3: User Accounts - Research

**Researched:** 2026-02-16
**Domain:** Laravel Sanctum auth endpoints + React Router v7 protected routes + Zustand auth store + MUI forms
**Confidence:** HIGH (codebase inspected directly; all Phase 1 scaffolding confirmed in place)

---

## Summary

Phase 3 builds on top of a solid Phase 1 foundation. Sanctum bearer token auth, Spatie roles (admin/customer, guard_name=sanctum), the Zustand auth store with localStorage persistence, and the Axios client with auth header injection are all complete and working. The `AuthController` (register, login, me, logout) is already implemented. Phase 3 adds three backend concerns that do not yet exist: (1) profile update endpoint (PUT /user), (2) admin user management endpoints (list, deactivate), and (3) a migration to add `is_active` + delivery address columns to the users table. On the frontend, all the placeholder pages in `router.tsx` (LoginPage, AdminHomePage) need to be replaced with real implementations, and route guards need to be wired in.

The current `RegisterRequest` has `phone` as `nullable` but AUTH-01 requires phone as mandatory. This is a deliberate discrepancy to fix in 03-01. The `users` table currently has no `address_city`, `address_street`, or `is_active` columns — a new migration is required. The `UserResource` also needs extending to expose the address fields.

The existing admin UI pattern (table + Dialog-based forms, `useQuery`/`useMutation` with TanStack Query, MUI components) is well-established in Phase 2 and should be followed exactly for the admin user management page. React Router v7 library mode (the project's choice) supports a simple `ProtectedRoute` wrapper component using `<Navigate>` or `<Outlet>` — no framework-mode `loader` pattern needed.

**Primary recommendation:** Start with the migration (new `is_active` + address columns) and the `RegisterRequest` phone fix, then build the profile update and admin user endpoints, then wire the frontend route guards and pages.

---

## What Phase 1 Already Built (Do Not Rebuild)

The following are COMPLETE and must not be rebuilt:

| Item | Location | Status |
|------|----------|--------|
| Sanctum installation + config | `config/sanctum.php` | Complete |
| `User` model with `HasRoles`, `HasApiTokens`, `guard_name='sanctum'` | `app/Models/User.php` | Complete |
| `AuthService` (register, login, logout) | `app/Services/AuthService.php` | Complete |
| `AuthController` (register, login, me, logout) | `app/Http/Controllers/Customer/AuthController.php` | Complete |
| Sanctum bearer routes in `api.php` | `routes/api.php` | Complete |
| `role:admin` middleware on `/api/admin/*` | `routes/api.php` | Complete |
| `RegisterRequest` + `LoginRequest` | `app/Http/Requests/Auth/` | Complete (phone fix needed) |
| `UserResource` (id, name, email, phone, role) | `app/Http/Resources/UserResource.php` | Complete (needs address fields) |
| Zustand `useAuthStore` with localStorage persist | `src/features/auth/store.ts` | Complete |
| Axios `apiClient` with Bearer header interceptor | `src/shared/api/client.ts` | Complete |
| 401 interceptor (clears auth + redirects to /login) | `src/shared/api/client.ts` | Complete |
| Role seeder (admin/customer, guard_name=sanctum) | `database/seeders/RoleSeeder.php` | Complete |
| Placeholder `/login` and `/admin` routes | `src/app/router.tsx` | Placeholder — replace in 03-02 |

---

## What Phase 3 Must Build

### Backend (03-01)

| Task | Detail |
|------|--------|
| Migration: add `is_active`, `address_city`, `address_street` to users table | New migration file |
| Fix `RegisterRequest`: make `phone` required (not nullable) | AUTH-01 requirement |
| Add `PUT /user` profile update endpoint | Update name, email, phone, address |
| Add `GET /admin/users` endpoint | List users with role, status, order count |
| Add `PATCH /admin/users/{user}` deactivate endpoint | Toggle `is_active` |
| Extend `UserResource` to include `address_city`, `address_street`, `is_active` | Needed by frontend profile page |
| Block deactivated users at login in `AuthService` | AUTH-06 enforcement |

### Frontend (03-02)

| Task | Detail |
|------|--------|
| Replace `LoginPage` placeholder with real login + register UI | Register form + login form |
| Build customer profile page (`/profile`) | Edit name, email, phone, delivery address |
| Build `ProtectedRoute` wrapper component | Redirect unauthenticated to /login |
| Build `AdminRoute` wrapper component | Redirect non-admin to /products |
| Wire route guards into `router.tsx` | Protect /profile, /admin/*, and admin sub-routes |
| Build admin user management page (`/admin/users`) | Table of users + deactivate action |
| Update `useAuthStore` `User` interface | Add `is_active`, `address_city`, `address_street` |

---

## Standard Stack

### Core (all existing — no new installs)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Laravel Sanctum | bundled | Bearer token auth | Installed, configured |
| spatie/laravel-permission | ^6 | Role-based middleware | Installed, roles seeded |
| React | ^19 | UI | Installed |
| MUI | ^7.3 | Form components, layout | Installed |
| Zustand | ^5 | Auth state with persistence | Installed, store exists |
| TanStack Query | ^5 | API data fetching/mutation | Installed, pattern established |
| react-hook-form | ^7 | Form state + validation | Installed, used in admin forms |
| zod | ^4 | Schema validation | Installed |
| react-router | ^7 | Routing + navigate/redirect | Installed |
| axios | ^1 | HTTP client | Installed, interceptors configured |

**No new package installs are needed for Phase 3.** All required libraries are already in `package.json` and `composer.json`.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `is_active` boolean column | `SoftDeletes` + trashed check | Soft deletes would complicate admin queries; `is_active` is simpler and sufficient — no data loss risk since we only deactivate, not delete |
| `is_active` boolean column | `deactivated_at` timestamp | Timestamp tracks when deactivation happened; useful for auditing but AUTH-06 only says "deactivate", not "audit" — keep simple |
| Custom `AdminRoute` + `ProtectedRoute` wrappers | React Router framework loaders | Project uses library mode (not framework mode) — loaders are a framework-mode pattern |

---

## Architecture Patterns

### Recommended Project Structure Changes

```
trotinette-api/
├── app/Http/Controllers/Customer/
│   ├── AuthController.php          # ADD: updateProfile method
│   └── ProfileController.php       # alternative: new controller for PUT /user
├── app/Http/Controllers/Admin/
│   └── UserController.php          # NEW: index, deactivate
├── app/Http/Requests/
│   ├── Auth/RegisterRequest.php    # MODIFY: phone required
│   └── Auth/UpdateProfileRequest.php  # NEW
│   └── Admin/DeactivateUserRequest.php  # optional, inline is fine
├── app/Http/Resources/
│   └── UserResource.php            # MODIFY: add address, is_active
├── database/migrations/
│   └── 2026_02_XX_add_account_fields_to_users_table.php  # NEW

trotinette-frontend/src/
├── features/auth/
│   ├── store.ts                    # MODIFY: User interface + new fields
│   ├── api/
│   │   └── auth.ts                 # NEW: login, register, logout, updateProfile API calls
│   ├── components/
│   │   ├── LoginForm.tsx           # NEW
│   │   └── RegisterForm.tsx        # NEW
│   └── pages/
│       ├── LoginPage.tsx           # NEW (replaces placeholder)
│       └── ProfilePage.tsx         # NEW
├── features/admin/
│   ├── api/
│   │   └── users.ts                # NEW: useAdminUsers, useDeactivateUser
│   └── pages/
│       └── AdminUsersPage.tsx      # NEW
├── shared/components/
│   ├── ProtectedRoute.tsx          # NEW: requires auth
│   └── AdminRoute.tsx              # NEW: requires admin role
└── app/
    └── router.tsx                  # MODIFY: add guards + new routes
```

### Pattern 1: Profile Update Endpoint (Laravel)

**What:** A separate `PUT /user` route that updates the authenticated user's own profile.
**When to use:** Authenticated customer updating their own data.

```php
// Source: established pattern from existing AuthController
// routes/api.php — inside auth:sanctum group
Route::put('/user', [AuthController::class, 'updateProfile']);

// app/Http/Requests/Auth/UpdateProfileRequest.php
public function rules(): array
{
    return [
        'name'          => ['sometimes', 'string', 'max:255'],
        'email'         => ['sometimes', 'email', Rule::unique('users')->ignore($this->user()->id)],
        'phone'         => ['sometimes', 'nullable', 'string', 'max:20'],
        'address_city'  => ['sometimes', 'nullable', 'string', 'max:100'],
        'address_street'=> ['sometimes', 'nullable', 'string', 'max:255'],
    ];
}

// AuthController::updateProfile
public function updateProfile(UpdateProfileRequest $request): JsonResponse
{
    $request->user()->update($request->validated());
    return response()->json(new UserResource($request->user()->fresh()));
}
```

**Note:** Email uniqueness rule must ignore the current user's own ID (same pattern as `UpdateProductRequest` from Phase 2).

### Pattern 2: Admin User Deactivation

**What:** Admin sets `is_active = false` on a user; deactivated users get a 403 at login.
**When to use:** Admin deactivates a customer account.

```php
// Migration
$table->boolean('is_active')->default(true)->after('phone');
$table->string('address_city')->nullable()->after('is_active');
$table->string('address_street')->nullable()->after('address_city');

// AuthService::login — add deactivation check
if (! $user->is_active) {
    throw new AuthenticationException('Account deactivated.');
}

// Admin deactivate endpoint
public function deactivate(User $user): JsonResponse
{
    // Guard: cannot deactivate an admin
    if ($user->hasRole('admin')) {
        return response()->json(['message' => 'Cannot deactivate admin.'], 422);
    }
    $user->update(['is_active' => false]);
    return response()->json(new UserResource($user));
}
```

### Pattern 3: React Router v7 Protected Routes (Library Mode)

**What:** Wrapper component that checks auth state and redirects if not authenticated.
**When to use:** Any route that requires authentication or a specific role.

```tsx
// Source: React Router v7 library mode — verified via robinwieruch.de
// src/shared/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../features/auth/store';

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// src/shared/components/AdminRoute.tsx
export function AdminRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/products" replace />;
  return <Outlet />;
}

// src/app/router.tsx — usage
{
  element: <ProtectedRoute />,
  children: [
    { path: '/profile', element: <ProfilePage /> },
  ],
},
{
  element: <AdminRoute />,
  children: [
    { path: '/admin', element: <AdminHomePage /> },
    { path: '/admin/users', element: <AdminUsersPage /> },
    { path: '/admin/products', element: <AdminProductsPage /> },
    // ... all other admin routes
  ],
},
```

**Critical:** All existing `/admin/*` routes in `router.tsx` must be moved inside the `AdminRoute` wrapper. They are currently unguarded.

### Pattern 4: Auth API Calls (Frontend)

**What:** Thin API call functions that wrap `apiClient` for auth operations.
**When to use:** Login, register, logout, profile update from form components.

```tsx
// Source: established pattern from existing admin/api/products.ts
// src/features/auth/api/auth.ts
import { apiClient } from '../../../shared/api/client';
import type { User } from '../store';

export async function loginApi(email: string, password: string) {
  const res = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });
  return res.data;
}

export async function registerApi(data: {
  name: string; email: string; password: string;
  password_confirmation: string; phone: string;
}) {
  const res = await apiClient.post<{ token: string; user: User }>('/auth/register', data);
  return res.data;
}

export async function updateProfileApi(data: Partial<User> & {
  address_city?: string; address_street?: string;
}) {
  const res = await apiClient.put<{ data: User }>('/user', data);
  return res.data;
}

export async function logoutApi() {
  await apiClient.post('/auth/logout');
}
```

### Pattern 5: Zustand Auth Store Update

**What:** Extend the existing `User` interface to include new fields from the updated `UserResource`.
**Note:** The store is at `src/features/auth/store.ts` and already uses `persist` with localStorage.

```tsx
// MODIFY existing src/features/auth/store.ts
interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'customer';
  is_active: boolean;         // NEW
  address_city: string | null;   // NEW
  address_street: string | null; // NEW
}

// ADD updateUser action to AuthState
interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void; // NEW — for profile update response
}
```

### Anti-Patterns to Avoid

- **Guard at page level:** Do NOT add auth checks inside individual page components (e.g., `if (!user) return <Navigate .../>` in `ProfilePage`). Use the wrapper `ProtectedRoute`/`AdminRoute` pattern — one guard covers all child routes.
- **Fetch token from state inside interceptors:** Already solved — the existing Axios interceptor uses `useAuthStore.getState().token` (static call). Do NOT call `useAuthStore()` hook inside the interceptor.
- **Missing `email` uniqueness ignore:** When updating a user's email, the unique rule must `->ignore($user->id)`. Missing this will fail the update if the user keeps their current email.
- **Double-checking role on both backend and frontend:** Backend must always enforce `role:admin` middleware. Frontend guards are UX convenience only, not security.
- **Calling `password_confirmation` anything else:** Laravel's `confirmed` rule looks for `{field}_confirmation` — the frontend form must send `password_confirmation`, not `confirm_password`.
- **Deactivating admin users:** The deactivate endpoint must reject requests to deactivate admin-role users (would lock out the admin).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state + validation | Custom useState validation logic | react-hook-form + zod | Already established pattern in Phase 2 admin forms; validation schema is reusable |
| API error display | Custom error state in component | useMutation `isError` + `error.message` | TanStack Query already handles error state |
| Auth state persistence | Custom localStorage read/write | Zustand persist middleware | Already wired in `store.ts` |
| Token header injection | Manually add header in each API call | Existing `apiClient` interceptor | Interceptor already handles this |
| Role checking | Custom role comparison logic | `user.role === 'admin'` from store | Role is already in UserResource response |

**Key insight:** Every authentication infrastructure piece is already in place. Phase 3 is about adding missing endpoints and wiring UI — not rebuilding infrastructure.

---

## Common Pitfalls

### Pitfall 1: Phone Field Mismatch Between Backend and AUTH-01

**What goes wrong:** `RegisterRequest` currently has `phone` as `nullable`. AUTH-01 requires phone as mandatory for registration.
**Why it happens:** Phase 1 scaffolded phone as nullable for flexibility; AUTH-01 tightens this.
**How to avoid:** Change `RegisterRequest` rule from `['nullable', 'string', 'max:20']` to `['required', 'string', 'max:20']`.
**Warning signs:** Registration succeeds without phone number.

### Pitfall 2: Missing Delivery Address Columns

**What goes wrong:** The `users` table currently has no `address_city` or `address_street` columns. `User::update()` with these fields will silently drop them unless columns and `$fillable` are updated.
**Why it happens:** Delivery address is a Phase 3 requirement; Phase 1 did not anticipate it.
**How to avoid:** Write a new migration AND add `address_city`, `address_street` to `User::$fillable`.
**Warning signs:** Profile update returns 200 but address fields are always null in response.

### Pitfall 3: Unguarded Admin Routes in Existing Router

**What goes wrong:** Existing admin routes (`/admin/products`, `/admin/categories`, etc.) are currently defined without any route guard in `router.tsx`. Any unauthenticated user can navigate to them.
**Why it happens:** Phase 2 added admin UI without auth (auth was not yet built).
**How to avoid:** In 03-02, wrap ALL existing `/admin/*` routes inside the new `AdminRoute` wrapper, not just the new ones.
**Warning signs:** Visiting `/admin/products` while logged out does not redirect.

### Pitfall 4: Email Update Uniqueness Validation

**What goes wrong:** `Rule::unique('users', 'email')` without `->ignore($user->id)` will fail if the user submits their current email unchanged (it finds their own record as a duplicate).
**Why it happens:** This exact same pitfall was hit in Phase 2 `UpdateProductRequest` for SKU uniqueness.
**How to avoid:** Always use `Rule::unique('users')->ignore($request->user()->id)` in `UpdateProfileRequest`.
**Warning signs:** Profile update with unchanged email returns 422 validation error.

### Pitfall 5: `is_active` Not Checked at Login

**What goes wrong:** If `is_active = false` is set on a user but `AuthService::login()` doesn't check it, deactivated users can still log in.
**Why it happens:** The deactivation flag is a new column; the existing login logic has no awareness of it.
**How to avoid:** Add `if (!$user->is_active)` check in `AuthService::login()` before issuing a token. Return a 403 or authentication exception.
**Warning signs:** A deactivated user successfully logs in and receives a token.

### Pitfall 6: Zustand Store `User` Interface Out of Sync

**What goes wrong:** The Zustand `User` interface in `store.ts` doesn't include `is_active`, `address_city`, `address_street`. TypeScript will throw errors, or the fields will be silently ignored when stored.
**Why it happens:** Store was defined in Phase 1 before these fields existed.
**How to avoid:** Update the `User` interface in `store.ts` to match the updated `UserResource` fields before writing any UI that uses them.
**Warning signs:** TypeScript compilation errors on `user.address_city`, or those fields showing as `undefined` in the profile form.

### Pitfall 7: `password_confirmation` Field Naming

**What goes wrong:** Frontend sends `confirm_password` instead of `password_confirmation`, failing Laravel's `confirmed` rule silently (or with a confusing error).
**Why it happens:** Common naming convention confusion.
**How to avoid:** Laravel `confirmed` rule always looks for `{field_name}_confirmation`. The register form must send `password_confirmation`.
**Warning signs:** Registration returns 422 with message "The password field confirmation does not match."

---

## Code Examples

### Migration: Add Account Fields

```php
// Source: Laravel 12 official docs — addColumn
// database/migrations/2026_02_XX_add_account_fields_to_users_table.php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->boolean('is_active')->default(true)->after('phone');
        $table->string('address_city', 100)->nullable()->after('is_active');
        $table->string('address_street', 255)->nullable()->after('address_city');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['is_active', 'address_city', 'address_street']);
    });
}
```

### User Model: Updated $fillable

```php
// Source: existing User.php — extend fillable array
protected $fillable = [
    'name',
    'email',
    'password',
    'phone',
    'is_active',       // NEW
    'address_city',    // NEW
    'address_street',  // NEW
];
```

### UserResource: Extended Fields

```php
// Source: existing UserResource.php — extend toArray
public function toArray(Request $request): array
{
    return [
        'id'             => $this->id,
        'name'           => $this->name,
        'email'          => $this->email,
        'phone'          => $this->phone,
        'role'           => $this->getRoleNames()->first(),
        'is_active'      => $this->is_active,        // NEW
        'address_city'   => $this->address_city,     // NEW
        'address_street' => $this->address_street,   // NEW
    ];
}
```

### Admin User Controller

```php
// Source: existing AdminProductController pattern
// app/Http/Controllers/Admin/UserController.php
class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('roles')->paginate(25);
        return UserResource::collection($users)->response();
    }

    public function deactivate(User $user): JsonResponse
    {
        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Cannot deactivate admin.'], 422);
        }
        $user->update(['is_active' => false]);
        return response()->json(new UserResource($user));
    }
}
```

### React Route Guard

```tsx
// Source: robinwieruch.de React Router v7 private routes pattern
// src/shared/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../features/auth/store';

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/products" replace />;
  return <Outlet />;
}
```

### Login Form with react-hook-form + zod

```tsx
// Source: established Phase 2 admin form pattern (ProductForm.tsx)
// src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginFormData) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  // ... MUI TextField components
}
```

### Register Form Zod Schema

```tsx
// Note: password_confirmation must match the field name for Laravel's `confirmed` rule
const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().min(8).max(20),  // required per AUTH-01
  password: z.string().min(8),
  password_confirmation: z.string().min(8),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});
```

### Admin Users API Hook

```tsx
// Source: established Phase 2 pattern from admin/api/products.ts
// src/features/admin/api/users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data;
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiClient.patch(`/admin/users/${userId}/deactivate`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Session cookies (web guard) | Sanctum bearer tokens (api guard) | Phase 1 | Requires `guard_name='sanctum'` on Spatie roles |
| Global context for auth state | Zustand store with persist | Phase 1 | No Provider wrapper needed; `getState()` works outside components |
| `react-router-dom` | `react-router` (single package) | React Router v7 | Import from `'react-router'` not `'react-router-dom'` |

**No deprecated approaches in scope for this phase.**

---

## Open Questions

1. **Order history placeholder scope**
   - What we know: AUTH-05 says "admin can view a user's profile with their order history" — but orders don't exist yet (Phase 4)
   - What's unclear: Should the admin user profile show an empty order history section, or just omit it entirely?
   - Recommendation: Render an empty state ("No orders yet") on the admin user detail view. Don't build the orders table structure yet — just a placeholder that Phase 4 can fill in.

2. **Admin user detail page vs. inline panel**
   - What we know: AUTH-05 requires admin to "open a user's profile" — this implies a separate page or modal
   - What's unclear: Separate page (`/admin/users/:id`) or a Dialog (like category editing)?
   - Recommendation: Given that user detail includes order history (even as a placeholder), use a separate page `/admin/users/:id` — a Dialog becomes cramped. Follow the product edit page pattern.

3. **Profile page route protection for customers only**
   - What we know: `/profile` should only be accessible to logged-in customers, not admins (admins manage via the admin panel)
   - What's unclear: Should admins see `/profile` or be redirected?
   - Recommendation: Allow admins to access `/profile` too — it's their own account profile. The `ProtectedRoute` wrapper (any authenticated user) is sufficient.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `trotinette-api/` and `trotinette-frontend/src/` read verbatim; all existing patterns confirmed
- `.planning/STATE.md` — accumulated decisions from Phases 1 and 2
- `.planning/PROJECT.md` — requirements and constraints

### Secondary (MEDIUM confidence)
- [robinwieruch.de — React Router 7 Private Routes](https://www.robinwieruch.de/react-router-private-routes/) — verified ProtectedRoute + Outlet pattern matches React Router v7 library mode
- [logrocket.com — Authentication with React Router v7](https://blog.logrocket.com/authentication-react-router-v7/) — verified useNavigate + Outlet pattern

### Tertiary (LOW confidence)
- WebSearch results for Laravel user deactivation patterns — multiple sources agree on `is_active` boolean field approach, but specific Laravel 12 docs not verified directly

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — entire stack read directly from `package.json` and `composer.json`; no new libraries needed
- Architecture: HIGH — existing patterns from Phase 2 admin controllers and frontend API hooks are directly applicable and confirmed
- Pitfalls: HIGH — phone nullable issue, missing migration, unguarded routes, and email uniqueness pitfall all confirmed by direct code inspection

**Research date:** 2026-02-16
**Valid until:** 2026-03-18 (stable stack — React Router v7, Zustand v5, TanStack Query v5 are all stable releases)
