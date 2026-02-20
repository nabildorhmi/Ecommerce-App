---
phase: quick-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  # Task 1 — Remove delivery zones, city text input
  - trotinette-api/app/Http/Requests/StoreOrderRequest.php
  - trotinette-api/app/Services/OrderService.php
  - trotinette-api/app/Http/Resources/OrderResource.php
  - trotinette-api/app/Models/Order.php
  - trotinette-api/database/migrations/2026_02_20_000001_make_delivery_zone_optional_add_city.php
  - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
  - trotinette-frontend/src/features/checkout/types.ts
  - trotinette-frontend/src/features/checkout/api/orders.ts
  - trotinette-frontend/src/features/checkout/api/deliveryZones.ts
  - trotinette-frontend/src/features/orders/pages/AdminOrdersPage.tsx
  - trotinette-frontend/src/features/orders/pages/AdminOrderDetailPage.tsx
  - trotinette-frontend/src/features/orders/pages/MyOrdersPage.tsx
  - trotinette-frontend/src/locales/fr/translation.json
  - trotinette-frontend/src/locales/en/translation.json
  # Task 2 — Inline registration at checkout, product card bg, admin badge, light mode
  - trotinette-frontend/src/features/catalog/components/ProductCard.tsx
  - trotinette-frontend/src/features/home/pages/HomePage.tsx
  - trotinette-frontend/src/shared/components/Navbar.tsx
  - trotinette-frontend/src/app/theme.ts
  - trotinette-frontend/src/app/router.tsx
  - trotinette-frontend/src/shared/components/ProtectedRoute.tsx
  - trotinette-frontend/src/features/orders/api/orders.ts
autonomous: true
must_haves:
  truths:
    - "Checkout accepts a free-text city string instead of selecting from delivery zones"
    - "Orders are created and stored with a city string and zero delivery fee"
    - "Unauthenticated users see inline registration form on checkout page and can register+order in one flow"
    - "Product card images render as CSS background-image with cover sizing"
    - "Admin nav shows a red badge with pending order count"
    - "Light mode has no hardcoded dark colors — text, backgrounds, borders all readable"
  artifacts:
    - path: "trotinette-api/database/migrations/2026_02_20_000001_make_delivery_zone_optional_add_city.php"
      provides: "Adds city column to orders, makes delivery_zone_id nullable"
    - path: "trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx"
      provides: "City text field + inline registration for guests"
    - path: "trotinette-frontend/src/features/catalog/components/ProductCard.tsx"
      provides: "Background-image product card"
  key_links:
    - from: "CheckoutPage.tsx"
      to: "POST /orders"
      via: "usePlaceOrder mutation"
      pattern: "city.*string"
    - from: "Navbar.tsx"
      to: "GET /admin/orders"
      via: "useQuery for pending count"
      pattern: "pending.*count|badge"
---

<objective>
Implement 5 quick improvements: (1) replace delivery zone dropdown with city text input, (2) inline registration at checkout for guests, (3) product card image as CSS background, (4) admin pending orders badge, (5) light mode UI fixes.

