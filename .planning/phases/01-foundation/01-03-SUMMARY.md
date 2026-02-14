---
phase: 01-foundation
plan: 03
subsystem: ui
tags: [react, i18next, mui, rtl, emotion, stylis, i18n, typescript]

# Dependency graph
requires:
  - phase: 01-02
    provides: React 19 + Vite scaffold with MUI, @mui/stylis-plugin-rtl, @emotion/cache, stylis, i18next all pre-installed
provides:
  - i18next initialized with FR/EN locale resources, browser language detection, fr fallback
  - RTLProvider (Emotion CacheProvider + MUI ThemeProvider) with LTR/RTL direction switching
  - useLanguage hook as atomic single entry point for all locale changes
  - LanguageSwitcher component (FR/EN ButtonGroup)
  - formatCurrency utility using ar-MA-u-nu-latn for Latin MAD numerals
  - RtlSmokeTest page at / route with Dialog + Drawer portal component verification
affects: [02-catalog, 03-auth, 04-checkout, 05-admin]

# Tech tracking
tech-stack:
  added:
    - "@types/stylis (dev — TypeScript declarations for stylis import in RTLProvider)"
  patterns:
    - "RTLProvider module-level caches: rtlCache/ltrCache created ONCE outside component — prevents Emotion cache recreation on every render (MUI issue #33892)"
    - "i18n.ts imported before ReactDOM.createRoot in main.tsx — prevents flash of untranslated content (FOUC)"
    - "useLanguage hook is sole entry point for locale changes — never call i18n.changeLanguage() directly in components"
    - "formatCurrency always uses ar-MA-u-nu-latn locale string regardless of UI locale — enforces Latin digits for MAD prices"
    - "RTLProvider ThemeProvider sets direction: rtl/ltr — MUI portal components (Dialog/Drawer/Menu) inherit direction from theme, not document.dir"

key-files:
  created:
    - trotinette-frontend/src/app/i18n.ts
    - trotinette-frontend/src/shared/components/RTLProvider.tsx
    - trotinette-frontend/src/shared/hooks/useLanguage.ts
    - trotinette-frontend/src/shared/components/LanguageSwitcher.tsx
    - trotinette-frontend/src/shared/utils/formatCurrency.ts
    - trotinette-frontend/src/shared/components/RtlSmokeTest.tsx
    - trotinette-frontend/src/locales/fr/translation.json
    - trotinette-frontend/src/locales/ar/translation.json
    - trotinette-frontend/src/locales/en/translation.json
  modified:
    - trotinette-frontend/src/main.tsx
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/package.json

key-decisions:
  - "USER DECISION: Arabic language support removed — only FR and EN supported going forward. RTL infrastructure to be simplified in a follow-up commit."
  - "type-only import for SupportedLocale in LanguageSwitcher — required by verbatimModuleSyntax tsconfig flag"
  - "@types/stylis added as devDependency — stylis package ships without bundled TypeScript declarations"
  - "Module-level Emotion cache creation (not inside component) — prevents CSS rule re-injection on every render"
  - "formatCurrency uses ar-MA-u-nu-latn unconditionally — Moroccan users always expect Western/Latin digits for prices"

patterns-established:
  - "Pattern 4: All locale changes via useLanguage().changeLanguage() — never direct i18n.changeLanguage() in components"
  - "Pattern 5: formatCurrency(amountInCentimes) for all price display — consistent MAD format with Latin digits"
  - "Pattern 6: RTLProvider wraps RouterProvider in main.tsx — ensures all routes inherit theme direction"

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 1 Plan 03: i18n + RTL Infrastructure Summary

**i18next FR/EN/AR locale system with Emotion RTLProvider, MUI portal RTL support verified via Dialog+Drawer smoke test — Arabic subsequently removed per user decision (FR/EN only going forward)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-14T20:15:51Z
- **Completed:** 2026-02-14T20:20:48Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 12

## Accomplishments
- i18next wired with FR/AR/EN resources, browser language detection, localStorage persistence — French default on first load
- RTLProvider using module-level Emotion caches + MUI ThemeProvider direction — portal components (Dialog, Drawer) fully mirrored in RTL
- formatCurrency enforces Latin digits for MAD prices (`ar-MA-u-nu-latn`) across all locales
- Human verification passed all 7 checks: FR default, AR RTL layout, Dialog mirrored, Drawer from right, EN LTR, FR restore, localStorage persistence
- User decided post-verification to remove Arabic support — only FR and EN will be used going forward

## Task Commits

Each task was committed atomically:

