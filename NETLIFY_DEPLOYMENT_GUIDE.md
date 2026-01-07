# 🌐 Netlify Deployment Guide for NextBoard

## Why Netlify?

✅ **You're already using it** - Familiar workflow  
✅ **Great Next.js support** - Works well with Next.js  
✅ **Easy domain setup** - Simple GoDaddy integration  
✅ **Free tier** - Good for most projects  

⚠️ **Note:** Cron jobs require Netlify Functions or external scheduler (we'll set this up)

---

## 📋 Prerequisites

1. **Netlify account** (free at [netlify.com](https://netlify.com))
2. **PostgreSQL database** (Railway, Supabase, or Netlify Postgres)
3. **GoDaddy domain** (your custom domain)

**Note:** You can deploy **WITHOUT GitHub** using Netlify CLI (see Option B below)

---

## 🚀 Step 1: Prepare Your Code

### 1.1 Create Netlify Configuration

The `netlify.toml` file is already created in your project root!

### 1.2 Update Prisma Schema for PostgreSQL

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## 🚀 Step 2: Deploy to Netlify

### Option A: Deploy via GitHub (Easier for auto-deployments)

#### 2.1 Push Code to GitHub

```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

#### 2.2 Import Project

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select `next-board.io`
4. Netlify will auto-detect Next.js

### Option B: Deploy via CLI (No GitHub Required!)

#### 2.1 Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2.2 Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate.

#### 2.3 Deploy Your Project

```bash
# Navigate to your project
cd next-board.io

# Deploy (follow prompts)
netlify deploy

# For production deployment:
netlify deploy --prod
```

**That's it!** No GitHub needed. Netlify will:
- Upload your code directly
- Build your app
- Deploy to production

### 2.4 Configure Build Settings (GitHub Method Only)

If using GitHub, configure in Netlify dashboard:
- **Build command:** `prisma generate && next build`
- **Publish directory:** `.next`

**OR** use `netlify.toml` (already created in your project!)

### 2.5 Add Environment Variables

In Netlify → **Site settings** → **Environment variables**, add:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# AI Processing
ANTHROPIC_API_KEY="sk-ant-..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Cron Secret (for scheduled jobs)
CRON_SECRET="your-random-secret-string-here"

# Node Environment
NODE_ENV="production"
```

**For CLI deployment**, add variables via:
```bash
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "pk_live_..."
netlify env:set CLERK_SECRET_KEY "sk_live_..."
# ... etc (add each variable)
```

**For GitHub deployment**, add in Netlify dashboard → Site settings → Environment variables

### 2.6 Deploy!

**If using GitHub:** Click **"Deploy site"** and wait 2-3 minutes.

**If using CLI:** Run `netlify deploy --prod` (already done in step 2.3)

You'll get a URL like: `https://next-board-xyz.netlify.app`

---

## 🗄️ Step 3: Set Up PostgreSQL Database

### Option A: Railway PostgreSQL (Recommended)

1. Go to [railway.app](https://railway.app)
2. Create new project → Add **PostgreSQL** database
3. Copy the `DATABASE_URL` connection string
4. Add it to Netlify environment variables

### Option B: Supabase (Free PostgreSQL)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings** → **Database**
4. Copy connection string
5. Add to Netlify as `DATABASE_URL`

### Run Database Migrations

After deployment, run migrations:

**Via Netlify CLI:**
```bash
npm i -g netlify-cli
netlify login
netlify env:get DATABASE_URL > .env.production
npx prisma migrate deploy
```

**Or via Railway CLI** (if using Railway DB):
```bash
railway link
railway run npx prisma migrate deploy
```

---

## 🌐 Step 4: Connect GoDaddy Domain

### 4.1 Add Domain in Netlify

1. Go to Netlify → **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `next-board.io`
4. Click **"Verify"**

### 4.2 Configure DNS in GoDaddy

Netlify will show you DNS records. Go to GoDaddy:

1. Log in to [GoDaddy.com](https://godaddy.com)
2. Go to **My Products** → **DNS** → Select your domain
3. Add these DNS records:

#### For Root Domain (next-board.io):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `75.2.60.5` | 1 Hour |
| CNAME | www | `your-site.netlify.app` | 1 Hour |

**OR** (Netlify will show exact values):

| Type | Name | Value |
|------|------|-------|
| A | @ | `75.2.60.5` |
| A | @ | `99.83.190.102` |
| CNAME | www | `your-site.netlify.app` |

**Note:** Netlify will show you the exact IP addresses to use.

### 4.3 Wait for DNS Propagation

- DNS changes take **5 minutes to 48 hours** (usually 15-30 minutes)
- Check status in Netlify → **Domain management**
- When it shows ✅ **"DNS configuration detected"**, you're done!

### 4.4 Update Clerk Domain

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your app → **Domains**
3. Add your production domain: `next-board.io`
4. Update allowed origins if needed

---

## ⏰ Step 5: Set Up Cron Jobs

Netlify doesn't have built-in cron jobs like Vercel. You have two options:

### Option A: Netlify Scheduled Functions (Recommended)

We'll create scheduled functions for your cron jobs.

### Option B: External Cron Service

Use a service like:
- **cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (free)

They'll call your API endpoints on schedule.

---

## ✅ Step 6: Final Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify project created and deployed
- [ ] All environment variables added
- [ ] PostgreSQL database connected
- [ ] Database migrations run
- [ ] Domain added in Netlify
- [ ] DNS configured in GoDaddy
- [ ] Domain verified in Netlify
- [ ] Clerk domain updated
- [ ] Cron jobs configured (external or functions)
- [ ] Test sign-up/sign-in flow
- [ ] Test file upload
- [ ] Test AI processing

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Prisma Client not generated"**
- Add `prisma generate` to build command
- Or add `postinstall` script: `"postinstall": "prisma generate"`

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is correct
- Check database allows connections from Netlify
- Ensure database is publicly accessible

### Domain Not Working

**DNS not propagating:**
- Wait 15-30 minutes
- Check DNS with: `nslookup your-domain.com`
- Verify records match Netlify's requirements exactly

**SSL certificate issues:**
- Netlify auto-provisions SSL certificates
- Wait 5-10 minutes after DNS is verified

---

## 📊 Monitoring

### View Logs
- Netlify Dashboard → **Functions** → **Logs**
- Or use Netlify CLI: `netlify logs:functions`

### View Analytics
- Netlify Dashboard → **Analytics** tab
- See page views, bandwidth, function invocations

---

## 🎉 You're Live!

Your NextBoard app is now running at: **https://your-domain.com**

**Next Steps:**
1. Test all features in production
2. Set up monitoring/alerts
3. Configure backups for database
4. Share with users! 🚀

