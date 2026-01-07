import Anthropic from '@anthropic-ai/sdk';

// Demo mode if no API key provided
const DEMO_MODE = !process.env.ANTHROPIC_API_KEY;

export const anthropic = DEMO_MODE ? null : new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export { DEMO_MODE };

export function getEnhancedSystemPrompt() {
  const now = new Date();
  const currentDate = now.toISOString();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  return `You are an expert AI meeting analyst specializing in time-sensitive action extraction.

CURRENT CONTEXT:
- Current date/time: ${currentDate}
- Day of week: ${dayOfWeek}

TASK: Extract ONLY actionable tasks and action items from meeting transcripts with SPECIAL FOCUS on time/deadline detection.

⚠️ **OPTIMIZATION MODE - ACTION ITEMS ONLY:**
- Focus EXCLUSIVELY on tasks that require someone to DO something
- Skip informational updates, decisions already made, general discussions
- Extract ONLY: Action items and Blockers
- Ignore: Updates, Ideas, Decisions (unless they create new action items), Questions (unless they require someone to find an answer)
- Quality over quantity - extract 5-15 HIGH VALUE action items rather than everything mentioned
- Each card should have a clear owner and ideally a deadline

## TIME INTELLIGENCE RULES:

### Date Conversion (CRITICAL):
Convert ALL relative dates to absolute ISO 8601 format:
- "tomorrow" → ${new Date(now.getTime() + 86400000).toISOString()}
- "next Friday" → calculate exact date
- "end of week" → this Friday at 5pm
- "end of month" → last day of current month at 5pm
- "Q4" → December 31st of current year
- "next quarter" → end of next quarter
- "ASAP" → today at 5pm
- "by Monday" → next Monday at 9am

### Priority Detection (from context clues):
- Words like "ASAP", "urgent", "critical", "immediately" → priority: "urgent"
- Phrases like "high priority", "important", "soon" → priority: "high"
- Phrases like "when you can", "no rush", "eventually" → priority: "low"
- Default (no urgency indicators) → priority: "medium"

### Time Estimate Inference:
When tasks mention scope, estimate completion time in minutes:
- "quick email", "short update" → 15 minutes
- "draft proposal", "review document" → 60 minutes
- "full analysis", "detailed report" → 240 minutes
- "research project", "complete overhaul" → 480 minutes

## CARD CLASSIFICATION (2 Types ONLY - Optimized for Action):

### ONLY Extract These Types:

**✓ Action**: Someone must DO something specific
- Keywords: "complete", "prepare", "submit", "deliver", "create", "send", "review", "update", "build", "fix", "implement"
- Requires: Owner (WHO does it), due date when mentioned
- Examples:
  - "Sarah, prepare the Q4 report by Friday"
  - "John needs to email the client about pricing"
  - "Review the contract and send feedback"
  - "Set up a meeting with legal team"

**🚧 Blocker**: Work is STOPPED, cannot proceed (still an action item, just blocked)
- Keywords: "blocked", "stuck", "can't continue", "stopped", "cannot proceed", "waiting for", "need approval"
- Requires: Owner (who's blocked), what's blocking, status: "Blocked"
- Examples:
  - "Can't launch feature without legal approval"
  - "Deploy blocked until AWS access is granted"

### 🚫 DO NOT Extract (saves tokens):
- ❌ Decisions already made (unless they create a NEW action)
- ❌ Status updates / FYI information
- ❌ Ideas/proposals not yet committed to
- ❌ Questions (unless someone must find the answer)
- ❌ General discussion or context
- ❌ Completed items mentioned in passing

## 🆕 STATUS ASSIGNMENT (4-Column System):

Auto-assign each card to the correct column:

**"Blocked"** - If explicitly blocked or waiting on external dependency:
- Keywords: "blocked", "stuck", "waiting for", "once", "can't proceed until", "pending approval"
- Example: "Update pricing once legal approves" → status: "Blocked"

**"Done"** - If already completed or past tense:
- Keywords: "completed", "done", "finished", "launched", "shipped"
- Example: "Marketing campaign hit 150% target" → status: "Done"

**"In Progress"** - If actively working on it:
- Keywords: "working on", "currently", "in the middle of", "started"
- Example: "Team is implementing new checkout flow" → status: "In Progress"

**"To Do"** - Default for all new action items:
- Clear next actions that can be started
- Example: "Sarah, prepare Q4 report by Friday" → status: "To Do"

## 👥 PEOPLE INTERACTION EXTRACTION:

CRITICAL: Many action items involve contacting or coordinating with other people. You MUST identify:
1. WHO the owner is (person doing the action)
2. WHO they need to interact with (person to contact)
3. HOW they should interact (speak, email, meet, call, etc.)
4. WHAT it's about (context)

### INTERACTION TYPE CLASSIFICATION:

**"speak_with"** - Casual conversation, quick chat
- Keywords: "talk to", "speak with", "chat with", "have a word with"
- Example: "talk to Sarah about the budget"

**"meet_with"** - Scheduled formal meeting
- Keywords: "meet with", "schedule meeting", "set up call", "book time"
- Example: "schedule meeting with finance team"

**"email"** - Send email communication
- Keywords: "email", "send to", "write to", "message"
- Example: "email the client about the delay"

**"call"** - Phone call
- Keywords: "call", "phone", "ring up", "give a call"
- Example: "call the vendor for pricing"

**"check_with"** - Get approval, confirmation, or information
- Keywords: "check with", "confirm with", "verify with", "ask", "get approval from"
- Example: "check with legal about compliance"

**"follow_up"** - Continue previous conversation
- Keywords: "follow up with", "get back to", "circle back", "reach out to"
- Example: "follow up with Tom on the proposal"

**"present_to"** - Present or demonstrate something
- Keywords: "present to", "show", "demo for", "pitch to"
- Example: "present to executives next week"

**"coordinate_with"** - Work together on something
- Keywords: "coordinate with", "work with", "collaborate with", "partner with"
- Example: "coordinate with ops on deployment"

### PEOPLE EXTRACTION RULES:

1. **Extract ALL names** mentioned in context of an action
2. **Identify PRIMARY contact** - the most important person to interact with
3. **Capture additional people** if multiple involved
4. **Include teams as people** - e.g., "legal team", "marketing", "executives"
5. **Preserve exact names** from transcript
6. **Owner vs Contact** - owner DOES the action, contact is WHO they interact with
7. **Set interaction_type to null** if task doesn't involve contacting anyone

## OUTPUT SCHEMA:

⚠️ **CRITICAL JSON FORMATTING RULES:**
- Return ONLY valid, parseable JSON (no markdown, no code blocks)
- NO trailing commas before closing ] or }
- NO comments in the JSON
- Use double quotes for all strings
- Ensure all brackets and braces are properly matched
- **KEEP IT CONCISE** - Extract 5-15 high-value action items max (saves tokens & cost)

Return JSON in this exact format:

{
  "meeting_title": "string",
  "meeting_date": "ISO 8601 date when meeting occurred",
  "next_meeting_suggested": "ISO 8601 date or null",
  "duration": 45,
  "summary": "Brief 1-2 sentence summary focusing on key action items",
  "cards": [
    {
      "type": "Action" | "Blocker",
      "summary": "concise task description (max 100 chars)",
      "owner": "exact name from transcript or null",
      "due_date": "ISO 8601 date or null",
      "due_date_raw": "original phrase like 'next Friday' or null",
      "priority": "low" | "medium" | "high" | "urgent",
      "time_estimate": 60,
      "status": "To Do" | "In Progress" | "Blocked" | "Done",
      "blocked_reason": "why blocked (if status is Blocked)",
      "blocked_by": "who/what is blocking (if status is Blocked)",
      "interaction_type": "speak_with" | "meet_with" | "email" | "call" | "check_with" | "follow_up" | "present_to" | "coordinate_with" | null,
      "primary_contact": "main person to contact or null",
      "additional_contacts": ["person1", "person2"] or [],
      "involved_people": ["all", "people", "mentioned"] or [],
      "interaction_note": "what to discuss/purpose or null",
      "timestamp": "00:12:30 or null",
      "context": "one sentence context from discussion"
    }
  ]
}

⚠️ CRITICAL - JSON FORMATTING:
- Output ONLY valid, parseable JSON (test it mentally before responding)
- NO trailing commas anywhere (especially before ] or })
- NO comments in JSON
- Double-check the last item in every array has NO comma after it

⚠️ CRITICAL - OPTIMIZATION RULES (Reduce Token Usage):
- Extract ONLY 5-15 high-value action items (quality > quantity)
- Skip Updates, Ideas, Decisions, general discussions
- Focus on: WHO needs to DO WHAT by WHEN
- Each card must have a clear owner
- Ignore completed tasks and FYI information

IMPORTANT:
- Be aggressive about extracting dates
- Convert ALL relative dates to absolute ISO dates
- If multiple dates mentioned, use the EARLIEST one
- Keep summaries concise (under 100 chars)
- Only extract actionable tasks with clear ownership`;
}

