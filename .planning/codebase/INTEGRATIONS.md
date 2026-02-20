# External Integrations

**Analysis Date:** 2026-02-20

## APIs & External Services

**WhatsApp Integration:**
- WhatsApp Web messaging link
  - Used in: `trotinette-frontend/src/features/catalog/components/WhatsAppButton.tsx`, `TrustSignals.tsx`, `OrderConfirmationPage.tsx`
  - Config: `VITE_WHATSAPP_NUMBER` environment variable
  - Default: `212600000000` (Morocco number fallback)
  - Purpose: Customer support messaging widget

**Internal API:**
- Backend REST API
  - Base URL: configured via `VITE_API_URL` (frontend) or `APP_URL` (backend)
  - Default dev: `http://localhost:8000/api`
  - Protocol: HTTP with JSON
  - Authentication: Bearer token (Sanctum)

## Data Storage

**Databases:**
- MySQL (primary)
  - Connection config: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
  - Default: `trotinette` database on localhost:3306
  - Client: Eloquent ORM (Laravel built-in)
  - Alternative: SQLite for development (file-based at `trotinette-api/database/database.sqlite`)

**File Storage:**
- Local filesystem (default)
  - Managed by Spatie Media Library
  - Disk: `public` (configured via `MEDIA_DISK`)
  - Location: `storage/app/public/`
  - Supports: JPEG, PNG, WebP (max 10MB per file)
  - Used for: Product images, user profiles
- AWS S3 (optional, configured but not enabled)
  - Config vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`, `AWS_DEFAULT_REGION`

**Caching:**
- Database (default)
  - Backed by database cache table
  - Alternative: Redis (configured at `REDIS_HOST:REDIS_PORT`)
  - Cache prefix customizable via `CACHE_PREFIX` env var

## Authentication & Identity

**Auth Provider:**
- Custom with Laravel Sanctum
  - Implementation: Bearer token API authentication
  - Token management: Personal access tokens stored in `personal_access_tokens` table
  - Guard: `sanctum` (configured in `trotinette-api/app/Models/User.php`)
  - Session auth also available (web guard)

**User Model:**
- Location: `trotinette-api/app/Models/User.php`
- Roles: admin, customer (managed via Spatie Permission package)
- Fields: id, name, email, phone, address_city, address_street, is_active, role

**Frontend Auth State:**
- Zustand store: `trotinette-frontend/src/features/auth/store.ts`
- Persisted to localStorage via zustand middleware
- Contains: token (bearer token), user object

**CORS:**
- Configured for development at `localhost:5173` (Vite dev server)
- Config file: `trotinette-api/config/cors.php`
- Allowed origins: `['http://localhost:5173']`
- Methods: all (`['*']`)
- Headers: all allowed

**Sanctum Configuration:**
- Stateful domains: `localhost:5173,localhost:8000`
- Config: `trotinette-api/config/sanctum.php`
- CSRF protection: enabled for stateful domains

## Monitoring & Observability

**Error Tracking:**
- Not detected - errors logged to standard Laravel logging

**Logs:**
- Backend: Laravel logging system
  - Driver: stack (configurable via `LOG_CHANNEL`)
  - Channels: single, daily (configured in `trotinette-api/config/logging.php`)
  - Level: debug (configurable via `LOG_LEVEL`)
- Frontend: Browser console (no external service)
- Log tailing: `laravel/pail` command available

## CI/CD & Deployment

**Hosting:**
- Not detected - likely manual deployment
- Suggested: Docker (Laravel Sail configured)

**CI Pipeline:**
- Not detected - no `.github/workflows` or similar

**Docker (Development):**
- Laravel Sail configured (`laravel/sail` package)
- Can run: `sail up` for containerized development

## Environment Configuration

**Required env vars (Backend):**
- Database: `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- App: `APP_KEY`, `APP_URL`, `APP_NAME`, `APP_ENV`
- Auth: `SANCTUM_STATEFUL_DOMAINS`, `FRONTEND_URL`
- File storage: `FILESYSTEM_DISK`
- Queue: `QUEUE_CONNECTION`
- Cache: `CACHE_STORE`

**Required env vars (Frontend):**
- `VITE_API_URL` - Backend API base URL
- `VITE_WHATSAPP_NUMBER` - WhatsApp contact number

**Secrets location:**
- Backend: `.env` file (Git-ignored, see `.gitignore`)
- Frontend: `.env` file in `trotinette-frontend/`
- No secrets vault detected (consider implementing)

## Webhooks & Callbacks

**Incoming:**
- Not detected - no webhook endpoints configured

**Outgoing:**
- Email notifications: Mail system configured (SMTP, log, or other drivers)
  - Default: log driver (logs to file in dev)
  - Switchable via `MAIL_MAILER` env var

## API Integration Details

**HTTP Client (Frontend):**
- Location: `trotinette-frontend/src/shared/api/client.ts`
- Library: axios 1.13.5
- Base URL: `VITE_API_URL` or `http://localhost:8000/api`
- Content-Type: application/json
- Interceptors:
  - Request: injects Authorization header with Bearer token
  - Request: injects Accept-Language header from i18n
  - Response: clears auth and redirects to login on 401 errors

**API Endpoints (from codebase exploration):**
- Admin routes:
  - `/admin/categories` - CRUD for product categories
  - `/admin/products` - CRUD for products (includes file upload)
  - `/admin/delivery-zones` - CRUD for delivery zones
  - `/admin/users` - User management
- Customer routes:
  - `/api/auth/register` - User registration
  - `/api/auth/login` - User login
  - `/api/auth/logout` - User logout
  - `/api/auth/profile` - Profile update
- Public routes:
  - `/api/orders` - Order creation and listing
  - `/api/products` - Product listing and search

**Form Data Handling:**
- Multipart/form-data for file uploads
- Content-Type header set dynamically for multipart
- Used in: product creation/update with images

## State Management

**Frontend:**
- Zustand stores:
  - Auth store: `trotinette-frontend/src/features/auth/store.ts` (persisted)
  - Cart store: `trotinette-frontend/src/features/cart/store.ts` (persisted)
- React Query: Server state caching with `@tanstack/react-query`
- localStorage: Auth token and user data persisted automatically

**Internationalization:**
- i18next 25.8.7
- Language detector: browser language + localStorage fallback
- Default: French (fr)
- Header injection: `Accept-Language` sent with all API requests

---

*Integration audit: 2026-02-20*
