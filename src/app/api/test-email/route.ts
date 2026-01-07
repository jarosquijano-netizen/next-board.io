import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth } from '@clerk/nextjs/server';
import { DailyDigest } from '../../../../emails/templates/DailyDigest';
import React from 'react';

// Lazy initialization to avoid build-time errors when env vars aren't available
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

/**
 * Test endpoint to send an email directly
 * GET /api/test-email
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - please sign in' }, { status: 401 });
    }

    // Import currentUser to get email
    const { currentUser } = await import('@clerk/nextjs/server');
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    console.log(`[TEST-EMAIL] Sending test email to ${email}`);

    // Send test email using DailyDigest template
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: `NextBoard <onboarding@resend.dev>`,
      to: [email],
      subject: '🧪 Test Email from NextBoard',
      react: React.createElement(DailyDigest, {
        userName: user.firstName || user.username || 'there',
        overdueCards: [
          {
            id: 'test-1',
            summary: 'Complete quarterly review presentation',
            type: 'Action',
            priority: 'high',
            owner: 'You',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: 'in_progress',
          },
        ],
        dueTodayCards: [
          {
            id: 'test-2',
            summary: 'Send client proposal',
            type: 'Action',
            priority: 'urgent',
            owner: 'You',
            dueDate: new Date(),
            status: 'todo',
          },
        ],
        blockedCards: [
          {
            id: 'test-3',
            summary: 'Review budget approval',
            type: 'Decision',
            priority: 'medium',
            owner: 'You',
            status: 'blocked',
          },
        ],
        stats: {
          totalActive: 12,
          completedYesterday: 3,
        },
      }),
    });

    if (error) {
      console.error('[TEST-EMAIL] Error:', error);
      return NextResponse.json({ 
        error: 'Failed to send email', 
        details: error 
      }, { status: 500 });
    }

    console.log('[TEST-EMAIL] Success! Email sent:', data);

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${email}`,
      emailId: data?.id,
      details: data
    });

  } catch (error) {
    console.error('[TEST-EMAIL] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}





