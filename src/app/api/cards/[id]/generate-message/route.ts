// File: /src/app/api/cards/[id]/generate-message/route.ts
// AI Message Generator API Endpoint - Comprehensive Testing Matrix Implementation

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

interface CardSituation {
  type: 'overdue' | 'due_today' | 'due_soon' | 'stagnant' | 'blocked' | 'escalated' | 'completed' | 'active';
  daysOverdue?: number;
  daysSinceStatusChange?: number;
  daysUntilDue?: number;
}

interface MessageRecipient {
  type: 'specific_person' | 'team' | 'self_reminder';
  name?: string;
  names?: string[];
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

    // Get logged in user details
    const clerkUser = await currentUser();
    const loggedInUserName = clerkUser?.firstName || clerkUser?.username || 'User';

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

    // Parse involvedPeople and additionalContacts
    const involvedPeople = card.involvedPeople 
      ? (typeof card.involvedPeople === 'string' ? JSON.parse(card.involvedPeople) : card.involvedPeople)
      : [];
    const additionalContacts = card.additionalContacts
      ? (typeof card.additionalContacts === 'string' ? JSON.parse(card.additionalContacts) : card.additionalContacts)
      : [];

    const situation = determineCardSituation(card);
    const recipient = determineMessageRecipient(card, loggedInUserName, involvedPeople, additionalContacts);
    const message = await generateContextualMessage(
      card, 
      situation, 
      recipient,
      loggedInUserName,
      messageType, 
      tone
    );

