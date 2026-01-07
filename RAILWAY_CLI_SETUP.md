# 🚂 Railway Deployment Guide (Without GitHub)

Deploy NextBoard to Railway using the **Railway CLI** - no GitHub required!

---

## 📋 Prerequisites

- Railway account ([Sign up free](https://railway.app))
- Your NextBoard project folder
- OpenAI API key

---

## 🔧 Step-by-Step Setup

### **Step 1: Install Railway CLI**

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Verify installation
railway --version
```

### **Step 2: Login to Railway**

```bash
# Login to Railway (opens browser)
railway login
```

This will open your browser to authenticate. Once done, return to terminal.

---

### **Step 3: Initialize Railway Project**

```bash
# Navigate to your project folder
cd next-board.io

# Initialize Railway project
railway init

# Follow the prompts:
# - Create a new project? → Yes
# - Project name? → nextboard (or your choice)
```

---

### **Step 4: Add PostgreSQL Database**

```bash
# Add PostgreSQL to your project
railway add --database postgresql

# Wait for database to be provisioned (~30 seconds)
```

Railway will automatically:
- ✅ Create PostgreSQL database
- ✅ Set `DATABASE_URL` environment variable
- ✅ Link database to your project

---

### **Step 5: Set Environment Variables**

```bash
# Set your OpenAI API key
railway variables --set OPENAI_API_KEY="your-openai-api-key-here"

# Verify variables are set
railway variables
```

You should see:
- `DATABASE_URL` (auto-set by Railway)
- `OPENAI_API_KEY` (you just set this)

---

### **Step 6: Deploy Your App**

```bash
# Deploy to Railway
railway up

# This will:
# 1. Upload your code
# 2. Install dependencies
# 3. Run Prisma migrations
# 4. Build Next.js app
# 5. Start the server on port 3005
```

**Wait for deployment to complete** (~2-3 minutes)

---

### **Step 7: Get Your App URL**

```bash
# Generate a public URL
railway domain

# Or open in browser directly
railway open
```

Your app will be available at: `https://your-app.up.railway.app`

---

## 🎯 Quick Commands Reference

```bash
# Deploy/update app
railway up

# View logs in real-time
railway logs

# Open app in browser
railway open

# Open Railway dashboard
railway open --dashboard

# Run commands in Railway environment
railway run npm run db:studio

# Check deployment status
railway status

# View environment variables
railway variables

# Link existing Railway project
railway link
```

---

## 📝 Port Configuration

Your app is configured to run on:
- **Local Development**: Port 3005
- **Railway Production**: Port 3005 (Railway will map to public URL)

### Test Locally on Port 3005

```bash
# Start development server
npm run dev

# App runs on http://localhost:3005
```

---

## 🔄 Update Your App

After making changes:

```bash
# 1. Deploy updated code
railway up

# 2. View logs to monitor
railway logs
```

---

## 🗄️ Database Management

### Run Migrations

```bash
# Run migrations on Railway
railway run npx prisma migrate deploy

# View database in Prisma Studio
railway run npx prisma studio
```

### Connect to Database

```bash
# Get database credentials
railway variables

# Connect with psql
railway connect postgresql
```

---

## 🐛 Troubleshooting

### "Railway not found"
```bash
# Reinstall CLI
npm install -g @railway/cli
```

### "Build failed"
```bash
# Check logs
railway logs

# Common issues:
# - Missing OPENAI_API_KEY
# - Database connection error
# - Build timeout
```

### "Database connection failed"
```bash
# Verify DATABASE_URL is set
railway variables

# Re-add database
railway add --database postgresql
```

### "Port already in use" (Local)
```bash
# Kill process on port 3005
# Windows:
netstat -ano | findstr :3005
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3005 | xargs kill -9
```

---

## 💡 Pro Tips

### 1. **Monitor Logs**
```bash
# Keep logs open in separate terminal
railway logs --follow
```

### 2. **Environment-Specific Settings**
Railway automatically sets:
- `NODE_ENV=production`
- `PORT=3005` (or Railway's assigned port)

### 3. **Database Backups**
```bash
# Export database
railway run npx prisma db pull
```

### 4. **Multiple Environments**
```bash
# Create staging environment
railway environment create staging

# Switch environments
railway environment use staging
```

---

## 📊 Deployment Checklist

Before deploying:
- ✅ OpenAI API key ready
- ✅ Railway CLI installed
- ✅ Logged into Railway
- ✅ Project initialized
- ✅ PostgreSQL added
- ✅ Environment variables set

After deploying:
- ✅ Check logs: `railway logs`
- ✅ Test upload functionality
- ✅ Test AI processing
- ✅ Test drag-and-drop
- ✅ Verify database working

---

## 🔐 Security Notes

- ✅ `.env` file is NOT uploaded (in `.gitignore`)
- ✅ Environment variables stored securely in Railway
- ✅ Database credentials auto-managed
- ✅ HTTPS enabled by default

---

## 💰 Pricing

- **Hobby Plan**: $5/month
  - Includes PostgreSQL database
  - 512MB RAM
  - 1GB storage
  
- **Starter**: Free trial available
  - 500 execution hours/month

Check: [railway.app/pricing](https://railway.app/pricing)

---

## 🎉 You're Live!

Once deployed, your NextBoard is accessible at:
```
https://your-app.up.railway.app
```

Test it:
1. Upload `sample-transcript.txt`
2. Generate board
3. Drag cards
4. Export as Markdown

---

## 📞 Need Help?

```bash
# Railway CLI help
railway --help

# Specific command help
railway up --help
```

**Railway Dashboard**: https://railway.app/dashboard

---

**Your app is now live on Railway! 🚀**

No GitHub needed. Just `railway up` to deploy!







