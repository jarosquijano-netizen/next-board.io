# 🔐 Clerk Authentication Setup Guide

## ✅ What's Been Installed

- ✅ Clerk Next.js SDK
- ✅ Authentication pages (`/sign-in`, `/sign-up`)
- ✅ Protected routes middleware
- ✅ User profile button with logout
- ✅ Database schema updated for multi-tenancy

---

## 🔑 Get Your Clerk API Keys

### Step 1: Create Clerk Account
1. Go to: https://clerk.com
2. Sign up for **free** (10,000 monthly active users included!)
3. Create a new application: "NextBoard"

### Step 2: Get API Keys
1. In Clerk dashboard, go to **"API Keys"**
2. Copy these values:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

---

## ⚙️ Add to .env File

Edit your `.env` file and add:

```env
# Database
DATABASE_URL="postgresql://postgres:DcAyvwFiQTKqhMIDktdPCTkiKUHHmiEf@mainline.proxy.rlwy.net:42102/railway"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_key_here"

# Clerk URLs (for local development)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Anthropic Claude API (Optional - runs in DEMO MODE without it)
# ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

---

## 🚂 Add to Railway

In your terminal:

```bash
# Set Clerk keys on Railway
railway variables --set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
railway variables --set CLERK_SECRET_KEY="sk_test_..."

# Set Clerk URLs
railway variables --set NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
railway variables --set NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
railway variables --set NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
railway variables --set NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Redeploy
railway up
```

---

## 🗄️ Update Database

Run the migration to add user fields:

```bash
# Generate migration
npx prisma migrate dev --name add_user_fields

# Or push directly (for development)
npx prisma db push
```

---

## 🧪 Test Authentication

1. **Start dev server**: `npm run dev`
2. **Open**: http://localhost:3005
3. You'll be redirected to sign-in
4. Click **"Sign up"**
5. Create account with email
6. Verify email
7. You're in! 🎉

---

## ✨ What You Get

### ✅ Out of the Box
- Email/password authentication
- Email verification
- Password reset
- User profiles
- Session management
- Logout functionality

### ✅ Enterprise Features (if needed later)
- Social logins (Google, GitHub, etc.)
- Multi-factor authentication (2FA)
- Organizations/teams
- Role-based access control (RBAC)
- Webhooks

---

## 🎯 How It Works

### Protected Routes
All routes are protected by default (middleware in `src/middleware.ts`)

**Public routes** (no auth needed):
- `/sign-in`
- `/sign-up`

**Protected routes** (requires login):
- `/` (main app)
- `/api/*` (all API routes)

### User Data in APIs
In your API routes, get the current user:

```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Now use userId to filter data
  const meetings = await prisma.meeting.findMany({
    where: { userId },
  });
  
  return NextResponse.json({ meetings });
}
```

---

## 🚀 Next Steps

1. ✅ Get Clerk API keys
2. ✅ Add to `.env`
3. ✅ Run database migration
4. ✅ Test local signup/login
5. ✅ Deploy to Railway with Clerk keys
6. ✅ Test production signup/login

---

## 💰 Pricing

**Clerk Free Tier:**
- ✅ 10,000 monthly active users
- ✅ Unlimited applications
- ✅ Email & password auth
- ✅ Social logins
- ✅ Community support

Perfect for launching! Upgrade only when you have 10K+ users 🚀

---

## 🐛 Troubleshooting

### "Missing publishableKey"
- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is in `.env`
- Restart dev server after adding

### "Invalid session"
- Clear browser cookies
- Sign out and sign in again

### "Redirect loop"
- Check `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"`
- Make sure middleware is correct

---

**Your NextBoard now has enterprise-grade authentication! 🔐**







