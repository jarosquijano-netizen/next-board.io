import { prisma } from '../prisma';
import { getTimeInCurrentStatus, calculateAutoPriority } from '../time-tracker';

/**
 * Run this daily or every 6 hours to auto-escalate priorities
 * Can be triggered by:
 * - Vercel Cron
 * - Railway Cron
 * - External cron service (cron-job.org)
 */
export async function runAutoPriorityEscalation() {
  console.log('[CRON] Starting auto-priority escalation...');
  
  // Get all active cards (not done)
  const activeCards = await prisma.meetingCard.findMany({
    where: {
      status: {
        not: 'Done',
      },
    },
  });
  
  const updates: any[] = [];
  
  for (const card of activeCards) {
    const timeInStatus = getTimeInCurrentStatus(card.currentStatusSince);
    const autoPriority = calculateAutoPriority(card.priority || 'medium', card.status, timeInStatus);
    
    if (autoPriority.shouldUpdate) {
      updates.push({
        cardId: card.id,
        oldPriority: card.priority,
        newPriority: autoPriority.newPriority,
        reason: autoPriority.reason,
      });
      
      // Update card
      await prisma.meetingCard.update({
        where: { id: card.id },
        data: {
          priority: autoPriority.newPriority,
          priorityAutoUpdated: true,
          lastPriorityUpdate: new Date(),
        },
      });
      
      // Log activity
      await prisma.cardActivity.create({
        data: {
          cardId: card.id,
          userId: 'system', // System user
          activityType: 'priority_change',
          content: `Priority auto-escalated from ${card.priority} to ${autoPriority.newPriority}: ${autoPriority.reason}`,
          metadata: JSON.stringify({
            automated: true,
            oldPriority: card.priority,
            newPriority: autoPriority.newPriority,
            reason: autoPriority.reason,
          }),
        },
      });
    }
  }
  
  console.log(`[CRON] Updated ${updates.length} cards:`, updates);
  return updates;
}







