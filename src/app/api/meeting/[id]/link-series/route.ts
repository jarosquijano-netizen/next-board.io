import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOrLinkToSeries, RecurrenceType } from '@/lib/meeting-series';
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
    const body = await request.json();
    const { seriesTitle, recurrence } = body;

    if (!seriesTitle || !recurrence) {
      return NextResponse.json(
        { error: 'seriesTitle and recurrence are required' },
        { status: 400 }
      );
    }

    // Check meeting ownership
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { userId: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (meeting.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Link to series
    const updatedMeeting = await createOrLinkToSeries(
      meetingId,
      seriesTitle,
      recurrence as RecurrenceType,
      userId
    );

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error('Link series error:', error);
    return NextResponse.json(
      { error: 'Failed to link meeting to series' },
      { status: 500 }
    );
  }
}







