---
phase: 4-add-global-admin-role-user-role-manageme
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  # Backend
  - trotinette-api/database/seeders/RoleSeeder.php
  - trotinette-api/app/Http/Controllers/Admin/UserController.php
  - trotinette-api/routes/api.php
  # Frontend - auth/types
  - trotinette-frontend/src/features/auth/store.ts
  - trotinette-frontend/src/features/admin/types.ts
  - trotinette-frontend/src/features/admin/api/users.ts
  # Frontend - components
  - trotinette-frontend/src/shared/components/AdminRoute.tsx
  - trotinette-frontend/src/shared/components/Navbar.tsx
  - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
  # WhatsApp FAB
  - trotinette-frontend/src/shared/components/WhatsAppFab.tsx
  - trotinette-frontend/src/shared/components/RootLayout.tsx
  - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
  # Footer info pages
  - trotinette-frontend/src/shared/components/Footer.tsx
  - trotinette-frontend/src/features/info/pages/AboutPage.tsx
  - trotinette-frontend/src/features/info/pages/ContactPage.tsx
  - trotinette-frontend/src/features/info/pages/CgvPage.tsx
  - trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx
  - trotinette-frontend/src/app/router.tsx
autonomous: true

must_haves:
  truths:
    - "Global admin can log in and see admin panel including Utilisateurs nav item"
    - "Global admin can change a user's role via dropdown on AdminUsersPage"
    - "Global admin can activate and deactivate users"
    - "Regular admin can access admin panel but does NOT see Utilisateurs nav item"
    - "WhatsApp floating icon appears on every page (bottom-right)"
    - "Footer links to A propos, Contact, CGV, Mentions legales work and show content"
    - "Store address appears in footer or contact page"
  artifacts:
    - path: "trotinette-api/database/seeders/RoleSeeder.php"
      provides: "global_admin role creation"
      contains: "global_admin"
    - path: "trotinette-api/app/Http/Controllers/Admin/UserController.php"
      provides: "updateRole and activate endpoints"
      contains: "updateRole"
    - path: "trotinette-frontend/src/shared/components/WhatsAppFab.tsx"
      provides: "Global floating WhatsApp button"
      min_lines: 15
    - path: "trotinette-frontend/src/features/info/pages/AboutPage.tsx"
      provides: "A propos static page"
      min_lines: 10
  key_links:
    - from: "trotinette-frontend/src/shared/components/Navbar.tsx"
      to: "AdminUsersPage"
      via: "Utilisateurs menu item visible only for global_admin"
      pattern: "global_admin"
    - from: "trotinette-frontend/src/shared/components/RootLayout.tsx"
      to: "WhatsAppFab"
      via: "import and render"
      pattern: "WhatsAppFab"
---

<objective>
Add global_admin role with user/role management, floating WhatsApp FAB on all pages, and footer info pages with store address.

Purpose: Extend the admin system with a super-admin role that can manage users and their roles. Improve UX with a persistent WhatsApp contact button and functional footer links to legal/info pages.
Output: Updated backend with global_admin role + role/activate endpoints, updated frontend admin panel with role management, WhatsApp FAB component in RootLayout, 4 info pages linked from footer.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-api/database/seeders/RoleSeeder.php
@trotinette-api/app/Http/Controllers/Admin/UserController.php
@trotinette-api/routes/api.php
@trotinette-api/app/Http/Resources/UserResource.php
@trotinette-frontend/src/features/auth/store.ts
@trotinette-frontend/src/features/admin/types.ts
@trotinette-frontend/src/features/admin/api/users.ts
@trotinette-frontend/src/shared/components/AdminRoute.tsx
@trotinette-frontend/src/shared/components/Navbar.tsx
@trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
@trotinette-frontend/src/features/catalog/components/WhatsAppButton.tsx
@trotinette-frontend/src/shared/components/RootLayout.tsx
@trotinette-frontend/src/shared/components/Footer.tsx
@trotinette-frontend/src/app/router.tsx
@trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Backend — global_admin role, role update + activate endpoints</name>
  <files>
    trotinette-api/database/seeders/RoleSeeder.php
    trotinette-api/app/Http/Controllers/Admin/UserController.php
    trotinette-api/routes/api.php
  </files>
  <action>
1. **RoleSeeder.php** — Add `Role::firstOrCreate(['name' => 'global_admin', 'guard_name' => 'sanctum']);` after the existing two roles.

2. **UserController.php** — Add two new methods:

   a) `updateRole(Request $request, User $user)` — Accepts `{role: string}` in request body. Validate role is one of `['admin', 'customer']` (global_admin cannot be assigned via API for security). Check that the authenticated user `hasRole('global_admin')` — if not, return 403. Remove all current roles from $user via `$user->syncRoles([])`, then `$user->assignRole($request->role)`. Return `new UserResource($user->fresh()->load('roles'))`.

   b) `activate(User $user)` — Check authenticated user `hasRole('global_admin')` — if not, return 403. Set `$user->update(['is_active' => true])`. Return `new UserResource($user->fresh()->load('roles'))`.

   c) Update `deactivate()` — Change the admin check: instead of `if ($user->hasRole('admin'))` blocking deactivation, check `if ($user->hasRole('global_admin'))` to prevent deactivating global admins. Also add global_admin authorization check (same as activate).

