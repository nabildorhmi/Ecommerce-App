---
phase: quick-20
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx
autonomous: true
must_haves:
  truths:
    - "Admin sees four navigable tabs: Contact, Social, Shipping, Short Links"
    - "Only one section is visible at a time (tab panel pattern)"
    - "Each tab has a descriptive icon matching its section purpose"
    - "Save button is always accessible regardless of active tab"
    - "URL hash (#contact, #social, #shipping, #short-links) syncs with active tab"
    - "All existing form fields and functionality are preserved"
  artifacts:
    - path: "trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx"
      provides: "Tab-based settings UI replacing Accordion layout"
      contains: "Tabs"
  key_links:
    - from: "AdminSiteSettingsPage.tsx"
      to: "useLocation().hash"
      via: "sectionFromHash maps hash to tab index"
      pattern: "sectionFromHash"
---

<objective>
Restructure the admin site settings page from an Accordion-based layout to a Tab-based layout with section icons, improved visual hierarchy, and a sticky save button.

Purpose: Reduce cognitive load by showing one settings section at a time instead of all four simultaneously, matching the modern tab pattern already used in AdminProductEditPage.
Output: Refactored AdminSiteSettingsPage.tsx with MUI Tabs, section icons, and improved UX.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx
@trotinette-frontend/src/features/admin/pages/AdminProductEditPage.tsx (Tab pattern reference)
@trotinette-frontend/src/shared/types/siteSettings.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace Accordions with Tabs and add section icons</name>
  <files>trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx</files>
  <action>
Refactor the SiteSettingsForm component in AdminSiteSettingsPage.tsx:

**1. Replace imports:**
- Remove: Accordion, AccordionSummary, AccordionDetails, ExpandMoreIcon
- Add: Tabs, Tab from '@mui/material'
- Add icons: ContactMailIcon from '@mui/icons-material/ContactMail', ShareIcon from '@mui/icons-material/Share', LocalShippingIcon from '@mui/icons-material/LocalShipping', LinkIcon from '@mui/icons-material/Link'

**2. Convert sectionFromHash to return a numeric tab index (0-3) instead of string ID:**
- 'contact' -> 0, 'social' -> 1, 'shipping' -> 2, 'short-links' -> 3
- Keep supporting hash-based navigation so sidebar links still work

**3. Replace the Accordion-based layout with MUI Tabs:**
- Use the EXACT same Tab styling pattern from AdminProductEditPage.tsx (glassmorphism theme):
  ```
  borderBottom: '1px solid rgba(0,194,255,0.1)'
  indicator: linear-gradient(90deg,#00C2FF,#0099CC), height 3, borderRadius top
  tab root: color var(--mirai-gray), fontWeight 600, fontSize 0.85rem, textTransform none, gap 0.75
  selected: color var(--mirai-white)
  ```
- Four tabs with iconPosition="start":
  - Tab 0: ContactMailIcon + "Contact"
  - Tab 1: ShareIcon + "Reseaux sociaux"
  - Tab 2: LocalShippingIcon + "Livraison"
  - Tab 3: LinkIcon + "Short links"

**4. Tab change handler:**
- On tab change, update local state AND update the URL hash (window.location.hash = sectionId) so bookmarkable links work
- Map tab index back to hash: 0->'#contact', 1->'#social', 2->'#shipping', 3->'#short-links'

**5. Render tab panels conditionally:**
- Only render the content for the active tab (same pattern as AdminProductEditPage: `{activeTab === N && (<Box>...</Box>)}`)
- Move each Accordion's inner content (AccordionDetails children) into its corresponding tab panel
- Keep the existing grid layouts, field bindings, and handlers exactly as they are

**6. Improve each tab panel with section header and description:**
- Each tab panel wrapped in a glass card Box with the glassSx styling from AdminProductEditPage:
  ```
  background: 'rgba(12, 12, 20, 0.7)', backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)', borderRadius: '18px', p: { xs: 2, md: 3 }
  ```
- Each panel starts with a Typography subtitle (the existing AccordionSummary title) and a caption description (the existing AccordionDetails caption), then the form fields

**7. Save button placement:**
- Remove the save button from the top header area
- Add a sticky save bar at the bottom of the Card component using:
  ```
  position: 'sticky', bottom: 0, zIndex: 10,
  background: 'rgba(12, 12, 20, 0.95)', backdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(0,194,255,0.12)',
  py: 1.5, px: 2, display: 'flex', justifyContent: 'flex-end'
  ```
- The save button saves ALL settings (not just the active tab), same as current behavior

**8. Page header simplification:**
- Keep the outer page title "Parametres du site" and description
- Remove the old Card wrapper that contained everything - let the tabs + glass panels be the main visual structure
- Keep the outer Container maxWidth="xl" and py: 3

**Important:** Do NOT change any business logic, state handlers, helper functions (slugifyLabel, extractDynamicSlug, buildUniqueShortLinkUrl, centimesToMad, madToCentimes), or the API integration. Only change the layout/presentation layer.
  </action>
  <verify>
Run `cd C:\Users\User\Desktop\TrotinetteApp\trotinette-frontend && npx tsc --noEmit` to verify no TypeScript errors.
Run `cd C:\Users\User\Desktop\TrotinetteApp\trotinette-frontend && npx vite build` to verify the build succeeds.
Visually confirm: the page shows 4 tabs with icons, only one section visible at a time, sticky save bar at bottom.
  </verify>
  <done>
AdminSiteSettingsPage renders a tabbed interface with 4 icon tabs (Contact, Reseaux sociaux, Livraison, Short links). Only the active tab's form fields are shown. Save button is sticky at the bottom. URL hash syncs with active tab. All existing form fields and validation preserved. TypeScript compiles without errors.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- `npx vite build` completes successfully
- Navigate to /admin/settings - see 4 tabs with icons
- Click each tab - only that section's fields appear
- Navigate to /admin/settings#shipping - Livraison tab is active on load
- Edit fields in multiple tabs, click Save - all changes persist
- Page is responsive on mobile (tabs should scroll horizontally if needed)
</verification>

<success_criteria>
- Accordion components fully replaced with MUI Tabs
- Each tab has a descriptive MUI icon
- Tab styling matches AdminProductEditPage glassmorphism pattern
- Only one section visible at a time
- Sticky save button always accessible
- URL hash navigation preserved (#contact, #social, #shipping, #short-links)
- All form fields and business logic unchanged
- TypeScript compiles, Vite builds successfully
</success_criteria>

<output>
After completion, create `.planning/quick/20-restructure-admin-settings-page-with-tab/20-SUMMARY.md`
</output>
