'use client';

import { useState, useEffect } from 'react';
import { MeetingCard, CardActivity, CardStatus } from '@/types/meeting';
import {
  X,
  User,
  Calendar,
  Clock,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  Edit3,
  CheckCircle2,
  Tag,
  FileText,
  ChevronDown,
  UserPlus,
  Users,
  Copy,
  Loader2,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { getTimeStatus, formatDueDate, getPriorityColor } from '@/lib/time-utils';
import { CardType } from '@/types/meeting';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CardDetailModalProps {
  card: MeetingCard & { activities?: CardActivity[] };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<MeetingCard>) => Promise<void>;
  onAddNote: (content: string) => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  onDelete: () => Promise<void>;
}

interface MessageSuggestion {
  type: string;
  label: string;
  icon: string;
  color: string;
}

// Card type configuration
const CARD_TYPE_CONFIG: Record<CardType, { label: string; emoji: string; color: string }> = {
  Action: { label: 'Action', emoji: '🎯', color: '#3b82f6' },
  Decision: { label: 'Decision', emoji: '⚖️', color: '#64748b' },
  'Follow-up': { label: 'Follow-up', emoji: '📋', color: '#64748b' },
  Update: { label: 'Update', emoji: '📢', color: '#64748b' },
  Blocker: { label: 'Blocker', emoji: '🚫', color: '#ef4444' },
  Idea: { label: 'Idea', emoji: '💡', color: '#64748b' },
  Risk: { label: 'Risk', emoji: '⚠️', color: '#f97316' },
  Question: { label: 'Question', emoji: '❓', color: '#64748b' },
};

