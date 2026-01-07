import { PrismaClient } from '@prisma/client';
import { addWeeks, addMonths, differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

export type RecurrenceType = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

/**
 * Create or link meeting to a series
 */
export async function createOrLinkToSeries(
  meetingId: string,
  seriesTitle: string,
  recurrence: RecurrenceType,
  userId: string
) {
  // Find existing series by title
  let series = await prisma.meetingSeries.findFirst({
    where: {
      userId,
      title: seriesTitle,
      isActive: true,
    },
  });

  // Create new series if doesn't exist
  if (!series) {
    series = await prisma.meetingSeries.create({
      data: {
        userId,
        title: seriesTitle,
        recurrence,
        startDate: new Date(),
      },
    });
  }

  // Find previous meeting in series
  const previousMeeting = await prisma.meeting.findFirst({
    where: {
      seriesId: series.id,
    },
    orderBy: {
      meetingDate: 'desc',
    },
  });

  // Get series number
  const seriesNumber = previousMeeting ? (previousMeeting.seriesNumber || 0) + 1 : 1;

  // Calculate expected next meeting date
  const expectedNextDate = calculateNextMeetingDate(new Date(), recurrence);

  // Update meeting with series info
  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      seriesId: series.id,
      seriesNumber,
      isRecurring: true,
      recurrence,
      previousMeetingId: previousMeeting?.id,
      expectedNextDate,
    },
  });

  // Link previous meeting to this one
  if (previousMeeting) {
    await prisma.meeting.update({
      where: { id: previousMeeting.id },
      data: {
        nextMeetingId: meeting.id,
      },
    });
  }

  // Update series stats
  await updateSeriesStats(series.id);

  return meeting;
}

/**
 * Calculate next meeting date based on recurrence
 */
export function calculateNextMeetingDate(currentDate: Date, recurrence: RecurrenceType): Date {
  switch (recurrence) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'biweekly':
      return addWeeks(currentDate, 2);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'quarterly':
      return addMonths(currentDate, 3);
    default:
      return addWeeks(currentDate, 1);
  }
}

/**
 * Auto-carryover incomplete items from previous meeting
 */
export async function carryoverIncompleteItems(
  newMeetingId: string,
  previousMeetingId: string
) {
  // Get incomplete items from previous meeting
  const incompleteCards = await prisma.meetingCard.findMany({
    where: {
      meetingId: previousMeetingId,
      status: {
        not: 'Done',
      },
    },
  });

  if (incompleteCards.length === 0) return [];

  // Create carryover cards in new meeting
  const carriedCards = await Promise.all(
    incompleteCards.map(card =>
      prisma.meetingCard.create({
        data: {
          meetingId: newMeetingId,
          type: card.type,
          summary: card.summary,
          owner: card.owner,
          status: card.status,
          priority: card.priority === 'low' ? 'medium' : card.priority, // Bump priority
          dueDate: card.dueDate,
          context: card.context,
          
          // Carryover metadata
          carriedOver: true,
          sourceCardId: card.id,
          carriedFromMeetingId: previousMeetingId,
          originalMeetingId: card.originalMeetingId || previousMeetingId,
          
          // Copy interaction data
          interactionType: card.interactionType,
          primaryContact: card.primaryContact,
          additionalContacts: card.additionalContacts,
          involvedPeople: card.involvedPeople,
          interactionNote: card.interactionNote,
          
          // Copy blocking info if blocked
          blockedReason: card.status === 'Blocked' ? card.blockedReason : null,
          blockedBy: card.status === 'Blocked' ? card.blockedBy : null,
          blockedSince: card.status === 'Blocked' ? card.blockedSince : null,
        },
      })
    )
  );

  // Update meeting carryover count
  await prisma.meeting.update({
    where: { id: newMeetingId },
    data: {
      carryoverCount: carriedCards.length,
    },
  });

  // Create activity log
  await prisma.cardActivity.createMany({
    data: carriedCards.map(card => ({
      cardId: card.id,
      userId: 'system',
      activityType: 'carryover',
      content: `Carried over from previous meeting - was not completed`,
      metadata: JSON.stringify({
        sourceCardId: card.sourceCardId,
        carriedFromMeetingId: previousMeetingId,
      }),
    })),
  });

  return carriedCards;
}

/**
 * Generate comparison stats between two meetings
 */
