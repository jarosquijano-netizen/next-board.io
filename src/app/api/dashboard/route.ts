import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDashboardData } from '@/lib/dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's email from Clerk
    const user = await currentUser();
    const userEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || '';

    const data = await getDashboardData(userId, userEmail);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}





