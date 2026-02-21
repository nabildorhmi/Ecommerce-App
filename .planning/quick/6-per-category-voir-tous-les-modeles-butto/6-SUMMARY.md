---
phase: quick-6
plan: 01
subsystem: ui-navigation-admin
tags: [homepage, navbar, admin, user-management, search]
dependency_graph:
  requires: [quick-5]
  provides: [per-category-navigation, navbar-search, admin-user-creation]
  affects: [HomePage, Navbar, AdminUsersPage, UserController]
tech_stack:
  added: []
  patterns: [dialog-crud, search-input-form]
key_files:
  created: []
  modified:
    - trotinette-frontend/src/features/home/pages/HomePage.tsx
    - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
    - trotinette-frontend/src/features/admin/api/users.ts
    - trotinette-frontend/src/shared/components/Navbar.tsx
    - trotinette-api/app/Http/Controllers/Admin/UserController.php
    - trotinette-api/routes/api.php
decisions:
  - Per-category "Voir tous" buttons use filter[category_id]=N query param
  - Single bottom button removed from FeaturedSection in favor of per-category buttons
  - Admin user creation restricted to global_admin role only
  - Search input navigates to /products?filter[search]=query (leverages existing search filter)
  - Desktop search input positioned with ml:auto between categories and right actions
  - Mobile search input placed at top of drawer above category navigation
metrics:
  duration_minutes: 2
  tasks_completed: 2
  files_modified: 6
  commits: 2
  completed_date: 2026-02-21
---

# Quick Task 6: Per-category "Voir tous" Button & Admin User Creation & Search Bar Summary

**One-liner:** Per-category "Voir tous les modeles" buttons on homepage, global_admin user creation dialog, and navbar search input navigating to filtered catalog.

## What Was Built

Three independent UI/backend enhancements:

1. **Per-category navigation on homepage** — Each category featured section now has its own "Voir tous les modeles" button linking to `/products?filter[category_id]=N`. Removed the single bottom button that linked to all products.

2. **Admin user creation** — Global admins can now create new users via a dialog in AdminUsersPage with fields for name, email, phone, password, and role (admin/customer). Backend POST /admin/users endpoint with global_admin authorization check.

3. **Navbar search bar** — Added compact search input in desktop navbar (between categories and right actions) and mobile drawer (at top). Submitting the search navigates to `/products?filter[search]=query`.

## Implementation Details

### Task 1: Per-category buttons & Admin user creation

**HomePage.tsx:**
- Updated `CategoryFeaturedRowProps` interface to include `categoryId: number`
- Added per-category "Voir tous les modeles" button below each category's product scroll area
- Changed iteration from `categoryGroups.values()` to `categoryGroups.entries()` to access categoryId
- Removed single bottom button from FeaturedSection

**UserController.php:**
- Added `use Illuminate\Support\Facades\Hash;` import
- Implemented `store()` method with:
  - Global_admin role check (403 if unauthorized)
  - Validation for name, email (unique), phone (nullable), password (min 8), role (admin|customer)
  - User creation with `Hash::make()` for password
  - Role assignment via `assignRole()`
  - Returns 201 with UserResource

**routes/api.php:**
- Added `Route::post('/users', [AdminUserController::class, 'store']);` in admin middleware group

**users.ts:**
- Added `useCreateUser` mutation hook with POST /admin/users
- Invalidates `['admin', 'users']` query on success

**AdminUsersPage.tsx:**
- Added imports: `TextField`, `InputLabel`, `useCreateUser`
- Added state: `createOpen`, `createForm` (name, email, phone, password, role)
- Added `handleCreateUser` async function
- Wrapped "Utilisateurs" Typography in flex Box with "Ajouter un utilisateur" button (conditional on global_admin role)
- Added Dialog with form fields (TextField for name/email/phone/password, Select for role)
- Submit button disabled if mutation pending or required fields empty

### Task 2: Navbar search bar

**Navbar.tsx:**
- Added imports: `InputBase`, `SearchIcon`
- Added state: `searchQuery`, `mobileSearchOpen`
- Added `handleSearch()` function:
  - Trims query, returns early if empty
  - Navigates to `/products?filter[search]=${encodeURIComponent(trimmed)}`
  - Clears search input, closes mobile drawer
- **Desktop:** Added search form Box with `ml: 'auto'` after category menu, before closing desktop nav Box
  - Styled with `bgcolor: 'rgba(255,255,255,0.06)'`, border, focus-within highlight
  - SearchIcon + InputBase with placeholder "Rechercher...", width 160px
- **Mobile:** Added search form Box at top of Drawer Stack (before "TOUS LES SCOOTERS")
  - Styled with `bgcolor: 'action.hover'`, borderRadius 6px
  - SearchIcon + InputBase with flex: 1

## Deviations from Plan

None — plan executed exactly as written. All tasks completed without architectural changes or blocking issues.

## Verification

- TypeScript compilation passes without errors (`npx tsc --noEmit`)
- HomePage displays per-category "Voir tous les modeles" buttons with correct `filter[category_id]=N` links
- Single bottom button removed from FeaturedSection
- POST /admin/users endpoint created with global_admin authorization
- AdminUsersPage shows "Ajouter un utilisateur" button only for global_admin users
- Create user dialog opens with all required fields (name, email, phone, password, role)
- Desktop navbar shows compact search input between categories and right actions
- Mobile drawer shows search input at top
- Submitting search (Enter key) navigates to `/products?filter[search]=query`
- Search input clears and mobile drawer closes after submission

## Commits

1. **3e4fa90** — feat(quick-6): add per-category buttons and admin user creation
   - Modified: HomePage.tsx, UserController.php, api.php, users.ts, AdminUsersPage.tsx
   - Added categoryId prop, per-category buttons, removed single button, POST /admin/users endpoint, create user dialog

2. **dce44ff** — feat(quick-6): add search bar to navbar
   - Modified: Navbar.tsx
   - Added desktop search input (ml:auto), mobile search input (top of drawer), handleSearch navigation

## Self-Check: PASSED

**Created files:** None (all modifications)

**Modified files exist:**
- trotinette-frontend/src/features/home/pages/HomePage.tsx — FOUND
- trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx — FOUND
- trotinette-frontend/src/features/admin/api/users.ts — FOUND
- trotinette-frontend/src/shared/components/Navbar.tsx — FOUND
- trotinette-api/app/Http/Controllers/Admin/UserController.php — FOUND
- trotinette-api/routes/api.php — FOUND

**Commits exist:**
- 3e4fa90 — FOUND
- dce44ff — FOUND

All artifacts verified. Plan execution complete.
