---
phase: 07-backend-refactoring
plan: 02
subsystem: error-handling
tags: [rfc-7807, error-codes, api, standardization]
dependency_graph:
  requires: []
  provides: [rfc-7807-error-format, error-code-enum]
  affects: [all-api-endpoints, frontend-error-parsing]
tech_stack:
  added: [rfc-7807-problem-details]
  patterns: [centralized-exception-handling, enum-error-codes]
key_files:
  created:
    - trotinette-api/app/Enums/ErrorCode.php
  modified:
    - trotinette-api/bootstrap/app.php
decisions:
  - ErrorCode enum follows OrderStatus enum pattern with string-backed values and label() method
  - RFC 7807 format applied via renderable callbacks in withExceptions closure (Laravel 12 pattern)
  - expectsJson() check preserves HTML error pages for web routes
  - ValidationException includes both RFC 7807 envelope AND errors field for field-level details
  - No catch-all for generic Throwable - Laravel's default 500 handler already returns JSON for API requests
  - HttpException handler uses SYS_INTERNAL code for abort() calls - domain-specific codes will be added when controllers use ErrorCode explicitly
metrics:
  duration_seconds: 127
  duration_human: ~2 min
  tasks_completed: 2
  files_created: 1
  files_modified: 1
  commits: 2
  completed_date: 2026-03-01
---

# Phase 07 Plan 02: RFC 7807 Error Handling Summary

**One-liner:** Standardized all API errors to RFC 7807 Problem Details format with ErrorCode enum for domain-specific error codes (AUTH_xxx, ORD_xxx, PROD_xxx, VAL_xxx, SYS_xxx).

## Objective

Replace inconsistent error formats across controllers with a single predictable RFC 7807 format. Frontend currently has multiple error parsing strategies — this standardizes to one.

## What Was Built

### ErrorCode Enum (Task 1)

Created `app/Enums/ErrorCode.php` following the OrderStatus enum pattern:

**Categories:**
- **AUTH_xxx:** Authentication/authorization errors (AUTH_001-005)
- **ORD_xxx:** Order-related errors (ORD_001-005)
- **PROD_xxx:** Product-related errors (PROD_001-002)
- **VAL_xxx:** Validation errors (VAL_001)
- **SYS_xxx:** System errors (SYS_001-003)

Each code has:
- String value (e.g., "ORD_001")
- Human-readable `label()` method (e.g., "Duplicate Order")

**Verification:**
```bash
php artisan tinker --execute="echo App\Enums\ErrorCode::ORD_DUPLICATE->value;"
# Output: ORD_001

php artisan tinker --execute="echo App\Enums\ErrorCode::ORD_DUPLICATE->label();"
# Output: Duplicate Order
```

### RFC 7807 Error Rendering (Task 2)

Modified `bootstrap/app.php` to add 7 renderable callbacks in the `withExceptions` closure:

1. **ValidationException (422)** - Includes `errors` field with field-level details
2. **AuthenticationException (401)** - Returns AUTH_003 code
3. **AuthorizationException (403)** - Returns AUTH_004 code
4. **ModelNotFoundException (404)** - Dynamic model name in title (e.g., "Product Not Found")
5. **NotFoundHttpException (404)** - Route not found errors
6. **ThrottleRequestsException (429)** - Rate limiting
7. **HttpException (catch-all)** - For abort() calls with dynamic status codes

**RFC 7807 Format:**
```json
{
  "type": "https://httpstatuses.com/404",
  "title": "Not Found",
  "status": 404,
  "detail": "The requested resource was not found.",
  "code": "SYS_003",
  "instance": "http://localhost:8000/api/nonexistent",
  "timestamp": "2026-03-01T15:49:30+00:00"
}
```

**Verification:**
```bash
curl -s -H "Accept: application/json" http://localhost:8000/api/nonexistent | python -m json.tool
# Returns RFC 7807 JSON with status 404, code SYS_003

curl -s -H "Accept: application/json" http://localhost:8000/api/user | python -m json.tool
# Returns RFC 7807 JSON with status 401, code AUTH_003
```

