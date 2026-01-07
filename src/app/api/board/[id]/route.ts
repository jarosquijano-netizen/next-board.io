import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const meeting = await prisma.meeting.findUnique({
      where: { 
        id,
        userId, // Ensure user can only access their own meetings
      },
      include: { 
        cards: {
          include: {
            activities: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: meeting.id,
      title: meeting.title,
      summary: meeting.summary,
      createdAt: meeting.createdAt.toISOString(),
      cards: meeting.cards.map((card) => ({
        id: card.id,
        meetingId: card.meetingId,
        type: card.type,
        summary: card.summary,
        owner: card.owner,
        dueDate: card.dueDate,
        dueDateRaw: card.dueDateRaw,
        priority: card.priority,
        timeEstimate: card.timeEstimate,
        timestamp: card.timestamp,
        context: card.context,
        status: card.status,
        completedAt: card.completedAt,
        aiSummary: card.aiSummary,
        aiSummaryCreatedAt: card.aiSummaryCreatedAt,
        blockedReason: card.blockedReason,
        blockedBy: card.blockedBy,
        blockedSince: card.blockedSince,
        // People Interaction fields (deserialize JSON strings to arrays)
        involvedPeople: card.involvedPeople ? JSON.parse(card.involvedPeople) : [],
        interactionType: card.interactionType,
        primaryContact: card.primaryContact,
        additionalContacts: card.additionalContacts ? JSON.parse(card.additionalContacts) : [],
        interactionNote: card.interactionNote,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
        activities: card.activities.map((activity) => ({
          id: activity.id,
          cardId: activity.cardId,
          userId: activity.userId,
          activityType: activity.activityType,
          content: activity.content,
          metadata: activity.metadata,
          createdAt: activity.createdAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Check if meeting exists and belongs to user
    const meeting = await prisma.meeting.findUnique({
      where: { 
        id,
        userId,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Delete the meeting (cascade will delete associated cards)
    await prisma.meeting.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Board deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}