Purpose: Better UX flow (no zone lookup, inline auth), visual polish (card images, light mode, admin badge).
Output: Updated checkout flow, product cards, navbar, and theme — all functional.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@trotinette-api/app/Services/OrderService.php
@trotinette-api/app/Http/Requests/StoreOrderRequest.php
@trotinette-api/app/Http/Resources/OrderResource.php
@trotinette-api/app/Models/Order.php
@trotinette-api/database/migrations/2026_02_18_000001_create_orders_table.php
@trotinette-api/routes/api.php
@trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
@trotinette-frontend/src/features/checkout/types.ts
@trotinette-frontend/src/features/checkout/api/orders.ts
@trotinette-frontend/src/features/checkout/api/deliveryZones.ts
@trotinette-frontend/src/features/catalog/components/ProductCard.tsx
@trotinette-frontend/src/features/home/pages/HomePage.tsx
@trotinette-frontend/src/shared/components/Navbar.tsx
@trotinette-frontend/src/shared/components/ProtectedRoute.tsx
@trotinette-frontend/src/features/auth/components/RegisterForm.tsx
@trotinette-frontend/src/features/auth/api/auth.ts
@trotinette-frontend/src/features/auth/store.ts
@trotinette-frontend/src/app/theme.ts
@trotinette-frontend/src/app/router.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace delivery zones with city text input (backend + frontend checkout)</name>
  <files>
    trotinette-api/database/migrations/2026_02_20_000001_make_delivery_zone_optional_add_city.php
    trotinette-api/app/Http/Requests/StoreOrderRequest.php
    trotinette-api/app/Services/OrderService.php
    trotinette-api/app/Http/Resources/OrderResource.php
    trotinette-api/app/Models/Order.php
    trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    trotinette-frontend/src/features/checkout/types.ts
    trotinette-frontend/src/features/checkout/api/orders.ts
    trotinette-frontend/src/features/orders/pages/AdminOrdersPage.tsx
    trotinette-frontend/src/features/orders/pages/AdminOrderDetailPage.tsx
    trotinette-frontend/src/features/orders/pages/MyOrdersPage.tsx
    trotinette-frontend/src/locales/fr/translation.json
    trotinette-frontend/src/locales/en/translation.json
  </files>
  <action>
    **Backend changes:**

    1. **New migration** `2026_02_20_000001_make_delivery_zone_optional_add_city.php`:
       - Add `$table->string('city', 100)->nullable()->after('phone');`
       - Make `delivery_zone_id` nullable: `$table->foreignId('delivery_zone_id')->nullable()->change();`
       - Set delivery_fee default 0 for new orders without zone
       - In `down()`: reverse both changes

    2. **StoreOrderRequest.php**: Replace `'delivery_zone_id' => ['required', 'integer', 'exists:delivery_zones,id']` with `'city' => ['required', 'string', 'max:100']`. Remove delivery_zone_id rule entirely.

    3. **OrderService.php createOrder()**: Remove the DeliveryZone lookup block (lines ~22-24). Instead:
       - Set `$city = $data['city'];`
       - Set `delivery_fee = 0` (no zone-based fee anymore)
       - In Order::create: set `'city' => $city`, `'delivery_zone_id' => null`, `'delivery_fee' => 0`, `'total' => $subtotal`
       - Remove `->load(['deliveryZone'])` from the return — replace with just `->load(['items.product', 'statusLogs'])`

    4. **Order.php**: Add `'city'` to `$fillable`. Keep the `deliveryZone()` relation for backward compat with old orders, but it will be null for new ones.

    5. **OrderResource.php**: Add `'city' => $this->city` to the array. Change delivery_zone to be conditional: `'delivery_zone' => $this->whenLoaded('deliveryZone', fn () => $this->deliveryZone ? new DeliveryZoneResource($this->deliveryZone) : null)`. This handles old orders (have zone) and new orders (have city string).

    6. Run `php artisan migrate` to apply the new migration.

    **Frontend changes:**

    7. **types.ts**: In `PlaceOrderInput`, replace `delivery_zone_id: number` with `city: string`. In `OrderConfirmation`, replace `delivery_zone` object with `city: string | null` and keep `delivery_zone?: { ... } | null` for backward compat.

    8. **CheckoutPage.tsx** — major rewrite:
       - Remove `useDeliveryZones` import and hook call
       - Remove the `Controller` + `Autocomplete` for delivery_zone_id
       - Replace with a simple `<TextField label={t('checkout.deliveryCity')} {...register('city')} />` — free text, required
       - Update zod schema: replace `delivery_zone_id` with `city: z.string().min(1, { error: 'City required' }).max(100)`
       - Remove `selectedZoneId`, `selectedZone`, `deliveryFeeCentimes` logic
       - Set `totalCentimes = subtotalCentimes` (no delivery fee)
       - In pricing summary: remove the delivery fee row entirely, or show "Free delivery"
       - In `onSubmit`: send `city: data.city` instead of `delivery_zone_id`
       - Keep the phone field, note field, order summary, place order button as-is
       - **IMPORTANT**: Do NOT remove the auth guard yet — Task 2 handles inline registration

    9. **orders.ts (checkout api)**: The `usePlaceOrder` mutationFn already sends `PlaceOrderInput` — the type change handles this. No code changes needed beyond what types.ts provides.

    10. **AdminOrdersPage.tsx**: The delivery zone filter (`filter[delivery_zone_id]`) no longer makes sense. Replace it with a city text filter:
        - Remove `useDeliveryZones` import and call
        - Replace the delivery zone `<Select>` with a `<TextField size="small" label={t('orders.city')} value={city} onChange={(e) => setParam('city', e.target.value)} />`
        - In the table, change the City column to display `order.city ?? order.delivery_zone?.city ?? '—'` (handles both old and new orders)
        - Update filters to use `filter[city]` instead of `filter[delivery_zone_id]`
        - NOTE: The backend admin order controller may need a `city` filter — check if it already supports generic filters. If not, this filter will be a frontend-only text field for now (no backend filtering by city). Just show the city column from order data.

    11. **AdminOrderDetailPage.tsx**: Find where `delivery_zone.city` is displayed and replace with `order.city ?? order.delivery_zone?.city ?? '—'`. Update the delivery fee display to show the value from the order (will be 0 for new orders).

    12. **MyOrdersPage.tsx**: Same pattern — display `order.city ?? order.delivery_zone?.city` wherever the delivery zone city was shown.

    13. **Translation files** (both FR and EN): Add keys for `checkout.freeDelivery` ("Livraison gratuite" / "Free delivery"). Ensure `checkout.deliveryCity` exists.

    Do NOT delete the DeliveryZone model, migration, or controllers — old orders still reference them. Do NOT delete the `deliveryZones.ts` API file yet (AdminDeliveryZonesPage still uses it). The admin delivery zones page can remain as-is for managing legacy data.
  </action>
  <verify>
    - `cd trotinette-api && php artisan migrate --force` succeeds
    - `php artisan tinker --execute="echo App\Models\Order::first()->city;"` runs without error
    - Frontend builds: `cd trotinette-frontend && npm run build` with no TypeScript errors
    - Manually verify: CheckoutPage shows a city text input, not a dropdown
  </verify>
  <done>
    Orders table has city column. StoreOrderRequest validates city string. OrderService creates orders with city + zero delivery fee. Frontend checkout shows text input for city. Admin/customer order pages display city correctly for both old (zone-based) and new (city string) orders.
  </done>
