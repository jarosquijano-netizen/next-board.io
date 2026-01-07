import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/email-service';

/**
 * POST /api/user/sync
 * Sync Clerk user to local database for email notifications
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user details from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get primary email
    const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: 'No email found for user' },
        { status: 400 }
      );
    }

    // Create or update user in database
    const user = await getOrCreateUser(
      userId,
      email,
      clerkUser.firstName || clerkUser.username || undefined
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasNotificationPreferences: !!user.notificationPreferences,
      },
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/sync
 * Check if user is synced
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

    const { prisma } = await import('@/lib/prisma');
    
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { notificationPreferences: true },
    });

    return NextResponse.json({
      synced: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        hasNotificationPreferences: !!user.notificationPreferences,
      } : null,
    });

  } catch (error) {
    console.error('Error checking user sync:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}





