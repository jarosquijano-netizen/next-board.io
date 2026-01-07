'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import { PeopleFilter } from '@/components/PeopleFilter';
import LivingCard from '@/components/LivingCard';
import CalendarView from '@/components/CalendarView';
import TimelineDashboard from '@/components/TimelineDashboard';
import { CardDetailModal } from '@/components/CardDetailModal';
import { ViewSelector } from '@/components/ViewSelector';
import { MyFocusTodayView } from '@/components/views/MyFocusTodayView';
import { EisenhowerMatrixView } from '@/components/views/EisenhowerMatrixView';
import { MeetingComparisonView } from '@/components/views/MeetingComparisonView';
import { TodoIcon, InProgressIcon, BlockedIcon, DoneIcon } from '@/components/ColumnIcons';
import { useMeetingsStore } from '@/store/meetings';
import { CardType, MeetingCard, CardStatus } from '@/types/meeting';
import { ViewType } from '@/types/view-types';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  rectIntersection,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  Loader2, ArrowLeft, Download, Plus, Calendar, FileText, LayoutGrid, ChevronUp, ChevronDown, PanelTop, PanelRight
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Smart sorting for To Do column - prioritize critical and time-sensitive items
function sortTodoCards(cards: MeetingCard[]): MeetingCard[] {
  return [...cards].sort((a, b) => {
    // Priority weights
    const priorityWeight: { [key: string]: number } = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    
    const aPriority = priorityWeight[a.priority || 'medium'] || 2;
    const bPriority = priorityWeight[b.priority || 'medium'] || 2;
    
    // 1. Sort by priority first (urgent items at top)
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // 2. Then by overdue status
    const aOverdue = a.isOverdue || false;
    const bOverdue = b.isOverdue || false;
    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1; // Overdue items first
    }
    
    // 3. Then by days until due (sooner items first)
    const aDays = a.daysUntilDue;
    const bDays = b.daysUntilDue;
    
    // If both have due dates
    if (aDays !== null && aDays !== undefined && bDays !== null && bDays !== undefined) {
      return aDays - bDays; // Closer due dates first
    }
    
    // If only one has a due date, prioritize it
    if (aDays !== null && aDays !== undefined) return -1;
    if (bDays !== null && bDays !== undefined) return 1;
    
    // 4. Finally, maintain original order for items without due dates
    return 0;
  });
}

// 4-Column Meeting Action Items System
const COLUMNS: { id: CardStatus; label: string; color: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'To Do', label: 'To Do', color: 'from-blue-600 to-blue-500', icon: TodoIcon, description: 'Procrastination station' },
  { id: 'In Progress', label: 'In Progress', color: 'from-purple-600 to-purple-500', icon: InProgressIcon, description: 'Actually doing stuff' },
  { id: 'Blocked', label: 'Blocked', color: 'from-red-600 to-red-500', icon: BlockedIcon, description: "Someone else's problem" },
  { id: 'Done', label: 'Done', color: 'from-emerald-600 to-emerald-500', icon: DoneIcon, description: 'Victory lap time' },
];

