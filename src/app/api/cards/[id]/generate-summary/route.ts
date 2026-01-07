import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function getCardSummaryPrompt(card: any, activities: any[]) {
  const createdDate = new Date(card.createdAt);
  const completedDate = card.completedAt ? new Date(card.completedAt) : new Date();
  const durationDays = Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return `
You are summarizing the complete lifecycle of an action item from a meeting.

ORIGINAL ACTION ITEM:
- What: ${card.summary}
- Type: ${card.type}
- From Meeting: ${card.meeting.title}
- Owner: ${card.owner || 'Unassigned'}
- Original Context: ${card.context || 'N/A'}
- Priority: ${card.priority}
- Created: ${createdDate.toLocaleDateString()}
- Completed: ${completedDate.toLocaleDateString()}
- Duration: ${durationDays} ${durationDays === 1 ? 'day' : 'days'}

ACTIVITY LOG:
${activities.length === 0 ? '(No additional activities recorded)' : activities.map((a, i) => `
${i + 1}. [${new Date(a.createdAt).toLocaleDateString()} at ${new Date(a.createdAt).toLocaleTimeString()}] ${a.activityType.toUpperCase()}
   ${a.content}
   ${a.metadata ? `Metadata: ${a.metadata}` : ''}
`).join('\n')}

YOUR TASK:
Generate a concise 2-3 paragraph summary that:
1. States what was accomplished
2. Highlights key milestones or blockers encountered (if any)
3. Notes any important decisions or changes made during execution
4. Mentions final outcome and any next steps if applicable

Write in past tense, professional but conversational tone. Focus on outcomes and insights, not just listing activities.

EXAMPLE FORMAT:
"This action item was completed in X days. [Main accomplishment statement]. 
${activities.length > 0 ? 'During execution, [key challenge/blocker] was encountered and resolved by [how].' : ''}
[Owner] ${activities.length > 0 ? 'coordinated with [stakeholders] to' : 'successfully'} [specific action]. 
Final outcome: [result achieved]. ${card.blockedReason ? '[Mention any blockers that were overcome].' : ''}"

Generate the summary now:
`;
}

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

    // Get card with all activities and meeting info
    const card = await prisma.meetingCard.findFirst({
      where: {
        id: cardId,
        meeting: {
          userId: userId,
        },
      },
      include: {
        activities: {
          orderBy: { createdAt: 'asc' },
        },
        meeting: true,
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      );
    }

    if (card.status !== 'Done') {
      return NextResponse.json(
        { error: 'Can only generate summary for completed cards' },
        { status: 400 }
      );
    }

    if (card.aiSummary) {
      return NextResponse.json(
        { error: 'Summary already exists', summary: card.aiSummary },
        { status: 200 }
      );
    }

    // Generate AI summary
    const prompt = getCardSummaryPrompt(card, card.activities);

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    // Save summary to card
    const updatedCard = await prisma.meetingCard.update({
      where: { id: cardId },
      data: {
        aiSummary: summary,
        aiSummaryCreatedAt: new Date(),
      },
      include: {
        activities: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json(updatedCard, { status: 200 });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

