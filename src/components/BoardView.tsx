'use client';

import { useState } from 'react';
import { Meeting, CardStatus } from '@/types/meeting';
import { useMeetingsStore } from '@/store/meetings';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CardItem from './CardItem';
import { Download, ArrowLeft } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface BoardViewProps {
  meeting: Meeting;
  onBack?: () => void;
}

const columns: CardStatus[] = ['To Do', 'In Progress', 'Done'];

function DroppableColumn({ 
  status, 
  children 
}: { 
  status: CardStatus; 
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: status });
  
  return (
    <div ref={setNodeRef} className="flex-1 space-y-3" style={{ minHeight: '100px' }}>
      {children}
    </div>
  );
}

export default function BoardView({ meeting, onBack }: BoardViewProps) {
  const { updateCardStatus } = useMeetingsStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const cardId = active.id as string;
    const card = meeting.cards.find((c) => c.id === cardId);
    if (!card) return;

    // Determine the new status
    let newStatus: CardStatus = card.status as CardStatus;
    
    // Check if dropped over a column container
    if (columns.includes(over.id as CardStatus)) {
      newStatus = over.id as CardStatus;
    } else {
      // Dropped over another card - find which column it's in
      const overCard = meeting.cards.find((c) => c.id === over.id);
      if (overCard) {
        newStatus = overCard.status as CardStatus;
      }
    }

    // Only update if status changed
    if (newStatus !== card.status) {
      // Update local state
      updateCardStatus(meeting.id, cardId, newStatus);

      // Update on server
      try {
        await fetch(`/api/card/${cardId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (error) {
        console.error('Failed to update card:', error);
      }
    }
  };

  const getCardsForColumn = (status: CardStatus) => {
    return meeting.cards.filter((card) => card.status === status);
  };

  const activeCard = activeId
    ? meeting.cards.find((card) => card.id === activeId)
    : null;

  const exportAsMarkdown = () => {
    let markdown = `# ${meeting.title}\n\n`;
    markdown += `**Summary:** ${meeting.summary}\n\n`;
    markdown += `**Created:** ${formatDateTime(meeting.createdAt)}\n\n`;
    markdown += `---\n\n`;

    columns.forEach((status) => {
      const cards = getCardsForColumn(status);
      if (cards.length > 0) {
        markdown += `## ${status}\n\n`;
        cards.forEach((card) => {
          markdown += `### ${card.type}: ${card.summary}\n\n`;
          if (card.owner) markdown += `- **Owner:** ${card.owner}\n`;
          if (card.dueDate) markdown += `- **Due:** ${card.dueDate}\n`;
          if (card.timestamp) markdown += `- **Timestamp:** ${card.timestamp}\n`;
          if (card.context) markdown += `- **Context:** ${card.context}\n`;
          markdown += `\n`;
        });
      }
    });

    // Download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={exportAsMarkdown}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export as Markdown
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
        <p className="text-gray-600 mb-2">{meeting.summary}</p>
        <p className="text-sm text-gray-500">
          Created {formatDateTime(meeting.createdAt)} • {meeting.cards.length} items
        </p>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((status) => {
            const cards = getCardsForColumn(status);
            return (
              <div
                key={status}
                className="flex flex-col bg-gray-50 rounded-lg p-4 min-h-[400px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{status}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>

                {/* Drop Zone */}
                <SortableContext
                  id={status}
                  items={cards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn status={status}>
                    {cards.map((card) => (
                      <CardItem key={card.id} card={card} />
                    ))}
                  </DroppableColumn>
                </SortableContext>

                {/* Empty State */}
                {cards.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    No items
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="opacity-90">
              <CardItem card={activeCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

