# 🎨 Preview Email Templates (Without Sending)

You can preview all email templates locally without needing Resend API key!

## Quick Preview

### Option 1: React Email Dev Server (Best)

```bash
npm run email:dev
```

This opens `http://localhost:3000` where you can see all your email templates live!

### Option 2: Create a Preview Page

Add this to your Next.js app to preview emails:

**File: `src/app/email-preview/page.tsx`**

```tsx
import { DailyDigest } from '../../../emails/templates/DailyDigest';
import { OverdueAlert } from '../../../emails/templates/OverdueAlert';
import { DueTodayAlert } from '../../../emails/templates/DueTodayAlert';
import { render } from '@react-email/render';

export default function EmailPreview() {
  // Mock data
  const mockCard = {
    id: 'test-123',
    summary: 'Complete quarterly planning presentation',
    type: 'Action',
    priority: 'high',
    owner: 'John Doe',
    dueDate: new Date(),
    status: 'In Progress',
    meetingId: 'meeting-123'
  };

  const mockOverdueCards = [mockCard];
  const mockDueTodayCards = [{ ...mockCard, summary: 'Review budget proposals' }];
  const mockBlockedCards = [{ ...mockCard, summary: 'Deploy to production', status: 'blocked' }];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📧 Email Template Previews</h1>
      
      <h2>1. Daily Digest</h2>
      <iframe 
        style={{ width: '100%', height: '800px', border: '1px solid #ddd' }}
        srcDoc={render(
          <DailyDigest 
            userName="John"
            overdueCards={mockOverdueCards}
            dueTodayCards={mockDueTodayCards}
            blockedCards={mockBlockedCards}
            stats={{ totalActive: 10, completedYesterday: 3 }}
          />
        )}
      />

      <h2>2. Overdue Alert</h2>
      <iframe 
        style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}
        srcDoc={render(
          <OverdueAlert 
            userName="John"
            card={mockCard}
            daysOverdue={3}
          />
        )}
      />

      <h2>3. Due Today Alert</h2>
      <iframe 
        style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}
        srcDoc={render(
          <DueTodayAlert 
            userName="John"
            card={mockCard}
          />
        )}
      />
    </div>
  );
}
```

Then visit: `http://localhost:3005/email-preview`

---

## 📧 Test With Real Email (Requires Resend)

Once you have Resend API key:

```bash
# Run the test script
.\test-email.ps1
```

Or manually:

```bash
curl -X POST http://localhost:3005/api/cron/email-notifications \
  -H "Content-Type: application/json" \
  -d '{"type":"daily-digest","secret":"YOUR_CRON_SECRET"}'
```





