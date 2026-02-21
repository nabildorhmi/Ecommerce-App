---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/shared/constants/moroccanCities.ts
  - trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
  - trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
  - trotinette-frontend/src/shared/components/Navbar.tsx
autonomous: true
must_haves:
  truths:
    - "City field in CheckoutPage is a searchable dropdown restricted to Moroccan cities"
    - "City field in ProfilePage is a searchable dropdown restricted to Moroccan cities"
    - "Country field shows 'Maroc' in CheckoutPage before city"
    - "Navbar search shows live product results as user types on desktop"
    - "Clicking a search result navigates to product detail page"
    - "Enter in search still navigates to catalog search page"
  artifacts:
    - path: "trotinette-frontend/src/shared/constants/moroccanCities.ts"
      provides: "Sorted array of 345 Moroccan city names"
    - path: "trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx"
      provides: "City Autocomplete + Country field"
    - path: "trotinette-frontend/src/features/auth/pages/ProfilePage.tsx"
      provides: "City Autocomplete"
    - path: "trotinette-frontend/src/shared/components/Navbar.tsx"
      provides: "Live search autocomplete dropdown"
  key_links:
    - from: "CheckoutPage.tsx"
      to: "moroccanCities.ts"
      via: "import MOROCCAN_CITIES"
    - from: "ProfilePage.tsx"
      to: "moroccanCities.ts"
      via: "import MOROCCAN_CITIES"
    - from: "Navbar.tsx"
      to: "/products API"
      via: "useQuery with debounced search"
---

<objective>
Replace plain text city inputs with MUI Autocomplete dropdowns using a predefined list of 345 Moroccan cities, add a "Pays" country field to checkout, and add live search autocomplete to the navbar.

Purpose: Improve UX by constraining city selection to valid Moroccan cities and enabling instant product search from the navbar.
Output: Updated CheckoutPage, ProfilePage, and Navbar with new interactive components.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
@trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
@trotinette-frontend/src/shared/components/Navbar.tsx
@trotinette-frontend/src/features/catalog/api/products.ts
@trotinette-frontend/src/features/catalog/types.ts
@trotinette-frontend/src/shared/api/client.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Moroccan cities constant and replace city inputs with Autocomplete</name>
  <files>
    trotinette-frontend/src/shared/constants/moroccanCities.ts
    trotinette-frontend/src/features/checkout/pages/CheckoutPage.tsx
    trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
  </files>
  <action>
1. Create `trotinette-frontend/src/shared/constants/moroccanCities.ts`:
   - Export a `MOROCCAN_CITIES` const array of all 345 Moroccan city names, alphabetically sorted.
   - Include all major cities: Agadir, Ain Harrouda, Ait Melloul, Al Hoceima, Azrou, Beni Mellal, Berkane, Berrechid, Bouskoura, Casablanca, Chefchaouen, Dakhla, El Jadida, Errachidia, Essaouira, Fes, Fquih Ben Salah, Guelmim, Guercif, Ifrane, Inezgane, Jerada, Kelaat Sraghna, Kenitra, Khemisset, Khenifra, Khouribga, Ksar El Kebir, Laayoune, Larache, Marrakesh, Martil, Meknes, Midelt, Mohammedia, Nador, Ouarzazate, Oued Zem, Oujda, Rabat, Safi, Sale, Sefrou, Settat, Sidi Bennour, Sidi Kacem, Sidi Slimane, Skhirat, Tanger (Tangier), Taourirt, Taroudant, Taza, Temara, Tetouan, Tifelt, Tiznit, and all remaining cities up to 345. Source from Wikipedia List of cities in Morocco. Use French transliterations where standard (e.g., "Tanger" not "Tangier", "Fes" not "Fez", "Marrakech" not "Marrakesh").

