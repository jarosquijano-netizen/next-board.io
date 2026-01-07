# 🚨 Fix Domain Issue: next-board.io Not Showing Your App

## Problem
Your domain `https://next-board.io/` is showing a Spanish "coming soon" placeholder page instead of your NextBoard application.

**Root Cause:** The domain is not connected to your Railway deployment.

---

## 🔍 Quick Diagnosis

### Check 1: Is Your App Deployed on Railway?

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Sign in with your account
   - Find project: `magnificent-kindness` (ID: `be7c39ba-c311-42d0-9523-852b1857ee86`)

2. **Check if you have TWO services:**
   - ✅ **PostgreSQL Database** (this exists)
   - ❓ **Web Service** (Next.js app) - **DOES THIS EXIST?**

3. **If NO web service exists:**
   - You need to deploy your app first (see Step 1 below)

4. **If YES web service exists:**
   - Click on the web service
   - Check if it's running
   - Copy the Railway URL (e.g., `https://nextboard-production.up.railway.app`)

---

## ✅ Solution Steps

### Step 1: Deploy Your App to Railway (If Not Already Deployed)

**Option A: Using Railway CLI**

```powershell
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Navigate to project
cd C:\Users\joe_freightos\Desktop\next-board.io

# Link to Railway project
railway link
# Select project: be7c39ba-c311-42d0-9523-852b1857ee86

# Select/create web service (NOT database)
railway service
# If no web service exists, create one

# Deploy
railway up
```

**Option B: Using Railway Dashboard**

1. Go to: https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86
2. Click **"+ New"** → **"GitHub Repo"** or **"Empty Service"**
3. If using GitHub:
   - Connect your GitHub repo
   - Railway will auto-detect Next.js
   - Set build command: `prisma generate && next build`
   - Set start command: `npm start`
4. Add environment variables (see Step 2)
5. Deploy!

---

### Step 2: Add Environment Variables in Railway

Go to Railway dashboard → Your web service → Variables

Add these (use **Production** environment):

```env
# Database (from your PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@host.railway.app:5432/railway

# Clerk Authentication (USE LIVE KEYS!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# AI Processing
ANTHROPIC_API_KEY=sk-ant-...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=NextBoard

# Cron Secret
CRON_SECRET=your-random-secret-here

# Node Environment
NODE_ENV=production
```

**To get DATABASE_URL:**
- Railway dashboard → PostgreSQL service → Variables
- Copy `DATABASE_URL` or `DATABASE_PUBLIC_URL`

---

### Step 3: Run Database Migrations

```powershell
# Link to Railway
railway link

# Select your web service
railway service

# Run migrations
railway run npx prisma migrate deploy
```

---

### Step 4: Add Custom Domain in Railway

1. **In Railway Dashboard:**
   - Go to your **web service** (not database)
   - Click **Settings** → **Domains**
   - Click **"Add Custom Domain"**
   - Enter: `next-board.io`
   - Click **"Add"**

2. **Railway will show DNS configuration:**
   - It will show you either:
     - **CNAME record** (preferred): `your-app.up.railway.app`
     - **A records** (IP addresses)
   - **COPY THESE VALUES** - you'll need them for GoDaddy

---

### Step 5: Configure GoDaddy DNS

1. **Log in to GoDaddy:**
   - Go to: https://godaddy.com
   - Sign in

2. **Go to DNS Management:**
   - **My Products** → Find `next-board.io` → Click **DNS** or **Manage DNS**

3. **DELETE existing records:**
   - Remove any A records pointing to placeholder IPs
   - Remove any CNAME records pointing to placeholder domains
   - (These are causing the "coming soon" page)

4. **ADD Railway DNS records:**

   **If Railway shows CNAME (most common):**
   ```
   Type: CNAME
   Name: @
   Value: [your-app.up.railway.app] (from Railway)
   TTL: 1 Hour
   ```

   **If Railway shows A records:**
   ```
   Type: A
   Name: @
   Value: [IP address from Railway]
   TTL: 1 Hour
   ```

   **Also add www:**
   ```
   Type: CNAME
   Name: www
   Value: [your-app.up.railway.app] (same as above)
   TTL: 1 Hour
   ```

5. **Save changes**

---

### Step 6: Wait for DNS Propagation

- **Time:** 15 minutes to 48 hours (usually 15-30 minutes)
- **Check status:** Railway dashboard → Domains → Should show ✅ "Valid Configuration"

**Test DNS:**
```powershell
# In PowerShell
nslookup next-board.io
```

You should see Railway's IP addresses or CNAME.

---

### Step 7: Update Clerk Dashboard

1. **Go to Clerk:**
   - Visit: https://dashboard.clerk.com
   - Sign in → Select your app

2. **Add Domain:**
   - **Domains** → **"Add Domain"**
   - Enter: `next-board.io`
   - Click **"Add"**

3. **Update Allowed Origins:**
   - **Settings** → **Allowed Origins**
   - Add: `https://next-board.io`
   - Add: `https://www.next-board.io`

---

### Step 8: Verify Everything Works

1. **Wait 15-30 minutes** after DNS changes
2. **Visit:** `https://next-board.io`
3. **Check:**
   - ✅ Site loads (not placeholder)
   - ✅ SSL certificate active (green lock)
   - ✅ Sign-up works
   - ✅ Sign-in works
   - ✅ App features work

---

## 🔧 Common Issues & Fixes

### Issue: Still Shows Placeholder Page

**Causes:**
- DNS not propagated (wait longer)
- Wrong DNS records
- Browser cache

**Fix:**
```powershell
# Clear DNS cache
ipconfig /flushdns

# Try incognito/private browsing
# Or use different browser
```

### Issue: Railway Shows "Invalid Configuration"

**Check:**
- DNS records match Railway exactly
- No typos
- Removed old records
- TTL is set

### Issue: SSL Certificate Error

- Wait 5-10 minutes after DNS verification
- Railway auto-provisions SSL
- Check Railway → Domains → SSL status

### Issue: Clerk Authentication Fails

- Domain added in Clerk?
- Using live keys (not test)?
- Allowed origins updated?

---

## 📋 Quick Checklist

- [ ] Railway web service exists and is running
- [ ] Environment variables added in Railway
- [ ] Database migrations run
- [ ] Custom domain added in Railway
- [ ] DNS records configured in GoDaddy
- [ ] Old DNS records removed
- [ ] DNS propagated (15-30 min wait)
- [ ] Domain verified in Railway (✅)
- [ ] SSL certificate active
- [ ] Domain added in Clerk
- [ ] Site loads at https://next-board.io
- [ ] Authentication works

---

## 🆘 Need Help?

1. **Check Railway logs:**
   ```powershell
   railway logs --tail 100
   ```

2. **Verify deployment:**
   - Railway dashboard → Deployments
   - Check latest deployment status

3. **Test Railway URL directly:**
   - Visit your Railway app URL (e.g., `https://your-app.up.railway.app`)
   - If this works, domain is the issue
   - If this doesn't work, deployment is the issue

---

## 🎯 Priority Actions RIGHT NOW

1. **Check Railway dashboard** - Is your app deployed?
2. **If not deployed** - Deploy it first
3. **If deployed** - Add custom domain in Railway
4. **Update GoDaddy DNS** - Point to Railway
5. **Wait 15-30 minutes** - DNS propagation
6. **Test** - Visit https://next-board.io

---

**The domain is currently pointing to a placeholder/hosting page. Once you point it to Railway, your app will show up!**
