# 🌐 Add Root Domain: next-board.io (Without www)

## Current Status
✅ Your Railway service "independent-hope" is deployed  
✅ `www.next-board.io` is working  
❌ `next-board.io` (root domain) shows placeholder page

---

## ✅ Quick Fix: Add Root Domain

### Step 1: Add Root Domain in Railway

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86
   - Click on your **"independent-hope"** service (the web service)

2. **Add Custom Domain:**
   - Click **"Settings"** tab (top right)
   - Click **"Domains"** in the left sidebar
   - Click **"Add Custom Domain"** or **"Add Domain"**
   - Enter: `next-board.io` (without www)
   - Click **"Add"**

3. **Railway will show DNS configuration:**
   - It will display DNS records you need to add
   - Usually shows a **CNAME** record or **A** records
   - **Copy these values** - you'll need them for GoDaddy

---

### Step 2: Update GoDaddy DNS

1. **Log in to GoDaddy:**
   - Go to: https://godaddy.com
   - Sign in to your account

2. **Go to DNS Management:**
   - **My Products** → Find `next-board.io` → Click **DNS** or **Manage DNS**

3. **Check Current DNS Records:**
   - Look for any **A records** with Name `@` (root domain)
   - These are likely pointing to the placeholder page IP

4. **Update Root Domain DNS:**

   **Option A: If Railway shows CNAME (recommended):**
   ```
   Type: CNAME
   Name: @
   Value: [your-app.up.railway.app] (same value as www)
   TTL: 1 Hour
   ```
   
   **Note:** Some DNS providers don't allow CNAME on root domain. If GoDaddy doesn't allow this:
   
   **Option B: Use A Records (if Railway provides IPs):**
   ```
   Type: A
   Name: @
   Value: [IP address from Railway]
   TTL: 1 Hour
   ```

5. **Keep www subdomain:**
   - Your `www` CNAME should already be correct
   - Don't change it if it's working

6. **Save changes**

---

### Step 3: Wait for DNS Propagation

- **Time:** 15-30 minutes (can take up to 48 hours)
- **Check in Railway:** Settings → Domains → Should show ✅ "Valid Configuration" for `next-board.io`

**Test DNS:**
```powershell
# In PowerShell
nslookup next-board.io
```

You should see Railway's IP addresses or CNAME.

---

### Step 4: Update Clerk (If Not Already Done)

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.com
   - Sign in → Select your app

2. **Add Root Domain:**
   - **Domains** → **"Add Domain"**
   - Enter: `next-board.io` (without www)
   - Click **"Add"**

3. **Verify Both Domains:**
   - `next-board.io` ✅
   - `www.next-board.io` ✅

---

### Step 5: Test Both Domains

After DNS propagates (15-30 minutes):

1. **Test root domain:**
   - Visit: `https://next-board.io`
   - Should show your app (not placeholder)

2. **Test www subdomain:**
   - Visit: `https://www.next-board.io`
   - Should still work

3. **Both should work!** ✅

---

## 🔧 Troubleshooting

### GoDaddy Doesn't Allow CNAME on Root Domain

Some DNS providers (including GoDaddy) don't allow CNAME records on the root domain (`@`). In this case:

1. **Use A Records:**
   - Railway should provide IP addresses
   - Add A records with those IPs

2. **Or Use GoDaddy's Domain Forwarding:**
   - GoDaddy → Domain Settings → Forwarding
   - Forward `next-board.io` → `https://www.next-board.io`
   - This redirects root to www

### Still Shows Placeholder After 30 Minutes

1. **Clear DNS cache:**
   ```powershell
   ipconfig /flushdns
   ```

2. **Try incognito/private browsing**

3. **Check DNS records match Railway exactly**

4. **Verify domain is added in Railway dashboard**

---

## 📋 Quick Checklist

- [ ] Root domain `next-board.io` added in Railway
- [ ] DNS records updated in GoDaddy for root domain
- [ ] DNS propagated (15-30 min wait)
- [ ] Domain verified in Railway (✅ status)
- [ ] Root domain added in Clerk
- [ ] `https://next-board.io` loads your app
- [ ] `https://www.next-board.io` still works

---

## 🎯 What You Need to Do RIGHT NOW

1. **Railway Dashboard:**
   - Go to "independent-hope" service → Settings → Domains
   - Add `next-board.io` (without www)
   - Copy the DNS values Railway shows

2. **GoDaddy:**
   - Update DNS records for root domain (`@`)
   - Use the values Railway provided

3. **Wait 15-30 minutes**

4. **Test:** Visit `https://next-board.io`

---

**The root domain needs to be added separately from www! Once you add it in Railway and update GoDaddy DNS, both will work.**
