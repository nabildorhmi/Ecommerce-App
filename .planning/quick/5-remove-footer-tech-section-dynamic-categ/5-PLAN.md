---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/shared/components/Footer.tsx
  - trotinette-frontend/src/features/home/pages/HomePage.tsx
autonomous: true
must_haves:
  truths:
    - "Footer no longer shows the Technology column with battery/screen/braking/app boxes"
    - "Footer Products column dynamically lists categories from the API instead of hardcoded links"
    - "Footer Products column first link is 'Tous les produits' linking to /products"
    - "Homepage shows one featured section per category with products grouped by category"
    - "Homepage featured sections only appear for categories that have featured products"
    - "Each homepage featured section title reads 'Nos [Category Name] en vedette'"
  artifacts:
    - path: "trotinette-frontend/src/shared/components/Footer.tsx"
      provides: "Dynamic footer with category links, no tech column"
    - path: "trotinette-frontend/src/features/home/pages/HomePage.tsx"
      provides: "Per-category featured product sections"
  key_links:
    - from: "Footer.tsx"
      to: "useCategories()"
      via: "import from ../../features/catalog/api/categories"
      pattern: "useCategories"
    - from: "HomePage.tsx FeaturedSection"
      to: "useFeaturedProducts()"
      via: "groupBy product.category?.id"
      pattern: "category"
---

<objective>
Remove the Technology section from the footer, replace hardcoded product links with dynamic category links from the API, and refactor the homepage to show featured products grouped by category instead of a single flat list.

Purpose: Clean up footer layout and make both footer navigation and homepage featured sections data-driven from actual categories.
Output: Updated Footer.tsx and HomePage.tsx
</objective>

<context>
@trotinette-frontend/src/shared/components/Footer.tsx
@trotinette-frontend/src/features/home/pages/HomePage.tsx
@trotinette-frontend/src/features/catalog/api/products.ts
@trotinette-frontend/src/features/catalog/api/categories.ts
@trotinette-frontend/src/features/catalog/types.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Footer - Remove tech column and add dynamic category links</name>
  <files>trotinette-frontend/src/shared/components/Footer.tsx</files>
  <action>
1. Add import for `useCategories` from `../../features/catalog/api/categories` and import for `Link` (already imported).

2. Delete the entire "Technology highlight" Grid item (lines 175-215) — the 4th column with the tech feature boxes (battery, screen, braking, app control).

3. Since we removed the md:4 Technology column, redistribute the grid widths. The remaining 3 columns should use:
   - Brand: `md: 5` (was 4)
   - Products: `md: 3` (was 2)
   - Company: `md: 3` (was 2)
   This keeps the total at 11 which is fine, or use md:6, md:3, md:3 for a clean 12.

4. Replace the hardcoded Products column content. Inside the `<Stack spacing={1}>`:
   - First item: a static link "Tous les produits" pointing to `/products`
   - Then: call `useCategories()` at the top of the Footer function, extract `categories = data?.data ?? []`, and map over categories to render each as a link with text `cat.name` pointing to `/products?filter[category_id]=${cat.id}`
   - Use the same styling as existing links (fontSize 0.82rem, color #9CA3AF, hover #F5F7FA, no text-decoration)

Note: The Footer component will need to become a component that calls a hook, which it already is (it's a function component). Just add the hook call at the top of the function body.
  </action>
  <verify>Run `npx tsc --noEmit` from trotinette-frontend to confirm no type errors. Visually inspect that footer renders 3 columns with dynamic category links.</verify>
  <done>Footer has 3 columns (no Technology), Products column shows "Tous les produits" + dynamic category links from API.</done>
</task>

<task type="auto">
  <name>Task 2: Homepage - Featured products grouped by category</name>
  <files>trotinette-frontend/src/features/home/pages/HomePage.tsx</files>
  <action>
1. Refactor the `FeaturedSection` component to group products by category:
   - Keep the existing `useFeaturedProducts()` hook call (single API call, no N+1)
   - After getting `products`, group them by `product.category?.id` (use a reduce or similar). Products with `category === null` can be grouped under a fallback key like `0`
   - Build a structure like `Map<number, { categoryName: string, products: Product[] }>`
   - For category name, use `product.category?.name ?? 'Autres'`

2. Instead of rendering one section, render one section per category group. For each group:
   - Use the same section layout (the Box with bgcolor background.default, py spacing)
   - BUT wrap all sections in a single parent fragment or Box so they stack vertically
   - Each section gets its own `useRef` for scroll (create refs dynamically or use a callback ref pattern). Simplest: extract a `CategoryFeaturedRow` sub-component that takes `categoryName` and `products` as props and has its own `scrollRef`.

3. Create a `CategoryFeaturedRow` component (inside HomePage.tsx, not exported):
   - Props: `{ categoryName: string; products: Product[] }`
   - Has its own `useRef<HTMLDivElement>(null)` for horizontal scroll
   - Has its own scroll left/right function
   - Renders the section header with title "NOS {categoryName.toUpperCase()} EN VEDETTE" (replacing the old "NOS SCOOTERS EN VEDETTE")
   - Keep the Japanese text "精選モデル  HANDPICKED" as-is
   - Renders the same horizontal scroll card layout with arrow buttons
   - Renders the same product cards (copy the existing card JSX)
   - Does NOT show "VOIR TOUS LES MODELES" button per section — only show it once at the bottom after all sections

4. Update the `FeaturedSection` component:
   - If loading, show the skeleton (same as current)
   - If no products at all, show the empty state (same as current)
   - Otherwise, group products by category, then render `<CategoryFeaturedRow>` for each group
   - After all rows, show the "VOIR TOUS LES MODELES" button once
   - Skip groups with 0 products (shouldn't happen since we're grouping existing products, but defensive)

5. Keep all existing imports. Import `Product` type from `../../catalog/types` if needed for the sub-component props typing.
  </action>
  <verify>Run `npx tsc --noEmit` from trotinette-frontend to confirm no type errors. Visit homepage and confirm multiple featured sections appear, one per category, each with appropriate title.</verify>
  <done>Homepage shows one horizontal-scroll featured section per category. Each section titled "NOS [CATEGORY] EN VEDETTE". Categories with no featured products are not shown. Single "VOIR TOUS LES MODELES" button at bottom.</done>
</task>

</tasks>

<verification>
- `cd trotinette-frontend && npx tsc --noEmit` passes with no errors
- `npm run build` (or `npx vite build`) completes successfully
- Footer visually shows 3 columns, no Technology section, dynamic category links
- Homepage shows per-category featured sections with horizontal scroll
</verification>

<success_criteria>
- Technology column completely removed from footer
- Footer Products column dynamically populated from useCategories() API
- Homepage featured products grouped by category with per-category section titles
- No TypeScript errors, build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/5-remove-footer-tech-section-dynamic-categ/5-SUMMARY.md`
</output>
