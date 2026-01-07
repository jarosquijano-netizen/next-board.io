import { prisma } from './prisma';
import { startOfWeek, differenceInDays, format, subDays } from 'date-fns';

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
}

export interface MeetingEfficiencyMetrics {
  totalMeetings: number;
  avgCompletionRate: number;
  avgItemsPerMeeting: number;
  avgMeetingDuration: number;
  completionRateTrend: number;
  itemsPerMeetingTrend: number;
}

export interface TeamVelocityMetrics {
  itemsCreated: number;
  itemsCompleted: number;
  itemsActive: number;
  completionRate: number;
  avgCompletionTime: number;
  velocity: number;
  trend: 'up' | 'down' | 'stable';
}

export interface BlockerAnalysis {
  totalBlockers: number;
  avgBlockedDays: number;
  topBlockers: Array<{
    reason: string;
    count: number;
    avgDuration: number;
  }>;
  blockersByPerson: Array<{
    person: string;
    count: number;
  }>;
}

export interface ContributorStats {
  person: string;
  itemsOwned: number;
  itemsCompleted: number;
  completionRate: number;
  avgCompletionTime: number;
  currentBlocked: number;
}

export interface CardTypeBreakdown {
  type: string;
  total: number;
  completed: number;
  completionRate: number;
  avgCompletionTime: number;
}

/**
 * Get meeting efficiency metrics
 */
export async function getMeetingEfficiencyMetrics(
  userId: string,
  period: AnalyticsPeriod
): Promise<MeetingEfficiencyMetrics> {
  const meetings = await prisma.meeting.findMany({
    where: {
      userId,
      meetingDate: {
        gte: period.startDate,
        lte: period.endDate,
      },
    },
    include: {
      cards: true,
    },
  });

  if (meetings.length === 0) {
    return {
      totalMeetings: 0,
      avgCompletionRate: 0,
      avgItemsPerMeeting: 0,
      avgMeetingDuration: 0,
      completionRateTrend: 0,
      itemsPerMeetingTrend: 0,
    };
  }

  const completionRates = meetings.map(m => {
    const completed = m.cards.filter(c => c.status === 'done').length;
    return m.cards.length > 0 ? (completed / m.cards.length) * 100 : 0;
  });

  const avgCompletionRate = completionRates.reduce((a, b) => a + b, 0) / meetings.length;
  const avgItemsPerMeeting = meetings.reduce((sum, m) => sum + m.cards.length, 0) / meetings.length;
  const avgMeetingDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0) / meetings.length;

  const daysDiff = differenceInDays(period.endDate, period.startDate);
  const previousPeriod = {
    startDate: subDays(period.startDate, daysDiff),
    endDate: period.startDate,
  };

  const previousMeetings = await prisma.meeting.findMany({
    where: {
      userId,
      meetingDate: {
        gte: previousPeriod.startDate,
        lt: previousPeriod.endDate,
      },
    },
    include: {
      cards: true,
    },
  });

  let completionRateTrend = 0;
  let itemsPerMeetingTrend = 0;

  if (previousMeetings.length > 0) {
    const prevCompletionRates = previousMeetings.map(m => {
      const completed = m.cards.filter(c => c.status === 'done').length;
      return m.cards.length > 0 ? (completed / m.cards.length) * 100 : 0;
    });
    const prevAvgCompletionRate = prevCompletionRates.reduce((a, b) => a + b, 0) / previousMeetings.length;
    const prevAvgItemsPerMeeting = previousMeetings.reduce((sum, m) => sum + m.cards.length, 0) / previousMeetings.length;

    completionRateTrend = avgCompletionRate - prevAvgCompletionRate;
    itemsPerMeetingTrend = avgItemsPerMeeting - prevAvgItemsPerMeeting;
  }

  return {
    totalMeetings: meetings.length,
    avgCompletionRate,
    avgItemsPerMeeting,
    avgMeetingDuration,
    completionRateTrend,
    itemsPerMeetingTrend,
  };
}

