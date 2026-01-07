# 🔑 Fix Anthropic API Key Authentication Error

## Current API Key (Updated Jan 2026)
**Note:** API keys are stored in Railway environment variables, not in this repository for security.

## ❌ Current Error
```
Failed to process transcript
Details: Anthropic API authentication failed. Please check your ANTHROPIC_API_KEY environment variable.
💡 Make sure your API key is valid and has sufficient credits.
```

## ✅ Solution: Add/Update API Key in Railway

### Step 1: Get Your Anthropic API Key

1. **Go to Anthropic Console:**
   - Visit: https://console.anthropic.com/
   - Sign in (or create account if needed)

2. **Get API Key:**
   - Click **"API Keys"** in the sidebar
   - Click **"Create Key"**
   - Name it: "NextBoard Production"
   - Copy the key (starts with `sk-ant-`)
   - ⚠️ **Save it immediately** - you won't see it again!

3. **Check Credits:**
   - Go to **"Billing"** or **"Usage"**
   - Make sure you have credits available
   - New accounts usually get free credits

---

### Step 2: Add to Railway (Dashboard Method - Easiest)

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app
   - Sign in

2. **Select Your Project:**
   - Click on your project (likely "magnificent-kindness" or similar)
   - Click on your **web service** (NOT the Postgres service)

3. **Go to Variables Tab:**
   - Click **"Variables"** tab
   - Look for `ANTHROPIC_API_KEY`

4. **Add/Update the Key:**
   - If it exists: Click the key → Click "Edit" → Update value
   - If missing: Click **"New Variable"**
     - Name: `ANTHROPIC_API_KEY`
     - Value: Paste your `sk-ant-...` key
     - Click **"Add"**

5. **Railway will auto-redeploy** - wait 2-3 minutes

---

### Step 3: Add to Railway (CLI Method)

```powershell
# 1. Login to Railway
railway login

# 2. Link to your project (if not already)
railway link
# Select your project

# 3. Select your web service
railway service
# Select your web service (NOT Postgres)

# 4. Set the API key
railway variables --set ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"

# 5. Verify it's set
railway variables
# Should show ANTHROPIC_API_KEY

# 6. Redeploy (if needed)
railway up
```

---

### Step 4: Verify It Works

1. **Wait for deployment** (2-3 minutes)
2. **Test the app:**
   - Go to your app: https://www.next-board.io
   - Click "New Board"
   - Try pasting a transcript or uploading a file
   - Should process with real AI (not demo mode)

---

## 🎭 Alternative: Use Demo Mode (No API Key)

If you don't want to use real AI right now, you can run in **Demo Mode**:

1. **Remove the API key** (or don't set it)
2. **The app will use mock responses**
3. **Perfect for testing UI/UX**

To enable demo mode:
```bash
# Remove the variable
railway variables --unset ANTHROPIC_API_KEY
```

---

## 🐛 Troubleshooting

### Still Getting Authentication Error?

1. **Check the key format:**
   - Should start with `sk-ant-`
   - Should be ~50+ characters long
   - No spaces or extra characters

2. **Verify in Railway:**
   ```bash
   railway variables
   # Should show ANTHROPIC_API_KEY with your key
   ```

3. **Check Anthropic Console:**
   - Go to https://console.anthropic.com/settings/billing
   - Verify you have credits
   - Check if key is active

4. **Redeploy:**
   ```bash
   railway up
   ```

### Key Not Working?

- **Regenerate the key** in Anthropic Console
- **Update it in Railway**
- **Redeploy**

---

## 💰 Pricing Info

**Anthropic Claude 3.5 Haiku** (what NextBoard uses):
- **Input**: ~$0.25 per 1M tokens
- **Output**: ~$1.25 per 1M tokens

**Typical costs:**
- Small transcript (1,000 words): ~$0.01
- Medium transcript (5,000 words): ~$0.05
- Large transcript (10,000 words): ~$0.10

**Very affordable!** Most new accounts get free credits.

---

## ✅ Success Checklist

- [ ] Got API key from Anthropic Console
- [ ] Added `ANTHROPIC_API_KEY` to Railway web service
- [ ] Verified key is set (via dashboard or CLI)
- [ ] Waited for deployment to complete
- [ ] Tested processing a transcript
- [ ] No more authentication errors!

---

**Once the key is set, Railway will automatically redeploy and the error should be gone!** 🎉
