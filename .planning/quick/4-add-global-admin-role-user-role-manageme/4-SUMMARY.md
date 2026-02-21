---
phase: quick-4
plan: 01
subsystem: admin-auth
tags: [admin, auth, user-management, whatsapp, info-pages, global-admin]
dependency_graph:
  requires: [phase-03-02, phase-04-04]
  provides: [global_admin_role, user_role_management, whatsapp_fab, info_pages]
  affects: [admin_panel, navbar, footer, all_pages]
tech_stack:
  added: [WhatsAppFab_component]
  patterns: [role_based_access, conditional_UI, FAB_pattern]
key_files:
  created:
    - trotinette-frontend/src/shared/components/WhatsAppFab.tsx
    - trotinette-frontend/src/features/info/pages/AboutPage.tsx
    - trotinette-frontend/src/features/info/pages/ContactPage.tsx
    - trotinette-frontend/src/features/info/pages/CgvPage.tsx
    - trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx
  modified:
    - trotinette-api/database/seeders/RoleSeeder.php
    - trotinette-api/app/Http/Controllers/Admin/UserController.php
    - trotinette-api/routes/api.php
    - trotinette-frontend/src/features/auth/store.ts
    - trotinette-frontend/src/features/admin/types.ts
    - trotinette-frontend/src/features/admin/api/users.ts
    - trotinette-frontend/src/shared/components/AdminRoute.tsx
    - trotinette-frontend/src/shared/components/Navbar.tsx
    - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
    - trotinette-frontend/src/shared/components/RootLayout.tsx
    - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    - trotinette-frontend/src/shared/components/Footer.tsx
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/features/admin/components/ProductForm.tsx
decisions:
  - "global_admin role as highest privilege level — cannot be assigned via API for security"
  - "Utilisateurs menu item shown only to global_admin — regular admins don't see user management"
  - "WhatsApp FAB rendered globally in RootLayout — persistent contact on all pages"
  - "WhatsAppButton removed from ProductDetailPage — FAB provides global access"
  - "Store address in Footer brand column — consistent placement with company info"
  - "Info pages as static content — AboutPage, ContactPage, CgvPage, MentionsLegalesPage with French placeholder text"
  - "Role dropdown shows admin and customer only — global_admin assignment restricted to prevent privilege escalation"
  - "Activate button separate from deactivate — distinct actions for reactivation workflow"
metrics:
  duration_minutes: 7
  tasks_completed: 2
  files_created: 6
  files_modified: 15
  lines_added: ~500
  completed_date: 2026-02-21
---

# Quick Task 4: Global Admin Role, User Management, WhatsApp FAB & Info Pages

Global admin role with user/role management capabilities, floating WhatsApp contact button on all pages, and footer info pages with store address.

## What Was Built

### Backend (Task 1)

**Global Admin Role:**
- Added `global_admin` role to RoleSeeder (guard_name: sanctum)
- Updated admin routes middleware to `role:admin|global_admin` (both roles access admin panel)

**User Management Endpoints:**
- `PATCH /admin/users/{user}/role` — Update user role (admin/customer only, requires global_admin)
- `PATCH /admin/users/{user}/activate` — Activate deactivated user (requires global_admin)
- Updated `deactivate` endpoint with global_admin authorization check
- Prevent deactivating global_admin users (422 error)

**Security:**
- Only global_admin can call updateRole, activate, and deactivate
- Regular admins return 403 when attempting role management
- global_admin role cannot be assigned via API (prevents privilege escalation)

### Frontend (Task 2)

**Role Type Updates:**
- Updated User and AdminUser interfaces to include 'global_admin' role
- Updated AdminRoute to accept both admin and global_admin roles

**Navbar:**
- Admin icon and pending orders badge visible to both admin and global_admin
- Utilisateurs menu item conditionally rendered only for global_admin
- Dynamic menu items array with conditional push

**Admin Users Page:**
- Role dropdown (Select) for global_admin to change user roles
- Activate button (green, outlined) for inactive users
- Deactivate button shows only for active non-global_admin users
- Role dropdown hidden for global_admin users (cannot demote themselves)

