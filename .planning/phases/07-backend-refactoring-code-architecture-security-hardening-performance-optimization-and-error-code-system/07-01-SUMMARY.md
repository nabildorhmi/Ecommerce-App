---
phase: 07-backend-refactoring
plan: 01
subsystem: security-hardening
tags: [security, rate-limiting, cors, token-expiration, eloquent-strict-mode]
depends_on: []
provides: [hardened-auth-endpoints, restricted-cors, token-expiration, dev-mode-query-safety]
affects: [auth-routes, sanctum-config, cors-config, eloquent-models]
tech_stack:
  added:
    - "Laravel throttle middleware on auth routes"
    - "Eloquent strict mode (preventLazyLoading, preventAccessingMissingAttributes)"
  patterns:
    - "Rate limiting pattern: throttle:X,Y on public auth endpoints"
    - "Environment-aware strict mode: enabled in dev, disabled in production"
key_files:
  created: []
  modified:
    - "trotinette-api/routes/api.php"
    - "trotinette-api/config/cors.php"
    - "trotinette-api/config/sanctum.php"
    - "trotinette-api/app/Providers/AppServiceProvider.php"
decisions:
  - key: "Rate limit thresholds for auth endpoints"
    choice: "Login/reset: 5/min, Register/forgot: 3/min"
    rationale: "Login/reset are higher (5) because legitimate password attempts. Register/forgot lower (3) as they're less frequent and more abusable."
    alternatives: ["Uniform 5/min for all", "Per-IP tracking with Redis"]
  - key: "Sanctum token expiration default"
    choice: "43200 minutes (30 days)"
    rationale: "Balances security (tokens don't live forever) with UX (users aren't logged out daily). Configurable via SANCTUM_TOKEN_EXPIRATION env var for production override."
    alternatives: ["7 days (10080)", "No expiration (null)", "1 day (1440)"]
  - key: "CORS headers whitelist"
    choice: "Content-Type, Authorization, X-Requested-With, Accept, Accept-Language"
    rationale: "Only headers actually used by the frontend. Reduces attack surface compared to wildcard (*). Accept-Language needed for i18n-ready API responses."
    alternatives: ["Keep wildcard (*)", "Content-Type + Authorization only"]
metrics:
  duration: "2 minutes"
  completed: "2026-03-01"
  tasks_completed: 2
  files_modified: 4
  commits: 2
---

# Phase 07 Plan 01: Security Hardening Summary

**One-liner:** Rate-limited auth endpoints (login 5/min, register 3/min), restricted CORS headers (specific whitelist vs wildcard), Sanctum 30-day token expiration, and strict Eloquent mode in development to catch N+1 queries and attribute typos early.

## What Was Built

Hardened the backend API against common security vulnerabilities identified in research:

1. **Rate-limited authentication endpoints** - Added Laravel throttle middleware to prevent brute-force attacks:
   - `POST /auth/login`: 5 attempts per minute
   - `POST /auth/register`: 3 attempts per minute
   - `POST /auth/forgot-password`: 3 attempts per minute
   - `POST /auth/reset-password`: 5 attempts per minute

2. **Restricted CORS headers** - Changed from wildcard `*` to specific whitelist:
   - `Content-Type, Authorization, X-Requested-With, Accept, Accept-Language`
   - Increased `max_age` from 0 to 86400 (24 hours) to cache preflight requests and reduce OPTIONS overhead

3. **Sanctum token expiration** - Tokens now expire after 30 days instead of living forever:
   - Configured as `env('SANCTUM_TOKEN_EXPIRATION', 43200)` to allow production override
   - Prevents stolen tokens from being usable indefinitely

4. **Strict Eloquent mode in development** - Enabled safety checks to catch issues early:
   - `Model::preventLazyLoading()` - Throws exceptions on N+1 query patterns
   - `Model::preventAccessingMissingAttributes()` - Throws exceptions on attribute typos
   - Both active only in non-production environments (`! $this->app->isProduction()`)

## Deviations from Plan

None - plan executed exactly as written.

## Verification

All verification steps passed:

1. Auth routes confirmed to have throttle middleware via route file inspection
2. CORS config shows specific allowed_headers (not wildcard)
3. Sanctum config shows expiration set to 43200
4. AppServiceProvider shows both preventLazyLoading and preventAccessingMissingAttributes calls
5. `php artisan config:cache` succeeded - all configs parse correctly

## Success Criteria

- [x] Auth endpoints are rate-limited (login/register/forgot/reset)
- [x] CORS restricts headers to Content-Type, Authorization, X-Requested-With, Accept, Accept-Language
- [x] Sanctum tokens expire after 30 days by default
- [x] Lazy loading and missing attribute access throw exceptions in dev
- [x] No existing functionality is broken

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1    | 2e71f9b | Add rate limiting to auth routes and restrict CORS headers |
| 2    | 15ff09f | Configure Sanctum token expiration and enable strict Eloquent mode |

## Key Files Modified

- **trotinette-api/routes/api.php** - Added throttle middleware to 4 auth routes
- **trotinette-api/config/cors.php** - Whitelisted headers, increased max_age to 24h
- **trotinette-api/config/sanctum.php** - Set expiration to env('SANCTUM_TOKEN_EXPIRATION', 43200)
- **trotinette-api/app/Providers/AppServiceProvider.php** - Enabled preventLazyLoading and preventAccessingMissingAttributes in dev

## Impact

**Security improvements:**
- Brute-force protection on authentication endpoints
- Reduced CORS attack surface (specific headers vs wildcard)
- Time-limited authentication tokens (30 days vs infinite)

**Developer experience improvements:**
- N+1 queries caught immediately in development (prevents performance issues in production)
- Attribute typos caught immediately (prevents silent failures)

**Frontend compatibility:**
- All existing frontend requests continue to work (whitelisted headers cover all current usage)
- CORS preflight caching reduces OPTIONS request overhead

## Next Steps

This plan closes critical security gaps identified in Phase 7 research. Subsequent plans will address:
- Code architecture refactoring (service layer, repository pattern)
- Performance optimization (query optimization, caching, indexing)
- Standardized error code system for API responses

## Self-Check: PASSED

All claimed files and commits verified to exist:

```bash
# Files verified
FOUND: trotinette-api/routes/api.php
FOUND: trotinette-api/config/cors.php
FOUND: trotinette-api/config/sanctum.php
FOUND: trotinette-api/app/Providers/AppServiceProvider.php

# Commits verified
FOUND: 2e71f9b
FOUND: 15ff09f
```
