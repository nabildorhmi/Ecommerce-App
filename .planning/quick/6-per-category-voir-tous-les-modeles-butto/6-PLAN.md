---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - trotinette-frontend/src/features/home/pages/HomePage.tsx
  - trotinette-api/app/Http/Controllers/Admin/UserController.php
  - trotinette-api/routes/api.php
  - trotinette-frontend/src/features/admin/api/users.ts
  - trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
  - trotinette-frontend/src/shared/components/Navbar.tsx
autonomous: true
must_haves:
  truths:
    - "Each category section on homepage has its own 'Voir tous les modeles' button linking to filtered catalog"
    - "The single bottom 'Voir tous les modeles' button is removed from FeaturedSection"
    - "Global admin can create a new user with name, email, phone, password, and role via a dialog"
    - "Search bar in navbar navigates to /products?filter[search]=query on Enter"
  artifacts:
    - path: "trotinette-frontend/src/features/home/pages/HomePage.tsx"
      provides: "Per-category button in CategoryFeaturedRow"
      contains: "categoryId"
    - path: "trotinette-api/app/Http/Controllers/Admin/UserController.php"
      provides: "store method for creating users"
      contains: "public function store"
    - path: "trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx"
      provides: "Create user dialog with form"
      contains: "Ajouter un utilisateur"
    - path: "trotinette-frontend/src/shared/components/Navbar.tsx"
      provides: "Search input in navbar"
      contains: "filter[search]"
  key_links:
    - from: "AdminUsersPage.tsx"
      to: "/admin/users POST"
      via: "useCreateUser mutation"
      pattern: "useCreateUser"
    - from: "CategoryFeaturedRow"
      to: "/products?filter[category_id]"
      via: "Link with categoryId prop"
      pattern: "filter\\[category_id\\]"
---

<objective>
Three independent UI/backend enhancements: per-category "voir tous" button on homepage, admin user creation, and navbar search bar.

Purpose: Improve navigation (per-category links, search) and admin capabilities (user creation).
Output: Updated HomePage, AdminUsersPage, UserController, routes, users API hooks, and Navbar.
</objective>

<context>
@trotinette-frontend/src/features/home/pages/HomePage.tsx
@trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
@trotinette-frontend/src/features/admin/api/users.ts
@trotinette-frontend/src/shared/components/Navbar.tsx
@trotinette-api/app/Http/Controllers/Admin/UserController.php
@trotinette-api/routes/api.php
</context>

<tasks>

