# Technology Stack

**Analysis Date:** 2026-02-20

## Languages

**Primary:**
- PHP 8.2+ - Backend API (Laravel framework)
- TypeScript 5.9.3 - Frontend application (React)
- JavaScript - Build and tooling scripts

**Secondary:**
- SQL - Database queries via Eloquent ORM
- YAML/JSON - Configuration files

## Runtime

**Environment:**
- Node.js (version specified in frontend; Laravel uses PHP CLI)
- PHP 8.2+ for Laravel backend

**Package Manager:**
- Composer - PHP dependency management
- npm - JavaScript/Node dependency management (frontend and build tools)
- Lockfile: `composer.lock`, `package-lock.json`

## Frameworks

**Core:**
- Laravel 12.0 - PHP web framework and API backend (`trotinette-api/`)
- React 19.2.0 - Frontend UI framework (`trotinette-frontend/src/`)
- Vite 7.3.1 - Frontend build tool and dev server
- React Router 7.13.0 - Frontend routing

**Testing:**
- PHPUnit 11.5.3 - PHP unit testing (Laravel)
- Vitest 3.2.4 - JavaScript/TypeScript unit testing
- Testing Library (React, Jest DOM) 6.9.1 - React component testing

**Build/Dev:**
- Vite 7.3.1 - Frontend bundler and dev server
- Laravel Vite Plugin 2.0.0 - Bridge between Laravel and Vite
- TailwindCSS 4.0.0 - Utility-first CSS framework
- TypeScript 5.9.3 - Type checking for frontend

## Key Dependencies

**Frontend Critical:**
- axios 1.13.5 - HTTP client for API calls
- react-hook-form 7.71.1 - Form state management
- zod 4.3.6 - Runtime schema validation
- zustand 5.0.11 - Lightweight state management
- @tanstack/react-query 5.90.21 - Server state management
- i18next 25.8.7 - Internationalization framework
- @mui/material 7.3.8 - Material Design component library
- @emotion/react & styled 11.14.0, 11.14.1 - CSS-in-JS styling

**Frontend Dev:**
- @vitejs/plugin-react 5.1.1 - React fast refresh for Vite
- ESLint 9.39.1 - Code linting
- TypeScript ESLint 8.48.0 - TypeScript linting

**Backend Critical:**
- laravel/sanctum 4.3 - API token authentication
- spatie/laravel-medialibrary 11.20 - Media/file handling (images)
- spatie/laravel-permission 6 - Role-based access control
- spatie/laravel-query-builder 6.4 - Advanced query filtering
- laravel/tinker 2.10.1 - REPL for debugging

**Backend Dev:**
- laravel/pail 1.2.2 - Log tailing
- laravel/pint 1.27 - Code style fixer
- laravel/sail 1.41 - Docker dev environment
- mockery/mockery 1.6 - Mocking library for tests
- fakerphp/faker 1.23 - Fake data generation

## Configuration

**Environment:**
- Backend: `.env.example` → `.env` (configured via `composer.json` setup script)
- Frontend: `.env` (Vite loads variables prefixed with `VITE_`)
- Critical env vars in `.env.example`:
  - `APP_KEY`, `APP_URL`, `DB_*` (database config)
  - `SANCTUM_STATEFUL_DOMAINS`, `FRONTEND_URL`
  - `MAIL_*`, `QUEUE_CONNECTION`, `CACHE_STORE`
  - `VITE_API_URL` (frontend), `VITE_WHATSAPP_NUMBER`

**Build:**
- Frontend: `trotinette-frontend/vite.config.ts`
- Configured for React + TypeScript
- Test environment: jsdom with vitest
- Setup files: `trotinette-frontend/src/test/setup.ts`

**Linting/Formatting:**
- Frontend: `eslint.config.js` - JavaScript/TypeScript linting
- No `.prettierrc` detected; ESLint handles formatting

## Database

**Default:**
- MySQL (configured as `DB_CONNECTION=mysql` in `.env.example`)
- Alternative: SQLite (default fallback in `config/database.php`)
- Migrations: `trotinette-api/database/migrations/`
- Models: `trotinette-api/app/Models/`

**ORM:**
- Eloquent (Laravel built-in ORM)
- Query Builder: Spatie's laravel-query-builder wrapper

## Storage & Sessions

**File Storage:**
- Local filesystem (default via Media Library)
- Media disk: Spatie Media Library configured at `trotinette-api/config/media-library.php`
- Max file size: 10MB
- Supports: JPEG, PNG, WebP images

**Session:**
- Driver: database (configured in `.env.example`)
- Lifetime: 120 minutes
- Encryption: disabled for development

**Cache:**
- Store: database (default in `.env.example`)
- Alternative options: Redis, Memcached (configured but not default)

## Queue & Background Jobs

**Queue System:**
- Default driver: database (`QUEUE_CONNECTION=database`)
- Alternative options: Redis, Beanstalkd, SQS
- Failed job tracking: database table `failed_jobs`
- Media conversions queue: controlled by `QUEUE_CONVERSIONS_BY_DEFAULT`

**Mail:**
- Default mailer: log (for development)
- Alternative drivers: SMTP, SES, Postmark, Resend
- Configured via `MAIL_*` env vars

## Platform Requirements

**Development:**
- Node.js (npm required for frontend and build tasks)
- PHP 8.2+ (for Laravel)
- MySQL 5.7+ or SQLite (database)
- Composer (PHP dependency manager)
- Optional: Redis, Memcached (for caching/queues in production)

**Production:**
- Linux/Unix server with PHP 8.2+ support
- MySQL or PostgreSQL database
- Node.js for frontend build (or pre-built artifacts)
- Optional: Redis, Memcached, AWS S3 (for file storage)

---

*Stack analysis: 2026-02-20*
