import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { handleStatusChange } from '@/lib/status-change-handler';

// Update a card
export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const { status, summary, owner, dueDate, type, context, priority, timeEstimate, additionalContacts } = body;

    // Get the old card to track changes
    const oldCard = await prisma.meetingCard.findFirst({
      where: {
        id,
        meeting: {
          userId: userId,
        },
      },
    });

    if (!oldCard) {
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      );
    }

    // Handle status change with time tracking
    if (status && status !== oldCard.status) {
      await handleStatusChange(id, status, userId);
    }

    // Prepare update data (excluding status as it's already handled)
    const updateData: any = {
      ...(summary && { summary }),
      ...(owner !== undefined && { owner }),
      ...(dueDate !== undefined && { dueDate }),
      ...(type && { type }),
      ...(context !== undefined && { context }),
      ...(priority && { priority }),
      ...(timeEstimate !== undefined && { timeEstimate }),
      ...(additionalContacts !== undefined && { additionalContacts }),
    };

    // Only update if there are non-status changes
    let card = oldCard;
    if (Object.keys(updateData).length > 0) {
      card = await prisma.meetingCard.update({
        where: { id },
        data: updateData,
      });
    } else if (status) {
      // Refetch card if only status was changed
      card = await prisma.meetingCard.findUnique({
        where: { id },
      }) || oldCard;
    }

    // Create activity log for edit (if significant fields changed)
    const changedFields = [];
    if (summary && summary !== oldCard.summary) changedFields.push('summary');
    if (owner !== undefined && owner !== oldCard.owner) changedFields.push('owner');
    if (type && type !== oldCard.type) changedFields.push('type');
    if (priority && priority !== oldCard.priority) changedFields.push('priority');
    if (additionalContacts !== undefined && additionalContacts !== oldCard.additionalContacts) changedFields.push('co-owners');

    if (changedFields.length > 0) {
      await prisma.cardActivity.create({
        data: {
          cardId: id,
          userId,
          activityType: 'edit',
          content: `Updated ${changedFields.join(', ')}`,
          metadata: JSON.stringify({
            changedFields,
            oldValues: {
              summary: oldCard.summary,
              owner: oldCard.owner,
              type: oldCard.type,
              priority: oldCard.priority,
            },
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        meetingId: card.meetingId,
        type: card.type,
        summary: card.summary,
        owner: card.owner,
        dueDate: card.dueDate,
        timestamp: card.timestamp,
        context: card.context,
        status: card.status,
        priority: card.priority,
        timeEstimate: card.timeEstimate,
        additionalContacts: card.additionalContacts,
        completedAt: card.completedAt,
        aiSummary: card.aiSummary,
        aiSummaryCreatedAt: card.aiSummaryCreatedAt,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.meetingCard.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}

