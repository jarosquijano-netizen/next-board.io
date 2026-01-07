# 👥 People & Interaction Extraction System

## Overview
NextBoard now intelligently extracts WHO needs to be contacted and HOW from meeting transcripts, making action items more actionable and collaborative.

---

## ✨ Features Implemented

### 1. **Database Schema Extensions**
Added comprehensive people tracking to `MeetingCard` model:
- `involvedPeople` - JSON array of all people mentioned
- `interactionType` - Type of interaction required (speak_with, email, meet_with, call, etc.)
- `primaryContact` - Main person to interact with
- `additionalContacts` - JSON array of other people involved
- `interactionNote` - Context about the interaction ("to discuss pricing", "about Q4 plans")

Added new `Person` model for analytics:
- Track people mentions across all meetings
- Store contact information (email, role, department)
- Analytics (mention count, last mentioned date)

### 2. **8 Interaction Types**
The AI now classifies interactions into specific types:

| Type | Icon | Description | Example |
|------|------|-------------|---------|
| **speak_with** | 💬 | Casual conversation | "talk to Sarah about the budget" |
| **meet_with** | 📅 | Scheduled meeting | "schedule meeting with finance team" |
| **email** | 📧 | Send email | "email the client about the delay" |
| **call** | 📞 | Phone call | "call the vendor for pricing" |
| **check_with** | ✅ | Get approval | "check with legal about compliance" |
| **follow_up** | 🔄 | Continue conversation | "follow up with Tom on the proposal" |
| **present_to** | 🎤 | Present/demo | "present to executives next week" |
| **coordinate_with** | 🤝 | Work together | "coordinate with ops on deployment" |

### 3. **Enhanced AI Prompt**
The AI now:
- Extracts ALL names mentioned in context of an action
- Identifies PRIMARY contact (most important person)
- Captures additional people if multiple are involved
- Includes teams as people (e.g., "legal team", "marketing")
- Preserves exact names from transcript
- Distinguishes between owner (person doing action) and contact (person to interact with)

### 4. **Visual Card Enhancements**
Cards now prominently display:
- **Interaction Badge** - Color-coded by interaction type with icon
- **Primary Contact** - Bold, prominent display of who to contact
- **Additional Contacts** - Listed below primary
- **Interaction Note** - Italicized context ("about Q4 plans")
- **Involved People Pills** - All people involved shown as chips

**Example Card Display:**
```
┌────────────────────────────────────────┐
│ [Action] [HIGH PRIORITY]               │
│ Check GDPR compliance requirements     │
│                                        │
│ ✅ Check with Legal Team               │
│    about GDPR compliance for EU launch │
│                                        │
│ 👤 Sarah  👤 Legal Team                │
│                                        │
│ 👤 Assigned to: Sarah                  │
│ ⏰ Due in 3 days                       │
└────────────────────────────────────────┘
```

### 5. **People Filter Component**
New filter interface that:
- Extracts all unique people from cards
- Shows count of cards per person
- Allows multi-select filtering
- Includes search functionality
- Updates in real-time as you select/deselect

**Filter Logic:**
A card matches if the selected person is:
- The card owner
- In the involved people list
- The primary contact
- In additional contacts

### 6. **Demo Data Updated**
All 8 demo cards now include realistic people interaction data:
- Blocker: "Follow up with AWS Admin Team to get production access keys"
- Action: Regular task (no interaction)
- Decision: Multiple teams involved
- Follow-up: "Check with Legal Team about GDPR compliance"
- Update: Team announcement
- Risk: "Coordinate with Engineering Team to plan capacity expansion"
- Question: "Email Finance Team about Q1 hiring budget"
- Idea: "Meet with Engineering Team to discuss feasibility"

---

## 🎯 Use Cases

### 1. **Team Coordination**
Quickly see who needs to be involved in each action item and how to contact them.

### 2. **Follow-Up Tracking**
Filter by a specific person to see all their action items, whether they own them or are just involved.

### 3. **Meeting Preparation**
Before a meeting, filter by attendees to see all pending items involving them.

### 4. **Workload Distribution**
See which people have the most action items involving them.

### 5. **Communication Planning**
Group actions by interaction type to batch communications (e.g., send all emails at once).

---

## 💻 Technical Implementation

### Data Storage (SQLite Compatible)
Since SQLite doesn't support arrays, people fields are stored as JSON strings:
```typescript
// In Database
involvedPeople: '["Sarah", "Legal Team", "Finance"]'

// In Application
involvedPeople: ["Sarah", "Legal Team", "Finance"]
```

Serialization/deserialization happens automatically in:
- `/api/process` - When creating cards from AI results
- `/api/board/[id]` - When fetching board data

### Type Safety
Full TypeScript support:
```typescript
interface MeetingCard {
  involvedPeople?: string[];
  interactionType?: string | null;
  primaryContact?: string | null;
  additionalContacts?: string[];
  interactionNote?: string | null;
  // ... other fields
}
```

### AI Extraction Examples

**Input:** "Sarah, can you talk to Thomas about the pricing proposal?"

**Output:**
```json
{
  "type": "Action",
  "summary": "Discuss pricing proposal",
  "owner": "Sarah",
  "interaction_type": "speak_with",
  "primary_contact": "Thomas",
  "additional_contacts": [],
  "involved_people": ["Sarah", "Thomas"],
  "interaction_note": "about the pricing proposal"
}
```

**Input:** "We need to schedule a meeting with legal, finance, and Sarah to review the contract terms"

**Output:**
```json
{
  "type": "Action",
  "summary": "Schedule contract review meeting",
  "owner": null,
  "interaction_type": "meet_with",
  "primary_contact": "legal",
  "additional_contacts": ["finance", "Sarah"],
  "involved_people": ["legal", "finance", "Sarah"],
  "interaction_note": "to review the contract terms"
}
```

---

## 🚀 What's Next?

### Future Enhancements (Not Yet Implemented)

1. **People View** - Group cards by person to see individual workloads
2. **Quick Actions** - Email/call buttons directly from cards
3. **People Analytics** - Track mention frequency, collaboration patterns
4. **Smart Suggestions** - AI suggests people based on past context
5. **Contact Management** - Full contact database with emails, roles, departments
6. **Team Hierarchies** - Organize people by department/team
7. **Notification System** - Notify people when they're mentioned in action items
8. **Integration** - Sync with calendar, email, Slack for seamless communication

---

## 📊 Impact

### Before:
- Action items were vague: "Follow up on the proposal"
- No clarity on WHO to contact
- Manual tracking of people involved

### After:
- Clear action items: "Email Tom about Q4 pricing proposal"
- Visual indicators of interaction type
- Filter by person to see all their action items
- AI automatically extracts people and interaction context

---

## 🎉 Result

NextBoard now transforms meeting transcripts into **actionable, people-centric workflows** where you always know:
- ✅ WHO to contact
- ✅ HOW to contact them (email, call, meet, etc.)
- ✅ WHAT to discuss
- ✅ WHY (context from the meeting)

**No more "I need to follow up with... who was it again?"** 🚀







