'use client';

import { useState } from 'react';
import { MeetingCard } from '@/types/meeting';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MessageSquare, 
  Paperclip, 
  Clock, 
  User,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Pencil,
  Trash2,
  GripVertical,
  MessageCircle,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  RotateCw,
  Presentation,
  Users as UsersIcon
} from 'lucide-react';
import { getInteractionConfig, InteractionType } from '@/types/interaction-types';
import { formatDateTime } from '@/lib/utils';
import { getTimeStatus, getPriorityColor, getTimeEstimateDisplay, getUrgencyBorderClass } from '@/lib/time-utils';
import { getTimeInCurrentStatus, getStaleBackgroundClass, getTimeIcon } from '@/lib/time-tracker';
import DatePicker from 'react-datepicker';
import { CardType } from '@/types/meeting';

interface CardActivity {
  id: string;
  activityType: string;
  content: string;
  metadata?: any;
  createdAt: string;
  userId: string;
}

interface LivingCardProps {
  card: MeetingCard & {
    activities?: CardActivity[];
  };
  onUpdate?: (id: string, updates: Partial<MeetingCard>) => void;
  onDelete?: (id: string) => void;
  onAddNote?: (content: string) => Promise<void>;
  onGenerateSummary?: () => Promise<void>;
  onClick?: () => void;
}

const interactionIconMap = {
  MessageCircle,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  RotateCw,
  Presentation,
  Users: UsersIcon,
};

