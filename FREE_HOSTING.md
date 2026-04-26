# 🆓 100% FREE Forever Hosting

No credit cards. No time limits. No usage caps (within reason).

## Stack

| Component | Service | Free Tier | Limitations |
|-----------|---------|-----------|-------------|
| **Frontend** | Vercel | 100GB bandwidth/month | None for small apps |
| **Backend** | Render.com | 750h/month | Sleeps after 15min idle |
| **Database** | Neon PostgreSQL | 0.5GB storage, 3GB monthly transfer | Single database |
| **Storage** | Cloudinary | 25GB storage, 25GB bandwidth | - |

**Total cost: $0/month forever**

---

## Step-by-Step Setup

### 1. Setup Database (Neon PostgreSQL)

1. **Sign up**: https://neon.tech (free, no credit card)

2. **Create project**:
   - Click "Create Project"
   - Name: `trotinette-db`
   - Region: Choose closest to you
   - PostgreSQL version: Latest

3. **Copy connection string**:
   - Dashboard → Connection Details
   - Copy "Connection string"
   - Format: `postgresql://user:pass@host/db?sslmode=require`

4. **Save for later** (need for Render)

---

### 2. Setup Storage (Cloudinary)

1. **Sign up**: https://cloudinary.com (free, no credit card)

2. **Get credentials**:
   - Dashboard → top-right
   - Copy: Cloud Name, API Key, API Secret

3. **Format URL**:
   ```
   cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```
   Example: `cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@my-cloud-name`

4. **Save for later**

---

### 3. Deploy Backend (Render)

1. **Sign up**: https://render.com (free, GitHub login)

2. **New Web Service**:
   - Dashboard → "New +" → Web Service
   - Connect GitHub → Select your repo
   - **Important**: Root Directory = `trotinette-api`

3. **Configure**:
   ```
   Name: trotinette-api
   Region: Choose closest
   Branch: master (or main)
   Root Directory: trotinette-api
   Runtime: PHP
   Build Command: composer install --no-dev --optimize-autoloader
   Start Command: php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
   ```

4. **Plan**: Select "Free"

5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

   ```bash
   APP_NAME=TrotinetteApp
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=
   # ↑ Generate with: php artisan key:generate --show

   APP_URL=https://trotinette-api.onrender.com
   # ↑ Will be your actual Render URL

   # Database (from Neon step 1)
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   DB_CONNECTION=pgsql

   # Session & Cache
   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=sync

   # Storage (from Cloudinary step 2)
   FILESYSTEM_DISK=cloudinary
   CLOUDINARY_URL=cloudinary://key:secret@cloud_name

   # CORS (update after Vercel deploy)
   FRONTEND_URL=
   SANCTUM_STATEFUL_DOMAINS=
   CORS_ALLOWED_ORIGINS=
   CORS_SUPPORTS_CREDENTIALS=true

   # Mail (optional - use Mailtrap free)
   MAIL_MAILER=smtp
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=
   MAIL_PASSWORD=
   MAIL_FROM_ADDRESS=noreply@trotinette.com
   ```

6. **Create Web Service** → Render starts building

7. **Copy your URL**:
   - Top of page shows: `https://trotinette-api.onrender.com`
   - Save for frontend

---

### 4. Update Laravel for PostgreSQL

Backend currently uses MySQL. Need change for Neon PostgreSQL:

**Update `trotinette-api/config/database.php`**:

Add at top of `connections` array:

```php
'connections' => [
    'pgsql' => [
        'driver' => 'pgsql',
        'url' => env('DATABASE_URL'),
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '5432'),
        'database' => env('DB_DATABASE', 'forge'),
        'username' => env('DB_USERNAME', 'forge'),
        'password' => env('DB_PASSWORD', ''),
        'charset' => 'utf8',
        'prefix' => '',
        'prefix_indexes' => true,
        'search_path' => 'public',
        'sslmode' => 'require',
    ],
    // ... existing connections
],
```

**Commit and push** → Render auto-redeploys

---

### 5. Deploy Frontend (Vercel)

1. **Sign up**: https://vercel.com (free, GitHub login)

2. **Import Project**:
   - Dashboard → "Add New" → Project
   - Import Git Repository → Select your repo

3. **Configure**:
   ```
   Project Name: trotinette-frontend
   Framework Preset: Vite
   Root Directory: trotinette-frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**:
   ```bash
   VITE_API_URL=https://trotinette-api.onrender.com/api
   VITE_APP_NAME=TrotinetteApp
   ```
   (Use your actual Render URL from step 3)

5. **Deploy** → Vercel builds and deploys

6. **Copy your URL**:
   - Shows: `https://trotinette-frontend.vercel.app`
   - Or custom domain if you have one

---

### 6. Update Backend CORS

Go back to Render → Your service → Environment:

**Update these variables** with your Vercel URL:

