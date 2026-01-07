import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { id: cardId } = await params;
    const body = await request.json();
    const { content, activityType = 'note', metadata } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify card exists and user has access
    const card = await prisma.meetingCard.findFirst({
      where: {
        id: cardId,
        meeting: {
          userId: userId,
        },
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create the activity
    const activity = await prisma.cardActivity.create({
      data: {
        cardId,
        userId,
        activityType,
        content: content.trim(),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { id: cardId } = await params;

    // Verify card exists and user has access
    const card = await prisma.meetingCard.findFirst({
      where: {
        id: cardId,
        meeting: {
          userId: userId,
        },
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get all activities for this card
    const activities = await prisma.cardActivity.findMany({
      where: { cardId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

