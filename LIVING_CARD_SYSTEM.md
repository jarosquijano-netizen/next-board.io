# 🎯 NextBoard: Living Card System with AI Summary

## Overview

The Living Card System transforms NextBoard from a simple task tracker into a **knowledge capture system** that preserves the full story of how work gets done. Each card now maintains a complete audit trail from creation through completion, with AI-generated summaries to capture insights.

---

## ✨ Key Features

### 1. **Activity Timeline**
- Every interaction with a card is logged automatically
- View the complete history of notes, status changes, and edits
- Expandable timeline keeps cards compact while preserving full context

### 2. **User Notes**
- Add notes and updates directly to cards
- Notes are timestamped and attributed to users
- Perfect for documenting progress, blockers, or decisions

### 3. **Automatic Activity Logging**
- Status changes are logged automatically (e.g., "To Do" → "In Progress")
- Edits to card fields are tracked with before/after values
- No manual logging required - the system captures everything

### 4. **AI-Generated Summaries**
- When a card is marked "Done", generate an AI summary with one click
- Claude analyzes the full activity history to create a narrative
- Summaries include:
  - What was accomplished
  - Key milestones and blockers
  - Important decisions made
  - Final outcomes and next steps

---

## 🎨 User Interface

### Card States

**Collapsed State:**
- Shows card summary and basic metadata
- Activity count badge with expand button
- Quick note input field (for non-Done cards)

**Expanded State:**
- Full activity timeline with icons
- Original context from AI extraction
- User notes with timestamps
- Status change history
- AI summary (for completed cards)

### Visual Elements

- **Blue Icon**: AI-extracted content
- **Purple Icon**: User activities (notes, edits)
- **Green Badge**: AI-generated summary
- **Clock Icon**: Status changes

---

## 📊 Database Schema

### CardActivity Model
```prisma
model CardActivity {
  id           String   @id @default(cuid())
  cardId       String
  userId       String   // Clerk user ID
  activityType String   // "note", "status_change", "assignment", "attachment", "edit"
  content      String   // The actual note or description
  metadata     String?  // JSON string with extra data
  createdAt    DateTime @default(now())
  
  card         MeetingCard @relation(fields: [cardId], references: [id], onDelete: Cascade)
  
  @@index([cardId])
  @@index([userId])
  @@index([createdAt])
}
```

### CardAttachment Model
```prisma
model CardAttachment {
  id        String   @id @default(cuid())
  cardId    String
  userId    String   // Clerk user ID
  fileName  String
  fileUrl   String
  fileSize  Int
  mimeType  String
  createdAt DateTime @default(now())
  
  card      MeetingCard @relation(fields: [cardId], references: [id], onDelete: Cascade)
  
  @@index([cardId])
  @@index([userId])
}
```

### MeetingCard Extensions
```prisma
model MeetingCard {
  // ... existing fields ...
  
  // Living Card System
  activities         CardActivity[]
  attachments        CardAttachment[]
  aiSummary          String?   // AI-generated summary when completed
  aiSummaryCreatedAt DateTime? // When AI summary was generated
}
```

---

## 🔌 API Endpoints

### POST `/api/cards/[id]/activity`
Add a note or activity to a card.

**Request Body:**
```json
{
  "content": "Started working on mockups",
  "activityType": "note",
  "metadata": {} // optional
}
```

**Response:**
```json
{
  "id": "activity_xyz",
  "cardId": "card_abc",
  "userId": "user_123",
  "activityType": "note",
  "content": "Started working on mockups",
  "createdAt": "2024-03-20T10:30:00Z"
}
```

### GET `/api/cards/[id]/activity`
Get all activities for a card.

**Response:**
```json
[
  {
    "id": "activity_xyz",
    "activityType": "note",
    "content": "Started working on mockups",
    "createdAt": "2024-03-20T10:30:00Z"
  }
]
```

