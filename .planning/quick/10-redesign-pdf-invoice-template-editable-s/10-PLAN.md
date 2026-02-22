---
phase: quick-10
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  # Task 1 - PDF redesign
  - trotinette-api/resources/views/invoices/invoice.blade.php
  # Task 2 - Editable pages backend
  - trotinette-api/app/Models/Page.php
  - trotinette-api/database/migrations/2026_02_22_100000_create_pages_table.php
  - trotinette-api/database/seeders/PageSeeder.php
  - trotinette-api/database/seeders/DatabaseSeeder.php
  - trotinette-api/app/Http/Controllers/Customer/PageController.php
  - trotinette-api/app/Http/Controllers/Admin/PageController.php
  - trotinette-api/app/Http/Requests/Admin/UpdatePageRequest.php
  - trotinette-api/app/Http/Resources/PageResource.php
  - trotinette-api/routes/api.php
  # Task 3 - Editable pages frontend + admin
  - trotinette-frontend/src/features/info/api/pages.ts
  - trotinette-frontend/src/features/info/pages/DynamicPage.tsx
  - trotinette-frontend/src/features/admin/api/pages.ts
  - trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
  - trotinette-frontend/src/features/info/pages/AboutPage.tsx
  - trotinette-frontend/src/features/info/pages/ContactPage.tsx
  - trotinette-frontend/src/features/info/pages/CgvPage.tsx
  - trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx
  - trotinette-frontend/src/app/router.tsx
  # Task 4 - Change password
  - trotinette-api/app/Http/Requests/Auth/ChangePasswordRequest.php
  - trotinette-api/app/Http/Controllers/Customer/AuthController.php
  - trotinette-frontend/src/features/auth/api/auth.ts
  - trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
  # Task 5 - Forgot/reset password
  - trotinette-api/app/Http/Controllers/Customer/PasswordResetController.php
  - trotinette-frontend/src/features/auth/pages/ForgotPasswordPage.tsx
  - trotinette-frontend/src/features/auth/pages/ResetPasswordPage.tsx
  - trotinette-frontend/src/features/auth/components/LoginForm.tsx
autonomous: true

must_haves:
  truths:
    - "PDF invoice is compact and professional with neutral gray/black colors"
    - "Admin can edit static page content from admin panel"
    - "Static pages (about, contact, CGV, mentions) render content from database"
    - "Authenticated user can change password from profile page"
    - "User can request a password reset email from login page"
    - "User can reset password using emailed token link"
  artifacts:
    - path: "trotinette-api/resources/views/invoices/invoice.blade.php"
      provides: "Redesigned compact invoice template"
    - path: "trotinette-api/app/Models/Page.php"
      provides: "Page model for CMS"
    - path: "trotinette-frontend/src/features/info/pages/DynamicPage.tsx"
      provides: "Dynamic page component fetching content by slug"
    - path: "trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx"
      provides: "Admin page editor"
    - path: "trotinette-api/app/Http/Controllers/Customer/PasswordResetController.php"
      provides: "Forgot/reset password endpoints"
  key_links:
    - from: "DynamicPage.tsx"
      to: "/api/pages/{slug}"
      via: "fetch by slug"
      pattern: "apiClient.get.*pages"
    - from: "AdminPagesPage.tsx"
      to: "/api/admin/pages"
      via: "CRUD API calls"
      pattern: "apiClient.*(put|get).*admin/pages"
    - from: "ProfilePage.tsx"
      to: "/api/user/password"
      via: "change password mutation"
      pattern: "apiClient.post.*user/password"
    - from: "LoginForm.tsx"
      to: "/forgot-password"
      via: "Link component"
      pattern: "forgot-password"
---

<objective>
Implement 4 features: (1) Redesign PDF invoice to be compact/professional, (2) Make static pages editable via admin CMS, (3) Add change password to profile, (4) Add forgot/reset password flow.

