import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get all meetings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const meetings = await prisma.meeting.findMany({
      where: { userId }, // Filter by user
      include: {
        cards: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      meetings: meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        summary: meeting.summary,
        createdAt: meeting.createdAt.toISOString(),
        cardCount: meeting.cards.length,
        // Series information
        seriesId: meeting.seriesId,
        seriesNumber: meeting.seriesNumber,
        isRecurring: meeting.isRecurring,
        previousMeetingId: meeting.previousMeetingId,
        nextMeetingId: meeting.nextMeetingId,
        cards: meeting.cards.map((card) => ({
          id: card.id,
          meetingId: card.meetingId,
          type: card.type,
          summary: card.summary,
          owner: card.owner,
          dueDate: card.dueDate,
          timestamp: card.timestamp,
          context: card.context,
          status: card.status,
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

