---
phase: quick-18
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/features/admin/components/ProductForm.tsx
  - trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
  - trotinette-frontend/src/features/admin/components/ProductVariantsSection.tsx
  - trotinette-frontend/src/features/cart/components/CartDrawer.tsx
  - trotinette-frontend/src/features/cart/components/CartItem.tsx
autonomous: true

must_haves:
  truths:
    - "Admin can create a product using a clear step-by-step form with labeled sections and visual guidance"
    - "Admin product list shows quick-action chips and is easy to scan"
    - "Cart drawer items can be removed with a clear swipe gesture on mobile and quantity can be edited by tapping the number"
  artifacts:
    - path: "trotinette-frontend/src/features/admin/components/ProductForm.tsx"
      provides: "Simplified product form with MUI Stepper for create mode, collapsible Accordion for edit mode"
    - path: "trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx"
      provides: "Improved product table with inline stock editing and cleaner layout"
    - path: "trotinette-frontend/src/features/cart/components/CartDrawer.tsx"
      provides: "Improved cart with tap-to-edit quantity and better empty state"
  key_links:
    - from: "trotinette-frontend/src/features/admin/components/ProductForm.tsx"
      to: "/admin/products API"
      via: "useCreateProduct / useUpdateProduct mutations"
      pattern: "createMutation\\.mutateAsync|updateMutation\\.mutateAsync"
    - from: "trotinette-frontend/src/features/cart/components/CartItem.tsx"
      to: "useCartStore"
      via: "updateQuantity and removeItem actions"
      pattern: "useCartStore"
---

<objective>
Improve admin panel user-friendliness, simplify product creation flow, and enhance cart UX.

Purpose: The admin product form is a single long scroll with dense fields that overwhelm new users. Product creation requires filling many fields at once with no guidance. The cart UX can be improved with better quantity editing and visual feedback.

Output: Simplified product creation stepper, improved product list table, enhanced cart drawer interactions.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@trotinette-frontend/src/features/admin/components/ProductForm.tsx
@trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
@trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
@trotinette-frontend/src/features/admin/components/ProductVariantsSection.tsx
@trotinette-frontend/src/features/cart/components/CartDrawer.tsx
@trotinette-frontend/src/features/cart/components/CartItem.tsx
@trotinette-frontend/src/features/admin/api/products.ts
@trotinette-frontend/src/features/admin/types.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Simplify product creation form with stepper wizard and improve edit mode with collapsible sections</name>
  <files>
    trotinette-frontend/src/features/admin/components/ProductForm.tsx
    trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx
  </files>
  <action>
Refactor ProductForm.tsx to be more user-friendly:

**Create mode - Stepper wizard (MUI Stepper):**
- Step 1 "Essentiel": SKU (auto-generate default from name like "PROD-{timestamp}" with editable override), Name, Category selector, Price (MAD). Keep it minimal — just 4 fields to get started.
- Step 2 "Details": Slug (auto-generated, shown as preview URL), Description (markdown editor), Discount %, Switches (Actif/Vedette/Nouveau) grouped in a row.
- Step 3 "Caracteristiques": Dynamic attributes section with template chips. Keep existing template logic but add a helper text explaining: "Les caracteristiques apparaissent sur la fiche produit (ex: vitesse max, autonomie, poids)".
- Step 4 "Images": Image uploader (existing ImageUploader component). Add helper text: "La premiere image sera utilisee comme image principale".
- Add "Precedent" / "Suivant" navigation buttons. Final step shows "Creer le produit" button.
- Add a summary preview panel on the right side (on lg+ screens) showing a mini product card preview as fields are filled.

**Edit mode - Accordion sections (MUI Accordion):**
- Keep all fields on one page but organize into collapsible Accordion sections matching the stepper steps: "Essentiel", "Details", "Caracteristiques", "Images".
- Default: all sections expanded. User can collapse sections they are not editing.
- Keep the existing save button at the bottom.

**SKU auto-generation for create mode:**
- When name field changes and SKU has not been manually edited, auto-generate SKU: take first 3 chars of category name (uppercase) + "-" + slugified first word of product name + "-" + random 4-digit number. Example: "TRO-ninebot-4821". If no category selected yet, use "PRD" prefix.
- Add a small "auto" chip next to SKU field that turns off auto-generation when user manually types.

