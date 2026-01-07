import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const cards = await prisma.meetingCard.findMany({
      where: {
        meeting: { userId },
        OR: [
          { summary: { contains: query } },
          { context: { contains: query } },
          { owner: { contains: query } },
          { primaryContact: { contains: query } },
        ],
      },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: 15,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const results = cards.map(card => ({
      id: card.id,
      meetingId: card.meeting.id,
      meetingTitle: card.meeting.title,
      summary: card.summary,
      type: card.type,
      owner: card.owner,
      status: card.status,
      priority: card.priority,
      dueDate: card.dueDate,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}





