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

// Clean minimal badge styles matching reference design
const cardTypeStyles: Record<CardType, { bg: string; border: string; text: string; badge: string }> = {
  Blocker: { 
    bg: '', 
    border: '',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  },
  Risk: { 
    bg: '', 
    border: '',
    text: 'text-orange-700 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  },
  Action: { 
    bg: '', 
    border: '',
    text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  },
  Decision: { 
    bg: '', 
    border: '',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  },
  'Follow-up': { 
    bg: '', 
    border: '',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  },
  Question: { 
    bg: '', 
    border: '',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  },
  Update: { 
    bg: '', 
    border: '',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  },
  Idea: { 
    bg: '', 
    border: '',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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
  
  // Get border color based on card type
  const getBorderLeftColor = () => {
    const cardType = card.type as CardType;
    if (cardType === 'Blocker') return '#ef4444';
    if (cardType === 'Risk') return '#f97316';
    if (cardType === 'Action') return '#3b82f6';
    return '#6366f1'; // Default indigo
  };

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
      style={{
        ...style,
        // Clean minimal design - matching reference
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        transition: 'all 0.2s ease-in-out',
      }}
      {...attributes}
      {...listeners}
      className={`
        kanban-card
        group relative rounded-lg mb-3 cursor-move
        bg-white
        hover:shadow-md
        touch-manipulation
      `}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      }}
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
        {/* Card Header - Clean Minimal Design */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}>
                {card.type}
              </span>
              {card.priority && card.priority !== 'medium' && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getPriorityColor(card.priority)}`}>
                  {card.priority.toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed mb-2">
              {card.summary}
            </h3>
            {card.context && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                &quot;{card.context}&quot;
              </p>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transitionDelay: '0ms' }}>
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

