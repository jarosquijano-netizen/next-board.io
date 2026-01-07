# 🔧 Fix Railway Login Error

## Error
```
An attempt was made to access a socket in a way forbidden by its access permissions. (os error 10013)
```

This is a Windows permission issue preventing Railway CLI from opening the browser.

---

## ✅ Solution 1: Use Railway API Token Instead

### Step 1: Get API Token from Railway Dashboard

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/account
   - Or: https://railway.app → Click your profile → Settings → Tokens

2. **Create Token:**
   - Click "New Token" or "Create Token"
   - Give it a name (e.g., "CLI Deployment")
   - Copy the token (you'll only see it once!)

### Step 2: Set Token and Deploy

Run these commands in PowerShell:

```powershell
# Set the token (replace YOUR_TOKEN with actual token)
$env:RAILWAY_TOKEN = "YOUR_TOKEN_HERE"

# Verify it's set
echo $env:RAILWAY_TOKEN

# Now deploy
railway link
railway service  # Select: independent-hope
railway up
```

---

## ✅ Solution 2: Fix Windows Permission Issue

### Option A: Run PowerShell as Administrator

1. **Right-click PowerShell**
2. **Select "Run as Administrator"**
3. **Navigate to project:**
   ```powershell
   cd C:\Users\joe_freightos\Desktop\next-board.io
   ```
4. **Try login again:**
   ```powershell
   railway login
   ```

### Option B: Check Windows Firewall

The error might be Windows Firewall blocking Railway CLI:

1. **Windows Security** → **Firewall & network protection**
2. **Allow an app through firewall**
3. **Check if Node.js/Railway CLI is allowed**

---

## ✅ Solution 3: Use Railway Dashboard (Easiest!)

Since CLI has issues, use the dashboard:

1. **Go to Railway Dashboard:**
   - https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86

2. **Connect to GitHub** (Best long-term solution):
   - Click "independent-hope" service
   - Settings → Connect GitHub
   - Push your code to GitHub first
   - Railway will auto-deploy!

3. **Or Redeploy Manually:**
   - Deployments tab → Redeploy
   - (But might use old files)

---

## 🎯 Recommended: Use API Token

**Get token from Railway Dashboard, then I can deploy for you!**

1. Go to: https://railway.app/account → Tokens
2. Create new token
3. Share it with me (or set it yourself)
4. I'll deploy!

---

**Which solution do you want to try?**
