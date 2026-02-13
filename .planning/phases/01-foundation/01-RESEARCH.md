# Phase 1: Foundation - Research

**Researched:** 2026-02-13
**Domain:** Laravel 12 API scaffold + React 19/MUI 7 scaffold + RTL/i18n wiring + multilingual DB schema + Service class pattern
**Confidence:** HIGH (all core technical claims verified via official docs and Context7-equivalent sources)

---

## Summary

Phase 1 establishes the entire technical foundation before any feature is built. Its three sub-plans cover: (1) Laravel project scaffolding with Sanctum bearer-token auth, RBAC, CORS, Service class pattern, and the translation-ready DB schema; (2) React project scaffolding with Vite 7, TypeScript, MUI 7, React Router v7, TanStack Query v5, Zustand v5, and a configured Axios client; (3) RTL + i18n wiring — RTLProvider with Emotion CacheProvider + stylis-plugin-rtl, i18next with FR/AR/EN locale files, language switcher, and the formatCurrency utility.

The most technically nuanced aspects are the RTL infrastructure and the multilingual DB schema. For RTL, three separate concerns must be synchronized on every locale change: `document.dir`, the MUI theme `direction` prop, and the Emotion CacheProvider with a cache keyed differently for LTR vs RTL — because Emotion's CSS-in-JS generates physical CSS properties (`margin-left`, `padding-right`) that are only flipped by `stylis-plugin-rtl`. Portal components (Dialog, Drawer, Menu, Tooltip) render outside the DOM tree and do NOT inherit `dir` from parent elements; they require the MUI theme direction to be `'rtl'` — which is why the ThemeProvider must wrap the entire app, not just non-portal content. For the DB schema, the `product_translations` table pattern must be in the first migration because retrofitting it after seeding costs 3-5 days of migration work.

Laravel 12 registers the Sanctum middleware and CORS via `bootstrap/app.php` (no `Kernel.php`). Spatie/laravel-permission v6 is correct for PHP 8.2/8.3 (v7 requires PHP 8.4). React Router v7 ships as a single `react-router` package (no `react-router-dom`) and supports both library mode (createBrowserRouter — correct for this project) and framework mode (file-based SSR — not needed here). MUI v7 deep imports no longer work; all imports must come from `@mui/material` or `@mui/material/styles`.

**Primary recommendation:** Wire RTLProvider and i18next in the first React commit before any component is built. Any CSS written before RTL infrastructure is in place will contain physical directional properties that must be refactored.

---

## Standard Stack

### Core — Backend

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Laravel | 12.x | API framework | Ships Sanctum, Eloquent, queues; `php artisan install:api` provisions Sanctum in one command |
| PHP | 8.3+ | Server runtime | Laravel 12 requires >=8.2; 8.3 recommended; Laravel 13 will require 8.3 minimum |
| MySQL | 8.x | Database | Eloquent's primary target; JSON columns for product attributes; full-text search on translations |
| Laravel Sanctum | bundled (12.x) | Bearer-token API auth | First-party, zero-config for token mode; `install:api` artisan command; `HasApiTokens` trait |
| spatie/laravel-permission | ^6.x | RBAC (admin/customer roles) | 22M+ downloads; middleware aliases, blade directives, cache layer; v6 = PHP 8.2/8.3 compatible |

### Core — Frontend

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI library | Concurrent rendering; official Laravel 12 starter kit target |
| TypeScript | 5.x | Type safety | Prevents API contract mismatch bugs; required by Vite template |
| Vite | 7.x | Build tool / dev server | Fastest HMR; native ESM dev mode; `@vitejs/plugin-react` |
| MUI (Material UI) | 7.x | Component library | Built-in RTL support; ships with Emotion; project specification |
| @emotion/react + @emotion/styled | ^11.x | CSS-in-JS engine | MUI's styling layer; required for CacheProvider RTL pattern |
| @emotion/cache | ^11.x | Emotion cache factory | Required alongside `@mui/stylis-plugin-rtl` to create LTR/RTL-keyed caches |
| @mui/stylis-plugin-rtl | ^2.x | RTL CSS transformation | Flips all MUI CSS (`margin-left` → `margin-right` etc.) for Arabic; plug into CacheProvider |
| stylis | ^4.x | CSS preprocessor | Peer dependency of `@mui/stylis-plugin-rtl`; provides `prefixer` plugin |

### Supporting — Backend

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| laravel/telescope | ^5.x | Dev-time request/query inspector | Dev only; reveals N+1 queries early; remove from production |
| barryvdh/laravel-debugbar | ^3.x | DB query inspector overlay | Dev only; complements Telescope |
| laravel/pint | ^1.x | PHP code style (ships with Laravel 12) | CI linting; opinionated Laravel style |

