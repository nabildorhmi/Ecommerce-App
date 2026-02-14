---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [react, vite, typescript, mui, axios, zustand, tanstack-query, react-router, i18next, vitest]

# Dependency graph
requires: []
provides:
  - React 19 + Vite + TypeScript frontend scaffold with all Phase 1-5 dependencies installed
  - Zustand auth store (useAuthStore) with localStorage persistence — single source of truth for token/user
  - Axios apiClient with Authorization + Accept-Language request interceptors and 401 response handler
  - TanStack QueryClient with 5-min staleTime and retry:1 defaults
  - React Router v7 browser router with /, /login, /admin stub routes
  - Vitest + Testing Library test infrastructure
affects: [02-catalog, 03-auth, 04-checkout, 05-admin]

# Tech tracking
tech-stack:
  added:
    - "@mui/material@7.x + @emotion/react + @emotion/styled (component library)"
    - "@mui/icons-material (icon set)"
    - "@mui/stylis-plugin-rtl + @emotion/cache + stylis (Arabic RTL support)"
    - "react-router@7.x (library mode, NOT react-router-dom)"
    - "axios (HTTP client)"
    - "@tanstack/react-query@5.x + @tanstack/react-query-devtools"
    - "zustand@5.x with persist middleware"
    - "i18next + react-i18next + i18next-browser-languagedetector"
    - "react-hook-form + @hookform/resolvers + zod"
    - "dayjs"
    - "vitest + @testing-library/react + @testing-library/user-event + @testing-library/jest-dom + @vitest/ui + jsdom"
  patterns:
    - "apiClient is the single Axios instance — all HTTP calls go through it for interceptors to fire"
    - "useAuthStore.getState().token (not hook) in interceptors avoids React context dependency"
    - "i18n.language ?? 'fr' fallback in Accept-Language header for pre-initialization safety"
    - "Zustand persist middleware with createJSONStorage(() => localStorage) for auth persistence across page refreshes"
    - "Triple-slash /// <reference types='vitest' /> in vite.config.ts to avoid TS overload error"

key-files:
  created:
    - trotinette-frontend/src/features/auth/store.ts
    - trotinette-frontend/src/shared/api/client.ts
    - trotinette-frontend/src/app/queryClient.ts
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/test/setup.ts
    - trotinette-frontend/.env
  modified:
    - trotinette-frontend/src/main.tsx
    - trotinette-frontend/vite.config.ts

key-decisions:
  - "Used react-router (not react-router-dom) per React Router v7 library mode — single package"
  - "useAuthStore.getState() (not hook) in Axios interceptors — interceptors are not React components"
  - "i18n.language fallback to 'fr' (not 'en') — French is the primary language for Morocco"
  - "vitest triple-slash reference in vite.config.ts instead of separate vitest.config.ts — simpler setup"
  - "RTLProvider and i18n import deferred to plan 03 — commented insertion points left in main.tsx"

patterns-established:
  - "Pattern 1: All API calls via apiClient — never raw axios.create() in feature code"
  - "Pattern 2: Auth state read via useAuthStore.getState() in non-React contexts (interceptors, utils)"
  - "Pattern 3: VITE_API_URL env var for backend URL — never hardcode localhost:8000 in feature code"

# Metrics
duration: 4min
completed: 2026-02-14
---

# Phase 1 Plan 02: Frontend Scaffold Summary

**React 19 + Vite scaffold with Axios interceptors for auth/i18n headers, Zustand auth store with localStorage persistence, TanStack QueryClient, and React Router v7 stub routes**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-14T19:47:52Z
- **Completed:** 2026-02-14T19:51:28Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Full dependency set installed: MUI 7 with RTL, react-router v7, Zustand, TanStack Query, i18next, Vitest + Testing Library
- Axios apiClient wired with auth token injection (Bearer) and Accept-Language header on every request; 401 response clears auth store and redirects to /login
- Zustand useAuthStore persists token and user to localStorage — survives page refresh
- TanStack QueryClient, React Router browser router, and app entry point wired and building cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Create React project and install all dependencies** - `68c97da` (feat)
2. **Task 2: Wire Zustand auth store, Axios client, QueryClient, router skeleton, main.tsx** - `bd88280` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `trotinette-frontend/src/features/auth/store.ts` - Zustand auth store with setAuth/clearAuth and localStorage persistence
- `trotinette-frontend/src/shared/api/client.ts` - Axios apiClient with Authorization + Accept-Language interceptors and 401 handler
- `trotinette-frontend/src/app/queryClient.ts` - TanStack QueryClient with 5-min staleTime and retry:1
- `trotinette-frontend/src/app/router.tsx` - React Router v7 createBrowserRouter with /, /login, /admin stubs
- `trotinette-frontend/src/main.tsx` - App entry point wiring QueryClientProvider and RouterProvider
- `trotinette-frontend/vite.config.ts` - Added vitest test configuration (globals, jsdom, setupFiles)
- `trotinette-frontend/src/test/setup.ts` - @testing-library/jest-dom import for test matchers
- `trotinette-frontend/.env` - VITE_API_URL=http://localhost:8000/api

## Decisions Made
- Used `react-router` (not `react-router-dom`) per plan requirement — React Router v7 ships as a single package in library mode
- Read `useAuthStore.getState()` (static access) inside Axios interceptors rather than the React hook — interceptors execute outside React component tree
- Default Accept-Language fallback is `'fr'` (not `'en'`) matching Morocco primary language
- Added `/// <reference types="vitest" />` triple-slash reference to `vite.config.ts` to resolve TypeScript TS2769 overload error when adding `test` config property
- RTLProvider and i18n initialization deferred to plan 03; commented placeholders added in main.tsx to mark insertion points

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added vitest triple-slash reference to vite.config.ts**
- **Found during:** Task 1 (build verification)
- **Issue:** TypeScript error TS2769 "No overload matches this call" — `test` property not recognized in `UserConfigExport` without vitest type reference
- **Fix:** Added `/// <reference types="vitest" />` at top of vite.config.ts
- **Files modified:** trotinette-frontend/vite.config.ts
- **Verification:** `npm run build` passes with no TypeScript errors
- **Committed in:** `68c97da` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix — without it the build fails. No scope creep.

## Issues Encountered
- Dev server started on port 5174 instead of 5173 during verification (5173 was occupied by a previous background process from the same session). This is expected behavior — Vite auto-increments ports. Dev server functionality verified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Frontend scaffold complete — plan 03 can import `useAuthStore`, `apiClient`, `queryClient`, and `router` directly
- Plan 03 will add RTLProvider and i18n initialization, then update main.tsx at the marked insertion points
- All dependency packages are installed and ready; no additional installs needed for Phase 2-3 UI work

---
*Phase: 01-foundation*
*Completed: 2026-02-14*
