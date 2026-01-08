'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useMeetingsStore } from '@/store/meetings';
import { formatDateTime } from '@/lib/utils';
import { Loader2, FolderKanban, Calendar, FileText, Trash2, Link2, Repeat, Link as LinkIcon } from 'lucide-react';

export default function BoardsPage() {
  const router = useRouter();
  const { meetings, isLoading, fetchMeetings, deleteBoard } = useMeetingsStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Group meetings by series
  const groupedMeetings = meetings.reduce((acc, meeting) => {
    const key = meeting.isRecurring && meeting.seriesId ? meeting.seriesId : meeting.id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(meeting);
    return acc;
  }, {} as Record<string, typeof meetings>);

  // Sort meetings within each group by seriesNumber
  Object.keys(groupedMeetings).forEach(key => {
    groupedMeetings[key].sort((a, b) => (a.seriesNumber || 0) - (b.seriesNumber || 0));
  });

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation(); // Prevent navigation to board
    
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteBoard(id);
    } catch (error) {
      alert('Failed to delete board. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      <Sidebar />
      
      <div className="flex-1 min-h-screen transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                My Boards
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                View and manage all your meeting boards
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-200 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                <FolderKanban className="w-10 h-10 text-gray-400 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No boards yet</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6">Create your first board to get started</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30"
              >
                Create New Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(groupedMeetings).map(([groupKey, groupMeetings]) => {
                const isSeriesGroup = groupMeetings.length > 1 && groupMeetings[0].isRecurring;
                const isExpanded = expandedSeries.has(groupKey);
                const topMeeting = groupMeetings[groupMeetings.length - 1]; // Show most recent on top
                
                if (!isSeriesGroup) {
                  // Single meeting - render normally
                  const meeting = groupMeetings[0];
                const isPartOfSeries = meeting.isRecurring && meeting.seriesId;
                const hasNext = meeting.nextMeetingId;
                const hasPrevious = meeting.previousMeetingId;
                
                return (
                  <div
                    key={meeting.id}
                    className={`relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 border rounded-xl p-6 hover:shadow-xl transition-all duration-200 group ${
                      isPartOfSeries 
                        ? 'border-purple-500/50 dark:border-purple-500/30 hover:border-purple-500 hover:shadow-purple-500/20' 
                        : 'border-gray-200 dark:border-slate-700 hover:border-blue-500/50 hover:shadow-blue-500/10'
                    }`}
                  >
                    {/* Series Badge - Top Right */}
                    {isPartOfSeries && (
                      <div className="absolute -top-2 -right-2 flex flex-col items-center gap-1 z-20">
                        <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          #{meeting.seriesNumber || 1}
                        </div>
                        {/* Connection indicators */}
                        {hasPrevious && (
                          <div className="w-0.5 h-3 bg-gradient-to-b from-purple-500 to-transparent" />
                        )}
                      </div>
                    )}

                    {/* Previous Meeting Connection Line */}
                    {hasPrevious && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex flex-col items-center">
                          <Link2 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                          <div className="w-0.5 h-4 bg-gradient-to-b from-purple-500 to-transparent" />
                        </div>
                      </div>
                    )}

                    {/* Delete Button - moved to bottom right */}
                    <button
                      onClick={(e) => handleDelete(e, meeting.id, meeting.title)}
                      disabled={deletingId === meeting.id}
                      className="absolute bottom-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      title="Delete board"
                    >
                      {deletingId === meeting.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => router.push(`/board/${meeting.id}`)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                          isPartOfSeries 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-3 py-1 border rounded-lg text-xs font-medium ${
                          isPartOfSeries
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {meeting.cards.length} items
                        </span>
                      </div>

                      {/* Series Connection Indicator */}
                      {isPartOfSeries && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-purple-600 dark:text-purple-400">
                          <Repeat className="w-3.5 h-3.5" />
                          <span className="font-medium">Recurring Meeting Series</span>
                        </div>
                      )}

                      <h3 className={`text-lg font-semibold mb-2 transition-colors line-clamp-2 ${
                        isPartOfSeries 
                          ? 'text-gray-900 dark:text-white group-hover:text-purple-400' 
                          : 'text-gray-900 dark:text-white group-hover:text-blue-400'
                      }`}>
                        {meeting.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {meeting.summary}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDateTime(new Date(meeting.createdAt))}</span>
                        </div>
                        {/* Spacer for delete button */}
                        <div className="w-10"></div>
                      </div>
                    </button>

                    {/* Next Meeting Connection Line */}
                    {hasNext && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-gradient-to-b from-transparent to-purple-500" />
                          <Link2 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                        </div>
                      </div>
                    )}
                  </div>
                );
                }
                
                // Series group - render as stacked deck
                return (
                  <div key={groupKey} className="relative">
                    {/* Card Stack - showing depth with multiple layers */}
                    <div className="relative">
                      {/* Stack depth indicators (cards in background) */}
                      {groupMeetings.slice(0, -1).map((_, index) => {
                        const offset = (groupMeetings.length - index - 1) * 4;
                        const scale = 1 - (groupMeetings.length - index - 1) * 0.02;
                        return (
                          <div
                            key={index}
                            className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-2 border-purple-500/30 rounded-xl"
                            style={{
                              transform: `translateY(-${offset}px) scale(${scale})`,
                              zIndex: index,
                            }}
                          />
                        );
                      })}
                      
                      {/* Top card (most recent meeting) */}
                      <div
                        className={`relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer group ${
                          isExpanded
                            ? 'border-purple-600 shadow-2xl shadow-purple-500/40 scale-105'
                            : 'border-purple-500/50 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20'
                        }`}
                        style={{ zIndex: groupMeetings.length }}
                        onClick={() => toggleSeries(groupKey)}
                      >
                        {/* Series Stack Badge - Top Right */}
                        <div className="absolute -top-2 -right-2 flex flex-col items-center gap-1 z-20">
                          <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5">
                            <Repeat className="w-3.5 h-3.5" />
                            <span>{groupMeetings.length} Meetings</span>
                          </div>
                        </div>

                        {/* Delete Button - moved to bottom right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(e, topMeeting.id, topMeeting.title);
                          }}
                          disabled={deletingId === topMeeting.id}
                          className="absolute bottom-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                          title="Delete board"
                        >
                          {deletingId === topMeeting.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center transform transition-transform">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium">
                            {topMeeting.cards.length} items
                          </span>
                        </div>

                        {/* Recurring Series Label */}
                        <div className="flex items-center gap-2 mb-2 text-xs text-purple-600 dark:text-purple-400">
                          <Repeat className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            {isExpanded ? 'Click to collapse' : 'Click to expand series'}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors line-clamp-2">
                          {topMeeting.title}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {topMeeting.summary}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Latest: {formatDateTime(new Date(topMeeting.createdAt))}</span>
                          </div>
                          <div className="w-10"></div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Cards - Show all meetings in the series */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-4">
                        {groupMeetings.map((meeting, index) => (
                          <div
                            key={meeting.id}
                            className="bg-white dark:bg-slate-800/50 border border-purple-300 dark:border-purple-700/50 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/board/${meeting.id}`);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Series Number Badge */}
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                #{meeting.seriesNumber || index + 1}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {meeting.title}
                                  </h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {meeting.cards.length}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                                  {meeting.summary}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDateTime(new Date(meeting.createdAt))}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

