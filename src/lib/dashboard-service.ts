import { prisma } from './prisma';
import { isToday, isTomorrow, isPast, subDays } from 'date-fns';

export interface DashboardOverview {
  criticalItems: {
    overdue: any[];
    dueToday: any[];
    dueTomorrow: any[];
    dueThisWeek: any[];
    dueNextWeek: any[];
    blocked: any[];
    urgent: any[];
  };
  myItems: {
    assignedToMe: any[];
    mentioningMe: any[];
    needingMyAction: any[];
  };
  recentActivity: {
    completed: any[];
    created: any[];
    updated: any[];
  };
  upcomingDeadlines: any[];
  meetingSummaries: Array<{
    meeting: any;
    stats: {
      total: number;
      completed: number;
      overdue: number;
      blocked: number;
    };
  }>;
}

/**
 * Get comprehensive dashboard data for a user
 */
export async function getDashboardData(userId: string, userEmail: string): Promise<DashboardOverview> {
  // Get all user's meetings
  const meetings = await prisma.meeting.findMany({
    where: { userId },
    include: {
      cards: true,
    },
    orderBy: {
      meetingDate: 'desc',
    },
  });

  // Flatten all cards across all meetings
  const allCards = meetings.flatMap(m => 
    m.cards.map(c => ({
      ...c,
      meetingTitle: m.title,
      meetingId: m.id,
      meetingDate: m.meetingDate,
    }))
  );

  const activeCards = allCards.filter(c => c.status !== 'Done'); // Fixed: capital D
  const now = new Date();

  // 1. CRITICAL ITEMS - Needs immediate attention
  const overdue = activeCards.filter(c => {
    if (!c.dueDate) return false;
    return isPast(new Date(c.dueDate)) && !isToday(new Date(c.dueDate));
  });

  const dueToday = activeCards.filter(c => 
    c.dueDate && isToday(new Date(c.dueDate))
  );

  const blocked = activeCards.filter(c => c.status === 'Blocked'); // Fixed: capital B

  const urgent = activeCards.filter(c => 
    c.priority === 'urgent' && 
    c.status !== 'Done' && // Fixed: capital D
    !overdue.find(oc => oc.id === c.id) && // Don't duplicate
    !dueToday.find(dc => dc.id === c.id)
  );

  // Additional date-based filters
  const dueTomorrow = activeCards.filter(c => 
    c.dueDate && isTomorrow(new Date(c.dueDate))
  );

  // Due this week (next 7 days excluding today and tomorrow)
  const dueThisWeek = activeCards.filter(c => {
    if (!c.dueDate) return false;
    const dueDate = new Date(c.dueDate);
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return dueDate > now && dueDate <= inSevenDays && 
           !isToday(dueDate) && !isTomorrow(dueDate);
  });

  // Due next week (8-14 days from now)
  const dueNextWeek = activeCards.filter(c => {
    if (!c.dueDate) return false;
    const dueDate = new Date(c.dueDate);
    const inEightDays = new Date(now);
    inEightDays.setDate(inEightDays.getDate() + 8);
    const inFourteenDays = new Date(now);
    inFourteenDays.setDate(inFourteenDays.getDate() + 14);
    return dueDate >= inEightDays && dueDate <= inFourteenDays;
  });

  // 2. MY ITEMS - Personally relevant
  const assignedToMe = activeCards.filter(c => 
    c.owner?.toLowerCase() === userEmail.toLowerCase() ||
    c.owner?.toLowerCase().includes(userEmail.split('@')[0].toLowerCase())
  );

  const mentioningMe = activeCards.filter(c => {
    // Parse involvedPeople from JSON string
    let involvedPeople: string[] = [];
    if (c.involvedPeople) {
      try {
        involvedPeople = typeof c.involvedPeople === 'string' 
          ? JSON.parse(c.involvedPeople) 
          : c.involvedPeople;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    
    return involvedPeople.some((p: string) => 
      p.toLowerCase().includes(userEmail.split('@')[0].toLowerCase())
    ) ||
    c.primaryContact?.toLowerCase().includes(userEmail.split('@')[0].toLowerCase());
  });

  const needingMyAction = activeCards.filter(c => {
    if (!c.interactionType) return false;
    
    // Parse additionalContacts from JSON string
    let additionalContacts: string[] = [];
    if (c.additionalContacts) {
      try {
        additionalContacts = typeof c.additionalContacts === 'string'
          ? JSON.parse(c.additionalContacts)
          : c.additionalContacts;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    
    return c.primaryContact?.toLowerCase().includes(userEmail.split('@')[0].toLowerCase()) ||
      additionalContacts.some((contact: string) => 
        contact.toLowerCase().includes(userEmail.split('@')[0].toLowerCase())
      );
  });

  // 3. RECENT ACTIVITY - Last 7 days
  const sevenDaysAgo = subDays(now, 7);

  const allCardsIncludingDone = await prisma.meetingCard.findMany({
    where: {
      meeting: { userId },
      updatedAt: { gte: sevenDaysAgo },
    },
    include: {
      meeting: {
        select: {
          title: true,
          id: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 20,
  });

  const recentCards = allCardsIncludingDone.map(c => ({
    ...c,
    meetingTitle: c.meeting.title,
    meetingId: c.meeting.id,
  }));

  const completed = recentCards.filter(c => 
    c.status === 'Done' &&  // Fixed: capital D
    c.completedAt && 
    c.completedAt >= sevenDaysAgo
  );

  const created = recentCards.filter(c => 
    c.createdAt >= sevenDaysAgo
  );

  const updated = recentCards.filter(c =>
    c.updatedAt >= sevenDaysAgo &&
    c.createdAt < sevenDaysAgo
  );

  // 4. UPCOMING DEADLINES - Next 7 days
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingDeadlines = activeCards
    .filter(c => {
      if (!c.dueDate) return false;
      const dueDate = new Date(c.dueDate);
      return dueDate > now && dueDate <= nextWeek;
    })
    .sort((a, b) => 
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    );

  // 5. MEETING SUMMARIES - Stats per meeting
  const meetingSummaries = meetings.map(meeting => {
    const meetingCards = meeting.cards;
    return {
      meeting: {
        id: meeting.id,
        title: meeting.title,
        date: meeting.meetingDate,
        seriesNumber: meeting.seriesNumber,
      },
      stats: {
        total: meetingCards.length,
        completed: meetingCards.filter(c => c.status === 'Done').length, // Fixed: capital D
        overdue: meetingCards.filter(c => c.dueDate && isPast(new Date(c.dueDate)) && c.status !== 'Done').length, // Fixed: capital D
        blocked: meetingCards.filter(c => c.status === 'Blocked').length, // Fixed: capital B
      },
    };
  }).filter(m => m.stats.total > 0); // Only meetings with cards

  return {
    criticalItems: {
      overdue: overdue.slice(0, 20),
      dueToday,
      dueTomorrow,
      dueThisWeek: dueThisWeek.slice(0, 20),
      dueNextWeek: dueNextWeek.slice(0, 20),
      blocked,
      urgent: urgent.slice(0, 10),
    },
    myItems: {
      assignedToMe: assignedToMe.slice(0, 20),
      mentioningMe: mentioningMe.slice(0, 10),
      needingMyAction: needingMyAction.slice(0, 10),
    },
    recentActivity: {
      completed: completed.slice(0, 10),
      created: created.slice(0, 10),
      updated: updated.slice(0, 10),
    },
    upcomingDeadlines: upcomingDeadlines.slice(0, 15),
    meetingSummaries: meetingSummaries.slice(0, 20),
  };
}

/**
 * Get quick stats for dashboard header
 */
export async function getDashboardStats(userId: string) {
  const allCards = await prisma.meetingCard.findMany({
    where: {
      meeting: { userId },
    },
  });

  const activeCards = allCards.filter(c => c.status !== 'Done'); // Fixed: capital D
  const now = new Date();

  // Calculate due this week (next 7 days excluding today and tomorrow)
  const dueThisWeekCount = activeCards.filter(c => {
    if (!c.dueDate) return false;
    const dueDate = new Date(c.dueDate);
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return dueDate > now && dueDate <= inSevenDays && 
           !isToday(dueDate) && !isTomorrow(dueDate);
  }).length;

  // Calculate due next week (8-14 days from now)
  const dueNextWeekCount = activeCards.filter(c => {
    if (!c.dueDate) return false;
    const dueDate = new Date(c.dueDate);
    const inEightDays = new Date(now);
    inEightDays.setDate(inEightDays.getDate() + 8);
    const inFourteenDays = new Date(now);
    inFourteenDays.setDate(inFourteenDays.getDate() + 14);
    return dueDate >= inEightDays && dueDate <= inFourteenDays;
  }).length;

  const stats = {
    totalActive: activeCards.length,
    overdue: activeCards.filter(c => c.dueDate && isPast(new Date(c.dueDate)) && !isToday(new Date(c.dueDate))).length,
    dueToday: activeCards.filter(c => c.dueDate && isToday(new Date(c.dueDate))).length,
    dueTomorrow: activeCards.filter(c => c.dueDate && isTomorrow(new Date(c.dueDate))).length,
    dueThisWeek: dueThisWeekCount,
    dueNextWeek: dueNextWeekCount,
    blocked: activeCards.filter(c => c.status === 'Blocked').length, // Fixed: capital B
    completedToday: allCards.filter(c => 
      c.status === 'Done' &&  // Fixed: capital D
      c.completedAt && 
      isToday(c.completedAt)
    ).length,
  };

  return stats;
}

