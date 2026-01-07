import { NextRequest, NextResponse } from 'next/server';
import { 
  sendDailyDigests, 
  checkOverdueCards, 
  sendDueTodayAlerts,
  sendBlockedAlerts 
} from '@/lib/cron/email-notifications';

/**
 * Cron job endpoint for email notifications
 * 
 * Usage:
 * - Daily digests: GET /api/cron/email-notifications?type=daily-digest
 * - Overdue checks: GET /api/cron/email-notifications?type=overdue-check
 * - Due today: GET /api/cron/email-notifications?type=due-today
 * - Blocked alerts: GET /api/cron/email-notifications?type=blocked-alerts
 * 
 * See railway.json for cron configuration
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const secret = searchParams.get('secret');

  // Verify cron secret
  if (!process.env.CRON_SECRET) {
    console.warn('[CRON] CRON_SECRET not configured - cron jobs will not run');
    return NextResponse.json(
      { error: 'Cron secret not configured' },
      { status: 500 }
    );
  }

  if (secret !== process.env.CRON_SECRET) {
    console.error('[CRON] Unauthorized cron attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log(`[CRON] Starting job: ${type}`);
    const startTime = Date.now();

    let result;

    switch (type) {
      case 'daily-digest':
        result = await sendDailyDigests();
        break;

      case 'overdue-check':
        result = await checkOverdueCards();
        break;

      case 'due-today':
        result = await sendDueTodayAlerts();
        break;

      case 'blocked-alerts':
        result = await sendBlockedAlerts();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid cron type', validTypes: ['daily-digest', 'overdue-check', 'due-today', 'blocked-alerts'] },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Completed ${type} in ${duration}ms`);

    return NextResponse.json({
      success: true,
      type,
      result,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error(`[CRON] Error in ${type}:`, error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        type,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint (for testing)
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  // In production, you'd want to check for authentication here
  // For now, we'll just require the CRON_SECRET
  
  try {
    const body = await request.json();
    const { type, secret } = body;

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[CRON] Manual trigger: ${type}`);

    let result;

    switch (type) {
      case 'daily-digest':
        result = await sendDailyDigests();
        break;

      case 'overdue-check':
        result = await checkOverdueCards();
        break;

      case 'due-today':
        result = await sendDueTodayAlerts();
        break;

      case 'blocked-alerts':
        result = await sendBlockedAlerts();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid cron type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      trigger: 'manual',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[CRON] Manual trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger cron job' },
      { status: 500 }
    );
  }
}