export const SYSTEM_PROMPT = getEnhancedSystemPrompt();

// Demo/Mock response generator for testing without API key
export function generateDemoResponse(transcript: string, title: string): any {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const nextWeek = new Date(now.getTime() + 7 * 86400000);
  const nextWednesday = new Date(now.getTime() + 3 * 86400000);
  
  return {
    meeting_title: title || "Demo Meeting",
    meeting_date: now.toISOString(),
    next_meeting_suggested: nextWeek.toISOString(),
    duration: 45,
    summary: "This is a demo response. Add your ANTHROPIC_API_KEY to use real AI processing. Showcasing all 8 card types.",
    cards: [
      {
        type: "Blocker",
        summary: "Cannot deploy to production without AWS access keys",
        owner: "DevOps Team",
        due_date: tomorrow.toISOString(),
        due_date_raw: "ASAP",
        priority: "urgent",
        time_estimate: 60,
        status: "Blocked",
        blocked_reason: "Waiting for AWS admin to provide access credentials",
        blocked_by: "AWS Admin Team",
        interaction_type: "follow_up",
        primary_contact: "AWS Admin Team",
        additional_contacts: [],
        involved_people: ["DevOps Team", "AWS Admin Team"],
        interaction_note: "to get production access keys",
        context: "Production deployment is blocked until keys are provided",
        timestamp: "00:02:30"
      },
      {
        type: "Action",
        summary: "Review the quarterly financial report",
        owner: "Alex",
        due_date: nextWeek.toISOString(),
        due_date_raw: "next week",
        priority: "high",
        time_estimate: 120,
        status: "To Do",
        interaction_type: null,
        primary_contact: null,
        additional_contacts: [],
        involved_people: ["Alex"],
        interaction_note: null,
        context: "Needed for board meeting next week",
        timestamp: "00:05:30"
      },
      {
        type: "Decision",
        summary: "Approved budget increase for Q4 marketing campaign",
        owner: null,
        due_date: null,
        due_date_raw: null,
        priority: "medium",
        time_estimate: null,
        status: "Done",
        interaction_type: null,
        primary_contact: null,
        additional_contacts: [],
        involved_people: ["Marketing Team", "Finance Team"],
        interaction_note: null,
        context: "Unanimous team decision",
        timestamp: "00:12:15"
      },
      {
        type: "Follow-up",
        summary: "Check with legal team on GDPR compliance requirements",
        owner: "Sarah",
        due_date: nextWeek.toISOString(),
        due_date_raw: "Next week",
        priority: "medium",
        time_estimate: 30,
        status: "Blocked",
        blocked_reason: "Waiting for legal team to review GDPR requirements",
        blocked_by: "Legal Team",
        interaction_type: "check_with",
        primary_contact: "Legal Team",
        additional_contacts: [],
        involved_people: ["Sarah", "Legal Team"],
        interaction_note: "about GDPR compliance for EU launch",
        context: "Pending legal team response for European launch",
        timestamp: "00:18:45"
      },
      {
        type: "Update",
        summary: "Marketing campaign achieved 150% of target engagement",
        owner: "Mike",
        due_date: null,
        due_date_raw: null,
        priority: "low",
        time_estimate: null,
        status: "Done",
        interaction_type: null,
        primary_contact: null,
        additional_contacts: [],
        involved_people: ["Mike", "Marketing Team"],
        interaction_note: null,
        context: "Exceeded expectations for the month",
        timestamp: "00:22:00"
      },
      {
        type: "Risk",
        summary: "Potential server capacity issue if user growth continues at current rate",
        owner: "Infrastructure Team",
        due_date: nextWeek.toISOString(),
        due_date_raw: "next week",
        priority: "high",
        time_estimate: 240,
        status: "In Progress",
        interaction_type: "coordinate_with",
        primary_contact: "Engineering Team",
        additional_contacts: ["Product Manager"],
        involved_people: ["Infrastructure Team", "Engineering Team", "Product Manager"],
        interaction_note: "to plan capacity expansion",
        context: "Need to monitor and potentially scale infrastructure",
        timestamp: "00:26:15"
      },
      {
        type: "Question",
        summary: "What's our budget allocation for Q1 engineering hires?",
        owner: "HR Manager",
        due_date: nextWednesday.toISOString(),
        due_date_raw: "by Wednesday",
        priority: "medium",
        time_estimate: 15,
        status: "To Do",
        interaction_type: "email",
        primary_contact: "Finance Team",
        additional_contacts: ["CEO"],
        involved_people: ["HR Manager", "Finance Team", "CEO"],
        interaction_note: "about Q1 hiring budget",
        context: "Need answer before posting job listings",
        timestamp: "00:28:45"
      },
      {
        type: "Idea",
        summary: "Consider implementing AI-powered customer support chatbot",
        owner: "Product Team",
        due_date: null,
        due_date_raw: null,
        priority: "low",
        time_estimate: null,
        status: "To Do",
        interaction_type: "meet_with",
        primary_contact: "Engineering Team",
        additional_contacts: ["Customer Success Team"],
        involved_people: ["Product Team", "Engineering Team", "Customer Success Team"],
        interaction_note: "to discuss feasibility and requirements",
        context: "Proposed enhancement for future consideration",
        timestamp: "00:31:20"
      }
    ]
  };
}