Purpose: Polish the app with professional invoices, admin-editable content pages, and complete password management.
Output: Working invoice template, CMS for static pages, change password in profile, forgot/reset password flow.
</objective>

<execution_context>
@C:/Users/User/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/User/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@trotinette-api/routes/api.php
@trotinette-api/app/Http/Controllers/Customer/AuthController.php
@trotinette-api/resources/views/invoices/invoice.blade.php
@trotinette-frontend/src/app/router.tsx
@trotinette-frontend/src/features/auth/api/auth.ts
@trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
@trotinette-frontend/src/features/auth/pages/LoginPage.tsx
@trotinette-frontend/src/features/auth/components/LoginForm.tsx
@trotinette-frontend/src/features/info/pages/AboutPage.tsx
@trotinette-frontend/src/features/info/pages/ContactPage.tsx
@trotinette-frontend/src/features/info/pages/CgvPage.tsx
@trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Redesign PDF invoice template</name>
  <files>trotinette-api/resources/views/invoices/invoice.blade.php</files>
  <action>
  Rewrite the invoice.blade.php styles to create a compact, professional invoice:

  **Color scheme:** Replace all #2563eb blue with neutral palette:
  - Table header: #374151 (dark gray) background, white text
  - Total row: #1f2937 (near-black) background, white text
  - Note box: #f3f4f6 background with #6b7280 left border (replace yellow)
  - Invoice title: #111827 (black), reduce from 32pt to 22pt
  - Order info section: remove background color, use simple border-bottom on rows instead

  **Spacing reductions:**
  - body padding: 30px -> 20px
  - header margin-bottom: 40px -> 20px
  - order-info padding: 20px -> 12px, margin-bottom: 30px -> 15px
  - items-table th/td padding: 12px/10px -> 8px
  - items-table margin-bottom: 30px -> 15px
  - totals margin-bottom: 30px -> 15px
  - note padding: 15px -> 10px
  - footer margin-top: 50px -> 25px

  **Font sizes:** Reduce body from 11pt to 10pt, order-info h3 from 14pt to 11pt, total row from 13pt to 11pt.

  **Structure changes:**
  - Remove border-radius on order-info (sharp corners)
  - Add thin top/bottom borders to order-info instead of background
  - Logo height stays 60px
  - Keep all data bindings exactly the same (order_number, items loop, totals, note, footer)
  </action>
  <verify>Visually inspect the blade file for correct style values. The template still uses all the same Blade variables ($order, $item, etc.).</verify>
  <done>Invoice template uses neutral gray/black palette, reduced spacing, smaller font sizes, no blue or yellow accents.</done>
</task>

