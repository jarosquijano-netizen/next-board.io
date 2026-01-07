# 🗄️ Database Migration: SQLite → PostgreSQL

## Current Setup

Your project currently uses **SQLite** (`prisma/schema.prisma` shows `provider = "sqlite"`).

For production, you need **PostgreSQL** because:
- ✅ Better performance
- ✅ Supports concurrent connections
- ✅ Required by Vercel/Netlify serverless functions
- ✅ Production-ready

---

## Option 1: Keep SQLite for Local, PostgreSQL for Production (Recommended)

You can keep SQLite for local development and use PostgreSQL in production.

### Step 1: Update Prisma Schema

Change `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 2: Set Up PostgreSQL Database

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Create new project → Add **PostgreSQL**
3. Copy the `DATABASE_URL` connection string

**Option B: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Settings → Database → Copy connection string

### Step 3: Create Migration

```bash
# Generate migration for PostgreSQL
npx prisma migrate dev --name switch_to_postgresql

# This will create a migration file
```

### Step 4: Update Environment Variables

**Local (.env):**
```env
# Keep SQLite for local dev (optional)
DATABASE_URL="file:./dev.db"
```

**Production (Vercel/Netlify):**
```env
# Use PostgreSQL in production
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Step 5: Deploy Migration

**For Vercel:**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

**For Netlify:**
```bash
netlify env:get DATABASE_URL > .env.production
npx prisma migrate deploy
```

**For Railway:**
```bash
railway link
railway run npx prisma migrate deploy
```

---

## Option 2: Use PostgreSQL for Both Local and Production

### Step 1: Set Up Local PostgreSQL

**Option A: Docker (Easiest)**
```bash
docker run --name nextboard-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=nextboard -p 5432:5432 -d postgres:15
```

**Option B: Install PostgreSQL Locally**
- Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Mac: `brew install postgresql@15`
- Linux: `sudo apt-get install postgresql`

### Step 2: Update Prisma Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Update Local .env

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/nextboard"
```

### Step 4: Run Migration

```bash
npx prisma migrate dev --name init_postgresql
```

---

## 📊 Migrating Existing Data (If You Have Data)

If you have data in SQLite that you want to migrate:

### Step 1: Export SQLite Data

```bash
# Install sqlite3 if needed
npm install -g sqlite3

# Export to SQL
sqlite3 prisma/dev.db .dump > data.sql
```

### Step 2: Convert SQL for PostgreSQL

PostgreSQL has some differences. You may need to:
- Remove SQLite-specific syntax
- Update data types
- Fix constraints

### Step 3: Import to PostgreSQL

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d nextboard

# Import data
\i data.sql
```

**Or use a migration tool:**
```bash
# Install pgloader (if available)
pgloader prisma/dev.db postgresql://user:password@host/database
```

---

## ✅ Verification

After migration, verify everything works:

```bash
# Generate Prisma client
npx prisma generate

# Open Prisma Studio to view data
npx prisma studio

# Test database connection
npx prisma db pull
```

---

## 🔧 Troubleshooting

### Error: "relation does not exist"
- Run migrations: `npx prisma migrate deploy`
- Or push schema: `npx prisma db push`

### Error: "connection refused"
- Check PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check firewall/network settings

### Error: "password authentication failed"
- Verify username/password in `DATABASE_URL`
- Check PostgreSQL user permissions

---

## 📝 Quick Reference

**Local Development:**
```bash
# SQLite (current)
DATABASE_URL="file:./dev.db"

# PostgreSQL (recommended)
DATABASE_URL="postgresql://postgres:password@localhost:5432/nextboard"
```

**Production:**
```bash
# Railway PostgreSQL
DATABASE_URL="postgresql://postgres:password@host.railway.app:5432/railway"

# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

---

## 🎯 Recommendation

**For production deployment:**
1. Set up Railway PostgreSQL (free tier)
2. Update Prisma schema to `postgresql`
3. Create migration
4. Deploy migration to production
5. Keep SQLite for local dev OR switch to local PostgreSQL

This gives you the best of both worlds! 🚀

