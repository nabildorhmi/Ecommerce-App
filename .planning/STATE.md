# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Customers can browse electric scooters, place orders, and pay cash on delivery — with an admin who controls the entire catalog, orders, and delivery zones.
**Current focus:** Phase 3 — User Accounts (in progress)

## Current Position

Phase: 3 of 5 (User Accounts)
Plan: 1 of 2 in current phase — 03-01 COMPLETE
Status: Phase 3 in progress — 03-01 done (auth backend). Next: 03-02 (frontend UI).
Last activity: 2026-02-17 — 03-01 complete. Auth backend: account fields, profile update, admin user management.

Progress: [███████░░░] 55%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: ~7min
- Total execution time: ~0.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | ~13 min | ~4 min |
| 02-product-catalog | 3 | ~25 min | ~8 min |
| 03-user-accounts | 1 (so far) | ~5 min | ~5 min |

**Recent Trend:**
- Last 5 plans: 03-01 (auth backend), 02-03 (admin UI), 02-02 (storefront UI), 02-01 (catalog backend API), 01-03 (i18n + RTL)
- Trend: Active — 03-01 took 5 min (clean execution, 1 auto-fix bug)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [03-01]: $user->refresh() after User::create() — surfaces DB column defaults (is_active=true) on new user registration response
- [03-01]: Deactivation check before password check in AuthService::login() — prevents timing attack leaking valid emails
- [03-01]: Admin cannot deactivate admin users (422) — prevents admin lockout
- [03-01]: order_history returned as empty array in GET /admin/users/{user} — Phase 4 will populate
- [03-01]: UpdateProfileRequest uses Rule::unique()->ignore() for email — allows user to submit same email
- [03-01]: Phone required at registration (was nullable) — enforces AUTH-01
- [02-03]: FormData with Content-Type undefined override on apiClient — browser sets multipart/form-data boundary correctly; POST + _method=PATCH for Laravel multipart PATCH workaround
- [02-03]: Dual query invalidation on admin mutations (['admin','products'] AND ['products']) — storefront reflects admin changes immediately
- [02-03]: Dialog-based CRUD for categories, separate edit page for products — categories are simple (3 fields), products are complex (20+ fields)
- [02-03]: Zod v4 uses { error: '...' } not { invalid_type_error: '...' } — breaking API change from v3; linter auto-corrected
- [02-02]: Price MAD/centimes conversion: FilterBar shows MAD, URL stores centimes (multiply by 100 for API); keeps API integer contract intact
- [02-02]: ProductGallery uses full-res image for main view (not card) — detail page justifies higher resolution
- [02-02]: WhatsApp message hardcoded in French — Moroccan French is primary market language
- [02-02]: VITE_WHATSAPP_NUMBER placeholder in .env — user must replace with real number before production
- [02-02]: Add to Cart disabled (not hidden) for out-of-stock — consistent layout, wired in Phase 4
- [02-01]: nonQueued() on all media conversions + QUEUE_CONVERSIONS_BY_DEFAULT=false in .env — sync conversions in dev, no queue worker needed
- [02-01]: LIKE fallback for search terms < 4 chars — MySQL FULLTEXT ignores words below ft_min_word_len (default 4 InnoDB)
- [02-01]: CategoryService.deleteCategory throws ValidationException if products exist — prevents orphaned product data
- [02-01]: UpdateProductRequest uses PATCH semantics — all fields optional; sku unique rule ignores current product ID via Rule::unique()->ignore()
- [02-01]: MySQL data directory at C:/Users/User/mysql-data — must start mysqld with --datadir=C:/Users/User/mysql-data
- [02-01]: Composer at /c/Users/User/AppData/Local/Programs/composer (phar) — use full path in scripts
- [Phase 1]: USER DECISION: Arabic language removed — only FR and EN supported going forward. RTL infrastructure (RTLProvider, rtlCache, ar locale) to be simplified before Phase 2 begins.
- [01-03]: Module-level Emotion caches (rtlCache/ltrCache) created outside component — prevents CSS re-injection on every render (MUI issue #33892)
- [01-03]: i18n.ts imported before ReactDOM.createRoot in main.tsx — prevents flash of untranslated content
- [01-03]: useLanguage hook is sole entry point for locale changes — never call i18n.changeLanguage() directly in components
- [01-03]: formatCurrency always uses ar-MA-u-nu-latn — Latin digits for MAD prices regardless of UI locale
- [01-03]: @types/stylis required as devDependency — stylis ships without bundled TypeScript declarations
- [Roadmap]: RTL + i18n wired in Phase 1 before any UI component — non-negotiable per research pitfall analysis
- [Roadmap]: DLVR-02 (city seeder) placed in Phase 2 because checkout (Phase 4) depends on delivery zone data; seeder must exist before checkout testing
- [Roadmap]: I18N-02 (full translation pass) placed in Phase 5 — strings accumulate across Phases 2-4 and a single audit pass is more efficient than incremental per-phase translation
- [Roadmap]: Phase 4 flagged for research before planning — phone OTP vs. duplicate-detection tradeoff for COD fraud prevention is unresolved (see SUMMARY.md)
- [01-02]: Used react-router (not react-router-dom) — React Router v7 library mode ships as single package
- [01-02]: useAuthStore.getState() (static) in Axios interceptors — interceptors are outside React component tree
- [01-02]: Accept-Language fallback to 'fr' (not 'en') — French is primary language for Morocco
- [01-02]: vitest triple-slash reference in vite.config.ts — avoids separate vitest.config.ts file
- [01-01]: guard_name=sanctum for roles + User.$guard_name=sanctum required for Spatie to resolve roles correctly in Sanctum bearer token auth (not web guard)
- [01-01]: Sanctum must be installed via composer require, not php artisan install:api (fails silently in non-interactive mode)
- [01-01]: PHP 8.3 via winget, MySQL 8.4 standalone (no service), Composer manual install — no admin rights required

### Pending Todos

None.

### Blockers/Concerns

- [Pre-Phase 2]: MySQL must be started manually before API: `"C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqld.exe" --datadir="C:/Users/User/mysql-data" --console &`
- [Phase 4]: Research needed before planning — COD fraud prevention strategy (phone OTP vs. duplicate detection) and order state machine library choice (spatie/laravel-model-states vs. hand-coded). See research/SUMMARY.md Phase 4 research flag.

## Session Continuity

Last session: 2026-02-17
Stopped at: Completed 03-01-PLAN.md — auth backend (migration, profile update endpoint, admin user management, deactivation guard). Phase 3 plan 1 of 2 done.
Resume file: None