**Form field improvements:**
- Add placeholder text to all fields with examples (e.g., Price placeholder: "ex: 4999.00")
- Add InputAdornment "MAD" to price field instead of label "(MAD)"
- Group the 3 boolean switches (Actif/Vedette/Nouveau) with descriptive tooltips explaining each one:
  - Actif: "Le produit est visible sur le site"
  - Vedette: "Apparait dans la section produits vedettes"
  - Nouveau: "Affiche un badge 'Nouveau' sur la fiche"

**Remove bilingual labels from ProductVariantsSection.tsx:**
- Replace all "French / English" dual labels with French-only labels (this is a French-only app per project decision).
- "Modifier la variante / Edit variant" -> "Modifier la variante"
- "Ajouter une variante / Add variant" -> "Ajouter une variante"
- "Supprimer la variante / Delete variant" -> "Supprimer la variante"
- "Sélectionner / Select" -> "Selectionner"
- "Active / Active" -> "Active"
- "Annuler / Cancel" -> "Annuler"
- "Modifier / Update" -> "Modifier"
- "Créer / Create" -> "Creer"
- "Rechercher / Search" -> "Rechercher"
- "Aucun résultat / No results" -> "Aucun resultat"
- "Aucune variante d'attribut / No attribute variants" -> "Aucune variante d'attribut"
- "Par défaut / Default" -> "Par defaut"
- All other dual-language strings in that file.
- Also clean up the helper texts: "Laissez vide pour utiliser le prix de base du produit / Leave empty to use base product price" -> "Laissez vide pour utiliser le prix de base"

**AdminProductEditPage.tsx adjustments:**
- For create mode, render the stepper version of ProductForm (pass `mode="create"` prop).
- For edit mode, render the accordion version (pass `mode="edit"` prop).
- The ProductVariantsSection stays on the right side in edit mode as it is currently.
  </action>
  <verify>
- Navigate to /admin/products/create — stepper wizard appears with 4 steps, navigation works between steps
- Fill name field — SKU auto-generates, slug auto-generates
- Complete all steps and click "Creer le produit" — product is created via API
- Navigate to /admin/products/{id}/edit — accordion sections appear, all fields populate from existing product
- Expand/collapse accordion sections works correctly
- All bilingual labels in ProductVariantsSection are now French-only
- `npx tsc --noEmit` passes with no type errors in modified files
  </verify>
  <done>
- Product creation uses a 4-step stepper wizard with clear guidance and minimal fields per step
- Product editing uses collapsible accordion sections for easy navigation
- SKU auto-generates from category + name in create mode
- All form fields have helpful placeholders and tooltips
- ProductVariantsSection uses French-only labels (no more dual FR/EN strings)
  </done>
</task>

<task type="auto">
  <name>Task 2: Improve admin product list table and enhance cart drawer UX</name>
  <files>
    trotinette-frontend/src/features/admin/pages/AdminProductsPage.tsx
    trotinette-frontend/src/features/cart/components/CartDrawer.tsx
    trotinette-frontend/src/features/cart/components/CartItem.tsx
  </files>
  <action>
**AdminProductsPage.tsx improvements:**

1. **Inline stock editing**: Replace the static stock number cell with a clickable chip that opens a small inline TextField. When the user clicks the stock number, it becomes an editable input. On blur or Enter, it saves via the useUpdateProduct mutation (passing stock_quantity). Show a small check icon when saved. This requires the backend to accept stock_quantity on update — but since stock is managed via variants, instead show the total stock as a read-only chip with a tooltip "Gerez le stock via les variantes sur la page d'edition" and a link icon that navigates to the edit page.

2. **Quick duplicate action**: Add a "Dupliquer" (duplicate) icon button in the Actions column next to Edit and Delete. When clicked, navigate to /admin/products/create?duplicate={productId}. In the ProductForm create mode, detect this query param and pre-fill the form with the duplicated product's data (all fields except SKU and slug, which get auto-generated fresh). This saves significant time when adding similar products.

