# Stack Research

**Domain:** Local e-commerce — electric scooters, Morocco (Laravel API + React/MUI SPA)
**Researched:** 2026-02-12
**Confidence:** HIGH (core stack verified via official sources and multiple corroborating searches)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| PHP | ^8.2 (use 8.3+) | Server runtime | Laravel 12 requires 8.2+; 8.3 adds typed class constants and readonly classes that improve domain modeling; Laravel 13 will drop <8.3 anyway |
| Laravel | 12.x (12.50.0 current) | API backend framework | Actively maintained with bug fixes until Aug 2026, security until Feb 2027; PHP ecosystem standard for structured REST APIs; ships with Sanctum, Eloquent, queues, and media handling out of the box |
| React | 19.x (19.2.4 current) | Frontend UI library | Industry standard; Laravel 12 official starter kit ships with React 19 + TypeScript; concurrent rendering and Server Components reduce UI latency |
| TypeScript | 5.x | Type safety on frontend | Laravel 12 React starter kit ships with TypeScript; prevents an entire class of runtime bugs in API contract mismatches; required for maintainable multi-dev projects |
| Material UI (MUI) | 7.x (7.3.7 current) | React component library | Project specification; ships with built-in RTL support via `@mui/stylis-plugin-rtl`; CSS-in-JS (Emotion) means direction can be toggled per user locale without CSS rebuilds |
| Vite | 7.x (7.3.1 current) | Frontend build tool | Fastest HMR in class; Laravel 12 React starter kit uses Vite 7; native ESM means no bundling during dev — critical for productivity on a large admin panel |
| MySQL | 8.x | Relational database | Laravel's primary target; Eloquent ORM is designed around it; JSON columns for flexible product attributes (needed for generic product model); full-text search for product catalog |

### Authentication & Authorization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Laravel Sanctum | bundled with Laravel 12 | SPA token auth | First-party package, zero cost; SPA cookie-based auth means CSRF protection + XSS protection out of the box; `php artisan install:api` provisions it in one command. Use over Passport because this is a first-party SPA (no OAuth2 third-party grants needed) |
| spatie/laravel-permission | ^7.0 (requires PHP 8.4) / ^6.x (PHP 8.2-8.3) | RBAC for admin/customer/delivery roles | Standard Laravel RBAC package; 22M+ downloads; blade directives, middleware, and cache layer all built in; maps exactly to admin/customer/manager role model needed |

> **Note on spatie/laravel-permission v7:** Requires PHP ^8.4 and Laravel ^12. If staying on PHP 8.2/8.3 use v6.x (still maintained). Verify with `composer require spatie/laravel-permission` — Composer will pick the correct version.

### Supporting Libraries — Backend (Laravel/PHP)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| spatie/laravel-medialibrary | ^11.x (11.19.0 current) | Product image management | Attaches images to Eloquent models, auto-generates thumbnails and responsive variants; use for product photos and category images |
| spatie/laravel-query-builder | ^6.x | API filtering/sorting/pagination | Parses `?filter[name]=scooter&sort=-price&include=category` from URL parameters; eliminates hand-written filter logic in API controllers; critical for admin product list |
| spatie/laravel-sluggable | ^3.x | SEO-friendly product/category URLs | Auto-generates unique slugs from product names; handles collision with numeric suffix; trilingual products need slug per locale |
| laravel/telescope | ^5.x | Dev-time API debugging | Profiler for requests, queries, jobs, and exceptions; only in dev; remove from production |
| barryvdh/laravel-debugbar | ^3.x | Dev database query inspector | Complements Telescope for N+1 query detection during development |

