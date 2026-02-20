---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  # i18n removal - infrastructure
  - trotinette-frontend/src/app/i18n.ts
  - trotinette-frontend/src/main.tsx
  - trotinette-frontend/src/shared/api/client.ts
  - trotinette-frontend/src/shared/components/RTLProvider.tsx
  - trotinette-frontend/src/shared/components/LanguageSwitcher.tsx
  - trotinette-frontend/src/shared/hooks/useLanguage.ts
  - trotinette-frontend/src/shared/components/RtlSmokeTest.tsx
  - trotinette-frontend/src/locales/fr/translation.json
  - trotinette-frontend/src/locales/en/translation.json
  # i18n removal - all 50+ component files using useTranslation/t()
  - trotinette-frontend/src/shared/components/Navbar.tsx
  - trotinette-frontend/src/shared/components/Footer.tsx
  - trotinette-frontend/src/shared/components/RootLayout.tsx
  - trotinette-frontend/src/features/home/pages/HomePage.tsx
  - trotinette-frontend/src/features/catalog/pages/CatalogPage.tsx
  - trotinette-frontend/src/features/catalog/pages/ProductDetailPage.tsx
  - trotinette-frontend/src/features/catalog/components/FilterBar.tsx
  - trotinette-frontend/src/features/catalog/components/SpecsTable.tsx
  - trotinette-frontend/src/features/catalog/components/ProductCard.tsx
  - trotinette-frontend/src/features/catalog/components/ProductGrid.tsx
  - trotinette-frontend/src/features/catalog/components/StockBadge.tsx
  - trotinette-frontend/src/features/catalog/components/CategoryBreadcrumb.tsx
  - trotinette-frontend/src/features/catalog/components/TrustSignals.tsx
  - trotinette-frontend/src/features/catalog/components/WhatsAppButton.tsx
  - trotinette-frontend/src/features/catalog/hooks/useCatalogFilters.ts
  - trotinette-frontend/src/features/auth/pages/LoginPage.tsx
  - trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
  - trotinette-frontend/src/features/auth/components/LoginForm.tsx
  - trotinette-frontend/src/features/auth/components/RegisterForm.tsx
  - trotinette-frontend/src/features/auth/api/auth.ts
  - trotinette-frontend/src/features/auth/store.ts
  - trotinette-frontend/src/features/cart/components/CartBadge.tsx
  - trotinette-frontend/src/features/cart/components/CartDrawer.tsx
  - trotinette-frontend/src/features/cart/components/CartItem.tsx
  - trotinette-frontend/src/features/cart/store.ts
  - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
  - trotinette-frontend/src/features/checkout/pages/OrderConfirmationPage.tsx
  - trotinette-frontend/src/features/checkout/api/orders.ts
  - trotinette-frontend/src/features/orders/pages/MyOrdersPage.tsx
  - trotinette-frontend/src/features/orders/pages/AdminOrdersPage.tsx
  - trotinette-frontend/src/features/orders/pages/AdminOrderDetailPage.tsx
  - trotinette-frontend/src/features/orders/components/OrderStatusChip.tsx
  - trotinette-frontend/src/features/orders/api/orders.ts
  - trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminCategoriesPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminUserDetailPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminDeliveryZonesPage.tsx
  - trotinette-frontend/src/features/admin/components/ProductForm.tsx
  - trotinette-frontend/src/features/admin/components/CategoryForm.tsx
  - trotinette-frontend/src/features/admin/api/products.ts
  - trotinette-frontend/src/features/admin/api/categories.ts
  - trotinette-frontend/src/features/admin/api/users.ts
  - trotinette-frontend/src/features/admin/api/deliveryZones.ts
  - trotinette-frontend/src/shared/utils/formatCurrency.ts
  - trotinette-frontend/src/app/theme.ts
  - trotinette-frontend/src/app/themeStore.ts
  - trotinette-frontend/src/app/queryClient.ts
  - trotinette-frontend/src/App.tsx
  - trotinette-frontend/src/index.css
  # Specs fix
  - trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php
  - trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php
  # Image fix
  - trotinette-frontend/src/features/home/pages/HomePage.tsx
