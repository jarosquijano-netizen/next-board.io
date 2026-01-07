# 🚀 Deploy NextBoard Web Service to Railway

## Current Status (From Your Dashboard)

- ✅ Project: magnificent-kindness
- ✅ Postgres service exists (but shows "Failed")
- ❌ **No web service exists** - Need to create one!

---

## Step-by-Step: Create & Deploy Web Service

### Step 1: Create New Service in Railway Dashboard

1. **In Railway Dashboard:**
   - Click the **"+ Create"** button (top right)
   - Select **"Empty Service"** (or "GitHub Repo" if your code is on GitHub)

2. **Name the service:**
   - Name it: `next-board` or `web` or `app`

3. **The new service will appear on the Architecture canvas**

### Step 2: Switch to New Service in CLI

```bash
# Make sure you're in your project directory
cd C:\Users\joe_freightos\Desktop\next-board.io

# Link to Railway project (if not already)
railway link
# Select: magnificent-kindness

# Switch to the new web service
railway service
# Select your new web service (not Postgres)
```

### Step 3: Add Environment Variables to Web Service

**Important:** These need to be on the WEB SERVICE, not Postgres!

```bash
# Make sure you're on the web service first
railway service  # Select web service

# Add all required variables
railway variables --set DATABASE_URL="postgresql://postgres:DcAyvwFiQTKqhMIDktdPCTkiKUHHmiEf@mainline.proxy.rlwy.net:42102/railway"

railway variables --set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_ZnVsbC1iZWUtNzIuY2xlcmsuYWNjb3VudHMuZGV2JA"

railway variables --set CLERK_SECRET_KEY="sk_test_h3WbKiz4bTLY05A6KQ1Nk9UoydZtgJHBKcaHLqLUsP"

railway variables --set ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"

railway variables --set NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"

railway variables --set NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

railway variables --set NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"

railway variables --set NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

railway variables --set NODE_ENV="production"

# Resend API key for emails:
railway variables --set RESEND_API_KEY="re_ddD5TTv4_Nqxejwr28DUzSYTdfmr3pxks"
railway variables --set RESEND_FROM_EMAIL="onboarding@resend.dev"
railway variables --set RESEND_FROM_NAME="NextBoard"

# For cron jobs:
railway variables --set CRON_SECRET="cron-secret-531195-763483"
```

### Step 4: Configure Service Settings

In Railway dashboard, click on your new web service → **Settings**:

1. **Build Command:** `prisma generate && next build`
2. **Start Command:** `npm run start`
3. **Root Directory:** `./` (root)

Or Railway should auto-detect Next.js and set these automatically.

### Step 5: Deploy Your App

```bash
# Make sure you're on the web service
railway service  # Select web service

# Deploy!
railway up
```

This will:
- Upload your code
- Install dependencies
- Generate Prisma client
- Build Next.js app
- Start the server

### Step 6: Run Database Migrations

```bash
# Still on web service
railway run npx prisma migrate deploy
```

### Step 7: Get Your App URL

```bash
# Generate public domain
railway domain

# Or open in browser
railway open
```

---

## 🔧 Alternative: Deploy via Railway Dashboard

If you prefer using the dashboard:

1. **Click on your new web service** in Architecture view
2. **Go to "Settings"** tab
3. **Click "Deploy"** or **"Redeploy"**
4. Railway will build and deploy your app

---

## ⚠️ About the Failed Postgres Service

The Postgres service shows "Failed" but that's okay - you can:

1. **Restart it** (click on Postgres → Settings → Restart)
2. **Or ignore it** if you're using the database URL directly

The database should still be accessible via the connection string.

---

## ✅ Quick Checklist

- [ ] Created new web service in Railway dashboard
- [ ] Switched to web service in CLI (`railway service`)
- [ ] Added all environment variables to web service
- [ ] Configured build/start commands (or auto-detected)
- [ ] Deployed (`railway up`)
- [ ] Ran migrations (`railway run npx prisma migrate deploy`)
- [ ] Got app URL (`railway domain`)

---

## 🎯 What to Do Right Now

1. **In Railway Dashboard:** Click **"+ Create"** → **"Empty Service"**
2. **Name it:** `next-board` or `web`
3. **Come back here** and I'll help you deploy!

Once you create the service, run:
```bash
railway service
# Select your new web service
railway up
```

Let me know when you've created the service! 🚀

