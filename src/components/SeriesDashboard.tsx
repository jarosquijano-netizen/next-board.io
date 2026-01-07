'use client';

import { format } from 'date-fns';
import { Calendar, TrendingUp, BarChart3, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface SeriesOverview {
  series: {
    id: string;
    title: string;
    recurrence: string;
    totalMeetings: number;
    avgCompletionRate: number | null;
    avgItemsPerMeeting: number | null;
    nextMeetingDate: Date | null;
  };
  meetings: Array<{
    id: string;
    number: number | null;
    date: Date;
    totalItems: number;
    completed: number;
    carriedOver: number;
    blockers: number;
  }>;
}

export function SeriesDashboard({ data }: { data: SeriesOverview }) {
  const { series, meetings } = data;
  const latestMeeting = meetings[0];

  return (
    <div className="space-y-6">
      {/* Series Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-500 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{series.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {series.recurrence} recurring series • {series.totalMeetings} meetings
            </p>
          </div>
          {series.nextMeetingDate && (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Meeting</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {format(new Date(series.nextMeetingDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>

        {/* Series Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {series.avgCompletionRate?.toFixed(0) || 0}%
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Items</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {series.avgItemsPerMeeting?.toFixed(0) || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Meetings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {series.totalMeetings}
            </p>
          </div>
        </div>
      </div>

      {/* Meeting History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-500" />
          Meeting History
        </h3>

        <div className="space-y-3">
          {meetings.map((meeting, idx) => {
            const completionRate = meeting.totalItems > 0 
              ? (meeting.completed / meeting.totalItems) * 100 
              : 0;
            const isLatest = idx === 0;

            return (
              <Link
                key={meeting.id}
                href={`/board/${meeting.id}`}
                className={`block p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                  isLatest
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Meeting #{meeting.number || 1}
                      </span>
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                          LATEST
                        </span>
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(meeting.date), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {meeting.completed}/{meeting.totalItems} completed
                        </span>
                        <span className={`font-bold ${
                          completionRate >= 75 
                            ? 'text-green-600 dark:text-green-400'
                            : completionRate >= 50
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ({completionRate.toFixed(0)}%)
                        </span>
                      </div>

                      {meeting.carriedOver > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {meeting.carriedOver} carried over
                          </span>
                        </div>
                      )}

                      {meeting.blockers > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {meeting.blockers} blocked
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      completionRate >= 75 
                        ? 'bg-green-500'
                        : completionRate >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {meetings.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No meetings in this series yet
          </p>
        )}
      </div>
    </div>
  );
}