autonomous: true
must_haves:
  truths:
    - "All UI text is hardcoded French strings, no translation keys"
    - "No i18n infrastructure remains (no i18next imports, no useTranslation, no t() calls)"
    - "Product specs table shows key-value pairs, not individual characters"
    - "Product card images display correctly on catalog and home pages"
  artifacts:
    - path: "trotinette-frontend/src/shared/components/RTLProvider.tsx"
      provides: "Simplified ThemeProvider without i18n dependency"
    - path: "trotinette-frontend/src/shared/api/client.ts"
      provides: "API client with hardcoded Accept-Language: fr"
  key_links:
    - from: "trotinette-frontend/src/main.tsx"
      to: "RTLProvider"
      via: "Direct import, no i18n import"
      pattern: "no.*i18n"
---

<objective>
Remove all i18n infrastructure (i18next, react-i18next, useTranslation, LanguageSwitcher, translation JSON files) and replace every `t('key')` call with the corresponding hardcoded French string from fr/translation.json. Also fix the product attributes double-encoding bug and the product card background-image URL issue.

Purpose: Simplify the codebase by removing unnecessary multilingual support (app is French-only for Moroccan market), fix two visual bugs.
Output: Clean French-only codebase with working specs table and product card images.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@trotinette-frontend/src/locales/fr/translation.json
@trotinette-frontend/src/app/i18n.ts
@trotinette-frontend/src/shared/hooks/useLanguage.ts
@trotinette-frontend/src/shared/components/LanguageSwitcher.tsx
@trotinette-frontend/src/shared/components/RTLProvider.tsx
@trotinette-frontend/src/shared/api/client.ts
@trotinette-frontend/src/main.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove i18n infrastructure and hardcode French strings</name>
  <files>
    trotinette-frontend/src/app/i18n.ts
    trotinette-frontend/src/shared/hooks/useLanguage.ts
    trotinette-frontend/src/shared/components/LanguageSwitcher.tsx
    trotinette-frontend/src/shared/components/RtlSmokeTest.tsx
    trotinette-frontend/src/locales/fr/translation.json
    trotinette-frontend/src/locales/en/translation.json
    trotinette-frontend/src/main.tsx
    trotinette-frontend/src/shared/components/RTLProvider.tsx
    trotinette-frontend/src/shared/api/client.ts
    trotinette-frontend/src/app/theme.ts
    trotinette-frontend/src/index.css
    (+ all 50+ component files that import useTranslation or call t())
  </files>
  <action>
    **Phase A: Reference the French translation file.**
    Open `src/locales/fr/translation.json` and keep it open as reference. Every `t('some.key')` call must be replaced with the exact French string from this file.

    **Phase B: Delete i18n infrastructure files.**
    Delete these files entirely:
    - `src/app/i18n.ts`
    - `src/shared/hooks/useLanguage.ts`
    - `src/shared/components/LanguageSwitcher.tsx`
    - `src/shared/components/RtlSmokeTest.tsx`
    - `src/locales/fr/translation.json`
    - `src/locales/en/translation.json`

    **Phase C: Simplify RTLProvider.**
    `src/shared/components/RTLProvider.tsx` currently imports `useTranslation` to detect language. Simplify it:
    - Remove `useTranslation` import and `i18n.language` usage
    - Hardcode `dir="ltr"` and `lang="fr"` in the useEffect
    - Remove the `isRtl` variable entirely
    - Always pass `'ltr'` to `createMiraiTheme(mode, 'ltr')`
    - The component still provides ThemeProvider + CssBaseline (keep that)

    **Phase D: Simplify API client.**
    `src/shared/api/client.ts` imports `i18n` from `i18next` for Accept-Language header.
    - Remove the `import i18n from 'i18next'` line
    - Hardcode `config.headers['Accept-Language'] = 'fr';` in the request interceptor

    **Phase E: Remove i18n import from main.tsx.**
    - Remove the line `import './app/i18n';`
    - Remove the comment about i18n FOUC

    **Phase F: Replace ALL `t()` calls in every component file.**
    For EACH of the ~50 files that import `useTranslation` or `react-i18next`:
    1. Remove the `import { useTranslation } from 'react-i18next'` line
    2. Remove the `const { t } = useTranslation()` line (or `const { t, i18n } = ...`)
    3. Replace every `t('key.path')` with the French string from translation.json
    4. For interpolated strings like `t('catalog.showing', { count })` replace with a template literal: `` `${count} produit(s) trouve(s)` ``
    5. Remove any `LanguageSwitcher` component usage from Navbar or other components
    6. If `useLanguage` hook is imported anywhere, remove it

    **Key translations to use (from fr/translation.json):**
    - `t('nav.home')` -> `"Accueil"`
    - `t('nav.catalog')` -> `"Catalogue"`
    - `t('nav.cart')` -> `"Panier"`
    - `t('nav.account')` -> `"Mon compte"`
    - `t('nav.login')` -> `"Connexion"`
    - `t('nav.logout')` -> `"Deconnexion"`
    - `t('nav.admin')` -> `"Administration"`
    - `t('product.addToCart')` -> `"Ajouter au panier"`
    - `t('product.outOfStock')` -> `"Rupture de stock"`
    - `t('product.specifications')` -> `"Caracteristiques"`
    - `t('product.notFound')` -> `"Produit introuvable"`
    - `t('product.backToCatalog')` -> `"Retour au catalogue"`
    - `t('product.askWhatsApp')` -> `"Demander sur WhatsApp"`
    - (and ALL other keys — refer to the full JSON file)

    **Phase G: Also check non-obvious i18n usage.**
    - `src/app/theme.ts` — check if `direction` param references i18n
    - `src/app/themeStore.ts` — check for language storage
    - `src/app/queryClient.ts` — check for i18n imports
    - `src/index.css` — check for `[dir="rtl"]` rules (remove them if present)

    **Phase H: Uninstall npm packages.**
    Run: `cd trotinette-frontend && npm uninstall i18next react-i18next i18next-browser-languagedetector`

    **IMPORTANT:** Do NOT leave any `import` from `react-i18next`, `i18next`, or `i18next-browser-languagedetector` in any file. Grep the entire src/ directory to confirm zero references remain.
  </action>
  <verify>
    1. `cd trotinette-frontend && npx tsc --noEmit` — zero type errors
    2. `grep -r "useTranslation\|i18next\|react-i18next\|useLanguage\|LanguageSwitcher" src/ --include="*.ts" --include="*.tsx"` — zero matches
    3. `npm run build` — builds successfully with no warnings about missing modules
  </verify>
  <done>
    All i18n packages uninstalled, all infrastructure files deleted, all t() calls replaced with hardcoded French strings, API client sends hardcoded Accept-Language: fr, RTLProvider simplified, app compiles and builds cleanly with zero i18n references.
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix attributes double-encoding and product card images</name>
  <files>
    trotinette-api/app/Http/Requests/Admin/StoreProductRequest.php
    trotinette-api/app/Http/Requests/Admin/UpdateProductRequest.php
    trotinette-frontend/src/features/catalog/components/SpecsTable.tsx
    trotinette-frontend/src/features/catalog/components/ProductCard.tsx
    trotinette-frontend/src/features/home/pages/HomePage.tsx
  </files>
  <action>
    **Bug 1: Attributes double-encoding**

    Root cause: The admin form sends `attributes` as a JSON string via FormData (`fd.append('attributes', JSON.stringify(data.attributes))`). The request's `prepareForValidation()` decodes it to an array. BUT the validation rule says `'attributes' => 'nullable|string'` — since it's now an array after prepareForValidation, Laravel may re-encode or the validation passes oddly. The real problem: `prepareForValidation()` decodes the JSON string, then `$request->validated()` or `$request->all()` returns the decoded array. But ProductService saves `$data['attributes']` which is now an array. With the `'array'` cast on the model, Eloquent calls `json_encode()` on it. If somehow attributes arrives as a JSON string to the model (e.g., prepareForValidation didn't run, or the merge didn't stick), the cast encodes the string, creating double-encoding.

    **Fix in StoreProductRequest.php and UpdateProductRequest.php:**
    1. Change the validation rule from `'attributes' => 'nullable|string'` to `'attributes' => 'nullable|array'` (since prepareForValidation already decoded it)
    2. Keep `prepareForValidation()` as-is (it handles the FormData JSON string -> array conversion)
    3. This ensures validation enforces it's an array before it reaches ProductService

    **Fix in SpecsTable.tsx (frontend safety):**
    Add a safety parse at the top of the component function, after the null check:
    ```typescript
    // Safety: if attributes is a JSON string (double-encoding bug), parse it
    let parsed = attributes;
    if (typeof attributes === 'string') {
      try { parsed = JSON.parse(attributes); } catch { return null; }
    }
    ```
    Then use `parsed` instead of `attributes` for `Object.entries()`.

    **Bug 2: Product card images not showing**

    Root cause: `backgroundImage: \`url(${imageUrl})\`` fails when the URL contains spaces or special characters.

    **Fix in ProductCard.tsx (line 99):**
    Change from:
    ```
    backgroundImage: `url(${imageUrl})`,
    ```
    To:
    ```
    backgroundImage: `url("${imageUrl}")`,
    ```
    This quotes the URL inside the CSS url() function, handling spaces and special chars.

    **Fix in HomePage.tsx (line 250, same pattern):**
    Find the `backgroundImage: \`url(${imageUrl})\`` pattern and add quotes:
    ```
    backgroundImage: `url("${imageUrl}")`,
    ```

    **Also in ProductCard.tsx:** While editing, replace the English strings with French:
    - `"Featured"` -> `"Vedette"`
    - `"Out of Stock"` -> `"Rupture de stock"` (chip label)
    - `"In Stock"` -> `"En stock"`
    - `"Out of Stock"` (bottom) -> `"Epuise"`
  </action>
  <verify>
    1. `cd trotinette-frontend && npx tsc --noEmit` — zero type errors
    2. `cd trotinette-frontend && npm run build` — builds cleanly
    3. In StoreProductRequest.php and UpdateProductRequest.php, confirm `'attributes' => 'nullable|array'` (not string)
    4. In SpecsTable.tsx, confirm typeof string safety parse exists
    5. In ProductCard.tsx and HomePage.tsx, confirm `url("${imageUrl}")` with quotes
  </verify>
  <done>
    Backend validates attributes as array (not string), preventing double-encoding on save. Frontend has safety parse for any existing double-encoded data. Product card images use properly quoted CSS url() values. English strings in ProductCard replaced with French.
  </done>
</task>

</tasks>

<verification>
1. Full TypeScript compilation: `cd trotinette-frontend && npx tsc --noEmit` passes
2. Production build: `cd trotinette-frontend && npm run build` succeeds
3. Zero i18n references: `grep -r "i18next\|react-i18next\|useTranslation\|useLanguage" src/ --include="*.ts" --include="*.tsx"` returns nothing
4. No English UI strings remain in components (spot-check Navbar, ProductCard, CheckoutPage)
5. SpecsTable has typeof safety parse for string attributes
6. ProductCard and HomePage use quoted url() in backgroundImage
7. Backend request validators use `'attributes' => 'nullable|array'`
</verification>

<success_criteria>
- App builds and runs with zero i18n dependencies
- All visible UI text is in French
- Product specs table renders key-value pairs correctly (not char-by-char)
- Product card images display on catalog page and home page
- No regression in existing functionality
</success_criteria>

<output>
After completion, create `.planning/quick/2-remove-i18n-french-only-fix-specs-displa/2-SUMMARY.md`
</output>
