import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { carryoverIncompleteItems } from '@/lib/meeting-series';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: meetingId } = await params;

    // Get meeting and check if it has a previous meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        userId: true,
        previousMeetingId: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (meeting.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!meeting.previousMeetingId) {
      return NextResponse.json(
        { error: 'No previous meeting to carry over from' },
        { status: 400 }
      );
    }

    // Carryover items
    const carriedCards = await carryoverIncompleteItems(
      meetingId,
      meeting.previousMeetingId
    );

    return NextResponse.json({
      success: true,
      carriedCount: carriedCards.length,
      cards: carriedCards,
    });
  } catch (error) {
    console.error('Carryover error:', error);
    return NextResponse.json(
      { error: 'Failed to carryover items' },
      { status: 500 }
    );
  }
}