<task type="auto">
  <name>Task 1: Per-category "Voir tous" button and admin user creation (backend + frontend)</name>
  <files>
    trotinette-frontend/src/features/home/pages/HomePage.tsx
    trotinette-api/app/Http/Controllers/Admin/UserController.php
    trotinette-api/routes/api.php
    trotinette-frontend/src/features/admin/api/users.ts
    trotinette-frontend/src/features/admin/pages/AdminUsersPage.tsx
  </files>
  <action>
    **HomePage.tsx changes:**

    1. Update `CategoryFeaturedRowProps` interface to add `categoryId: number`:
       ```ts
       interface CategoryFeaturedRowProps {
         categoryId: number;
         categoryName: string;
         products: Product[];
       }
       ```

    2. In `CategoryFeaturedRow`, add `categoryId` to destructured props. After the scrollable product cards Box (after the closing `</Box>` at line ~251), add a centered button:
       ```tsx
       <Box sx={{ textAlign: 'center', mt: 3 }}>
         <Button
           component={Link}
           to={`/products?filter[category_id]=${categoryId}`}
           variant="outlined"
           sx={{ px: 5, py: 1.25, fontSize: '0.78rem', letterSpacing: '0.1em' }}
         >
           VOIR TOUS LES MODELES
         </Button>
       </Box>
       ```

    3. In `FeaturedSection`, change the iteration over `categoryGroups` to use `Array.from(categoryGroups.entries())` instead of `.values()` so we get the categoryId key. Pass `categoryId` prop:
       ```tsx
       {Array.from(categoryGroups.entries()).map(([categoryId, { categoryName, products: categoryProducts }]) => (
         categoryProducts.length > 0 && (
           <CategoryFeaturedRow
             key={categoryId}
             categoryId={categoryId}
             categoryName={categoryName}
             products={categoryProducts}
           />
         )
       ))}
       ```

    4. Remove the single bottom button block (lines 318-323, the `<Box sx={{ textAlign: 'center', mt: 0 }}>` with the "VOIR TOUS LES MODELES" button).

    **UserController.php changes:**

    5. Add `use Illuminate\Support\Facades\Hash;` import at the top.

    6. Add a `store` method to UserController:
       ```php
       public function store(Request $request): JsonResponse
       {
           // Only global_admin can create users
           if (!auth()->user()->hasRole('global_admin')) {
               return response()->json(['message' => 'Unauthorized.'], 403);
           }

           $validated = $request->validate([
               'name'     => 'required|string|max:255',
               'email'    => 'required|email|unique:users,email',
               'phone'    => 'nullable|string|max:20',
               'password' => 'required|string|min:8',
               'role'     => 'required|in:admin,customer',
           ]);

           $user = User::create([
               'name'      => $validated['name'],
               'email'     => $validated['email'],
               'phone'     => $validated['phone'] ?? null,
               'password'  => Hash::make($validated['password']),
               'is_active' => true,
           ]);

           $user->assignRole($validated['role']);

           return response()->json(new UserResource($user->load('roles')), 201);
       }
       ```

    **routes/api.php changes:**

    7. Add the POST route for user creation, right after the existing `Route::get('/users/{user}', ...)` line (around line 62):
       ```php
       Route::post('/users', [AdminUserController::class, 'store']);
       ```

    **users.ts (frontend API hooks) changes:**

    8. Add `useCreateUser` mutation hook after the existing mutation hooks:
       ```ts
       export function useCreateUser() {
         const queryClient = useQueryClient();

         return useMutation({
           mutationFn: async (data: { name: string; email: string; phone?: string; password: string; role: string }) => {
             const res = await apiClient.post('/admin/users', data);
             return res.data;
           },
           onSuccess: () => {
             void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
           },
         });
       }
       ```

    **AdminUsersPage.tsx changes:**

    9. Add imports: `TextField` from `@mui/material/TextField`, `InputLabel` from `@mui/material/InputLabel`. Import `useCreateUser` from `'../api/users'` (add to existing import).

    10. Inside `AdminUsersPage` component, add state for the create dialog:
        ```ts
        const [createOpen, setCreateOpen] = useState(false);
        const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
        const createMutation = useCreateUser();
        ```

    11. Add a submit handler:
        ```ts
        const handleCreateUser = async () => {
          await createMutation.mutateAsync(createForm);
          setCreateOpen(false);
          setCreateForm({ name: '', email: '', phone: '', password: '', role: 'customer' });
        };
        ```

    12. After the "Utilisateurs" Typography heading (line 119-121), add conditionally (only for global_admin) an "Ajouter un utilisateur" button:
        ```tsx
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Utilisateurs
          </Typography>
          {currentUser?.role === 'global_admin' && (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Ajouter un utilisateur
            </Button>
          )}
        </Box>
        ```
        Remove the old standalone Typography for "Utilisateurs".

    13. Before the closing `</Box>` of the component (before the DeactivateDialog), add the create user Dialog:
        ```tsx
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            <TextField label="Nom" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} fullWidth size="small" required />
            <TextField label="E-mail" type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} fullWidth size="small" required />
            <TextField label="Telephone" value={createForm.phone} onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
            <TextField label="Mot de passe" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} fullWidth size="small" required />
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={() => void handleCreateUser()} disabled={createMutation.isPending || !createForm.name || !createForm.email || !createForm.password}>
              {createMutation.isPending ? <CircularProgress size={20} /> : 'Creer'}
            </Button>
          </DialogActions>
        </Dialog>
        ```
  </action>
  <verify>
    - `cd trotinette-frontend && npx tsc --noEmit` passes without errors
    - Visually confirm: HomePage shows a "VOIR TOUS LES MODELES" button under each category row, no single bottom button
    - AdminUsersPage shows "Ajouter un utilisateur" button for global_admin, dialog opens with all fields
  </verify>
  <done>
    - Each category featured row has its own "Voir tous les modeles" button linking to `/products?filter[category_id]=N`
    - Bottom single button removed from FeaturedSection
    - POST /admin/users endpoint creates user with name, email, phone, password, role (global_admin only)
    - AdminUsersPage has create user dialog with all fields, mutation invalidates user list on success
  </done>
