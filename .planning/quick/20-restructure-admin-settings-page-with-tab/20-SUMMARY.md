---
phase: quick-20
plan: 01
subsystem: admin-ui
tags: [refactoring, ux-improvement, tabs, glassmorphism]
dependencies:
  requires: []
  provides:
    - Tab-based settings UI pattern for admin
  affects:
    - AdminSiteSettingsPage.tsx
tech_stack:
  added: []
  patterns:
    - MUI Tabs with glassmorphism styling
    - Hash-based tab navigation
    - Sticky save bar pattern
key_files:
  created:
    - trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx
  modified: []
decisions:
  - "Tabs pattern matches AdminProductEditPage glassmorphism styling for visual consistency"
  - "Hash-based navigation preserved (#contact, #social, #shipping, #short-links) for bookmarkable links"
  - "Sticky save bar always accessible regardless of scroll position or active tab"
  - "Save button applies to all settings (not just active tab) maintaining existing behavior"
  - "Only one section visible at a time reduces cognitive load compared to accordion view"
metrics:
  duration: 174s
  tasks_completed: 1
  files_modified: 1
  commits: 1
  completed_date: 2026-04-22
---

# Quick Task 20: Restructure Admin Site Settings Page with Tabs

Tab-based settings interface with glassmorphism styling, section icons, and sticky save bar replacing accordion layout.

## Execution Summary

**Completed:** 1/1 tasks
**Duration:** 2 minutes 54 seconds
**Result:** Admin site settings page restructured with modern tab-based navigation matching the glassmorphism pattern from AdminProductEditPage.

## What Changed

### Architecture

**Before:** Accordion-based layout showing all four sections simultaneously with expand/collapse controls.

**After:** Tab-based layout showing one section at a time with:
- 4 icon tabs (ContactMail, Share, LocalShipping, Link)
- Glass card panels with glassmorphism styling
- Sticky save bar always accessible at bottom
- Hash-based navigation for bookmarkable section links

### User Experience Improvements

1. **Reduced Cognitive Load:** Only one settings section visible at a time instead of four expandable accordions
2. **Better Visual Hierarchy:** Clear tab navigation with descriptive icons guides users to relevant sections
3. **Persistent Actions:** Sticky save bar always accessible regardless of scroll position
4. **Bookmarkable:** URL hash syncs with active tab (#contact, #social, #shipping, #short-links)
5. **Visual Consistency:** Glassmorphism styling matches AdminProductEditPage pattern

## Implementation Details

### Tab System

**Tabs Configuration:**
```typescript
- Tab 0: ContactMailIcon + "Contact" → #contact
- Tab 1: ShareIcon + "Reseaux sociaux" → #social
- Tab 2: LocalShippingIcon + "Livraison" → #shipping
- Tab 3: LinkIcon + "Short links" → #short-links
```

**Tab Styling:**
```typescript
borderBottom: '1px solid rgba(0,194,255,0.1)'
indicator: linear-gradient(90deg,#00C2FF,#0099CC), height 3, borderRadius top
tab root: color var(--mirai-gray), fontWeight 600, fontSize 0.85rem, textTransform none, gap 0.75
selected: color var(--mirai-white)
```

### Hash Navigation

**Hash Mapping:**
```typescript
function sectionFromHash(hash: string): number {
  // Maps #contact → 0, #social → 1, #shipping → 2, #short-links → 3
  // Default → 0 (contact)
}

function hashFromTabIndex(tabIndex: number): string {
  // Maps 0 → #contact, 1 → #social, 2 → #shipping, 3 → #short-links
}
```

**Tab Change Handler:**
```typescript
const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
  setActiveTab(newValue);
  window.location.hash = hashFromTabIndex(newValue);
};
```

### Glass Card Styling

Each tab panel wrapped in glassSx styling:
```typescript
const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};
```

### Sticky Save Bar

```typescript
<Box sx={{
  position: 'sticky',
  bottom: 0,
  zIndex: 10,
  background: 'rgba(12, 12, 20, 0.95)',
  backdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(0,194,255,0.12)',
  py: 1.5,
  px: 2,
  display: 'flex',
  justifyContent: 'flex-end',
}}>
  <Button variant="contained" onClick={saveSiteSettings}>
    Enregistrer
  </Button>
</Box>
```

## Preserved Functionality

**No Breaking Changes:**
- All form fields remain identical (Contact, Social, Shipping, Short Links)
- All state handlers unchanged (handleSiteSettingChange, handleShippingFieldChange, etc.)
- All helper functions preserved (slugifyLabel, extractDynamicSlug, buildUniqueShortLinkUrl, etc.)
- Save button saves ALL settings (not just active tab)
- API integration unchanged (useUpdateAdminSiteSettingsPage)

## Deviations from Plan

None - plan executed exactly as written.

## Task Breakdown

### Task 1: Replace Accordions with Tabs and add section icons
**Status:** Complete
**Commit:** b4ebb56
**Files Modified:**
- trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx

**Changes:**
1. Replaced imports: removed Accordion/AccordionSummary/AccordionDetails/ExpandMoreIcon
2. Added imports: Tabs, Tab, ContactMailIcon, ShareIcon, LocalShippingIcon, LinkIcon
3. Converted sectionFromHash to return numeric tab index (0-3)
4. Added hashFromTabIndex to map tab index back to hash
5. Replaced Accordion layout with MUI Tabs component
6. Added 4 tabs with icons matching AdminProductEditPage glassmorphism pattern
7. Implemented handleTabChange to sync activeTab state with URL hash
8. Rendered tab panels conditionally (only active tab visible)
9. Wrapped each tab panel content in glass card Box with glassSx styling
10. Added section headers and descriptions at top of each panel
11. Moved save button to sticky bottom bar
12. Simplified page header (removed old Card wrapper, kept outer title/description)

**Verification:**
- TypeScript compilation: PASSED (no errors)
- Vite build: PASSED (successful production build)
- Visual structure: 4 tabs with icons, one section visible at a time, sticky save bar

## Self-Check: PASSED

**Created Files:**
- FOUND: C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend/src/features/admin/pages/AdminSiteSettingsPage.tsx

**Commits:**
- FOUND: b4ebb56 (feat(quick-20): restructure admin site settings page with tab-based layout)

## Impact Assessment

**User Benefits:**
- Cleaner, less cluttered interface
- Faster navigation with tab shortcuts
- Persistent save button always accessible
- Bookmarkable section links for direct access
- Matches familiar pattern from product edit page

**Developer Benefits:**
- Consistent glassmorphism pattern across admin UI
- Tab pattern established for future settings pages
- No regression risk (all business logic preserved)
- TypeScript type-safe throughout

**Performance:**
- No impact (conditional rendering same as accordion expansion)
- Build size unchanged (MUI Tabs already in bundle)

## Next Steps

No follow-up required. Admin site settings page fully functional with improved UX.

**Potential Future Enhancements (out of scope):**
- Add keyboard shortcuts for tab navigation (Ctrl+1, Ctrl+2, etc.)
- Add "unsaved changes" warning if user navigates away
- Add success toast on save (currently uses Snackbar)
