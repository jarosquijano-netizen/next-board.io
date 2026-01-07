-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "meetingDate" TIMESTAMP(3),
    "nextMeetingDate" TIMESTAMP(3),
    "duration" INTEGER,
    "seriesId" TEXT,
    "seriesNumber" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "previousMeetingId" TEXT,
    "nextMeetingId" TEXT,
    "seriesStartDate" TIMESTAMP(3),
    "expectedNextDate" TIMESTAMP(3),
    "completionRate" DOUBLE PRECISION,
    "carryoverCount" INTEGER NOT NULL DEFAULT 0,
    "newItemsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingCard" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "dueDateRaw" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "timeEstimate" INTEGER,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "daysUntilDue" INTEGER,
    "timestamp" TEXT,
    "context" TEXT,
    "status" TEXT NOT NULL DEFAULT 'To Do',
    "blockedReason" TEXT,
    "blockedBy" TEXT,
    "blockedSince" TIMESTAMP(3),
    "involvedPeople" TEXT DEFAULT '[]',
    "interactionType" TEXT,
    "primaryContact" TEXT,
    "additionalContacts" TEXT DEFAULT '[]',
    "interactionNote" TEXT,
    "carriedOver" BOOLEAN NOT NULL DEFAULT false,
    "sourceCardId" TEXT,
    "carriedFromMeetingId" TEXT,
    "completedInMeeting" BOOLEAN NOT NULL DEFAULT false,
    "originalMeetingId" TEXT,
    "aiSummary" TEXT,
    "aiSummaryCreatedAt" TIMESTAMP(3),
    "currentStatusSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeInTodo" INTEGER NOT NULL DEFAULT 0,
    "timeInProgress" INTEGER NOT NULL DEFAULT 0,
    "timeInBlocked" INTEGER NOT NULL DEFAULT 0,
    "priorityAutoUpdated" BOOLEAN NOT NULL DEFAULT false,
    "lastPriorityUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MeetingCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardActivity" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardAttachment" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistoryEntry" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationInStatus" INTEGER,

    CONSTRAINT "StatusHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "department" TEXT,
    "mentionedInCards" INTEGER NOT NULL DEFAULT 0,
    "lastMentioned" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingSeries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "recurrence" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "lastMeetingDate" TIMESTAMP(3),
    "nextMeetingDate" TIMESTAMP(3),
    "totalMeetings" INTEGER NOT NULL DEFAULT 0,
    "avgCompletionRate" DOUBLE PRECISION,
    "avgItemsPerMeeting" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyDigest" BOOLEAN NOT NULL DEFAULT true,
    "dailyDigestTime" TEXT NOT NULL DEFAULT '08:00',
    "overdueAlerts" BOOLEAN NOT NULL DEFAULT true,
    "dueTodayAlerts" BOOLEAN NOT NULL DEFAULT true,
    "dueTomorrowAlerts" BOOLEAN NOT NULL DEFAULT true,
    "assignedToMe" BOOLEAN NOT NULL DEFAULT true,
    "mentioned" BOOLEAN NOT NULL DEFAULT true,
    "cardComments" BOOLEAN NOT NULL DEFAULT true,
    "blockedAlerts" BOOLEAN NOT NULL DEFAULT true,
    "priorityEscalation" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReportDay" TEXT NOT NULL DEFAULT 'monday',
    "enableQuietHours" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT NOT NULL DEFAULT '22:00',
    "quietHoursEnd" TEXT NOT NULL DEFAULT '08:00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "cardId" TEXT,
    "meetingId" TEXT,
    "metadata" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "emailError" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_userId_idx" ON "Meeting"("userId");

-- CreateIndex
CREATE INDEX "Meeting_organizationId_idx" ON "Meeting"("organizationId");

-- CreateIndex
CREATE INDEX "Meeting_meetingDate_idx" ON "Meeting"("meetingDate");

-- CreateIndex
CREATE INDEX "Meeting_seriesId_idx" ON "Meeting"("seriesId");

-- CreateIndex
CREATE INDEX "Meeting_userId_seriesId_idx" ON "Meeting"("userId", "seriesId");

-- CreateIndex
CREATE INDEX "Meeting_previousMeetingId_idx" ON "Meeting"("previousMeetingId");

-- CreateIndex
CREATE INDEX "MeetingCard_dueDate_idx" ON "MeetingCard"("dueDate");

-- CreateIndex
CREATE INDEX "MeetingCard_isOverdue_idx" ON "MeetingCard"("isOverdue");

-- CreateIndex
CREATE INDEX "MeetingCard_status_idx" ON "MeetingCard"("status");

-- CreateIndex
CREATE INDEX "MeetingCard_priority_idx" ON "MeetingCard"("priority");

-- CreateIndex
CREATE INDEX "MeetingCard_currentStatusSince_idx" ON "MeetingCard"("currentStatusSince");

-- CreateIndex
CREATE INDEX "MeetingCard_priorityAutoUpdated_idx" ON "MeetingCard"("priorityAutoUpdated");

-- CreateIndex
CREATE INDEX "MeetingCard_primaryContact_idx" ON "MeetingCard"("primaryContact");

-- CreateIndex
CREATE INDEX "MeetingCard_carriedFromMeetingId_idx" ON "MeetingCard"("carriedFromMeetingId");

-- CreateIndex
CREATE INDEX "MeetingCard_originalMeetingId_idx" ON "MeetingCard"("originalMeetingId");

-- CreateIndex
CREATE INDEX "MeetingCard_carriedOver_idx" ON "MeetingCard"("carriedOver");

-- CreateIndex
CREATE INDEX "CardActivity_cardId_idx" ON "CardActivity"("cardId");

-- CreateIndex
CREATE INDEX "CardActivity_userId_idx" ON "CardActivity"("userId");

-- CreateIndex
CREATE INDEX "CardActivity_createdAt_idx" ON "CardActivity"("createdAt");

-- CreateIndex
CREATE INDEX "CardAttachment_cardId_idx" ON "CardAttachment"("cardId");

-- CreateIndex
CREATE INDEX "CardAttachment_userId_idx" ON "CardAttachment"("userId");

-- CreateIndex
CREATE INDEX "StatusHistoryEntry_cardId_idx" ON "StatusHistoryEntry"("cardId");

-- CreateIndex
CREATE INDEX "StatusHistoryEntry_changedAt_idx" ON "StatusHistoryEntry"("changedAt");

-- CreateIndex
CREATE INDEX "Person_userId_idx" ON "Person"("userId");

-- CreateIndex
CREATE INDEX "Person_organizationId_idx" ON "Person"("organizationId");

-- CreateIndex
CREATE INDEX "Person_name_idx" ON "Person"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Person_name_userId_key" ON "Person"("name", "userId");

-- CreateIndex
CREATE INDEX "MeetingSeries_userId_idx" ON "MeetingSeries"("userId");

-- CreateIndex
CREATE INDEX "MeetingSeries_organizationId_idx" ON "MeetingSeries"("organizationId");

-- CreateIndex
CREATE INDEX "MeetingSeries_isActive_idx" ON "MeetingSeries"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_previousMeetingId_fkey" FOREIGN KEY ("previousMeetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "MeetingSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingCard" ADD CONSTRAINT "MeetingCard_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardActivity" ADD CONSTRAINT "CardActivity_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "MeetingCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAttachment" ADD CONSTRAINT "CardAttachment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "MeetingCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistoryEntry" ADD CONSTRAINT "StatusHistoryEntry_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "MeetingCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
