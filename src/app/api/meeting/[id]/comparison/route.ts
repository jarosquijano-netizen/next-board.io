import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateMeetingComparison } from '@/lib/meeting-series';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: meetingId } = await params;

    // Get current meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        userId: true,
        previousMeetingId: true,
        seriesId: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check authorization
    if (meeting.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if meeting has a previous meeting
    if (!meeting.previousMeetingId) {
      return NextResponse.json(
        { error: 'No previous meeting to compare with', hasComparison: false },
        { status: 200 }
      );
    }

    // Generate comparison
    const comparison = await generateMeetingComparison(meetingId, meeting.previousMeetingId);

    return NextResponse.json({
      hasComparison: true,
      comparison,
    });
  } catch (error) {
    console.error('Comparison generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}