const cardTypeStyles: Record<CardType, { bg: string; border: string; text: string; badge: string }> = {
  Blocker: { 
    bg: 'bg-gradient-to-br from-red-500/12 to-red-600/8 dark:from-red-500/12 dark:to-red-600/8', 
    border: 'border-red-500/40',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40'
  },
  Risk: { 
    bg: 'bg-gradient-to-br from-orange-500/12 to-orange-600/8 dark:from-orange-500/12 dark:to-orange-600/8', 
    border: 'border-orange-500/40',
    text: 'text-orange-700 dark:text-orange-400',
    badge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40'
  },
  Action: { 
    bg: 'bg-gradient-to-br from-blue-500/12 to-blue-600/8 dark:from-blue-500/12 dark:to-blue-600/8', 
    border: 'border-blue-500/40',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40'
  },
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

export default function LivingCard({ card, onUpdate, onDelete, onAddNote, onGenerateSummary, onClick }: LivingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Make card draggable
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

  const timeStatus = getTimeStatus(card.dueDate);
  const timeInStatus = getTimeInCurrentStatus(card.currentStatusSince);
  const staleClass = getStaleBackgroundClass(timeInStatus.urgencyLevel);
  const styles = cardTypeStyles[card.type as CardType] || cardTypeStyles.Action;
  const activities = card.activities || [];

  const handleAddNote = async () => {
    if (!noteText.trim() || !onAddNote) return;
    
    setIsSubmitting(true);
    try {
      await onAddNote(noteText.trim());
      setNoteText('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!onGenerateSummary) return;
    
    setIsGeneratingSummary(true);
    try {
      await onGenerateSummary();
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative rounded-lg sm:rounded-xl p-3 sm:p-4 mb-2 sm:mb-3 transition-all duration-300 ease-in-out cursor-move
        border-l-4 ${styles.border} ${styles.bg}
        bg-white dark:bg-transparent
        shadow-sm hover:shadow-md hover:border-indigo-400/60 hover:scale-[1.01] active:scale-[0.98]
        ${getUrgencyBorderClass(timeStatus.urgencyLevel)}
        ${staleClass}
        touch-manipulation
      `}
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-1.5 sm:left-2 top-3 sm:top-4 cursor-grab active:cursor-grabbing touch-manipulation"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-slate-400" strokeWidth={1.5} />
      </div>

      <div 
        className="ml-5 sm:ml-6 cursor-pointer touch-manipulation" 
        onClick={(e) => {
          // Don't trigger modal if clicking on action buttons
          if (!(e.target as HTMLElement).closest('button')) {
            onClick?.();
          }
        }}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
              <span className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${styles.badge}`}>
                {card.type}
              </span>
              {card.priority && (
                <span className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider ${getPriorityColor(card.priority)}`}>
                  {card.priority.toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug line-clamp-2 transition-colors duration-300">
              {card.summary}
            </h3>
            {card.context && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 italic mt-1.5 border-l-2 border-gray-300 dark:border-gray-600 pl-2 line-clamp-2 leading-relaxed">
                &quot;{card.context}&quot;
              </p>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onUpdate && (
              <button
                onClick={() => {/* TODO: Implement edit */}}
                className="p-1.5 sm:p-1.5 text-gray-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-300 touch-manipulation active:scale-95"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(card.id)}
                className="p-1.5 sm:p-1.5 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors duration-300 touch-manipulation active:scale-95"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* 👥 PEOPLE INTERACTION SECTION - Prominently displayed */}
        {(() => {
          const interactionConfig = getInteractionConfig(card.interactionType as InteractionType | null);
          const Icon = interactionConfig ? interactionIconMap[interactionConfig.icon as keyof typeof interactionIconMap] : null;
          
          if (interactionConfig && card.primaryContact) {
            return (
              <div className={`mb-3 p-3 rounded-lg border ${interactionConfig.bgColor}/10 dark:${interactionConfig.bgColor}/20 border-${interactionConfig.color.replace('text-', '')}-500/30`}>
                <div className="flex items-start gap-3">
                  {Icon && <Icon className={`w-5 h-5 ${interactionConfig.color} flex-shrink-0 mt-0.5`} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-sm font-bold ${interactionConfig.color}`}>
                        {interactionConfig.verb}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold truncate">
                        {card.primaryContact}
                      </span>
                    </div>
                    
                    {/* Additional Contacts */}
                    {card.additionalContacts && card.additionalContacts.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        + {card.additionalContacts.join(', ')}
                      </div>
                    )}
                    
                    {/* Interaction Note */}
                    {card.interactionNote && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                        {card.interactionNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* All Involved People Pills */}
        {card.involvedPeople && card.involvedPeople.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {card.involvedPeople.map((person, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                {person}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Row */}
        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-600 dark:text-slate-400 mb-1.5 sm:mb-2 flex-wrap">
          {card.owner && (
            <div className="flex items-center gap-1">
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-none">{card.owner}</span>
            </div>
          )}
          {card.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className={timeStatus.displayColor}>
                {timeStatus.displayText}
              </span>
            </div>
          )}
          {card.timeEstimate && (
            <span className="whitespace-nowrap">{getTimeEstimateDisplay(card.timeEstimate)}</span>
          )}
        </div>

        {/* Time Tracking */}
        <div className="flex items-center justify-between text-xs p-2 bg-gray-100 dark:bg-slate-800/50 rounded-lg mb-2 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className={timeInStatus.color}>
              {getTimeIcon(timeInStatus.urgencyLevel)}
            </span>
            <span className="text-gray-600 dark:text-gray-400">In {card.status}:</span>
            <span className={`font-semibold ${timeInStatus.color}`}>
              {timeInStatus.displayText}
            </span>
          </div>
          {card.priorityAutoUpdated && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/40">
              Auto ⬆️
            </span>
          )}
        </div>

        {/* Stale Warning */}
        {timeInStatus.isStale && (
          <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1.5 rounded-lg mb-2 border border-yellow-300 dark:border-yellow-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>⚠️ Needs attention - {timeInStatus.displayText} in this status</span>
          </div>
        )}

        {/* Activity Count Badge */}
        {activities.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 mt-2">
            <MessageSquare className="w-3 h-3" />
            <span>{activities.length} {activities.length === 1 ? 'update' : 'updates'}</span>
          </div>
        )}

        {/* AI Summary Indicator */}
        {card.status === 'Done' && card.aiSummary && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <Sparkles className="w-3 h-3" />
            <span>AI Summary Available</span>
          </div>
        )}
      </div>
    </div>
  );
}