1. **Task 1: Create i18n init, RTLProvider, useLanguage hook, LanguageSwitcher, formatCurrency, locale files** - `15a20ba` (feat)
2. **Task 2: Wire i18n + RTLProvider into main.tsx and add RTL smoke test component** - `e610428` (feat)
3. **Task 3: Human RTL verification** - checkpoint approved (no commit — verification only)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `trotinette-frontend/src/app/i18n.ts` - i18next init with FR/AR/EN resources, LanguageDetector, fr fallback, localStorage caching
- `trotinette-frontend/src/shared/components/RTLProvider.tsx` - Emotion CacheProvider + MUI ThemeProvider with RTL/LTR switching, module-level caches
- `trotinette-frontend/src/shared/hooks/useLanguage.ts` - Atomic language change hook, exposes currentLocale, isRTL, changeLanguage
- `trotinette-frontend/src/shared/components/LanguageSwitcher.tsx` - MUI ButtonGroup with FR/AR/EN buttons and active state
- `trotinette-frontend/src/shared/utils/formatCurrency.ts` - MAD price formatter using ar-MA-u-nu-latn for Latin numerals
- `trotinette-frontend/src/shared/components/RtlSmokeTest.tsx` - Smoke test page: language switcher, locale display, price, Dialog, Drawer
- `trotinette-frontend/src/locales/fr/translation.json` - French translations (nav, language, product, smoke_test)
- `trotinette-frontend/src/locales/ar/translation.json` - Arabic translations (nav, language, product, smoke_test)
- `trotinette-frontend/src/locales/en/translation.json` - English translations (nav, language, product, smoke_test)
- `trotinette-frontend/src/main.tsx` - Added i18n import before createRoot + RTLProvider wrapping RouterProvider
- `trotinette-frontend/src/app/router.tsx` - / route now serves RtlSmokeTest
- `trotinette-frontend/package.json` - Added @types/stylis devDependency

## Decisions Made

- **Arabic removed (user decision):** After successful RTL verification, user decided to remove Arabic language support. Only FR and EN will be supported. RTL infrastructure (RTLProvider, rtlCache, ar locale file) is to be simplified in a follow-up commit. The SUMMARY documents the current state as-committed; the simplification is a separate tracked action.
- **type-only import for SupportedLocale:** TypeScript `verbatimModuleSyntax` tsconfig option requires type-only imports for type aliases — `import type { SupportedLocale }` instead of value import.
- **`@types/stylis` devDependency:** The `stylis` package ships without TypeScript declaration files. Added `@types/stylis` to resolve `TS7016: Could not find a declaration file for module 'stylis'`.
- **Module-level Emotion caches:** `rtlCache` and `ltrCache` created at module scope, not inside the React component. Creating inside the component would recreate the cache on every render, causing all MUI CSS rules to be re-injected into the DOM on every state change (MUI GitHub issue #33892).
- **`ar-MA-u-nu-latn` unconditional:** The currency formatter always uses the Moroccan Arabic locale with `nu-latn` extension regardless of UI locale. This ensures Latin digits in all three locales — Moroccan users expect Western numerals (1 500,00 MAD), not Eastern Arabic numerals (١٥٠٠).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed type-only import for SupportedLocale in LanguageSwitcher**
- **Found during:** Task 1 verification (build)
- **Issue:** TypeScript error `TS1484: 'SupportedLocale' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled`
- **Fix:** Split import into `import { useLanguage }` and `import type { SupportedLocale }` on separate lines
- **Files modified:** `trotinette-frontend/src/shared/components/LanguageSwitcher.tsx`
- **Verification:** `npm run build` passes with no TypeScript errors
- **Committed in:** `15a20ba` (Task 1 commit)

**2. [Rule 3 - Blocking] Installed missing @types/stylis devDependency**
- **Found during:** Task 1 verification (build)
- **Issue:** TypeScript error `TS7016: Could not find a declaration file for module 'stylis'` — stylis ships without bundled types
- **Fix:** `npm install --save-dev @types/stylis`
- **Files modified:** `trotinette-frontend/package.json`, `trotinette-frontend/package-lock.json`
- **Verification:** `npm run build` passes with no TypeScript errors
- **Committed in:** `15a20ba` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug — type import syntax, 1 blocking — missing type declaration)
**Impact on plan:** Both fixes required for build to pass. No scope creep.

## Issues Encountered
- Vite dev server started on port 5174 (5173 already occupied by prior session process). This is expected Vite auto-increment behavior. Verified at http://localhost:5174.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- i18n + locale infrastructure complete and human-verified
- RTLProvider simplification needed: user removed Arabic — rtlCache, rtlPlugin, ar locale, and AR button should be removed in a follow-up commit before Phase 2 feature work begins
- All Phase 2 components can import `useLanguage`, `formatCurrency`, and `LanguageSwitcher` directly
- Locale files have `nav`, `language`, `product` namespaces ready for Phase 2/3 feature strings

## Self-Check: PASSED

All 12 files verified present on disk. Both task commits (15a20ba, e610428) confirmed in git log.

---
*Phase: 01-foundation*
*Completed: 2026-02-14*
