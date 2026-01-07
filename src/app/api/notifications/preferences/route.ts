import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/email-service';

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { notificationPreferences: true },
    });

    // Auto-create user if doesn't exist
    if (!user) {
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (clerkUser) {
        const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
        
        if (email) {
          user = await getOrCreateUser(
            userId,
            email,
            clerkUser.firstName || clerkUser.username || undefined
          );
        }
      }
      
      if (!user) {
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      preferences: user.notificationPreferences || {
        dailyDigest: true,
        dailyDigestTime: '08:00',
        overdueAlerts: true,
        dueTodayAlerts: true,
        dueTomorrowAlerts: true,
        assignedToMe: true,
        mentioned: true,
        cardComments: true,
        blockedAlerts: true,
        priorityEscalation: true,
        weeklyReport: true,
        weeklyReportDay: 'monday',
        enableQuietHours: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      },
    });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { notificationPreferences: true },
    });

    // Auto-create user if doesn't exist
    if (!user) {
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (clerkUser) {
        const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
        
        if (email) {
          user = await getOrCreateUser(
            userId,
            email,
            clerkUser.firstName || clerkUser.username || undefined
          );
        }
      }
      
      if (!user) {
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    }

    // Update or create preferences
    if (user.notificationPreferences) {
      // Update existing preferences
      const updatedPrefs = await prisma.notificationPreferences.update({
        where: { userId: user.id },
        data: {
          dailyDigest: body.dailyDigest,
          dailyDigestTime: body.dailyDigestTime,
          overdueAlerts: body.overdueAlerts,
          dueTodayAlerts: body.dueTodayAlerts,
          dueTomorrowAlerts: body.dueTomorrowAlerts,
          assignedToMe: body.assignedToMe,
          mentioned: body.mentioned,
          cardComments: body.cardComments,
          blockedAlerts: body.blockedAlerts,
          priorityEscalation: body.priorityEscalation,
          weeklyReport: body.weeklyReport,
          weeklyReportDay: body.weeklyReportDay,
          enableQuietHours: body.enableQuietHours,
          quietHoursStart: body.quietHoursStart,
          quietHoursEnd: body.quietHoursEnd,
        },
      });

      return NextResponse.json({
        success: true,
        preferences: updatedPrefs,
      });
    } else {
      // Create new preferences
      const newPrefs = await prisma.notificationPreferences.create({
        data: {
          userId: user.id,
          dailyDigest: body.dailyDigest,
          dailyDigestTime: body.dailyDigestTime,
          overdueAlerts: body.overdueAlerts,
          dueTodayAlerts: body.dueTodayAlerts,
          dueTomorrowAlerts: body.dueTomorrowAlerts,
          assignedToMe: body.assignedToMe,
          mentioned: body.mentioned,
          cardComments: body.cardComments,
          blockedAlerts: body.blockedAlerts,
          priorityEscalation: body.priorityEscalation,
          weeklyReport: body.weeklyReport,
          weeklyReportDay: body.weeklyReportDay,
          enableQuietHours: body.enableQuietHours,
          quietHoursStart: body.quietHoursStart,
          quietHoursEnd: body.quietHoursEnd,
        },
      });

      return NextResponse.json({
        success: true,
        preferences: newPrefs,
      });
    }

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

