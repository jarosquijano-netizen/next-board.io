# 🚀 Production Deployment - Step-by-Step Guide

## 📋 Complete Checklist (In Order)

Follow these steps **in order** - don't skip ahead!

---

## ✅ STEP 1: Prepare Your Database (5 minutes)

### 1.1 Create PostgreSQL Database

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait ~30 seconds for database to be created
5. Click on the PostgreSQL service
6. Go to **"Variables"** tab
7. Copy the `DATABASE_URL` value (you'll need this later!)

**Option B: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details and wait for creation
4. Go to **Settings** → **Database**
5. Copy the **Connection string** (URI format)
6. This is your `DATABASE_URL`

### 1.2 Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 1.3 Test Database Connection Locally (Optional)

```bash
# Update your local .env with PostgreSQL URL temporarily
# Then test:
npx prisma generate
npx prisma db push
```

**✅ Checkpoint:** You should have a `DATABASE_URL` ready!

---

## ✅ STEP 2: Choose Your Platform & Install CLI

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login (opens browser)
vercel login
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login (opens browser)
netlify login
```

### Option C: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login (opens browser)
railway login
```

**✅ Checkpoint:** CLI installed and logged in!

---

## ✅ STEP 3: Deploy Your Code (5 minutes)

### If Using Vercel:

```bash
# Navigate to your project
cd C:\Users\joe_freightos\Desktop\next-board.io

# Deploy (follow prompts)
vercel

# When prompted:
# - Set up and deploy? → Yes
# - Which scope? → Your account
# - Link to existing project? → No (first time)
# - Project name? → next-board (or your choice)
# - Directory? → ./
# - Override settings? → No

# For production:
vercel --prod
```

### If Using Netlify:

```bash
# Navigate to your project
cd C:\Users\joe_freightos\Desktop\next-board.io

# Deploy (follow prompts)
netlify deploy

# When prompted:
# - Create & configure a new site? → Yes
# - Team? → Your team
# - Site name? → next-board (or your choice)

# For production:
netlify deploy --prod
```

### If Using Railway:

```bash
# Navigate to your project
cd C:\Users\joe_freightos\Desktop\next-board.io

# Initialize (if first time)
railway init

# Deploy
railway up
```

**✅ Checkpoint:** Code is deployed! You'll get a URL like `https://your-app.vercel.app`

---

## ✅ STEP 4: Add Environment Variables (10 minutes)

### If Using Vercel:

**Method 1: Via CLI (Easier)**
```bash
# Add each variable one by one
vercel env add DATABASE_URL production
# Paste your DATABASE_URL when prompted

vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste your Clerk publishable key

vercel env add CLERK_SECRET_KEY production
# Paste your Clerk secret key

vercel env add ANTHROPIC_API_KEY production
# Paste your Anthropic API key

vercel env add RESEND_API_KEY production
# Paste your Resend API key (if using email)

vercel env add CRON_SECRET production
# Enter a random secret string (e.g., "my-secret-123-xyz")

# Add Clerk URLs
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
# Enter: /sign-in

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
# Enter: /sign-up

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
# Enter: /

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
# Enter: /

vercel env add NODE_ENV production
# Enter: production
```

**Method 2: Via Dashboard**
1. Go to [vercel.com](https://vercel.com) → Your project → **Settings** → **Environment Variables**
2. Add each variable manually (see list below)

### If Using Netlify:

```bash
# Add each variable
netlify env:set DATABASE_URL "postgresql://your-connection-string"
netlify env:set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "pk_live_..."
netlify env:set CLERK_SECRET_KEY "sk_live_..."
netlify env:set ANTHROPIC_API_KEY "sk-ant-..."
netlify env:set RESEND_API_KEY "re_..."
netlify env:set CRON_SECRET "your-random-secret"
netlify env:set NEXT_PUBLIC_CLERK_SIGN_IN_URL "/sign-in"
netlify env:set NEXT_PUBLIC_CLERK_SIGN_UP_URL "/sign-up"
netlify env:set NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL "/"
netlify env:set NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL "/"
netlify env:set NODE_ENV "production"
```

### If Using Railway:

```bash
railway variables --set DATABASE_URL="postgresql://your-connection-string"
railway variables --set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
railway variables --set CLERK_SECRET_KEY="sk_live_..."
railway variables --set ANTHROPIC_API_KEY="sk-ant-..."
railway variables --set RESEND_API_KEY="re_ddD5TTv4_Nqxejwr28DUzSYTdfmr3pxks"
railway variables --set RESEND_FROM_EMAIL="onboarding@resend.dev"
railway variables --set RESEND_FROM_NAME="NextBoard"
railway variables --set CRON_SECRET="cron-secret-531195-763483"
railway variables --set NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
railway variables --set NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
railway variables --set NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
railway variables --set NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
railway variables --set NODE_ENV="production"
```

**Required Environment Variables:**
```env
DATABASE_URL="postgresql://..."                    # From Step 1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."    # From Clerk dashboard
CLERK_SECRET_KEY="sk_live_..."                     # From Clerk dashboard
ANTHROPIC_API_KEY="sk-ant-..."                     # From Anthropic
RESEND_API_KEY="re_ddD5TTv4_Nqxejwr28DUzSYTdfmr3pxks"  # From Resend
RESEND_FROM_EMAIL="onboarding@resend.dev"              # Resend sender email
RESEND_FROM_NAME="NextBoard"                           # Resend sender name
CRON_SECRET="cron-secret-531195-763483"                # Generated secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
NODE_ENV="production"
```

**✅ Checkpoint:** All environment variables added!

---

## ✅ STEP 5: Run Database Migrations (2 minutes)

### If Using Railway Database:

```bash
railway link
railway run npx prisma migrate deploy
```

### If Using External Database (Supabase, etc.):

```bash
# Set DATABASE_URL temporarily
$env:DATABASE_URL="postgresql://your-connection-string"

# Run migrations
npx prisma migrate deploy

# Or generate and push
npx prisma generate
npx prisma db push
```

**✅ Checkpoint:** Database tables created!

---

## ✅ STEP 6: Redeploy with Environment Variables (2 minutes)

After adding environment variables, you need to redeploy:

### Vercel:
```bash
vercel --prod
```

### Netlify:
```bash
netlify deploy --prod
```

### Railway:
```bash
railway up
```

**✅ Checkpoint:** App redeployed with all variables!

---

## ✅ STEP 7: Test Your Deployment (5 minutes)

1. **Open your app URL** (e.g., `https://your-app.vercel.app`)
2. **Test sign-up/sign-in** - Should redirect to Clerk
3. **Test file upload** - Upload a test transcript
4. **Test AI processing** - Generate a board
5. **Check for errors** - Open browser console (F12)

**Common Issues:**
- ❌ "Database connection failed" → Check `DATABASE_URL` is correct
- ❌ "Clerk error" → Check Clerk keys are LIVE keys (not test)
- ❌ "API key invalid" → Check Anthropic API key is correct

**✅ Checkpoint:** App is working!

---

## ✅ STEP 8: Connect GoDaddy Domain (10 minutes)

### If Using Vercel:

**8.1 Add Domain in Vercel:**
1. Go to Vercel dashboard → Your project → **Settings** → **Domains**
2. Enter your domain: `next-board.io` (or `www.next-board.io`)
3. Click **"Add"**
4. Vercel will show you DNS records to add

**8.2 Configure DNS in GoDaddy:**
1. Log in to [GoDaddy.com](https://godaddy.com)
2. Go to **My Products** → Click **DNS** next to your domain
3. **Delete existing A records** for `@` (if any)
4. **Add new A records:**
   - Type: **A** | Name: `@` | Value: `76.76.21.21` | TTL: 1 Hour
   - Type: **A** | Name: `@` | Value: `76.76.21.22` | TTL: 1 Hour
5. **Add CNAME record:**
   - Type: **CNAME** | Name: `www` | Value: `cname.vercel-dns.com` | TTL: 1 Hour
6. **Save** and wait 15-30 minutes

**8.3 Verify in Vercel:**
- Go back to Vercel → Domains
- Wait for ✅ **"Valid Configuration"** status

### If Using Netlify:

**8.1 Add Domain in Netlify:**
1. Go to Netlify dashboard → Your site → **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `next-board.io`
4. Click **"Verify"**
5. Netlify will show DNS records

**8.2 Configure DNS in GoDaddy:**
1. Log in to [GoDaddy.com](https://godaddy.com)
2. Go to **My Products** → Click **DNS** next to your domain
3. **Add A records:**
   - Type: **A** | Name: `@` | Value: `75.2.60.5` | TTL: 1 Hour
   - Type: **A** | Name: `@` | Value: `99.83.190.102` | TTL: 1 Hour
4. **Add CNAME:**
   - Type: **CNAME** | Name: `www` | Value: `your-site.netlify.app` | TTL: 1 Hour
5. **Save** and wait 15-30 minutes

### If Using Railway:

**8.1 Add Domain in Railway:**
1. Go to Railway dashboard → Your project → **Settings** → **Domains**
2. Click **"Generate Domain"** or **"Add Custom Domain"**
3. Enter: `next-board.io`
4. Railway will show DNS records

**8.2 Configure DNS in GoDaddy:**
- Follow Railway's DNS instructions (they'll show exact values)

**✅ Checkpoint:** Domain connected! (May take 15-30 minutes to propagate)

---

## ✅ STEP 9: Update Clerk Domain (2 minutes)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Domains** section
4. Add your production domain: `next-board.io`
5. Update **Allowed origins** if needed
6. Save changes

**✅ Checkpoint:** Clerk configured for production!

---

## ✅ STEP 10: Final Verification (5 minutes)

### Checklist:

- [ ] App loads at your custom domain
- [ ] SSL certificate is active (HTTPS works)
- [ ] Sign-up works
- [ ] Sign-in works
- [ ] File upload works
- [ ] AI processing works
- [ ] Database is connected
- [ ] No errors in browser console
- [ ] No errors in deployment logs

### Test Everything:

1. **Visit:** `https://your-domain.com`
2. **Sign up** with a test account
3. **Upload** a test transcript file
4. **Generate** a board
5. **Drag cards** between columns
6. **Export** as Markdown

**✅ Checkpoint:** Everything works!

---

## 🎉 You're Live!

Your NextBoard app is now running in production at: **https://your-domain.com**

---

## 🔄 Updating Your App Later

After making code changes:

### Vercel:
```bash
vercel --prod
```

### Netlify:
```bash
netlify deploy --prod
```

### Railway:
```bash
railway up
```

---

## 🆘 Troubleshooting

### Database Issues:
```bash
# Check connection
railway run npx prisma db pull

# View logs
railway logs
```

### Environment Variables:
```bash
# Vercel
vercel env ls

# Netlify
netlify env:list

# Railway
railway variables
```

### Domain Issues:
- Check DNS propagation: `nslookup your-domain.com`
- Wait 15-30 minutes after DNS changes
- Verify SSL certificate is active

---

## 📚 Quick Reference

**Vercel:** `vercel --prod`  
**Netlify:** `netlify deploy --prod`  
**Railway:** `railway up`

**Database:** Railway PostgreSQL or Supabase  
**Domain:** GoDaddy DNS configuration  
**Clerk:** Update domains in Clerk dashboard

---

**Follow these steps in order, and you'll be live in ~30 minutes!** 🚀

