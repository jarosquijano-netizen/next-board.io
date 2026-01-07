'use client';

import { MeetingCard } from '@/types/meeting';
import { Clock, User, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { getTimeStatus } from '@/lib/time-utils';

interface CardHoverPreviewProps {
  card: MeetingCard;
  position: { x: number; y: number };
}

export function CardHoverPreview({ card, position }: CardHoverPreviewProps) {
  const timeStatus = getTimeStatus(card.dueDate);

  return (
    <div
      className="fixed z-[100] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 p-4 w-80 pointer-events-none"
      style={{
        left: `${position.x + 20}px`,
        top: `${position.y - 10}px`,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white">
            {card.type}
          </span>
          {card.priority && (
            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
              card.priority === 'urgent' ? 'bg-red-600' :
              card.priority === 'high' ? 'bg-orange-600' :
              card.priority === 'medium' ? 'bg-blue-600' : 'bg-gray-600'
            }`}>
              {card.priority.toUpperCase()}
            </span>
          )}
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {card.summary}
        </h4>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs">
        {card.owner && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <User className="w-3 h-3" />
            <span>{card.owner}</span>
          </div>
        )}

        {card.dueDate && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>
              Due: {new Date(card.dueDate).toLocaleDateString()}
              {timeStatus.isOverdue && (
                <span className="ml-2 text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </span>
          </div>
        )}

        {card.timeEstimate && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Estimate: {card.timeEstimate} min</span>
          </div>
        )}

        {card.status === 'Done' && card.completedAt && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed {new Date(card.completedAt).toLocaleDateString()}</span>
          </div>
        )}

        {card.context && (
          <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400 line-clamp-3">
              {card.context}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
