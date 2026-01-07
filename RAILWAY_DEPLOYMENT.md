# 🚂 Railway Deployment Guide for NextBoard

## Quick Setup

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### 2. Create New Project

#### Option A: Deploy from GitHub (Recommended)
1. Push your code to GitHub
2. In Railway dashboard, click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `next-board` repository
5. Railway will auto-detect Next.js and configure deployment

#### Option B: Deploy with Railway CLI
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### 3. Add PostgreSQL Database
1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates and links `DATABASE_URL` environment variable

### 4. Add Environment Variables
In Railway project settings → **"Variables"** tab, add:

```bash
# AI Processing
ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_ZnVsbC1iZWUtNzIuY2xlcmsuYWNjb3VudHMuZGV2JA"
CLERK_SECRET_KEY="sk_test_h3WbKiz4bTLY05A6KQ1Nk9UoydZtgJHBKcaHLqLUsP"

# Email (Resend)
RESEND_API_KEY="re_ddD5TTv4_Nqxejwr28DUzSYTdfmr3pxks"
RESEND_FROM_EMAIL="onboarding@resend.dev"
RESEND_FROM_NAME="NextBoard"

# Cron Jobs
CRON_SECRET="cron-secret-531195-763483"

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Environment
NODE_ENV="production"
```

**Note:** `DATABASE_URL` is automatically provided by Railway's PostgreSQL service

### 5. Deploy
Railway will automatically:
- Install dependencies (`npm ci`)
- Generate Prisma client
- Run database migrations
- Build Next.js app
- Deploy to production

### 6. Access Your App
Railway provides a URL like: `https://your-app.up.railway.app`

---

## Custom Domain (Optional)
1. Go to project **Settings** → **Domains**
2. Click **"Generate Domain"** or add custom domain
3. Follow DNS configuration instructions

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Auto | Provided by Railway PostgreSQL |
| `ANTHROPIC_API_KEY` | ✅ Manual | Your Anthropic Claude API key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Manual | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ Manual | Clerk secret key |
| `RESEND_API_KEY` | ✅ Manual | Resend API key for emails |
| `RESEND_FROM_EMAIL` | ✅ Manual | Resend sender email |
| `RESEND_FROM_NAME` | Optional | Resend sender name (defaults to "NextBoard") |
| `CRON_SECRET` | ✅ Manual | Secret for cron job authentication |
| `NODE_ENV` | Auto | Set to `production` by Railway |

---

## Useful Railway Commands

```bash
# View logs
railway logs

# Open project in browser
railway open

# Run commands in Railway environment
railway run npm run db:studio

# Link local project to Railway
railway link
```

---

## Troubleshooting

### Build Fails
- Check Railway logs for errors
- Verify `DATABASE_URL` is set
- Ensure `OPENAI_API_KEY` is added

### Database Migration Issues
```bash
# Manually trigger migration
railway run npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
railway run npx prisma migrate reset
```

### Check Database Connection
```bash
railway run npx prisma db pull
```

---

## Cost
- **Hobby Plan**: $5/month (includes PostgreSQL)
- **Starter**: Free trial available
- Check [railway.app/pricing](https://railway.app/pricing)

---

## Production Checklist

- ✅ PostgreSQL database added
- ✅ `ANTHROPIC_API_KEY` environment variable set
- ✅ Clerk authentication keys configured
- ✅ Resend API key configured for emails
- ✅ CRON_SECRET configured for scheduled jobs
- ✅ Migrations run successfully
- ✅ Custom domain configured (optional)
- ✅ SSL/HTTPS enabled (automatic)

Your NextBoard app is now live! 🎉







