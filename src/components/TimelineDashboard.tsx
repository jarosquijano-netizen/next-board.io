'use client';

import { useState } from 'react';
import { MeetingCard } from '@/types/meeting';
import { getTimeStatus } from '@/lib/time-utils';
import { getTimeInCurrentStatus } from '@/lib/time-tracker';
import { AlertTriangle, Clock, Calendar, CheckCircle2, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

interface TimelineDashboardProps {
  cards: MeetingCard[];
  allCards?: MeetingCard[]; // For time tracking stats that need all cards including done
}

export function TimelineDashboard({ cards, allCards }: TimelineDashboardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const cardsForStats = allCards || cards; // Use allCards if provided, otherwise use filtered cards
  const activeCards = cards.filter(c => c.status !== 'Done');
  
  // Time Tracking Stats calculations
  const staleCards = activeCards.filter(card => {
    const time = getTimeInCurrentStatus(card.currentStatusSince);
    return time.isStale;
  });
  
  const autoEscalated = activeCards.filter(c => c.priorityAutoUpdated);
  
  const avgTime = activeCards.length > 0
    ? activeCards.reduce((sum, card) => {
        const time = getTimeInCurrentStatus(card.currentStatusSince);
        return sum + time.days;
      }, 0) / activeCards.length
    : 0;

  const totalTime = cardsForStats.reduce((sum, card) => {
    return sum + (card.timeInTodo + card.timeInProgress + card.timeInBlocked) / 24;
  }, 0);
  
  // Timeline Dashboard calculations
  const overdueCards = activeCards.filter(c => {
    const status = getTimeStatus(c.dueDate);
    return status.isOverdue;
  });
  
  const urgentCards = activeCards.filter(c => {
    const status = getTimeStatus(c.dueDate);
    return status.urgencyLevel === 'urgent' && !status.isOverdue;
  });
  
  const upcomingCards = activeCards.filter(c => {
    const status = getTimeStatus(c.dueDate);
    return status.urgencyLevel === 'soon';
  });

  const completedToday = cardsForStats.filter(c => {
    if (c.status !== 'Done') return false;
    if (!c.completedAt) return false;
    try {
      const today = new Date().toDateString();
      return new Date(c.completedAt).toDateString() === today;
    } catch {
      return false;
    }
  });

  return (
    <div className="mb-6">
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {isCollapsed ? (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>Show Overview</span>
          </>
        ) : (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>Hide Overview</span>
          </>
        )}
      </button>

      {/* Widgets - All 8 in 1 Row */}
      {!isCollapsed && (
        <div className="grid grid-cols-8 gap-2">
          {/* Stale Items */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{staleCards.length}</p>
              <AlertTriangle className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">Stale Items</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">Stuck 3+ days</p>
          </div>

          {/* Auto-Escalated */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{autoEscalated.length}</p>
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">Auto-Escalated</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">Priority ⬆️</p>
          </div>

          {/* Avg Time */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{avgTime.toFixed(1)}d</p>
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">Avg Time</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">{activeCards.length} active</p>
          </div>

          {/* Total Time */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{totalTime.toFixed(0)}d</p>
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">Total Time</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">{cardsForStats.length} cards</p>
          </div>

          {/* Overdue */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{overdueCards.length}</p>
              <AlertTriangle className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">Overdue</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">{overdueCards.length === 1 ? 'task' : 'tasks'}</p>
          </div>

          {/* Due Soon */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{urgentCards.length}</p>
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">Due Soon</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">urgent</p>
          </div>

          {/* This Week */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{upcomingCards.length}</p>
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">This Week</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">upcoming</p>
          </div>

          {/* Done Today */}
          <div className="stat-card group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 min-w-0 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{completedToday.length}</p>
              <CheckCircle2 className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <h3 className="metadata-label text-gray-700 dark:text-gray-400 truncate mb-0.5">Done Today</h3>
            <p className="text-[9px] text-gray-600 dark:text-gray-300 truncate">completed</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineDashboard;