**WhatsApp FAB:**
- Created WhatsAppFab component (Floating Action Button)
- Fixed position: bottom-right (24px from edges)
- Green color (#25D366) matching WhatsApp brand
- Opens wa.me link with pre-filled French message
- Rendered globally in RootLayout (appears on all pages)
- Removed WhatsAppButton from ProductDetailPage (FAB replaces it)

**Info Pages:**
- AboutPage: Company description, innovation focus, Casablanca location
- ContactPage: Store address, phone, email, WhatsApp mention
- CgvPage: Terms of sale with 6 sections (Objet, Prix, Commande, Livraison, Retours, Garantie)
- MentionsLegalesPage: Legal notices (Editeur, Hebergeur, Propriete intellectuelle, Donnees personnelles)
- All pages use Container maxWidth="md", py={6} for consistent layout
- French placeholder content throughout

**Footer:**
- Updated Company column links to route to info pages
- Removed placeholder items (Technologie, Developpement durable, Carrieres)
- Added store address "123 Bd Mohammed V, Casablanca, Maroc" in brand column
- All footer links functional (A propos, Contact, CGV, Mentions legales)

**Router:**
- Added 4 info page routes: /a-propos, /contact, /cgv, /mentions-legales

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ProductForm category dropdown accessing non-existent property**
- **Found during:** Task 2 build verification
- **Issue:** ProductForm.tsx line 217 accessed `cat.translations?.fr?.name` but AdminCategory interface has no `translations` property
- **Fix:** Changed to `cat.name` (direct property access matching AdminCategory type)
- **Files modified:** trotinette-frontend/src/features/admin/components/ProductForm.tsx
- **Commit:** 1cdb9a1 (included in Task 2 commit)

## Verification Results

**Backend:**
- `php artisan db:seed --class=RoleSeeder` — Seeded global_admin role successfully
- `php artisan route:list --path=admin/users` — 5 routes visible (index, show, activate, deactivate, role)

**Frontend:**
- `npx tsc --noEmit` — Passed with no errors
- `npm run build` — Production build succeeded

## Key Decisions

1. **Global admin security model:** global_admin role cannot be assigned via API (only admin/customer assignable). This prevents privilege escalation attacks where a compromised admin account could create additional global admins.

2. **Conditional menu rendering:** Utilisateurs menu item uses IIFE in Navbar to build dynamic menu array. This ensures clean conditional logic without breaking JSX map flow.

3. **WhatsApp FAB placement:** Rendered in RootLayout (not per-page) for global availability. Fixed positioning with z-index 1000 ensures visibility on all pages without layout conflicts.

4. **Info pages as static content:** No CMS or database backing for info pages. French placeholder content hardcoded in TSX components. Production deployment requires content updates via code changes (acceptable for small site).

5. **Activate as separate action:** Activate button distinct from deactivate (not a toggle). This provides clear UX for reactivation workflow and prevents accidental toggling.

## Self-Check

### Created Files

```bash
[ -f "C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend/src/shared/components/WhatsAppFab.tsx" ] && echo "FOUND" || echo "MISSING"
# FOUND
[ -f "C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend/src/features/info/pages/AboutPage.tsx" ] && echo "FOUND" || echo "MISSING"
# FOUND
[ -f "C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend/src/features/info/pages/ContactPage.tsx" ] && echo "FOUND" || echo "MISSING"
# FOUND
[ -f "C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend/src/features/info/pages/CgvPage.tsx" ] && echo "FOUND" || echo "MISSING"
# FOUND
[ -f "C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx" ] && echo "FOUND" || echo "MISSING"
# FOUND
```

### Commits

```bash
git log --oneline --all | grep -q "3987cc3" && echo "FOUND: 3987cc3" || echo "MISSING: 3987cc3"
# FOUND: 3987cc3
git log --oneline --all | grep -q "1cdb9a1" && echo "FOUND: 1cdb9a1" || echo "MISSING: 1cdb9a1"
# FOUND: 1cdb9a1
```

## Self-Check: PASSED

All created files exist. All commits present in git history.

## Technical Notes

**Backend:**
- Spatie `role:admin|global_admin` middleware syntax works with pipe separator (built-in "any of these roles" logic)
- UserController methods check `auth()->user()->hasRole('global_admin')` for authorization
- Role validation restricts API to `admin` and `customer` only (no `global_admin` in validation rule)

**Frontend:**
- MUI Select with variant="standard" for inline role dropdown (minimal visual weight)
- FormControl wrapper required for proper Select sizing
- WhatsApp FAB uses MUI Fab component with `component="a"` for link behavior
- Info pages follow same layout pattern (Container maxWidth="md", py={6})
- Footer uses Box component={Link} for styled navigation links

**Patterns:**
- Conditional UI based on user role (global_admin checks throughout)
- Fixed positioning with z-index layering (FAB at 1000)
- Static page routing without CMS (acceptable for info pages)
- Security-first role assignment (API restrictions prevent escalation)

---

**Commits:**
- 3987cc3: feat(4-01): add global_admin role and user role management endpoints
- 1cdb9a1: feat(4-01): frontend global_admin support, WhatsApp FAB, info pages

**Duration:** 7 minutes
