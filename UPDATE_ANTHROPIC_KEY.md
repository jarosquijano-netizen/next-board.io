# 🔄 Update Anthropic API Key

## Current Status
- ✅ Key exists in Anthropic: `sk-ant-api03-h2S...5AAA`
- ⚠️ Last used: Over 30 days ago (or never)
- ❌ Authentication failing in production

## Solution: Create New API Key

### Step 1: Create New Key in Anthropic

1. **Go to Anthropic Console:**
   - Visit: https://console.anthropic.com/
   - Sign in

2. **Create New API Key:**
   - Go to **"API Keys"** section
   - Click **"Create Key"**
   - Name it: "NextBoard Production - 2026"
   - Copy the **full key** (starts with `sk-ant-`)
   - ⚠️ **Save it immediately** - you won't see it again!

3. **Verify Credits:**
   - Go to **"Billing"** or **"Usage"**
   - Make sure you have credits available

---

### Step 2: Update in Railway Dashboard

1. **Go to Railway:**
   - Visit: https://railway.app
   - Open your project → Select **web service** (not Postgres)

2. **Update the Variable:**
   - Go to **"Variables"** tab
   - Find `ANTHROPIC_API_KEY`
   - Click the **three dots** (⋯) → **"Edit"**
   - Replace with your **new key**
   - Click **"Save"**

3. **Railway will auto-redeploy** (wait 2-3 minutes)

---

### Step 3: Verify It Works

1. **Check Railway Logs:**
   - Go to your web service → **"Logs"** tab
   - Look for: `🔑 Anthropic API Key detected: sk-ant-api...`
   - Should NOT see: `🎭 DEMO MODE`

2. **Test Processing:**
   - Go to your app: https://www.next-board.io
   - Click "New Board"
   - Try processing a transcript
   - Should work without authentication errors!

---

### Step 4: (Optional) Delete Old Key

Once the new key is working:

1. **Go back to Anthropic Console**
2. **Find the old key** (`sk-ant-api03-h2S...5AAA`)
3. **Click "Delete"** or **"Revoke"**
4. This keeps your account secure

---

## 🐛 If Still Not Working

### Check Railway Logs:
Look for these messages:
- ✅ `🔑 Anthropic API Key detected: sk-ant-api...` = Key is loaded
- ❌ `🎭 DEMO MODE: No ANTHROPIC_API_KEY found` = Key not found

### Common Issues:

1. **Service not redeployed:**
   - Manually trigger redeploy in Railway
   - Or push a small code change

2. **Key format issue:**
   - Make sure no extra spaces
   - Copy the entire key (starts with `sk-ant-`)

3. **No credits:**
   - Check Anthropic billing page
   - Add payment method if needed

---

## ✅ Success Checklist

- [ ] Created new API key in Anthropic
- [ ] Updated `ANTHROPIC_API_KEY` in Railway
- [ ] Waited for redeployment (2-3 min)
- [ ] Checked Railway logs - key detected
- [ ] Tested processing - no errors!
- [ ] (Optional) Deleted old unused key

---

**The new key should work immediately after Railway redeploys!** 🎉