2. Update `CheckoutPage.tsx`:
   - Add imports: `Autocomplete` from `@mui/material/Autocomplete`, `Controller` from `react-hook-form`, `MOROCCAN_CITIES` from constants.
   - Add `control` to the `useForm` destructuring alongside `register`, `handleSubmit`, `setValue`, `formState`.
   - Replace the city `TextField` (line ~170) with a `Controller` wrapping `MUI Autocomplete`:
     ```tsx
     <Controller
       name="city"
       control={control}
       render={({ field: { onChange, value, ref } }) => (
         <Autocomplete
           options={MOROCCAN_CITIES}
           value={value || null}
           onChange={(_e, newValue) => onChange(newValue ?? '')}
           renderInput={(params) => (
             <TextField
               {...params}
               label="Ville de livraison"
               required
               error={Boolean(errors.city)}
               helperText={errors.city?.message}
               inputRef={ref}
             />
           )}
           noOptionsText="Aucune ville trouvée"
           fullWidth
         />
       )}
     />
     ```
   - Add a "Pays" (Country) field BEFORE the city Autocomplete. Use a simple disabled TextField:
     ```tsx
     <TextField
       label="Pays"
       value="Maroc"
       fullWidth
       disabled
       InputProps={{ readOnly: true }}
     />
     ```
     No need to add country to the Zod schema since it is always "Maroc" and not user-editable.

3. Update `ProfilePage.tsx`:
   - Add same imports: `Autocomplete`, `Controller`, `MOROCCAN_CITIES`.
   - Add `control` to the `useForm` destructuring.
   - Replace the `address_city` TextField (line ~126-133) with a `Controller` wrapping `MUI Autocomplete`:
     ```tsx
     <Controller
       name="address_city"
       control={control}
       render={({ field: { onChange, value, ref } }) => (
         <Autocomplete
           options={MOROCCAN_CITIES}
           value={value || null}
           onChange={(_e, newValue) => onChange(newValue ?? '')}
           renderInput={(params) => (
             <TextField
               {...params}
               label="Ville"
               error={Boolean(errors.address_city)}
               helperText={errors.address_city?.message}
               inputRef={ref}
             />
           )}
           noOptionsText="Aucune ville trouvée"
           fullWidth
         />
       )}
     />
     ```
  </action>
  <verify>
    Run `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend && npx tsc --noEmit` to confirm no TypeScript errors. Visually confirm the Autocomplete renders in both pages by running the dev server.
  </verify>
  <done>
    - CheckoutPage shows a disabled "Pays: Maroc" field followed by a city Autocomplete dropdown with Moroccan cities.
    - ProfilePage shows a city Autocomplete dropdown with Moroccan cities.
    - Users can type to filter cities, only predefined cities are selectable.
    - Form validation still works (city required in checkout, optional in profile).
  </done>
</task>

<task type="auto">
  <name>Task 2: Add live search autocomplete dropdown to navbar</name>
  <files>
    trotinette-frontend/src/shared/components/Navbar.tsx
  </files>
  <action>
Update `Navbar.tsx` to add a live search dropdown on desktop:

