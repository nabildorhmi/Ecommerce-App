---
phase: quick-16
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/shared/components/AdminLayout.tsx
  - trotinette-frontend/src/app/router.tsx
  - trotinette-frontend/src/shared/components/Navbar.tsx
autonomous: true
must_haves:
  truths:
    - "Admin routes render inside AdminLayout with sidebar + top bar, not inside RootLayout"
    - "Sidebar shows all 8 nav items with icons, active route highlighted with cyan left border"
    - "Sidebar collapses to icon-only on tablet, hidden behind hamburger on mobile"
    - "Top bar shows page title, pending orders badge, user info, and Retour au site link"
    - "Storefront Navbar no longer has admin dropdown menu, replaced by simple Administration link"
    - "No Footer or WhatsApp FAB visible on admin pages"
  artifacts:
    - path: "trotinette-frontend/src/shared/components/AdminLayout.tsx"
      provides: "Admin panel layout with sidebar + top bar + content area"
      min_lines: 200
    - path: "trotinette-frontend/src/app/router.tsx"
      provides: "Restructured routes with admin routes under AdminLayout"
    - path: "trotinette-frontend/src/shared/components/Navbar.tsx"
      provides: "Cleaned Navbar without admin dropdown menu"
  key_links:
    - from: "trotinette-frontend/src/app/router.tsx"
      to: "trotinette-frontend/src/shared/components/AdminLayout.tsx"
      via: "AdminLayout as route element wrapping admin children"
      pattern: "AdminLayout"
    - from: "trotinette-frontend/src/shared/components/AdminLayout.tsx"
      to: "/admin/*"
      via: "sidebar NavLink with active state detection"
      pattern: "useLocation|NavLink"
---

<objective>
Create a modern admin panel layout with collapsible sidebar navigation, top bar with breadcrumbs/user info, and restructure the router so admin routes use AdminLayout instead of RootLayout. Clean up the storefront Navbar by removing the admin dropdown menu.

Purpose: Replace the current admin-as-dropdown-menu pattern with a proper admin panel layout that provides dedicated sidebar navigation, better screen real estate for admin content, and clear separation between storefront and admin experiences.

Output: AdminLayout component, updated router, cleaned Navbar.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-frontend/src/app/router.tsx
@trotinette-frontend/src/app/theme.ts
@trotinette-frontend/src/shared/components/RootLayout.tsx
@trotinette-frontend/src/shared/components/AdminRoute.tsx
@trotinette-frontend/src/shared/components/Navbar.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create AdminLayout component with sidebar and top bar</name>
  <files>trotinette-frontend/src/shared/components/AdminLayout.tsx</files>
  <action>
