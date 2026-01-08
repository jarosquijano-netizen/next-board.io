'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function EmailPreview() {
  const [activeTemplate, setActiveTemplate] = useState<'digest' | 'overdue' | 'duetoday'>('digest');

  // Mock data for previews
  const mockCard = {
    id: 'cmgwfp3xa0002le3g9jp8bq5m',
    summary: 'Complete quarterly planning presentation for executive team',
    type: 'Action',
    priority: 'high',
    owner: 'John Doe',
    dueDate: new Date(),
    status: 'In Progress',
    meetingId: 'meeting-123'
  };

  const mockOverdueCards = [
    mockCard,
    { ...mockCard, id: '2', summary: 'Review budget proposals with finance', priority: 'urgent' },
    { ...mockCard, id: '3', summary: 'Send meeting notes to stakeholders', priority: 'medium' }
  ];

  const mockDueTodayCards = [
    { ...mockCard, id: '4', summary: 'Finalize Q4 roadmap', priority: 'high' },
    { ...mockCard, id: '5', summary: 'Review design mockups', priority: 'medium' }
  ];

  const mockBlockedCards = [
    { ...mockCard, id: '6', summary: 'Deploy to production', status: 'blocked', priority: 'urgent' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 min-h-screen transition-all duration-300 overflow-auto">
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>
          📧 Email Template Previews
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Preview how your notification emails will look to users
        </p>
      </div>

      {/* Template Selector */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTemplate('digest')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: activeTemplate === 'digest' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
            background: activeTemplate === 'digest' ? '#dbeafe' : 'white',
            color: activeTemplate === 'digest' ? '#1e40af' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📊 Daily Digest
        </button>
        <button
          onClick={() => setActiveTemplate('overdue')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: activeTemplate === 'overdue' ? '2px solid #ef4444' : '2px solid #e2e8f0',
            background: activeTemplate === 'overdue' ? '#fee2e2' : 'white',
            color: activeTemplate === 'overdue' ? '#991b1b' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ⚠️ Overdue Alert
        </button>
        <button
          onClick={() => setActiveTemplate('duetoday')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: activeTemplate === 'duetoday' ? '2px solid #10b981' : '2px solid #e2e8f0',
            background: activeTemplate === 'duetoday' ? '#d1fae5' : 'white',
            color: activeTemplate === 'duetoday' ? '#065f46' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🎯 Due Today
        </button>
      </div>

      {/* Info Box */}
      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px', 
        padding: '20px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          💡 How to Send Real Emails
        </h3>
        <ol style={{ margin: '8px 0', paddingLeft: '24px', color: '#64748b', lineHeight: '1.6' }}>
          <li>Get free Resend API key at <a href="https://resend.com" target="_blank" style={{ color: '#3b82f6' }}>resend.com</a></li>
          <li>Add to .env: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>RESEND_API_KEY=re_xxx</code></li>
          <li>Run: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>.\test-email.ps1</code></li>
        </ol>
      </div>

      {/* Preview Area */}
      <div style={{ 
        background: 'white', 
        border: '2px solid #e2e8f0', 
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <iframe 
          style={{ 
            width: '100%', 
            height: '800px', 
            border: 'none',
            borderRadius: '8px'
          }}
          srcDoc={getTemplateHTML(activeTemplate, {
            mockCard,
            mockOverdueCards,
            mockDueTodayCards,
            mockBlockedCards
          })}
        />
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '40px', padding: '24px', background: '#0f172a', borderRadius: '12px', color: 'white' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          🚀 Next Steps
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
          <li>✅ Templates created and ready</li>
          <li>✅ Email service configured</li>
          <li>✅ Cron jobs set up</li>
          <li>⏳ Add Resend API key to .env</li>
          <li>⏳ Run <code style={{ background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>.\test-email.ps1</code> to test</li>
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}

function getTemplateHTML(template: string, data: any) {
  const { mockCard, mockOverdueCards, mockDueTodayCards, mockBlockedCards } = data;

  if (template === 'digest') {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="margin: 0 auto; padding: 20px 0 48px; max-width: 600px;">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 20px 0;">
              <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px;"></div>
              <h1 style="color: #fff; font-size: 24px; font-weight: bold; margin: 0;">NextBoard</h1>
            </div>
            
            <!-- Content -->
            <div style="background-color: #1e293b; border-radius: 12px; padding: 32px;">
              <h2 style="color: #fff; font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">☀️ Good morning, John!</h2>
              
              <p style="color: #cbd5e1; font-size: 14px; line-height: 24px; margin: 0 0 24px 0;">
                Here's your daily focus for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}:
              </p>

              <!-- Stats -->
              <div style="display: flex; justify-content: space-around; margin-bottom: 32px; padding: 20px; background-color: #0f172a; border-radius: 8px;">
                <div style="text-align: center;">
                  <div style="color: #60a5fa; font-size: 32px; font-weight: bold; margin: 0; line-height: 1;">10</div>
                  <div style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">Active Items</div>
                </div>
                <div style="text-align: center;">
                  <div style="color: #60a5fa; font-size: 32px; font-weight: bold; margin: 0; line-height: 1;">3</div>
                  <div style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">Done Yesterday</div>
                </div>
                <div style="text-align: center;">
                  <div style="color: #60a5fa; font-size: 32px; font-weight: bold; margin: 0; line-height: 1;">5</div>
                  <div style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">Need Focus</div>
                </div>
              </div>

              <!-- Overdue Section -->
              <div style="margin-bottom: 32px;">
                <h3 style="color: #fff; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">🚨 Overdue (3)</h3>
                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px 0;">These need immediate attention</p>
                
                ${mockOverdueCards.map((card: any) => `
                  <div style="background-color: #334155; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #475569;">
                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #fff; background-color: #3b82f6;">${card.type}</span>
                      <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #fff; background-color: #f97316;">${card.priority.toUpperCase()}</span>
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 12px 0; line-height: 24px;">
                      ${card.summary}
                    </div>
                    <div style="font-size: 13px; color: #94a3b8;">
                      👤 ${card.owner} • 📅 ${new Date(card.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="http://localhost:3005/boards" style="background-color: #3b82f6; border-radius: 8px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 12px 32px;">
                  Open My Boards
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #334155; margin: 20px 0; padding: 20px 0; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 20px;">
                <a href="http://localhost:3005/settings/notifications" style="color: #60a5fa; text-decoration: none;">Manage notification preferences</a>
                • 
                <a href="http://localhost:3005" style="color: #60a5fa; text-decoration: none;">Open NextBoard</a>
              </p>
              <p style="color: #64748b; font-size: 11px; margin-top: 8px;">
                © 2025 NextBoard. Turn meetings into action.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  } else if (template === 'overdue') {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="margin: 0 auto; padding: 20px 0 48px; max-width: 600px;">
            <div style="display: flex; align-items: center; gap: 12px; padding: 20px 0;">
              <div style="width: 40px; height: 40px; background: #ef4444; border-radius: 8px;"></div>
              <h1 style="color: #fff; font-size: 24px; font-weight: bold; margin: 0;">NextBoard</h1>
            </div>
            
            <div style="background-color: #1e293b; border-radius: 12px; padding: 32px;">
              <div style="text-align: center; padding: 24px; background-color: #7f1d1d; border-radius: 8px; margin-bottom: 24px;">
                <div style="font-size: 48px; margin: 0;">⚠️</div>
                <h2 style="color: #fff; font-size: 24px; font-weight: bold; margin: 12px 0 0 0;">Action Item Overdue</h2>
              </div>

              <p style="color: #cbd5e1; font-size: 14px; line-height: 24px; margin: 0 0 16px 0;">Hi John,</p>
              
              <p style="color: #cbd5e1; font-size: 14px; line-height: 24px; margin: 0 0 16px 0;">
                This action item is now <strong style="color: #ef4444;">3 days overdue</strong>:
              </p>

              <div style="background-color: #334155; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #475569;">
                <div style="margin-bottom: 12px;">
                  <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #fff; background-color: #3b82f6;">${mockCard.type}</span>
                  <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #fff; background-color: #f97316;">HIGH</span>
                </div>
                <div style="font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 12px 0;">
                  ${mockCard.summary}
                </div>
                <div style="font-size: 13px; color: #94a3b8;">
                  👤 ${mockCard.owner} • 📅 ${new Date(mockCard.dueDate).toLocaleDateString()}
                </div>
              </div>

              <p style="color: #cbd5e1; font-size: 14px; line-height: 24px; margin: 0 0 16px 0;">
                Please update the status or adjust the deadline if needed.
              </p>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3005/board/${mockCard.meetingId}?cardId=${mockCard.id}" style="background-color: #ef4444; border-radius: 8px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 32px;">
                  View & Update Card
                </a>
              </div>
            </div>

            <div style="border-top: 1px solid #334155; margin: 20px 0; padding: 20px 0; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px;">
                © 2025 NextBoard. Turn meetings into action.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  } else {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="margin: 0 auto; padding: 20px 0 48px; max-width: 600px;">
            <div style="display: flex; align-items: center; gap: 12px; padding: 20px 0;">
              <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px;"></div>
              <h1 style="color: #fff; font-size: 24px; font-weight: bold; margin: 0;">NextBoard</h1>
            </div>
            
            <div style="background-color: #1e293b; border-radius: 12px; padding: 32px;">
              <div style="text-align: center; padding: 24px; background-color: #1e3a8a; border-radius: 8px; margin-bottom: 24px;">
                <div style="font-size: 48px; margin: 0;">🎯</div>
                <h2 style="color: #fff; font-size: 24px; font-weight: bold; margin: 12px 0 0 0;">Due Today</h2>
              </div>

              <p style="color: #cbd5e1; font-size: 14px; line-height: 24px; margin: 0 0 16px 0;">Hi John,</p>
              
              <p style="color: #cbd5e1; font-size: 14px; line-height: 24px; margin: 0 0 16px 0;">
                This action item is <strong style="color: #3b82f6;">due today</strong>:
              </p>

              <div style="background-color: #334155; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #475569;">
                <div style="margin-bottom: 12px;">
                  <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #fff; background-color: #3b82f6;">${mockCard.type}</span>
                  <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #fff; background-color: #f97316;">HIGH</span>
                </div>
                <div style="font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 12px 0;">
                  ${mockCard.summary}
                </div>
                <div style="font-size: 13px; color: #94a3b8;">
                  👤 ${mockCard.owner} • 📅 ${new Date(mockCard.dueDate).toLocaleDateString()}
                </div>
              </div>

              <p style="color: #cbd5e1; font-size: 14px; line-height: 24px; margin: 0 0 16px 0;">
                Make sure to complete or update this before the end of the day.
              </p>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3005/board/${mockCard.meetingId}?cardId=${mockCard.id}" style="background-color: #3b82f6; border-radius: 8px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 32px;">
                  View Card
                </a>
              </div>
            </div>

            <div style="border-top: 1px solid #334155; margin: 20px 0; padding: 20px 0; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px;">
                © 2025 NextBoard. Turn meetings into action.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}





