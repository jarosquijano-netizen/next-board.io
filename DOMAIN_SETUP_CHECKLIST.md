# 🌐 Domain Setup Checklist for next-board.io

## Current Issue
Your domain `next-board.io` is showing a Spanish "coming soon" page instead of your NextBoard application. This means the domain is not properly connected to your Railway deployment.

---

## ✅ Step-by-Step Fix

### Step 1: Verify Railway Deployment Status

1. **Check if your app is deployed:**
   - Go to: https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86
   - Look for your web service (not the database)
   - Check if it's running and has a URL like: `https://your-app.up.railway.app`

2. **If not deployed yet:**
   ```bash
   # Make sure you're in the project directory
   cd C:\Users\joe_freightos\Desktop\next-board.io
   
   # Link to Railway project
   railway link
   
   # Select your web service (not database)
   railway service
   
   # Deploy
   railway up
   ```

3. **Get your Railway app URL:**
   - In Railway dashboard → Your web service → Settings → Domains
   - Copy the Railway URL (e.g., `https://nextboard-production.up.railway.app`)

---

### Step 2: Add Custom Domain in Railway

1. **In Railway Dashboard:**
   - Go to your web service (not database)
   - Click **Settings** → **Domains**
   - Click **"Add Custom Domain"**
   - Enter: `next-board.io`
   - Click **"Add"**

2. **Railway will show you DNS records to add:**
   - Note down the CNAME or A record values Railway provides
   - You'll need these for GoDaddy

---

### Step 3: Configure GoDaddy DNS Records

1. **Log in to GoDaddy:**
   - Go to: https://godaddy.com
   - Sign in to your account

2. **Navigate to DNS Management:**
   - Go to **My Products**
   - Find `next-board.io` domain
   - Click **DNS** or **Manage DNS**

3. **Remove existing records (if any):**
   - Delete any A records pointing to placeholder IPs
   - Delete any CNAME records pointing to placeholder domains

4. **Add Railway DNS records:**

   **Option A: If Railway provides CNAME (recommended):**
   ```
   Type: CNAME
   Name: @
   Value: your-app.up.railway.app
   TTL: 1 Hour
   ```

   **Option B: If Railway provides A records:**
   ```
   Type: A
   Name: @
   Value: [IP address from Railway]
   TTL: 1 Hour
   ```

   **Also add www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: your-app.up.railway.app
   TTL: 1 Hour
   ```

5. **Save changes**

---

### Step 4: Wait for DNS Propagation

- DNS changes take **15 minutes to 48 hours** (usually 15-30 minutes)
- Check status in Railway dashboard → Domains
- When it shows ✅ **"Valid Configuration"**, DNS is working

**Check DNS propagation:**
```powershell
# In PowerShell
nslookup next-board.io
```

---

### Step 5: Update Clerk Domain

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.com
   - Sign in and select your application

2. **Add Production Domain:**
   - Go to **Domains** section
   - Click **"Add Domain"**
   - Enter: `next-board.io`
   - Click **"Add"**

3. **Update Allowed Origins:**
   - In **Settings** → **Allowed Origins**
   - Add: `https://next-board.io`
   - Add: `https://www.next-board.io`

---

### Step 6: Verify SSL Certificate

- Railway automatically provisions SSL certificates
- Wait 5-10 minutes after DNS is verified
- Check that `https://next-board.io` loads (not just `http://`)

---

### Step 7: Test Your Site

1. **Visit:** `https://next-board.io`
2. **Check:**
   - ✅ Site loads (not placeholder page)
   - ✅ SSL certificate is valid (green lock)
   - ✅ Sign-up/Sign-in works
   - ✅ App functionality works

---

## 🔧 Troubleshooting

### Domain Still Shows Placeholder Page

**Possible causes:**
1. DNS not propagated yet (wait 15-30 minutes)
2. Wrong DNS records in GoDaddy
3. Domain not added in Railway
4. Browser cache (try incognito mode)

**Fix:**
```powershell
# Clear DNS cache
ipconfig /flushdns

# Check DNS records
nslookup next-board.io
```

### Railway Shows "Invalid Configuration"

**Check:**
- DNS records match exactly what Railway shows
- No typos in domain name
- TTL is set (1 Hour recommended)
- Removed old/conflicting records

### SSL Certificate Not Working

- Wait 5-10 minutes after DNS verification
- Railway auto-provisions SSL certificates
- Check Railway dashboard → Domains → SSL status

### Clerk Authentication Not Working

- Verify domain is added in Clerk dashboard
- Check allowed origins include `https://next-board.io`
- Ensure you're using **live keys** (not test keys) in production

---

## 📋 Quick Reference

### Railway Commands
```bash
# Check deployment status
railway status

# View logs
railway logs

# Link to project
railway link

# Deploy
railway up
```

### DNS Records (Example)
```
Type: CNAME
Name: @
Value: nextboard-production.up.railway.app
TTL: 1 Hour

Type: CNAME
Name: www
Value: nextboard-production.up.railway.app
TTL: 1 Hour
```

---

## ✅ Final Checklist

- [ ] Railway app is deployed and running
- [ ] Custom domain added in Railway dashboard
- [ ] DNS records configured in GoDaddy
- [ ] DNS propagated (check with nslookup)
- [ ] Domain verified in Railway (shows ✅)
- [ ] SSL certificate active
- [ ] Domain added in Clerk dashboard
- [ ] Site loads at https://next-board.io
- [ ] Authentication works
- [ ] All features functional

---

## 🆘 Still Having Issues?

1. **Check Railway logs:**
   ```bash
   railway logs --tail 100
   ```

2. **Verify environment variables:**
   - Railway dashboard → Variables
   - Ensure all required vars are set

3. **Check Railway deployment:**
   - Railway dashboard → Deployments
   - Ensure latest deployment succeeded

4. **Contact support:**
   - Railway: https://railway.app/help
   - GoDaddy: https://www.godaddy.com/help

---

**Last Updated:** January 2025  
**Status:** Ready to configure
