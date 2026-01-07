# 🕒 NextBoard: Time Tracker & Auto-Priority System

## Overview

The Time Tracker & Auto-Priority System transforms NextBoard into an **intelligent time-aware platform** that automatically surfaces what needs attention. Cards now track how long they've been in each status, automatically escalate priority based on aging, and provide visual indicators for stale items.

---

## ✨ **What's Been Implemented**

### 1. **Database Schema** ✓
- `currentStatusSince` - Tracks when card moved to current status
- `timeInTodo`, `timeInProgress`, `timeInBlocked` - Hours spent in each status
- `priorityAutoUpdated` - Whether priority was auto-escalated
- `lastPriorityUpdate` - When priority was last changed
- `StatusHistoryEntry` model - Complete history of all status changes

### 2. **Time Tracking Utilities** ✓
- `getTimeInCurrentStatus()` - Calculate time in current status with urgency levels
- `getCardAge()` - Calculate total card age
- `getStaleBackgroundClass()` - Visual indicators based on time
- `calculateAutoPriority()` - Auto-escalation logic
- `formatTimeBreakdown()` - Display time spent in each status

### 3. **Status Change Handler** ✓
- Automatically tracks time when cards move between statuses
- Creates `StatusHistoryEntry` for every status change
- Updates time tracking fields (`timeInTodo`, etc.)
- Logs detailed activity with time spent

### 4. **Enhanced Card UI** ✓
- Visual time indicators with emoji icons (🟢🔵🟡🔴)
- Time in current status display
- Stale warning badges (> 3 days)
- Auto-escalation indicator ("Auto ⬆️")
- Background color intensity based on aging

### 5. **Auto-Priority Escalation Cron** ✓
- Runs periodically to check all active cards
- Escalates priority based on time in status
- Creates activity logs for auto-escalations
- Configurable escalation rules

### 6. **API Endpoint** ✓
- `POST /api/cron/auto-priority` - Trigger cron job
- `GET /api/cron/auto-priority` - Test in development
- Bearer token authentication
- Returns detailed escalation results

### 7. **Time Tracking Stats Dashboard** ✓
- **Stale Items** - Cards stuck for 3+ days
- **Auto-Escalated** - Cards with auto-increased priority
- **Avg Time in Status** - Average days per status
- **Total Work Time** - Cumulative time across all cards

---

## 🎨 **Visual Indicators**

### Card Border Colors
- 🟢 **Fresh** (< 1 day) - Gray border
- 🔵 **Aging** (1-2 days) - Blue border  
- 🟡 **Stale** (3-5 days) - Yellow border
- 🔴 **Critical** (6+ days) - Red border with pulse animation

### Background Tint
Cards get subtle background tint based on aging:
- Fresh: No tint
- Aging: Light blue tint
- Stale: Light yellow tint
- Critical: Light red tint

### Time Display
- "Just now" / "5m" / "2h" - Recent
- "1 day" / "3 days" - Medium age
- "7 days" with 🔴 - Critical, red text

---

## ⚙️ **Auto-Escalation Rules**

| Status | Days in Status | Current Priority | Auto-Escalate To | Reason |
|--------|---------------|------------------|------------------|---------|
| **Blocked** | 1 day | low/medium | high | Blocked items need attention |
| **Blocked** | 2+ days | any | urgent | Critical blocker |
| **In Progress** | 5 days | low/medium | high | Work taking too long |
| **In Progress** | 7+ days | any | urgent | Stuck in progress |
| **To Do** | 4 days | low | medium | Neglected task |
| **To Do** | 7 days | low/medium | high | Long-waiting task |
| **To Do** | 10+ days | any | urgent | Critical neglect |

---

## 📊 **How It Works**

### When a Card is Created
```
✅ currentStatusSince = now()
✅ status = "To Do"
✅ Time tracking starts automatically
```

### When Status Changes (e.g., To Do → In Progress)
```
1. Calculate hours in previous status
2. Update timeInTodo += hours
3. Create StatusHistoryEntry
4. Reset currentStatusSince = now()
5. Log activity with time spent
6. Show in card: "was in To Do for 2d 5h"
```

### Auto-Priority Escalation (Runs Every 6 Hours)
```
1. Get all active cards (not Done)
2. For each card:
   - Calculate time in current status
   - Check escalation rules
   - If should escalate:
     * Update priority
     * Set priorityAutoUpdated = true
     * Log activity
     * Show "Auto ⬆️" badge
```

