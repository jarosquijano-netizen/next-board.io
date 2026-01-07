'use client';

import { MeetingCard, CardType } from '@/types/meeting';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, User, Calendar, Clock, MessageSquare } from 'lucide-react';

interface CardItemProps {
  card: MeetingCard;
}

const cardTypeColors: Record<CardType, string> = {
  Action: 'bg-blue-100 text-blue-800 border-blue-200',
  Decision: 'bg-green-100 text-green-800 border-green-200',
  'Follow-up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Update: 'bg-purple-100 text-purple-800 border-purple-200',
  Blocker: 'bg-red-100 text-red-800 border-red-200',
  Idea: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Risk: 'bg-orange-100 text-orange-800 border-orange-200',
  Question: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export default function CardItem({ card }: CardItemProps) {
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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
    >
      {/* Drag Handle & Type Badge */}
      <div className="flex items-start justify-between mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            cardTypeColors[card.type as CardType] || 'bg-gray-100 text-gray-800 border-gray-200'
          }`}
        >
          {card.type}
        </span>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-gray-100 rounded p-1 -mr-2 -mt-1"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-900 font-medium mb-3 leading-relaxed">
        {card.summary}
      </p>

      {/* Metadata */}
      <div className="space-y-2">
        {card.owner && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <User className="w-3.5 h-3.5" />
            <span>{card.owner}</span>
          </div>
        )}

        {card.dueDate && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            <span>{card.dueDate}</span>
          </div>
        )}

        {card.timestamp && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{card.timestamp}</span>
          </div>
        )}

        {card.context && (
          <div className="flex items-start gap-2 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{card.context}</span>
          </div>
        )}
      </div>
    </div>
  );
}







