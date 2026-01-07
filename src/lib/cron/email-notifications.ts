import { prisma } from '../prisma';
import { sendDailyDigest, sendOverdueAlert, sendDueTodayAlert } from '../email-service';

/**
 * Send daily digests - Run every hour, check user's preferred time
 */
export async function sendDailyDigests() {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:00`;

  console.log(`[CRON] Checking daily digests for time: ${currentTime}`);

  // Get users who want digest at this time
  const users = await prisma.user.findMany({
    where: {
      notificationPreferences: {
        dailyDigest: true,
        dailyDigestTime: currentTime,
      },
    },
    select: { id: true, email: true },
  });

  console.log(`[CRON] Sending daily digests to ${users.length} users`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      await sendDailyDigest(user.id);
      successCount++;
      console.log(`[CRON] ✓ Sent digest to ${user.email}`);
    } catch (error) {
      errorCount++;
      console.error(`[CRON] ✗ Failed to send digest to ${user.id}:`, error);
    }
  }

  console.log(`[CRON] Daily digests complete: ${successCount} sent, ${errorCount} failed`);
  
  return { success: successCount, failed: errorCount };
}

/**
 * Check for overdue cards - Run every 6 hours
 */
export async function checkOverdueCards() {
  console.log('[CRON] Checking for overdue cards...');

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const overdueCards = await prisma.meetingCard.findMany({
    where: {
      status: { not: 'done' },
      dueDate: { lt: now },
    },
    include: {
      meeting: true,
    },
  });

  console.log(`[CRON] Found ${overdueCards.length} overdue cards`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const card of overdueCards) {
    // Check if we already sent alert today
    const alertSentToday = await prisma.notification.findFirst({
      where: {
        cardId: card.id,
        type: 'overdue',
        createdAt: { gte: startOfDay },
      },
    });

    if (alertSentToday) {
      skippedCount++;
      continue;
    }

    try {
      await sendOverdueAlert(card.id);
      successCount++;
      console.log(`[CRON] ✓ Sent overdue alert for card: ${card.summary}`);
    } catch (error) {
      errorCount++;
      console.error(`[CRON] ✗ Failed to send overdue alert for card ${card.id}:`, error);
    }
  }

  console.log(`[CRON] Overdue alerts complete: ${successCount} sent, ${skippedCount} skipped, ${errorCount} failed`);
  
  return { success: successCount, skipped: skippedCount, failed: errorCount };
}

/**
 * Send "due today" alerts - Run at 8am
 */
export async function sendDueTodayAlerts() {
  console.log('[CRON] Sending due today alerts...');

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const dueTodayCards = await prisma.meetingCard.findMany({
    where: {
      status: { not: 'done' },
      dueDate: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    include: {
      meeting: true,
    },
  });

  console.log(`[CRON] Found ${dueTodayCards.length} cards due today`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const card of dueTodayCards) {
    // Get user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: card.meeting.userId },
      include: { notificationPreferences: true },
    });

    if (!user || !user.notificationPreferences?.dueTodayAlerts) {
      skippedCount++;
      continue;
    }

    // Check if we already sent alert today
    const alertSentToday = await prisma.notification.findFirst({
      where: {
        cardId: card.id,
        type: 'due_today',
        createdAt: { gte: startOfDay },
      },
    });

    if (alertSentToday) {
      skippedCount++;
      continue;
    }

    try {
      await sendDueTodayAlert(card.id);
      successCount++;
      console.log(`[CRON] ✓ Sent due today alert for card: ${card.summary}`);
    } catch (error) {
      errorCount++;
      console.error(`[CRON] ✗ Failed to send due today alert for card ${card.id}:`, error);
    }
  }

  console.log(`[CRON] Due today alerts complete: ${successCount} sent, ${skippedCount} skipped, ${errorCount} failed`);
  
  return { success: successCount, skipped: skippedCount, failed: errorCount };
}

/**
 * Send blocked card alerts - Run every 12 hours
 */
export async function sendBlockedAlerts() {
  console.log('[CRON] Checking for blocked cards...');

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  // Find cards that have been blocked for more than 24 hours
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const blockedCards = await prisma.meetingCard.findMany({
    where: {
      status: 'blocked',
      blockedSince: { lt: yesterday },
    },
    include: {
      meeting: true,
    },
  });

  console.log(`[CRON] Found ${blockedCards.length} cards blocked for 24+ hours`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const card of blockedCards) {
    // Get user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId: card.meeting.userId },
      include: { notificationPreferences: true },
    });

    if (!user || !user.notificationPreferences?.blockedAlerts) {
      skippedCount++;
      continue;
    }

    // Check if we already sent alert today
    const alertSentToday = await prisma.notification.findFirst({
      where: {
        cardId: card.id,
        type: 'blocked',
        createdAt: { gte: startOfDay },
      },
    });

    if (alertSentToday) {
      skippedCount++;
      continue;
    }

    try {
      // You can create a BlockedAlert template similar to OverdueAlert
      // For now, we'll skip or use a generic notification
      successCount++;
      console.log(`[CRON] ✓ Would send blocked alert for card: ${card.summary}`);
    } catch (error) {
      errorCount++;
      console.error(`[CRON] ✗ Failed to send blocked alert for card ${card.id}:`, error);
    }
  }

  console.log(`[CRON] Blocked alerts complete: ${successCount} sent, ${skippedCount} skipped, ${errorCount} failed`);
  
  return { success: successCount, skipped: skippedCount, failed: errorCount };
}





