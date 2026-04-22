---
phase: quick-19
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-api/app/Http/Resources/HeroBannerResource.php
  - trotinette-api/app/Http/Controllers/Admin/HeroBannerController.php
  - trotinette-api/app/Models/HeroBanner.php
  - trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx
  - trotinette-frontend/src/features/home/components/HeroCarousel.tsx
  - trotinette-frontend/src/features/home/components/HeroSection.tsx
autonomous: true

must_haves:
  truths:
    - "Desktop-only banner shows ONLY on desktop viewports, mobile field is null in API"
    - "Mobile-only banner shows ONLY on mobile viewports, desktop field is null in API"
    - "Both-uploaded banner shows respective image per device"
    - "No automatic fallback between desktop and mobile images"
    - "Admin sees separate labeled previews with recommended size hints"
    - "Mobile banner displays without aggressive cropping/zoom"
    - "Only the relevant device image is loaded on the frontend (no unnecessary loading of both)"
  artifacts:
    - path: "trotinette-api/app/Http/Resources/HeroBannerResource.php"
      provides: "Device-specific image fields without fallback"
      contains: "getFirstMedia"
    - path: "trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx"
      provides: "Separate desktop/mobile previews with size labels and device badges on cards"
    - path: "trotinette-frontend/src/features/home/components/HeroCarousel.tsx"
      provides: "Device-aware rendering with proper mobile object-fit"
  key_links:
    - from: "trotinette-api/app/Http/Resources/HeroBannerResource.php"
      to: "trotinette-frontend/src/features/home/components/HeroCarousel.tsx"
      via: "API response image.desktop / image.mobile fields"
      pattern: "image\\.desktop|image\\.mobile"
    - from: "trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx"
      to: "trotinette-api/app/Http/Controllers/Admin/HeroBannerController.php"
      via: "FormData with image_desktop / image_mobile fields"
      pattern: "image_desktop|image_mobile"
---

<objective>
Fix hero banner management to properly support device-specific banners (desktop vs mobile) with no automatic fallback, separate admin previews, and correct mobile rendering without zoom/crop issues.

Purpose: Admin must have predictable control over which devices see which banners, and mobile users must see banners exactly as previewed in admin.
Output: Updated API resource, admin panel improvements, fixed frontend carousel rendering.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-api/app/Http/Resources/HeroBannerResource.php
@trotinette-api/app/Http/Controllers/Admin/HeroBannerController.php
@trotinette-api/app/Models/HeroBanner.php
@trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx
@trotinette-frontend/src/features/admin/api/heroBanners.ts
@trotinette-frontend/src/features/home/components/HeroCarousel.tsx
@trotinette-frontend/src/features/home/components/HeroSection.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove API fallback and add admin delete-image + device badge support</name>
  <files>
    trotinette-api/app/Http/Resources/HeroBannerResource.php
    trotinette-api/app/Http/Controllers/Admin/HeroBannerController.php
    trotinette-frontend/src/features/admin/api/heroBanners.ts
  </files>
  <action>
**HeroBannerResource.php** -- Remove the fallback behavior. Currently lines 28-29 do:
```php
$desktopMedia = $this->getFirstMedia('banner_desktop') ?? $legacyMedia;
$mobileMedia = $this->getFirstMedia('banner_mobile') ?? $legacyMedia;
```
Change to: each field is its OWN media or null. Legacy `banner` collection should ONLY be used as a last-resort for old records that have neither desktop nor mobile -- map it to `desktop` for backwards compatibility but do NOT copy it to mobile:
```php
$legacyMedia = $this->getFirstMedia('banner');
$desktopMedia = $this->getFirstMedia('banner_desktop') ?? $legacyMedia;
$mobileMedia = $this->getFirstMedia('banner_mobile');
```
This way: old banners (legacy only) still show on desktop. New banners respect explicit upload per device. Mobile is NEVER auto-populated from desktop.

Also add a `has_desktop` and `has_mobile` boolean to the resource output so the admin panel can show device badges:
```php
'has_desktop' => $desktopMedia !== null,
'has_mobile'  => $mobileMedia !== null,
```

**HeroBannerController.php (update method)** -- Add support for removing a specific device image. Accept `remove_desktop` and `remove_mobile` boolean fields in the update validation. When `remove_desktop` is truthy, call `$heroBanner->clearMediaCollection('banner_desktop')`. Same for mobile. This allows admin to remove one device image without replacing it. Add these validation rules:
```php
'remove_desktop' => ['nullable', 'boolean'],
'remove_mobile'  => ['nullable', 'boolean'],
```
Process removals BEFORE adding new uploads in the update method. Also clear the legacy `banner` collection when a new desktop image is uploaded (to migrate old records).

**heroBanners.ts (frontend types)** -- Add `has_desktop: boolean` and `has_mobile: boolean` to the `HeroBanner` interface.
  </action>
  <verify>
