---
phase: quick-11
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/features/info/pages/DynamicPage.tsx
  - trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
  - trotinette-frontend/src/features/info/api/pages.ts
  - trotinette-api/database/seeders/PageSeeder.php
  - trotinette-api/resources/views/invoices/invoice.blade.php
autonomous: true

must_haves:
  truths:
    - "Admin/global_admin visiting a static page sees an Edit FAB button"
    - "Clicking Edit shows a WYSIWYG editor with the page content inline"
    - "Admin can save edits and see updated content immediately"
    - "Non-admin users see no edit controls"
    - "AdminPagesPage dialog uses WYSIWYG editor instead of monospace textarea"
    - "PDF invoice shows order number and date below FACTURE title"
    - "PDF invoice shows client info in a compact single-line format"
    - "PDF invoice totals section has light grey background with border"
  artifacts:
    - path: "trotinette-frontend/src/features/info/pages/DynamicPage.tsx"
      provides: "Inline WYSIWYG editing for admin users"
    - path: "trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx"
      provides: "WYSIWYG editor in edit dialog"
    - path: "trotinette-api/resources/views/invoices/invoice.blade.php"
      provides: "Improved PDF invoice layout"
  key_links:
    - from: "DynamicPage.tsx"
      to: "useUpdatePage mutation"
      via: "imported from admin/api/pages.ts"
      pattern: "useUpdatePage"
    - from: "DynamicPage.tsx"
      to: "useAuthStore"
      via: "checks user.role for admin/global_admin"
      pattern: "useAuthStore"
---

<objective>
Add inline WYSIWYG page editing for admin users on static pages, replace markdown textarea with WYSIWYG in AdminPagesPage, and improve PDF invoice layout.

Purpose: Let admins edit page content directly where they view it with a rich text editor, and polish the invoice PDF appearance.
Output: Updated DynamicPage with inline editing, updated AdminPagesPage with WYSIWYG, improved invoice template.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-frontend/src/features/info/pages/DynamicPage.tsx
@trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
@trotinette-frontend/src/features/admin/api/pages.ts
@trotinette-frontend/src/features/info/api/pages.ts
@trotinette-frontend/src/features/auth/store.ts
@trotinette-api/database/seeders/PageSeeder.php
@trotinette-api/resources/views/invoices/invoice.blade.php
</context>

<tasks>

<task type="auto">
  <name>Task 1: Inline WYSIWYG editing on DynamicPage and AdminPagesPage</name>
  <files>
    trotinette-frontend/src/features/info/pages/DynamicPage.tsx
    trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
    trotinette-frontend/src/features/info/api/pages.ts
    trotinette-api/database/seeders/PageSeeder.php
  </files>
  <action>
**Step 1: Install react-quill-new**

Run `npm install react-quill-new` in the `trotinette-frontend` directory.

**Step 2: Update PageSeeder.php to store HTML instead of markdown**

Convert the existing markdown content in all 4 pages (a-propos, contact, cgv, mentions-legales) to equivalent HTML. Replace the `<<<'MD' ... MD` heredocs with `<<<'HTML' ... HTML` heredocs containing proper HTML:
- `## Heading` becomes `<h2>Heading</h2>`
- Paragraphs become `<p>...</p>`
- Plain text paragraphs get wrapped in `<p>` tags
- Maintain all the same French text content exactly

**Step 3: Update DynamicPage.tsx with inline editing**

Replace `ReactMarkdown` rendering with `dangerouslySetInnerHTML` for HTML content.

Add admin inline editing capability:
- Import `useAuthStore` from `../../auth/store`
- Import `useUpdatePage` from `../../admin/api/pages` (reuse existing mutation)
- Import `useQueryClient` from `@tanstack/react-query`
- Import `ReactQuill` from `react-quill-new` and its CSS: `import 'react-quill-new/dist/quill.snow.css'`
- Import MUI: `Fab`, `Button`, `Stack`, `Snackbar`, `Alert` from MUI, `EditIcon` from `@mui/icons-material/Edit`
- Add state: `isEditing` (boolean), `editContent` (string), `successOpen` (boolean)
- Check `const user = useAuthStore((s) => s.user)` and determine `const isAdmin = user?.role === 'admin' || user?.role === 'global_admin'`
- When NOT editing: render page content with `dangerouslySetInnerHTML={{ __html: page.content }}`. If `isAdmin`, show a Fab with EditIcon in the top-right corner of the content area (position: fixed, bottom: 24, right: 24, or use `sx={{ position: 'fixed', bottom: 24, right: 24 }}`)
- When editing: replace the content area with `<ReactQuill theme="snow" value={editContent} onChange={setEditContent} />` plus a Stack with Save and Cancel buttons below the editor
- On Edit click: `setEditContent(page.content)` and `setIsEditing(true)`
- On Cancel: `setIsEditing(false)`
- On Save: call `updateMutation.mutateAsync({ slug, title: page.title, content: editContent })`, then `setIsEditing(false)`, `setSuccessOpen(true)`. The mutation already invalidates `['pages']` queries so data will refetch.
- Add success Snackbar like AdminPagesPage has