### Supporting — Frontend

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router | ^7.x | Client-side routing (library mode) | Single `react-router` package in v7 (no `react-router-dom`); `createBrowserRouter` for data mode |
| axios | ^1.x | HTTP client | Interceptor-based; single configured instance with auth + Accept-Language headers |
| @tanstack/react-query | ^5.x | Server state management | Caches API responses; replaces useEffect/useState for all API data |
| @tanstack/react-query-devtools | ^5.x | Query cache inspector | Dev only; shows cache state, refetch status |
| zustand | ^5.x | Client state management | Cart contents, auth token, locale preference; lightweight; no Redux |
| i18next | ^25.x | i18n core | Language detection, namespace support, JSON translation files |
| react-i18next | ^16.x | React i18n bindings | `useTranslation` hook, `<Trans>` component, `i18n.dir()` for RTL detection |
| i18next-browser-languagedetector | ^8.x | Browser language detection | Detects from localStorage → navigator → htmlTag in configured order |
| react-hook-form | ^7.x | Form state management | Zero re-render; pairs with Zod resolver |
| zod | ^3.x | Schema validation | Form validation + TypeScript types from one definition |
| dayjs | ^1.x | Date formatting | 2KB; Arabic locale support; replaces moment.js |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| spatie/laravel-permission v6 | v7 | v7 requires PHP 8.4; v6 is correct for PHP 8.2/8.3 on this project |
| Bearer token auth (Sanctum) | Cookie-based Sanctum SPA auth | Cookie mode requires shared domain; bearer token works across any origin; simpler for dev/staging |
| react-router library mode | react-router framework mode | Framework mode adds SSR/file-based routing — unnecessary for a Vite SPA; library mode with `createBrowserRouter` is correct |
| i18next-http-backend (lazy load) | Preload all 3 locale files at bundle time | Lazy loading avoids FOUC on first AR/EN load; but at ~30KB total (3 locales × 10KB), preloading all at init is acceptable and simpler |
| @emotion/cache + stylis-plugin-rtl | styled-components + StyleSheetManager | MUI v7 uses Emotion; switching to styled-components would require full MUI style system overhaul |

**Installation — Backend:**
```bash
# Create project
composer create-project laravel/laravel trotinette-api
cd trotinette-api

# Install API scaffolding (installs Sanctum, creates routes/api.php)
php artisan install:api

# RBAC (use v6 for PHP 8.2/8.3)
composer require spatie/laravel-permission

# Dev tools only
composer require --dev laravel/telescope barryvdh/laravel-debugbar

# Code style (ships with Laravel 12 but explicit is fine)
composer require --dev laravel/pint
```

**Installation — Frontend:**
```bash
# Create project with Vite + React + TypeScript
npm create vite@latest trotinette-frontend -- --template react-ts
cd trotinette-frontend

# MUI + RTL support
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @mui/stylis-plugin-rtl @emotion/cache stylis

# Routing
npm install react-router

# HTTP client
npm install axios

# Server state
npm install @tanstack/react-query @tanstack/react-query-devtools

# Client state
npm install zustand

# i18n
npm install i18next react-i18next i18next-browser-languagedetector

# Forms + validation
npm install react-hook-form @hookform/resolvers zod

# Date formatting
npm install dayjs

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/user-event
```

---

## Architecture Patterns

### Recommended Project Structure — Backend

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/                     # Admin-scoped controllers (thin)
│   │   └── Customer/                  # Customer-scoped controllers (thin)
│   ├── Middleware/
│   │   ├── SetLocale.php              # Reads Accept-Language header, calls app()->setLocale()
│   │   └── EnsureAdmin.php            # Restricts /admin/* routes to admin role
│   └── Requests/                      # One FormRequest per operation
├── Models/
│   ├── Product.php                    # Has JSON attributes column + HasTranslations
│   ├── ProductTranslation.php         # product_id, locale, name, description, slug
│   └── User.php                       # HasApiTokens + HasRoles
├── Services/
│   ├── ProductService.php             # CRUD + stock — all product business logic
│   └── AuthService.php                # Register, login, token issuance
├── Http/
│   └── Resources/                     # One JsonResource per model (contract)
└── ...

routes/
├── api.php                            # All API routes (Sanctum protected)
└── web.php                            # Single catch-all → React SPA

database/
└── migrations/
    ├── 0001_01_01_000000_create_users_table.php        # Default Laravel
    ├── 2024_xx_xx_create_products_table.php            # products + JSON attributes
    ├── 2024_xx_xx_create_product_translations_table.php # translations pattern
    └── 2024_xx_xx_create_delivery_zones_table.php      # city + fee (empty, seeded in Phase 2)
