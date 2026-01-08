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
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        transition: 'all 0.2s ease-in-out',
      }}
      {...attributes}
      {...listeners}
      className={`
        kanban-card
        group relative rounded-xl mb-3 cursor-move
        bg-white dark:bg-slate-900
        hover:shadow-lg hover:shadow-blue-500/10
        border-gray-200 dark:border-slate-700
        touch-manipulation
      `}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-2 top-4 cursor-grab active:cursor-grabbing touch-manipulation"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
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
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${styles.badge}`}>
                {card.type}
              </span>
              {card.priority && card.priority !== 'medium' && (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase border ${getPriorityColor(card.priority)}`}>
                  {card.priority.toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed mb-2.5 line-clamp-2">
              {card.summary}
            </h3>
            {card.context && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2.5 line-clamp-2 italic">
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

        {/* Metadata Row - Clean minimal matching reference */}
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap pt-2 border-t border-gray-100 dark:border-gray-800">
          {card.owner && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-[10px] shadow-sm">
                {card.owner.charAt(0).toUpperCase()}
              </div>
              <span className="truncate font-medium">{card.owner}</span>
            </div>
          )}
          {card.dueDate && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${timeStatus.isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
              <Clock className={`w-3 h-3 flex-shrink-0 ${timeStatus.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`font-medium ${timeStatus.displayColor}`}>
                {timeStatus.displayText}
              </span>
            </div>
          )}
          {activities.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20">
              <MessageSquare className="w-3 h-3 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300">{activities.length}</span>
            </div>
          )}
          {card.timeEstimate && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800/50">
              <Clock className="w-3 h-3 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="font-medium">{getTimeEstimateDisplay(card.timeEstimate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

