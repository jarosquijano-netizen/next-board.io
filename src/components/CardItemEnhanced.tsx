'use client';

import { useState } from 'react';
import { MeetingCard, CardType } from '@/types/meeting';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, User, Calendar, Clock, MessageSquare, 
  Edit2, Trash2, Save, X, AlertCircle, Flag, Timer, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker.css';
import { 
  getTimeStatus, 
  getPriorityColor, 
  getTimeEstimateDisplay, 
  getUrgencyBorderClass 
} from '@/lib/time-utils';

interface CardItemProps {
  card: MeetingCard;
  onUpdate?: (id: string, updates: Partial<MeetingCard>) => void;
  onDelete?: (id: string) => void;
}

// Standardized color palette - semantic colors only for critical states
const cardTypeStyles: Record<CardType, { bg: string; border: string; text: string; badge: string }> = {
  // Critical - Red
  Blocker: { 
    bg: 'bg-gradient-to-br from-red-500/12 to-red-600/8 dark:from-red-500/12 dark:to-red-600/8', 
    border: 'border-red-500/40',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40'
  },
  // Warning - Orange
  Risk: { 
    bg: 'bg-gradient-to-br from-orange-500/12 to-orange-600/8 dark:from-orange-500/12 dark:to-orange-600/8', 
    border: 'border-orange-500/40',
    text: 'text-orange-700 dark:text-orange-400',
    badge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40'
  },
  // Primary Action - Blue
  Action: { 
    bg: 'bg-gradient-to-br from-blue-500/12 to-blue-600/8 dark:from-blue-500/12 dark:to-blue-600/8', 
    border: 'border-blue-500/40',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40'
  },
  // Neutral - Gray
  Decision: { 
    bg: 'bg-gradient-to-br from-slate-500/12 to-slate-600/8 dark:from-slate-500/12 dark:to-slate-600/8', 
    border: 'border-slate-400/40',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400/40'
  },
  'Follow-up': { 
    bg: 'bg-gradient-to-br from-slate-500/12 to-slate-600/8 dark:from-slate-500/12 dark:to-slate-600/8', 
    border: 'border-slate-400/40',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400/40'
  },
  Question: { 
    bg: 'bg-gradient-to-br from-slate-500/12 to-slate-600/8 dark:from-slate-500/12 dark:to-slate-600/8', 
    border: 'border-slate-400/40',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400/40'
  },
  Update: { 
    bg: 'bg-gradient-to-br from-slate-500/12 to-slate-600/8 dark:from-slate-500/12 dark:to-slate-600/8', 
    border: 'border-slate-400/40',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400/40'
  },
  Idea: { 
    bg: 'bg-gradient-to-br from-slate-500/12 to-slate-600/8 dark:from-slate-500/12 dark:to-slate-600/8', 
    border: 'border-slate-400/40',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400/40'
  },
};

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'text-slate-400', icon: '●' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', icon: '●●' },
  { value: 'high', label: 'High', color: 'text-red-400', icon: '●●●' },
];

export default function CardItemEnhanced({ card, onUpdate, onDelete }: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(card.summary);
  const [editedOwner, setEditedOwner] = useState(card.owner || '');
  
  // Parse due date safely - only if it's a valid date
  const parseDueDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    try {
      const parsed = new Date(dateString);
      // Check if date is valid
      if (isNaN(parsed.getTime())) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  // Helper to format date for display
  const formatDisplayDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = parseDueDate(dateString);
    if (!date) return dateString; // Fallback to original if parsing fails

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Check if it's today, tomorrow, or yesterday
    let dateLabel = '';
    if (dateOnly.getTime() === today.getTime()) {
      dateLabel = 'Today';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      dateLabel = 'Tomorrow';
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      dateLabel = 'Yesterday';
    } else {
      // Format as "Mon, Jan 15, 2025"
      dateLabel = date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }

    // Add time if not midnight
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours !== 0 || minutes !== 0) {
      const timeLabel = date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
      return `${dateLabel} at ${timeLabel}`;
    }

    return dateLabel;
  };
  
  const [editedDueDate, setEditedDueDate] = useState<Date | null>(parseDueDate(card.dueDate));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardStyle = cardTypeStyles[card.type as CardType] || cardTypeStyles.Action;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(card.id, {
        summary: editedSummary,
        owner: editedOwner || null,
        dueDate: editedDueDate ? editedDueDate.toISOString() : null,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSummary(card.summary);
    setEditedOwner(card.owner || '');
    setEditedDueDate(parseDueDate(card.dueDate));
    setIsEditing(false);
  };

  // Get time status for urgency indicators
  const timeStatus = getTimeStatus(card.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border backdrop-blur-sm p-4 mb-3 group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 bg-white dark:bg-transparent",
        cardStyle.bg,
        cardStyle.border,
        getUrgencyBorderClass(timeStatus.urgencyLevel),
        isDragging && 'cursor-grabbing shadow-2xl shadow-blue-500/20'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border",
            cardStyle.badge
          )}>
            {card.type}
          </span>
          
          {/* Priority Badge */}
          {card.priority && card.priority !== 'medium' && (
            <span className={cn(
              "inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold",
              getPriorityColor(card.priority)
            )}>
              {card.priority.toUpperCase()}
            </span>
          )}
          
          {/* Urgency/Overdue Badge */}
          {timeStatus.urgencyLevel === 'overdue' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 rounded-lg text-xs font-medium animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              {timeStatus.displayText}
            </span>
          )}
          {timeStatus.urgencyLevel === 'urgent' && !timeStatus.isOverdue && (
            <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30 rounded-lg text-xs font-medium">
              <Clock className="w-3 h-3" />
              {timeStatus.displayText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                title="Edit card"
              >
                <Edit2 className="w-4 h-4 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
              </button>
              <button
                onClick={() => onDelete && onDelete(card.id)}
                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                title="Delete card"
              >
                <Trash2 className="w-4 h-4 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
              </button>
            </>
          )}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-lg p-1.5 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </div>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <input
            type="text"
            value={editedOwner}
            onChange={(e) => setEditedOwner(e.target.value)}
            placeholder="Owner"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <DatePicker
              selected={editedDueDate}
              onChange={(date) => setEditedDueDate(date)}
              dateFormat="MMMM d, yyyy h:00 aa"
              placeholderText="Select due date & time"
              isClearable
              showTimeSelect
              showTimeSelectOnly={false}
              timeFormat="HH:mm"
              timeIntervals={60}
              timeCaption="Hour"
              withPortal
              portalId="root-portal"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              wrapperClassName="w-full"
              calendarClassName="!bg-white dark:!bg-slate-800 !border-gray-300 dark:!border-slate-600"
              popperProps={{
                strategy: 'fixed'
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 dark:bg-slate-700 hover:bg-gray-700 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-900 dark:text-white font-medium mb-3 leading-relaxed">
            {card.summary}
          </p>

          {/* Metadata */}
          <div className="space-y-2">
            {card.owner && (
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                <span>{card.owner}</span>
              </div>
            )}

            {card.dueDate && (
              <div className={cn(
                "flex items-center gap-2 text-xs",
                timeStatus.isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-700 dark:text-slate-300"
              )}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDisplayDate(card.dueDate)}</span>
              </div>
            )}

            {card.timestamp && (
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                <span>{card.timestamp}</span>
              </div>
            )}

            {card.timeEstimate && (
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300">
                <Timer className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                <span>Est: {getTimeEstimateDisplay(card.timeEstimate)}</span>
              </div>
            )}

            {card.context && (
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-400 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700/50">
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{card.context}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

