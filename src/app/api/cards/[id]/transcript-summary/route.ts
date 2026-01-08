import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Get the card with its meeting
    const card = await prisma.meetingCard.findUnique({
      where: { id },
      include: {
        meeting: true,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user owns this card's meeting
    if (card.meeting.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Use card context or summary as the base for generating a short summary
    const contextText = card.context || card.summary;
    
    if (!contextText) {
      return NextResponse.json({ 
        summary: card.summary 
      });
    }

    // Generate a short summary focusing on action items from the transcript context
    const prompt = `You are analyzing a meeting transcript excerpt to create a short summary of action items.

Context from transcript:
${contextText}

Card Summary: ${card.summary}
Card Owner: ${card.owner || 'Unassigned'}
Card Type: ${card.type}

Create a concise 1-2 sentence summary that:
1. Focuses on the key action items mentioned in the transcript context
2. Highlights what needs to be done
3. Mentions key people or stakeholders if relevant
4. Is written in clear, actionable language

Return ONLY the summary text, no additional formatting or explanation.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const summary = response.content[0].type === 'text' 
        ? response.content[0].text.trim()
        : contextText;

      return NextResponse.json({ summary });
    } catch (aiError) {
      console.error('Error generating transcript summary:', aiError);
      // Fallback to card context if AI fails
      return NextResponse.json({ 
        summary: contextText 
      });
    }
  } catch (error) {
    console.error('Error in transcript-summary route:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