3. **Improved empty state**: When no products exist, show a centered illustration-style empty state with a large AddIcon in a circle, "Aucun produit" heading, "Commencez par ajouter votre premier produit" subtitle, and a prominent "Ajouter un produit" CTA button.

4. **Row click to edit**: Make the entire table row clickable (navigate to edit page) except for the action buttons column. Use `onClick` on the TableRow with `e.stopPropagation` on action buttons. Add `cursor: pointer` to rows.

**CartDrawer.tsx improvements:**

1. **Animated item count in header**: When totalItems changes, add a subtle scale bounce animation on the count chip (use framer-motion's `animate` with key={totalItems} to trigger on change).

2. **"Vider le panier" (Clear cart) button**: Add a small text button "Vider le panier" in the header area (next to "Panier" title) that appears when items.length > 0. On click, show a small confirmation popover (MUI Popover, not a full Dialog) asking "Vider le panier ?" with "Oui" / "Non" buttons. On confirm, call clearCart() from the store.

3. **Cart summary improvements**: Below the subtotal in the footer, add an estimated savings line when any cart item has a promo price. Calculate: sum of (originalPrice - promoPrice) * quantity for items on sale. Show: "Vous economisez {formatCurrency(savings)}" in green text. Only render this line if savings > 0.

**CartItem.tsx improvements:**

1. **Tap-to-edit quantity**: Replace the +/- stepper with a hybrid approach:
   - Keep the +/- buttons for quick increment/decrement
   - Make the quantity number in the center tappable — on click, it becomes a small number input (type="number", min=1, max=stockQuantity, width ~40px). On blur or Enter, update the quantity. On Escape, cancel edit. This lets users type "5" instead of pressing "+" five times.

2. **Swipe-to-reveal delete on mobile**: On touch devices (detect via `window.matchMedia('(pointer: coarse)')`), allow horizontal swipe-left on the cart item to reveal a red delete button behind it. Use framer-motion's `drag="x"` with `dragConstraints` and `onDragEnd` to detect threshold. If swiped past 80px, reveal the delete. The existing delete icon button stays visible on desktop.

3. **Visual feedback on quantity change**: When quantity changes, flash a brief highlight on the item total price (right side) — a 300ms background-color pulse using framer-motion animate.
  </action>
  <verify>
- Product list: click anywhere on a row to navigate to edit page; action buttons still work independently
- Product list: Dupliquer button navigates to create page with pre-filled form
- Product list: empty state shows attractive CTA when no products match filters
- Cart: tapping quantity number opens inline edit, typing a new number and pressing Enter updates it
- Cart: "Vider le panier" button appears when cart has items, confirmation popover works
- Cart: savings line appears in footer when promo-priced items are in cart
- Cart: on mobile/touch, swiping left on cart item reveals delete button
- `npx tsc --noEmit` passes with no type errors
  </verify>
  <done>
- Admin product list has row-click navigation, duplicate action button, and improved empty state
- Cart drawer has clear-all with confirmation, animated count, and savings display
- Cart items support tap-to-edit quantity and swipe-to-delete on mobile
- All interactions provide visual feedback (animations, highlights)
  </done>
</task>

</tasks>

<verification>
1. Navigate to /admin/products — table is interactive (row clicks, duplicate, stock tooltips)
2. Navigate to /admin/products/create — 4-step stepper wizard guides through product creation
3. Navigate to /admin/products/{id}/edit — accordion sections organize the form, variants section is French-only
4. Open cart drawer — quantity tap-to-edit works, clear cart button works, savings line appears for promo items
5. On mobile viewport — swipe-to-delete on cart items works
6. `npx tsc --noEmit` — zero TypeScript errors
</verification>

<success_criteria>
- Product creation is guided: 4-step wizard with minimal fields per step
- Product editing is organized: collapsible accordion sections
- SKU auto-generates in create mode from category + product name
- All admin variant labels are French-only (no dual FR/EN)
- Product list supports row-click, duplicate, and improved empty state
- Cart supports tap-to-edit quantity, clear-all, savings display, and swipe-to-delete on mobile
- No TypeScript errors introduced
</success_criteria>

<output>
After completion, create `.planning/quick/18-make-admin-panel-more-user-friendly-simp/18-SUMMARY.md`
</output>