<task type="auto">
  <name>Task 2: Editable static pages - backend (Page model, API, seeder)</name>
  <files>
    trotinette-api/app/Models/Page.php
    trotinette-api/database/migrations/2026_02_22_100000_create_pages_table.php
    trotinette-api/database/seeders/PageSeeder.php
    trotinette-api/database/seeders/DatabaseSeeder.php
    trotinette-api/app/Http/Controllers/Customer/PageController.php
    trotinette-api/app/Http/Controllers/Admin/PageController.php
    trotinette-api/app/Http/Requests/Admin/UpdatePageRequest.php
    trotinette-api/app/Http/Resources/PageResource.php
    trotinette-api/routes/api.php
  </files>
  <action>
  **Page model** (`app/Models/Page.php`):
  - Fields: id, slug (unique), title (string), content (longText, stores markdown), updated_at, created_at
  - $fillable: slug, title, content
  - Route key: slug (override getRouteKeyName to return 'slug')

  **Migration** (`2026_02_22_100000_create_pages_table.php`):
  - id, slug (string unique), title (string), content (longText), timestamps

  **PageResource** (`app/Http/Resources/PageResource.php`):
  - Return: id, slug, title, content, updated_at

  **Customer PageController** (`app/Http/Controllers/Customer/PageController.php`):
  - `show(Page $page)` - returns PageResource. Route-model binding resolves by slug.

  **Admin PageController** (`app/Http/Controllers/Admin/PageController.php`):
  - Alias as AdminPageController in routes to avoid collision (same pattern as AdminDeliveryZoneController).
  - `index()` - returns PageResource::collection(Page::orderBy('title')->get()) (no pagination, only ~4 pages)
  - `update(UpdatePageRequest $request, Page $page)` - updates title + content, returns PageResource

  **UpdatePageRequest** (`app/Http/Requests/Admin/UpdatePageRequest.php`):
  - title: required|string|max:255
  - content: required|string

  **Routes** in `routes/api.php`:
  - Public (unauthenticated, alongside /products and /categories): `Route::get('/pages/{page}', [PageController::class, 'show']);`
  - Add `use App\Http\Controllers\Customer\PageController;` at top
  - Admin (inside admin middleware group): `Route::get('/pages', [AdminPageController::class, 'index']);` and `Route::put('/pages/{page}', [AdminPageController::class, 'update']);`
  - Add `use App\Http\Controllers\Admin\PageController as AdminPageController;` at top

  **PageSeeder** (`database/seeders/PageSeeder.php`):
  - Seed 4 pages with slug/title/content. Content should be markdown equivalent of the current hardcoded page content:
    - slug: "a-propos", title: "A propos de MiraiTech", content: the 3 paragraphs from AboutPage.tsx as markdown
    - slug: "contact", title: "Contactez-nous", content: the sections from ContactPage.tsx as markdown with ## headings
    - slug: "cgv", title: "Conditions Generales de Vente", content: the 6 sections from CgvPage.tsx as markdown with ## numbered headings
    - slug: "mentions-legales", title: "Mentions Legales", content: the 4 sections from MentionsLegalesPage.tsx as markdown with ## headings
  - Use Page::updateOrCreate(['slug' => ...], [...]) so seeder is idempotent

  **DatabaseSeeder**: Add `$this->call(PageSeeder::class);` after existing seeders.

  Run migration: `cd trotinette-api && php artisan migrate`
  Run seeder: `php artisan db:seed --class=PageSeeder`
  </action>
  <verify>
  Run `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-api && php artisan migrate && php artisan db:seed --class=PageSeeder` then test:
  - `curl http://localhost:8000/api/pages/a-propos` returns 200 with page content
  - `curl http://localhost:8000/api/pages/cgv` returns 200 with CGV content
  </verify>
  <done>Page model exists, migration run, 4 pages seeded, public GET /pages/{slug} returns page content, admin GET /pages and PUT /pages/{slug} routes registered.</done>
</task>