### Visual Display on Cards
```
┌─────────────────────────────────────┐
│ 🎯 Action  🔥 HIGH  Auto ⬆️         │
│ Launch new pricing page             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🟡 In In Progress: 5 days       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ Needs attention - 5 days in     │
│    this status                      │
└─────────────────────────────────────┘
```

---

## 🚀 **Usage**

### View Time Tracking
1. Navigate to any board
2. See **Time Tracking Stats** at the top (4 widgets)
3. Each card shows time in current status
4. Stale cards have yellow warning badges

### Trigger Auto-Escalation Manually (Development)
```bash
# In browser or via curl
GET http://localhost:3005/api/cron/auto-priority

# Returns:
{
  "success": true,
  "updated": 3,
  "results": [
    {
      "cardId": "...",
      "oldPriority": "medium",
      "newPriority": "high",
      "reason": "Blocked for 2 days"
    }
  ]
}
```

### Setup Automated Cron (Production)

#### Option 1: Vercel Cron
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-priority",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### Option 2: Railway Cron
Add to `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Then use external service like cron-job.org:
- URL: `https://your-app.railway.app/api/cron/auto-priority`
- Method: POST
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Schedule: Every 6 hours

#### Option 3: External Cron Service
Use cron-job.org or similar:
1. Create account
2. Add new job:
   - URL: `https://your-domain.com/api/cron/auto-priority`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_SECRET`
   - Schedule: `0 */6 * * *` (every 6 hours)

---

## 🔒 **Security**

### Environment Variable
Set in `.env`:
```
CRON_SECRET=your-random-secret-here-change-in-production
```

In production, use a strong random secret:
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Authentication
Cron endpoint requires Bearer token:
```
Authorization: Bearer YOUR_CRON_SECRET
```

---

## 📈 **Benefits**

✅ **Prevents Forgotten Items** - Visual aging indicators  
✅ **Automatic Escalation** - No manual priority management needed  
✅ **Historical Tracking** - See exactly how long each phase took  
✅ **Identifies Bottlenecks** - See which status items get stuck in  
✅ **Team Accountability** - Clear visibility on aging items  
✅ **Smart Alerts** - Auto-escalate based on time, not manual updates  
✅ **Data-Driven** - Make decisions based on actual time data  
✅ **Continuous Improvement** - Learn from time patterns  

---

## 🎯 **Example Scenarios**

### Scenario 1: Neglected Task
```
Day 1: Card created in "To Do" - priority: medium
Day 4: Auto-cron runs → No change (threshold is 7 days)
Day 7: Auto-cron runs → Escalated to "high"
Day 10: Auto-cron runs → Escalated to "urgent"

Result: Task that sat for 10 days now has urgent priority
```

### Scenario 2: Blocked Item
```
Day 1: Card moved to "Blocked" - priority: medium
Day 2: Auto-cron runs → Escalated to "urgent" (blockers escalate fast)

Result: Blocked items get immediate attention
```

### Scenario 3: Stuck In Progress
```
Day 1: Card moved to "In Progress" - priority: low
Day 5: Auto-cron runs → Escalated to "high"
Day 8: Auto-cron runs → Escalated to "urgent"

Result: Work that's stuck in progress gets attention
```

---

## 🔧 **Files Created/Modified**

### New Files
- ✅ `src/lib/time-tracker.ts` - Time tracking utilities
- ✅ `src/lib/status-change-handler.ts` - Status change with time tracking
- ✅ `src/lib/cron/auto-priority-escalation.ts` - Cron job logic
- ✅ `src/app/api/cron/auto-priority/route.ts` - API endpoint
- ✅ `src/components/TimeTrackingStats.tsx` - Stats dashboard
- ✅ `TIME_TRACKING_SYSTEM.md` - This documentation

### Modified Files
- ✅ `prisma/schema.prisma` - Added time tracking fields
- ✅ `src/types/meeting.ts` - Updated TypeScript types
- ✅ `src/components/LivingCard.tsx` - Time indicators
- ✅ `src/app/board/[id]/page.tsx` - Integrated stats dashboard
- ✅ `src/app/api/card/[id]/route.ts` - Use status change handler

---

## 🎉 **Ready to Use!**

The time tracking system is now fully operational! 

**Next Steps:**
1. ✅ Server is running - time tracking is active
2. ✅ Move some cards between statuses - see time tracking
3. ✅ Wait a few days (or manually change timestamps) - see escalation
4. ✅ Run manual cron in dev: `GET /api/cron/auto-priority`
5. ✅ Set up automated cron for production

Your NextBoard now automatically surfaces what needs attention! 🚀







