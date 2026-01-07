import { Resend } from 'resend';
import { prisma } from './prisma';
import { DailyDigest } from '../../emails/templates/DailyDigest';
import { OverdueAlert } from '../../emails/templates/OverdueAlert';
import { DueTodayAlert } from '../../emails/templates/DueTodayAlert';
import React from 'react';

// Lazy initialization to avoid build-time errors when env vars aren't available
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
  userId: string;
  type: string;
  cardId?: string;
  meetingId?: string;
}

/**
 * Send email with notification tracking
 */
export async function sendEmail({
  to,
  subject,
  react,
  userId,
  type,
  cardId,
  meetingId,
}: SendEmailParams) {
  try {
    // Send via Resend - it accepts React components directly
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'NextBoard'} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [to],
      subject,
      react,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Log notification
    await prisma.notification.create({
      data: {
        userId,
        type,
        title: subject,
        message: subject,
        cardId,
        meetingId,
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);

    // Log failed notification
    await prisma.notification.create({
      data: {
        userId,
        type,
        title: subject,
        message: subject,
        cardId,
        meetingId,
        emailSent: false,
        emailError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return { success: false, error };
  }
}

/**
 * Send daily digest email
 */
export async function sendDailyDigest(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationPreferences: true },
  });

  if (!user || !user.email) return;
  if (!user.notificationPreferences?.dailyDigest) return;

  // Check quiet hours
  if (isInQuietHours(user.notificationPreferences)) return;

  // Get user's meetings and cards
  const meetings = await prisma.meeting.findMany({
    where: { userId: user.clerkUserId },
    include: {
      cards: {
        where: { status: { not: 'done' } },
      },
    },
  });

  const cards = meetings.flatMap(m => m.cards);

  // Filter by status
  const now = new Date();
  const overdueCards = cards.filter(c => c.dueDate && new Date(c.dueDate) < now);
  const dueTodayCards = cards.filter(c => 
    c.dueDate && 
    new Date(c.dueDate).toDateString() === now.toDateString()
  );
  const blockedCards = cards.filter(c => c.status === 'blocked');

  // Get yesterday's completed cards
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const allMeetingsForUser = await prisma.meeting.findMany({
    where: { userId: user.clerkUserId },
  });
  
  const completedYesterday = await prisma.meetingCard.count({
    where: {
      meetingId: { in: allMeetingsForUser.map(m => m.id) },
      status: 'done',
      completedAt: {
        gte: yesterday,
        lt: now,
      },
    },
  });

  // Don't send if nothing to report
  if (overdueCards.length === 0 && dueTodayCards.length === 0 && blockedCards.length === 0) {
    return;
  }

  await sendEmail({
    to: user.email,
    subject: `☀️ Your Daily Focus - ${overdueCards.length + dueTodayCards.length} items need attention`,
    react: React.createElement(DailyDigest, {
      userName: user.name || 'there',
      overdueCards,
      dueTodayCards,
      blockedCards,
      stats: {
        totalActive: cards.length,
        completedYesterday,
      },
    }),
    userId,
    type: 'daily_digest',
  });
}

/**
 * Send overdue alert
 */
export async function sendOverdueAlert(cardId: string) {
  const card = await prisma.meetingCard.findUnique({
    where: { id: cardId },
    include: {
      meeting: true,
    },
  });

  if (!card || !card.owner || !card.dueDate) return;

  // Get user by Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkUserId: card.meeting.userId },
    include: { notificationPreferences: true },
  });

  if (!user || !user.email || !user.notificationPreferences?.overdueAlerts) return;

  const daysOverdue = Math.floor(
    (Date.now() - new Date(card.dueDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  await sendEmail({
    to: user.email,
    subject: `⚠️ Overdue: ${card.summary}`,
    react: React.createElement(OverdueAlert, {
      userName: user.name || card.owner,
      card,
      daysOverdue,
    }),
    userId: user.id,
    type: 'overdue',
    cardId: card.id,
  });
}

/**
 * Send due today alert
 */
export async function sendDueTodayAlert(cardId: string) {
  const card = await prisma.meetingCard.findUnique({
    where: { id: cardId },
    include: {
      meeting: true,
    },
  });

  if (!card || !card.owner || !card.dueDate) return;

  // Get user by Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkUserId: card.meeting.userId },
    include: { notificationPreferences: true },
  });

  if (!user || !user.email || !user.notificationPreferences?.dueTodayAlerts) return;

  await sendEmail({
    to: user.email,
    subject: `🎯 Due Today: ${card.summary}`,
    react: React.createElement(DueTodayAlert, {
      userName: user.name || card.owner,
      card,
    }),
    userId: user.id,
    type: 'due_today',
    cardId: card.id,
  });
}

/**
 * Check if in quiet hours
 */
function isInQuietHours(prefs: any): boolean {
  if (!prefs.enableQuietHours) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return currentTime >= prefs.quietHoursStart || currentTime <= prefs.quietHoursEnd;
}

/**
 * Get or create user from Clerk user ID
 */
export async function getOrCreateUser(clerkUserId: string, email: string, name?: string) {
  // First try to find by Clerk ID
  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: { notificationPreferences: true },
  });

  if (user) {
    return user;
  }

  // If not found by Clerk ID, check if user exists by email
  user = await prisma.user.findUnique({
    where: { email },
    include: { notificationPreferences: true },
  });

  if (user) {
    // User exists with this email but different Clerk ID - update it
    user = await prisma.user.update({
      where: { email },
      data: { clerkUserId, name },
      include: { notificationPreferences: true },
    });
    return user;
  }

  // User doesn't exist at all - create new one
  try {
    user = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name,
        notificationPreferences: {
          create: {}, // Creates with default settings
        },
      },
      include: { notificationPreferences: true },
    });
  } catch (error) {
    // Race condition: another request created the user, try to fetch again
    user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { notificationPreferences: true },
    });
    
    if (!user) {
      throw error; // Re-throw if we still can't find the user
    }
  }

  return user;
}