1. Add imports:
   - `useRef, useEffect, useCallback` from React (extend existing import)
   - `Paper`, `ClickAwayListener`, `Popper` from MUI (Paper already imported? check - no it's not imported in Navbar)
   - `CircularProgress` from MUI
   - `useQuery` is already imported
   - `apiClient` is already imported
   - `formatCurrency` from `../utils/formatCurrency`
   - Import `Product` and `PaginatedResponse` types from `../../features/catalog/types`

2. Add debounce logic and search query state:
   - Add `debouncedQuery` state: `const [debouncedQuery, setDebouncedQuery] = useState('')`
   - Add `searchAnchorRef` as `useRef<HTMLDivElement>(null)` on the desktop search Box container
   - Add `searchOpen` state: `const [searchOpen, setSearchOpen] = useState(false)`
   - Add debounce effect:
     ```tsx
     useEffect(() => {
       if (searchQuery.trim().length < 2) {
         setDebouncedQuery('');
         return;
       }
       const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
       return () => clearTimeout(timer);
     }, [searchQuery]);
     ```

3. Add search results query:
   ```tsx
   const { data: searchResults, isFetching: isSearching } = useQuery<PaginatedResponse<Product>>({
     queryKey: ['search', debouncedQuery],
     queryFn: async () => {
       const res = await apiClient.get<PaginatedResponse<Product>>('/products', {
         params: { 'filter[search]': debouncedQuery, per_page: 5 },
       });
       return res.data;
     },
     enabled: debouncedQuery.length >= 2,
     staleTime: 30_000,
   });
   ```

4. Show/hide dropdown:
   - Open when `debouncedQuery.length >= 2` and (results exist or is loading)
   - Close on ClickAwayListener, on navigate, on Escape key
   - Add `onFocus` to InputBase to reopen if query exists
   - Set `searchOpen` to `true` when `debouncedQuery` has results, `false` when cleared

5. Render the dropdown using Popper + Paper below the desktop search box (attach ref to the search form Box):
   ```tsx
   <Popper
     open={searchOpen && debouncedQuery.length >= 2}
     anchorEl={searchAnchorRef.current}
     placement="bottom-start"
     style={{ zIndex: 1301, width: searchAnchorRef.current?.offsetWidth ?? 300 }}
   >
     <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
       <Paper sx={{ mt: 0.5, maxHeight: 320, overflow: 'auto', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
         {isSearching ? (
           <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
         ) : searchResults?.data.length ? (
           searchResults.data.map((product) => (
             <Box
               key={product.id}
               onClick={() => {
                 void navigate(`/products/${product.slug}`);
                 setSearchQuery('');
                 setDebouncedQuery('');
                 setSearchOpen(false);
               }}
               sx={{
                 px: 2, py: 1.5, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                 '&:hover': { bgcolor: 'action.hover' },
                 borderBottom: '1px solid', borderColor: 'divider',
                 '&:last-child': { borderBottom: 'none' },
               }}
             >
               <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }} noWrap>
                 {product.name}
               </Typography>
               <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.8rem', ml: 2, flexShrink: 0 }}>
                 {formatCurrency(product.price)}
               </Typography>
             </Box>
           ))
         ) : (
           <Box sx={{ p: 2 }}>
             <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
               Aucun produit trouve
             </Typography>
           </Box>
         )}
       </Paper>
     </ClickAwayListener>
   </Popper>
   ```

6. Wire up the desktop InputBase:
   - Add `onFocus={() => { if (debouncedQuery.length >= 2) setSearchOpen(true); }}` to the InputBase
   - Add `onKeyDown` handler: on Escape, `setSearchOpen(false)` and blur input
   - Make the search box wider when focused: update `width` to `{ width: searchOpen ? 280 : 160, transition: 'width 0.2s' }`

7. Attach `ref={searchAnchorRef}` to the desktop search form Box (the one with `component="form"`).

8. Render the Popper right after the desktop search Box (still inside the desktop-only container so it only shows on desktop).

9. Mobile search: No changes needed. Mobile keeps Enter-to-search behavior only.

10. Update the existing `handleSearch` to also close the dropdown:
    ```tsx
    const handleSearch = () => {
      const trimmed = searchQuery.trim();
      if (trimmed) {
        void navigate(`/products?filter[search]=${encodeURIComponent(trimmed)}`);
        setSearchQuery('');
        setDebouncedQuery('');
        setSearchOpen(false);
        setMobileSearchOpen(false);
        setMobileOpen(false);
      }
    };
    ```
  </action>
  <verify>
    Run `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend && npx tsc --noEmit` to confirm no TypeScript errors. Start dev server, type in the desktop search bar, confirm dropdown appears with product results after 300ms debounce. Click a result and confirm navigation to product detail page. Press Enter and confirm navigation to catalog search.
  </verify>
  <done>
    - Desktop navbar search shows a dropdown of up to 5 matching products as user types (after 2+ chars, 300ms debounce).
    - Each result shows product name and price.
    - Clicking a result navigates to `/products/{slug}`.
    - Pressing Enter navigates to `/products?filter[search]=query` (existing behavior preserved).
    - Dropdown closes on click away, Escape, or navigation.
    - Mobile search unchanged (Enter-only).
  </done>
</task>

</tasks>

<verification>
1. `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend && npx tsc --noEmit` passes with zero errors.
2. CheckoutPage: "Pays" field shows "Maroc" (disabled), city field is an Autocomplete dropdown with Moroccan cities, typing filters the list.
3. ProfilePage: City field is an Autocomplete dropdown with Moroccan cities.
4. Navbar desktop: Typing 2+ chars shows live product results in a dropdown below the search input.
5. Navbar desktop: Clicking a search result navigates to the product detail page.
6. Navbar desktop: Pressing Enter navigates to the catalog search results page.
7. Navbar mobile: Search works via Enter only (no dropdown).
</verification>

<success_criteria>
- City inputs in CheckoutPage and ProfilePage are MUI Autocomplete components restricted to 345 Moroccan cities
- CheckoutPage has a "Pays: Maroc" disabled field before the city field
- Navbar desktop search shows live product results in a dropdown with debounced API calls
- All form validation continues to work correctly
- TypeScript compiles without errors
</success_criteria>

<output>
After completion, create `.planning/quick/7-city-select-dropdown-with-moroccan-citie/7-SUMMARY.md`
</output>