<task type="auto">
  <name>Task 3: Editable static pages - frontend (dynamic rendering + admin editor)</name>
  <files>
    trotinette-frontend/src/features/info/api/pages.ts
    trotinette-frontend/src/features/info/pages/DynamicPage.tsx
    trotinette-frontend/src/features/admin/api/pages.ts
    trotinette-frontend/src/features/admin/pages/AdminPagesPage.tsx
    trotinette-frontend/src/features/info/pages/AboutPage.tsx
    trotinette-frontend/src/features/info/pages/ContactPage.tsx
    trotinette-frontend/src/features/info/pages/CgvPage.tsx
    trotinette-frontend/src/features/info/pages/MentionsLegalesPage.tsx
    trotinette-frontend/src/app/router.tsx
  </files>
  <action>
  **Install react-markdown:** Run `cd trotinette-frontend && npm install react-markdown`

  **Public pages API** (`src/features/info/api/pages.ts`):
  ```ts
  interface PageData { id: number; slug: string; title: string; content: string; updated_at: string; }
  fetchPage(slug: string): GET /pages/{slug} -> PageData
  ```
  Export a `usePageBySlug(slug: string)` hook using useQuery with queryKey `['pages', slug]`.

  **DynamicPage component** (`src/features/info/pages/DynamicPage.tsx`):
  - Props: `{ slug: string }`
  - Uses `usePageBySlug(slug)` to fetch page content
  - Shows CircularProgress centered while loading
  - Shows Alert on error with "Page non disponible"
  - Renders: Container maxWidth="md", Box with py:6 and minHeight:'100vh', Typography h3 bold for title, then `<ReactMarkdown>` rendering page.content
  - Style the markdown output: wrap ReactMarkdown in a Box with `sx={{ '& h2': { mt: 3, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' }, '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 2 } }}`

  **Replace static page components:**
  - AboutPage.tsx: Replace entire component body with `<DynamicPage slug="a-propos" />`
  - ContactPage.tsx: Replace with `<DynamicPage slug="contact" />`
  - CgvPage.tsx: Replace with `<DynamicPage slug="cgv" />`
  - MentionsLegalesPage.tsx: Replace with `<DynamicPage slug="mentions-legales" />`
  - Keep the named exports and function names the same so router imports don't break.

  **Admin pages API** (`src/features/admin/api/pages.ts`):
  ```ts
  useAdminPages(): useQuery(['admin','pages'], GET /admin/pages) -> PageData[]
  useUpdatePage(): useMutation(PUT /admin/pages/{slug}, {title, content}) invalidates ['admin','pages'] AND ['pages'] (so public cache refreshes)
  ```

  **AdminPagesPage** (`src/features/admin/pages/AdminPagesPage.tsx`):
  - Follow existing admin page patterns (Table with Paper, Dialog for editing).
  - Table columns: Titre, Slug, Derniere modification, Actions (edit icon button)
  - Edit dialog:
    - DialogTitle: "Modifier la page"
    - TextField for title (fullWidth)
    - TextField for content: multiline, minRows={12}, fullWidth, monospace font (fontFamily: 'monospace' in inputProps)
    - Small Typography helper text: "Utilisez la syntaxe Markdown pour le formatage (## pour les titres, **gras**, etc.)"
    - DialogActions: Annuler + Enregistrer buttons
  - On save success: close dialog, show Snackbar "Page mise a jour"
  - Use useForm with zodResolver: title required string, content required string

  **Router** (`src/app/router.tsx`):
  - Import AdminPagesPage
  - Add route inside AdminRoute children: `{ path: '/admin/pages', element: <AdminPagesPage /> }`
  - Add a nav link for admin pages in the admin section (the Navbar likely has admin menu items - add "Pages" linking to /admin/pages)
  </action>
  <verify>
  Run `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend && npx tsc --noEmit` passes with no errors.
  Visit /a-propos - should show the seeded content rendered from markdown.
  Visit /admin/pages - should show table of 4 pages with edit functionality.
  </verify>
  <done>Static pages render content from API via DynamicPage+ReactMarkdown. Admin can view all pages in table and edit title/content via dialog. All 4 page routes still work with same URLs.</done>
</task>