export function CardDetailModal({
  card,
  isOpen,
  onClose,
  onUpdate,
  onAddNote,
  onGenerateSummary,
  onDelete,
}: CardDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(card.summary);
  const [noteText, setNoteText] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Editable fields
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editedStatus, setEditedStatus] = useState<CardStatus>(card.status as CardStatus);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [editedPriority, setEditedPriority] = useState(card.priority || 'medium');
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editedDueDate, setEditedDueDate] = useState<Date | null>(
    card.dueDate ? new Date(card.dueDate) : null
  );
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [editedOwner, setEditedOwner] = useState(card.owner || '');
  const [isEditingCoOwners, setIsEditingCoOwners] = useState(false);
  const [editedCoOwners, setEditedCoOwners] = useState('');
  
  // AI Message Generator state
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([]);
  
  // Parse additional contacts as co-owners
  const coOwners = (() => {
    try {
      if (card.additionalContacts) {
        return typeof card.additionalContacts === 'string' 
          ? JSON.parse(card.additionalContacts) 
          : card.additionalContacts;
      }
      return [];
    } catch {
      return [];
    }
  })();

  const typeConfig = CARD_TYPE_CONFIG[card.type];
  const timeStatus = getTimeStatus(card.dueDate);
  
  const ALL_STATUSES: CardStatus[] = ['To Do', 'In Progress', 'Blocked', 'Done'];
  const ALL_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setEditedSummary(card.summary);
    setEditedStatus(card.status as CardStatus);
    setEditedPriority(card.priority || 'medium');
    setEditedDueDate(card.dueDate ? new Date(card.dueDate) : null);
    setEditedOwner(card.owner || '');
    console.log('🔄 Card updated in modal:', {
      id: card.id,
      activities: card.activities?.length || 0,
      activitiesData: card.activities
    });
  }, [card.summary, card.status, card.priority, card.dueDate, card.owner, card.activities]);

  // Load message suggestions when modal opens
  useEffect(() => {
    if (isOpen && card?.id) {
      loadMessageSuggestions();
      setGeneratedMessage(''); // Reset message when card changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, card?.id]);

  const loadMessageSuggestions = async () => {
    if (!card?.id) return;
    
    try {
      const response = await fetch(`/api/cards/${card.id}/generate-message`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const generateMessage = async (messageType?: string) => {
    if (!card?.id) return;
    
    setIsGenerating(true);
    setMessageCopied(false);
    
    try {
      const response = await fetch(`/api/cards/${card.id}/generate-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageType, tone: 'professional' }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate message');
      }

      const data = await response.json();
      setGeneratedMessage(data.message);
    } catch (error) {
      console.error('Error generating message:', error);
      alert('Failed to generate message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy message');
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50',
      red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50',
      orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
      green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50',
      gray: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    };
    return colors[color] || colors.gray;
  };

  if (!isOpen) return null;

  const handleSaveTitle = async () => {
    if (editedSummary.trim() && editedSummary !== card.summary) {
      await onUpdate({ summary: editedSummary });
    }
    setIsEditing(false);
  };
  
  const handleSaveStatus = async (newStatus: CardStatus) => {
    if (newStatus !== card.status) {
      await onUpdate({ status: newStatus });
    }
    setIsEditingStatus(false);
  };
  
  const handleSavePriority = async (newPriority: string) => {
    if (newPriority !== card.priority) {
      await onUpdate({ priority: newPriority });
    }
    setIsEditingPriority(false);
  };
  
  const handleSaveDueDate = async (newDate: Date | null) => {
    const newDateISO = newDate ? newDate.toISOString() : null;
    const currentDateISO = card.dueDate;
    
    if (newDateISO !== currentDateISO) {
      await onUpdate({ dueDate: newDateISO });
    }
    setIsEditingDueDate(false);
  };

  const handleSaveOwner = async () => {
    if (editedOwner !== card.owner) {
      await onUpdate({ owner: editedOwner.trim() || null });
    }
    setIsEditingOwner(false);
  };

  const handleSaveCoOwners = async () => {
    // Parse comma-separated co-owners
    const coOwnersList = editedCoOwners
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    await onUpdate({ 
      additionalContacts: coOwnersList
    });
    setIsEditingCoOwners(false);
    setEditedCoOwners('');
  };

  const handleRemoveCoOwner = async (coOwnerToRemove: string) => {
    const updatedCoOwners = coOwners.filter((co: string) => co !== coOwnerToRemove);
    await onUpdate({ 
      additionalContacts: updatedCoOwners
    });
  };

  const handleAddNote = async () => {
    if (noteText.trim()) {
      console.log('📝 Adding note:', noteText);
      await onAddNote(noteText);
      setNoteText('');
      console.log('✅ Note added successfully');
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      await onGenerateSummary();
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      await onDelete();
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-overlay fixed inset-0 bg-slate-900/60 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="modal-glass rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-hidden pointer-events-auto border-0 sm:border transition-all duration-300 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="flex-1 pr-4">
              {/* Type Badge */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm`}
                  style={{ backgroundColor: typeConfig.color }}
                >
                  {typeConfig.emoji} {typeConfig.label}
                </span>
                
                {/* Priority Badge - Editable */}
                <div className="relative">
                  {isEditingPriority ? (
                    <select
                      value={editedPriority}
                      onChange={(e) => handleSavePriority(e.target.value)}
                      onBlur={() => setIsEditingPriority(false)}
                      autoFocus
                      className={`px-2.5 py-1 rounded text-xs font-semibold appearance-none cursor-pointer ${getPriorityColor(editedPriority)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {ALL_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setIsEditingPriority(true)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${getPriorityColor(card.priority || 'medium')} hover:opacity-80 transition-opacity flex items-center gap-1`}
                    >
                      {(card.priority || 'MEDIUM').toUpperCase()}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {/* Status Badge - Editable */}
                <div className="relative">
                  {isEditingStatus ? (
                    <select
                      value={editedStatus}
                      onChange={(e) => handleSaveStatus(e.target.value as CardStatus)}
                      onBlur={() => setIsEditingStatus(false)}
                      autoFocus
                      className={`px-2.5 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {ALL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className={`px-2.5 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1`}
                    >
                      {card.status}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title - Editable */}
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white text-lg sm:text-xl font-semibold px-3 py-2 rounded border-2 border-blue-500 focus:outline-none touch-manipulation"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors touch-manipulation active:scale-95"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 group">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex-1 break-words leading-relaxed">{card.summary}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-all touch-manipulation active:scale-95 flex-shrink-0"
                  >
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}

              {/* Original Context */}
              {card.context && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic mt-3 border-l-2 border-blue-500 pl-3 leading-relaxed">
                  &quot;{card.context}&quot;
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation active:scale-95 flex-shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          </div>

          {/* Body - Scrollable - includes everything below header */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
            {/* Metadata Section */}
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {/* Owner - Editable */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Owner</p>
                  {isEditingOwner ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedOwner}
                        onChange={(e) => setEditedOwner(e.target.value)}
                        onBlur={handleSaveOwner}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveOwner();
                          if (e.key === 'Escape') setIsEditingOwner(false);
                        }}
                        placeholder="Enter owner name"
                        autoFocus
                        className="flex-1 text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white px-2 py-1 rounded border-2 border-blue-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingOwner(true)}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full truncate"
                    >
                      {card.owner || 'Click to assign'}
                    </button>
                  )}
                </div>
              </div>

              {/* Due Date - Editable */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  timeStatus.isOverdue ? 'bg-red-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}>
                  <Calendar className={`w-5 h-5 ${timeStatus.isOverdue ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Due Date</p>
                  {isEditingDueDate ? (
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={editedDueDate}
                        onChange={(date) => {
                          setEditedDueDate(date);
                          handleSaveDueDate(date);
                        }}
                        showTimeSelect
                        dateFormat="MMM d, yyyy h:mm aa"
                        className="text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white px-2 py-1 rounded border-2 border-blue-500 focus:outline-none"
                        placeholderText="No deadline"
                        isClearable
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingDueDate(true)}
                      className={`text-sm font-medium hover:underline text-left ${timeStatus.displayColor}`}
                    >
                      {card.dueDate ? formatDueDate(card.dueDate) : 'Set deadline'}
                    </button>
                  )}
                  {card.dueDate && !isEditingDueDate && (
                    <p className="text-xs text-gray-500">{timeStatus.displayText}</p>
                  )}
                </div>
              </div>

              {/* Created */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDateTime(new Date(card.createdAt))}
                  </p>
                </div>
              </div>

              {/* Completed */}
              {card.completedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Completed</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(new Date(card.completedAt))}
                    </p>
                  </div>
                </div>
              )}

              {/* Co-Owners Section - Full Width */}
              <div className="col-span-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Co-Owners</p>
                    
                    {/* Display existing co-owners */}
                    {coOwners.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {coOwners.map((coOwner: string, index: number) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                          >
                            <span>{coOwner}</span>
                            <button
                              onClick={() => handleRemoveCoOwner(coOwner)}
                              className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                              title="Remove co-owner"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add co-owner form */}
                    {isEditingCoOwners ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editedCoOwners}
                          onChange={(e) => setEditedCoOwners(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCoOwners();
                            if (e.key === 'Escape') {
                              setIsEditingCoOwners(false);
                              setEditedCoOwners('');
                            }
                          }}
                          placeholder="Enter names separated by commas"
                          autoFocus
                          className="flex-1 text-sm bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 rounded border-2 border-purple-500 focus:outline-none"
                        />
                        <button
                          onClick={handleSaveCoOwners}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingCoOwners(false);
                            setEditedCoOwners('');
                          }}
                          className="px-3 py-2 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingCoOwners(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Co-Owner
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Blocked Info */}
              {card.status === 'Blocked' && card.blockedReason && (
                <div className="col-span-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-600/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Blocked</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{card.blockedReason}</p>
                      {card.blockedBy && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Blocked by: {card.blockedBy}
                        </p>
                      )}
                      {card.blockedSince && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Blocked for {Math.floor((Date.now() - new Date(card.blockedSince).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-950/50">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Comments
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                    {card.activities?.filter(a => a.activityType === 'note').length || 0} comments
                  </span>
                </div>
              </div>

              {/* Comments Timeline */}
              <div className="space-y-4 relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-700">
                {/* Original extraction */}
                <div className="flex gap-4 relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 relative z-10">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">AI Extracted from Meeting</span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(new Date(card.createdAt))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{card.context || card.summary}</p>
                    {card.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">📍 Transcript: {card.timestamp}</p>
                    )}
                  </div>
                </div>

                {/* User comments only */}
                {card.activities && card.activities.filter(a => a.activityType === 'note').length > 0 ? (
                  card.activities.filter(a => a.activityType === 'note').map((activity) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                        activity.activityType === 'note' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}>
                        {activity.activityType === 'note' && <MessageSquare className="w-5 h-5 text-white" />}
                        {activity.activityType === 'status_change' && <Tag className="w-5 h-5 text-white" />}
                        {activity.activityType === 'attachment' && <Paperclip className="w-5 h-5 text-white" />}
                        {activity.activityType === 'edit' && <Edit3 className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className={`rounded-lg p-4 ${
                          activity.activityType === 'note' 
                            ? 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm' 
                            : 'bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-bold ${
                              activity.activityType === 'note' 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-purple-600 dark:text-purple-400'
                            }`}>
                              You
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateTime(new Date(activity.createdAt))}
                            </span>
                            {activity.activityType !== 'note' && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
                                {activity.activityType.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{activity.content}</p>
                          {activity.metadata && activity.activityType === 'status_change' && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                              {(() => {
                                try {
                                  const metadata = typeof activity.metadata === 'string' 
                                    ? JSON.parse(activity.metadata) 
                                    : activity.metadata;
                                  return (
                                    <>
                                      Moved from <span className="font-semibold">{metadata.oldStatus}</span> to{' '}
                                      <span className="font-semibold">{metadata.newStatus}</span>
                                    </>
                                  );
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first to add a note!</p>
                  </div>
                )}

                {/* AI Summary (if completed) */}
                {card.status === 'Done' && card.aiSummary && (
                  <div className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 relative z-10">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 pb-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-600/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">AI Summary</span>
                        <span className="text-xs text-gray-500">
                          {card.aiSummaryCreatedAt && formatDateTime(new Date(card.aiSummaryCreatedAt))}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{card.aiSummary}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Message Generator Section */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-950/50">
              <div className="pt-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        AI Message Generator
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
                      Copy & Paste Ready
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generate contextual messages for Slack or email based on card status, priority, and situation.
                  </p>

                  {/* Message Type Buttons */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.type}
                          onClick={() => generateMessage(suggestion.type)}
                          disabled={isGenerating}
                          className={`px-3 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${getColorClass(suggestion.color)} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span>{suggestion.icon}</span>
                          <span>{suggestion.label}</span>
                        </button>
                      ))}
                      
                      {/* Default Follow-up button if no suggestions */}
                      {suggestions.length === 0 && (
                        <button
                          onClick={() => generateMessage('follow-up')}
                          disabled={isGenerating}
                          className={`px-3 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${getColorClass('blue')} disabled:opacity-50`}
                        >
                          <span>💬</span>
                          <span>Generate Follow-up</span>
                        </button>
                      )}
                    </div>

                    {/* Generated Message Display */}
                    {generatedMessage && (
                      <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                          {/* Header with copy button */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                              <span className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wide">
                                Generated Message
                              </span>
                            </div>
                            <button
                              onClick={copyMessage}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all font-medium text-purple-700 dark:text-purple-300 shadow-sm"
                            >
                              {messageCopied ? (
                                <>
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          {/* Message Content */}
                          <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-purple-100 dark:border-purple-800">
                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                              {generatedMessage}
                            </p>
                          </div>
                          
                          {/* Footer */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400">
                              <Sparkles className="h-3 w-3" />
                              <span>AI-generated • Ready for Slack or Email</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {isGenerating && (
                      <div className="flex items-center justify-center gap-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Generating your message...
                        </span>
                      </div>
                    )}

                    {/* Empty State - First Time */}
                    {!generatedMessage && !isGenerating && (
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                        <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click a button above to generate a contextual message
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Messages are tailored to card type, priority, and current status
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-2">
                      <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                          💡 Pro Tip
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          Messages adapt based on: card type (Action, Decision, etc.), priority (High, Urgent), 
                          status (overdue, due today), and assigned owner. Perfect for quick follow-ups!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Section - Moved to end */}
            {card.activities && card.activities.filter(a => a.activityType !== 'note').length > 0 && (
              <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-950/50 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    Activity
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                      {card.activities.filter(a => a.activityType !== 'note').length} activities
                    </span>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-4 relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-700">
                  {card.activities.filter(a => a.activityType !== 'note').map((activity) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 relative z-10">
                        {activity.activityType === 'status_change' && <Tag className="w-5 h-5 text-white" />}
                        {activity.activityType === 'attachment' && <Paperclip className="w-5 h-5 text-white" />}
                        {activity.activityType === 'edit' && <Edit3 className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="rounded-lg p-4 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              You
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateTime(new Date(activity.createdAt))}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
                              {activity.activityType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{activity.content}</p>
                          {activity.metadata && activity.activityType === 'status_change' && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                              {(() => {
                                try {
                                  const metadata = typeof activity.metadata === 'string' 
                                    ? JSON.parse(activity.metadata) 
                                    : activity.metadata;
                                  return (
                                    <>
                                      Moved from <span className="font-semibold">{metadata.oldStatus}</span> to{' '}
                                      <span className="font-semibold">{metadata.newStatus}</span>
                                    </>
                                  );
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* Add Comment Section - Now inside scrollable area */}
              <div className="p-6 border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            {card.status !== 'Done' ? (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Add a comment
                </h4>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write a comment, update, or note..."
                      rows={3}
                      className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono border border-gray-300 dark:border-slate-600">Enter</kbd> to send
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDelete}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Card
                        </button>
                        <button
                          onClick={handleAddNote}
                          disabled={!noteText.trim()}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors font-semibold text-sm shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {!card.aiSummary ? (
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
                  >
                    <Sparkles className={`w-5 h-5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                    {isGeneratingSummary ? 'Generating Summary...' : 'Generate AI Summary'}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      ✅ This card has been completed with an AI summary
                    </p>
                    <button
                      onClick={handleDelete}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 mx-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Card
                    </button>
                  </div>
                )}
              </>
            )}
              </div>
          </div>
        </div>
      </div>
    </>
  );
}

