---
phase: quick-10
plan: 01
subsystem: ui, api, auth
tags: [blade, pdf, cms, markdown, react-markdown, password-reset, laravel]

# Dependency graph
requires:
  - phase: quick-9
    provides: PDF invoice generation service (barryvdh/laravel-dompdf)
  - phase: 03-user-accounts
    provides: Auth system, profile page, Sanctum tokens
provides:
  - Compact neutral-palette PDF invoice template
  - Page CMS model with admin CRUD and public API
  - Dynamic page rendering with ReactMarkdown
  - Change password endpoint and profile UI
  - Forgot/reset password flow with email token
affects: []

# Tech tracking
tech-stack:
  added: [react-markdown]
  patterns: [DynamicPage slug-based CMS rendering, password reset with frontend URL config]

key-files:
  created:
    - trotinette-api/app/Models/Page.php
    - trotinette-api/app/Http/Controllers/Customer/PageController.php
    - trotinette-api/app/Http/Controllers/Admin/PageController.php
    - trotinette-api/app/Http/Controllers/Customer/PasswordResetController.php
    - trotinette-api/app/Http/Requests/Auth/ChangePasswordRequest.php
    - trotinette-api/app/Http/Requests/Admin/UpdatePageRequest.php
    - trotinette-api/app/Http/Resources/PageResource.php
    - trotinette-api/database/migrations/2026_02_22_100000_create_pages_table.php
    - trotinette-api/database/seeders/PageSeeder.php
    - trotinette-frontend/src/features/info/api/pages.ts
    - trotinette-frontend/src/features/info/pages/DynamicPage.tsx
    - trotinette-frontend/src/features/admin/api/pages.ts
    - trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
    - trotinette-frontend/src/features/auth/pages/ForgotPasswordPage.tsx
    - trotinette-frontend/src/features/auth/pages/ResetPasswordPage.tsx
  modified:
    - trotinette-api/resources/views/invoices/invoice.blade.php
    - trotinette-api/routes/api.php
    - trotinette-api/app/Http/Controllers/Customer/AuthController.php
    - trotinette-api/app/Providers/AppServiceProvider.php
    - trotinette-api/config/app.php
    - trotinette-api/database/seeders/DatabaseSeeder.php
    - trotinette-frontend/src/features/info/pages/AboutPage.tsx
    - trotinette-frontend/src/features/info/pages/ContactPage.tsx
    - trotinette-frontend/src/features/info/pages/CgvPage.tsx
    - trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx
    - trotinette-frontend/src/features/auth/api/auth.ts
    - trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
    - trotinette-frontend/src/features/auth/components/LoginForm.tsx
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/shared/components/Navbar.tsx

key-decisions:
  - "Page model uses slug as route key for clean /pages/{slug} URLs"
  - "AdminPageController aliased as AdminPageController in routes to avoid collision with Customer PageController"
  - "Password reset email URL points to frontend via config('app.frontend_url') in AppServiceProvider"
  - "Always return 200 on forgot-password to not leak email existence"

patterns-established:
  - "DynamicPage pattern: slug-based CMS pages with ReactMarkdown rendering"
  - "Password reset: AppServiceProvider ResetPassword::createUrlUsing for SPA frontend URL"

# Metrics
duration: 7min
completed: 2026-02-22
---

# Quick Task 10: Redesign PDF Invoice + Editable Pages + Password Management Summary

**Compact neutral PDF invoice, slug-based CMS with admin editor using ReactMarkdown, change password on profile, and forgot/reset password flow with email token**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-22T17:27:45Z
- **Completed:** 2026-02-22T17:34:47Z
- **Tasks:** 5
- **Files modified:** 30

## Accomplishments
- Redesigned PDF invoice template with neutral gray/black palette, reduced spacing and font sizes
- Built Page CMS: model, migration, seeder (4 pages), public GET by slug, admin list+update endpoints
- Replaced 4 hardcoded static pages with DynamicPage component rendering markdown from database
- Added admin Pages editor with table view, edit dialog, and monospace content editing
- Added change password form on profile page with current password validation
- Implemented forgot password (email with token link) and reset password flow

