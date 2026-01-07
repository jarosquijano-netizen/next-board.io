'use client';

import { MeetingCard } from '@prisma/client';
import { getTimeStatus } from '@/lib/time-utils';
import { AlertCircle, Calendar, Users, Trash2, Clock } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardType } from '@/types/meeting';

interface EisenhowerMatrixViewProps {
  cards: MeetingCard[];
  onCardClick: (card: MeetingCard) => void;
  onUpdateCard?: (cardId: string, updates: Partial<MeetingCard>) => void;
}

type Quadrant = 'do-first' | 'schedule' | 'delegate' | 'eliminate';

export function EisenhowerMatrixView({ cards, onCardClick, onUpdateCard }: EisenhowerMatrixViewProps) {
  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Handle drag end - update card priority based on quadrant
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onUpdateCard) return;

    const cardId = active.id as string;
    const targetQuadrant = over.id as Quadrant;

    // Map quadrant to priority
    const quadrantToPriority: Record<Quadrant, string> = {
      'do-first': 'urgent',
      'schedule': 'high',
      'delegate': 'medium',
      'eliminate': 'low',
    };

    await onUpdateCard(cardId, { priority: quadrantToPriority[targetQuadrant] });
  };

  // Classification logic
  const classifyCard = (card: MeetingCard): Quadrant => {
    const timeStatus = card.dueDate ? getTimeStatus(card.dueDate) : null;
    
    // Determine URGENCY
    const isUrgent = 
      card.priority === 'urgent' || 
      (timeStatus?.isOverdue) || 
      (timeStatus?.urgencyLevel === 'urgent') ||
      card.status === 'Blocked' ||
      card.type === 'Blocker';
    
    // Determine IMPORTANCE
    const isImportant = 
      card.priority === 'urgent' || 
      card.priority === 'high' ||
      card.type === 'Blocker' ||
      card.type === 'Risk' ||
      card.type === 'Decision' ||
      card.type === 'Question';
    
    // Classify into quadrant
    if (isUrgent && isImportant) return 'do-first';
    if (!isUrgent && isImportant) return 'schedule';
    if (isUrgent && !isImportant) return 'delegate';
    return 'eliminate';
  };

  // Group cards by quadrant
  const activeCards = cards.filter(c => c.status !== 'Done');
  const quadrants = {
    'do-first': activeCards.filter(c => classifyCard(c) === 'do-first'),
    'schedule': activeCards.filter(c => classifyCard(c) === 'schedule'),
    'delegate': activeCards.filter(c => classifyCard(c) === 'delegate'),
    'eliminate': activeCards.filter(c => classifyCard(c) === 'eliminate'),
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="h-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Priority Matrix</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Eisenhower Matrix: Organize by Urgency × Importance
          </p>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[600px]">
        {/* QUADRANT 1: DO FIRST (Urgent + Important) */}
        <MatrixQuadrant
          quadrantId="do-first"
          title="DO FIRST"
          subtitle="Urgent & Important"
          description="Do these immediately - they're both urgent and important"
          count={quadrants['do-first'].length}
          cards={quadrants['do-first']}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
          emptyMessage="🎉 Nothing urgent and important!"
          onCardClick={onCardClick}
        />

        {/* QUADRANT 2: SCHEDULE (Not Urgent + Important) */}
        <MatrixQuadrant
          quadrantId="schedule"
          title="SCHEDULE"
          subtitle="Important, Not Urgent"
          description="Plan time for these - they're important for long-term success"
          count={quadrants['schedule'].length}
          cards={quadrants['schedule']}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
          emptyMessage="No strategic work identified"
          onCardClick={onCardClick}
        />

        {/* QUADRANT 3: DELEGATE (Urgent + Not Important) */}
        <MatrixQuadrant
          quadrantId="delegate"
          title="DELEGATE"
          subtitle="Urgent, Less Important"
          description="Assign these to others if possible"
          count={quadrants['delegate'].length}
          cards={quadrants['delegate']}
          icon={<Users className="w-6 h-6" />}
          color="yellow"
          emptyMessage="Nothing to delegate"
          onCardClick={onCardClick}
        />

        {/* QUADRANT 4: ELIMINATE (Not Urgent + Not Important) */}
        <MatrixQuadrant
          quadrantId="eliminate"
          title="ELIMINATE"
          subtitle="Not Urgent, Not Important"
          description="Consider removing or deprioritizing these"
          count={quadrants['eliminate'].length}
          cards={quadrants['eliminate']}
          icon={<Trash2 className="w-6 h-6" />}
          color="gray"
          emptyMessage="All tasks are important!"
          onCardClick={onCardClick}
        />
      </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">How items are classified:</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <strong className="text-orange-600 dark:text-orange-400">Urgent if:</strong> Priority is urgent, overdue, blocked, or due within 24h
            </div>
            <div>
              <strong className="text-blue-600 dark:text-blue-400">Important if:</strong> High/urgent priority, or type is Blocker/Risk/Decision/Question
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

// Droppable Quadrant Wrapper
function DroppableQuadrant({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[200px] transition-colors ${
        isOver ? 'bg-blue-500/10 ring-2 ring-blue-500' : ''
      }`}
    >
      {children}
    </div>
  );
}

// Matrix Quadrant Component
interface MatrixQuadrantProps {
  quadrantId: Quadrant;
  title: string;
  subtitle: string;
  description: string;
  count: number;
  cards: MeetingCard[];
  icon: React.ReactNode;
  color: 'red' | 'blue' | 'yellow' | 'gray';
  emptyMessage: string;
  onCardClick: (card: MeetingCard) => void;
}

function MatrixQuadrant({
  quadrantId,
  title,
  subtitle,
  description,
  count,
  cards,
  icon,
  color,
  emptyMessage,
  onCardClick,
}: MatrixQuadrantProps) {
  const colorClasses = {
    red: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-400 dark:border-red-500',
      iconBg: 'bg-red-600',
      text: 'text-red-700 dark:text-red-400',
      countBg: 'bg-red-600',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-400 dark:border-blue-500',
      iconBg: 'bg-blue-600',
      text: 'text-blue-700 dark:text-blue-400',
      countBg: 'bg-blue-600',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-400 dark:border-yellow-500',
      iconBg: 'bg-yellow-600',
      text: 'text-yellow-700 dark:text-yellow-400',
      countBg: 'bg-yellow-600',
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      border: 'border-gray-400 dark:border-gray-600',
      iconBg: 'bg-gray-600',
      text: 'text-gray-700 dark:text-gray-400',
      countBg: 'bg-gray-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 overflow-y-auto max-h-[600px]`}>
      {/* Header - Sticky */}
      <div className={`sticky top-0 -mx-4 -mt-4 px-4 py-3 ${colors.bg} backdrop-blur border-b ${colors.border} rounded-t-xl mb-4 z-10`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-full ${colors.iconBg} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold ${colors.text} text-lg`}>{title}</h3>
            <p className={`text-xs ${colors.text} opacity-75`}>{subtitle}</p>
          </div>
          <span className={`text-2xl font-black text-white px-3 py-1 rounded-lg ${colors.countBg}`}>
            {count}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Cards */}
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <DroppableQuadrant id={quadrantId}>
          <div className="space-y-3">
            {cards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">{emptyMessage}</p>
              </div>
            ) : (
              cards.map(card => (
                <MatrixCard 
                  key={card.id} 
                  card={card} 
                  onClick={() => onCardClick(card)} 
                />
              ))
            )}
          </div>
        </DroppableQuadrant>
      </SortableContext>
    </div>
  );
}

// Draggable Card for Matrix
function MatrixCard({ card, onClick }: { card: MeetingCard; onClick: () => void }) {
  const timeStatus = card.dueDate ? getTimeStatus(card.dueDate) : null;
  
  // Drag and drop
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg p-3 cursor-move transition-all hover:scale-[1.02] border border-gray-200 dark:border-slate-700"
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">
          {card.type}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-purple-600 text-white font-semibold">
          {card.priority}
        </span>
      </div>
      
      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">{card.summary}</h4>
      
      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        {card.owner && <span>👤 {card.owner}</span>}
        {timeStatus && (
          <span className={timeStatus.displayColor}>
            {timeStatus.displayText}
          </span>
        )}
      </div>
    </div>
  );
}

