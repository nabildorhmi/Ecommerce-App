# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Customers can browse electric scooters, place orders, and pay cash on delivery — with an admin who controls the entire catalog, orders, and delivery zones.
**Current focus:** Phase 1 — Foundation (complete)

## Current Position

Phase: 1 of 5 (Foundation)
Plan: 3 of 3 in current phase — ALL PLANS COMPLETE
Status: Phase 1 complete — ready for Phase 2
Last activity: 2026-02-14 — Plan 03 complete: i18n + RTL infrastructure, FR/EN/AR locale files, smoke test human-verified

Progress: [███░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: ~5min
- Total execution time: ~0.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | ~13 min | ~4 min |

**Recent Trend:**
- Last 5 plans: 01-03 (i18n + RTL), 01-02 (frontend scaffold), 01-01 (Laravel API backend scaffold)
- Trend: Active — 01-01 took 24 min (included PHP/MySQL installation from scratch)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

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

- RTL infrastructure simplification: remove Arabic from RTLProvider, LanguageSwitcher, i18n.ts, and locale files (user removed Arabic support after plan 03 verification). Should be done before Phase 2 feature work begins.

### Blockers/Concerns

- [Phase 4]: Research needed before planning — COD fraud prevention strategy (phone OTP vs. duplicate detection) and order state machine library choice (spatie/laravel-model-states vs. hand-coded). See research/SUMMARY.md Phase 4 research flag.
- [Pre-Phase 1]: MySQL must be running (mysqld process) before API can serve requests. MySQL runs standalone without Windows service.

## Session Continuity

Last session: 2026-02-14
Stopped at: Completed 01-03-PLAN.md — i18n + RTL infrastructure. Phase 1 complete. Next: Phase 2 (catalog).
Resume file: None