```bash
FRONTEND_URL=https://trotinette-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=trotinette-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://trotinette-frontend.vercel.app
```

Click "Save Changes" → Render auto-redeploys

---

### 7. Install Cloudinary Package

Render needs Cloudinary PHP package.

**Add to `trotinette-api/composer.json`**:

In `require` section:

```json
"require": {
    "php": "^8.2",
    "cloudinary-labs/cloudinary-laravel": "^2.0",
    ...existing packages
}
```

**Commit and push** → Render installs on next deploy

---

## ⚠️ Important Notes

### Render Sleep Behavior

Free tier sleeps after **15 minutes** of no requests.

**First request after sleep:**
- Takes ~30-60 seconds (server waking up)
- User sees loading spinner

**Solutions:**
1. Accept it (truly free)
2. Use cron job to ping every 14min (keep awake)
3. Upgrade to paid ($7/month for always-on)

**Keep-alive service** (free):
- https://uptimerobot.com - ping your API every 5min
- Keeps Render awake during business hours

### Storage Limits

| Service | Limit | What happens when exceeded |
|---------|-------|----------------------------|
| Neon DB | 0.5GB | Must upgrade or delete data |
| Cloudinary | 25GB | Must upgrade or delete files |
| Vercel | 100GB bandwidth/month | Soft limit, usually OK |

For small e-commerce: Should be fine for months/years.

### PostgreSQL vs MySQL

Changed from MySQL to PostgreSQL because:
- Neon offers free PostgreSQL (no free MySQL)
- Laravel supports both equally

**Migrations work same**, but check for MySQL-specific syntax if any custom queries.

---

## Testing Deployment

### 1. Test Backend API

Visit: `https://trotinette-api.onrender.com/api/health`

Should return JSON (might take 30s first time - wake up).

### 2. Test Frontend

Visit: `https://trotinette-frontend.vercel.app`

Should load homepage.

### 3. Test Login

Go to admin panel, try login.

If CORS error → check CORS env vars match exactly.

### 4. Test Upload

Add product with image.

Should upload to Cloudinary (check Cloudinary dashboard).

---

## Alternative Free Backend Options

If Render sleep bothers you:

### Option B: Fly.io

**Pros:**
- 3 VMs free (256MB RAM each)
- Don't sleep
- Better performance

**Cons:**
- Requires credit card (not charged on free tier)
- More complex setup

**Free tier:**
- 3 shared-cpu-1x VMs (256MB RAM)
- 3GB persistent storage
- 160GB bandwidth

### Option C: Koyeb

**Pros:**
- Don't sleep
- Easy deploy

**Cons:**
- Smaller free tier
- Less reliable than Render

---

## Keep-Alive Setup (Optional)

Prevent Render sleep with UptimeRobot:

1. **Sign up**: https://uptimerobot.com (free)

2. **Add Monitor**:
   - Monitor Type: HTTP(s)
   - URL: `https://trotinette-api.onrender.com/api/health`
   - Monitoring Interval: 5 minutes

3. **Done** - Pings every 5min, keeps Render awake

**Downside**: Uses your 750h limit faster. 750h = 31.25 days, so still covers whole month if always awake.

---

## Cost Breakdown

| Service | Signup | Free Tier | Duration |
|---------|--------|-----------|----------|
| Vercel | No CC | 100GB/month | Forever |
| Render | No CC | 750h/month | Forever |
| Neon | No CC | 0.5GB | Forever |
| Cloudinary | No CC | 25GB | Forever |
| **TOTAL** | **$0** | **Unlimited** | **Forever** |

No credit card needed anywhere.
No surprise charges.
True free tier forever.

---

## When to Upgrade

Consider paid plans when:

- **Render** ($7/month): Backend gets >100 visitors/day, sleep annoying
- **Neon** ($19/month): Database >0.5GB
- **Cloudinary** ($89/month): Files >25GB
- **Vercel** ($20/month): Need analytics, more bandwidth

But for starting out: **100% free works fine**.

---

## Troubleshooting

### "Database connection failed"

Check Neon connection string includes `?sslmode=require`

### "CORS policy error"

Verify:
```bash
FRONTEND_URL=https://exact-domain.vercel.app  # No trailing /
SANCTUM_STATEFUL_DOMAINS=exact-domain.vercel.app  # No https://
```

### "First request takes forever"

Normal - Render waking up from sleep. Set up UptimeRobot keep-alive.

### "Storage error"

Check `CLOUDINARY_URL` format exact:
```
cloudinary://api_key:api_secret@cloud_name
```

### "Build failed on Render"

Check:
- Root Directory = `trotinette-api`
- PHP runtime selected
- Composer packages installable

---

## Next Steps

1. Follow steps 1-6 above
2. Test everything works
3. (Optional) Set up UptimeRobot keep-alive
4. (Optional) Add custom domain on Vercel

Your app now running 100% free! 🎉