### POST `/api/cards/[id]/generate-summary`
Generate an AI summary for a completed card.

**Requirements:**
- Card must have `status === "Done"`
- Card must not already have a summary

**Response:**
```json
{
  "id": "card_abc",
  "aiSummary": "This action item was completed in 6 days...",
  "aiSummaryCreatedAt": "2024-03-20T15:00:00Z"
}
```

---

## 🚀 Usage Example

### Scenario: Product Team Weekly Sync

**Day 1 - AI extracts from meeting transcript:**
```
📋 AI: "Sarah to launch new pricing page by end of week"
Status: To Do
```

**Day 2 - User starts work:**
```
🔄 Sarah added note: "Started design mockups, will have draft by tomorrow"
Status changed: To Do → In Progress
```

**Day 3 - Hit blocker:**
```
🚧 Sarah added note: "Legal needs to review pricing terms before we can publish"
Status changed: In Progress → Blocked
```

**Day 5 - Blocker resolved:**
```
✅ Sarah added note: "Legal approved! Making final design tweaks"
Status changed: Blocked → In Progress
```

**Day 6 - Work complete:**
```
✅ Status changed: In Progress → Done
🤖 AI Summary Generated:

"The new pricing page was successfully launched after a 6-day effort. Sarah completed 
the initial design within 2 days but encountered a blocker when legal review was 
required for pricing terms. The legal team approved the content after 2 days, and 
final design adjustments were completed. The page went live on March 20th and is now 
accessible at /pricing. Next steps include monitoring conversion rates and gathering 
user feedback over the next two weeks."
```

---

## 🎯 Benefits

1. **Accountability** - Clear audit trail of who did what and when
2. **Context Preservation** - Future you knows why decisions were made
3. **Learning** - Identify patterns in blockers and time estimates
4. **Automatic Reporting** - AI summaries generate status updates for leadership
5. **Knowledge Base** - Past cards become searchable documentation

---

## 🧠 AI Summary Prompt

The AI summary uses Claude to analyze:
- Original action item and context
- All user notes and status changes
- Time taken and blockers encountered
- Final outcome

It generates a 2-3 paragraph narrative that:
- States what was accomplished
- Highlights key milestones or blockers
- Notes important decisions
- Mentions final outcome and next steps

**Example Prompt Structure:**
```
ORIGINAL ACTION ITEM:
- What: Launch new pricing page
- Owner: Sarah
- Created: March 14, 2024
- Completed: March 20, 2024
- Duration: 6 days

ACTIVITY LOG:
1. [March 15] NOTE: Started design mockups, will have draft by tomorrow
2. [March 16] STATUS_CHANGE: To Do → In Progress
3. [March 17] NOTE: Legal needs to review pricing terms
4. [March 17] STATUS_CHANGE: In Progress → Blocked
...

Generate a concise summary focusing on outcomes and insights.
```

---

## 🔮 Future Enhancements

- **Attachments**: Upload files to cards
- **@Mentions**: Tag other users in notes
- **Meeting Reports**: Aggregate all card summaries into one executive report
- **Search**: Full-text search across all card activities
- **Analytics**: Identify common blockers and time sinks
- **Notifications**: Remind users about cards with no activity

---

## 📝 Technical Implementation

### Component: `LivingCard.tsx`
- Replaces `CardItemEnhanced` with expandable activity timeline
- Handles note submission and AI summary generation
- Displays activities with appropriate icons and styling

### API Routes:
- `POST /api/cards/[id]/activity` - Create activity
- `GET /api/cards/[id]/activity` - List activities
- `POST /api/cards/[id]/generate-summary` - Generate AI summary

### Automatic Logging:
- `PUT /api/card/[id]` - Automatically creates activity logs on update
- Status changes logged with before/after values
- Edit operations logged with changed fields

---

This system transforms NextBoard from tracking tasks to **capturing knowledge**, making every action item tell its complete story.







