# 📧 Email Notifications - Quick Start

## ⚡ 5-Minute Setup

### 1. Get Resend API Key
1. Visit [resend.com](https://resend.com) and sign up (FREE - 100 emails/day)
2. Copy your API key from the dashboard

### 2. Run Setup Script
```powershell
.\setup-email-notifications.ps1
```

This will:
- Prompt for your Resend API key
- Configure email settings
- Generate a secure CRON_SECRET
- Update your .env file

### 3. Restart Dev Server
```bash
npm run dev
```

### 4. Sync Your User
When you sign in, your Clerk user needs to be synced to the database:

**Option A:** Add to your sign-in callback (recommended):
```typescript
// In your app
useEffect(() => {
  fetch('/api/user/sync', { method: 'POST' });
}, []);
```

**Option B:** Manual sync via API:
```bash
curl -X POST http://localhost:3005/api/user/sync
```

---

## ✅ That's It!

Your email notification system is now active!

### What Happens Now:

✉️ **Daily Digests** - Sent at 8 AM (configurable per user)
- Shows overdue items
- Lists items due today
- Highlights blocked items
- Summary of yesterday's completions

⚠️ **Overdue Alerts** - Checked every 6 hours
- One alert per day per overdue item
- Shows how many days overdue

🎯 **Due Today Alerts** - Sent at 8 AM
- Notifies about items due that day
- One alert per item

🚧 **Blocked Alerts** - Checked every 12 hours
- For items blocked >24 hours
- Reminds to unblock tasks

---

## 🧪 Test It Now

### Send a Test Email
```bash
# Test daily digest
curl -X POST http://localhost:3005/api/cron/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"type": "daily-digest", "secret": "YOUR_CRON_SECRET"}'
```

Replace `YOUR_CRON_SECRET` with the value from your `.env` file.

### Preview Email Templates
```bash
npm run email:dev
```

Opens a preview server at `http://localhost:3000` to view all email designs.

---

## ⚙️ User Preferences

Users can customize their notification settings:

**API Endpoints:**
- `GET /api/notifications/preferences` - Get current preferences
- `PUT /api/notifications/preferences` - Update preferences

**Settings Include:**
- Daily digest time (default: 8:00 AM)
- Enable/disable each notification type
- Quiet hours (e.g., 10 PM - 8 AM)
- Weekly report day

---

## 🚀 Production Deployment

### Railway Setup

1. **Add Environment Variables:**
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (use your verified domain)
   - `RESEND_FROM_NAME`
   - `APP_URL` (your Railway URL)
   - `CRON_SECRET`

2. **Deploy:**
   ```bash
   git push
   ```

3. **Cron Jobs Auto-Configured:**
   Railway will automatically pick up the cron jobs from `railway.json`!

### Verify Domain in Resend

For production, verify your domain:
1. Go to Resend dashboard → Domains
2. Add your domain
3. Add DNS records as shown
4. Update `RESEND_FROM_EMAIL` to use your domain

---

## 📊 Monitoring

### Check Notification Logs
```sql
-- View recent notifications
SELECT * FROM Notification 
ORDER BY createdAt DESC 
LIMIT 50;

-- Check failed emails
SELECT * FROM Notification 
WHERE emailSent = false;
```

### Cron Job Status
Check Railway logs for cron execution:
```bash
railway logs
```

---

## 🆘 Troubleshooting

### Emails Not Sending?

1. **Check API key:**
   ```bash
   # In PowerShell
   $env:RESEND_API_KEY
   ```

2. **Use test email for development:**
   Set `RESEND_FROM_EMAIL=onboarding@resend.dev`

3. **Check user is synced:**
   ```bash
   curl http://localhost:3005/api/user/sync
   ```

### Cron Jobs Not Running?

1. Test manually:
   ```bash
   curl "http://localhost:3005/api/cron/email-notifications?type=due-today&secret=YOUR_SECRET"
   ```

2. Check Railway cron logs in dashboard

---

## 📚 Full Documentation

For complete details, see: **EMAIL_NOTIFICATION_SETUP.md**

---

## 🎨 Next Steps

Consider building:
- Settings UI page (`/settings/notifications`)
- In-app notification center
- Additional email templates
- Slack integration
- SMS alerts via Twilio

---

**You're all set! 🎉**

Your users will now stay informed about their action items automatically!





