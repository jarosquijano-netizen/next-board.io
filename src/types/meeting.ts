export type CardType = "Action" | "Decision" | "Follow-up" | "Update" | "Blocker" | "Idea" | "Risk" | "Question";
export type CardStatus = "To Do" | "In Progress" | "Blocked" | "Done";

export interface Meeting {
  id: string;
  title: string;
  summary: string;
  meetingDate?: string | null;
  nextMeetingDate?: string | null;
  duration?: number | null;
  createdAt: string;
  cards: MeetingCard[];
  // Series information
  seriesId?: string | null;
  seriesNumber?: number | null;
  isRecurring?: boolean;
  previousMeetingId?: string | null;
  nextMeetingId?: string | null;
}

export interface CardActivity {
  id: string;
  cardId: string;
  userId: string;
  activityType: string; // "note", "status_change", "assignment", "attachment", "edit"
  content: string;
  metadata?: string | null;
  createdAt: string;
}

export interface MeetingCard {
  id: string;
  meetingId: string;
  type: CardType;
  summary: string;
  owner: string | null;
  dueDate: string | null;
  dueDateRaw?: string | null;
  priority?: string;
  timeEstimate?: number | null;
  reminderSent?: boolean;
  isOverdue?: boolean;
  daysUntilDue?: number | null;
  timestamp: string | null;
  context: string | null;
  status: CardStatus;
  blockedReason?: string | null;
  blockedBy?: string | null;
  blockedSince?: string | null;
  // People Interaction
  involvedPeople?: string[];
  interactionType?: string | null;
  primaryContact?: string | null;
  additionalContacts?: string[];
  interactionNote?: string | null;
  // Time Tracking
  currentStatusSince: string;
  timeInTodo: number;
  timeInProgress: number;
  timeInBlocked: number;
  priorityAutoUpdated: boolean;
  lastPriorityUpdate?: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  activities?: CardActivity[];
  aiSummary?: string | null;
  aiSummaryCreatedAt?: string | null;
}

export interface AIProcessingResult {
  meeting_title: string;
  meeting_date?: string;
  next_meeting_suggested?: string | null;
  duration?: number | null;
  summary: string;
  cards: Array<{
    type: CardType;
    summary: string;
    owner?: string | null;
    due_date?: string | null;
    due_date_raw?: string | null;
    priority?: string;
    time_estimate?: number | null;
    context?: string | null;
    timestamp?: string | null;
    status?: CardStatus;
    blocked_reason?: string | null;
    blocked_by?: string | null;
    // People Interaction
    involved_people?: string[];
    interaction_type?: string | null;
    primary_contact?: string | null;
    additional_contacts?: string[];
    interaction_note?: string | null;
  }>;
}