3. **routes/api.php** — The current admin routes use `middleware('role:admin')`. Change this to `middleware('role:admin|global_admin')` so both roles can access the admin prefix. Then add two new routes inside the admin group:
   - `Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole']);`
   - `Route::patch('/users/{user}/activate', [AdminUserController::class, 'activate']);`

   Note: The role:admin|global_admin middleware is Spatie's built-in pipe syntax for "any of these roles". Both admin and global_admin will access the admin panel. The updateRole and activate methods have their own internal global_admin check.

After changes, run: `cd trotinette-api && php artisan db:seed --class=RoleSeeder` to create the new role.
  </action>
  <verify>
Run `cd trotinette-api && php artisan route:list --path=admin/users` to confirm the new routes appear. Run `php artisan db:seed --class=RoleSeeder` to confirm seeder works without errors.
  </verify>
  <done>
global_admin role exists in DB. PATCH /admin/users/{id}/role and PATCH /admin/users/{id}/activate routes registered. Both admin and global_admin can access /admin routes. Only global_admin can call updateRole and activate (403 for others).
  </done>
</task>

<task type="auto">
  <name>Task 2: Frontend — global_admin role support, role management UI, WhatsApp FAB, footer info pages</name>
  <files>
    trotinette-frontend/src/features/auth/store.ts
    trotinette-frontend/src/features/admin/types.ts
    trotinette-frontend/src/features/admin/api/users.ts
    trotinette-frontend/src/shared/components/AdminRoute.tsx
    trotinette-frontend/src/shared/components/Navbar.tsx
    trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
    trotinette-frontend/src/shared/components/WhatsAppFab.tsx
    trotinette-frontend/src/shared/components/RootLayout.tsx
    trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    trotinette-frontend/src/shared/components/Footer.tsx
    trotinette-frontend/src/features/info/pages/AboutPage.tsx
    trotinette-frontend/src/features/info/pages/ContactPage.tsx
    trotinette-frontend/src/features/info/pages/CgvPage.tsx
    trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx
    trotinette-frontend/src/app/router.tsx
  </files>
  <action>
**A) Type updates:**

1. **auth/store.ts** — Change `role: 'admin' | 'customer'` to `role: 'admin' | 'customer' | 'global_admin'` in User interface.

2. **admin/types.ts** — Change `role: 'admin' | 'customer'` to `role: 'admin' | 'customer' | 'global_admin'` in AdminUser interface.

**B) Auth/routing updates:**

3. **AdminRoute.tsx** — Change `user.role !== 'admin'` to `user.role !== 'admin' && user.role !== 'global_admin'`. This lets both roles access admin routes.

4. **Navbar.tsx** — Two changes:
   - Line 58 (`enabled: user?.role === 'admin'`): Change to `enabled: user?.role === 'admin' || user?.role === 'global_admin'` for pending orders query.
   - Line 206 (`user.role === 'admin'`): Change to `user.role === 'admin' || user.role === 'global_admin'` to show admin icon for both roles.
   - In the admin menu items array (line 234), add a conditional entry for Utilisateurs: only include `{ to: '/admin/users', icon: <PeopleIcon fontSize="small" />, label: 'Utilisateurs' }` when `user.role === 'global_admin'`. Import `PeopleIcon` from `@mui/icons-material/People`.
   - Build the menu items array dynamically: start with Produits, Categories, Commandes, then conditionally push Utilisateurs if global_admin.

**C) API hooks:**

5. **admin/api/users.ts** — Add two new mutation hooks:
   - `useUpdateUserRole()` — `mutationFn: async ({ id, role }: { id: number; role: string }) => apiClient.patch(`/admin/users/${id}/role`, { role })`. Invalidate `['admin', 'users']` on success.
   - `useActivateUser()` — `mutationFn: async (id: number) => apiClient.patch(`/admin/users/${id}/activate`)`. Invalidate `['admin', 'users']` on success.

**D) AdminUsersPage updates:**

6. **AdminUsersPage.tsx** — Import `useUpdateUserRole`, `useActivateUser`, `useAuthStore`, MUI `Select`, `MenuItem` (from MUI), `FormControl`.
   - Get current user from `useAuthStore` to check if global_admin.
   - In the Role table cell: if current user is global_admin, render a `<Select>` (size="small", variant="standard") with options `admin`, `customer`. The select value is `user.role`. On change, call `updateRoleMutation.mutateAsync({ id: user.id, role: newValue })`. Do NOT show select for global_admin users (they cannot be demoted via UI). For non-global_admin viewers, just show text.
   - In the Actions cell: alongside the existing Deactivate button, add an "Activer" button (color="success", variant="outlined") that shows when `!user.is_active && currentUser?.role === 'global_admin'`. On click, call `activateMutation.mutateAsync(user.id)`.
   - Update the deactivate condition: show deactivate for global_admin users when `user.is_active && user.role !== 'global_admin'` (global_admin can deactivate admins and customers but not other global_admins).