## Task Commits

Each task was committed atomically:

1. **Task 1: Redesign PDF invoice template** - `b53002d` (feat)
2. **Task 2: Editable static pages - backend** - `aebfd39` (feat)
3. **Task 3: Editable static pages - frontend** - `c681864` (feat)
4. **Task 4: Change password in profile page** - `a96507c` (feat)
5. **Task 5: Forgot password and email reset flow** - `87e03db` (feat)

## Files Created/Modified

### Created
- `trotinette-api/app/Models/Page.php` - Page model with slug route key
- `trotinette-api/database/migrations/2026_02_22_100000_create_pages_table.php` - Pages table
- `trotinette-api/database/seeders/PageSeeder.php` - Seeds 4 pages with markdown content
- `trotinette-api/app/Http/Resources/PageResource.php` - Page API resource
- `trotinette-api/app/Http/Controllers/Customer/PageController.php` - Public page show
- `trotinette-api/app/Http/Controllers/Admin/PageController.php` - Admin page list+update
- `trotinette-api/app/Http/Requests/Admin/UpdatePageRequest.php` - Page update validation
- `trotinette-api/app/Http/Requests/Auth/ChangePasswordRequest.php` - Change password validation
- `trotinette-api/app/Http/Controllers/Customer/PasswordResetController.php` - Forgot+reset endpoints
- `trotinette-frontend/src/features/info/api/pages.ts` - usePageBySlug hook
- `trotinette-frontend/src/features/info/pages/DynamicPage.tsx` - Dynamic CMS page component
- `trotinette-frontend/src/features/admin/api/pages.ts` - Admin pages API hooks
- `trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx` - Admin page editor
- `trotinette-frontend/src/features/auth/pages/ForgotPasswordPage.tsx` - Forgot password form
- `trotinette-frontend/src/features/auth/pages/ResetPasswordPage.tsx` - Reset password form

### Modified
- `trotinette-api/resources/views/invoices/invoice.blade.php` - Neutral palette, compact layout
- `trotinette-api/routes/api.php` - Added page, password reset routes
- `trotinette-api/app/Http/Controllers/Customer/AuthController.php` - Added changePassword
- `trotinette-api/app/Providers/AppServiceProvider.php` - Password reset URL to frontend
- `trotinette-api/config/app.php` - Added frontend_url config
- `trotinette-frontend/src/features/info/pages/AboutPage.tsx` - Now uses DynamicPage
- `trotinette-frontend/src/features/info/pages/ContactPage.tsx` - Now uses DynamicPage
- `trotinette-frontend/src/features/info/pages/CgvPage.tsx` - Now uses DynamicPage
- `trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx` - Now uses DynamicPage
- `trotinette-frontend/src/features/auth/api/auth.ts` - Added password APIs
- `trotinette-frontend/src/features/auth/pages/ProfilePage.tsx` - Added password change section
- `trotinette-frontend/src/features/auth/components/LoginForm.tsx` - Added forgot password link
- `trotinette-frontend/src/app/router.tsx` - Added new routes
- `trotinette-frontend/src/shared/components/Navbar.tsx` - Added Pages admin menu item

## Decisions Made
- Page model uses slug as route key for clean /pages/{slug} URLs
- AdminPageController aliased in routes to avoid collision with Customer PageController
- Password reset email URL points to frontend via config('app.frontend_url') in AppServiceProvider
- Always return 200 on forgot-password to not leak email existence
- FRONTEND_URL=http://localhost:5173 added to .env for password reset links

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Note: MAIL_MAILER should be set to 'log' in .env for development (password reset emails will appear in laravel.log).

## Next Phase Readiness
- All 4 features complete and verified
- TypeScript compiles cleanly
- API endpoints tested and returning correct data

## Self-Check: PASSED

All 9 key created files verified on disk. All 5 task commits verified in git log.

---
*Quick Task: 10*
*Completed: 2026-02-22*