/**
 * Get team velocity metrics
 */
export async function getTeamVelocityMetrics(
  userId: string,
  period: AnalyticsPeriod
): Promise<TeamVelocityMetrics> {
  const cards = await prisma.meetingCard.findMany({
    where: {
      meeting: {
        userId,
      },
      createdAt: {
        gte: period.startDate,
        lte: period.endDate,
      },
    },
  });

  const itemsCreated = cards.length;
  const itemsCompleted = cards.filter(c => c.status === 'done').length;
  const itemsActive = cards.filter(c => c.status !== 'done').length;
  const completionRate = itemsCreated > 0 ? (itemsCompleted / itemsCreated) * 100 : 0;

  const completedCards = cards.filter(c => c.status === 'done' && c.completedAt);
  const avgCompletionTime = completedCards.length > 0
    ? completedCards.reduce((sum, c) => {
        return sum + differenceInDays(c.completedAt!, c.createdAt);
      }, 0) / completedCards.length
    : 0;

  const weeks = Math.max(1, differenceInDays(period.endDate, period.startDate) / 7);
  const velocity = itemsCompleted / weeks;

  const daysDiff = differenceInDays(period.endDate, period.startDate);
  const previousPeriod = {
    startDate: subDays(period.startDate, daysDiff),
    endDate: period.startDate,
  };

  const previousCards = await prisma.meetingCard.findMany({
    where: {
      meeting: {
        userId,
      },
      createdAt: {
        gte: previousPeriod.startDate,
        lt: previousPeriod.endDate,
      },
      status: 'done',
    },
  });

  const previousVelocity = previousCards.length / weeks;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  
  if (velocity > previousVelocity * 1.1) trend = 'up';
  else if (velocity < previousVelocity * 0.9) trend = 'down';

  return {
    itemsCreated,
    itemsCompleted,
    itemsActive,
    completionRate,
    avgCompletionTime,
    velocity,
    trend,
  };
}

/**
 * Get blocker analysis
 */
