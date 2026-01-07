'use client';

import { MeetingCard } from '@/types/meeting';
import { getTimeInCurrentStatus } from '@/lib/time-tracker';
import { Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

export function TimeTrackingStats({ cards }: { cards: MeetingCard[] }) {
  const activeCards = cards.filter(c => c.status !== 'Done');
  
  // Calculate stale cards (>3 days in status)
  const staleCards = activeCards.filter(card => {
    const time = getTimeInCurrentStatus(card.currentStatusSince);
    return time.isStale;
  });
  
  // Calculate auto-escalated cards
  const autoEscalated = activeCards.filter(c => c.priorityAutoUpdated);
  
  // Calculate average time in status
  const avgTime = activeCards.length > 0
    ? activeCards.reduce((sum, card) => {
        const time = getTimeInCurrentStatus(card.currentStatusSince);
        return sum + time.days;
      }, 0) / activeCards.length
    : 0;

  // Calculate total time spent
  const totalTime = cards.reduce((sum, card) => {
    return sum + (card.timeInTodo + card.timeInProgress + card.timeInBlocked) / 24; // Convert hours to days
  }, 0);

  return (
    <div className="grid grid-cols-4 gap-1.5 mb-4">
      {/* Stale Items */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/50 rounded-md p-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <AlertTriangle className="w-2.5 h-2.5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-[10px] font-semibold text-yellow-900 dark:text-yellow-400">Stale Items</h3>
        </div>
        <p className="text-lg font-bold text-yellow-900 dark:text-white">{staleCards.length}</p>
        <p className="text-[10px] text-yellow-700 dark:text-yellow-300">Stuck 3+ days</p>
      </div>

      {/* Auto-Escalated */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-500/50 rounded-md p-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <TrendingUp className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-[10px] font-semibold text-orange-900 dark:text-orange-400">Auto-Escalated</h3>
        </div>
        <p className="text-lg font-bold text-orange-900 dark:text-white">{autoEscalated.length}</p>
        <p className="text-[10px] text-orange-700 dark:text-orange-300">Priority ⬆️</p>
      </div>

      {/* Avg Time in Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/50 rounded-md p-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <Clock className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-[10px] font-semibold text-blue-900 dark:text-blue-400">Avg Time</h3>
        </div>
        <p className="text-lg font-bold text-blue-900 dark:text-white">{avgTime.toFixed(1)}d</p>
        <p className="text-[10px] text-blue-700 dark:text-blue-300">{activeCards.length} active</p>
      </div>

      {/* Total Work Time */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-500/50 rounded-md p-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <Calendar className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-[10px] font-semibold text-purple-900 dark:text-purple-400">Total Time</h3>
        </div>
        <p className="text-lg font-bold text-purple-900 dark:text-white">{totalTime.toFixed(0)}d</p>
        <p className="text-[10px] text-purple-700 dark:text-purple-300">{cards.length} cards</p>
      </div>
    </div>
  );
}

