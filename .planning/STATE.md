# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Customers can browse electric scooters, place orders, and pay cash on delivery — with an admin who controls the entire catalog, orders, and delivery zones.
**Current focus:** Phase 4 — Cart, Checkout & Orders (in progress)

## Current Position

Phase: 4 of 5 (Cart, Checkout & Orders)
Plan: 2 of N in current phase — 04-02 COMPLETE
Status: Phase 4 in progress — delivery zones + order backend done. Next: 04-03 (customer order frontend).
Last activity: 2026-02-18 — 04-02 complete. Order backend: OrderStatus enum with state machine, 3 migrations, 3 models, OrderService (atomic creation, lockForUpdate, duplicate detection, state machine transitions), 7 routes (3 customer + 4 admin), all live-tested.

Progress: [████████░░] 75%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: ~6min
- Total execution time: ~0.8 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | ~13 min | ~4 min |
| 02-product-catalog | 3 | ~25 min | ~8 min |
| 03-user-accounts | 2 | ~10 min | ~5 min |
| 04-cart-checkout-orders | 2 (so far) | ~7 min | ~4 min |

**Recent Trend:**
- Last 5 plans: 04-02 (order backend), 04-01 (delivery zones), 03-02 (auth frontend), 03-01 (auth backend), 02-03 (admin UI)
- Trend: Active — 04-02 took 6 min (clean execution, 0 deviations)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [04-02]: OrderStatus::from() in Admin controller validates status string against enum before passing to transitionStatus()
- [04-02]: abort(422, msg) for invalid state machine transitions — returns HTTP 422 with clear message
- [04-02]: from_status=null in first OrderStatusLog entry — documents initial pending state without fabricating a from_status
- [04-02]: lockForUpdate on duplicate check query — prevents race condition between concurrent identical orders
- [04-02]: Order number format ORD-{Ymd}-{5-char-uniqid} — human-readable for COD delivery operations
- [04-02]: DeliveryZone::where('is_active', true)->firstOrFail() in createOrder — rejects inactive delivery zones at creation time
- [04-02]: allowed_transitions in OrderResource — frontend knows which action buttons to render without hardcoding the state machine
- [04-01]: Admin DeliveryZoneController aliased as AdminDeliveryZoneController in routes/api.php — avoids PHP class name collision with Customer\DeliveryZoneController
- [04-01]: Admin index() uses paginate(50), customer index() uses get() — admin sees all zones (including inactive), customer gets only active (small list, no pagination needed)
- [04-01]: destroy() lets DB FK constraint bubble as 500 for now — orders table not yet created; constraint enforcement deferred to 04-02
- [03-02]: layout route pattern for guards ({ element: <Guard />, children: [...] }) — React Router v7 recommended; avoids HOC wrapping
- [03-02]: password_confirmation field name kept exact (not confirm_password) — Laravel confirmed rule requires base_field + _confirmation naming
- [03-02]: useAuthStore.getState() inside useMutation onSuccess — mutations run outside React render tree, cannot use hook
- [03-02]: AdminHomePage simplified to Navigate redirect to /admin/products — products page is primary admin entry, no dashboard needed
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
## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 04-02-PLAN.md — order backend (OrderStatus enum state machine, 3 migrations, 3 models, OrderService with atomic creation/lockForUpdate/duplicate detection, 7 order routes, all live-tested).
Resume file: None
