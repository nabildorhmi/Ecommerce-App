# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Customers can browse electric scooters, place orders, and pay cash on delivery — with an admin who controls the entire catalog, orders, and delivery zones.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 5 (Foundation)
Plan: 2 of 3 in current phase (01-01 and 01-02 complete, 01-03 remaining)
Status: In progress
Last activity: 2026-02-14 — Plan 01 complete: Laravel 12 API with Sanctum, RBAC, migrations, SetLocale middleware

Progress: [██░░░░░░░░] 13%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: ~4min
- Total execution time: ~0.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | ~8 min | ~4 min |

**Recent Trend:**
- Last 5 plans: 01-02 (frontend scaffold), 01-01 (Laravel API backend scaffold)
- Trend: Active — 01-01 took 24 min (included PHP/MySQL installation from scratch)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: RTL + i18n wired in Phase 1 before any UI component — non-negotiable per research pitfall analysis
- [Roadmap]: DLVR-02 (city seeder) placed in Phase 2 because checkout (Phase 4) depends on delivery zone data; seeder must exist before checkout testing
- [Roadmap]: I18N-02 (full translation pass) placed in Phase 5 — strings accumulate across Phases 2-4 and a single audit pass is more efficient than incremental per-phase translation
- [Roadmap]: Phase 4 flagged for research before planning — phone OTP vs. duplicate-detection tradeoff for COD fraud prevention is unresolved (see SUMMARY.md)
- [01-02]: Used react-router (not react-router-dom) — React Router v7 library mode ships as single package
- [01-02]: useAuthStore.getState() (static) in Axios interceptors — interceptors are outside React component tree
- [01-02]: Accept-Language fallback to 'fr' (not 'en') — French is primary language for Morocco
- [01-02]: vitest triple-slash reference in vite.config.ts — avoids separate vitest.config.ts file
- [01-02]: RTLProvider and i18n import deferred to plan 03 — insertion points commented in main.tsx
- [01-01]: guard_name=sanctum for roles + User.$guard_name=sanctum required for Spatie to resolve roles correctly in Sanctum bearer token auth (not web guard)
- [01-01]: Sanctum must be installed via composer require, not php artisan install:api (fails silently in non-interactive mode)
- [01-01]: PHP 8.3 via winget, MySQL 8.4 standalone (no service), Composer manual install — no admin rights required

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Research needed before planning — COD fraud prevention strategy (phone OTP vs. duplicate detection) and order state machine library choice (spatie/laravel-model-states vs. hand-coded). See research/SUMMARY.md Phase 4 research flag.
- [Pre-Phase 1]: MySQL must be running (mysqld process) before API can serve requests. MySQL runs standalone without Windows service.

## Session Continuity

Last session: 2026-02-14
Stopped at: Completed 01-01-PLAN.md — Laravel 12 API backend scaffold. Next: 01-03-PLAN.md (i18n + RTL).
Resume file: None
