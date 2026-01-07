# 🚀 Production Deployment Quick Start

## 🎯 My Recommendation: **Vercel**

Since you're deploying a Next.js app with cron jobs, **Vercel is the best choice**:
- ✅ Built-in cron jobs (already configured!)
- ✅ Made by Next.js creators
- ✅ Easiest GoDaddy domain setup
- ✅ Zero configuration needed

**However**, if you want to stick with Netlify (since you're already using it), that works too! Just requires a bit more setup for cron jobs.

---

## ⚡ Quick Decision Guide

### Choose Vercel if:
- ✅ You want the easiest setup
- ✅ You need cron jobs (email notifications)
- ✅ You want best Next.js performance
- ✅ You don't mind trying a new platform

### Choose Netlify if:
- ✅ You want to keep everything in one place
- ✅ You're already familiar with Netlify
- ✅ You don't mind setting up external cron jobs

### Choose Railway if:
- ✅ You want the simplest CLI deployment (no GitHub needed!)
- ✅ You want database + app in one place
- ✅ You prefer full control

**Note:** All three platforms support CLI deployment WITHOUT GitHub! See `DEPLOY_WITHOUT_GITHUB.md`

---

## 🚀 Vercel Deployment (Recommended - 15 minutes)

### Option A: Deploy via CLI (No GitHub Required!)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd next-board.io
vercel --prod
```

### Option B: Deploy via GitHub (Auto-deployments)

```bash
# Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# Then in Vercel dashboard:
# 1. Go to vercel.com → Sign in with GitHub
# 2. Click "Add New Project"
# 3. Import your repo
# 4. Add environment variables
# 5. Click "Deploy"
```

### Step 3: Set Up Database
- Use Railway PostgreSQL (free tier)
- Copy `DATABASE_URL` → Add to Vercel env vars
- Run migrations: `railway run npx prisma migrate deploy`

### Step 4: Connect GoDaddy Domain
1. Vercel → Settings → Domains → Add `next-board.io`
2. GoDaddy → DNS → Add A record: `@` → `76.76.21.21`
3. Add CNAME: `www` → `cname.vercel-dns.com`
4. Wait 15-30 minutes for DNS

**Done!** See `VERCEL_DEPLOYMENT_GUIDE.md` for details.

---

## 🌐 Netlify Deployment (Alternative - 20 minutes)

### Option A: Deploy via CLI (No GitHub Required!)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd next-board.io
netlify deploy --prod
```

### Option B: Deploy via GitHub (Auto-deployments)

```bash
# Push to GitHub
git add .
git commit -m "Add Netlify config"
git push origin main

# Then in Netlify dashboard:
# 1. Go to netlify.com → Sign in
# 2. Click "Add new site" → Import from GitHub
# 3. Select your repo
# 4. Build command: prisma generate && next build
# 5. Add environment variables
# 6. Click "Deploy site"
```

### Step 3: Set Up Database
- Use Railway PostgreSQL or Supabase
- Copy `DATABASE_URL` → Add to Netlify env vars
- Run migrations: `railway run npx prisma migrate deploy`

### Step 4: Connect GoDaddy Domain
1. Netlify → Site settings → Domain management
2. Add custom domain: `next-board.io`
3. GoDaddy → DNS → Add A record: `@` → `75.2.60.5`
4. Add CNAME: `www` → `your-site.netlify.app`
5. Wait 15-30 minutes for DNS

### Step 5: Set Up Cron Jobs
Use external service like [cron-job.org](https://cron-job.org):
- Daily digest: `https://your-domain.com/api/cron/email-notifications?type=daily-digest&secret=YOUR_SECRET`
- Schedule: Hourly/Daily as needed

**Done!** See `NETLIFY_DEPLOYMENT_GUIDE.md` for details.

---

## 🔑 Required Environment Variables

Add these to Vercel/Netlify:

```env
# Database (PostgreSQL - get from Railway or Supabase)
DATABASE_URL="postgresql://user:password@host:port/database"

# Clerk Authentication (use LIVE keys in production!)
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

# Cron Secret (generate random string)
CRON_SECRET="your-random-secret-here"

# Node Environment
NODE_ENV="production"
```

---

## 🗄️ Database Setup (PostgreSQL)

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Copy `DATABASE_URL` from database settings
4. Add to Vercel/Netlify environment variables

### Option 2: Supabase (Free)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Settings → Database → Copy connection string
4. Add to Vercel/Netlify as `DATABASE_URL`

### Update Prisma Schema

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate dev --name switch_to_postgresql
```

---

## 🌐 GoDaddy Domain Setup

### For Vercel:

**In GoDaddy DNS:**
- Type: **A** | Name: `@` | Value: `76.76.21.21` | TTL: 1 Hour
- Type: **A** | Name: `@` | Value: `76.76.21.22` | TTL: 1 Hour  
- Type: **CNAME** | Name: `www` | Value: `cname.vercel-dns.com` | TTL: 1 Hour

**In Vercel:**
- Settings → Domains → Add `next-board.io`
- Wait for DNS verification (15-30 min)

### For Netlify:

**In GoDaddy DNS:**
- Type: **A** | Name: `@` | Value: `75.2.60.5` | TTL: 1 Hour
- Type: **A** | Name: `@` | Value: `99.83.190.102` | TTL: 1 Hour
- Type: **CNAME** | Name: `www` | Value: `your-site.netlify.app` | TTL: 1 Hour

**In Netlify:**
- Site settings → Domain management → Add custom domain
- Wait for DNS verification (15-30 min)

---

## ✅ Post-Deployment Checklist

- [ ] Code deployed successfully
- [ ] All environment variables added
- [ ] Database connected and migrations run
- [ ] Domain connected and verified
- [ ] SSL certificate active (auto-provisioned)
- [ ] Clerk domain updated with production URL
- [ ] Test sign-up/sign-in
- [ ] Test file upload
- [ ] Test AI processing
- [ ] Cron jobs working (Vercel) or scheduled (Netlify)
- [ ] Monitor logs for errors

---

## 🆘 Need Help?

- **Vercel:** See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Netlify:** See `NETLIFY_DEPLOYMENT_GUIDE.md`
- **Database:** See `RAILWAY_DEPLOYMENT.md`
- **Clerk:** See `CLERK_SETUP_GUIDE.md`

---

## 🎉 You're Ready!

Choose your platform and follow the guide. Both work great! 🚀

**My recommendation:** Start with Vercel for the easiest setup, especially since cron jobs are already configured.

