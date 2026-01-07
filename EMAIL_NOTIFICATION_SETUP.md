# 📧 Email Notification System - Setup Guide

## Overview

The NextBoard email notification system keeps users informed about their action items, deadlines, and team activity using **Resend** for email delivery and beautiful **React Email** templates.

---

## 🚀 Quick Start

### 1. Install Dependencies (Already Done ✓)

```bash
npm install resend @react-email/components react-email
```

### 2. Get Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your domain (or use Resend's test domain for development)
4. Get your API key from the dashboard

### 3. Add Environment Variables

Add these to your `.env` file:

```bash
# Email Notifications
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@yourdomain.com
RESEND_FROM_NAME=NextBoard
APP_URL=http://localhost:3005
CRON_SECRET=your-secure-random-string-here
```

**For Development:**
- Use `onboarding@resend.dev` as `RESEND_FROM_EMAIL` (Resend's test domain)
- Set `APP_URL=http://localhost:3005`

**For Production:**
- Verify your domain in Resend
- Use your actual domain email: `notifications@yourdomain.com`
- Set `APP_URL=https://your-app.railway.app`

**Generate CRON_SECRET:**
```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 4. Sync Your User Profile

When you first log in, you need to sync your Clerk user to the database:

```bash
# Make a POST request (or add a button in your UI)
curl -X POST http://localhost:3005/api/user/sync \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Or add this to your app's sign-in flow (recommended).

### 5. Set Up Cron Jobs

#### **Option A: Railway (Recommended for Production)**

Add to your `railway.json`:

```json
{
  "crons": [
    {
      "name": "daily-digest",
      "schedule": "0 * * * *",
      "command": "curl $RAILWAY_PUBLIC_DOMAIN/api/cron/email-notifications?type=daily-digest&secret=$CRON_SECRET"
    },
    {
      "name": "due-today",
      "schedule": "0 8 * * *",
      "command": "curl $RAILWAY_PUBLIC_DOMAIN/api/cron/email-notifications?type=due-today&secret=$CRON_SECRET"
    },
    {
      "name": "overdue-check",
      "schedule": "0 */6 * * *",
      "command": "curl $RAILWAY_PUBLIC_DOMAIN/api/cron/email-notifications?type=overdue-check&secret=$CRON_SECRET"
    },
    {
      "name": "blocked-alerts",
      "schedule": "0 */12 * * *",
      "command": "curl $RAILWAY_PUBLIC_DOMAIN/api/cron/email-notifications?type=blocked-alerts&secret=$CRON_SECRET"
    }
  ]
}
```

#### **Option B: External Cron Service (cron-job.org, EasyCron)**

Schedule these URLs:

```
https://your-app.railway.app/api/cron/email-notifications?type=daily-digest&secret=YOUR_SECRET
https://your-app.railway.app/api/cron/email-notifications?type=due-today&secret=YOUR_SECRET
https://your-app.railway.app/api/cron/email-notifications?type=overdue-check&secret=YOUR_SECRET
https://your-app.railway.app/api/cron/email-notifications?type=blocked-alerts&secret=YOUR_SECRET
```

**Recommended Schedules:**
- **Daily Digest**: Every hour (`0 * * * *`) - checks user preferences for send time
- **Due Today**: 8 AM daily (`0 8 * * *`)
- **Overdue Check**: Every 6 hours (`0 */6 * * *`)
- **Blocked Alerts**: Every 12 hours (`0 */12 * * *`)

---

## 📧 Notification Types

### 1. **Daily Digest** 📊
- Sent at user's preferred time (default: 8 AM)
- Shows overdue, due today, and blocked items
- Includes completion stats from yesterday
- Only sent if there are items needing attention

### 2. **Overdue Alerts** ⚠️
- Sent once per day per overdue card
- Shows how many days overdue
- Urgent styling to grab attention

### 3. **Due Today Alerts** 🎯
- Sent at 8 AM for items due that day
- One alert per card
- Helps users plan their day

### 4. **Blocked Alerts** 🚧
- Sent for cards blocked >24 hours
- Reminds users to unblock items
- Sent at most once per day

---

## ⚙️ User Preferences

Users can control their notification settings via `/api/notifications/preferences`:

```typescript
{
  dailyDigest: boolean,          // Default: true
  dailyDigestTime: string,       // Default: "08:00"
  overdueAlerts: boolean,         // Default: true
  dueTodayAlerts: boolean,        // Default: true
  dueTomorrowAlerts: boolean,     // Default: true
  assignedToMe: boolean,          // Default: true
  mentioned: boolean,             // Default: true
  cardComments: boolean,          // Default: true
  blockedAlerts: boolean,         // Default: true
  priorityEscalation: boolean,    // Default: true
  weeklyReport: boolean,          // Default: true
  weeklyReportDay: string,        // Default: "monday"
  enableQuietHours: boolean,      // Default: false
  quietHoursStart: string,        // Default: "22:00"
  quietHoursEnd: string,          // Default: "08:00"
}
```

---

## 🧪 Testing

### Manual Test Emails

```bash
# Test daily digest
curl -X POST http://localhost:3005/api/cron/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"type": "daily-digest", "secret": "YOUR_CRON_SECRET"}'

# Test overdue check
curl -X POST http://localhost:3005/api/cron/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"type": "overdue-check", "secret": "YOUR_CRON_SECRET"}'

# Test due today
curl -X POST http://localhost:3005/api/cron/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"type": "due-today", "secret": "YOUR_CRON_SECRET"}'
```

### Preview Emails Locally

React Email provides a dev server:

```bash
npm run email:dev
```

This will start a preview server at `http://localhost:3000` where you can see all your email templates.

Add to `package.json`:

```json
{
  "scripts": {
    "email:dev": "email dev"
  }
}
```

---

## 🎨 Email Templates

All templates use dark mode by default (matching NextBoard's design):

### Template Structure
```
emails/
├── components/
│   ├── Layout.tsx         # Base layout with header/footer
│   └── CardPreview.tsx    # Card display component
└── templates/
    ├── DailyDigest.tsx    # Daily summary email
    ├── OverdueAlert.tsx   # Overdue item alert
    └── DueTodayAlert.tsx  # Due today notification
```

### Customizing Templates

Edit files in `emails/templates/` to customize:
- Colors and branding
- Content and messaging
- Layout and structure

Templates use inline styles (required for email clients) and are fully responsive.

---

## 🔐 Security

1. **CRON_SECRET**: Protects cron endpoints from unauthorized access
2. **Clerk Authentication**: User sync requires valid Clerk session
3. **Email Validation**: All emails validated before sending
4. **Rate Limiting**: Consider adding rate limits to notification endpoints

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
WHERE emailSent = false 
ORDER BY createdAt DESC;

-- User notification stats
SELECT 
  userId,
  type,
  COUNT(*) as count,
  SUM(CASE WHEN emailSent THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN emailSent THEN 0 ELSE 1 END) as failed
FROM Notification
GROUP BY userId, type;
```

### Cron Job Logs

Check Railway logs or your cron service dashboard for:
- Job execution times
- Success/failure rates
- Error messages

---

## 🚨 Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Verify Domain**
   - Development: Use `onboarding@resend.dev`
   - Production: Verify domain in Resend dashboard

3. **Check User Sync**
   ```bash
   curl http://localhost:3005/api/user/sync
   ```

4. **Check Notification Preferences**
   ```bash
   curl http://localhost:3005/api/notifications/preferences
   ```

### Cron Jobs Not Running

1. **Verify CRON_SECRET**
2. **Check Railway logs** for cron execution
3. **Test manual trigger** using POST endpoint
4. **Verify cron schedule** syntax

### User Not Receiving Emails

1. **Check spam folder**
2. **Verify user email** in Clerk
3. **Check notification preferences** - might be disabled
4. **Check quiet hours** - might be in quiet period
5. **Check notification log** in database

---

## 📈 Next Steps

### Enhance the System

1. **Add Settings UI**: Create a `/settings/notifications` page
2. **In-App Notifications**: Add bell icon with notification center
3. **Weekly Reports**: Implement weekly summary emails
4. **Slack Integration**: Send notifications to Slack
5. **SMS Alerts**: Add Twilio for urgent alerts
6. **Email Templates**: Create more templates (assigned, mentioned, etc.)
7. **Notification Center**: Build in-app notification inbox
8. **Mark as Read**: Add API to mark notifications as read

### Example Settings UI Component

```typescript
// src/app/settings/notifications/page.tsx
'use client';

export default function NotificationSettings() {
  // Fetch preferences
  // Display toggles for each setting
  // Allow user to customize times
  // Save preferences
}
```

---

## 🎉 You're All Set!

Your email notification system is now ready to keep users engaged and informed about their action items!

**Support:** Check [Resend docs](https://resend.com/docs) and [React Email docs](https://react.email/docs) for more info.





