'use client';

import { useState } from 'react';
import { MeetingCard, CardType } from '@/types/meeting';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  cards: MeetingCard[];
  onCardClick?: (card: MeetingCard) => void;
}

// Standardized color palette - matches card and filter styling
const cardTypeColors: Record<CardType, string> = {
  Blocker: 'bg-red-600',
  Risk: 'bg-orange-600',
  Action: 'bg-blue-600',
  Decision: 'bg-slate-600',
  'Follow-up': 'bg-slate-600',
  Question: 'bg-slate-600',
  Update: 'bg-slate-600',
  Idea: 'bg-slate-600',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView({ cards, onCardClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  // Get previous month's last days to fill the grid
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = firstDayWeekday;

  // Calculate total cells needed (6 rows of 7 days)
  const totalCells = 42;

  // Group cards by date
  const cardsByDate = cards.reduce((acc, card) => {
    if (card.dueDate) {
      try {
        const date = new Date(card.dueDate);
        // Only process valid dates
        if (!isNaN(date.getTime())) {
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(card);
        }
      } catch (error) {
        // Skip invalid dates
        console.warn('Invalid date format for card:', card.id, card.dueDate);
      }
    }
    return acc;
  }, {} as Record<string, MeetingCard[]>);

  const getCardsForDate = (day: number, monthOffset: number = 0) => {
    const date = new Date(year, month + monthOffset, day);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return cardsByDate[dateKey] || [];
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number, monthOffset: number = 0) => {
    const today = new Date();
    const checkDate = new Date(year, month + monthOffset, day);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day: number, monthOffset: number = 0) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month + monthOffset, day);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Build calendar grid
  const calendarDays = [];

  // Previous month days
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      monthOffset: -1,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      monthOffset: 0,
    });
  }

  // Next month days
  const remainingCells = totalCells - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      monthOffset: 1,
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-slate-300" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {/* Day Headers */}
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-slate-800 px-2 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-300"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((dayInfo, index) => {
          const { day, isCurrentMonth, monthOffset } = dayInfo;
          const dayCards = getCardsForDate(day, monthOffset);
          const today = isToday(day, monthOffset);
          const past = isPastDate(day, monthOffset);

          return (
            <div
              key={index}
              className={cn(
                "bg-white dark:bg-slate-900 min-h-[120px] p-2 relative",
                !isCurrentMonth && "bg-gray-50/50 dark:bg-slate-900/30",
                today && "ring-2 ring-blue-500 ring-inset bg-blue-50/30 dark:bg-blue-950/30"
              )}
            >
              {/* Today Badge */}
              {today && (
                <div className="absolute top-1 right-1 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                  TODAY
                </div>
              )}
              
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrentMonth
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-slate-600",
                    today && "flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-full font-bold shadow-md"
                  )}
                >
                  {day}
                </span>
              </div>

              {/* Cards for this day */}
              <div className="space-y-1">
                {dayCards.slice(0, 3).map((card) => (
                  <button
                    key={card.id}
                    onClick={() => onCardClick && onCardClick(card)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-xs font-medium text-white hover:opacity-80 transition-opacity line-clamp-2",
                      cardTypeColors[card.type as CardType]
                    )}
                    title={card.summary}
                  >
                    {card.summary}
                  </button>
                ))}
                {dayCards.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-medium px-2">
                    +{dayCards.length - 3} more
                  </div>
                )}
              </div>

              {/* Overdue indicator */}
              {past && dayCards.length > 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Overdue
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-sm">
        <span className="text-gray-600 dark:text-slate-400 font-medium">Card Types:</span>
        {Object.entries(cardTypeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded", color)}></div>
            <span className="text-gray-700 dark:text-slate-300">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

