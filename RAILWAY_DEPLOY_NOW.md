# 🚀 Deploy NextBoard to Railway - Quick Guide

## ✅ Current Status

- ✅ **Project Linked:** magnificent-kindness (ID: be7c39ba-c311-42d0-9523-852b1857ee86)
- ✅ **Database:** PostgreSQL is set up
- ✅ **Environment Variables:** Configured
- ⚠️ **Current Service:** Postgres (database only)
- ❌ **Need:** Web service for Next.js app

---

## 🎯 Next Steps: Deploy Your Next.js App

You have **two options**:

### Option 1: Create New Web Service (Recommended)

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86
   - Or run: `railway open` (opens in browser)

2. **Create New Service:**
   - Click **"+ New"** button
   - Select **"GitHub Repo"** (if you have code on GitHub)
   - OR select **"Empty Service"** then deploy via CLI

3. **Deploy via CLI:**
   ```bash
   # Make sure you're in your project directory
   cd C:\Users\joe_freightos\Desktop\next-board.io
   
   # Link to the project (select magnificent-kindness)
   railway link
   # When prompted, select: magnificent-kindness
   
   # Switch to the web service (or create new one)
   # If creating new service, Railway will prompt you
   
   # Deploy your app
   railway up
   ```

### Option 2: Deploy to Existing Service

If you already have a web service in your Railway project:

```bash
# List all services
railway service
# Select your Next.js/web service (not Postgres)

# Deploy
railway up
```

---

## 📋 Complete Deployment Checklist

### Step 1: Switch to Web Service
```bash
railway service
# Select your Next.js app service (not Postgres)
```

### Step 2: Verify Environment Variables
```bash
railway variables
```

**Make sure these are set on the WEB SERVICE (not Postgres):**
- ✅ `DATABASE_URL` (should reference the Postgres service)
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `ANTHROPIC_API_KEY`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- ✅ `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- ✅ `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

### Step 3: Deploy
```bash
railway up
```

### Step 4: Run Database Migrations
```bash
# Make sure you're on the web service
railway service  # Select web service
railway run npx prisma migrate deploy
```

### Step 5: Get Your App URL
```bash
railway domain
# Or
railway open
```

---

## 🔧 Important Notes

### Environment Variables Location

**Current Issue:** Your environment variables are on the **Postgres service**, but they need to be on the **Web service**!

**Solution:**
1. Switch to web service: `railway service` → Select web service
2. Add variables to web service:
   ```bash
   railway variables --set DATABASE_URL="postgresql://postgres:DcAyvwFiQTKqhMIDktdPCTkiKUHHmiEf@mainline.proxy.rlwy.net:42102/railway"
   railway variables --set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_ZnVsbC1iZWUtNzIuY2xlcmsuYWNjb3VudHMuZGV2JA"
   railway variables --set CLERK_SECRET_KEY="sk_test_h3WbKiz4bTLY05A6KQ1Nk9UoydZtgJHBKcaHLqLUsP"
   railway variables --set ANTHROPIC_API_KEY="sk-ant-api03-yWj8WxE3rYqsM_TsbjYzxI5D3mj-LAJR8K6kEQVy6NaQfSVTSMPFHVw7h7Y8ykKqaCOhw6DpwgCrZAVxEcJKNw-r5YW-QAA"
   # ... add all other variables
   ```

### Database URL

Use the **public URL** for the web service:
```
DATABASE_URL="postgresql://postgres:DcAyvwFiQTKqhMIDktdPCTkiKUHHmiEf@mainline.proxy.rlwy.net:42102/railway"
```

---

## 🚀 Quick Deploy Commands

```bash
# 1. Navigate to project
cd C:\Users\joe_freightos\Desktop\next-board.io

# 2. Link to project (if not already linked)
railway link
# Select: magnificent-kindness

# 3. Create/Select web service
railway service
# Create new service or select existing web service

# 4. Add environment variables (if not already on web service)
railway variables --set DATABASE_URL="postgresql://postgres:DcAyvwFiQTKqhMIDktdPCTkiKUHHmiEf@mainline.proxy.rlwy.net:42102/railway"
# ... add all other variables

# 5. Deploy
railway up

# 6. Run migrations
railway run npx prisma migrate deploy

# 7. Get URL
railway domain
```

---

## 🎯 What You Need to Do Right Now

1. **Open Railway Dashboard:**
   - Go to: https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86
   - Check if you have a web service (Next.js app service)
   - If not, create one: **"+ New"** → **"Empty Service"** or **"GitHub Repo"**

2. **Switch to Web Service:**
   ```bash
   railway service
   # Select your web service (not Postgres)
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

---

## ✅ Verification

After deployment:

```bash
# Check status
railway status

# View logs
railway logs

# Open app
railway open
```

Your app should be live at: `https://your-app.up.railway.app`

---

**Need help?** Check `STEP_BY_STEP_DEPLOYMENT.md` for detailed instructions!