Apply some basic styling to the HTML content area to match what ReactMarkdown was doing:
```tsx
sx={{
  '& h2': { mt: 3, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' },
  '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 2 },
}}
```

**Step 4: Update AdminPagesPage.tsx to use WYSIWYG editor**

In the edit dialog, replace the monospace `<TextField multiline>` for content with ReactQuill:
- Import `ReactQuill` from `react-quill-new` and its CSS
- Since react-hook-form `register` doesn't work directly with ReactQuill (it's not a native input), use `watch` and `setValue` from `useForm` instead of `register('content')`:
  - Destructure `watch` and `setValue` from `useForm`
  - Watch the content value: `const contentValue = watch('content')`
  - Render: `<ReactQuill theme="snow" value={contentValue || ''} onChange={(val) => setValue('content', val, { shouldValidate: true })} />`
- Keep the title TextField with `register('title')` as-is
- Remove the markdown syntax hint Typography since we now have WYSIWYG
- Keep everything else (schema validation, form submission, Snackbar) the same
  </action>
  <verify>
Run `cd trotinette-frontend && npx tsc --noEmit` to verify no TypeScript errors. Check that `react-quill-new` is in package.json dependencies.
  </verify>
  <done>
Admin users see a floating Edit button on static pages. Clicking it shows a Quill WYSIWYG editor inline. Save persists changes and shows updated HTML content. AdminPagesPage edit dialog also uses Quill instead of a plain textarea. Non-admin users see content rendered as HTML with no edit controls.
  </done>
</task>

<task type="auto">
  <name>Task 2: PDF invoice layout improvements</name>
  <files>
    trotinette-api/resources/views/invoices/invoice.blade.php
  </files>
  <action>
Modify the invoice Blade template with these three layout changes:

**Change 1: Move date and order number below FACTURE title**

Update `.header-right` in the HTML body:
```html
<div class="header-right">
    <div class="invoice-title">FACTURE</div>
    <div class="invoice-meta">N&deg; {{ $order->order_number }}</div>
    <div class="invoice-meta">Date: {{ $order->created_at->format('d/m/Y') }}</div>
</div>
```

Add CSS for `.invoice-meta`:
```css
.invoice-meta {
    font-size: 10pt;
    color: #4b5563;
    margin-top: 4px;
}
```

**Change 2: Replace order-info grid with compact client info**

Replace the entire `.order-info` div (lines 164-188) with:
```html
<div class="client-info">
    <strong>Client:</strong> {{ $order->user->name }} &nbsp;|&nbsp; <strong>Tel:</strong> {{ $order->phone }} &nbsp;|&nbsp; <strong>Ville:</strong> {{ $order->city }}
</div>
```

Add CSS for `.client-info`:
```css
.client-info {
    margin-bottom: 15px;
    padding: 10px 12px;
    border-top: 1px solid #d1d5db;
    border-bottom: 1px solid #d1d5db;
    font-size: 10pt;
}
```

Remove the now-unused CSS rules: `.order-info`, `.order-info h3`, `.order-info-grid`, `.order-info-row`, `.order-info-label`, `.order-info-value`.

**Change 3: Totals section with border and light grey background**

Update `.totals` CSS to add:
```css
.totals {
    margin-left: auto;
    width: 300px;
    margin-bottom: 15px;
    border: 1px solid #e5e7eb;
    background-color: #f9fafb;
    padding: 10px;
}
```

Update `.totals-row.total` CSS - remove the dark background/white text, replace with:
```css
.totals-row.total {
    font-weight: bold;
    font-size: 11pt;
    padding: 8px 0;
    margin-top: 5px;
    border-top: 1px solid #d1d5db;
    color: #111827;
}
```
  </action>
  <verify>
Visually inspect the template file to confirm: (1) FACTURE header has order number and date below it, (2) client info is a single compact line, (3) totals section has border and light grey background with no dark row. If the app has a route to generate an invoice, test by downloading one.
  </verify>
  <done>
Invoice PDF shows order number and date directly under FACTURE title. Client information displays as a single compact line. Totals section has a light grey (#f9fafb) background with a 1px #e5e7eb border, and the total row uses bold text with a top border instead of a dark background.
  </done>
</task>

</tasks>

<verification>
- TypeScript compilation passes with no errors in trotinette-frontend
- DynamicPage renders HTML content (not markdown) for all visitors
- Admin users see edit FAB on static pages, non-admins do not
- Quill editor loads correctly in both DynamicPage (inline) and AdminPagesPage (dialog)
- Invoice template reflects all three layout changes
</verification>

<success_criteria>
- react-quill-new installed and working
- Inline WYSIWYG editing functional on DynamicPage for admin/global_admin users
- AdminPagesPage edit dialog uses Quill instead of plain textarea
- Content stored and rendered as HTML (not markdown)
- PageSeeder updated with HTML content
- Invoice PDF layout improved with all 3 requested changes
</success_criteria>

<output>
After completion, create `.planning/quick/11-inline-page-editing-with-wysiwyg-on-stat/11-SUMMARY.md`
</output>
