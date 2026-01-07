import { NextRequest, NextResponse } from 'next/server';
import { runAutoPriorityEscalation } from '@/lib/cron/auto-priority-escalation';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized runs
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'dev-secret-change-in-production'}`;
    
    if (authHeader !== expectedAuth) {
      console.error('[CRON] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('[CRON] Running auto-priority escalation...');
    const results = await runAutoPriorityEscalation();
    
    return NextResponse.json({
      success: true,
      updated: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Auto-priority escalation failed:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow GET for testing purposes
export async function GET(request: NextRequest) {
  try {
    // Check if in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'GET method only available in development' },
        { status: 403 }
      );
    }
    
    console.log('[CRON] Running auto-priority escalation (DEV MODE)...');
    const results = await runAutoPriorityEscalation();
    
    return NextResponse.json({
      success: true,
      updated: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Auto-priority escalation failed:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}