## Technical Decisions

**1. ErrorCode enum pattern**
- Followed existing `OrderStatus.php` enum structure for consistency
- String-backed values (not integer) for API readability
- `label()` method provides human-readable descriptions

**2. Laravel 12 exception handling approach**
- Used `withExceptions` closure with renderable callbacks (not separate Handler class)
- Each exception type gets dedicated callback for precise control
- `expectsJson()` check preserves HTML error pages for web routes

**3. Validation errors get dual structure**
- RFC 7807 envelope (type, title, status, detail, code, instance, timestamp)
- PLUS `errors` field with field-level details
- Frontend can parse both structured codes AND per-field validation messages

**4. No catch-all for generic Throwable**
- Laravel's default 500 handler already returns JSON for API requests in production
- Development mode shows detailed error page (more useful for debugging)
- Avoiding catch-all prevents masking unexpected errors

**5. HttpException handler uses SYS_INTERNAL**
- Current abort() calls don't specify domain-specific codes
- Future: Controllers can throw custom exceptions with specific ErrorCodes
- SYS_INTERNAL is safe default for generic abort()

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification steps passed:

- ✓ ErrorCode enum loads without errors in tinker
- ✓ curl to /api/nonexistent returns RFC 7807 JSON 404 with code SYS_003
- ✓ curl to /api/user (no auth) returns RFC 7807 JSON 401 with code AUTH_003
- ✓ All renderable callbacks present in bootstrap/app.php
- ✓ Existing API functionality unaffected (only error format changed, status codes preserved)

## Impact

**Frontend Benefits:**
- Single error parsing strategy instead of multiple (currently handles Laravel validation, Sanctum auth, and generic errors differently)
- Reliable `code` field for programmatic error handling (e.g., show specific UI for AUTH_002)
- Consistent `errors` field structure for validation

**Backend Benefits:**
- Centralized error handling - no controller-specific error formatting
- Future-proof for domain-specific errors (controllers can reference ErrorCode enum)
- Compliance with RFC 7807 standard (machine-readable, widely supported)

**No Breaking Changes:**
- HTTP status codes unchanged (422, 401, 404, etc. preserved)
- Response structure additive (adds fields, doesn't remove)
- Web routes unaffected (expectsJson() check)

## Next Steps

**Immediate:**
- Frontend can migrate to single error parser using `error.code` field
- Consider replacing abort(422, 'message') with custom exceptions that specify ErrorCode

**Future Enhancements:**
- Add custom exception classes (e.g., `DuplicateOrderException` with ORD_001)
- Expand ErrorCode enum as new domain errors are discovered
- Consider adding `meta` field to RFC 7807 responses for additional context

## Self-Check

**Created files verification:**
```bash
[ -f "trotinette-api/app/Enums/ErrorCode.php" ] && echo "FOUND: trotinette-api/app/Enums/ErrorCode.php" || echo "MISSING: trotinette-api/app/Enums/ErrorCode.php"
```
**Result:** FOUND: trotinette-api/app/Enums/ErrorCode.php

**Modified files verification:**
```bash
[ -f "trotinette-api/bootstrap/app.php" ] && echo "FOUND: trotinette-api/bootstrap/app.php" || echo "MISSING: trotinette-api/bootstrap/app.php"
```
**Result:** FOUND: trotinette-api/bootstrap/app.php

**Commits verification:**
```bash
git log --oneline --all | grep -q "de5f7bb" && echo "FOUND: de5f7bb" || echo "MISSING: de5f7bb"
git log --oneline --all | grep -q "e8e52cb" && echo "FOUND: e8e52cb" || echo "MISSING: e8e52cb"
```
**Result:**
- FOUND: de5f7bb (Task 1: ErrorCode enum)
- FOUND: e8e52cb (Task 2: RFC 7807 rendering)

## Self-Check: PASSED

All created files exist, all commits verified, all verification tests passed.
