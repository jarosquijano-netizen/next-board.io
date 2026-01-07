'use client';

import { useState } from 'react';
import { MeetingCard } from '@prisma/client';
import { getTimeStatus } from '@/lib/time-utils';
import { AlertTriangle, Clock, Target, Calendar, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { isToday, isTomorrow } from 'date-fns';

interface MyFocusTodayViewProps {
  cards: MeetingCard[];
  onCardClick: (card: MeetingCard) => void;
}

export function MyFocusTodayView({ cards, onCardClick }: MyFocusTodayViewProps) {
  const activeCards = cards.filter(c => c.status !== 'Done');

  // 1. CRITICAL: Overdue items
  const overdue = activeCards.filter(c => {
    if (!c.dueDate) return false;
    const time = getTimeStatus(c.dueDate);
    return time.isOverdue;
  });

  // 2. URGENT: Due today
  const dueToday = activeCards.filter(c => 
    c.dueDate && isToday(new Date(c.dueDate))
  );

  // 3. ATTENTION: Blocked items needing action
  const blocked = activeCards.filter(c => c.status === 'Blocked');

  // 4. CONTINUE: In Progress
  const inProgress = activeCards.filter(c => c.status === 'In Progress')
    .slice(0, 5); // Limit to 5 most important

  // 5. PREPARE: Due tomorrow
  const dueTomorrow = activeCards.filter(c =>
    c.dueDate && isTomorrow(new Date(c.dueDate))
  );

  // 6. CONSIDER: High priority without due date (potential quick wins)
  const highPriorityNoDate = activeCards
    .filter(c =>
      (c.priority === 'urgent' || c.priority === 'high') &&
      !c.dueDate &&
      c.status === 'To Do'
    )
    .slice(0, 3); // Show top 3

  const totalFocusItems = 
    overdue.length + 
    dueToday.length + 
    blocked.length + 
    inProgress.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Focus Today</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Your curated list of what matters right now
        </p>
        
        {/* Focus Score */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-500/50 rounded-lg">
          <span className="text-sm text-gray-700 dark:text-gray-300">Focus Items:</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalFocusItems}</span>
        </div>
      </div>

      {/* SECTION 1: OVERDUE - Critical */}
      {overdue.length > 0 && (
        <FocusSection
          title="🚨 OVERDUE - Handle Now"
          subtitle="These are past their deadline and need immediate attention"
          count={overdue.length}
          cards={overdue}
          color="red"
          priority="critical"
          onCardClick={onCardClick}
        />
      )}

      {/* SECTION 2: DUE TODAY - Urgent */}
      {dueToday.length > 0 && (
        <FocusSection
          title="🎯 Due Today"
          subtitle="Complete these before end of day"
          count={dueToday.length}
          cards={dueToday}
          color="orange"
          priority="urgent"
          onCardClick={onCardClick}
        />
      )}

      {/* SECTION 3: BLOCKED - Action Required */}
      {blocked.length > 0 && (
        <FocusSection
          title="🚧 Blocked - Needs Your Action"
          subtitle="These are waiting on something. Can you unblock them?"
          count={blocked.length}
          cards={blocked}
          color="red"
          priority="attention"
          onCardClick={onCardClick}
        />
      )}

      {/* SECTION 4: IN PROGRESS - Continue */}
      {inProgress.length > 0 && (
        <FocusSection
          title="🔄 In Progress - Keep Going"
          subtitle="You're already working on these - maintain momentum"
          count={inProgress.length}
          cards={inProgress}
          color="purple"
          priority="continue"
          onCardClick={onCardClick}
        />
      )}

      {/* SECTION 5: DUE TOMORROW - Prepare */}
      {dueTomorrow.length > 0 && (
        <FocusSection
          title="📅 Due Tomorrow - Start Preparing"
          subtitle="Get ahead by starting these today"
          count={dueTomorrow.length}
          cards={dueTomorrow}
          color="blue"
          priority="prepare"
          onCardClick={onCardClick}
          collapsible
        />
      )}

      {/* SECTION 6: HIGH PRIORITY NO DATE - Consider */}
      {highPriorityNoDate.length > 0 && (
        <FocusSection
          title="⚡ High Priority - Schedule These"
          subtitle="Important items without deadlines - add due dates"
          count={highPriorityNoDate.length}
          cards={highPriorityNoDate}
          color="yellow"
          priority="consider"
          onCardClick={onCardClick}
          collapsible
        />
      )}

      {/* EMPTY STATE: All Clear! */}
      {totalFocusItems === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All Clear! 🎉</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No urgent items today. Great work staying on top of things!
          </p>
          <p className="text-sm text-gray-500">
            Time to plan ahead or tackle some strategic work
          </p>
        </div>
      )}
    </div>
  );
}

// Focus Section Component
interface FocusSectionProps {
  title: string;
  subtitle: string;
  count: number;
  cards: MeetingCard[];
  color: 'red' | 'orange' | 'purple' | 'blue' | 'yellow';
  priority: 'critical' | 'urgent' | 'attention' | 'continue' | 'prepare' | 'consider';
  onCardClick: (card: MeetingCard) => void;
  collapsible?: boolean;
}

function FocusSection({ 
  title, 
  subtitle, 
  count, 
  cards, 
  color, 
  priority,
  onCardClick,
  collapsible = false,
}: FocusSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const colorClasses = {
    red: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-400 dark:border-red-500',
      text: 'text-red-700 dark:text-red-400',
      badge: 'bg-red-600',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-400 dark:border-orange-500',
      text: 'text-orange-700 dark:text-orange-400',
      badge: 'bg-orange-600',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-400 dark:border-purple-500',
      text: 'text-purple-700 dark:text-purple-400',
      badge: 'bg-purple-600',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-400 dark:border-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
      badge: 'bg-blue-600',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-400 dark:border-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-400',
      badge: 'bg-yellow-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`border-2 rounded-xl p-6 ${colors.bg} ${colors.border}`}>
      <div 
        className={`flex items-center justify-between mb-2 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`text-xl font-bold ${colors.text}`}>{title}</h3>
            <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${colors.badge}`}>
              {count}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        {collapsible && (
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map(card => (
            <FocusCard 
              key={card.id} 
              card={card} 
              onClick={() => onCardClick(card)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simplified Card for Focus View
function FocusCard({ card, onClick }: { card: MeetingCard; onClick: () => void }) {
  const timeStatus = card.dueDate ? getTimeStatus(card.dueDate) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 border border-gray-200 dark:border-slate-700"
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white font-semibold">
          {card.type}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-purple-600 text-white font-semibold">
          {card.priority.toUpperCase()}
        </span>
      </div>
      
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{card.summary}</h4>
      
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        {card.owner && (
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>{card.owner}</span>
          </div>
        )}
        {timeStatus && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className={timeStatus.displayColor}>{timeStatus.displayText}</span>
          </div>
        )}
      </div>
    </div>
  );
}







