// File: /src/app/api/cards/[id]/generate-message/route.ts
// AI Message Generator API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

interface CardSituation {
  type: 'overdue' | 'due_today' | 'due_soon' | 'stagnant' | 'blocked' | 'escalated' | 'completed' | 'active';
  daysOverdue?: number;
  daysSinceStatusChange?: number;
  daysUntilDue?: number;
}

// POST - Generate message for a specific card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: cardId } = await params;
    const body = await request.json();
    const { messageType, tone } = body;
    
    const card = await prisma.meetingCard.findFirst({
      where: {
        id: cardId,
        meeting: { userId: userId }
      },
      include: { meeting: true }
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const situation = determineCardSituation(card);
    const message = await generateContextualMessage(card, situation, messageType, tone);

    return NextResponse.json({
      success: true,
      message,
      situation: situation.type,
      metadata: {
        cardType: card.type,
        priority: card.priority,
        status: card.status,
        ...situation
      }
    });

  } catch (error) {
    console.error('Error generating message:', error);
    return NextResponse.json(
      { error: 'Failed to generate message' },
      { status: 500 }
    );
  }
}

// GET - Get suggested message types for a card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: cardId } = await params;
    const card = await prisma.meetingCard.findFirst({
      where: {
        id: cardId,
        meeting: { userId }
      }
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const situation = determineCardSituation(card);
    const suggestions = getSuggestedMessageTypes(card, situation);
    
    return NextResponse.json({
      success: true,
      situation: situation.type,
      suggestions
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

function determineCardSituation(card: any): CardSituation {
  const now = new Date();
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const currentStatusSince = card.currentStatusSince ? new Date(card.currentStatusSince) : now;
  
  const daysSinceStatusChange = Math.floor(
    (now.getTime() - currentStatusSince.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (card.status === 'Blocked') {
    return { type: 'blocked', daysSinceStatusChange };
  }

  if (dueDate) {
    const daysUntilDue = Math.floor(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dueDate < now) {
      return {
        type: 'overdue',
        daysOverdue: Math.abs(daysUntilDue),
        daysSinceStatusChange
      };
    }

    if (isSameDay(dueDate, now)) {
      return { type: 'due_today', daysSinceStatusChange };
    }

    if (daysUntilDue <= 3) {
      return { type: 'due_soon', daysUntilDue, daysSinceStatusChange };
    }
  }

  if (daysSinceStatusChange >= 3 && card.status !== 'Done') {
    return { type: 'stagnant', daysSinceStatusChange };
  }

  if (card.priorityAutoUpdated) {
    return { type: 'escalated', daysSinceStatusChange };
  }

  if (card.status === 'Done') {
    return { type: 'completed', daysSinceStatusChange };
  }

  return { type: 'active', daysSinceStatusChange };
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function getSuggestedMessageTypes(card: any, situation: CardSituation) {
  const suggestions = [];

  // Always show follow-up
  suggestions.push({
    type: 'follow-up',
    label: 'Follow-up Message',
    icon: '💬',
    color: 'blue'
  });

  // Situation-specific
  if (situation.type === 'overdue') {
    suggestions.push({
      type: 'overdue',
      label: 'Overdue Reminder',
      icon: '⚠️',
      color: 'red'
    });
  }

  if (situation.type === 'blocked' || card.status === 'Blocked') {
    suggestions.push({
      type: 'blocker',
      label: 'Blocker Alert',
      icon: '🚧',
      color: 'orange'
    });
  }

  if (situation.type === 'stagnant') {
    suggestions.push({
      type: 'status-check',
      label: 'Status Check',
      icon: '🔍',
      color: 'yellow'
    });
  }

  if (situation.type === 'completed') {
    suggestions.push({
      type: 'completion',
      label: 'Share Completion',
      icon: '✅',
      color: 'green'
    });
  }

  return suggestions;
}

async function generateContextualMessage(
  card: any,
  situation: CardSituation,
  messageType?: string,
  tone: 'professional' | 'casual' | 'urgent' = 'professional'
): Promise<string> {
  
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateTemplateMessage(card, situation, messageType);
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const prompt = buildMessagePrompt(card, situation, messageType, tone);

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    });

    const messageContent = response.content[0];
    if (messageContent.type === 'text') {
      return messageContent.text.trim();
    }

    throw new Error('Unexpected response format');
    
  } catch (error) {
    console.error('Claude API error:', error);
    return generateTemplateMessage(card, situation, messageType);
  }
}

function buildMessagePrompt(
  card: any,
  situation: CardSituation,
  messageType?: string,
  tone: string = 'professional'
): string {
  const contextParts: string[] = [];

  contextParts.push(`Card Type: ${card.type}`);
  contextParts.push(`Title: "${card.summary}"`);
  contextParts.push(`Priority: ${card.priority || 'Medium'}`);
  contextParts.push(`Status: ${card.status}`);
  
  if (card.owner) {
    const firstName = card.owner.split(' ')[0];
    contextParts.push(`Owner: ${card.owner} (use first name: ${firstName})`);
  } else {
    contextParts.push(`Owner: Unassigned (address as "team")`);
  }

  if (card.dueDate) {
    contextParts.push(`Due Date: ${new Date(card.dueDate).toLocaleDateString()}`);
  }

  contextParts.push(`Current Situation: ${situation.type}`);
  if (situation.daysOverdue) contextParts.push(`Days Overdue: ${situation.daysOverdue}`);
  if (situation.daysUntilDue !== undefined) contextParts.push(`Days Until Due: ${situation.daysUntilDue}`);
  if (situation.daysSinceStatusChange) contextParts.push(`Days in Status: ${situation.daysSinceStatusChange}`);

  if (card.context) contextParts.push(`Context: ${card.context}`);
  if (card.primaryContact) contextParts.push(`Primary Contact: ${card.primaryContact}`);
  if (card.interactionType) contextParts.push(`Interaction Type: ${card.interactionType}`);
  if (card.blockedReason) contextParts.push(`Blocked Reason: ${card.blockedReason}`);

  const toneGuide = {
    professional: 'Professional, respectful, and formal',
    casual: 'Friendly, conversational, and approachable',
    urgent: 'Direct, action-oriented, and time-sensitive'
  }[tone];

  return `Generate a brief follow-up message for this action item that can be copied into Slack/email.

CARD INFO:
${contextParts.join('\n')}

REQUIREMENTS:
- 2-4 sentences maximum
- Tone: ${toneGuide}
- Plain text, no subject line
- Include card title in quotes
- ${card.owner ? `Address ${card.owner.split(' ')[0]} by first name` : 'Address "team"'}
- Be specific about ${situation.type} situation
- End with clear call-to-action
- Message type: ${messageType || 'general follow-up'}

Generate the message:`;
}

function generateTemplateMessage(
  card: any,
  situation: CardSituation,
  messageType?: string
): string {
  const owner = card.owner || 'team';
  const firstName = owner === 'team' ? 'team' : owner.split(' ')[0];
  const title = card.summary;
  const type = card.type;

  // Overdue messages
  if (messageType === 'overdue' || situation.type === 'overdue') {
    const daysText = situation.daysOverdue === 1 ? 'yesterday' : `${situation.daysOverdue} days ago`;
    
    if (type === 'Action') {
      return `Hi ${firstName}, just following up on "${title}". This action was due ${daysText} - have you been able to complete it? Let me know if you need any support.`;
    } else if (type === 'Follow-up') {
      return `Hi ${firstName}, checking in on "${title}". This was scheduled for ${daysText}${card.primaryContact ? ` - have you connected with ${card.primaryContact}?` : ''} Let me know the status.`;
    } else if (type === 'Question') {
      return `Hi team, we still need an answer on "${title}". This was raised ${daysText} and may be blocking progress. Can someone clarify?`;
    }
  }

  // Blocker messages
  if (messageType === 'blocker' || situation.type === 'blocked') {
    const reason = card.blockedReason ? ` (${card.blockedReason})` : '';
    return `🚧 Team - blocker needs attention: "${title}"${reason}. This is blocking progress. Can we prioritize resolving this?`;
  }

  // Stagnant/Status check
  if (messageType === 'status-check' || situation.type === 'stagnant') {
    const days = situation.daysSinceStatusChange || 3;
    return `Hi ${firstName}, "${title}" has been in ${card.status} for ${days} days. Is there anything blocking progress or do you need help?`;
  }

  // Due today
  if (situation.type === 'due_today') {
    return `Hi ${firstName}, friendly reminder that "${title}" is due today. Let me know how it's progressing!`;
  }

  // Due soon
  if (situation.type === 'due_soon') {
    const daysText = situation.daysUntilDue === 1 ? 'tomorrow' : `in ${situation.daysUntilDue} days`;
    return `Hi ${firstName}, "${title}" is coming up ${daysText}. Just wanted to make sure it's on your radar!`;
  }

  // Completed
  if (situation.type === 'completed') {
    return `Great work completing "${title}"!${card.context ? ` ${card.context}` : ''} Thanks for getting this done.`;
  }

  // Type-specific defaults
  switch (type) {
    case 'Action':
      return `Hi ${firstName}, checking in on "${title}". Let me know the status and if you need support!`;
    case 'Decision':
      return `Team - documenting this decision: "${title}".${card.context ? ` ${card.context}` : ''} Recorded for reference.`;
    case 'Follow-up':
      const contact = card.primaryContact ? ` with ${card.primaryContact}` : '';
      return `Hi ${firstName}, following up on "${title}". Have you connected${contact}? Let me know!`;
    case 'Question':
      return `Hi team, we need an answer on "${title}". Can someone help clarify?`;
    case 'Blocker':
      return `🚧 Blocker: "${title}". This needs immediate attention. Can we prioritize?`;
    case 'Risk':
      return `⚠️ Risk: "${title}". Priority: ${card.priority || 'Medium'}. We should discuss mitigation.`;
    case 'Idea':
      return `💡 Idea to consider: "${title}".${card.context ? ` ${card.context}` : ''} Worth discussing?`;
    default:
      return `Hi ${firstName}, following up on "${title}". Let me know the status!`;
  }
}