Manually test with API: create a banner with only desktop image -- verify API returns `image.mobile: null`. Create with only mobile -- verify `image.desktop: null` (unless legacy exists). TypeScript compiles without errors: `cd trotinette-frontend && npx tsc --noEmit`.
  </verify>
  <done>
API returns null (not fallback) for device images that were not explicitly uploaded. Admin can remove a specific device image. Frontend types include has_desktop/has_mobile.
  </done>
</task>

<task type="auto">
  <name>Task 2: Improve admin panel with device labels, badges, independent previews, and remove buttons</name>
  <files>
    trotinette-frontend/src/features/admin/pages/AdminHeroBannersPage.tsx
  </files>
  <action>
**BannerCard component** -- Add device availability badges below the image. Show chip/badge indicators:
- If `banner.has_desktop && banner.has_mobile`: show both "Desktop" (cyan chip) + "Mobile" (pink chip)
- If only `banner.has_desktop`: show "Desktop uniquement" chip
- If only `banner.has_mobile`: show "Mobile uniquement" chip
Use MUI `Chip` component with size="small". This gives admin instant visibility of which devices each banner targets.

**BannerDialog component** -- Make the following improvements:

1. **Separate previews with clear labels and recommended sizes:**
   - Desktop preview label: "Desktop Banner (Recommande: 1920x600, format paysage)"
   - Mobile preview label: "Mobile Banner (Recommande: 375x600, format portrait)"
   - Each label should be a `Typography variant="subtitle2"` with the size hint as `variant="caption" color="text.secondary"` below it.

2. **Independent object_position per device:**
   Currently there is ONE shared `objectPosition` state and ONE drag handler. Split into:
   - `desktopObjectPosition` state (default '50% 50%')
   - `mobileObjectPosition` state (default '50% 50%')
   - Pass the correct position to each preview frame's drag handlers
   - Each preview frame should have its own drag-to-pan that only affects its own position
   - The `renderPreviewFrame` function needs a `position` and `onPositionChange` callback parameter instead of using the shared state
   - When editing, load `banner.object_position` as desktop position (keep existing behavior) and add a separate `mobile_object_position` if needed -- for now, default mobile to '50% 50%' since mobile images are typically centered.
   - Submit both positions: `fd.append('object_position', desktopObjectPosition)` (keep existing field for desktop). Mobile position can use CSS default 'center' since mobile banners should be uploaded at correct dimensions.

3. **Remove image buttons:**
   When editing (banner !== null) and a preview exists, show a small "X" remove button (IconButton with CloseIcon or DeleteIcon) in the top-right corner of each preview frame. Clicking it:
   - Clears the local preview (`setDesktopPreview(null)` / `setMobilePreview(null)`)
   - Clears the local file (`setDesktopFile(null)` / `setMobileFile(null)`)
   - Sets a state flag (`removeDesktop` / `removeMobile`) to true
   - On submit, if removeDesktop is true and no new desktopFile, append `fd.append('remove_desktop', '1')` to FormData

4. **Aspect ratio warnings:**
   After file selection in `handleFileChange`, use the `loadImageElement` function (already exists) to check dimensions of the selected file:
   - Desktop: if height > width, show a warning `Alert severity="warning"` below the preview: "L'image selectionnee est en format portrait. Le format paysage (ex: 1920x600) est recommande pour desktop."
   - Mobile: if width > height, show warning: "L'image selectionnee est en format paysage. Le format portrait (ex: 375x600) est recommande pour mobile."
   Store warning state: `desktopWarning: string | null`, `mobileWarning: string | null`. Clear warning when file changes or is removed.

5. **handleEnter improvements:**
   When populating from existing banner for editing:
   - `setDesktopPreview(banner.image?.desktop?.hero ?? null)` -- do NOT fallback to mobile
   - `setMobilePreview(banner.image?.mobile?.hero ?? null)` -- do NOT fallback to desktop
   - Reset `removeDesktop` and `removeMobile` to false
  </action>
  <verify>
Run `cd trotinette-frontend && npx tsc --noEmit` -- no type errors. Visually verify: open admin hero banners page, cards show device badges. Open dialog -- two clearly labeled preview frames with independent drag-to-pan. Upload portrait image for desktop shows warning. Remove buttons appear on existing images.
  </verify>
  <done>
Admin panel clearly labels desktop/mobile sections with recommended sizes, shows device badges on cards, previews are independent (no shared drag state), aspect ratio warnings display for wrong orientation uploads, and remove buttons allow clearing a single device image.
  </done>
</task>

<task type="auto">
  <name>Task 3: Fix mobile carousel rendering and optimize image loading</name>
  <files>
    trotinette-frontend/src/features/home/components/HeroCarousel.tsx
    trotinette-frontend/src/features/home/components/HeroSection.tsx
  </files>
  <action>
**HeroCarousel.tsx** -- Fix mobile display and optimize loading:

