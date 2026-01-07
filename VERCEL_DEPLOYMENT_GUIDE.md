# 🚀 Vercel Deployment Guide for NextBoard

## Why Vercel for Next.js?

✅ **Made by Next.js creators** - Best compatibility  
✅ **Built-in cron jobs** - Your email notifications work out of the box  
✅ **Easy domain setup** - Connect GoDaddy in minutes  
✅ **Serverless functions** - Auto-scaling, no server management  
✅ **Free tier** - Generous limits for most projects  

---

## 📋 Prerequisites

1. **Vercel account** (free at [vercel.com](https://vercel.com))
2. **PostgreSQL database** (we'll use Railway or Vercel Postgres)
3. **GoDaddy domain** (your custom domain)

**Note:** You can deploy **WITHOUT GitHub** using Vercel CLI (see Option B below)

---

## 🚀 Step 1: Prepare Your Code

### 1.1 Switch Database to PostgreSQL

Your project currently uses SQLite locally. For production, you need PostgreSQL.

**Option A: Use Railway PostgreSQL (Recommended)**
- Free tier available
- Easy to set up
- Already configured in your project

**Option B: Use Vercel Postgres**
- Integrated with Vercel
- Easy to add from dashboard

### 1.2 Update Prisma Schema (if needed)

If you're using SQLite locally, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via GitHub (Easier for auto-deployments)

#### 2.1 Push Code to GitHub

```bash
# If not already done
git init
git add .
git commit -m "Ready for production deployment"
git remote add origin https://github.com/YOUR_USERNAME/next-board.io.git
git push -u origin main
```

#### 2.2 Import Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `next-board.io` repository
4. Vercel will auto-detect Next.js

### Option B: Deploy via CLI (No GitHub Required!)

#### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

#### 2.3 Deploy Your Project

```bash
# Navigate to your project
cd next-board.io

# Deploy (follow prompts)
vercel

# For production deployment:
vercel --prod
```

**That's it!** No GitHub needed. Vercel will:
- Upload your code directly
- Build your app
- Deploy to production

### 2.4 Configure Build Settings (GitHub Method Only)

If using GitHub, Vercel should auto-detect, but verify:
- **Framework Preset:** Next.js
- **Root Directory:** `./` (root)
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install`

### 2.5 Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

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

**Important:** 
- Use **Production** environment for all variables
- For Clerk, switch to **live keys** (not test keys) in production
- Generate a random `CRON_SECRET` for security

**For CLI deployment**, add variables via:
```bash
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
# ... etc (add each variable)
```

**For GitHub deployment**, add in Vercel dashboard → Settings → Environment Variables

### 2.6 Deploy!

**If using GitHub:** Click **"Deploy"** and wait 2-3 minutes.

**If using CLI:** Run `vercel --prod` (already done in step 2.3)

Vercel will:
- Install dependencies
- Generate Prisma client
- Build your Next.js app
- Deploy to production

You'll get a URL like: `https://next-board-xyz.vercel.app`

---

## 🗄️ Step 3: Set Up PostgreSQL Database

### Option A: Railway PostgreSQL (Recommended)

1. Go to [railway.app](https://railway.app)
2. Create new project → Add **PostgreSQL** database
3. Copy the `DATABASE_URL` connection string
4. Add it to Vercel environment variables

### Option B: Vercel Postgres

1. In Vercel dashboard → **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Vercel automatically adds `POSTGRES_URL` to your env vars
4. Update your Prisma schema to use `POSTGRES_URL` if needed

### Run Database Migrations

After deployment, run migrations:

**Option 1: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma migrate deploy
```

**Option 2: Via Railway CLI** (if using Railway DB)
```bash
railway link
railway run npx prisma migrate deploy
```

**Option 3: Manual SQL** (if needed)
- Connect to your PostgreSQL database
- Run the migration SQL manually

---

## 🌐 Step 4: Connect GoDaddy Domain

### 4.1 Add Domain in Vercel

1. Go to Vercel project → **Settings** → **Domains**
2. Enter your domain (e.g., `next-board.io` or `www.next-board.io`)
3. Click **"Add"**

### 4.2 Configure DNS in GoDaddy

Vercel will show you DNS records to add. Go to GoDaddy:

1. Log in to [GoDaddy.com](https://godaddy.com)
2. Go to **My Products** → **DNS** → Select your domain
3. Add these DNS records:

#### For Root Domain (next-board.io):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 1 Hour |
| CNAME | www | `cname.vercel-dns.com` | 1 Hour |

**OR** (Vercel will show exact values):

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| A | @ | `76.76.21.22` |
| CNAME | www | `cname.vercel-dns.com` |

#### For Subdomain (app.next-board.io):

| Type | Name | Value |
|------|------|-------|
| CNAME | app | `cname.vercel-dns.com` |

### 4.3 Wait for DNS Propagation

- DNS changes take **5 minutes to 48 hours** (usually 15-30 minutes)
- Check status in Vercel dashboard → **Domains**
- When it shows ✅ **"Valid Configuration"**, you're done!

### 4.4 Update Clerk Domain

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your app → **Domains**
3. Add your production domain: `next-board.io`
4. Update allowed origins if needed

---

## ⏰ Step 5: Verify Cron Jobs

Your cron jobs are configured in `vercel.json`. They should work automatically!

**Verify in Vercel:**
1. Go to project → **Settings** → **Cron Jobs**
2. You should see your scheduled jobs:
   - Daily digest (hourly check)
   - Due today alerts (8 AM daily)
   - Overdue check (every 6 hours)
   - Blocked alerts (every 12 hours)

**Test manually:**
```bash
curl https://your-domain.com/api/cron/email-notifications?type=daily-digest&secret=YOUR_CRON_SECRET
```

---

## ✅ Step 6: Final Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] All environment variables added
- [ ] PostgreSQL database connected
- [ ] Database migrations run
- [ ] Domain added in Vercel
- [ ] DNS configured in GoDaddy
- [ ] Domain verified in Vercel
- [ ] Clerk domain updated
- [ ] Cron jobs verified
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
- Check database is accessible from Vercel
- Ensure database allows connections from Vercel IPs

### Domain Not Working

**DNS not propagating:**
- Wait 15-30 minutes
- Check DNS with: `nslookup your-domain.com`
- Verify records match Vercel's requirements exactly

**SSL certificate issues:**
- Vercel auto-provisions SSL certificates
- Wait 5-10 minutes after DNS is verified

### Cron Jobs Not Running

- Verify `CRON_SECRET` is set
- Check Vercel → Settings → Cron Jobs
- Review function logs in Vercel dashboard

---

## 📊 Monitoring

### View Logs
- Vercel Dashboard → **Deployments** → Click deployment → **Functions** tab
- Or use Vercel CLI: `vercel logs`

### View Analytics
- Vercel Dashboard → **Analytics** tab
- See page views, function invocations, bandwidth

---

## 🎉 You're Live!

Your NextBoard app is now running at: **https://your-domain.com**

**Next Steps:**
1. Test all features in production
2. Set up monitoring/alerts
3. Configure backups for database
4. Share with users! 🚀

---

## 💡 Alternative: Netlify Deployment

If you prefer Netlify (since you're already using it), see `NETLIFY_DEPLOYMENT_GUIDE.md`

