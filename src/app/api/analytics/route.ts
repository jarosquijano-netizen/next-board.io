import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getMeetingEfficiencyMetrics,
  getTeamVelocityMetrics,
  getBlockerAnalysis,
  getContributorStats,
  getCardTypeBreakdown,
  getCompletionTimeSeries,
} from '@/lib/analytics-service';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    // Calculate date range based on period
    const endDate = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Beginning of time
        break;
      default:
        startDate = subDays(endDate, 30);
    }

    const dateRange = { startDate, endDate };

    // Fetch all analytics data in parallel
    const [
      meetingEfficiency,
      velocity,
      blockers,
      contributors,
      cardTypes,
      timeSeries,
    ] = await Promise.all([
      getMeetingEfficiencyMetrics(userId, dateRange),
      getTeamVelocityMetrics(userId, dateRange),
      getBlockerAnalysis(userId, dateRange),
      getContributorStats(userId, dateRange),
      getCardTypeBreakdown(userId, dateRange),
      getCompletionTimeSeries(userId, dateRange),
    ]);

    return NextResponse.json({
      period,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      meetingEfficiency,
      velocity,
      blockers,
      contributors,
      cardTypes,
      timeSeries,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}





