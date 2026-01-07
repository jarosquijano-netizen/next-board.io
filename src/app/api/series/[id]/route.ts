import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSeriesOverview } from '@/lib/meeting-series';
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

    const { id: seriesId } = await params;

    // Check series ownership
    const series = await prisma.meetingSeries.findUnique({
      where: { id: seriesId },
      select: { userId: true },
    });

    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    if (series.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get series overview
    const overview = await getSeriesOverview(seriesId);

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Series fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}







