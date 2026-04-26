---
phase: quick-21
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminVariationTypesPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
autonomous: true
must_haves:
  truths:
    - "All admin pages have consistent glassmorphism card styling on description panels, filter bars, and tables"
    - "All admin pages have icon + Japanese text page headers matching the AdminDashboardPage pattern"
    - "All admin pages use consistent Button styling (gradient background, rounded, hover lift) for primary actions"
    - "Existing functionality, business logic, and responsive design are fully preserved"
  artifacts:
    - path: "trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx"
      provides: "Glassmorphism categories page with icon header"
    - path: "trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx"
      provides: "Glassmorphism pages management with icon header"
    - path: "trotinette-frontend/src/features/admin/pages/AdminVariationTypesPage.tsx"
      provides: "Glassmorphism variation types page with icon header"
    - path: "trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx"
      provides: "Glassmorphism hero banners page with icon header"
    - path: "trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx"
      provides: "Glassmorphism users list page with icon header"
    - path: "trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx"
      provides: "Glassmorphism user detail page with icon header"
    - path: "trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx"
      provides: "Consistent glass styling on description and filter panels"
    - path: "trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx"
      provides: "Consistent glass styling on description and filter panels"
  key_links:
    - from: "All admin pages"
      to: "glassSx constant"
      via: "Shared inline constant pattern"
      pattern: "glassSx"
---

<objective>
Apply comprehensive visual consistency across all admin pages: glassmorphism card styling, icon+Japanese page headers, styled primary action buttons, and improved visual hierarchy.

Purpose: Create a cohesive, premium admin panel experience where every page follows the same glassmorphism design language established in AdminProductEditPage and AdminSiteSettingsPage.

Output: 8 updated admin page files with consistent styling, zero functional changes.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx (reference for glassSx pattern)
@trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx (reference for tabs + glassSx)
@trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx (reference for header pattern)
@trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx (reference for styled table/buttons)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Apply glassmorphism and icon headers to table-based CRUD pages (Categories, Pages, Variation Types, Users)</name>
  <files>
    trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminVariationTypesPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
  </files>
  <action>
For each of these 4 files, apply the following visual changes while preserving ALL existing business logic, state management, handlers, and component structure:

**1. Add glassSx constant** at the top of each file (after imports, before component):
```tsx
const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};
```

**2. Replace page header** with icon + Japanese text pattern. Use appropriate MUI icons and Japanese translations:

- AdminCategoriesPage: `CategoryIcon` (from @mui/icons-material/Category), Japanese: `カテゴリー管理`
- AdminPagesPage: `ArticleIcon` (from @mui/icons-material/Article), Japanese: `ページ管理`
- AdminVariationTypesPage: `TuneIcon` (from @mui/icons-material/Tune), Japanese: `属性管理`
- AdminUsersPage: `PeopleIcon` (from @mui/icons-material/People), Japanese: `ユーザー管理`

Header pattern (replace existing Typography h5):
```tsx
<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
  <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--mirai-white)' }}>
    [Page Title]
  </Typography>
  <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.75rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
    [Japanese Text]
  </Typography>
</Box>
```

**3. Apply glassSx to description panels** -- replace `Paper variant="outlined" sx={{ p: 2, mb: 2 }}` with `Box sx={{ ...glassSx, mb: 2 }}` for the description/info boxes at the top of each page.

**4. Apply glassSx to filter/search bars** -- replace `Paper variant="outlined" sx={{ p: 2, mb: 2 }}` with `Box sx={{ ...glassSx, mb: 2 }}` for the search/filter containers.

**5. Apply glass styling to TableContainer** -- replace `<TableContainer component={Paper}>` with:
```tsx
<TableContainer component={Paper} elevation={0} sx={{ ...glassSx, p: 0, overflow: 'hidden' }}>
```
And add styled table header cells (matching AdminProductsPage pattern):
```tsx
<TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>
```
And styled table body rows:
```tsx
<TableRow
  key={...}
  hover
  sx={{
    '&:hover': { backgroundColor: 'rgba(0,194,255,0.04)' },
    '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  }}
>
```

**6. Style primary action buttons** (Add/Create buttons) with gradient:
```tsx
sx={{
  borderRadius: '10px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #00C2FF, #0099CC)',
  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(0,194,255,0.25)' },
  transition: 'all 0.2s ease',
}}
```

**7. Style Dialog components** -- add glass background to Dialog PaperProps:
```tsx
<Dialog
  ...existing props...
  slotProps={{
    paper: {
      sx: {
        background: 'rgba(12, 12, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,194,255,0.12)',
        borderRadius: '16px',
      },
    },
  }}
>
```

IMPORTANT: Do NOT change any state logic, API calls, handlers, or conditional rendering. Only modify JSX styling props and add icon imports.
  </action>
  <verify>
Run `cd C:\Users\User\Desktop\TrotinetteApp\trotinette-frontend && npx tsc --noEmit` to verify no TypeScript errors. Visually confirm each file has glassSx constant, icon import, Japanese header text, and glass-styled containers.
  </verify>
  <done>AdminCategoriesPage, AdminPagesPage, AdminVariationTypesPage, and AdminUsersPage all have: (1) glassSx constant, (2) icon + Japanese page header, (3) glass-styled description/filter panels, (4) glass-styled tables with themed headers/rows, (5) gradient primary buttons, (6) glass-styled dialogs. Zero functional changes.</done>
</task>

