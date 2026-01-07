# 🚂 Railway Commands Cheat Sheet

Quick reference for deploying NextBoard to Railway **without GitHub**.

---

## 🚀 Initial Deployment (Do Once)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Go to your project
cd next-board.io

# 4. Initialize Railway project
railway init

# 5. Add PostgreSQL database
railway add --database postgresql

# 6. Set OpenAI API key
railway variables --set OPENAI_API_KEY="sk-your-key-here"

# 7. Deploy!
railway up

# 8. Open your live app
railway open
```

✅ **Done! Your app is live!**

---

## 🔄 Update Deployment (After Changes)

```bash
# Deploy updates
railway up

# View logs
railway logs
```

---

## 📊 Monitoring & Management

```bash
# View real-time logs
railway logs

# View log history
railway logs --follow

# Check app status
railway status

# View environment variables
railway variables

# Restart app
railway restart

# Open Railway dashboard
railway open --dashboard

# Get app URL
railway domain
```

---

## 🗄️ Database Commands

```bash
# View database in browser
railway run npx prisma studio

# Run migrations
railway run npx prisma migrate deploy

# Connect to PostgreSQL directly
railway connect postgresql

# View all services
railway service
```

---

## ⚙️ Environment Variables

```bash
# List all variables
railway variables

# Set a variable
railway variables --set KEY="value"

# Set multiple variables
railway variables --set KEY1="value1" --set KEY2="value2"

# Delete a variable
railway variables --unset KEY
```

---

## 🌍 Environment Management

```bash
# List environments
railway environment

# Create new environment (staging)
railway environment create staging

# Switch environment
railway environment use staging

# Deploy to specific environment
railway up --environment production
```

---

## 🔗 Project Management

```bash
# Link existing Railway project
railway link

# Unlink current project
railway unlink

# List all projects
railway list

# Create new project
railway init
```

---

## 🧪 Local Development

```bash
# Install dependencies
npm install

# Setup database locally
npx prisma generate
npx prisma migrate dev

# Start dev server (Port 3005)
npm run dev

# View database UI (Port 5005)
PORT=5005 npx prisma studio
```

**Open:**
- App: http://localhost:3005
- Database: http://localhost:5005

---

## 🐛 Debugging

```bash
# View detailed logs
railway logs --follow

# Check build logs
railway logs --deployment

# View specific service logs
railway logs --service <service-name>

# Check Railway CLI version
railway --version

# Update Railway CLI
npm update -g @railway/cli
```

---

## 🔐 Security

```bash
# View service tokens
railway whoami

# Generate new token
railway login --browserless

# Logout
railway logout
```

---

## 📦 Common Workflows

### Deploy New Version
```bash
# Make your changes, then:
railway up
railway logs
```

### Check if App is Running
```bash
railway status
railway open
```

### Database Migration
```bash
# After updating schema.prisma:
railway run npx prisma migrate deploy
```

### View Database Data
```bash
railway run npx prisma studio
# Opens in browser
```

### Roll Back (if needed)
```bash
# View deployments
railway open --dashboard
# Use Railway dashboard to rollback to previous deployment
```

---

## 💡 Pro Tips

### 1. Keep Logs Open While Deploying
```bash
# Terminal 1:
railway up

# Terminal 2:
railway logs --follow
```

### 2. Test Locally Before Deploying
```bash
npm run dev
# Test on http://localhost:3005
# Then: railway up
```

### 3. Quick Deploy Script
Create `deploy.sh`:
```bash
#!/bin/bash
echo "Deploying to Railway..."
railway up
echo "Viewing logs..."
railway logs
```

Then:
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Environment Variables Management
Keep a `.env.production` file (DO NOT COMMIT):
```env
OPENAI_API_KEY=sk-...
# Other production-only vars
```

---

## 🎯 Port Configuration

Your NextBoard uses:
- **Port 3005**: Next.js app (backend + frontend)
- **Port 5005**: Prisma Studio (database UI, optional)

Railway automatically handles port mapping in production.

---

## 📞 Get Help

```bash
# General help
railway --help

# Command-specific help
railway up --help
railway logs --help

# Railway documentation
# https://docs.railway.app
```

---

## ✅ Quick Health Check

```bash
# Is Railway CLI installed?
railway --version

# Am I logged in?
railway whoami

# Is my project linked?
railway status

# Are my env vars set?
railway variables

# Is my app running?
railway open
```

---

## 🚨 Emergency Commands

```bash
# App not responding?
railway restart

# Database connection issues?
railway run npx prisma migrate deploy

# Rebuild from scratch?
railway up --force

# Delete and recreate service?
railway service delete
railway add
```

---

**Save this file for quick reference!** 📌

All commands work **without GitHub** - Railway CLI uploads your code directly.