</task>

<task type="auto">
  <name>Task 2: Search bar in navbar</name>
  <files>
    trotinette-frontend/src/shared/components/Navbar.tsx
  </files>
  <action>
    1. Add imports at the top of Navbar.tsx:
       ```ts
       import InputBase from '@mui/material/InputBase';
       import SearchIcon from '@mui/icons-material/Search';
       ```

    2. Inside the `Navbar` component, add search state:
       ```ts
       const [searchQuery, setSearchQuery] = useState('');
       const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
       ```

    3. Add a search submit handler:
       ```ts
       const handleSearch = () => {
         const trimmed = searchQuery.trim();
         if (trimmed) {
           void navigate(`/products?filter[search]=${encodeURIComponent(trimmed)}`);
           setSearchQuery('');
           setMobileSearchOpen(false);
           setMobileOpen(false);
         }
       };
       ```

    4. **Desktop search:** In the desktop category nav Box (line 107, `display: { xs: 'none', md: 'flex' }`), after the categories Menu closing tag `</>` (line 184), before the closing `</Box>` of the desktop nav (line 186), add a search input pushed to the right:
       ```tsx
       <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
         <Box
           component="form"
           onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSearch(); }}
           sx={{
             display: 'flex',
             alignItems: 'center',
             bgcolor: 'rgba(255,255,255,0.06)',
             borderRadius: '6px',
             border: '1px solid',
             borderColor: 'divider',
             px: 1.5,
             py: 0.25,
             transition: 'border-color 0.2s',
             '&:focus-within': { borderColor: 'primary.main' },
           }}
         >
           <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 1 }} />
           <InputBase
             placeholder="Rechercher..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             sx={{
               fontSize: '0.8rem',
               color: 'text.primary',
               width: 160,
               '& input::placeholder': { color: 'text.secondary', opacity: 1 },
             }}
           />
         </Box>
       </Box>
       ```
       IMPORTANT: Remove the `flex: 1` from the parent desktop category nav Box (line 107). The search Box with `ml: 'auto'` will push to the right. Keep the parent as `display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.25, flex: 1` -- actually keep `flex: 1` so the search bar pushes to the right within the flex container.

    5. **Mobile search:** In the mobile Drawer's Stack (line 360), add a search input at the top before "TOUS LES SCOOTERS":
       ```tsx
       <Box
         component="form"
         onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSearch(); }}
         sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: '6px', px: 1.5, py: 0.5, mb: 1 }}
       >
         <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 1 }} />
         <InputBase
           placeholder="Rechercher..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           sx={{ fontSize: '0.85rem', color: 'text.primary', flex: 1 }}
         />
       </Box>
       ```
  </action>
  <verify>
    - `cd trotinette-frontend && npx tsc --noEmit` passes without errors
    - Desktop: search input visible between category nav and right actions
    - Mobile: search input visible at top of drawer
    - Typing a query and pressing Enter navigates to `/products?filter[search]=query`
  </verify>
  <done>
    - Desktop navbar has a compact search input between categories and right actions
    - Mobile drawer has a search input at the top
    - Enter key navigates to `/products?filter[search]=encodedQuery`
    - Search input clears and mobile drawer closes after search
  </done>
</task>

</tasks>

<verification>
- TypeScript compilation passes for frontend
- HomePage displays per-category buttons with correct filter links
- Admin user creation works end-to-end (backend route + controller + frontend dialog)
- Navbar search navigates to filtered catalog on both desktop and mobile
</verification>

<success_criteria>
- No single bottom "Voir tous les modeles" button on homepage; each category row has its own
- POST /admin/users creates a user with assigned role (global_admin auth required)
- AdminUsersPage shows create dialog for global_admin users
- Navbar search input on desktop and mobile navigates to /products?filter[search]=query
</success_criteria>