export async function getBlockerAnalysis(
  userId: string,
  period: AnalyticsPeriod
): Promise<BlockerAnalysis> {
  const blockers = await prisma.meetingCard.findMany({
    where: {
      meeting: {
        userId,
      },
      OR: [
        { status: 'blocked' },
        { type: 'Blocker' },
      ],
      createdAt: {
        gte: period.startDate,
        lte: period.endDate,
      },
    },
  });

  const totalBlockers = blockers.length;

  const avgBlockedDays = blockers.length > 0
    ? blockers.reduce((sum, b) => {
        if (b.blockedSince) {
          const endDate = b.completedAt || new Date();
          return sum + differenceInDays(endDate, b.blockedSince);
        }
        return sum;
      }, 0) / blockers.length
    : 0;

  const reasonCounts = new Map<string, { count: number; totalDays: number }>();
  
  blockers.forEach(b => {
    const reason = b.blockedReason || 'Unknown';
    const existing = reasonCounts.get(reason) || { count: 0, totalDays: 0 };
    
    let days = 0;
    if (b.blockedSince) {
      const endDate = b.completedAt || new Date();
      days = differenceInDays(endDate, b.blockedSince);
    }
    
    reasonCounts.set(reason, {
      count: existing.count + 1,
      totalDays: existing.totalDays + days,
    });
  });

  const topBlockers = Array.from(reasonCounts.entries())
    .map(([reason, data]) => ({
      reason,
      count: data.count,
      avgDuration: data.count > 0 ? data.totalDays / data.count : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const personCounts = new Map<string, number>();
  
  blockers.forEach(b => {
    if (b.owner) {
      personCounts.set(b.owner, (personCounts.get(b.owner) || 0) + 1);
    }
  });

  const blockersByPerson = Array.from(personCounts.entries())
    .map(([person, count]) => ({ person, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalBlockers,
    avgBlockedDays,
    topBlockers,
    blockersByPerson,
  };
}

/**
 * Get contributor stats
 */
export async function getContributorStats(
  userId: string,
  period: AnalyticsPeriod
): Promise<ContributorStats[]> {
  const cards = await prisma.meetingCard.findMany({
    where: {
      meeting: {
        userId,
      },
      createdAt: {
        gte: period.startDate,
        lte: period.endDate,
      },
      owner: {
        not: null,
      },
    },
  });

  const peopleMap = new Map<string, {
    owned: number;
    completed: number;
    totalDays: number;
    blocked: number;
  }>();

  cards.forEach(card => {
    if (!card.owner) return;

    const existing = peopleMap.get(card.owner) || {
      owned: 0,
      completed: 0,
      totalDays: 0,
      blocked: 0,
    };

    existing.owned++;
    
    if (card.status === 'done') {
      existing.completed++;
      if (card.completedAt) {
        existing.totalDays += differenceInDays(card.completedAt, card.createdAt);
      }
    }
    
    if (card.status === 'blocked') {
      existing.blocked++;
    }

    peopleMap.set(card.owner, existing);
  });

  return Array.from(peopleMap.entries())
    .map(([person, data]) => ({
      person,
      itemsOwned: data.owned,
      itemsCompleted: data.completed,
      completionRate: data.owned > 0 ? (data.completed / data.owned) * 100 : 0,
      avgCompletionTime: data.completed > 0 ? data.totalDays / data.completed : 0,
      currentBlocked: data.blocked,
    }))
    .sort((a, b) => b.itemsCompleted - a.itemsCompleted);
}

/**
 * Get card type breakdown
 */
export async function getCardTypeBreakdown(
  userId: string,
  period: AnalyticsPeriod
): Promise<CardTypeBreakdown[]> {
  const cards = await prisma.meetingCard.findMany({
    where: {
      meeting: {
        userId,
      },
      createdAt: {
        gte: period.startDate,
        lte: period.endDate,
      },
    },
  });

  const typeMap = new Map<string, {
    total: number;
    completed: number;
    totalDays: number;
  }>();

  cards.forEach(card => {
    const existing = typeMap.get(card.type) || {
      total: 0,
      completed: 0,
      totalDays: 0,
    };

    existing.total++;
    
    if (card.status === 'done') {
      existing.completed++;
      if (card.completedAt) {
        existing.totalDays += differenceInDays(card.completedAt, card.createdAt);
      }
    }

    typeMap.set(card.type, existing);
  });

  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      total: data.total,
      completed: data.completed,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      avgCompletionTime: data.completed > 0 ? data.totalDays / data.completed : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Get time series data for charts
 */
export async function getCompletionTimeSeries(
  userId: string,
  period: AnalyticsPeriod
): Promise<Array<{ date: string; completed: number; created: number }>> {
  const cards = await prisma.meetingCard.findMany({
    where: {
      meeting: {
        userId,
      },
      createdAt: {
        gte: period.startDate,
        lte: period.endDate,
      },
    },
  });

  const weekMap = new Map<string, { completed: number; created: number }>();

  cards.forEach(card => {
    const weekStart = startOfWeek(card.createdAt);
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    const existing = weekMap.get(weekKey) || { completed: 0, created: 0 };
    existing.created++;

    if (card.status === 'done' && card.completedAt) {
      const completedWeek = format(startOfWeek(card.completedAt), 'yyyy-MM-dd');
      const completedData = weekMap.get(completedWeek) || { completed: 0, created: 0 };
      completedData.completed++;
      weekMap.set(completedWeek, completedData);
    }

    weekMap.set(weekKey, existing);
  });

  return Array.from(weekMap.entries())
    .map(([date, data]) => ({
      date: format(new Date(date), 'MMM d'),
      ...data,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}