### Supporting Libraries — Frontend (React)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | ^5.x (5.90.x current) | Server state management | Caches API responses, handles loading/error/refetch states, background invalidation; replaces hand-rolled `useEffect` + `useState` for every API call; use for all product, order, and user data fetching |
| zustand | ^5.x (5.0.11 current) | Client state management | Lightweight store for UI state (cart contents, current locale, drawer open state); use Zustand for local client state; do NOT use for data from the API (that's TanStack Query's job) |
| react-router | ^7.x (7.13.0 current) | Client-side routing | Unified package (replaces react-router-dom); v7 brings data loaders compatible with React 19; use for storefront routes + admin panel routes |
| axios | ^1.x (1.13.5 current) | HTTP client | Mature, interceptor-based; configure a single axios instance with base URL, auth token header injection, and 401 redirect; feeds TanStack Query `queryFn` functions |
| i18next | ^25.x (25.8.5 current) | i18n core | Language detection, namespace support, JSON translation files; industry standard |
| react-i18next | ^16.x (16.5.4 current) | React i18n bindings | Provides `useTranslation` hook and `<Trans>` component; pairs with `i18n.dir()` to dynamically set document direction for Arabic RTL vs French/English LTR |
| @mui/stylis-plugin-rtl | ^2.x | MUI RTL CSS transformation | Required to flip MUI CSS (padding, margin, border-radius, flex direction) for Arabic RTL; plug into Emotion CacheProvider at app root |
| @emotion/cache | ^11.x | Emotion cache factory | Needed alongside `@mui/stylis-plugin-rtl` to create separate LTR/RTL Emotion caches; swap cache on locale change |
| react-hook-form | ^7.x | Form state + validation | Zero re-render form library; pairs with `@hookform/resolvers` + Zod for schema validation; use for product creation/edit, checkout, address forms |
| zod | ^3.x | Schema validation | Validates form inputs AND API responses; defines shared types between form and API layer; use with react-hook-form resolver |
| dayjs | ^1.x | Date formatting | Minimal (2KB); supports Arabic locale and Jalali calendar if needed; use for order dates, delivery estimates |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite (with `@vitejs/plugin-react`) | Fast dev server + production build | Use `react-swc` variant for fastest compilation; config in `vite.config.ts` |
| ESLint + Prettier | Code style consistency | Laravel 12 React kit ships with ESLint config; add Prettier for formatting; prevents style debates in code review |
| PHP-CS-Fixer or Laravel Pint | PHP code style | Laravel Pint is Laravel's official code style tool (opinionated, ships with Laravel 12); run in CI |
| Pest PHP | PHP testing framework | Ships with Laravel 12; cleaner syntax than PHPUnit; use for feature tests on API endpoints |
| Vitest | Frontend unit testing | Same config as Vite; faster than Jest for Vite projects; use for testing utility functions, hooks |
| Laravel Telescope | API request inspector | Dev environment only; reveals slow queries and N+1 problems early |
| Docker / Laravel Sail | Local dev environment | Laravel Sail provides Docker-based local environment with MySQL, Redis; eliminates "works on my machine" for team dev |

---

## Installation

