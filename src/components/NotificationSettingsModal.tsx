'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { NotificationSettings } from './NotificationSettings';
import { useAuth } from '@clerk/nextjs';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { userId, isLoaded } = useAuth();
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && isLoaded) {
      fetchPreferences();
    }
  }, [isOpen, isLoaded, userId]);

  const fetchPreferences = async () => {
    if (!userId) {
      // Set default preferences if not signed in
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
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || data);
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
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-[60] animate-in fade-in slide-in-from-top-5';
    successMessage.textContent = '✅ Notification preferences saved!';
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      successMessage.remove();
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Notification Settings" size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading preferences...</div>
        </div>
      ) : !userId ? (
        <div className="space-y-4">
          <p className="text-slate-400">
            Please sign in to manage your notification preferences.
          </p>
          <NotificationSettings 
            preferences={preferences} 
            onSave={() => alert('Please sign in to save preferences.')} 
          />
        </div>
      ) : (
        <NotificationSettings preferences={preferences} onSave={handleSave} />
      )}
    </Modal>
  );
}