1. **Fix mobile aspect ratio / cropping:**
   The `SlideImage` component currently uses `objectFit: 'cover'` unconditionally, which crops mobile images aggressively. Change the `SlideImage` component to accept an `objectFit` prop. In the main render:
   - Desktop: keep `objectFit: 'cover'` (landscape images in landscape container = minimal crop)
   - Mobile: use `objectFit: 'contain'` with `bgcolor: '#0c0c14'` on the container so letterboxing blends with the dark background

   Alternatively (better approach): change the mobile aspect ratio to be more flexible. Currently `HERO_BANNER_ASPECT.mobile = '9/16'` which forces a tall narrow container. If the uploaded mobile image is 375x600, that's a ~5:8 ratio, not 9:16. The container forces 9:16 and `cover` crops the image.

   **Best fix:** For mobile, use `objectFit: 'contain'` in the SlideImage AND set the HeroSection mobile container height to `auto` with a `max-height: 100vh` instead of forcing an exact aspect ratio. This lets the image dictate its own proportions.

   In `SlideImage`, add an `isMobile` prop:
   ```tsx
   function SlideImage({ src, alt, duration, objectPosition, isMobile }: {
     src: string; alt: string; duration: number; objectPosition?: string; isMobile?: boolean;
   }) {
   ```
   Use `objectFit: isMobile ? 'contain' : 'cover'` on the img.

   Pass `isMobile={isMobileViewport}` from the parent.

2. **Prevent loading unused images:**
   The carousel already filters banners by device (lines 99-104), so banners without the relevant device image are excluded. This is correct. But the `<img>` tag still references the URL which gets fetched. Add `loading="lazy"` to non-active slides if multiple banners exist. For the current active slide, keep eager loading. Since AnimatePresence only renders the active slide, this is already handled -- no change needed here.

3. **No-banner-for-device handling:**
   The filtering on lines 99-104 already handles this correctly -- if a banner only has desktop and user is on mobile, it's filtered out. No change needed.

**HeroSection.tsx** -- Fix mobile container sizing:

Currently the section height on mobile is:
```
height: { xs: 'calc(100vw * (16 / 9))', md: 'min(100vh, calc(100vw * (9 / 16)))' }
```
This creates a very tall container on mobile (16:9 of viewport width for a portrait format). For a 375px wide screen, that's 667px tall, which is fine for 9:16 images. But the `cover` in the carousel was the actual problem.

However, if the admin uploads a mobile banner that's not exactly 9:16, the `contain` approach will letterbox. To make this seamless:
- Keep the mobile container height as-is (it provides a good full-screen-ish experience)
- The `contain` + dark bgcolor will blend letterboxing invisibly
- Ensure the HeroCarousel's wrapper Box on mobile also has `bgcolor: '#0c0c14'` so any letterbox area matches the section background

In HeroCarousel, update the empty-state and main wrapper to ensure consistent dark background on mobile:
```tsx
bgcolor: '#0c0c14',
```
This is already present in the empty state. Ensure the main carousel wrapper (the outer Box with position relative) also has `bgcolor: '#0c0c14'`.
  </action>
  <verify>
Run `cd trotinette-frontend && npx tsc --noEmit` -- no type errors. Run `cd trotinette-frontend && npm run build` -- builds without errors. Test visually:
1. View homepage on desktop viewport -- banners display as before with object-fit cover
2. Resize to mobile viewport -- mobile banners display without aggressive cropping, proper aspect ratio preserved
3. If a banner only has desktop image, it should NOT appear on mobile viewport
4. If a banner only has mobile image, it should NOT appear on desktop viewport
  </verify>
  <done>
Mobile banners render with object-fit contain (no aggressive cropping), letterbox area blends with dark background, desktop banners unchanged, device-specific filtering prevents showing wrong image on wrong device.
  </done>
</task>

</tasks>

<verification>
1. API contract check: `GET /api/hero-banners` returns banners where `image.desktop` is null when no desktop image uploaded (no fallback from mobile), and vice versa
2. Admin panel: cards show device badges, dialog has separate labeled previews with size hints, independent drag-to-pan, remove buttons, aspect ratio warnings
3. Frontend: mobile viewport shows mobile images with contain (no crop), desktop viewport shows desktop images with cover, banners missing the relevant device image are filtered out
4. TypeScript: `npx tsc --noEmit` passes in frontend
5. Build: `npm run build` succeeds in frontend
</verification>

<success_criteria>
- Desktop-only banners appear only on desktop, mobile field is null
- Mobile-only banners appear only on mobile, desktop field is null (except legacy migration)
- No automatic fallback between device images
- Admin sees clear device labels with recommended sizes
- Admin can remove a single device image without affecting the other
- Aspect ratio warnings appear for wrong-orientation uploads
- Mobile carousel renders without aggressive zoom/crop
- Preview in admin matches actual frontend rendering behavior
</success_criteria>

<output>
After completion, create `.planning/quick/19-hero-banner-management-improvements-admi/19-SUMMARY.md`
</output>