<task type="auto">
  <name>Task 2: Apply glassmorphism to Hero Banners, User Detail, and polish Dashboard + Products pages</name>
  <files>
    trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminDashboardPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
  </files>
  <action>
**AdminHeroBannersPage.tsx** -- apply full glassmorphism treatment:

1. Add glassSx constant (same as Task 1).
2. Replace header with icon + Japanese pattern:
   - Icon: `WallpaperIcon` (from @mui/icons-material/Wallpaper), Japanese: `ビジュアル管理`
3. Convert description `Paper variant="outlined"` to `Box sx={{ ...glassSx, mb: 2 }}`.
4. Convert filter `Paper variant="outlined"` to `Box sx={{ ...glassSx, mb: 2 }}`.
5. Style the BannerCard component: add glass styling to the Card:
   ```tsx
   <Card sx={{
     position: 'relative',
     opacity: banner.is_active ? 1 : 0.5,
     background: 'rgba(12, 12, 20, 0.7)',
     backdropFilter: 'blur(16px)',
     border: '1px solid rgba(0,194,255,0.09)',
     borderRadius: '16px',
     overflow: 'hidden',
     transition: 'all 0.3s ease',
     '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(0,0,0,0.4)', border: '1px solid rgba(0,194,255,0.18)' },
   }}>
   ```
6. Style BannerDialog with glass paper (same slotProps pattern as Task 1).
7. Style "Ajouter un visuel" button with gradient.

**AdminUserDetailPage.tsx** -- apply full glassmorphism treatment:

1. Add glassSx constant.
2. Replace plain header with icon + Japanese pattern:
   - Icon: `PersonIcon` (from @mui/icons-material/Person), Japanese: `ユーザー詳細`
3. Style the Back button with cyan border (matching AdminProductEditPage pattern):
   ```tsx
   sx={{
     borderColor: 'rgba(0,194,255,0.3)',
     color: 'var(--mirai-gray)',
     borderRadius: '8px',
     '&:hover': { borderColor: '#00C2FF', color: '#00C2FF' },
   }}
   ```
4. Replace `<Card variant="outlined" sx={{ mb: 3 }}>` with `<Box sx={{ ...glassSx, mb: 3 }}>` and remove Card/CardContent wrappers (use Box directly). Style the grid fields with `Typography variant="caption"` using `color: 'rgba(0,194,255,0.5)'` for labels.
5. Replace order history `<Paper variant="outlined" sx={{ p: 3 }}>` with `<Box sx={{ ...glassSx }}>`.
6. Style deactivation dialog with glass paper.

**AdminDashboardPage.tsx** -- polish for consistency:

1. Convert the description `Paper variant="outlined" sx={{ p: 2, mb: 2 }}` (line 121) to `Box sx={{ ...glassSx, mb: 2 }}` -- add a glassSx constant at top of file.
2. Convert the filter bar `Paper className="mirai-glass" sx={{ p: 2, mb: 3, borderRadius: '12px' }}` to `Box sx={{ ...glassSx, mb: 3 }}` for consistency (the className approach is less specific).

**AdminProductsPage.tsx** -- polish for consistency:

1. Add glassSx constant.
2. Convert description `Paper variant="outlined" sx={{ p: 2, mb: 2 }}` to `Box sx={{ ...glassSx, mb: 2 }}`.
3. Convert filter bar `Paper variant="outlined" sx={{ p: 2, mb: 2 }}` to `Box sx={{ ...glassSx, mb: 2 }}`.
4. Style delete dialog and clear-discounts dialog with glass paper (slotProps pattern).

IMPORTANT: Do NOT change any state logic, API calls, handlers, event bindings, or conditional rendering. Only modify styling. The BannerDialog's complex image handling, drag-to-pan, and form logic must remain completely untouched.
  </action>
  <verify>
Run `cd C:\Users\User\Desktop\TrotinetteApp\trotinette-frontend && npx tsc --noEmit` to verify no TypeScript errors. Grep for `glassSx` in all admin page files to confirm consistent usage. Verify no business logic was altered by checking that the number of useState, useMutation, and handler functions in each file matches the original.
  </verify>
  <done>AdminHeroBannersPage and AdminUserDetailPage have full glassmorphism treatment (glassSx, icon headers, glass cards/tables, glass dialogs, gradient buttons). AdminDashboardPage and AdminProductsPage have polished description/filter panels using glassSx for full consistency. All 8 admin pages now share the same glassmorphism design language. Zero functional changes across all files.</done>
</task>

</tasks>

<verification>
1. `cd C:\Users\User\Desktop\TrotinetteApp\trotinette-frontend && npx tsc --noEmit` -- zero TypeScript errors
2. Every admin page file contains a `glassSx` constant
3. Every admin page has a Japanese text element in its header (grep for `Noto Serif JP` or Japanese characters)
4. No `Paper variant="outlined"` remains on description/filter panels (all converted to glassSx Box)
5. All primary action buttons use gradient styling
6. All Dialog components have glass paper styling
</verification>

<success_criteria>
- All 8 admin pages (Categories, Pages, VariationTypes, Users, UserDetail, HeroBanners, Dashboard, Products) have consistent glassmorphism styling
- Icon + Japanese text headers on all pages
- Glass-styled description panels, filter bars, tables, cards, and dialogs
- Gradient primary action buttons
- TypeScript compiles without errors
- All existing functionality preserved (no state/logic/handler changes)
</success_criteria>

<output>
After completion, create `.planning/quick/21-comprehensive-admin-panel-visual-update-/21-SUMMARY.md`
</output>