```bash
# === BACKEND (Laravel) ===
# Create project
composer create-project laravel/laravel trotinette-api
cd trotinette-api

# Install API scaffolding (installs Sanctum)
php artisan install:api

# Role-based access control
composer require spatie/laravel-permission

# Media / file management
composer require spatie/laravel-medialibrary

# API filtering, sorting, pagination
composer require spatie/laravel-query-builder

# Auto slugs for products/categories
composer require spatie/laravel-sluggable

# Dev tools (not in production)
composer require --dev laravel/telescope
composer require --dev barryvdh/laravel-debugbar

# Code style (run in CI)
composer require --dev laravel/pint

# Testing
# Pest is installed by default in Laravel 12


# === FRONTEND (React + MUI) ===
# Create project with Vite + React + TypeScript
npm create vite@latest trotinette-frontend -- --template react-ts
cd trotinette-frontend

# Core UI
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material

# RTL support for Arabic
npm install @mui/stylis-plugin-rtl @emotion/cache stylis

# Routing
npm install react-router

# HTTP client
npm install axios

# Server state (API data caching)
npm install @tanstack/react-query @tanstack/react-query-devtools

# Client state (UI state: cart, locale, etc.)
npm install zustand

# Internationalization (FR, AR, EN)
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend

# Forms + validation
npm install react-hook-form @hookform/resolvers zod

# Date formatting (Arabic-aware)
npm install dayjs

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/user-event
npm install -D eslint prettier
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Custom Laravel API (built from scratch) | Lunar (headless e-commerce package) | If you need a mature product catalog engine with variants, pricing tiers, taxes, and discounts out-of-the-box and accept losing control of the data model. For this project, Lunar adds complexity without benefit: no online payment, simple product model, Moroccan tax rules not built in, and admin needs to be custom anyway |
| Sanctum (token / SPA auth) | Passport (OAuth2) | Only if you need to expose an API to third-party developers (not the case here). Passport adds database tables, 3 new routes, and OAuth2 complexity for zero gain on a first-party SPA |
| Zustand (client state) | Redux Toolkit | For applications with deeply shared state across 50+ components or teams that need Redux DevTools time-travel debugging. Zustand achieves the same result with 90% less boilerplate |
| TanStack Query (server state) | SWR | SWR is lighter but lacks mutation support, optimistic updates, and devtools that TanStack Query provides. TanStack Query is the stronger choice for an admin panel that writes as much as it reads |
| React Router v7 | Tanstack Router | TanStack Router has excellent type safety, but React Router v7 is the ecosystem default, has better MUI integration examples, and is the path of least documentation friction |
| react-hook-form + Zod | Formik | Formik causes unnecessary full-form re-renders on every keystroke. react-hook-form is faster and Zod gives you a schema that serves as both validation and TypeScript type source |
| MUI v7 | Tailwind CSS + Radix | Tailwind requires building every component from scratch. MUI ships RTL, accessibility, and a complete admin-ready component set. Project spec locks in MUI — confirm before starting |
| Vite | Create React App (CRA) | CRA is officially deprecated. Do not use it. Vite is the current standard |
| MySQL 8 | PostgreSQL | PostgreSQL is more powerful but MySQL has better Laravel tooling documentation and simpler hosting on shared African/Moroccan VPS providers (cPanel, Hostinger). Switch to PostgreSQL if hosting allows it |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Laravel Passport | Full OAuth2 server complexity for a first-party SPA — no third-party clients will ever need OAuth tokens from this app | Laravel Sanctum |
| Create React App (CRA) | Officially deprecated by Meta in 2023; no longer maintained; slow dev server | Vite |
| GetCandy | Superseded by Lunar; no longer maintained as a standalone project | Lunar (if you want a package) or custom build |
| Redux (classic) | 3x more boilerplate than needed for this scope; no benefit over Zustand + TanStack Query | Zustand for client state, TanStack Query for server state |
| Inertia.js | Monorepo-coupling approach that blurs Laravel/React boundary; harder to build a separate mobile app later; unnecessary for a decoupled SPA + API architecture | Keep frontend/backend fully separate via REST API |
| axios v0.x | Contains security CVEs; v0.x is end-of-life | axios ^1.x |
| moment.js | 67KB, deprecated in favor of modern alternatives | dayjs (2KB, same API) |
| Babel (manual) | Vite uses esbuild/SWC internally — adding Babel manually causes double-transpilation slowness | Use `@vitejs/plugin-react-swc` |

---

## Stack Patterns by Variant

**For trilingual RTL (Arabic + French + English):**
- Use `i18next` with `i18next-browser-languagedetector` — detects browser locale automatically
- Store user's preferred language in `localStorage` + user profile (backend `users.locale` column)
- On locale change: swap `i18next` language AND swap Emotion cache (LTR cache for FR/EN, RTL cache for AR)
- Set `<html dir="rtl" lang="ar">` via `document.documentElement` — MUI picks this up via its theme `direction` property
- MUI Dialog, Drawer, Tooltip use React portals — these render outside the dir-attributed parent, so apply `dir` attribute directly to ThemeProvider's `theme.direction`, not just the HTML element

**For admin panel vs storefront:**
- Use a single React app with React Router v7 — admin routes under `/admin/*`, storefront under `/*`
- Protect admin routes with a route guard reading from the Zustand auth store
- Admin and storefront share the same TanStack Query cache — product edits in admin immediately invalidate storefront product queries

**For product images (media):**
- Use `spatie/laravel-medialibrary` on backend — define `thumbnail` and `product_card` conversions
- Store on local disk in development, S3-compatible storage (Backblaze B2 is cheapest) in production
- Frontend always requests the `product_card` conversion URL from the API response, never the original

**For delivery zone management:**
- Store zones as JSON polygons or as simple city/region strings in a `delivery_zones` table
- Do NOT integrate a maps API in Phase 1 — simple city dropdown is sufficient for Moroccan local delivery
- Validate zone on order creation in the backend controller, not the frontend

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Laravel 12.x | PHP ^8.2, ^8.3, ^8.4 | PHP 8.3+ recommended; Laravel 13 will require 8.3 minimum |
| MUI v7.x | React ^17, ^18, ^19 | React 19 fully supported; Emotion v11 required |
| @tanstack/react-query v5.x | React ^18, ^19 | React 18 concurrent features used internally; works with React 19 |
| react-router v7.x | React ^18, ^19 | v7 dropped React 17 support |
| spatie/laravel-permission v7.x | PHP ^8.4, Laravel ^12 | Use v6.x for PHP 8.2/8.3 |
| spatie/laravel-medialibrary v11.x | PHP ^8.2, Laravel ^10|^11|^12 | Requires Imagick or GD extension in PHP |
| zustand v5.x | React ^18, ^19 | Uses `useSyncExternalStore` — React 18 required |
| Vite 7.x | Node.js ^18, ^20 | Node 18 minimum; Node 20 LTS recommended |

---

## Sources

- [Laravel 12.x Release Notes](https://laravel.com/docs/12.x/releases) — confirmed version 12.50.0, PHP requirements (HIGH confidence)
- [Laravel Sanctum 12.x Docs](https://laravel.com/docs/12.x/sanctum) — SPA auth pattern, `install:api` command (HIGH confidence)
- [Material UI v7 announcement](https://mui.com/blog/material-ui-v7-is-here/) — v7.3.7 current, React 19 support (HIGH confidence)
- [MUI Right-to-left support](https://mui.com/material-ui/customization/right-to-left/) — RTL setup, `@mui/stylis-plugin-rtl`, portal gotcha (HIGH confidence)
- [TanStack Query v5 Docs](https://tanstack.com/query/v5/docs/framework/react/overview) — server state patterns (HIGH confidence)
- [React v19.2 blog post](https://react.dev/blog/2025/10/01/react-19-2) — version 19.2.4 current (HIGH confidence)
- [react-router changelog](https://reactrouter.com/changelog) — version 7.13.0 (HIGH confidence)
- [spatie/laravel-permission GitHub](https://github.com/spatie/laravel-permission) — v7.0 requires PHP 8.4; v6.x for 8.2/8.3 (HIGH confidence)
- [spatie/laravel-medialibrary Packagist](https://packagist.org/packages/spatie/laravel-medialibrary) — v11.19.0, Laravel 12 supported (HIGH confidence)
- WebSearch: Laravel Sanctum vs Passport comparison 2025 — Sanctum for first-party SPAs consensus (MEDIUM confidence, multiple corroborating sources)
- WebSearch: Zustand v5 vs Redux state management 2025 — Zustand recommended for most SaaS/admin (MEDIUM confidence)
- WebSearch: Lunar vs GetCandy — GetCandy superseded by Lunar (MEDIUM confidence)
- WebSearch: react-i18next 16.5.4, i18next 25.8.5, Vite 7.3.1, axios 1.13.5 — npm registry version data (MEDIUM confidence)

---
*Stack research for: Local e-commerce (electric scooters, Morocco) — Laravel 12 API + React 19 + MUI 7*
*Researched: 2026-02-12*
