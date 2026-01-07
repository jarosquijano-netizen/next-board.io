import { sendEmail } from './email-service';
import { prisma } from './prisma';
import { OverdueAlert } from '../../emails/templates/OverdueAlert';
import React from 'react';

/**
 * Send email when card is assigned to someone
 */
export async function onCardAssigned(cardId: string, assignedToEmail: string) {
  const card = await prisma.meetingCard.findUnique({
    where: { id: cardId },
    include: { meeting: true },
  });

  if (!card) return;

  const user = await prisma.user.findUnique({
    where: { email: assignedToEmail },
    include: { notificationPreferences: true },
  });

  if (!user?.notificationPreferences?.assignedToMe) return;

  await sendEmail({
    to: assignedToEmail,
    subject: `🎯 New action assigned to you: ${card.summary}`,
    react: React.createElement(OverdueAlert, {
      userName: user.name || assignedToEmail,
      card,
      daysOverdue: 0,
    }),
    userId: user.id,
    type: 'assigned',
    cardId: card.id,
  });
}

/**
 * Send email when someone is mentioned in a comment
 */
export async function onUserMentioned(
  cardId: string,
  mentionedEmail: string,
  comment: string,
  mentionedBy: string
) {
  const user = await prisma.user.findUnique({
    where: { email: mentionedEmail },
    include: { notificationPreferences: true },
  });

  if (!user?.notificationPreferences?.mentioned) return;

  const card = await prisma.meetingCard.findUnique({
    where: { id: cardId },
    include: { meeting: true },
  });

  if (!card) return;

  await sendEmail({
    to: mentionedEmail,
    subject: `💬 ${mentionedBy} mentioned you in a comment`,
    react: React.createElement(OverdueAlert, {
      userName: user.name || mentionedEmail,
      card,
      daysOverdue: 0,
    }),
    userId: user.id,
    type: 'mentioned',
    cardId,
  });
}

/**
 * Send email when card becomes blocked
 */
export async function onCardBlocked(cardId: string) {
  const card = await prisma.meetingCard.findUnique({
    where: { id: cardId },
    include: {
      meeting: true,
    },
  });

  if (!card || !card.owner) return;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: card.meeting.userId },
    include: { notificationPreferences: true },
  });

  if (!user || !user.notificationPreferences?.blockedAlerts) return;

  await sendEmail({
    to: user.email,
    subject: `🚧 Card blocked: ${card.summary}`,
    react: React.createElement(OverdueAlert, {
      userName: user.name || card.owner,
      card,
      daysOverdue: 0,
    }),
    userId: user.id,
    type: 'blocked',
    cardId: card.id,
  });
}





