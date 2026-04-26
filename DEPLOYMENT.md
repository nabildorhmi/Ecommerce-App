# Deployment Guide

## ⚠️ IMPORTANT: Vercel Limitations for Laravel

Vercel free plan **NOT ideal** for Laravel backend because:
- ❌ No persistent filesystem (file uploads lost on each deploy)
- ❌ No queue workers (background jobs won't run)
- ❌ Cold starts (slow first request)
- ❌ No MySQL included (need external DB)

## ✅ RECOMMENDED: Split Hosting

### Frontend → Vercel
### Backend → Railway/Render

---

## Option 1: Railway Backend + Vercel Frontend (RECOMMENDED)

### 1. Deploy Backend on Railway

1. Create account: https://railway.app
2. Create new project → Deploy from GitHub
3. Select `trotinette-api` folder
4. Add MySQL database (Railway marketplace)
5. Set environment variables:

```bash
APP_NAME=TrotinetteApp
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-backend.up.railway.app
APP_KEY=<generate with: php artisan key:generate --show>

DB_CONNECTION=mysql
DB_HOST=${{MYSQL.MYSQLHOST}}
DB_PORT=${{MYSQL.MYSQLPORT}}
DB_DATABASE=${{MYSQL.MYSQLDATABASE}}
DB_USERNAME=${{MYSQL.MYSQLUSER}}
DB_PASSWORD=${{MYSQL.MYSQLPASSWORD}}

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Frontend URL (will set after Vercel deploy)
FRONTEND_URL=https://your-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CORS_SUPPORTS_CREDENTIALS=true

# File storage (required for uploads)
# Option A: Cloudinary (free 25GB)
FILESYSTEM_DISK=cloudinary
CLOUDINARY_URL=cloudinary://key:secret@cloud_name

# Option B: AWS S3
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=

# Email (optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
```

6. Railway auto-deploys from Git

### 2. Deploy Frontend on Vercel

1. Create account: https://vercel.com
2. Import Git repository
3. Root directory: `trotinette-frontend`
4. Framework: Vite
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add environment variable:

```bash
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_APP_NAME=TrotinetteApp
```

8. Deploy

### 3. Update Backend CORS

After Vercel deploys, update Railway env vars:

```bash
FRONTEND_URL=https://your-actual-domain.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-actual-domain.vercel.app
CORS_ALLOWED_ORIGINS=https://your-actual-domain.vercel.app
```

---

## Option 2: Both on Vercel (NOT RECOMMENDED)

⚠️ **Major limitations:**
- File uploads won't persist (use Cloudinary/S3 required)
- No queue workers (real-time processing only)
- Slower cold starts
- More complex setup

### 1. External Services Required

**Database** (pick one):
- PlanetScale (MySQL, free tier)
- Neon (PostgreSQL, free tier)
- Supabase (PostgreSQL, free tier)

**File Storage** (required):
- Cloudinary (free 25GB)
- AWS S3
- DigitalOcean Spaces

### 2. Deploy Backend to Vercel

```bash
cd trotinette-api
vercel
```

Environment variables in Vercel dashboard:

```bash
APP_NAME=TrotinetteApp
APP_ENV=production
APP_DEBUG=false
APP_KEY=<generate>
APP_URL=https://your-api.vercel.app

# External MySQL (PlanetScale example)
DATABASE_URL=mysql://user:pass@host/db

# Must use cookie sessions for serverless
SESSION_DRIVER=cookie
CACHE_STORE=array
QUEUE_CONNECTION=sync

# File storage (Cloudinary required)
FILESYSTEM_DISK=cloudinary
CLOUDINARY_URL=cloudinary://key:secret@cloud_name

FRONTEND_URL=https://your-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 3. Update Laravel for Serverless

Update `config/database.php` to support `DATABASE_URL`:

```php
'mysql' => [
    'url' => env('DATABASE_URL'),
    // ... rest of config
],
```

Update `config/filesystems.php` to add Cloudinary:

```php
'disks' => [
    'cloudinary' => [
        'driver' => 'cloudinary',
        'url' => env('CLOUDINARY_URL'),
    ],
],
```

Install Cloudinary package:

```bash
composer require cloudinary/cloudinary_php
```

### 4. Deploy Frontend

Same as Option 1, step 2.

---

## Option 3: Render (Alternative to Railway)

Render.com offers similar free tier:

1. Create account: https://render.com
2. New Web Service → Connect repo
3. Root directory: `trotinette-api`
4. Environment: PHP
5. Build: `composer install --no-dev`
6. Start: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT`
7. Add PostgreSQL database (free)

Set same environment variables as Railway option.

---

## Storage Configuration

### Cloudinary Setup (Recommended for Free Tier)

1. Create account: https://cloudinary.com
2. Get URL from dashboard (format: `cloudinary://key:secret@cloud_name`)
3. Install package:

```bash
cd trotinette-api
composer require cloudinary-labs/cloudinary-laravel
```

4. Publish config:

```bash
php artisan vendor:publish --provider="CloudinaryLabs\CloudinaryLaravel\CloudinaryServiceProvider"
```

5. Update `.env`:

```bash
CLOUDINARY_URL=cloudinary://your-key:your-secret@your-cloud-name
FILESYSTEM_DISK=cloudinary
```

6. Update `config/filesystems.php`:

```php
'cloudinary' => [
    'driver' => 'cloudinary',
],
```

### AWS S3 Setup (Already Configured)

Update `.env`:

```bash
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_URL=https://your-bucket.s3.amazonaws.com
```

---

## Database Setup

### MySQL (Railway/PlanetScale)

Already configured in `.env.example`

### PostgreSQL (Render/Neon/Supabase)

Update `.env`:

```bash
DB_CONNECTION=pgsql
DB_HOST=your-host
DB_PORT=5432
DB_DATABASE=your-db
DB_USERNAME=your-user
DB_PASSWORD=your-password
```

Or use connection string:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

---

## Post-Deployment Checklist

- [ ] Database migrated
- [ ] Storage disk working (test upload)
- [ ] CORS configured correctly
- [ ] Sanctum stateful domains set
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set
- [ ] API accessible from frontend
- [ ] Admin login works
- [ ] File uploads persist

---

## Troubleshooting

### CORS errors

Check:
- `FRONTEND_URL` matches exact domain (no trailing slash)
- `SANCTUM_STATEFUL_DOMAINS` matches frontend domain
- `CORS_ALLOWED_ORIGINS` includes frontend URL

### File uploads fail

Check:
- `FILESYSTEM_DISK` set to `cloudinary` or `s3`
- Credentials valid
- Storage package installed

### Database connection fails

Check:
- `DATABASE_URL` or individual DB_* vars set
- Database online and accessible
- SSL mode if required

### Cold starts (Vercel backend)

Normal for serverless. First request slow (5-10s), subsequent fast. Use Railway/Render for always-on server.

---

## Cost Comparison (Free Tiers)

| Service | Backend | Database | Storage | Limitations |
|---------|---------|----------|---------|-------------|
| **Railway** | ✅ 500h/month | ✅ MySQL 1GB | Need Cloudinary/S3 | $5 credit/month |
| **Render** | ✅ 750h/month | ✅ PostgreSQL 1GB | Need Cloudinary/S3 | Spins down after 15min idle |
| **Vercel** | ⚠️ Serverless | ❌ External only | ❌ External required | No persistent storage |
| **Vercel** | ✅ Static/SPA | - | ✅ 100GB bandwidth | Perfect for frontend |

**Recommendation**: Railway/Render backend + Vercel frontend = best free option
