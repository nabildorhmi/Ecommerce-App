# Quick Deploy Steps

## 🚀 Fastest Path: Railway + Vercel (15 minutes)

### Step 1: Deploy Backend (Railway)

1. **Go to https://railway.app** → Sign in with GitHub

2. **New Project** → Deploy from GitHub → Select this repo

3. **Add MySQL database**:
   - Click "New" → Database → MySQL
   - Railway auto-creates connection vars

4. **Set environment variables** (Settings → Variables):
   ```bash
   APP_NAME=TrotinetteApp
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=                    # Generate: php artisan key:generate --show

   # Database (auto-filled by Railway)
   DATABASE_URL=${{MYSQL.DATABASE_URL}}

   # Storage (get from cloudinary.com)
   FILESYSTEM_DISK=cloudinary
   CLOUDINARY_URL=cloudinary://key:secret@cloud_name

   # Frontend (add after step 2)
   FRONTEND_URL=                # Will be: https://xxx.vercel.app
   SANCTUM_STATEFUL_DOMAINS=    # Same domain without https://
   CORS_ALLOWED_ORIGINS=        # Same as FRONTEND_URL
   ```

5. **Deploy** → Railway auto-builds and runs

6. **Copy your backend URL** (Settings → Domains → Generate domain)
   Example: `https://trotinette-api-production.up.railway.app`

---

### Step 2: Deploy Frontend (Vercel)

1. **Go to https://vercel.com** → Import Git repository

2. **Configure**:
   - Root Directory: `trotinette-frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**:
   ```bash
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   VITE_APP_NAME=TrotinetteApp
   ```

4. **Deploy** → Vercel auto-builds

5. **Copy your frontend URL**
   Example: `https://trotinette.vercel.app`

---

### Step 3: Update Backend CORS

1. **Go back to Railway** → Your project → Variables

2. **Update these variables** with Vercel URL:
   ```bash
   FRONTEND_URL=https://trotinette.vercel.app
   SANCTUM_STATEFUL_DOMAINS=trotinette.vercel.app
   CORS_ALLOWED_ORIGINS=https://trotinette.vercel.app
   ```

3. **Redeploy** → Railway auto-redeploys on env change

---

### Step 4: Setup File Storage

**Option A: Cloudinary (Recommended - Free 25GB)**

1. Sign up: https://cloudinary.com
2. Dashboard → Get Cloud Name, API Key, API Secret
3. Format URL: `cloudinary://api_key:api_secret@cloud_name`
4. Add to Railway env vars:
   ```bash
   CLOUDINARY_URL=cloudinary://123456:abcdef@my-cloud
   FILESYSTEM_DISK=cloudinary
   ```

**Option B: AWS S3**

1. Create S3 bucket
2. Get credentials (IAM user)
3. Add to Railway:
   ```bash
   FILESYSTEM_DISK=s3
   AWS_ACCESS_KEY_ID=xxx
   AWS_SECRET_ACCESS_KEY=xxx
   AWS_DEFAULT_REGION=us-east-1
   AWS_BUCKET=my-bucket
   ```

---

### Step 5: Test

1. **Visit frontend URL**: https://your-app.vercel.app
2. **Test API**: https://your-api.railway.app/api/health
3. **Login to admin**: /admin/login
4. **Test upload**: Add product with image

✅ Done!

---

## 🔧 Alternative: Render + Vercel

### Backend on Render

1. **Go to https://render.com** → New Web Service

2. **Connect repo** → Root directory: `trotinette-api`

3. **Settings**:
   - Environment: PHP
   - Build: `composer install --no-dev --optimize-autoloader`
   - Start: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT`

4. **Add PostgreSQL database** (New → PostgreSQL)

5. **Environment Variables** (same as Railway, but DB vars from Render PostgreSQL):
   ```bash
   DATABASE_URL=${{DATABASE_URL}}
   DB_CONNECTION=pgsql
   ```

6. Rest same as Railway steps

---

## ⚠️ Common Issues

### "CORS error"
→ Check `FRONTEND_URL` matches exactly (no trailing slash)
→ `SANCTUM_STATEFUL_DOMAINS` is domain only (no https://)

### "Storage error"
→ Set `FILESYSTEM_DISK=cloudinary` or `s3`
→ Add `CLOUDINARY_URL` or AWS credentials

### "Database connection failed"
→ Use `DATABASE_URL` or check individual DB_* vars
→ Ensure PostgreSQL uses `DB_CONNECTION=pgsql`

### "App key not set"
→ Generate: `php artisan key:generate --show`
→ Add to env vars with `base64:` prefix

---

## 📊 Free Tier Limits

| Service | What You Get |
|---------|--------------|
| **Railway** | $5/month credit (~500h runtime), 1GB MySQL |
| **Render** | 750h/month runtime, 1GB PostgreSQL, sleeps after 15min |
| **Vercel** | Unlimited deploys, 100GB bandwidth |
| **Cloudinary** | 25GB storage, 25GB bandwidth |

**Total cost: $0/month** with these limits
