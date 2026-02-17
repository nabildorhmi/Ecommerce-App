---
phase: 03-user-accounts
plan: 02
subsystem: auth-frontend
tags: [react, zustand, tanstack-query, react-hook-form, zod, mui, i18n, route-guards]

# Dependency graph
requires:
  - phase: 03-01
    provides: PUT /user, GET /admin/users, GET /admin/users/{id}, PATCH /admin/users/{id}/deactivate, is_active field, address fields
  - phase: 01-02
    provides: useAuthStore, apiClient, react-router, i18n setup
provides:
  - Login/register UI wired to Sanctum API with token persistence in localStorage
  - ProtectedRoute — redirects unauthenticated users to /login
  - AdminRoute — redirects unauthenticated to /login, non-admins to /products
  - ProfilePage — edits name, email, phone, address_city, address_street
  - AdminUsersPage — paginated user list with status chips and deactivate action
  - AdminUserDetailPage — read-only profile + order history placeholder
  - All /admin/* routes guarded by AdminRoute; /profile guarded by ProtectedRoute
affects: [04-orders-checkout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - LoginForm/RegisterForm use react-hook-form + zodResolver (consistent with Phase 2 admin forms)
    - useMutation from TanStack Query for API calls in pages (login, register, profile update, deactivate)
    - useAuthStore.getState() (static) for mutations outside component render (inside onSuccess callbacks)
    - Layout route pattern for route guards: element=<ProtectedRoute /> with children array
    - Navigate component (not useNavigate) for redirect in render for already-authenticated guards

key-files:
  created:
    - trotinette-frontend/src/features/auth/api/auth.ts
    - trotinette-frontend/src/features/auth/components/LoginForm.tsx
    - trotinette-frontend/src/features/auth/components/RegisterForm.tsx
    - trotinette-frontend/src/features/auth/pages/LoginPage.tsx
    - trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
    - trotinette-frontend/src/shared/components/ProtectedRoute.tsx
    - trotinette-frontend/src/shared/components/AdminRoute.tsx
    - trotinette-frontend/src/features/admin/api/users.ts
    - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
    - trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx
  modified:
    - trotinette-frontend/src/features/auth/store.ts
    - trotinette-frontend/src/features/admin/types.ts
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/locales/fr/translation.json
    - trotinette-frontend/src/locales/en/translation.json

key-decisions:
  - "layout route pattern for guards (element=<ProtectedRoute/> with children) — React Router v7 recommended pattern; avoids HOC wrapping"
  - "AdminHomePage simplified to Navigate redirect to /admin/products — no dashboard needed, products page is the primary admin view"
  - "password_confirmation field name kept as-is (not confirm_password) — Laravel confirmed rule requires field name = base_field + _confirmation"
  - "useAuthStore.getState() inside useMutation onSuccess — mutations run outside React render tree, cannot use hook"

patterns-established:
  - "Auth guard as layout route: { element: <Guard />, children: [...routes] } pattern"
  - "Admin user API hooks mirror product API hooks exactly (useAdminUser, useAdminUsers, useDeactivateUser)"

# Metrics
duration: ~5min
completed: 2026-02-17
---

# Phase 3 Plan 02: Auth Frontend — Login/Register, Profile, Route Guards, Admin User Management

**React auth frontend wired end-to-end: login/register with Sanctum token, profile editing with address fields, ProtectedRoute + AdminRoute layout guards, admin user list with deactivation and detail page.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-17T20:10:26Z
- **Completed:** 2026-02-17T20:15:21Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- Auth store extended with is_active, address_city, address_street fields and updateUser action
- Auth API module: loginApi, registerApi, logoutApi, updateProfileApi — all use existing apiClient
- ProtectedRoute and AdminRoute as layout routes (React Router v7 pattern) — zero unguarded admin routes
- LoginForm and RegisterForm with react-hook-form + zodResolver, password_confirmation field uses exact Laravel naming
- LoginPage with MUI Tabs switching login/register, redirects admin to /admin/products, customer to /products
- ProfilePage pre-populates from auth store, syncs back via updateUser on successful PUT /user
- Admin users API hooks (useAdminUsers, useAdminUser, useDeactivateUser) matching product API pattern
- AdminUsersPage: paginated table with active/inactive chips, per-row deactivate button with confirm dialog
- AdminUserDetailPage: read-only profile card, order history placeholder, deactivate button
- Router completely rewired: all /admin/* inside AdminRoute, /profile inside ProtectedRoute
- i18n keys added: auth.*, profile.*, adminUsers.*, adminUserDetail.* in both FR and EN

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth store update, API layer, route guards, and login/register pages** - `f1c757d` (feat)
2. **Task 2: Profile page, admin user management, and router rewiring** - `8df1d3c` (feat)

## Files Created/Modified

**Created:**
- `trotinette-frontend/src/features/auth/api/auth.ts` — loginApi, registerApi, logoutApi, updateProfileApi
- `trotinette-frontend/src/features/auth/components/LoginForm.tsx` — email + password with zod validation
- `trotinette-frontend/src/features/auth/components/RegisterForm.tsx` — name/email/phone/password/password_confirmation
- `trotinette-frontend/src/features/auth/pages/LoginPage.tsx` — MUI Tabs switching login/register, useMutation
- `trotinette-frontend/src/features/auth/pages/ProfilePage.tsx` — profile edit form with address fields
- `trotinette-frontend/src/shared/components/ProtectedRoute.tsx` — Navigate to /login if no user
- `trotinette-frontend/src/shared/components/AdminRoute.tsx` — Navigate to /login or /products for non-admin
- `trotinette-frontend/src/features/admin/api/users.ts` — useAdminUsers, useAdminUser, useDeactivateUser
- `trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx` — paginated table + deactivate dialog
- `trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx` — detail card + order placeholder

**Modified:**
- `trotinette-frontend/src/features/auth/store.ts` — is_active, address_city, address_street on User; updateUser action
- `trotinette-frontend/src/features/admin/types.ts` — AdminUser and PaginatedUsers interfaces added
- `trotinette-frontend/src/app/router.tsx` — rewired with ProtectedRoute/AdminRoute layout guards
- `trotinette-frontend/src/locales/fr/translation.json` — auth.*, profile.*, adminUsers.*, adminUserDetail.* keys
- `trotinette-frontend/src/locales/en/translation.json` — same keys in English

## Decisions Made

- **Layout route pattern for guards:** `{ element: <Guard />, children: [...] }` is the React Router v7 recommended pattern. It avoids HOC wrapping and integrates cleanly with `createBrowserRouter`. All protected routes simply go inside the children array.
- **AdminHomePage as Navigate redirect:** No dashboard UI needed for Phase 3; /admin/products is the primary admin entry point. The placeholder component becomes a simple Navigate redirect.
- **password_confirmation field name:** Laravel's `confirmed` validation rule requires the confirmation field to be named `base_field_confirmation`. Using `confirm_password` would cause a 422 on the backend.
- **useAuthStore.getState() in onSuccess:** TanStack Query's onSuccess callbacks run outside React's render tree. Cannot use `useAuthStore()` hook there — must use the static `.getState()` method.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external configuration needed for this plan.

## Next Phase Readiness

- All 6 AUTH requirements (AUTH-01 through AUTH-06) satisfied end-to-end
- Phase 4 (orders/checkout) can use ProtectedRoute for order-related pages
- Auth store provides user.address_city and user.address_street for pre-filling checkout

---
*Phase: 03-user-accounts*
*Completed: 2026-02-17*

## Self-Check: PASSED

**Files verified (all present):**
- trotinette-frontend/src/features/auth/store.ts (37 lines) - FOUND
- trotinette-frontend/src/features/auth/api/auth.ts (67 lines) - FOUND
- trotinette-frontend/src/features/auth/components/LoginForm.tsx (78 lines) - FOUND
- trotinette-frontend/src/features/auth/components/RegisterForm.tsx (124 lines) - FOUND
- trotinette-frontend/src/features/auth/pages/LoginPage.tsx (110 lines) - FOUND
- trotinette-frontend/src/features/auth/pages/ProfilePage.tsx (170 lines) - FOUND
- trotinette-frontend/src/shared/components/ProtectedRoute.tsx (16 lines) - FOUND
- trotinette-frontend/src/shared/components/AdminRoute.tsx (20 lines) - FOUND
- trotinette-frontend/src/features/admin/api/users.ts (44 lines) - FOUND
- trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx (194 lines) - FOUND
- trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx (186 lines) - FOUND
- trotinette-frontend/src/app/router.tsx (79 lines) - FOUND

**Commits verified:**
- f1c757d (Task 1) - FOUND
- 8df1d3c (Task 2) - FOUND

**Build:** npm run build passes with 0 TypeScript errors, 0 build errors.

**Must-have criteria:**
- ProtectedRoute contains Navigate - PASS
- AdminRoute contains Navigate - PASS
- LoginPage min_lines 20 (actual: 110) - PASS
- ProfilePage min_lines 30 (actual: 170) - PASS
- AdminUsersPage min_lines 30 (actual: 194) - PASS
- AdminUserDetailPage min_lines 20 (actual: 186) - PASS
- LoginPage uses setAuth - PASS
- ProtectedRoute uses useAuthStore - PASS
- Router wraps AdminRoute - PASS
- ProfilePage uses updateProfile - PASS
