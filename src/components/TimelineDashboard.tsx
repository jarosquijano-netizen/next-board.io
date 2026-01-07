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
        <div className="grid grid-cols-8 gap-1.5">
          {/* Stale Items */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/50 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-yellow-900 dark:text-white leading-none">{staleCards.length}</p>
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-yellow-700 dark:text-yellow-400 truncate">Stale Items</h3>
            <p className="text-[9px] text-yellow-600 dark:text-yellow-300 truncate mt-0.5">Stuck 3+ days</p>
          </div>

          {/* Auto-Escalated */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-500/50 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-orange-900 dark:text-white leading-none">{autoEscalated.length}</p>
              <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 truncate">Auto-Escalated</h3>
            <p className="text-[9px] text-orange-600 dark:text-orange-300 truncate mt-0.5">Priority ⬆️</p>
          </div>

          {/* Avg Time */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/50 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-blue-900 dark:text-white leading-none">{avgTime.toFixed(1)}d</p>
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 truncate">Avg Time</h3>
            <p className="text-[9px] text-blue-600 dark:text-blue-300 truncate mt-0.5">{activeCards.length} active</p>
          </div>

          {/* Total Time */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-500/50 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-purple-900 dark:text-white leading-none">{totalTime.toFixed(0)}d</p>
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 truncate">Total Time</h3>
            <p className="text-[9px] text-purple-600 dark:text-purple-300 truncate mt-0.5">{cardsForStats.length} cards</p>
          </div>

          {/* Overdue */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border border-red-200 dark:border-red-500 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{overdueCards.length}</p>
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-red-700 dark:text-red-400 truncate">Overdue</h3>
            <p className="text-[9px] text-red-600 dark:text-red-300 truncate mt-0.5">{overdueCards.length === 1 ? 'task' : 'tasks'}</p>
          </div>

          {/* Due Soon */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-500 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{urgentCards.length}</p>
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-pulse flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 truncate">Due Soon</h3>
            <p className="text-[9px] text-orange-600 dark:text-orange-300 truncate mt-0.5">urgent</p>
          </div>

          {/* This Week */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200 dark:border-blue-500 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{upcomingCards.length}</p>
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 truncate">This Week</h3>
            <p className="text-[9px] text-blue-600 dark:text-blue-300 truncate mt-0.5">upcoming</p>
          </div>

          {/* Done Today */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border border-green-200 dark:border-green-500 rounded-lg p-2 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{completedToday.length}</p>
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            </div>
            <h3 className="text-[11px] font-semibold text-green-700 dark:text-green-400 truncate">Done Today</h3>
            <p className="text-[9px] text-green-600 dark:text-green-300 truncate mt-0.5">completed</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineDashboard;