export async function generateMeetingComparison(
  currentMeetingId: string,
  previousMeetingId: string
) {
  const [currentMeeting, previousMeeting] = await Promise.all([
    prisma.meeting.findUnique({
      where: { id: currentMeetingId },
      include: { cards: true },
    }),
    prisma.meeting.findUnique({
      where: { id: previousMeetingId },
      include: { cards: true },
    }),
  ]);

  if (!currentMeeting || !previousMeeting) {
    throw new Error('Meeting not found');
  }

  // Calculate stats
  const prevCompleted = previousMeeting.cards.filter(c => c.status === 'Done').length;
  const prevTotal = previousMeeting.cards.length;
  const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;

  const currCompleted = currentMeeting.cards.filter(c => c.status === 'Done').length;
  const currTotal = currentMeeting.cards.length;
  const currCompletionRate = currTotal > 0 ? (currCompleted / currTotal) * 100 : 0;

  const carriedOver = currentMeeting.cards.filter(c => c.carriedOver).length;
  const newItems = currentMeeting.cards.filter(c => !c.carriedOver).length;

  // Blocker analysis
  const prevBlockers = previousMeeting.cards.filter(c => c.status === 'Blocked');
  const currBlockers = currentMeeting.cards.filter(c => c.status === 'Blocked');
  const stillBlocked = currBlockers.filter(c => 
    c.carriedOver && prevBlockers.some(pb => pb.id === c.sourceCardId)
  );

  // Time analysis
  const daysBetween = differenceInDays(
    new Date(currentMeeting.meetingDate || currentMeeting.createdAt),
    new Date(previousMeeting.meetingDate || previousMeeting.createdAt)
  );

  // People analysis
  const prevPeople = new Set(
    previousMeeting.cards.flatMap(c => {
      try {
        return c.involvedPeople ? JSON.parse(c.involvedPeople) : [];
      } catch {
        return [];
      }
    })
  );
  
  const currPeople = new Set(
    currentMeeting.cards.flatMap(c => {
      try {
        return c.involvedPeople ? JSON.parse(c.involvedPeople) : [];
      } catch {
        return [];
      }
    })
  );

  return {
    previous: {
      id: previousMeeting.id,
      number: previousMeeting.seriesNumber,
      date: previousMeeting.meetingDate || previousMeeting.createdAt,
      totalItems: prevTotal,
      completed: prevCompleted,
      completionRate: prevCompletionRate,
      blockers: prevBlockers.length,
    },
    current: {
      id: currentMeeting.id,
      number: currentMeeting.seriesNumber,
      date: currentMeeting.meetingDate || currentMeeting.createdAt,
      totalItems: currTotal,
      completed: currCompleted,
      completionRate: currCompletionRate,
      blockers: currBlockers.length,
    },
    changes: {
      daysBetween,
      carriedOver,
      newItems,
      stillBlocked: stillBlocked.length,
      completionRateChange: currCompletionRate - prevCompletionRate,
      newPeople: Array.from(currPeople).filter(p => !prevPeople.has(p)),
      removedPeople: Array.from(prevPeople).filter(p => !currPeople.has(p)),
    },
    insights: generateInsights({
      carriedOver,
      stillBlocked: stillBlocked.length,
      completionRateChange: currCompletionRate - prevCompletionRate,
      daysBetween,
    }),
  };
}

/**
 * Generate AI insights from comparison
 */
function generateInsights(data: {
  carriedOver: number;
  stillBlocked: number;
  completionRateChange: number;
  daysBetween: number;
}): string[] {
  const insights: string[] = [];

  if (data.completionRateChange > 10) {
    insights.push(`✨ Great progress! Completion rate improved by ${data.completionRateChange.toFixed(1)}%`);
  } else if (data.completionRateChange < -10) {
    insights.push(`⚠️ Completion rate dropped by ${Math.abs(data.completionRateChange).toFixed(1)}%`);
  }

  if (data.carriedOver > 5) {
    insights.push(`📋 ${data.carriedOver} items carried over - consider reviewing priorities`);
  }

  if (data.stillBlocked > 0) {
    insights.push(`🚧 ${data.stillBlocked} items still blocked from last meeting - needs escalation`);
  }

  if (data.daysBetween > 10) {
    insights.push(`⏰ ${data.daysBetween} days since last meeting - longer than usual`);
  }

  if (insights.length === 0) {
    insights.push(`✅ Steady progress - keep up the good work!`);
  }

  return insights;
}

