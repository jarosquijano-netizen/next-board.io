# 🌐 GoDaddy DNS Setup for next-board.io

## Railway DNS Configuration

Railway is asking you to add this DNS record:

```
Type: CNAME
Name: @
Value: i4aktv8r.up.railway.app
```

---

## ⚠️ Important: GoDaddy CNAME Limitation

**Problem:** GoDaddy (and many DNS providers) **DO NOT allow CNAME records on the root domain** (`@`). They only allow A records.

**Solution:** You have two options:

---

## ✅ Option 1: Use Domain Forwarding (Easiest - Recommended)

Since `www.next-board.io` is already working, forward the root domain to www:

### Steps:

1. **Go to GoDaddy:**
   - Visit: https://godaddy.com
   - Sign in

2. **Domain Settings:**
   - **My Products** → Find `next-board.io` → Click **"DNS"** or **"Manage"**

3. **Set Up Forwarding:**
   - Look for **"Forwarding"** section
   - Click **"Add"** or **"Manage"**
   - **Forward from:** `next-board.io` (leave blank or enter `@`)
   - **Forward to:** `https://www.next-board.io`
   - **Forward type:** `Permanent (301)`
   - **Settings:** 
     - ✅ Forward only
     - ✅ Update my nameservers and DNS records to support this change
   - Click **"Save"**

4. **Result:**
   - When users visit `next-board.io`, they'll be redirected to `www.next-board.io`
   - Your app will work on both domains
   - This is a common practice and works perfectly!

---

## ✅ Option 2: Contact Railway Support for A Records

If you want the root domain to work directly (without redirect):

1. **Contact Railway Support:**
   - Railway may be able to provide A records (IP addresses) instead of CNAME
   - This allows direct root domain access

2. **Or Check Railway Dashboard:**
   - Sometimes Railway shows both CNAME and A record options
   - Look for an "Alternative" or "A Records" option in the DNS modal

---

## ✅ Option 3: Try Adding CNAME Anyway (May Work)

Some GoDaddy accounts allow CNAME on root domain. Try it:

### Steps:

1. **Go to GoDaddy DNS:**
   - **My Products** → `next-board.io` → **DNS**

2. **Add CNAME Record:**
   - Click **"Add"** or **"+"** to add new record
   - **Type:** `CNAME`
   - **Name:** `@` (or leave blank for root)
   - **Value:** `i4aktv8r.up.railway.app`
   - **TTL:** `1 Hour` (or `600 seconds`)
   - Click **"Save"**

3. **If GoDaddy Rejects It:**
   - You'll see an error like "CNAME not allowed on root domain"
   - Use **Option 1** (Domain Forwarding) instead

---

## 📋 Recommended Approach

**I recommend Option 1 (Domain Forwarding)** because:
- ✅ Works immediately
- ✅ No DNS limitations
- ✅ Both domains work (`next-board.io` → redirects to → `www.next-board.io`)
- ✅ Common practice (most sites do this)
- ✅ No need to contact support

---

## 🔍 After Setup: Verify

1. **Wait 15-30 minutes** for DNS/forwarding to propagate

2. **Test:**
   ```powershell
   # Test DNS
   nslookup next-board.io
   ```

3. **Visit:**
   - `https://next-board.io` - Should redirect to www or show your app
   - `https://www.next-board.io` - Should show your app

4. **Check Railway:**
   - Railway dashboard → Domains
   - Should show ✅ "Valid Configuration" after DNS propagates

---

## 🆘 Troubleshooting

### Forwarding Not Working

- Wait 15-30 minutes
- Clear browser cache
- Try incognito mode
- Check GoDaddy → DNS → Forwarding is enabled

### Still Shows Placeholder

- DNS may not have propagated yet
- Check GoDaddy DNS records match Railway
- Verify forwarding is set up correctly

---

## ✅ Quick Checklist

- [ ] Choose option (1 = Forwarding, 2 = A Records, 3 = Try CNAME)
- [ ] Configure DNS/Forwarding in GoDaddy
- [ ] Wait 15-30 minutes
- [ ] Test `https://next-board.io`
- [ ] Verify in Railway dashboard (✅ status)
- [ ] Both domains work!

---

**My Recommendation: Use Domain Forwarding (Option 1) - it's the easiest and most reliable!**
