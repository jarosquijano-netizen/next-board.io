# 🎯 START HERE - Railway Deployment (No GitHub)

## ✅ Your Project is Ready!

**Ports Configured:**
- Backend (Next.js): **Port 3005**
- Database Studio: **Port 5005** (optional, for development)

---

## 🚀 Deploy to Railway in 5 Commands

### **1. Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **2. Login to Railway**
```bash
railway login
```
*(Opens browser - sign up for free if needed)*

### **3. Create Project & Add Database**
```bash
# Navigate to your project
cd next-board.io

# Initialize Railway
railway init

# Add PostgreSQL
railway add --database postgresql
```

### **4. Set Your OpenAI API Key**
```bash
railway variables --set OPENAI_API_KEY="sk-your-actual-key-here"
```
**Get your key here:** https://platform.openai.com/api-keys

### **5. Deploy!**
```bash
railway up
```

**Wait 2-3 minutes...** then:
```bash
railway open
```

🎉 **Your app is LIVE!**

---

## 🧪 Test Locally First (Optional)

### **Install Dependencies**
```bash
npm install
```

### **Create .env File**
```bash
# Create .env file with:
DATABASE_URL="postgresql://user:password@localhost:5432/nextboard"
OPENAI_API_KEY="sk-your-key-here"
```

### **Setup Database**
```bash
npx prisma generate
npx prisma migrate dev
```

### **Start App**
```bash
# Backend runs on port 3005
npm run dev
```

**Open:** http://localhost:3005

### **View Database (Optional)**
```bash
# Database studio on port 5005
PORT=5005 npx prisma studio
```

**Open:** http://localhost:5005

---

## 📋 What Each Port Does

| Port | Service | URL |
|------|---------|-----|
| **3005** | Next.js App (Backend + Frontend) | http://localhost:3005 |
| **5005** | Prisma Studio (Database UI) | http://localhost:5005 |

---

## 🔄 Update Your App on Railway

After making changes:
```bash
railway up
```

That's it! No git, no commits needed.

---

## 📊 Check Deployment Status

```bash
# View real-time logs
railway logs

# Check if app is running
railway status

# Open Railway dashboard
railway open --dashboard
```

---

## 🐛 Troubleshooting

### "Port 3005 already in use"
```powershell
# Windows PowerShell
netstat -ano | findstr :3005
taskkill /PID <PID_NUMBER> /F
```

### "Database connection failed"
```bash
# Check if DATABASE_URL is set
railway variables

# Should show DATABASE_URL automatically
```

### "OpenAI API error"
```bash
# Verify your key is set correctly
railway variables

# Re-set if needed
railway variables --set OPENAI_API_KEY="sk-new-key"
```

---

## 🎁 Test Your App

1. **Upload** the included `sample-transcript.txt`
2. **Enter title:** "Weekly Team Sync"
3. **Click:** "Generate Board"
4. **Watch:** AI extracts ~8-10 action items
5. **Drag:** Cards between Pending → In Progress → Done
6. **Export:** Download as Markdown

---

## 📚 Full Documentation

- **DEPLOY_NOW.md** - Quick deployment
- **RAILWAY_CLI_SETUP.md** - Detailed Railway guide
- **API_DOCUMENTATION.md** - API reference
- **README.md** - Complete documentation

---

## 💡 Quick Railway Commands

```bash
railway up          # Deploy/update
railway logs        # View logs
railway open        # Open app
railway variables   # View env vars
railway restart     # Restart app
railway status      # Check status
```

---

## ✨ You're All Set!

**No GitHub needed.**  
**No complex setup.**  
**Just Railway CLI.**

Run these 5 commands and your AI-powered meeting board is live! 🚀

---

**Need help?** Check the documentation files or Railway's docs: https://docs.railway.app