/**
 * Update series statistics
 */
export async function updateSeriesStats(seriesId: string) {
  const meetings = await prisma.meeting.findMany({
    where: { seriesId },
    include: { cards: true },
  });

  if (meetings.length === 0) return;

  const totalMeetings = meetings.length;
  
  const completionRates = meetings.map(m => {
    const completed = m.cards.filter(c => c.status === 'Done').length;
    return m.cards.length > 0 ? (completed / m.cards.length) * 100 : 0;
  });
  
  const avgCompletionRate = completionRates.reduce((a, b) => a + b, 0) / totalMeetings;
  
  const itemCounts = meetings.map(m => m.cards.length);
  const avgItemsPerMeeting = itemCounts.reduce((a, b) => a + b, 0) / totalMeetings;

  const lastMeeting = meetings[meetings.length - 1];
  const nextMeetingDate = calculateNextMeetingDate(
    new Date(lastMeeting.meetingDate || lastMeeting.createdAt),
    lastMeeting.recurrence as RecurrenceType
  );

  await prisma.meetingSeries.update({
    where: { id: seriesId },
    data: {
      totalMeetings,
      avgCompletionRate,
      avgItemsPerMeeting,
      lastMeetingDate: lastMeeting.meetingDate || lastMeeting.createdAt,
      nextMeetingDate,
    },
  });
}

/**
 * Get series overview with all meetings
 */
export async function getSeriesOverview(seriesId: string) {
  const series = await prisma.meetingSeries.findUnique({
    where: { id: seriesId },
  });

  if (!series) throw new Error('Series not found');

  const meetings = await prisma.meeting.findMany({
    where: { seriesId },
    include: {
      cards: {
        select: {
          id: true,
          status: true,
          type: true,
          carriedOver: true,
        },
      },
    },
    orderBy: {
      meetingDate: 'desc',
    },
  });

  return {
    series,
    meetings: meetings.map(m => ({
      id: m.id,
      number: m.seriesNumber,
      date: m.meetingDate || m.createdAt,
      totalItems: m.cards.length,
      completed: m.cards.filter(c => c.status === 'Done').length,
      carriedOver: m.cards.filter(c => c.carriedOver).length,
      blockers: m.cards.filter(c => c.status === 'Blocked').length,
    })),
  };
}

/**
 * Detect if a meeting title suggests recurring nature
 */
export function detectRecurringPattern(title: string): { isRecurring: boolean; recurrence?: RecurrenceType; seriesTitle?: string } {
  const titleLower = title.toLowerCase();
  
  // Detect recurrence keywords
  if (titleLower.includes('weekly') || titleLower.includes('week')) {
    return {
      isRecurring: true,
      recurrence: 'weekly',
      seriesTitle: title.replace(/\s*-\s*\d+.*$/, '').trim(), // Remove date/number suffixes
    };
  }
  
  if (titleLower.includes('biweekly') || titleLower.includes('bi-weekly')) {
    return {
      isRecurring: true,
      recurrence: 'biweekly',
      seriesTitle: title.replace(/\s*-\s*\d+.*$/, '').trim(),
    };
  }
  
  if (titleLower.includes('monthly')) {
    return {
      isRecurring: true,
      recurrence: 'monthly',
      seriesTitle: title.replace(/\s*-\s*\d+.*$/, '').trim(),
    };
  }
  
  if (titleLower.includes('quarterly') || titleLower.includes('q1') || titleLower.includes('q2') || titleLower.includes('q3') || titleLower.includes('q4')) {
    return {
      isRecurring: true,
      recurrence: 'quarterly',
      seriesTitle: title.replace(/\s*-\s*\d+.*$/, '').trim(),
    };
  }
  
  // Check for numbered meetings (e.g., "Team Sync #5", "Sprint Review 3")
  if (/\s*[#]?\d+\s*$/.test(title) || /\s*-\s*\d+\s*$/.test(title)) {
    return {
      isRecurring: true,
      recurrence: 'weekly', // Default to weekly
      seriesTitle: title.replace(/\s*[#-]?\d+\s*$/, '').trim(),
    };
  }
  
  return { isRecurring: false };
}