Create a new AdminLayout component that provides the admin panel shell. This component wraps admin routes and replaces RootLayout for the /admin/* section.

**Structure:**
- Root Box: `display: flex`, full viewport height, `bgcolor: background.default`
- Left sidebar (permanent Drawer on desktop, temporary on mobile)
- Right side: top bar (AppBar) + main content area with Outlet

**Sidebar (permanent Drawer variant on md+, temporary on mobile):**
- Width: 260px expanded, 72px collapsed (icon-only)
- Background: `rgba(12,12,20,0.97)` with `backdropFilter: 'blur(28px)'` and right border `1px solid #1d1d27` — matching existing MuiDrawer theme overrides
- Top section: MiraiTech logo (import from `@/assets/miraiTech-Logo.png`), show text "MIRAI ADMIN" next to logo when expanded, just logo icon when collapsed
- Collapse toggle button at bottom of sidebar (ChevronLeft/ChevronRight icon) — toggles between 260px and 72px; store collapsed state in `useState`, default expanded on lg+, collapsed on md
- Use `useMediaQuery(theme.breakpoints.down('md'))` for mobile detection — on mobile, sidebar is a temporary Drawer controlled by hamburger in top bar
- Use `useMediaQuery(theme.breakpoints.down('lg'))` to default collapsed on tablet

**Sidebar navigation items (use List + ListItemButton):**
Each item: icon + label text (label hidden when collapsed, show Tooltip with label instead)
- Use `useLocation()` to detect active route
- Active item styling: `borderLeft: '3px solid #00C2FF'`, `backgroundColor: 'rgba(0,194,255,0.08)'`, `boxShadow: 'inset 4px 0 12px rgba(0,194,255,0.06)'`, icon and text color `#00C2FF`
- Inactive: `borderLeft: '3px solid transparent'`, `color: '#8A919D'`, hover: `color: '#E8ECF2'`, `backgroundColor: 'rgba(255,255,255,0.03)'`
- Smooth transition: `transition: 'all 0.2s ease'`

Navigation items array:
```typescript
const navItems = [
  { to: '/admin', icon: <DashboardIcon />, label: 'Tableau de bord', exact: true },
  { to: '/admin/products', icon: <InventoryIcon />, label: 'Produits' },
  { to: '/admin/categories', icon: <CategoryIcon />, label: 'Categories' },
  { to: '/admin/variation-types', icon: <TuneIcon />, label: 'Types de variations' },
  { to: '/admin/orders', icon: <ReceiptLongIcon />, label: 'Commandes', badge: pendingCount },
  { to: '/admin/pages', icon: <DescriptionIcon />, label: 'Pages' },
  { to: '/admin/hero-banners', icon: <ViewCarouselIcon />, label: 'Hero Banners' },
];
// Conditionally add Users item for global_admin
if (user?.role === 'global_admin') {
  navItems.push({ to: '/admin/users', icon: <PeopleIcon />, label: 'Utilisateurs' });
}
```

For route matching: use `location.pathname === item.to` for exact items (Dashboard), `location.pathname.startsWith(item.to)` for others. Dashboard must be exact match otherwise it matches all /admin/* routes.

Add Divider after nav items, then a "Retour au site" ListItemButton linking to "/" with LaunchIcon or StorefrontIcon.

**Pending orders query** — copy the same useQuery from Navbar.tsx:
```typescript
const { data: pendingData } = useQuery({
  queryKey: ['admin', 'orders', 'pending-count'],
  queryFn: async () => {
    const res = await apiClient.get('/admin/orders', { params: { 'filter[status]': 'pending', per_page: 1 } });
    return res.data.meta?.total ?? 0;
  },
  enabled: user?.role === 'admin' || user?.role === 'global_admin',
  refetchInterval: 30_000,
  staleTime: 15_000,
});
const pendingCount = pendingData ?? 0;
```

Badge on Commandes item: wrap icon in `<Badge badgeContent={pendingCount} color="error" max={99}>` when pendingCount > 0.

**Top bar (AppBar):**
- Position: fixed, but offset by sidebar width using `marginLeft` and `width: calc(100% - sidebarWidth)`
- Background: `rgba(12,12,20,0.92)` with `backdropFilter: 'blur(24px)'` and bottom border `1px solid #1d1d27` — matching existing AppBar theme
- Height: 64px
- Left side: hamburger IconButton (only on mobile, toggles temporary drawer) + page title Typography (derive from location.pathname using a simple map: `/admin` -> "Tableau de bord", `/admin/products` -> "Produits", etc.; for detail pages like `/admin/products/123/edit` default to parent label)
- Right side: Box with flex, gap:
  - Pending orders badge: IconButton with Badge wrapping NotificationsIcon (or ShoppingCartIcon), clicking navigates to /admin/orders
  - "Retour au site" Button (small, outlined, primary) linking to "/" with StorefrontIcon startIcon
  - User avatar/name: small Chip or Box showing user.name with AccountCircleIcon, no dropdown needed (logout is in storefront Navbar)

**Main content area:**
- `marginLeft` matching sidebar width (animated with transition for collapse)
- `marginTop: '64px'` for top bar
- `padding: { xs: 2, sm: 3 }` for content spacing
- `flex: 1`, `overflow: 'auto'`
- Render `<Outlet />`

**Sidebar width transition:**
- Use `transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'` on the Drawer
- Content area `marginLeft` also transitions: `transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'`

**Auth check:**
- Get user from `useAuthStore((s) => s.user)` — AdminRoute already guards, but we need user for role checks and display

**Imports needed:**
- MUI: Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Badge, Button, Divider, Tooltip, Chip, useMediaQuery, useTheme
- Icons: DashboardIcon, InventoryIcon (or Inventory2Icon), CategoryIcon, TuneIcon, ReceiptLongIcon, DescriptionIcon, ViewCarouselIcon, PeopleIcon, MenuIcon, ChevronLeftIcon, ChevronRightIcon, StorefrontIcon, NotificationsIcon, AccountCircleIcon
- react-router: Outlet, useLocation, Link
- @tanstack/react-query: useQuery
- Internal: useAuthStore, apiClient, miraiLogo
  </action>
  <verify>Run `npx tsc --noEmit` from trotinette-frontend — no TypeScript errors in AdminLayout.tsx</verify>
  <done>AdminLayout.tsx exists with sidebar (260px/72px collapsible), top bar, Outlet content area, all 8 nav items with icons, active highlighting with cyan border, pending orders badge, responsive behavior (temporary drawer on mobile), "Retour au site" link, neo-zen glass dark theme styling</done>
</task>

<task type="auto">
  <name>Task 2: Restructure router and clean up Navbar</name>
  <files>trotinette-frontend/src/app/router.tsx, trotinette-frontend/src/shared/components/Navbar.tsx</files>
  <action>
**Router changes (router.tsx):**

1. Add lazy import for AdminLayout:
```typescript
const AdminLayout = lazy(() => import('@/shared/components/AdminLayout').then(m => ({ default: m.AdminLayout })));
```

2. Move admin routes OUT of the RootLayout children and into a SIBLING route entry at the top level of createBrowserRouter array. The new structure:

```typescript
export const router = createBrowserRouter([
  {
    // Storefront layout
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      // ... all existing non-admin routes (homepage, products, login, etc.)
      // ... protected routes (profile, orders)
      // REMOVE the admin routes block entirely from here
    ],
  },
  {
    // Admin layout — separate from storefront
    element: <AdminRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>,
        children: [
          { path: '/admin', element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> },
          { path: '/admin/products', element: <Suspense fallback={<PageLoader />}><AdminProductsPage /></Suspense> },
          { path: '/admin/products/create', element: <Suspense fallback={<PageLoader />}><AdminProductEditPage /></Suspense> },
          { path: '/admin/products/:id/edit', element: <Suspense fallback={<PageLoader />}><AdminProductEditPage /></Suspense> },
          { path: '/admin/categories', element: <Suspense fallback={<PageLoader />}><AdminCategoriesPage /></Suspense> },
          { path: '/admin/users', element: <Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense> },
          { path: '/admin/users/:id', element: <Suspense fallback={<PageLoader />}><AdminUserDetailPage /></Suspense> },
          { path: '/admin/orders', element: <Suspense fallback={<PageLoader />}><AdminOrdersPage /></Suspense> },
          { path: '/admin/orders/:id', element: <Suspense fallback={<PageLoader />}><AdminOrderDetailPage /></Suspense> },
          { path: '/admin/pages', element: <Suspense fallback={<PageLoader />}><AdminPagesPage /></Suspense> },
          { path: '/admin/variation-types', element: <Suspense fallback={<PageLoader />}><AdminVariationTypesPage /></Suspense> },
          { path: '/admin/hero-banners', element: <Suspense fallback={<PageLoader />}><AdminHeroBannersPage /></Suspense> },
        ],
      },
    ],
  },
]);
```

AdminRoute stays as the auth guard parent. AdminLayout is nested inside it and renders its own Outlet for the actual page content.

**Navbar cleanup (Navbar.tsx):**

1. Remove the entire admin dropdown menu block (approximately lines 426-478): the IconButton with AdminPanelSettingsIcon, the Badge, the Menu with all admin MenuItems, the adminMenuAnchor state, and closeAdminMenu handler.

2. Remove the `adminMenuAnchor` state: `const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);`

3. Remove the `closeAdminMenu` handler (search for it — likely `const closeAdminMenu = ...`).

4. In place of the removed admin dropdown, add a simple admin link button (only for admin/global_admin users):
```tsx
{(user.role === 'admin' || user.role === 'global_admin') && (
  <IconButton
    component={Link}
    to="/admin"
    aria-label="Administration"
    size="small"
    sx={{
      color: '#8A919D',
      transition: 'all 0.2s',
      '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.06)' },
    }}
  >
    <AdminPanelSettingsIcon sx={{ fontSize: '1.1rem' }} />
  </IconButton>
)}
```

5. Remove the `pendingCount` query and related state ONLY IF it is not used elsewhere in Navbar. Check: pendingCount is used in admin menu Badge (line 438) and admin menu Commandes item (line 455) — both are being removed. The query itself (`['admin', 'orders', 'pending-count']`) is now handled by AdminLayout. Remove the useQuery import only if no other queries remain in Navbar.

6. Remove unused icon imports that were only for admin menu: DashboardIcon, AssignmentIcon, TuneIcon, ViewCarouselIcon, PeopleIcon. Keep AdminPanelSettingsIcon (still used for the simple link button). Keep ReceiptLongIcon (used in user menu "Mes commandes"). Keep DescriptionIcon only if used elsewhere — check and remove if not.

7. Remove the `pendingData` and `pendingCount` variables.

8. Do NOT remove: CartBadge, user menu dropdown, mobile drawer, search bar, category menus — these are storefront features.
  </action>
  <verify>Run `npx tsc --noEmit` from trotinette-frontend — no TypeScript errors. Then run `npx vite build` — build succeeds with no errors. Verify in browser: navigate to /admin — should see AdminLayout with sidebar; navigate to / — should see storefront with simple admin icon link (no dropdown).</verify>
  <done>Admin routes use AdminLayout (not RootLayout), Navbar has simple admin icon link instead of dropdown menu, unused admin imports removed from Navbar, TypeScript compiles, Vite build succeeds</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. `npx vite build` succeeds
3. Navigate to /admin — see AdminLayout with sidebar listing all 8 nav items
4. Click sidebar items — active item highlighted with cyan left border
5. Collapse sidebar — items show icons only with tooltips
6. On mobile viewport — sidebar hidden, hamburger button in top bar toggles drawer
7. Navigate to / — storefront Navbar has simple admin icon (no dropdown menu)
8. No Footer or WhatsApp FAB visible on admin pages
</verification>

<success_criteria>
- AdminLayout component renders sidebar + top bar + Outlet for all /admin/* routes
- Sidebar has all 8 navigation items with correct icons and routes
- Active route highlighted with cyan left border and glow
- Sidebar collapses to 72px icon-only mode with toggle button
- Mobile: sidebar hidden behind hamburger menu
- Top bar shows page title, pending orders notification, user info, "Retour au site" link
- Navbar admin dropdown replaced with single icon link to /admin
- No Footer/WhatsApp FAB on admin pages
- TypeScript compiles, Vite builds successfully
</success_criteria>

<output>
After completion, create `.planning/quick/16-modern-admin-panel-with-sidebar-navigati/16-SUMMARY.md`
</output>
