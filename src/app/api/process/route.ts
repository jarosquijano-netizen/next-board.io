import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { anthropic, DEMO_MODE, SYSTEM_PROMPT, generateDemoResponse } from '@/lib/anthropic';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';
import { AIProcessingResult } from '@/types/meeting';
import { detectRecurringPattern, createOrLinkToSeries, carryoverIncompleteItems } from '@/lib/meeting-series';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filepath, title, participants, date, transcript } = body;

    let transcriptText = transcript || '';

    // If no transcript provided, read from file
    if (!transcriptText && filepath) {
      const fullPath = path.join(process.cwd(), 'public', filepath);
      try {
        const fileBuffer = await readFile(fullPath);
        transcriptText = fileBuffer.toString('utf-8');
      } catch (error) {
        console.error('Error reading transcript file:', error);
        return NextResponse.json(
          { error: 'Failed to read transcript file' },
          { status: 400 }
        );
      }
    }

    if (!transcriptText || transcriptText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No transcript content provided' },
        { status: 400 }
      );
    }

    let aiResult: AIProcessingResult | undefined;

    // Check if in demo mode (no API key)
    if (DEMO_MODE) {
      console.log('🎭 DEMO MODE: Using mock AI response (no API key provided)');
      aiResult = generateDemoResponse(transcriptText, title || 'Untitled Meeting');
    } else {
      // Call Anthropic Claude API to process the transcript
      console.log(`📊 Processing transcript: ${transcriptText.length} characters`);
      
      // SMART HANDLING FOR LONG TRANSCRIPTS
      const isVeryLong = transcriptText.length > 8000;
      const isLong = transcriptText.length > 5000;
      
      let processedTranscript = transcriptText;
      let maxTokens = 3000;
      
      if (isVeryLong) {
        // For very long transcripts, add instruction to focus on key points
        console.log('⚠️ Very long transcript detected - instructing Claude to focus on key items');
        maxTokens = 4096; // Claude Haiku max limit
      } else if (isLong) {
        console.log('⚠️ Long transcript detected - increasing output tokens');
        maxTokens = 4096; // Claude Haiku max limit (action-focused prompts keep output smaller)
      }
      
      console.log(`🤖 Using model: claude-3-haiku-20240307 (max_tokens: ${maxTokens})`);
      
      const userPrompt = isVeryLong 
        ? `Meeting Title: ${title || 'Untitled Meeting'}\nParticipants: ${participants || 'Not specified'}\nDate: ${date || new Date().toISOString()}\n\nTranscript:\n${processedTranscript}\n\n⚠️ PRIORITY INSTRUCTIONS FOR LONG TRANSCRIPT:
1. **ACTION ITEMS ONLY** - Extract ONLY tasks with clear owners and deadlines
2. Types allowed: "Action" or "Blocker" ONLY
3. Skip: Updates, Decisions, Ideas, Questions, general discussion
4. **STRICT LIMIT: Maximum 10 action items** (token limit: stay under 4000 tokens)
5. Every card MUST have a clear owner (WHO does it)
6. Include due dates whenever mentioned
7. Keep summaries SHORT (under 80 characters)

🚨 CRITICAL JSON REQUIREMENTS:
1. Return ONLY a single JSON object
2. Start with { and end with }
3. NO markdown code blocks (\`\`\`json)
4. NO trailing commas anywhere
5. Use double quotes for all strings

Example:
{"meeting_title":"Weekly Sync","summary":"Team sync with 12 action items","cards":[{"type":"Action","summary":"Sarah to finish designs by Friday","owner":"Sarah","due_date":"2024-10-25","priority":"high","status":"To Do"}]}

NOW ANALYZE AND RETURN VALID JSON WITH ONLY ACTION ITEMS:`
        : `Meeting Title: ${title || 'Untitled Meeting'}\nParticipants: ${participants || 'Not specified'}\nDate: ${date || new Date().toISOString()}\n\nTranscript:\n${processedTranscript}\n\n⚠️ EXTRACTION RULES:
1. **ACTION ITEMS ONLY** - Extract ONLY tasks someone must DO
2. Types allowed: "Action" or "Blocker" ONLY
3. Skip: Updates, Decisions, Ideas, general discussion
4. Every card MUST have a clear owner (WHO does it)
5. Include due dates when mentioned

🚨 CRITICAL JSON REQUIREMENTS:
1. Return ONLY a single JSON object
2. Start with { and end with }
3. NO markdown code blocks (\`\`\`json)
4. NO trailing commas anywhere
5. Use double quotes for all strings
6. Validate the JSON is parseable before responding

Example:
{"meeting_title":"Weekly Sync","summary":"Extracted 8 action items","cards":[{"type":"Action","summary":"Complete project proposal","owner":"Sarah","status":"To Do"}]}

NOW ANALYZE AND RETURN VALID JSON WITH ONLY ACTION ITEMS:`;
      
      let response;
      try {
        response = await anthropic!.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: maxTokens,
          temperature: 0.1, // Very low temperature for consistent, valid JSON
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });
        
        console.log(`✅ Received response from Claude (${response.usage.output_tokens} tokens)`);
      } catch (apiError: any) {
        console.error('❌ Anthropic API Error:', apiError);
        
        // Check if it's an authentication error
        if (apiError?.status === 401 || apiError?.message?.includes('authentication') || apiError?.error?.type === 'authentication_error') {
          return NextResponse.json(
            { 
              error: 'Failed to process transcript',
              details: 'Anthropic API authentication failed. Please check your ANTHROPIC_API_KEY environment variable.',
              hint: 'Make sure your API key is valid and has sufficient credits.'
            },
            { status: 500 }
          );
        }
        
        // For other API errors, provide generic error
        return NextResponse.json(
          { 
            error: 'Failed to process transcript',
            details: apiError?.message || 'Anthropic API request failed',
            hint: 'Please try again or contact support if the issue persists.'
          },
          { status: 500 }
        );
      }

      const content = response.content[0];
      if (content.type !== 'text') {
        return NextResponse.json(
          { error: 'Unexpected response format from AI' },
          { status: 500 }
        );
      }

      const resultText = content.text;
      
      // Extract JSON from response (Claude might wrap it in markdown)
      let jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: 'Could not parse AI response as JSON' },
          { status: 500 }
        );
      }

      // AGGRESSIVE JSON CLEANUP - Handle malformed AI responses
      let jsonText = jsonMatch[0];
      
      console.log('🔧 Starting JSON cleanup...');
      console.log('Original length:', jsonText.length);
      
      // Step 1: Remove comments (// and /* */)
      jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
      jsonText = jsonText.replace(/\/\/.*$/gm, '');
      
      // Step 2: Remove trailing commas - AGGRESSIVE MULTI-PASS
      let maxIterations = 10;
      let iteration = 0;
      while (iteration < maxIterations) {
        const before = jsonText;
        
        // Pattern 1: Comma before ] or } with any whitespace
        jsonText = jsonText.replace(/,(\s*[\]}])/g, '$1');
        
        // Pattern 2: Comma before newline then ] or }
        jsonText = jsonText.replace(/,(\s*\n\s*[\]}])/g, '$1');
        
        // Pattern 3: Comma at end of line followed by ] or }
        jsonText = jsonText.replace(/,\s*(\r?\n\s*[\]}])/g, '$1');
        
        // Pattern 4: Multiple spaces/tabs before ] or }
        jsonText = jsonText.replace(/,\s+(\]|\})/g, '$1');
        
        if (before === jsonText) break; // No more changes
        iteration++;
      }
      
      console.log('After cleanup length:', jsonText.length);
      console.log('Iterations needed:', iteration);
      
      // Step 2.5: Check for incomplete/truncated JSON and try to complete it
      const lastChar = jsonText.trim().slice(-1);
      if (lastChar !== '}') {
        console.log('⚠️ JSON appears incomplete (doesn\'t end with }). Attempting auto-completion...');
        
        // Count open/close brackets
        const openBrackets = (jsonText.match(/\[/g) || []).length;
        const closeBrackets = (jsonText.match(/\]/g) || []).length;
        const openBraces = (jsonText.match(/\{/g) || []).length;
        const closeBraces = (jsonText.match(/\}/g) || []).length;
        
        console.log(`Bracket count: [${openBrackets}/${closeBrackets}] {${openBraces}/${closeBraces}}`);
        
        // Try to close incomplete structures
        let completedText = jsonText;
        
        // Remove any trailing comma first
        completedText = completedText.replace(/,\s*$/, '');
        
        // Close arrays
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          completedText += '\n]';
        }
        
        // Close objects
        for (let i = 0; i < openBraces - closeBraces; i++) {
          completedText += '\n}';
        }
        
        console.log('Auto-completed JSON. Attempting to parse...');
        jsonText = completedText;
      }
      
      // Step 3: Try parsing
      try {
        aiResult = JSON.parse(jsonText);
        console.log('✅ JSON parsed successfully!');
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        
        // Get error position and context
        const errorMatch = (parseError as Error).message.match(/position (\d+)/);
        const errorMsg = (parseError as Error).message;
        
        if (errorMatch) {
          const errorPos = parseInt(errorMatch[1]);
          const contextStart = Math.max(0, errorPos - 200);
          const contextEnd = Math.min(jsonText.length, errorPos + 200);
          const errorContext = jsonText.substring(contextStart, contextEnd);
          
          console.error('📍 Error at position:', errorPos);
          console.error('🔍 Error context (±200 chars):');
          console.error(errorContext);
          console.error('⚠️ Problem character:', jsonText[errorPos]);
          
          // Try one more aggressive fix: remove the problematic comma manually
          if (errorMsg.includes('after array element') || errorMsg.includes('after object member')) {
            console.log('🔨 Attempting emergency comma removal at error position...');
            
            // Look backwards from error position to find and remove trailing comma
            let fixedText = jsonText;
            for (let i = errorPos - 1; i >= Math.max(0, errorPos - 200); i--) {
              if (fixedText[i] === ',') {
                // Check if next non-whitespace char is ] or }
                let nextNonWhitespace = i + 1;
                while (nextNonWhitespace < fixedText.length && /\s/.test(fixedText[nextNonWhitespace])) {
                  nextNonWhitespace++;
                }
                if (fixedText[nextNonWhitespace] === ']' || fixedText[nextNonWhitespace] === '}') {
                  console.log('🎯 Found trailing comma at position', i);
                  fixedText = fixedText.slice(0, i) + fixedText.slice(i + 1);
                  
                  try {
                    aiResult = JSON.parse(fixedText);
                    console.log('✅ Emergency fix successful!');
                    break;
                  } catch (e) {
                    console.log('❌ Emergency fix failed, trying next comma...');
                    // Continue looking for more commas
                  }
                }
              }
            }
            
            // If still failed, try removing ALL trailing commas globally
            if (!aiResult) {
              console.log('🔨 Last resort: Removing ALL trailing commas globally...');
              fixedText = jsonText;
              // Super aggressive: remove any comma followed by ] or } anywhere
              fixedText = fixedText.replace(/,(\s*[\]}])/g, '$1');
              fixedText = fixedText.replace(/,(\s*\n\s*[\]}])/g, '$1');
              
              try {
                aiResult = JSON.parse(fixedText);
                console.log('✅ Last resort fix successful!');
              } catch (e) {
                console.log('❌ All automatic fixes failed');
              }
            }
            
            if (!aiResult) {
              // Still failed, return error
              return NextResponse.json(
                { 
                  error: 'Failed to parse AI response. The transcript may be too complex.',
                  details: errorMsg,
                  position: errorPos,
                  context: errorContext.substring(0, 200),
                  hint: 'The AI generated invalid JSON. Try a shorter transcript or different content.'
                },
                { status: 500 }
              );
            }
          } else {
            return NextResponse.json(
              { 
                error: 'Failed to parse AI response. The transcript may be too complex.',
                details: errorMsg,
                position: errorPos,
                hint: 'Try uploading a shorter transcript or simplify the meeting content.'
              },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { 
              error: 'Failed to parse AI response. The transcript may be too complex.',
              details: errorMsg,
              hint: 'Try uploading a shorter transcript or simplify the meeting content.'
            },
            { status: 500 }
          );
        }
      }
    }

    // Helper function to calculate time-based fields
    const calculateTimeFields = (dueDate: string | null | undefined) => {
      if (!dueDate) {
        return { isOverdue: false, daysUntilDue: null };
      }
      try {
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          isOverdue: diffDays < 0,
          daysUntilDue: diffDays
        };
      } catch {
        return { isOverdue: false, daysUntilDue: null };
      }
    };

    // Ensure aiResult is defined before proceeding
    if (!aiResult) {
      return NextResponse.json(
        { error: 'Failed to process transcript. Please try again.' },
        { status: 500 }
      );
    }

    // Save to database
    const meeting = await prisma.meeting.create({
      data: {
        title: aiResult.meeting_title || title || 'Untitled Meeting',
        summary: aiResult.summary || '',
        userId, // Add authenticated user ID
        meetingDate: aiResult.meeting_date ? new Date(aiResult.meeting_date) : new Date(),
        nextMeetingDate: aiResult.next_meeting_suggested ? new Date(aiResult.next_meeting_suggested) : null,
        duration: aiResult.duration || null,
        cards: {
          create: aiResult.cards.map((card) => {
            const timeFields = calculateTimeFields(card.due_date);
            return {
              type: card.type,
              summary: card.summary,
              owner: card.owner || null,
              dueDate: card.due_date ? new Date(card.due_date) : null,
              dueDateRaw: card.due_date_raw || null,
              priority: card.priority || 'medium',
              timeEstimate: card.time_estimate || null,
              reminderSent: false,
              isOverdue: timeFields.isOverdue,
              daysUntilDue: timeFields.daysUntilDue,
              timestamp: card.timestamp || null,
              context: card.context || null,
              status: card.status || 'To Do',
              // Blocked fields
              blockedReason: card.blocked_reason || null,
              blockedBy: card.blocked_by || null,
              blockedSince: card.status === 'Blocked' ? new Date() : null,
              // People Interaction fields (serialize arrays to JSON strings for SQLite)
              involvedPeople: JSON.stringify(card.involved_people || []),
              interactionType: card.interaction_type || null,
              primaryContact: card.primary_contact || null,
              additionalContacts: JSON.stringify(card.additional_contacts || []),
              interactionNote: card.interaction_note || null,
            };
          }),
        },
      },
      include: {
        cards: true,
      },
    });

    // 🔄 Detect and link recurring meetings BEFORE returning response
    try {
      const meetingTitle = aiResult.meeting_title || title || 'Untitled Meeting';
      console.log('🔍 Checking for recurring pattern. Title:', meetingTitle);
      const recurringPattern = detectRecurringPattern(meetingTitle);
      console.log('🔍 Detection result:', recurringPattern);
      
      if (recurringPattern.isRecurring && recurringPattern.seriesTitle && recurringPattern.recurrence) {
        console.log('🔄 Detected recurring meeting pattern:', recurringPattern);
        console.log('🔄 Linking to series with userId:', userId, 'meetingId:', meeting.id);
        
        // Link to series and get previous meeting if exists
        const updatedMeeting = await createOrLinkToSeries(
          meeting.id,
          recurringPattern.seriesTitle,
          recurringPattern.recurrence,
          userId
        );
        
        console.log('✅ Linked to series. Updated meeting:', {
          seriesId: updatedMeeting.seriesId,
          seriesNumber: updatedMeeting.seriesNumber,
          isRecurring: updatedMeeting.isRecurring,
          previousMeetingId: updatedMeeting.previousMeetingId,
        });

        // If this meeting has a previous meeting, optionally carryover incomplete items
        if (updatedMeeting.previousMeetingId) {
          console.log('📋 Auto-carrying over incomplete items from previous meeting');
          await carryoverIncompleteItems(meeting.id, updatedMeeting.previousMeetingId);
        }
      } else {
        console.log('ℹ️ Not a recurring meeting or pattern not detected');
      }
    } catch (recurringError) {
      // Don't fail the entire request if recurring logic fails
      console.error('❌ Recurring meeting logic error (non-fatal):', recurringError);
      console.error('❌ Error details:', recurringError);
    }

    // Re-fetch meeting to get updated series information
    const finalMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: {
        cards: true,
      },
    });

    // Return response with updated meeting data
    return NextResponse.json({
      success: true,
      meeting: {
        id: finalMeeting!.id,
        title: finalMeeting!.title,
        summary: finalMeeting!.summary,
        meetingDate: finalMeeting!.meetingDate?.toISOString() || null,
        nextMeetingDate: finalMeeting!.nextMeetingDate?.toISOString() || null,
        duration: finalMeeting!.duration,
        createdAt: finalMeeting!.createdAt.toISOString(),
        cards: finalMeeting!.cards.map((card) => ({
          id: card.id,
          meetingId: card.meetingId,
          type: card.type,
          summary: card.summary,
          owner: card.owner,
          dueDate: card.dueDate?.toISOString() || null,
          dueDateRaw: card.dueDateRaw,
          priority: card.priority,
          timeEstimate: card.timeEstimate,
          reminderSent: card.reminderSent,
          isOverdue: card.isOverdue,
          daysUntilDue: card.daysUntilDue,
          timestamp: card.timestamp,
          context: card.context,
          status: card.status,
          // People Interaction fields (deserialize JSON strings to arrays)
          involvedPeople: card.involvedPeople ? JSON.parse(card.involvedPeople) : [],
          interactionType: card.interactionType,
          primaryContact: card.primaryContact,
          additionalContacts: card.additionalContacts ? JSON.parse(card.additionalContacts) : [],
          interactionNote: card.interactionNote,
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
          completedAt: card.completedAt?.toISOString() || null,
        })),
      },
    });

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

