---
phase: quick-16
plan: 01
subsystem: ui
tags: [react, mui, sidebar, admin-panel, router, layout]

requires:
  - phase: 04-cart-checkout-orders
    provides: admin routes and AdminRoute guard
provides:
  - AdminLayout component with collapsible sidebar and top bar
  - Dedicated admin panel shell separate from storefront
  - Cleaned Navbar without admin dropdown menu
affects: [admin-pages, navigation, router]

tech-stack:
  added: []
  patterns:
    - "AdminLayout as separate route tree sibling to RootLayout"
    - "Collapsible sidebar with icon-only mode and tooltip labels"
    - "Pending orders badge query shared via AdminLayout (not Navbar)"

key-files:
  created:
    - trotinette-frontend/src/shared/components/AdminLayout.tsx
  modified:
    - trotinette-frontend/src/app/router.tsx
    - trotinette-frontend/src/shared/components/Navbar.tsx

key-decisions:
  - "Admin routes moved to sibling route entry (not nested in RootLayout) so admin pages render without storefront Navbar/Footer/WhatsApp FAB"
  - "Sidebar 260px expanded / 72px collapsed with smooth cubic-bezier transition"
  - "Pending orders query moved from Navbar to AdminLayout — single source of truth for admin context"

patterns-established:
  - "AdminLayout pattern: sidebar + top bar + Outlet, separate from storefront shell"

duration: 4min
completed: 2026-04-19
---

# Quick Task 16: Modern Admin Panel with Sidebar Navigation

**Collapsible sidebar admin layout with 8 nav items, top bar, and restructured router separating admin from storefront shell**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-19T14:39:42Z
- **Completed:** 2026-04-19T14:43:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- AdminLayout component (460 lines) with collapsible sidebar (260px/72px), top bar with page title/notifications/user chip, and Outlet content area
- Router restructured: admin routes are sibling to RootLayout (not nested), so admin pages render without storefront Navbar, Footer, or WhatsApp FAB
- Navbar cleaned: admin dropdown menu replaced with simple icon link to /admin, removed unused imports and pending orders query

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AdminLayout component with sidebar and top bar** - `912fef9` (feat)
2. **Task 2: Restructure router and clean up Navbar** - `57cfd6d` (feat)

## Files Created/Modified
- `trotinette-frontend/src/shared/components/AdminLayout.tsx` - Admin panel shell with collapsible sidebar (8 nav items with icons, active cyan highlighting, pending orders badge), top bar (page title, notifications, user chip, retour au site), responsive (temporary drawer on mobile, collapsed on tablet)
- `trotinette-frontend/src/app/router.tsx` - Admin routes moved to sibling route entry with AdminLayout nested inside AdminRoute guard
- `trotinette-frontend/src/shared/components/Navbar.tsx` - Removed admin dropdown menu, adminMenuAnchor state, closeAdminMenu handler, pending orders query, and unused icon imports (Dashboard, Assignment, Tune, ViewCarousel, People, Description, Badge)

## Decisions Made
- Admin routes as sibling route entry (not nested in RootLayout children) — ensures admin pages never render storefront Navbar/Footer/WhatsApp FAB
- Sidebar defaults collapsed on tablet (md-lg), expanded on desktop (lg+), temporary drawer on mobile (<md)
- Pending orders query removed from Navbar and kept only in AdminLayout — avoids duplicate API calls

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin panel layout is live — all admin pages now render inside sidebar+topbar shell
- Storefront navigation is clean with simple admin icon link

---
*Quick Task: 16-modern-admin-panel-with-sidebar-navigati*
*Completed: 2026-04-19*
