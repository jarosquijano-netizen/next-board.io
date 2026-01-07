'use client';

import { useState } from 'react';
import { Bell, Clock, Mail, Moon, Calendar } from 'lucide-react';

interface NotificationSettingsProps {
  preferences: any;
  onSave: (prefs: any) => void;
}

export function NotificationSettings({ preferences, onSave }: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState(preferences || {
    dailyDigest: true,
    dailyDigestTime: '08:00',
    overdueAlerts: true,
    dueTodayAlerts: true,
    dueTomorrowAlerts: true,
    assignedToMe: true,
    mentioned: true,
    cardComments: true,
    blockedAlerts: true,
    priorityEscalation: true,
    weeklyReport: true,
    weeklyReportDay: 'monday',
    enableQuietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const handleToggle = (key: string) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      onSave(prefs);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Test email sent successfully!\n\nCheck your inbox (and spam folder).\nEmail from: onboarding@resend.dev`);
      } else {
        alert(`❌ Failed to send test email:\n${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email. Please try again.');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Email Notifications</h2>
        <p className="text-gray-400">Control when and how you receive email notifications</p>
      </div>

      {/* Daily Digest */}
      <Section
        icon={<Mail className="w-6 h-6 text-blue-400" />}
        title="Daily Digest"
        description="Get a summary of your action items each morning"
      >
        <Toggle
          label="Enable daily digest"
          checked={prefs.dailyDigest}
          onChange={() => handleToggle('dailyDigest')}
        />
        
        {prefs.dailyDigest && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-white mb-2">
              Send digest at:
            </label>
            <select
              value={prefs.dailyDigestTime}
              onChange={(e) => setPrefs({ ...prefs, dailyDigestTime: e.target.value })}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700"
            >
              <option value="06:00">6:00 AM</option>
              <option value="07:00">7:00 AM</option>
              <option value="08:00">8:00 AM</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
            </select>
          </div>
        )}
      </Section>

      {/* Deadline Alerts */}
      <Section
        icon={<Clock className="w-6 h-6 text-orange-400" />}
        title="Deadline Alerts"
        description="Get notified about upcoming and overdue items"
      >
        <Toggle
          label="Overdue items"
          checked={prefs.overdueAlerts}
          onChange={() => handleToggle('overdueAlerts')}
        />
        <Toggle
          label="Due today"
          checked={prefs.dueTodayAlerts}
          onChange={() => handleToggle('dueTodayAlerts')}
        />
        <Toggle
          label="Due tomorrow"
          checked={prefs.dueTomorrowAlerts}
          onChange={() => handleToggle('dueTomorrowAlerts')}
        />
      </Section>

      {/* Activity Alerts */}
      <Section
        icon={<Bell className="w-6 h-6 text-purple-400" />}
        title="Activity Alerts"
        description="Stay updated on card changes and mentions"
      >
        <Toggle
          label="Assigned to me"
          checked={prefs.assignedToMe}
          onChange={() => handleToggle('assignedToMe')}
        />
        <Toggle
          label="When I am mentioned"
          checked={prefs.mentioned}
          onChange={() => handleToggle('mentioned')}
        />
        <Toggle
          label="Card comments"
          checked={prefs.cardComments}
          onChange={() => handleToggle('cardComments')}
        />
        <Toggle
          label="Blocked alerts"
          checked={prefs.blockedAlerts}
          onChange={() => handleToggle('blockedAlerts')}
        />
        <Toggle
          label="Priority escalation"
          checked={prefs.priorityEscalation}
          onChange={() => handleToggle('priorityEscalation')}
        />
      </Section>

      {/* Weekly Report */}
      <Section
        icon={<Calendar className="w-6 h-6 text-green-400" />}
        title="Weekly Report"
        description="Get a weekly summary of your progress"
      >
        <Toggle
          label="Enable weekly report"
          checked={prefs.weeklyReport}
          onChange={() => handleToggle('weeklyReport')}
        />
        
        {prefs.weeklyReport && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-white mb-2">
              Send report on:
            </label>
            <select
              value={prefs.weeklyReportDay}
              onChange={(e) => setPrefs({ ...prefs, weeklyReportDay: e.target.value })}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700"
            >
              <option value="monday">Monday</option>
              <option value="friday">Friday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        )}
      </Section>

      {/* Quiet Hours */}
      <Section
        icon={<Moon className="w-6 h-6 text-indigo-400" />}
        title="Quiet Hours"
        description="Do not send notifications during these hours"
      >
        <Toggle
          label="Enable quiet hours"
          checked={prefs.enableQuietHours}
          onChange={() => handleToggle('enableQuietHours')}
        />
        
        {prefs.enableQuietHours && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Start time:
              </label>
              <input
                type="time"
                value={prefs.quietHoursStart}
                onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                End time:
              </label>
              <input
                type="time"
                value={prefs.quietHoursEnd}
                onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 w-full"
              />
            </div>
          </div>
        )}
      </Section>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-700">
        <button
          onClick={handleSendTest}
          disabled={sendingTest}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <Mail className="w-5 h-5" />
          {sendingTest ? 'Sending...' : 'Send Test Email'}
        </button>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, description, children }: any) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 bg-slate-900 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="space-y-3 pl-14">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`
          w-11 h-6 rounded-full transition-colors
          ${checked ? 'bg-blue-600' : 'bg-slate-700'}
        `}>
          <div className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `} />
        </div>
      </div>
    </label>
  );
}