    return NextResponse.json({
      success: true,
      message,
      situation: situation.type,
      recipient: {
        type: recipient.type,
        name: recipient.name,
        names: recipient.names
      },
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

/**
 * Determine message recipient based on comprehensive matrix
 * Priority order:
 * 1. primaryContact presente → TO: primaryContact
 * 2. involvedPeople presente → TO: other people (exclude logged user)
 * 3. Follow-up + name in context → TO: extracted name
 * 4. Question OR Blocker → TO: team
 * 5. Decision OR Update → TO: team
 * 6. Type = Risk OR Idea → TO: team
 * 7. owner ≠ logged user → TO: owner
 * 8. Default → TO: team OR self_reminder
 */
function determineMessageRecipient(
  card: any,
  loggedInUserName: string,
  involvedPeople: string[],
  additionalContacts: string[]
): MessageRecipient {
  // 1. primaryContact has highest priority
  if (card.primaryContact && card.primaryContact !== loggedInUserName) {
    return {
      type: 'specific_person',
      name: card.primaryContact
    };
  }

  // 2. involvedPeople - exclude logged user
  if (involvedPeople && involvedPeople.length > 0) {
    const otherPeople = involvedPeople.filter(
      (person: string) => person !== loggedInUserName
    );
    if (otherPeople.length > 0) {
      if (otherPeople.length === 1) {
        return {
          type: 'specific_person',
          name: otherPeople[0]
        };
      }
      return {
        type: 'specific_person',
        names: otherPeople
      };
    }
  }

  // 3. Follow-up + name extraction from context/title
  if (card.type === 'Follow-up') {
    const extractedName = extractNameFromContext(card.summary, card.context);
    if (extractedName && extractedName !== loggedInUserName) {
      return {
        type: 'specific_person',
        name: extractedName
      };
    }
  }

  // 4. Question OR Blocker → TO: team
  if (card.type === 'Question' || card.type === 'Blocker' || card.status === 'Blocked') {
    return { type: 'team' };
  }

  // 5. Decision OR Update → TO: team
  if (card.type === 'Decision' || card.type === 'Update') {
    return { type: 'team' };
  }

  // 6. Risk OR Idea → TO: team
  if (card.type === 'Risk' || card.type === 'Idea') {
    return { type: 'team' };
  }

  // 7. owner ≠ logged user → TO: owner
  if (card.owner && card.owner !== loggedInUserName) {
    return {
      type: 'specific_person',
      name: card.owner
    };
  }

  // 8. Default → TO: team OR self_reminder
  if (card.owner === loggedInUserName || (!card.owner && card.type === 'Action')) {
    return { type: 'self_reminder' };
  }

  return { type: 'team' };
}

/**
 * Extract name from context or title (simple pattern matching)
 */
function extractNameFromContext(summary: string, context?: string | null): string | null {
  const text = `${summary} ${context || ''}`.toLowerCase();
  
  // Common name patterns
  const namePatterns = [
    /(?:with|to|from|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:about|regarding|concerning)/g
  ];

  for (const pattern of namePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const name = matches[0].replace(/(?:with|to|from|contact|about|regarding|concerning)\s+/i, '').trim();
      if (name && name.length > 1) {
        return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
      }
    }
  }

  return null;
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
  recipient: MessageRecipient,
  loggedInUserName: string,
  messageType?: string,
  tone: 'professional' | 'casual' | 'urgent' = 'professional'
): Promise<string> {
  
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateTemplateMessage(card, situation, recipient, loggedInUserName, messageType);
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const prompt = buildMessagePrompt(card, situation, recipient, loggedInUserName, messageType, tone);

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
    return generateTemplateMessage(card, situation, recipient, loggedInUserName, messageType);
  }
}

function buildMessagePrompt(
  card: any,
  situation: CardSituation,
  recipient: MessageRecipient,
  loggedInUserName: string,
  messageType?: string,
  tone: string = 'professional'
): string {
  const contextParts: string[] = [];

  contextParts.push(`Card Type: ${card.type}`);
  contextParts.push(`Title: "${card.summary}"`);
  contextParts.push(`Priority: ${card.priority || 'Medium'}`);
  contextParts.push(`Status: ${card.status}`);
  contextParts.push(`Logged In User: ${loggedInUserName}`);
  
  // Recipient information
  if (recipient.type === 'specific_person') {
    if (recipient.names && recipient.names.length > 1) {
      contextParts.push(`Recipient: ${recipient.names.join(', ')} (multiple people)`);
    } else {
      contextParts.push(`Recipient: ${recipient.name || 'Unknown'}`);
    }
    contextParts.push(`Message Direction: FROM ${loggedInUserName} TO ${recipient.name || recipient.names?.join(', ') || 'recipient'}`);
  } else if (recipient.type === 'team') {
    contextParts.push(`Recipient: Team`);
    contextParts.push(`Message Direction: FROM ${loggedInUserName} TO Team`);
  } else {
    contextParts.push(`Recipient: Self reminder`);
    contextParts.push(`Message Direction: FROM ${loggedInUserName} (self)`);
  }

  if (card.owner) {
    const firstName = card.owner.split(' ')[0];
    contextParts.push(`Owner: ${card.owner} (first name: ${firstName})`);
  } else {
    contextParts.push(`Owner: Unassigned`);
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
  if (card.interactionNote) contextParts.push(`Interaction Note: ${card.interactionNote}`);
  if (card.blockedReason) contextParts.push(`Blocked Reason: ${card.blockedReason}`);
  if (card.blockedBy) contextParts.push(`Blocked By: ${card.blockedBy}`);

  const toneGuide = {
    professional: 'Professional, respectful, and formal',
    casual: 'Friendly, conversational, and approachable',
    urgent: 'Direct, action-oriented, and time-sensitive'
  }[tone];

  // Build recipient addressing instruction
  let recipientInstruction = '';
  if (recipient.type === 'specific_person') {
    if (recipient.names && recipient.names.length > 1) {
      recipientInstruction = `Address as "Hi everyone" or "Hey ${recipient.names.map(n => n.split(' ')[0]).join(', ')}"`;
    } else {
      const firstName = recipient.name?.split(' ')[0] || 'there';
      recipientInstruction = `Start with "Hey ${firstName}," or "Hi ${firstName},"`;
    }
  } else if (recipient.type === 'team') {
    recipientInstruction = `Start with "Hi team,"`;
  } else {
    recipientInstruction = `Use first person self-reminder format like "Remember to..." or "I need to..."`;
  }

  return `Generate a brief follow-up message for this action item that can be copied into Slack/email.

CARD INFO:
${contextParts.join('\n')}

CRITICAL REQUIREMENTS:
- ALWAYS use FIRST PERSON perspective: "I wanted", "I have", "I'm", "I noticed" (NOT "You should", "Please do")
- Message goes FROM ${loggedInUserName} TO ${recipient.type === 'specific_person' ? recipient.name || recipient.names?.join(', ') : recipient.type === 'team' ? 'Team' : 'Self'}
- ${recipientInstruction}
- 2-4 sentences maximum
- Tone: ${toneGuide}
- Plain text, no subject line
- Focus on purpose/action, not full card title
- Include relevant situation context (${situation.type})
- End with clear call-to-action or question
- Message type: ${messageType || 'general follow-up'}

Generate the message:`;
}

function generateTemplateMessage(
  card: any,
  situation: CardSituation,
  recipient: MessageRecipient,
  loggedInUserName: string,
  messageType?: string
): string {
  const cardTitle = card.summary;
  const cardType = card.type;
  
  // Get recipient name for addressing
  let recipientName = 'team';
  if (recipient.type === 'specific_person') {
    if (recipient.names && recipient.names.length > 1) {
      recipientName = recipient.names.map(n => n.split(' ')[0]).join(', ');
    } else {
      recipientName = recipient.name?.split(' ')[0] || 'team';
    }
  }

  // FOLLOW-UP CARDS
  if (cardType === 'Follow-up') {
    if (situation.type === 'overdue') {
      const daysText = situation.daysOverdue === 1 ? 'earlier' : `${situation.daysOverdue} days ago`;
      if (recipient.type === 'specific_person') {
        return `Hey ${recipientName}, I wanted to follow up with you about ${cardTitle}. I know we had planned to connect ${daysText} - do you have time to discuss this soon?`;
      }
      return `Hi team, I wanted to follow up about ${cardTitle}. This was scheduled ${daysText} - can we reconnect on this?`;
    }
    
    if (recipient.type === 'specific_person') {
      return `Hey ${recipientName}, I wanted to follow up with you about ${cardTitle}. ${card.interactionNote ? card.interactionNote + '. ' : ''}Can we connect soon?`;
    }
    return `Hi team, I wanted to follow up about ${cardTitle}. Can we discuss this?`;
  }

  // ACTION CARDS
  if (cardType === 'Action') {
    if (situation.type === 'overdue') {
      if (recipient.type === 'specific_person' && card.owner !== loggedInUserName) {
        return `Hey ${recipientName}, I wanted to check in about ${cardTitle}. This was due ${situation.daysOverdue} day${situation.daysOverdue === 1 ? '' : 's'} ago - how is it progressing? Let me know if you need any support.`;
      }
      return `Remember to complete ${cardTitle}. This was due ${situation.daysOverdue} day${situation.daysOverdue === 1 ? '' : 's'} ago.`;
    }
    
    if (situation.type === 'stagnant') {
      if (recipient.type === 'specific_person' && card.owner !== loggedInUserName) {
        return `Hey ${recipientName}, I noticed ${cardTitle} has been ${card.status} for ${situation.daysSinceStatusChange} days. Is there anything blocking progress or do you need help?`;
      }
      return `Remember that ${cardTitle} has been ${card.status} for ${situation.daysSinceStatusChange} days. Time to move forward?`;
    }
    
    if (recipient.type === 'specific_person' && card.owner !== loggedInUserName) {
      return `Hey ${recipientName}, I wanted to check in about ${cardTitle}. How is this progressing? Let me know if you need any support.`;
    }
    
    if (recipient.type === 'specific_person' && card.primaryContact) {
      return `Hey ${recipientName}, I wanted to ${card.interactionType || 'connect'} with you about ${cardTitle}. ${card.interactionNote || ''}`;
    }
    
    return `Remember to ${cardTitle.toLowerCase()}. Let me know if you need any support.`;
  }

  // QUESTION CARDS
  if (cardType === 'Question') {
    if (situation.type === 'overdue') {
      return `Hi team, I still need an answer on ${cardTitle}. This was raised ${situation.daysOverdue} day${situation.daysOverdue === 1 ? '' : 's'} ago and may be blocking progress. Can someone help clarify?`;
    }
    
    if (situation.type === 'stagnant') {
      return `Hi team, I have a question about ${cardTitle} that's been open for ${situation.daysSinceStatusChange} days. This is important for next steps - can someone help clarify?`;
    }
    
    return `Hi team, I have a question about ${cardTitle}. This is important for ${card.context || 'next steps'} - can someone help clarify?`;
  }

  // BLOCKER CARDS
  if (cardType === 'Blocker' || card.status === 'Blocked') {
    const reason = card.blockedReason ? ` (${card.blockedReason})` : '';
    const blockedBy = card.blockedBy ? ` by ${card.blockedBy}` : '';
    
    if (card.priority === 'URGENT' || card.priority === 'urgent') {
      return `Hi team - URGENT: I'm blocked on ${cardTitle}${reason}${blockedBy}. This needs immediate attention. Can we get all hands on this?`;
    }
    
    return `Hi team, I wanted to flag that ${card.owner === loggedInUserName ? "I'm" : 'we are'} currently blocked on ${cardTitle}${reason}${blockedBy}. Can we prioritize getting this resolved?`;
  }

  // DECISION CARDS
  if (cardType === 'Decision') {
    if (situation.type === 'completed') {
      return `Hi team, I wanted to share that we've decided to ${cardTitle.toLowerCase()}. ${card.context || 'This is now documented for reference.'}`;
    }
    return `Hi team, I wanted to share this decision: ${cardTitle}. ${card.context || 'This will guide our next steps.'}`;
  }

  // UPDATE CARDS
  if (cardType === 'Update') {
    return `Hi team, quick update: ${cardTitle}. ${card.context || ''}`;
  }

  // IDEA CARDS
  if (cardType === 'Idea') {
    return `Hi team, I had an idea I wanted to share: ${cardTitle}. ${card.context || ''} Thoughts?`;
  }

  // RISK CARDS
  if (cardType === 'Risk') {
    if (card.priority === 'URGENT' || card.priority === 'urgent') {
      return `Hi team - URGENT RISK: ${cardTitle}. ${card.context || ''} We need immediate attention and mitigation plan!`;
    }
    return `Hi team, I wanted to flag a risk: ${cardTitle}. This is ${card.priority || 'high'} priority. ${card.context || ''} We should discuss mitigation strategies.`;
  }

  // Default fallback
  if (situation.type === 'overdue') {
    const daysText = situation.daysOverdue === 1 ? 'yesterday' : `${situation.daysOverdue} days ago`;
    return `Hi ${recipientName}, just following up on ${cardTitle}. This was due ${daysText} - have you been able to complete it? Let me know if you need any support.`;
  }

  if (situation.type === 'due_today') {
    return `Hi ${recipientName}, friendly reminder that ${cardTitle} is due today. Let me know how it's progressing!`;
  }

  if (situation.type === 'completed') {
    return `Great work completing ${cardTitle}! ${card.context || ''} Thanks for getting this done.`;
  }

  return `Hi ${recipientName}, I wanted to follow up on ${cardTitle}. Let me know the status!`;
}
