# 🚀 Deploy NextBoard Right Now (No GitHub)

## Quick 5-Step Deployment

### **Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **Step 2: Login**
```bash
railway login
```

### **Step 3: Initialize Project**
```bash
cd next-board.io
railway init
```
- Choose: **"Create new project"**
- Name it: **"nextboard"**

### **Step 4: Add Database & Set Variables**
```bash
# Add PostgreSQL
railway add --database postgresql

# Set OpenAI API Key
railway variables --set OPENAI_API_KEY="your-actual-openai-key-here"
```

### **Step 5: Deploy!**
```bash
railway up
```

Wait 2-3 minutes, then:
```bash
railway open
```

**Done!** Your app is live! 🎉

---

## 🧪 Test Your Live App

1. Upload `sample-transcript.txt`
2. Click "Generate Board"
3. Watch AI extract action items
4. Drag cards between columns
5. Export as Markdown

---

## 🔄 Update Your App Later

```bash
# After making changes:
railway up

# View logs:
railway logs
```

---

## 📱 Your App URLs

```bash
# Get public URL
railway domain

# Or open directly
railway open
```

---

## ⚙️ Port Configuration

Your app runs on:
- **Local**: `http://localhost:3005`
- **Production**: Railway provides public URL (HTTPS enabled)

To test locally:
```bash
npm run dev
# Open: http://localhost:3005
```

---

## 🐛 If Something Goes Wrong

```bash
# Check logs
railway logs

# Check environment variables
railway variables

# Restart service
railway restart
```

---

## 💡 Quick Commands

| Command | What it does |
|---------|--------------|
| `railway up` | Deploy/update app |
| `railway logs` | View logs |
| `railway open` | Open app in browser |
| `railway variables` | Show env vars |
| `railway restart` | Restart service |
| `railway run <command>` | Run command on Railway |

---

**That's it! No GitHub, no hassle.** 🚂

Your NextBoard is live on Railway with PostgreSQL and AI processing!