```

### Recommended Project Structure — Frontend

```
src/
├── app/
│   ├── router.tsx          # createBrowserRouter — /admin/* vs /*
│   ├── i18n.ts             # i18next init: LanguageDetector + FR/AR/EN resources
│   ├── theme.ts            # createTheme factory (direction param)
│   └── queryClient.ts      # new QueryClient() with default options
│
├── shared/
│   ├── api/
│   │   └── client.ts       # axios instance with interceptors (auth + Accept-Language)
│   ├── components/
│   │   ├── RTLProvider.tsx  # CacheProvider (muirtl/muiltr) + ThemeProvider + direction sync
│   │   └── LanguageSwitcher.tsx  # Calls useLanguage() hook
│   ├── hooks/
│   │   └── useLanguage.ts  # Atomically updates i18n + document.dir + html lang attr
│   └── utils/
│       └── formatCurrency.ts  # Intl.NumberFormat('ar-MA-u-nu-latn')
│
├── locales/
│   ├── fr/translation.json
│   ├── ar/translation.json
│   └── en/translation.json
│
├── features/
│   └── auth/
│       ├── store.ts         # Zustand auth store with persist middleware
│       └── api.ts           # login/register/logout API calls
│
└── main.tsx                 # RTLProvider > QueryClientProvider > RouterProvider
```

### Pattern 1: Laravel — Thin Controller, Service Injection

**What:** Controllers handle HTTP only (read request, delegate to Service, return Resource). Zero business logic in controllers.
**When to use:** Every API endpoint that does more than a single query.
**Example:**
```php
// Source: Laravel 12.x official docs pattern + project architecture decision
// app/Http/Controllers/Customer/AuthController.php
class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login(
            email: $request->validated('email'),
            password: $request->validated('password'),
        );

        return response()->json([
            'token' => $result->plainTextToken,
            'user'  => new UserResource($result->user),
        ]);
    }
}

// app/Services/AuthService.php
class AuthService
{
    public function login(string $email, string $password): object
    {
        $user = User::where('email', $email)->firstOrFail();

        if (! Hash::check($password, $user->password)) {
            throw new AuthenticationException();
        }

        return (object) [
            'plainTextToken' => $user->createToken('api')->plainTextToken,
            'user'           => $user,
        ];
    }
}
```

### Pattern 2: Sanctum Bearer Token — Routes and Middleware

**What:** All API routes protected with `auth:sanctum` middleware. Spatie role middleware registered in `bootstrap/app.php`.
**When to use:** Every route that requires authentication.
**Example:**
```php
// Source: https://laravel.com/docs/12.x/sanctum
// routes/api.php
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);

    // Admin-only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('products', Admin\ProductController::class);
        Route::apiResource('orders', Admin\OrderController::class);
    });
});

// app/Models/User.php
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
}

// bootstrap/app.php — register spatie middleware aliases
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
    ]);
})
```

### Pattern 3: SetLocale Middleware (Laravel)

**What:** Reads the `Accept-Language` header from every API request and calls `app()->setLocale()`. This drives translated validation error messages and any server-side localized content.
**When to use:** Register in the `api` middleware group so it runs on every API request.
**Example:**
```php
// Source: https://laravel.com/docs/12.x/localization + LaravelDaily pattern
// app/Http/Middleware/SetLocale.php
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = ['fr', 'ar', 'en'];
        $locale    = $request->getPreferredLanguage($supported) ?? config('app.locale');
        app()->setLocale($locale);
        return $next($request);
    }
}

// bootstrap/app.php — append to api middleware group
->withMiddleware(function (Middleware $middleware): void {
    $middleware->appendToGroup('api', SetLocale::class);
})
```

### Pattern 4: Translation-Ready DB Schema

**What:** Main table holds non-translatable columns; a `_translations` sibling table holds one row per locale per entity.
**When to use:** Any model with user-facing text content (products, categories, delivery zones).
**Example:**
```php
// Source: Project research PITFALLS.md + database i18n best practices
// database/migrations/..._create_products_table.php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('sku')->unique();
    $table->unsignedBigInteger('price');          // stored in centimes
    $table->unsignedInteger('stock_quantity')->default(0);
    $table->json('attributes')->nullable();       // { "motor_power": "500W", "range_km": 40 }
    $table->foreignId('category_id')->constrained();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

// database/migrations/..._create_product_translations_table.php
Schema::create('product_translations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->cascadeOnDelete();
    $table->string('locale', 5);                 // 'fr', 'ar', 'en'
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('slug')->unique();
    $table->timestamps();
    $table->unique(['product_id', 'locale']);     // one translation per locale per product
    $table->index('locale');
});
```

### Pattern 5: RTLProvider — Synchronized RTL/LTR Switching

**What:** Wraps the entire React app. Creates two Emotion caches (one with `rtlPlugin`, one without), swaps them and the MUI theme direction atomically when the locale changes. Sets `document.dir` and `<html lang>`.
**When to use:** Applied once at app root in `main.tsx`. All portal components (Dialog, Drawer) automatically pick up `direction: 'rtl'` from the ThemeProvider.
**Example:**
```typescript
// Source: https://mui.com/material-ui/customization/right-to-left/ (official MUI docs)
// src/shared/components/RTLProvider.tsx
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Create caches ONCE outside the component to avoid recreation on every render
// This is critical — see MUI GitHub issue #33892
const rtlCache = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });
const ltrCache = createCache({ key: 'muiltr', stylisPlugins: [prefixer] });

