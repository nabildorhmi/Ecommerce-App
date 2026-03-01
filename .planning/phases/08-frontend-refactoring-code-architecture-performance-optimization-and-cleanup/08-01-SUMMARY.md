---
phase: 08-frontend-refactoring-code-architecture-performance-optimization-and-cleanup
plan: 01
subsystem: frontend-cleanup
tags: [dead-code-removal, typescript-fixes, css-consolidation, tech-debt]
dependency_graph:
  requires: []
  provides: [clean-codebase, zero-ts-errors, consolidated-css]
  affects: [all-frontend-files]
tech_stack:
  added: []
  patterns: [css-consolidation, type-safety]
key_files:
  created: []
  modified:
    - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    - trotinette-frontend/src/index.css
    - trotinette-frontend/src/animations.css
  deleted:
    - trotinette-frontend/src/App.tsx
    - trotinette-frontend/src/App.css
    - trotinette-frontend/src/features/admin/pages/AdminDeliveryZonesPage.tsx
key_decisions:
  - decision: "animations.css as single source of truth for all CSS keyframes"
    rationale: "Prevents duplicate keyframe definitions that cause specificity bugs and maintenance overhead"
    alternatives: "Keep duplicates, use CSS-in-JS"
    impact: "All keyframes defined once, imported via main.tsx alongside index.css"
  - decision: "Replace any types with unknown in error handlers"
    rationale: "Follows project pattern established in ProfilePage, LoginPage, etc. — unknown is type-safe, any defeats type system"
    alternatives: "Import AxiosError type"
    impact: "Consistent error handling pattern across all mutations"
metrics:
  duration_minutes: 3
  tasks_completed: 2
  files_modified: 4
  files_deleted: 3
  commits: 2
  completed_date: 2026-03-01
---

# Phase 08 Plan 01: Frontend Cleanup - Dead Code, TypeScript, and CSS Summary

Removed dead files, fixed TypeScript errors, consolidated duplicate CSS keyframes — cleaning technical debt before architecture refactoring in plans 02-03.

## Objectives Met

**Goal:** Zero dead files, zero TypeScript errors, zero duplicate CSS keyframes, zero `any` types in modified files.

**Result:** All objectives achieved. Codebase is clean and ready for safe refactoring.

## Tasks Executed

### Task 1: Remove dead files and fix TypeScript errors
**Status:** Complete
**Commit:** f455908

**Actions taken:**
1. Verified files were truly dead (no imports found via grep)
2. Deleted dead Vite boilerplate files:
   - `src/App.tsx` (never imported — main.tsx uses router directly)
   - `src/App.css` (imported only by dead App.tsx)
   - `src/features/admin/pages/AdminDeliveryZonesPage.tsx` (feature removed, not in router.tsx)
3. Fixed TypeScript type cast error in ProductDetailPage.tsx:
   - Added missing `promo_price` and `is_on_sale` properties to ProductVariantDisplay type cast
   - Type cast now matches interface definition in `types.ts`
4. Replaced `any` types with `unknown` in CheckoutPage.tsx error handlers:
   - `registerMutation.onError` (line 88)
   - `saveMutation.onError` (line 102)
   - Followed project pattern from ProfilePage, LoginPage (unknown with type guard cast)

**Verification:**
- `npx tsc --noEmit` exits 0 — zero TypeScript errors
- Dead files confirmed deleted via ls (all return "No such file")
- `grep -n ": any" CheckoutPage.tsx` returns empty — zero any annotations

### Task 2: Consolidate duplicate CSS keyframes
**Status:** Complete
**Commit:** d846423

**Actions taken:**
1. Identified duplicate keyframes between index.css and animations.css:
   - `shimmer`, `gradient-shift`, `pulse-dot`, `border-glow` existed in both files
2. Moved unique keyframes from index.css to animations.css:
   - `miraiSlideUp` (section fade-in animation)
   - `scanlines` (hero scanline texture)
3. Removed ALL keyframe definitions from index.css
4. Kept utility classes in index.css (`.mirai-animate-in`, `.mirai-scanlines::after`) that reference keyframes from animations.css
5. Verified both CSS files are imported in main.tsx (lines 9-10)

**Result:**
- animations.css now contains 13 keyframes (single source of truth):
  - `shimmer`, `float`, `pulse-glow`, `gradient-shift`, `rotate-slow`, `rotate-slow-reverse`
  - `fade-in-up`, `border-glow`, `pulse-dot`, `promo-glow`, `nouveaute-glow`
  - `miraiSlideUp`, `scanlines`
- index.css contains ZERO keyframe definitions
- No duplicate keyframe names across any CSS file

**Verification:**
- `grep -c "@keyframes" index.css` returns 0
- `grep "@keyframes" animations.css | sort` shows 13 unique keyframes
- `npm run build` succeeds — production build works

## Overall Verification

All plan success criteria met:

- TypeScript compiles with zero errors (`npx tsc --noEmit` exits 0)
- Production build succeeds (`npm run build` completes in 11.32s)
- Three dead files removed from source tree (App.tsx, App.css, AdminDeliveryZonesPage.tsx)
- CSS keyframes consolidated into single file with zero duplication
- Zero `any` type annotations in CheckoutPage.tsx error handlers

## Deviations from Plan

None — plan executed exactly as written.

## Output

**Commits:**
- f455908: chore(08-01): remove dead files and fix TypeScript errors
- d846423: refactor(08-01): consolidate CSS keyframes into animations.css

**Key files:**
- Modified: ProductDetailPage.tsx, CheckoutPage.tsx, index.css, animations.css
- Deleted: App.tsx, App.css, AdminDeliveryZonesPage.tsx

**Dependencies for next plans:**
- Clean codebase enables safe architecture refactoring in 08-02 (feature-based structure)
- Zero TypeScript errors ensures no hidden type issues during refactoring
- Consolidated CSS simplifies style management during component reorganization

## Self-Check: PASSED

Verified all claimed outputs exist:

**Files modified:**
```
FOUND: trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
FOUND: trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
FOUND: trotinette-frontend/src/index.css
FOUND: trotinette-frontend/src/animations.css
```

**Files deleted:**
```
NOT FOUND (correctly deleted): trotinette-frontend/src/App.tsx
NOT FOUND (correctly deleted): trotinette-frontend/src/App.css
NOT FOUND (correctly deleted): trotinette-frontend/src/features/admin/pages/AdminDeliveryZonesPage.tsx
```

**Commits exist:**
```
FOUND: f455908 (chore(08-01): remove dead files and fix TypeScript errors)
FOUND: d846423 (refactor(08-01): consolidate CSS keyframes into animations.css)
```

**Verification commands:**
```
TypeScript compilation: PASSED (npx tsc --noEmit exits 0)
Production build: PASSED (npm run build succeeds)
Zero keyframes in index.css: PASSED (grep -c "@keyframes" index.css returns 0)
Zero any annotations in CheckoutPage: PASSED (grep -n ": any" CheckoutPage.tsx returns empty)
```