// Droppable Column Component
function DroppableColumn({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'column',
      status: id
    }
  });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 space-y-3 min-h-[300px] transition-all rounded-xl p-3 relative z-[2] ${
        isOver 
          ? 'bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-500 ring-inset shadow-xl' 
          : 'bg-transparent'
      }`}
    >
      {children}
    </div>
  );
}

export default function BoardPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentMeeting, isLoading, fetchMeeting, updateCardStatus, updateCard } = useMeetingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<CardType[]>(['Action', 'Decision', 'Follow-up', 'Update']);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [viewMode, setViewMode] = useState<ViewType>('focus'); // Default to Focus view
  const [selectedCard, setSelectedCard] = useState<MeetingCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchFiltersVisible, setIsSearchFiltersVisible] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'top' | 'side'>('top'); // Layout toggle
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [hasComparison, setHasComparison] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    fetchMeeting(id);
  }, [id, fetchMeeting]);

  // Fetch comparison data
  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await fetch(`/api/meeting/${id}/comparison`);
        const data = await response.json();
        
        if (data.hasComparison) {
          setHasComparison(true);
          setComparisonData(data.comparison);
        } else {
          setHasComparison(false);
          setComparisonData(null);
        }
      } catch (error) {
        console.error('Failed to fetch comparison:', error);
        setHasComparison(false);
      }
    };

    fetchComparison();
  }, [id]);

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            setViewMode('kanban');
            e.preventDefault();
            break;
          case 'c':
            setViewMode('calendar');
            e.preventDefault();
            break;
          case 'f':
            setViewMode('focus');
            e.preventDefault();
            break;
          case 'm':
            setViewMode('matrix');
            e.preventDefault();
            break;
          case 'p':
            if (hasComparison) {
              setViewMode('comparison');
              e.preventDefault();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasComparison]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !currentMeeting) return;

    const cardId = active.id as string;
    
    // Check if we dropped on a column (using the data we added to DroppableColumn)
    const overData = over.data.current as { type?: string; status?: string };
    const isColumn = overData?.type === 'column';
    
    // Check if over.id is a valid column status
    const validStatuses: CardStatus[] = ['To Do', 'In Progress', 'Blocked', 'Done'];
    const newStatus = validStatuses.includes(over.id as CardStatus) 
      ? (over.id as CardStatus)
      : null;

    console.log('🎯 Drag End:', {
      cardId,
      newStatus,
      overId: over.id,
      activeId: active.id,
      isValidColumn: newStatus !== null,
      isColumn,
      overData,
    });

    // If dropped on invalid target (e.g., another card), ignore
    if (!newStatus || !isColumn) {
      console.warn('⚠️ Invalid drop target, ignoring');
      return;
    }

    // Find the card being dragged
    const draggedCard = currentMeeting.cards.find(c => c.id === cardId);
    console.log('📋 Dragged Card:', { 
      id: draggedCard?.id, 
      currentStatus: draggedCard?.status,
      newStatus 
    });
    
    // If card is already in this status, skip
    if (draggedCard?.status === newStatus) {
      console.log('ℹ️ Card already in this status, skipping');
      return;
    }

    console.log('✅ Updating card status from', draggedCard?.status, 'to', newStatus);
    await updateCardStatus(currentMeeting.id, cardId, newStatus);
    
    // Refresh the board to ensure consistency
    console.log('🔄 Refreshing board data...');
    await fetchMeeting(currentMeeting.id);
  };

  const handleUpdateCard = async (cardId: string, updates: Partial<MeetingCard>) => {
    if (!currentMeeting) return;
    await updateCard(currentMeeting.id, cardId, updates);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentMeeting) return;
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const response = await fetch(`/api/card/${cardId}`, { method: 'DELETE' });
      if (response.ok) {
        // Refresh the meeting data
        await fetchMeeting(currentMeeting.id);
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const handleAddNote = async (cardId: string, content: string) => {
    if (!currentMeeting) return;
    
    try {
      const response = await fetch(`/api/cards/${cardId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, activityType: 'note' }),
      });
      
      if (response.ok) {
        // Refresh the meeting data to get the new activity
        await fetchMeeting(currentMeeting.id);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const handleGenerateSummary = async (cardId: string) => {
    if (!currentMeeting) return;
    
    try {
      const response = await fetch(`/api/cards/${cardId}/generate-summary`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the meeting data to get the new summary
        await fetchMeeting(currentMeeting.id);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw error;
    }
  };

  const handleCardClick = (card: MeetingCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleModalUpdate = async (updates: Partial<MeetingCard>) => {
    if (!selectedCard || !currentMeeting) return;
    await handleUpdateCard(selectedCard.id, updates);
    // Refresh to get updated card data
    await fetchMeeting(currentMeeting.id);
    // Update selected card with new data
    const updatedCard = currentMeeting.cards.find(c => c.id === selectedCard.id);
    if (updatedCard) setSelectedCard(updatedCard);
  };

  const handleModalAddNote = async (content: string) => {
    if (!selectedCard || !currentMeeting) return;
    
    try {
      await handleAddNote(selectedCard.id, content);
      // Refresh to get updated card data
      await fetchMeeting(currentMeeting.id);
      
      // Fetch the latest card data to update the modal
      const response = await fetch(`/api/board/${currentMeeting.id}`);
      if (response.ok) {
        const boardData = await response.json();
        const updatedCard = boardData.cards.find((c: MeetingCard) => c.id === selectedCard.id);
        if (updatedCard) {
          console.log('✅ Updated card with new activities:', updatedCard.activities);
          setSelectedCard(updatedCard);
        }
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleModalGenerateSummary = async () => {
    if (!selectedCard) return;
    await handleGenerateSummary(selectedCard.id);
    // Refresh to get updated card data
    if (currentMeeting) {
      await fetchMeeting(currentMeeting.id);
      const updatedCard = currentMeeting.cards.find(c => c.id === selectedCard.id);
      if (updatedCard) setSelectedCard(updatedCard);
    }
  };

  const handleModalDelete = async () => {
    if (!selectedCard) return;
    await handleDeleteCard(selectedCard.id);
    handleCloseModal();
  };

  const handleExportMarkdown = () => {
    if (!currentMeeting) return;

    let markdown = `# ${currentMeeting.title}\n\n`;
    markdown += `**Created:** ${formatDateTime(new Date(currentMeeting.createdAt))}\n\n`;
    markdown += `## Summary\n\n${currentMeeting.summary}\n\n`;

    COLUMNS.forEach(column => {
      const cards = getFilteredCards().filter(card => card.status === column.id);
      if (cards.length > 0) {
        markdown += `## ${column.label}\n\n`;
        cards.forEach(card => {
          markdown += `### ${card.type}: ${card.summary}\n`;
          if (card.owner) markdown += `- **Owner:** ${card.owner}\n`;
          if (card.dueDate) markdown += `- **Due Date:** ${card.dueDate}\n`;
          if (card.context) markdown += `- **Context:** ${card.context}\n`;
          markdown += `\n`;
        });
      }
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMeeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilteredCards = () => {
    if (!currentMeeting) return [];
    
    return currentMeeting.cards.filter(card => {
      const matchesSearch = card.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (card.owner?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (card.context?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(card.type as CardType);
      
      // People filter - check if card involves any selected person
      const matchesPeople = selectedPeople.length === 0 || selectedPeople.some(person =>
        card.owner === person ||
        card.involvedPeople?.includes(person) ||
        card.primaryContact === person ||
        card.additionalContacts?.includes(person)
      );
      
      return matchesSearch && matchesType && matchesPeople;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Sidebar />
        <div className="ml-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <Sidebar />
        <div className="ml-64 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600 dark:text-slate-400 mb-4">Meeting not found</p>
            <button
              onClick={() => router.push('/boards')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              Back to Boards
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredCards = getFilteredCards();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      
      <div className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <button
                  onClick={() => router.push('/boards')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors touch-manipulation active:scale-95 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {currentMeeting.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{formatDateTime(new Date(currentMeeting.createdAt))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{currentMeeting.cards.length} total items</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm sm:text-base font-medium transition-colors touch-manipulation active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export as Markdown</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>

            {/* Summary */}
            {currentMeeting.summary && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-xl">
                <p className="text-sm text-gray-700 dark:text-slate-300">{currentMeeting.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* View Selector & Toolbar */}
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
            {/* View Selector & Layout Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
              <ViewSelector currentView={viewMode} onChange={setViewMode} hasComparison={hasComparison} />
              
              {/* Layout Toggle - Only show for Kanban view */}
              {viewMode === 'kanban' && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs text-gray-600 dark:text-gray-400 font-medium">Layout:</span>
                  <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <button
                      onClick={() => setLayoutMode('top')}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-manipulation active:scale-95 ${
                        layoutMode === 'top'
                          ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title="Filters at Top"
                    >
                      <PanelTop className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Top</span>
                    </button>
                    <button
                      onClick={() => setLayoutMode('side')}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-manipulation active:scale-95 ${
                        layoutMode === 'side'
                          ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title="Filters in Side Panel"
                    >
                      <PanelRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Side</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Search & Filter - Only show for Top layout OR Calendar view */}
            {((viewMode === 'kanban' && layoutMode === 'top') || viewMode === 'calendar') && (
              <div>
                {/* Toggle Button */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setIsSearchFiltersVisible(!isSearchFiltersVisible)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {isSearchFiltersVisible ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Search & Filters
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show Search & Filters
                      </>
                    )}
                  </button>
                </div>

                {/* Collapsible Search & Filter Section */}
                {isSearchFiltersVisible && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <SearchBar onSearch={setSearchQuery} />
                      </div>
                      <FilterBar selectedTypes={selectedTypes} onFilterChange={setSelectedTypes} />
                    </div>
                    
                    {/* People Filter */}
                    {currentMeeting && (
                      <PeopleFilter
                        cards={currentMeeting.cards}
                        selectedPeople={selectedPeople}
                        onPeopleChange={setSelectedPeople}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          {/* Timeline Dashboard - Always at top for Kanban view */}
          {viewMode === 'kanban' && (
            <TimelineDashboard 
              cards={filteredCards} 
              allCards={currentMeeting.cards} 
            />
          )}

          {/* My Focus Today View */}
          {viewMode === 'focus' && (
            <MyFocusTodayView 
              cards={currentMeeting.cards as any} 
              onCardClick={handleCardClick as any} 
            />
          )}

          {/* Eisenhower Matrix View */}
          {viewMode === 'matrix' && (
            <EisenhowerMatrixView 
              cards={currentMeeting.cards as any} 
              onCardClick={handleCardClick as any}
              onUpdateCard={handleUpdateCard as any}
            />
          )}

          {/* Meeting Comparison View */}
          {viewMode === 'comparison' && comparisonData && (
            <MeetingComparisonView 
              currentMeetingId={id}
              comparisonData={comparisonData}
            />
          )}

          {/* Kanban Board View - Side Layout */}
          {viewMode === 'kanban' && layoutMode === 'side' && (
            <div className="flex gap-6">
              {/* Kanban Board - Left Side (Main Area) */}
              <div className="flex-1 min-w-0">
                <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {COLUMNS.map((column) => {
                      let columnCards = filteredCards.filter(card => card.status === column.id);
                      
                      // Apply smart sorting to To Do column
                      if (column.id === 'To Do') {
                        columnCards = sortTodoCards(columnCards);
                      }
                      
                      return (
                        <div key={column.id} className="flex flex-col relative">
                          {/* Column Header - Sticky */}
                          <div className={`sticky top-40 z-[1] bg-gradient-to-r ${column.color} rounded-lg p-3 mb-3 shadow-lg backdrop-blur-sm`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5">
                                <column.icon className="w-5 h-5 text-white" />
                                <h3 className="text-base font-semibold text-white">
                                  {column.label}
                                </h3>
                              </div>
                              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-medium text-white">
                                {columnCards.length}
                              </span>
                            </div>
                            <p className="text-xs text-white/70 ml-7">{column.description}</p>
                          </div>

                          {/* Cards */}
                          <SortableContext items={columnCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            <DroppableColumn id={column.id}>
                              {columnCards.map((card) => (
                                <LivingCard
                                  key={card.id}
                                  card={card}
                                  onUpdate={handleUpdateCard}
                                  onDelete={handleDeleteCard}
                                  onAddNote={(content) => handleAddNote(card.id, content)}
                                  onGenerateSummary={() => handleGenerateSummary(card.id)}
                                  onClick={() => handleCardClick(card)}
                                />
                              ))}

                              {columnCards.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-slate-900/30 border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-lg">
                                  <p className="text-xs text-gray-500 dark:text-slate-500">No cards</p>
                                </div>
                              )}
                            </DroppableColumn>
                          </SortableContext>
                        </div>
                      );
                    })}
                  </div>
                </DndContext>
              </div>

              {/* Side Panel - Right Side (Filters Only) */}
              <div className="w-80 flex-shrink-0 space-y-4">
                {/* Search Bar */}
                <div>
                  <SearchBar onSearch={setSearchQuery} />
                </div>

                {/* Filter Bar - Grid Layout */}
                <div>
                  <FilterBar selectedTypes={selectedTypes} onFilterChange={setSelectedTypes} variant="grid" />
                </div>

                {/* People Filter - Vertical Layout */}
                {currentMeeting && (
                  <PeopleFilter
                    cards={currentMeeting.cards}
                    selectedPeople={selectedPeople}
                    onPeopleChange={setSelectedPeople}
                    variant="vertical"
                  />
                )}
              </div>
            </div>
          )}

          {/* Kanban Board View - Top Layout */}
          {viewMode === 'kanban' && layoutMode === 'top' && (
                <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
                  <div className="overflow-x-auto scrollbar-hide pb-4 lg:pb-0">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 min-w-[800px] lg:min-w-0 px-4 sm:px-6 lg:px-8">
                    {COLUMNS.map((column) => {
                      let columnCards = filteredCards.filter(card => card.status === column.id);
                      
                      // Apply smart sorting to To Do column
                      if (column.id === 'To Do') {
                        columnCards = sortTodoCards(columnCards);
                      }
                      
                      return (
                        <div key={column.id} className="flex flex-col">
                          {/* Column Header - Not sticky in Top layout to avoid overlay issues */}
                          <div className={`bg-gradient-to-r ${column.color} rounded-lg p-3 mb-3 shadow-lg backdrop-blur-sm`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5">
                                <column.icon className="w-5 h-5 text-white" />
                                <h3 className="text-base font-semibold text-white">
                                  {column.label}
                                </h3>
                              </div>
                              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-medium text-white">
                                {columnCards.length}
                              </span>
                            </div>
                            <p className="text-xs text-white/70 ml-7">{column.description}</p>
                          </div>

                          {/* Cards */}
                          <SortableContext items={columnCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            <DroppableColumn id={column.id}>
                              {columnCards.map((card) => (
                                <LivingCard
                                  key={card.id}
                                  card={card}
                                  onUpdate={handleUpdateCard}
                                  onDelete={handleDeleteCard}
                                  onAddNote={(content) => handleAddNote(card.id, content)}
                                  onGenerateSummary={() => handleGenerateSummary(card.id)}
                                  onClick={() => handleCardClick(card)}
                                />
                              ))}

                              {columnCards.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-slate-900/30 border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-lg">
                                  <p className="text-xs text-gray-500 dark:text-slate-500">No cards</p>
                                </div>
                              )}
                            </DroppableColumn>
                          </SortableContext>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </DndContext>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <CalendarView 
              cards={filteredCards} 
              onCardClick={handleCardClick} 
            />
          )}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleModalUpdate}
          onAddNote={handleModalAddNote}
          onGenerateSummary={handleModalGenerateSummary}
          onDelete={handleModalDelete}
        />
      )}
    </div>
  );
}