interface RTLProviderProps {
  children: React.ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Synchronize document-level direction on every locale change
  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  const theme = useMemo(
    () => createTheme({ direction: isRTL ? 'rtl' : 'ltr' }),
    [isRTL]
  );

  return (
    <CacheProvider value={isRTL ? rtlCache : ltrCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
```

### Pattern 6: i18next Initialization

**What:** Initializes i18next with browser language detection, preloaded FR/AR/EN resources, and `fr` as fallback. No HTTP backend needed — all locale files preloaded at bundle time to avoid FOUC.
**When to use:** Created once in `src/app/i18n.ts`, imported in `main.tsx` before ReactDOM.render.
**Example:**
```typescript
// Source: https://react.i18next.com/latest/using-with-hooks + i18next-browser-languagedetector docs
// src/app/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import frTranslations from '../locales/fr/translation.json';
import arTranslations from '../locales/ar/translation.json';
import enTranslations from '../locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frTranslations },
      ar: { translation: arTranslations },
      en: { translation: enTranslations },
    },
    fallbackLng: 'fr',           // French is primary commercial language in Morocco
    supportedLngs: ['fr', 'ar', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### Pattern 7: useLanguage Hook — Atomic Language Switching

**What:** Single hook that synchronizes ALL five concerns atomically on language change: i18n locale, localStorage, document.dir, HTML lang attribute, and triggers RTLProvider re-render via i18n state.
**When to use:** Used exclusively by LanguageSwitcher. Never call `i18n.changeLanguage()` directly in components.
**Example:**
```typescript
// src/shared/hooks/useLanguage.ts
import { useTranslation } from 'react-i18next';

type SupportedLocale = 'fr' | 'ar' | 'en';

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = async (locale: SupportedLocale) => {
    await i18n.changeLanguage(locale);
    // document.dir and html lang are handled by RTLProvider's useEffect
    // i18n.changeLanguage() triggers RTLProvider re-render via useTranslation
  };

  return {
    currentLocale: i18n.language as SupportedLocale,
    isRTL: i18n.language === 'ar',
    changeLanguage,
  };
}
```

### Pattern 8: Axios Client with Auth and Accept-Language Headers

**What:** Single Axios instance with request interceptors that inject `Authorization: Bearer <token>` from Zustand store and `Accept-Language: <currentLocale>` from i18next on every outbound request.
**When to use:** All API calls use this instance. Never use `axios.get()` directly — always use `apiClient.get()`.
**Example:**
```typescript
// Source: Axios interceptor pattern (multiple verified sources)
// src/shared/api/client.ts
import axios from 'axios';
import i18n from '../app/i18n';
import { useAuthStore } from '../features/auth/store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  // Auth header — read from Zustand store (not directly from localStorage)
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Locale header — Laravel SetLocale middleware reads this
  config.headers['Accept-Language'] = i18n.language ?? 'fr';

  return config;
});

// 401 handler — clear auth and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Pattern 9: Zustand Auth Store with Persist

**What:** Stores the Sanctum bearer token and user object in memory, persisted to localStorage. Provides `clearAuth` for 401 response handling.
**When to use:** Token read by Axios interceptor via `useAuthStore.getState()` (non-hook access, safe in interceptors).
**Example:**
```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
// src/features/auth/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Pattern 10: formatCurrency Utility

**What:** Single utility function for all price display across all three locales. Forces Latin numerals (Western Arabic digits) for Morocco market convention using `nu-latn` Unicode extension.
**When to use:** Every price display in the app. Never inline `Intl.NumberFormat` calls in components.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
// src/shared/utils/formatCurrency.ts

/**
 * Formats a price in MAD for Moroccan market.
 * IMPORTANT: Uses 'ar-MA-u-nu-latn' to force Latin numerals.
 * Moroccan users expect Western digits (1234), not Eastern (١٢٣٤).
 *
 * @param amountInCentimes - Price stored as integer centimes (e.g., 249900 = 2499.00 MAD)
 * @returns Formatted string e.g. "2 499,00 MAD" in all locales
 */
export function formatCurrency(amountInCentimes: number): string {
  const amount = amountInCentimes / 100;

  return new Intl.NumberFormat('ar-MA-u-nu-latn', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Usage: formatCurrency(150000) → "1 500,00 MAD"
```

### Anti-Patterns to Avoid

- **Cache recreation on every render:** Creating `rtlCache` and `ltrCache` inside the RTLProvider function body causes Emotion to re-inject all styles on every render. Create cache instances once outside the component (at module level) — verified in MUI GitHub issue #33892.
- **Missing LTR CacheProvider:** Removing `CacheProvider` entirely for LTR and only wrapping with it for RTL causes render thrashing as Emotion switches context. Always keep both caches; swap the value prop.
- **Physical CSS properties:** Writing `padding-left`, `margin-right`, `text-align: left` in custom CSS. These are not flipped by `stylis-plugin-rtl`. Use `padding-inline-start`, `margin-inline-end`, `text-align: start` from line 1.
- **Business logic in controllers:** Any controller method longer than ~30 lines is a warning sign. All business logic (more than a single DB call) belongs in a Service class.
- **Raw Eloquent in API responses:** `return $product;` or `return Product::all();` leaks internal fields. Every model response must go through a Resource class.
- **i18n.changeLanguage() directly in components:** This updates i18next but does not guarantee the document.dir, html lang, or TanStack Query cache headers are synchronized. Always go through the `useLanguage` hook.
- **Deep MUI imports:** `import createTheme from '@mui/material/styles/createTheme'` no longer works in MUI v7. Use `import { createTheme } from '@mui/material/styles'`.
- **react-router-dom in v7:** The package no longer exists separately; import from `react-router` only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bearer token API auth | Custom JWT middleware | Laravel Sanctum + `HasApiTokens` | Sanctum handles token hashing, revocation, abilities, and guard registration; edge cases in JWT are many |
| RBAC (role-based access) | `if ($user->role === 'admin')` checks | spatie/laravel-permission | Permission cache, middleware aliases, blade directives, policy integration; 22M+ downloads |
| RTL CSS transformation | Custom `dir`-prefixed CSS rules | `@mui/stylis-plugin-rtl` in CacheProvider | stylis-plugin handles all MUI generated CSS including logical shorthand edge cases; manual approach misses dozens of component internals |
| Language detection in browser | Custom `navigator.languages` parsing | `i18next-browser-languagedetector` | Handles localStorage, navigator, htmlTag, querystring, cookie; correct BCP-47 locale parsing; fallback chain |
| Server state (API data) caching | `useEffect + useState + loading/error state` per hook | TanStack Query v5 | Deduplication, background refetch, stale-while-revalidate, devtools, optimistic updates — all built-in |
| Client state persistence | Custom localStorage serialization | Zustand `persist` middleware | Handles serialization, hydration timing, version migration, and partial state persistence |
| Currency formatting | Custom string formatting | `Intl.NumberFormat('ar-MA-u-nu-latn')` | Correct grouping separators, decimal separators, currency symbol placement vary by locale; browser-native, no bundle cost |

**Key insight:** Every item in this list has edge cases that are invisible until you hit them in production. Library authors have already solved those edge cases; re-solving them in custom code costs time and introduces bugs that are hard to reproduce.

---

## Common Pitfalls

### Pitfall 1: Emotion Cache Created Inside Component (Performance Killer)

**What goes wrong:** If `createCache()` is called inside the RTLProvider function body, a new Emotion cache is created on every render. Emotion re-injects all CSS rules into the DOM on every re-render, causing visible style flicker and exponential DOM size growth with each re-render cycle.
**Why it happens:** Developers follow intuition: "create the cache near the code that uses it." The component body feels like the right place.
**How to avoid:** Declare `rtlCache` and `ltrCache` as module-level constants OUTSIDE the component function. Only swap the `value` prop of `CacheProvider` based on locale.
**Warning signs:** Profiling shows style injections on every keystroke or state change; MUI GitHub issue #33892 references this exact problem.

### Pitfall 2: Portal Components Not Inheriting dir

**What goes wrong:** Setting `document.dir = 'rtl'` and MUI `direction: 'rtl'` flips the main app content but Dialog, Drawer, Menu, Tooltip, Popover, and other portal-based components render in the document body, outside the themed div. Without the `direction: 'rtl'` in the ThemeProvider (which IS applied globally), these components get incorrect padding/margin/arrow directions.
**Why it happens:** Developers test RTL on simple div-based layouts, which work. Portal components are discovered broken after the UI is built.
**How to avoid:** The ThemeProvider with `direction: 'rtl'` IS the correct fix for portals — they read the MUI theme context even when rendered outside the DOM tree. Ensure the ThemeProvider wraps the entire app in RTLProvider, not just the page content. Test with a Dialog and Drawer opened in Arabic locale immediately after wiring RTLProvider.
**Warning signs:** Dialog close button appears on wrong side; Drawer slides in from wrong edge; Tooltip arrow points wrong direction.

### Pitfall 3: Sanctum Bearer Token CORS Misconfiguration

**What goes wrong:** Laravel API on `localhost:8000` and React dev server on `localhost:5173`. All authenticated API calls fail with `401 Unauthorized` or CORS errors even though login appears to succeed.
**Why it happens:** In Laravel 12, the CORS configuration and Sanctum stateful domains default does not include common Vite dev server ports. The `cors.php` must be published and configured; `supports_credentials` is `false` by default.
**How to avoid:**
- Run `php artisan config:publish cors` (Laravel 12 way)
- Set `SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000` in `.env`
- Set `SESSION_DOMAIN=localhost` in `.env`
- For bearer token (not cookie) auth: CORS origin must allow `http://localhost:5173`; `supports_credentials` is only needed for cookie mode
- Test with `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/user` before building any frontend

**Warning signs:** 401 immediately after login; CORS preflight errors in browser console; `axios` request succeeds but response is 401.

### Pitfall 4: i18next Loaded Before React Renders (FOUC)

**What goes wrong:** Page renders briefly in the wrong language before i18next finishes loading translation files, causing a flash of translation key names (`"auth.login"` visible for 100ms) or the wrong language.
**Why it happens:** i18next `init` is async; if the React tree renders before `init` resolves, components read a partially-initialized i18n instance.
**How to avoid:** Import `src/app/i18n.ts` at the top of `main.tsx` before `ReactDOM.createRoot`. When using preloaded resources (no HTTP backend), `init` resolves synchronously. Verify by wrapping the app in `<Suspense fallback={<div>Loading...</div>}>` — if fallback is never visible, init is synchronous.
**Warning signs:** Translation keys visible as strings in the UI on first load; language mismatch between localStorage and displayed language; brief English text before Arabic loads.

### Pitfall 5: Spatie Permission Cache Not Cleared During Development

**What goes wrong:** After changing a user's role or adding a role in a seeder, the role/permission check still uses cached values. A user assigned `admin` role still gets `403` responses because the permission cache was not cleared.
**Why it happens:** spatie/laravel-permission caches all role/permission data in Laravel's default cache driver. This is the correct behavior for production but confusing during development.
**How to avoid:** Call `php artisan permission:cache-reset` after running seeders or role migrations during development. In test setup, call `\Spatie\Permission\PermissionRegistrar::class` to reset the cache between test cases.
**Warning signs:** Seeded admin user gets 403 on admin routes; role assignment appears in DB but middleware denies access.

### Pitfall 6: MUI v7 Deep Import Paths Removed

**What goes wrong:** Code that previously imported from deep paths like `@mui/material/styles/createTheme` or `@mui/material/Button/Button` throws a module resolution error in MUI v7 because the package layout changed to use Node.js `exports` field which blocks deep imports.
**Why it happens:** MUI v7 is a breaking change; documentation examples from v5/v6 use deep import paths. Copy-pasting from older StackOverflow answers or blogs will fail.
**How to avoid:** Always import from the barrel exports: `import { createTheme, ThemeProvider } from '@mui/material/styles'` and `import { Button } from '@mui/material'`. Never import more than one level deep.
**Warning signs:** `Module not found: Error: Package path .../foo is not exported from package` errors at build time.

### Pitfall 7: React Router v7 Package Name Change

**What goes wrong:** Installing `react-router-dom` (the v5/v6 package name) instead of `react-router` (the v7 unified package). This installs an older version and `createBrowserRouter` and other v7 APIs are not available.
**Why it happens:** `react-router-dom` was the correct package for browser apps for years; the rename in v7 is a breaking change many developers are unaware of.
**How to avoid:** Install `react-router` only. All browser APIs (`BrowserRouter`, `createBrowserRouter`, `Link`, `useNavigate`, etc.) are now in `react-router`. If `react-router-dom` appears in `package.json`, remove it.
**Warning signs:** TypeScript errors saying `RouterProvider` does not exist in `react-router-dom`; `createBrowserRouter` import fails.

---

## Code Examples

Verified patterns from official sources:

### Sanctum Token Issuance and Route Protection

```php
// Source: https://laravel.com/docs/12.x/sanctum
// Issuing a token on login
$token = $user->createToken('api-token')->plainTextToken;
// Returns: "1|abc123..." — send this as Authorization: Bearer 1|abc123...

// Protecting a route
Route::get('/user', fn(Request $r) => new UserResource($r->user()))
    ->middleware('auth:sanctum');

// Revoking the current token (logout)
$request->user()->currentAccessToken()->delete();
```

### spatie/laravel-permission — Seeding Roles

```php
// Source: spatie/laravel-permission v6 docs
// database/seeders/RoleSeeder.php
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles (idempotent — firstOrCreate)
        Role::firstOrCreate(['name' => 'admin',    'guard_name' => 'sanctum']);
        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'sanctum']);
    }
}

// Assign role to user
$user->assignRole('admin');

// Check role in middleware (spatie alias)
// Route::middleware(['auth:sanctum', 'role:admin'])->group(...)
```

> **IMPORTANT:** When using Sanctum bearer token auth (not session guard), the guard name for spatie roles must be `'sanctum'` (not `'web'`). Create roles with `guard_name: 'sanctum'` and set `auth.defaults.guard` appropriately, or configure `$this->guard()` in the User model. Verify this in an integration test before building any admin routes.

### TanStack Query Provider Setup

```typescript
// Source: https://tanstack.com/query/v5/docs/framework/react/overview
// src/app/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,
    },
  },
});

// src/main.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './app/queryClient';
import './app/i18n';  // Init i18next BEFORE render

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RTLProvider>
        <RouterProvider router={router} />
      </RTLProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### React Router v7 — Library Mode Setup

```typescript
// Source: https://reactrouter.com/api/data-routers/createBrowserRouter
// src/app/router.tsx
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <CatalogPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,   // Route guard inside AdminLayout
    children: [
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
    ],
  },
]);
```

### Intl.NumberFormat — MAD Formatting Verification

```typescript
// Verify output in browser console before shipping:
new Intl.NumberFormat('ar-MA-u-nu-latn', {
  style: 'currency',
  currency: 'MAD',
}).format(1500);
// Expected: "1 500,00 MAD"  (Latin digits, MAD suffix, space grouping separator)
// NOT: "١٥٠٠٫٠٠ درهم"  (Eastern Arabic numerals, Arabic label) — wrong for Morocco market
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-router-dom` (browser-specific package) | `react-router` (unified package) | React Router v7 (Nov 2024) | Must install `react-router`, not `react-router-dom` |
| Laravel `Kernel.php` for middleware | `bootstrap/app.php` `->withMiddleware()` | Laravel 11 (2024) | No more Http/Kernel.php; all middleware registration in bootstrap/app.php |
| `php artisan config:publish cors` needed | `config/cors.php` not published by default | Laravel 12 | Must run `php artisan config:publish cors` to customize CORS settings |
| MUI deep imports (`@mui/material/styles/createTheme`) | Barrel imports only (`@mui/material/styles`) | MUI v7 | Deep import paths removed; must use top-level package exports |
| `createMuiTheme` | `createTheme` | MUI v5+ | `createMuiTheme` removed in MUI v7 |
| spatie/laravel-permission `Middlewares` (plural) | `Middleware` (singular) | v6 | Namespace change in v6; prior-v6 code will fail |

**Deprecated/outdated:**
- `react-router-dom`: Replaced by `react-router` in v7. Do not install.
- `stylis-plugin-rtl` (non-MUI fork): The MUI team publishes their own fork as `@mui/stylis-plugin-rtl` that fixes CSS layer issues. Use `@mui/stylis-plugin-rtl`, not the original `stylis-plugin-rtl`.
- Laravel `app/Http/Kernel.php` middleware registration: Replaced by `bootstrap/app.php` `->withMiddleware()` since Laravel 11.
- `moment.js`: Use `dayjs` instead (2KB vs 67KB, same API, Arabic locale support).

---

## Open Questions

1. **Spatie guard name with Sanctum bearer tokens**
   - What we know: spatie/laravel-permission requires roles to be scoped to a guard name. When using Sanctum bearer tokens, the guard resolves as `sanctum`, not `web`.
   - What's unclear: Whether creating roles with `guard_name: 'sanctum'` is sufficient, or whether `config/auth.php` defaults.guard must also be changed to `sanctum`.
   - Recommendation: Test this immediately after setting up both Sanctum and spatie in Phase 1. Create a test route: `Route::middleware(['auth:sanctum', 'role:admin'])` and verify that a seeded admin user with the `sanctum` guard can access it. If it fails, set `'defaults' => ['guard' => 'sanctum']` in `config/auth.php`. Several community sources report this as a frequent gotcha.

2. **MUI v7 RTL — any changes from v5/v6 RTL setup**
   - What we know: The official MUI RTL docs show the same `@emotion/cache` + `CacheProvider` + `stylis-plugin-rtl` pattern as v5. The v7 migration guide mentions ThemeProvider updates but nothing RTL-specific.
   - What's unclear: Whether MUI v7's new ThemeProvider features (CSS variables, `forceThemeRerender` prop) interact with the RTL cache-swap pattern.
   - Recommendation: Use the documented pattern verbatim (Pattern 5 above). If CSS variables are needed for dark mode support in a later phase, investigate interaction at that point. Do not use CSS vars provider in Phase 1 — adds complexity.

3. **i18next-browser-languagedetector `fr-MA` vs `fr` matching**
   - What we know: Browser navigator.language may return `fr-MA`, `fr-FR`, `ar-MA`, `ar` etc. i18next normalizes these via `cleanCode` but the exact behavior depends on the `convertDetectedLanguage` option.
   - What's unclear: Whether `ar-MA` from navigator maps correctly to the `ar` key in the resources object, or whether a `convertDetectedLanguage` function is needed.
   - Recommendation: Set `supportedLngs: ['fr', 'ar', 'en']` and `nonExplicitSupportedLngs: true` in i18next init. The `nonExplicitSupportedLngs` option tells i18next that `fr-MA` should match `fr`, and `ar-MA` should match `ar`. Test with browser set to `ar-MA` locale.

---

## Sources

### Primary (HIGH confidence)

- [Laravel 12.x Sanctum Docs](https://laravel.com/docs/12.x/sanctum) — bearer token mode, `install:api` command, `HasApiTokens` trait, route protection, token abilities
- [MUI Right-to-Left Support (official)](https://mui.com/material-ui/customization/right-to-left/) — three-step RTL setup, CacheProvider with createCache + rtlPlugin, portal component caveat, `/* @noflip */` directive
- [MUI GitHub Issue #33892](https://github.com/mui/material-ui/issues/33892) — LTR cache must be kept (not removed); empty cache vs absent CacheProvider behavior
- [MUI Upgrade to v7 guide](https://mui.com/material-ui/migration/upgrade-to-v7/) — deep import removal, `createMuiTheme` removal, ThemeProvider changes
- [spatie/laravel-permission v6 Installation](https://spatie.be/docs/laravel-permission/v6/installation-laravel) — composer install, publish + migrate, HasRoles trait, cache reset
- [spatie/laravel-permission Middleware docs](https://spatie.be/docs/laravel-permission/v6/basic-usage/middleware) — bootstrap/app.php alias registration (singular `Middleware` namespace in v6)
- [react-i18next Step by Step Guide](https://react.i18next.com/latest/using-with-hooks) — i18n.ts init file, useTranslation hook, i18n.changeLanguage()
- [i18next-browser-languagedetector GitHub](https://github.com/i18next/i18next-browser-languageDetector) — detection order config, caches, lookupLocalStorage key
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — `nu-latn` extension, `ar-MA-u-nu-latn` locale string
- [TanStack Query v5 Overview](https://tanstack.com/query/v5/docs/framework/react/overview) — QueryClient setup, QueryClientProvider, TypeScript support
- [Zustand persist middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) — persist + createJSONStorage, partialize, TypeScript generic syntax
- [React Router v7 createBrowserRouter](https://reactrouter.com/api/data-routers/createBrowserRouter) — library mode setup, unified `react-router` package
- [Laravel 12.x Localization](https://laravel.com/docs/12.x/localization) — app()->setLocale(), fallback locale, APP_FALLBACK_LOCALE

### Secondary (MEDIUM confidence)

- [LaravelDaily: Set Laravel User Locale in Middleware](https://laraveldaily.com/post/set-laravel-user-locale-middleware) — SetLocale middleware pattern with getPreferredLanguage()
- [Itay Perry Medium: Toggle Theme-Mode and Direction in MUI](https://medium.com/@itayperry91/react-and-mui-change-muis-theme-mode-direction-and-language-including-date-pickers-ad8e91af30ae) — verified RTLProvider implementation pattern
- WebSearch: spatie/laravel-permission v6 guard_name for Sanctum — community consensus on `sanctum` guard name requirement (multiple corroborating sources, LOW→MEDIUM due to volume)
- WebSearch: React Router v7 package name change (`react-router` vs `react-router-dom`) — confirmed by official docs and multiple sources (HIGH confidence, but listing here for attribution)

### Tertiary (LOW confidence — validate during implementation)

- WebSearch: `nonExplicitSupportedLngs` behavior with `ar-MA` locale — single source, needs verification during implementation
- WebSearch: MUI v7 CSS variables provider + RTL interaction — not found in official docs; flagged as unknown

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all library versions verified against official docs and package registries; version compatibility matrix confirmed
- Architecture: HIGH — patterns sourced directly from official Laravel 12, MUI v7, react-i18next, TanStack Query v5 documentation
- Pitfalls: HIGH for RTL/Emotion and Sanctum patterns (official docs + confirmed GitHub issues); MEDIUM for spatie guard name issue (community consensus, multiple corroborating sources)
- Code examples: HIGH — all examples derived from official documentation; open question on spatie guard name flagged explicitly

**Research date:** 2026-02-13
**Valid until:** 2026-03-13 (30 days — stable libraries; React Router v7, MUI v7, and Laravel 12 are in active maintenance with no imminent breaking releases)
