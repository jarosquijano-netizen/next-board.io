import { prisma } from './prisma';
import { differenceInHours } from 'date-fns';

export async function handleStatusChange(
  cardId: string,
  newStatus: string,
  userId: string
) {
  // Get current card state
  const card = await prisma.meetingCard.findUnique({
    where: { id: cardId },
  });

  if (!card) throw new Error('Card not found');

  const oldStatus = card.status;
  const now = new Date();
  
  // If status hasn't changed, don't do anything
  if (oldStatus === newStatus) return card;
  
  // Calculate time spent in previous status
  const hoursInPreviousStatus = differenceInHours(now, new Date(card.currentStatusSince));
  
  // Update time tracking fields based on old status
  const timeUpdates: any = {};
  
  if (oldStatus === 'To Do') {
    timeUpdates.timeInTodo = card.timeInTodo + hoursInPreviousStatus;
  } else if (oldStatus === 'In Progress') {
    timeUpdates.timeInProgress = card.timeInProgress + hoursInPreviousStatus;
  } else if (oldStatus === 'Blocked') {
    timeUpdates.timeInBlocked = card.timeInBlocked + hoursInPreviousStatus;
  }
  
  // Create status history entry
  await prisma.statusHistoryEntry.create({
    data: {
      cardId,
      fromStatus: oldStatus,
      toStatus: newStatus,
      durationInStatus: hoursInPreviousStatus,
    },
  });
  
  // Update card with new status and reset currentStatusSince
  const updatedCard = await prisma.meetingCard.update({
    where: { id: cardId },
    data: {
      status: newStatus,
      currentStatusSince: now,
      completedAt: newStatus === 'Done' ? now : null,
      blockedSince: newStatus === 'Blocked' ? (card.blockedSince || now) : null,
      ...timeUpdates,
    },
  });
  
  // Log activity
  const days = Math.floor(hoursInPreviousStatus / 24);
  const hours = hoursInPreviousStatus % 24;
  const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  
  await prisma.cardActivity.create({
    data: {
      cardId,
      userId,
      activityType: 'status_change',
      content: `Moved from "${oldStatus}" to "${newStatus}" (was in ${oldStatus} for ${timeStr})`,
      metadata: JSON.stringify({
        oldStatus,
        newStatus,
        timeInPreviousStatus: timeStr,
        hoursInPreviousStatus,
      }),
    },
  });
  
  return updatedCard;
}