**E) WhatsApp FAB:**

7. **Create `src/shared/components/WhatsAppFab.tsx`** — A floating action button:
   ```
   - Import Fab from '@mui/material/Fab', WhatsAppIcon from '@mui/icons-material/WhatsApp'
   - const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '212600000000'
   - const message = encodeURIComponent("Bonjour, je suis interesse(e) par vos trottinettes")
   - const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
   - Render: <Fab component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: '#25D366', color: '#fff', '&:hover': { bgcolor: '#1DA851' }, zIndex: 1000 }}><WhatsAppIcon /></Fab>
   ```

8. **RootLayout.tsx** — Import and render `<WhatsAppFab />` after `<Footer />` (inside the outer Box, as a sibling).

9. **ProductDetailPage.tsx** — Remove the `import { WhatsAppButton }` line and remove `<WhatsAppButton productName={product.name} />` from the JSX (around line 229). Keep the existing WhatsAppButton.tsx file (it's no longer imported but could be reused later).

**F) Footer info pages:**

10. **Create `src/features/info/pages/AboutPage.tsx`** — Simple static page with Container, Typography. Title: "A propos de MiraiTech". Placeholder content: 2-3 paragraphs in French about the company (electric scooter innovation, Casablanca-based, premium quality). Use MUI Container maxWidth="md", py={6}.

11. **Create `src/features/info/pages/ContactPage.tsx`** — Title: "Contactez-nous". Include placeholder store address: "123 Bd Mohammed V, Casablanca, Maroc". Include phone, email placeholders. WhatsApp contact mention.

12. **Create `src/features/info/pages/CgvPage.tsx`** — Title: "Conditions Generales de Vente". Placeholder French CGV content with sections: Objet, Prix, Commande, Livraison, Retours, Garantie. Use Typography for section headers (variant="h6") and body text.

13. **Create `src/features/info/pages/MentionsLegalesPage.tsx`** — Title: "Mentions Legales". Placeholder French legal notices: editeur du site, hebergeur, propriete intellectuelle, donnees personnelles.

14. **Footer.tsx** — Replace the Company column's static items. Change from a `.map()` over string array with `component="span"` to individual `<Box component={Link}>` elements with proper `to` props:
    - "A propos" -> to="/a-propos"
    - "Contact" -> to="/contact"
    - "Conditions generales de vente" -> to="/cgv"
    - "Mentions legales" -> to="/mentions-legales"
    Remove "Technologie", "Developpement durable", "Carrieres" from this column (they were placeholder items with no pages).
    Add store address in the Brand column after the description text: a Typography with "123 Bd Mohammed V, Casablanca, Maroc" in the same style as the description (color: '#9CA3AF', fontSize: '0.82rem').

15. **router.tsx** — Import the 4 info pages. Add 4 new routes as children of the RootLayout (same level as /products, /login, etc.):
    - `{ path: '/a-propos', element: <AboutPage /> }`
    - `{ path: '/contact', element: <ContactPage /> }`
    - `{ path: '/cgv', element: <CgvPage /> }`
    - `{ path: '/mentions-legales', element: <MentionsLegalesPage /> }`
  </action>
  <verify>
Run `cd trotinette-frontend && npx tsc --noEmit` to confirm no TypeScript errors. Run `npm run build` to confirm production build succeeds.
  </verify>
  <done>
- global_admin role type recognized across frontend
- AdminRoute accepts both admin and global_admin
- Navbar shows Utilisateurs link only for global_admin
- AdminUsersPage has role dropdown (for global_admin) and activate button
- WhatsApp FAB appears fixed bottom-right on all pages
- WhatsAppButton removed from ProductDetailPage
- Footer links to /a-propos, /contact, /cgv, /mentions-legales all work
- Store address visible in footer brand column
- All 4 info pages render with French placeholder content
  </done>
</task>

</tasks>

<verification>
1. Backend: `php artisan route:list --path=admin/users` shows 5 routes (index, show, deactivate, role, activate)
2. Backend: `php artisan db:seed --class=RoleSeeder` runs without error
3. Frontend: `npx tsc --noEmit` passes with no errors
4. Frontend: `npm run build` succeeds
5. Manual: Log in as global_admin, verify Utilisateurs appears in admin menu, can change user roles, can activate/deactivate
6. Manual: Verify WhatsApp green circle FAB visible on homepage, catalog, product detail (bottom-right)
7. Manual: Click footer links (A propos, Contact, CGV, Mentions legales) — each loads a page with French content
8. Manual: Store address visible in footer
</verification>

<success_criteria>
- global_admin role seeded and functional in backend
- Role update and activate API endpoints work with global_admin authorization
- Both admin and global_admin access admin panel; only global_admin sees user management
- WhatsApp FAB visible on every page, opens wa.me link
- 4 info pages accessible from footer with French placeholder content
- Store address displayed in footer
- No TypeScript errors, production build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/4-add-global-admin-role-user-role-manageme/4-SUMMARY.md`
</output>