</task>

<task type="auto">
  <name>Task 2: Inline checkout registration, product card bg-image, admin badge, light mode fixes</name>
  <files>
    trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    trotinette-frontend/src/app/router.tsx
    trotinette-frontend/src/shared/components/ProtectedRoute.tsx
    trotinette-frontend/src/features/catalog/components/ProductCard.tsx
    trotinette-frontend/src/features/home/pages/HomePage.tsx
    trotinette-frontend/src/shared/components/Navbar.tsx
    trotinette-frontend/src/features/orders/api/orders.ts
    trotinette-frontend/src/app/theme.ts
    trotinette-frontend/src/locales/fr/translation.json
    trotinette-frontend/src/locales/en/translation.json
  </files>
  <action>
    **A. Inline registration at checkout:**

    1. **router.tsx**: Move `/checkout` OUT of the `ProtectedRoute` wrapper. Place it as a direct child of the RootLayout (alongside `/products`, `/login`). This allows unauthenticated users to reach CheckoutPage.

    2. **CheckoutPage.tsx** — add inline registration:
       - Import `RegisterForm` from `../../auth/components/RegisterForm`
       - Import `registerApi` from `../../auth/api/auth`
       - Import `useMutation` from `@tanstack/react-query`
       - At the top of the component, check `const user = useAuthStore((s) => s.user);`
       - If `!user`, show a registration section ABOVE the checkout form:
         ```
         <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
           <Typography variant="h6" gutterBottom>{t('checkout.createAccount')}</Typography>
           <Typography variant="body2" color="text.secondary" mb={2}>
             {t('checkout.createAccountHint')}
           </Typography>
           <RegisterForm onSubmit={handleRegister} error={registerError} />
         </Paper>
         ```
       - The `handleRegister` function should call `registerApi`, then `useAuthStore.getState().setAuth(token, user)` on success. After registration, the checkout form appears (the component re-renders because user is now set).
       - When `!user`, disable/hide the "Place Order" button and show a message like "Please create an account above to continue"
       - When `user` is set, pre-fill the phone field from `user.phone` (already done via defaultValues, but since user might register mid-page, use a `useEffect` to `setValue('phone', user.phone)` when user changes from null to non-null)

    3. Add translation keys:
       - `checkout.createAccount`: "Creer un compte" / "Create an account"
       - `checkout.createAccountHint`: "Creez un compte pour passer votre commande" / "Create an account to place your order"
       - `checkout.loginOrRegister`: "Connectez-vous ou creez un compte" / "Log in or create an account"

    **B. Product card image as CSS background:**

    4. **ProductCard.tsx**: Replace the `<Box component="img" ...>` (lines ~94-106) with a `<Box>` that uses `backgroundImage`:
       ```tsx
       <Box
         className="card-img"
         sx={{
           width: '100%',
           height: '100%',
           backgroundImage: `url(${imageUrl})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
           transition: 'transform 0.3s ease',
         }}
       />
       ```
       Remove the `component="img"`, `src`, `alt`, `objectFit`, `p` props. The parent Box already has `height: 220, overflow: 'hidden'` which constrains the bg image nicely.

    5. **HomePage.tsx FeaturedSection**: Same pattern for the featured product cards — replace `<Box component="img" src={imageUrl} ...>` (line ~251) with a background-image Box:
       ```tsx
       <Box sx={{
         width: '100%', height: '100%',
         backgroundImage: `url(${imageUrl})`,
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         backgroundRepeat: 'no-repeat',
       }} />
       ```

    **C. Admin pending orders badge:**

    6. **Create a hook or inline query in Navbar.tsx** for pending order count:
       - Import `useQuery` from `@tanstack/react-query`
       - Import `apiClient` from shared
       - Import `Badge` from `@mui/material/Badge`
       - Add a query inside the Navbar component (only when `user?.role === 'admin'`):
         ```ts
         const { data: pendingData } = useQuery({
           queryKey: ['admin', 'orders', 'pending-count'],
           queryFn: async () => {
             const res = await apiClient.get('/admin/orders', { params: { 'filter[status]': 'pending', per_page: 1 } });
             return res.data.meta?.total ?? 0;
           },
           enabled: user?.role === 'admin',
           refetchInterval: 30_000, // poll every 30s
           staleTime: 15_000,
         });
         const pendingCount = pendingData ?? 0;
         ```
       - In the admin menu items array, wrap the Orders icon with a Badge:
         For the orders menu item `{ to: '/admin/orders', ... }`, change the icon to:
         ```tsx
         icon: <Badge badgeContent={pendingCount} color="error" max={99}><ReceiptLongIcon fontSize="small" /></Badge>
         ```
       - This shows a red badge with count on the orders admin menu item. If count is 0, MUI Badge hides automatically.
       - Also add a red dot on the AdminPanelSettingsIcon button itself if pendingCount > 0:
         ```tsx
         <Badge variant="dot" color="error" invisible={pendingCount === 0}>
           <AdminPanelSettingsIcon sx={{ fontSize: '1.1rem' }} />
         </Badge>
         ```

    **D. Light mode UI fixes:**

    7. **Navbar.tsx** — hardcoded dark colors throughout:
       - Menu PaperProps `backgroundColor: '#111116'` and `border: '1px solid #1E1E28'` appear in 3 menus (categories, admin, user) and the mobile drawer. Replace with theme-aware values:
         - `backgroundColor: 'background.paper'`
         - `border: '1px solid'`, `borderColor: 'divider'`
       - MenuItem hover colors `backgroundColor: 'rgba(0,194,255,0.08)'` are fine for both modes.
       - MenuItem text colors `color: '#F5F7FA'` should be `color: 'text.primary'`
       - Desktop nav button colors `color: '#9CA3AF'` should be `color: 'text.secondary'` and hover `color: '#F5F7FA'` should be `color: 'text.primary'`
       - Mobile drawer Paper: `backgroundColor: '#111116'` -> `backgroundColor: 'background.paper'`, `borderLeft: '1px solid #1E1E28'` -> `borderLeft: '1px solid'`, `borderColor: 'divider'`
       - Mobile drawer "MENU" text `color: '#00C2FF'` is fine (brand color).
       - Mobile drawer items `color: '#F5F7FA'` -> `color: 'text.primary'`, `color: '#9CA3AF'` -> `color: 'text.secondary'`
       - Divider `borderColor: '#1E1E28'` -> `borderColor: 'divider'` (3 occurrences in drawer)
       - Right-side icon buttons: `color: '#9CA3AF'` -> `color: 'text.secondary'` and hover `color: '#F5F7FA'` -> `color: 'text.primary'`
       - The `isActive` nav color `'#00C2FF'` for active link is fine (brand accent in both modes).

    8. **HomePage.tsx** — HeroBanner and PromoBanners have hardcoded dark gradients and colors:
       - HeroBanner: The hero has `background: 'linear-gradient(135deg, #0B0B0E ...)'` and hardcoded `color: '#F5F7FA'`, `color: '#9CA3AF'`. This hero section is intentionally dark/dramatic and should STAY dark in both modes (like the AppBar is always dark). Leave it as-is.
       - PromoBanners: Same — these are intentionally branded dark banners. Leave as-is.
       - CategoriesStrip: Already uses `bgcolor: 'background.paper'` and `color: 'text.secondary'` — already theme-aware. Good.
       - FeaturedSection: Uses `bgcolor: 'background.default'` and theme tokens. Good. But check the carousel cards — they use `bgcolor: 'background.paper'` and `borderColor: 'divider'` — already theme-aware. Good.

    9. **theme.ts** — MuiAlert override uses `rgba(0,194,255,0.08)` for info alerts which works in both modes, but check if text contrast is sufficient. The `standardInfo` variant isn't explicitly overridden for text color. Add text color overrides for light mode:
       ```ts
       standardInfo: {
         color: isDark ? '#00C2FF' : '#0077A8',
       },
       standardError: {
         backgroundColor: 'rgba(230,57,70,0.1)',
         border: '1px solid rgba(230,57,70,0.3)',
         color: isDark ? '#E63946' : '#C62828',
       },
       standardSuccess: {
         backgroundColor: 'rgba(0,230,118,0.08)',
         border: '1px solid rgba(0,230,118,0.2)',
         color: isDark ? '#00E676' : '#1B5E20',
       },
       ```

    10. **ProductCard.tsx light mode**: The card already uses `backgroundColor: 'background.paper'`, `borderColor: 'divider'`, `color: 'text.primary'` — these are theme-aware. The hover glow `boxShadow: '0 8px 32px rgba(0,194,255,0.18)'` is fine in light mode. The stock indicator colors (`#00C853`, `#E63946`) are high-contrast enough in both modes. No changes needed beyond the bg-image change from part B.
  </action>
  <verify>
    - `cd trotinette-frontend && npm run build` succeeds with no TypeScript errors
    - Verify CheckoutPage: when not logged in, registration form appears above checkout fields
    - Verify ProductCard: image rendered as background-image (inspect element, no `<img>` tag in card image area)
    - Verify Navbar: toggle to light mode — no white-on-white text, menus readable, borders visible
    - Verify admin nav: orders menu item shows red badge when pending orders exist
  </verify>
  <done>
    - Unauthenticated users see registration form inline on checkout page; after registering they can immediately place order
    - Product cards use CSS background-image with cover sizing
    - Admin nav orders item shows red badge with pending order count (polls every 30s)
    - Light mode: Navbar menus, drawer, and text use theme tokens; no hardcoded dark colors leak through in light mode. Alert text colors have sufficient contrast.
  </done>
</task>

</tasks>

<verification>
1. Full build passes: `cd trotinette-frontend && npm run build` — zero errors
2. Backend migration applied: `cd trotinette-api && php artisan migrate`
3. Toggle light/dark mode — Navbar menus, product cards, checkout page all look correct in both modes
4. Checkout flow works end-to-end: guest visits checkout -> registers inline -> places order with city text -> sees confirmation
5. Admin nav shows pending badge count; clicking navigates to admin orders
6. Product card images fill the card area as backgrounds (no contain/padding gaps)
</verification>

<success_criteria>
- Checkout accepts city text, not delivery zone selection
- Guest users can register inline at checkout without page redirect
- Product card images render via background-image CSS with cover
- Admin nav shows red pending orders badge
- Light mode has no broken/invisible UI elements
</success_criteria>

<output>
After completion, create `.planning/quick/1-remove-delivery-zones-table-city-text-in/1-SUMMARY.md`
</output>
