'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { NotificationSettings } from '@/components/NotificationSettings';

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      } else {
        // Use defaults if API fails
        setPreferences({
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
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      // Use defaults on error
      setPreferences({
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (newPrefs: any) => {
    setPreferences(newPrefs);
    // Show success toast
    alert('Notification preferences saved!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center transition-all duration-300">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 min-h-screen transition-all duration-300 py-12 px-4">
        <NotificationSettings 
          preferences={preferences} 
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