<task type="auto">
  <name>Task 4: Change password in profile page</name>
  <files>
    trotinette-api/app/Http/Requests/Auth/ChangePasswordRequest.php
    trotinette-api/app/Http/Controllers/Customer/AuthController.php
    trotinette-api/routes/api.php
    trotinette-frontend/src/features/auth/api/auth.ts
    trotinette-frontend/src/features/auth/pages/ProfilePage.tsx
  </files>
  <action>
  **ChangePasswordRequest** (`app/Http/Requests/Auth/ChangePasswordRequest.php`):
  - Rules: current_password required|string|current_password, password required|string|min:8|confirmed
  - (Laravel's `current_password` validation rule checks against authenticated user)

  **AuthController** - Add `changePassword` method:
  ```php
  public function changePassword(ChangePasswordRequest $request): JsonResponse
  {
      $request->user()->update([
          'password' => Hash::make($request->validated('password')),
      ]);
      return response()->json(['message' => 'Mot de passe modifie avec succes']);
  }
  ```
  Add `use Illuminate\Support\Facades\Hash;` import.

  **Route** - Add inside auth:sanctum middleware group (alongside PUT /user):
  `Route::post('/user/password', [AuthController::class, 'changePassword']);`

  **Frontend auth API** (`auth.ts`):
  Add `changePasswordApi(data: { current_password: string; password: string; password_confirmation: string })` -> POST /user/password

  **ProfilePage** - Add a "Changer le mot de passe" section below the existing profile Paper:
  - New Paper with elevation={2}, sx={{ p: 4, mt: 3 }}
  - Typography h5 "Changer le mot de passe" bold mb={3}
  - Separate useForm instance with passwordSchema: current_password (min 8), password (min 8), password_confirmation (must match password using z.refine)
  - Separate useMutation calling changePasswordApi
  - 3 TextFields: "Mot de passe actuel" (type=password), "Nouveau mot de passe" (type=password), "Confirmer le nouveau mot de passe" (type=password)
  - Submit button "Modifier le mot de passe"
  - On success: reset form (form.reset()), show success Snackbar "Mot de passe modifie avec succes"
  - On error: show server error in Alert (same pattern as profile form)
  </action>
  <verify>
  Backend: `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-api && php artisan route:list --path=user/password` shows POST route.
  Frontend: `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend && npx tsc --noEmit` passes.
  </verify>
  <done>POST /user/password endpoint validates current password and updates to new password. Profile page has separate password change form below profile info with validation and success feedback.</done>
</task>

<task type="auto">
  <name>Task 5: Forgot password and email reset flow</name>
  <files>
    trotinette-api/app/Http/Controllers/Customer/PasswordResetController.php
    trotinette-api/routes/api.php
    trotinette-frontend/src/features/auth/api/auth.ts
    trotinette-frontend/src/features/auth/pages/ForgotPasswordPage.tsx
    trotinette-frontend/src/features/auth/pages/ResetPasswordPage.tsx
    trotinette-frontend/src/features/auth/components/LoginForm.tsx
    trotinette-frontend/src/app/router.tsx
  </files>
  <action>
  **PasswordResetController** (`app/Http/Controllers/Customer/PasswordResetController.php`):
  ```php
  namespace App\Http\Controllers\Customer;

  use App\Http\Controllers\Controller;
  use Illuminate\Http\JsonResponse;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Password;
  use Illuminate\Support\Facades\Hash;
  use Illuminate\Support\Str;
  use Illuminate\Auth\Events\PasswordReset;

  class PasswordResetController extends Controller
  {
      public function forgotPassword(Request $request): JsonResponse
      {
          $request->validate(['email' => 'required|email']);
          $status = Password::sendResetLink($request->only('email'));
          // Always return 200 to not leak email existence
          return response()->json(['message' => 'Si un compte existe avec cet e-mail, un lien de reinitialisation a ete envoye.']);
      }

      public function resetPassword(Request $request): JsonResponse
      {
          $request->validate([
              'token' => 'required',
              'email' => 'required|email',
              'password' => 'required|string|min:8|confirmed',
          ]);

          $status = Password::reset(
              $request->only('email', 'password', 'password_confirmation', 'token'),
              function ($user, $password) {
                  $user->forceFill(['password' => Hash::make($password)])->setRememberToken(Str::random(60));
                  $user->save();
                  event(new PasswordReset($user));
              }
          );

          if ($status === Password::PASSWORD_RESET) {
              return response()->json(['message' => 'Mot de passe reinitialise avec succes.']);
          }

          return response()->json(['message' => 'Ce lien de reinitialisation est invalide ou a expire.'], 422);
      }
  }
  ```

  **Routes** - Add as unauthenticated routes alongside /auth/login and /auth/register:
  ```php
  use App\Http\Controllers\Customer\PasswordResetController;
  Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
  Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);
  ```

  **Frontend auth API** - Add to auth.ts:
  - `forgotPasswordApi(email: string)` -> POST /auth/forgot-password with {email}
  - `resetPasswordApi(data: {token, email, password, password_confirmation})` -> POST /auth/reset-password

  **ForgotPasswordPage** (`src/features/auth/pages/ForgotPasswordPage.tsx`):
  - Container maxWidth="sm", Paper with p:4, py:8
  - Typography h5 "Mot de passe oublie ?" bold
  - Typography body2 color text.secondary: "Entrez votre adresse e-mail et nous vous enverrons un lien pour reinitialiser votre mot de passe."
  - Email TextField + Submit Button "Envoyer le lien"
  - On success: show success Alert with the response message, disable form
  - On error: show error Alert
  - Link back to /login: "Retour a la connexion" using react-router Link

  **ResetPasswordPage** (`src/features/auth/pages/ResetPasswordPage.tsx`):
  - Read `token` and `email` from URL search params using useSearchParams()
  - If no token or email in URL, show error and redirect link to /forgot-password
  - Form: password + password_confirmation TextFields
  - On success: show success Alert + "Retour a la connexion" link to /login
  - On error: show error Alert (e.g. token expired)
  - Note: The reset email link from Laravel will point to the frontend URL. Configure in AppServiceProvider or ResetPassword notification. Add to AppServiceProvider boot():
    ```php
    use Illuminate\Auth\Notifications\ResetPassword;
    ResetPassword::createUrlUsing(function ($user, string $token) {
        return config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->getEmailForPasswordReset());
    });
    ```
  - Add FRONTEND_URL=http://localhost:5173 to .env (and 'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173') to config/app.php)

  **LoginForm** - Add "Mot de passe oublie ?" link:
  - Below the password TextField, add: `<Box textAlign="right"><Link component={RouterLink} to="/forgot-password" variant="body2">Mot de passe oublie ?</Link></Box>`
  - Import Link from @mui/material/Link, Link as RouterLink from react-router

  **Router** - Add routes (unauthenticated, alongside /login):
  - `{ path: '/forgot-password', element: <ForgotPasswordPage /> }`
  - `{ path: '/reset-password', element: <ResetPasswordPage /> }`
  - Import both components
  </action>
  <verify>
  Backend: `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-api && php artisan route:list --path=auth/forgot` shows POST route. `php artisan route:list --path=auth/reset` shows POST route.
  Frontend: `cd C:/Users/User/Desktop/TrotinetteApp/trotinette-frontend && npx tsc --noEmit` passes.
  Visit /login - "Mot de passe oublie ?" link visible below password field, navigates to /forgot-password.
  Visit /forgot-password - email form renders, submitting shows success message.
  Check `trotinette-api/storage/logs/laravel.log` for the reset email (MAIL_MAILER=log).
  </verify>
  <done>POST /auth/forgot-password sends reset link (logged in dev). POST /auth/reset-password resets password with valid token. Frontend has ForgotPasswordPage + ResetPasswordPage. Login form has "Mot de passe oublie ?" link. Reset email URL points to frontend /reset-password route with token+email params.</done>
</task>

</tasks>

<verification>
1. PDF invoice blade file uses gray/black palette, no blue or yellow, compact spacing
2. `curl /api/pages/a-propos` returns seeded content
3. `curl /api/pages/cgv` returns seeded CGV content
4. /a-propos, /contact, /cgv, /mentions-legales render from DB via markdown
5. /admin/pages shows 4 pages in table, edit dialog works
6. POST /user/password with valid current_password changes password
7. POST /auth/forgot-password sends reset email (check laravel.log)
8. POST /auth/reset-password with valid token resets password
9. /login shows "Mot de passe oublie ?" link
10. /profile shows password change form below profile info
11. `npx tsc --noEmit` passes in frontend
</verification>

<success_criteria>
- Invoice PDF uses compact neutral design (no blue/yellow accents)
- All 4 static pages render dynamically from database content via markdown
- Admin can edit any static page content from /admin/pages
- Profile page has working password change form with validation
- Forgot password flow: email input -> reset link sent -> reset form -> password changed
- All TypeScript compiles without errors
</success_criteria>

<output>
After completion, create `.planning/quick/10-redesign-pdf-invoice-template-editable-s/10-SUMMARY.md`
</output>
