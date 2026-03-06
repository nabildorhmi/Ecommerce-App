---
phase: quick-15
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminVariationTypesPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminOrdersPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminOrderDetailPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx
  - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
  - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
  - trotinette-frontend/src/features/home/pages/HomePage.tsx
  - trotinette-frontend/src/features/catalog/pages/DynamicPage.tsx
  - trotinette-frontend/src/features/auth/pages/MyOrdersPage.tsx
autonomous: true
must_haves:
  truths:
    - "All page content aligns to the same max-width as the navbar (Container maxWidth xl)"
    - "Auth form pages (Login, ForgotPassword, ResetPassword, Profile) and OrderConfirmation remain narrow"
  artifacts:
    - path: "trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx"
      contains: "Container maxWidth=\"xl\""
    - path: "trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx"
      contains: "Container maxWidth=\"xl\""
    - path: "trotinette-frontend/src/features/home/pages/HomePage.tsx"
      contains: "maxWidth=\"xl\""
  key_links: []
---

<objective>
Align all page content containers to consistent website width matching the navbar.

Purpose: The navbar uses `<Container maxWidth="xl">`. Many pages use inconsistent widths (md, lg, or no Container). This creates a misaligned layout where content does not span the same width as the navbar.

Output: All 15 pages updated to use `<Container maxWidth="xl">`, producing a visually consistent layout across the entire site.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-frontend/src/shared/components/Navbar.tsx (reference: uses Container maxWidth="xl")
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Container xl wrapper to pages using bare Box</name>
  <files>
    trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminVariationTypesPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminOrdersPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminOrderDetailPage.tsx
    trotinette-frontend/src/features/auth/pages/MyOrdersPage.tsx
  </files>
  <action>
For each of these 10 files:

1. Add `import Container from '@mui/material/Container';` if not already imported.
2. Replace the outermost layout wrapper with `<Container maxWidth="xl">`.

Specific transformations:

- **AdminProductsPage.tsx** (line ~139): The return's outermost `<Box p={3}>` becomes `<Container maxWidth="xl" sx={{ py: 3 }}>`. Remove the Box wrapper (keep its children).
- **AdminCategoriesPage.tsx** (line ~156): Same pattern -- `<Box p={3}>` becomes `<Container maxWidth="xl" sx={{ py: 3 }}>`.
- **AdminPagesPage.tsx** (line ~99): Same pattern -- `<Box p={3}>` becomes `<Container maxWidth="xl" sx={{ py: 3 }}>`.
- **AdminUsersPage.tsx** (line ~130): Same pattern -- `<Box p={3}>` becomes `<Container maxWidth="xl" sx={{ py: 3 }}>`.
- **AdminVariationTypesPage.tsx** (line ~279): Same pattern -- `<Box p={3}>` becomes `<Container maxWidth="xl" sx={{ py: 3 }}>`.
- **AdminOrdersPage.tsx** (line ~101): Same pattern -- `<Box p={3}>` becomes `<Container maxWidth="xl" sx={{ py: 3 }}>`.
- **AdminProductEditPage.tsx** (line ~32): Replace `<Box p={2} maxWidth={1400} mx="auto">` with `<Container maxWidth="xl" sx={{ py: 2 }}>`.
- **AdminUserDetailPage.tsx** (line ~55): Replace `<Box p={3} maxWidth="md" mx="auto">` with `<Container maxWidth="xl" sx={{ py: 3 }}>`.
- **AdminOrderDetailPage.tsx** (line ~110): Replace `<Box p={3} maxWidth="lg" mx="auto">` with `<Container maxWidth="xl" sx={{ py: 3 }}>`.
- **MyOrdersPage.tsx** (line ~77): Replace `<Box p={3} maxWidth="md" mx="auto">` with `<Container maxWidth="xl" sx={{ py: 3 }}>`.

IMPORTANT: Keep all children/content intact. Only change the outermost wrapper element. Preserve any padding as `py` on the Container's `sx` prop.
  </action>
  <verify>Run `npx tsc --noEmit` from trotinette-frontend/ to confirm no type errors. Grep all 10 files for `maxWidth="xl"` to confirm the change landed.</verify>
  <done>All 10 pages wrap their content in Container maxWidth="xl" with appropriate vertical padding.</done>
</task>

<task type="auto">
  <name>Task 2: Change existing Container/section maxWidth values to xl</name>
  <files>
    trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx
    trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
    trotinette-frontend/src/features/home/pages/HomePage.tsx
    trotinette-frontend/src/features/catalog/pages/DynamicPage.tsx
  </files>
  <action>
For each of these 5 files, change the Container maxWidth prop:

- **AdminHeroBannersPage.tsx**: Change `<Container maxWidth="lg">` to `<Container maxWidth="xl">`.
- **CheckoutPage.tsx** (line ~189): Change `<Container maxWidth="md">` to `<Container maxWidth="xl">`.
- **ProductDetailPage.tsx** (line ~189): Change `<Container maxWidth="lg">` to `<Container maxWidth="xl">`.
- **DynamicPage.tsx** (line ~85): Change `<Container maxWidth="md">` to `<Container maxWidth="xl">`.
- **HomePage.tsx**: Find the PromoSection area using `maxWidth="lg"` and the FooterCTA area using `maxWidth="md"`. Change both to `maxWidth="xl"`. These may be Container components or Box/sx maxWidth values -- change whichever pattern is used to Container maxWidth="xl" or maxWidth="xl" in sx as appropriate to match the existing pattern.

DO NOT change any Container inside auth form pages (Login, ForgotPassword, ResetPassword, Profile) or OrderConfirmationPage -- those are intentionally narrow.
  </action>
  <verify>Run `npx tsc --noEmit` from trotinette-frontend/. Grep all 5 files for `maxWidth="xl"` to confirm. Also grep to make sure no `maxWidth="md"` or `maxWidth="lg"` remain in these specific files (except where intentional inner containers exist).</verify>
  <done>All 5 pages use Container maxWidth="xl", matching the navbar width.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors from trotinette-frontend/
2. `grep -r 'maxWidth="xl"' trotinette-frontend/src/features/admin/pages/` shows all admin pages use xl
3. Auth pages (LoginPage, ForgotPasswordPage, ResetPasswordPage, ProfilePage) still use maxWidth="sm"
4. Visual spot-check: run `npm run dev` and verify admin tables, checkout, product detail, and home page sections all align with navbar width
</verification>

<success_criteria>
All 15 pages use Container maxWidth="xl" as their outermost width constraint, matching the navbar. Auth form pages and OrderConfirmation remain unchanged at maxWidth="sm". TypeScript compilation passes.
</success_criteria>

<output>
After completion, create `.planning/quick/15-align-all-page-content-containers-tables/15-SUMMARY.md`
</output>
