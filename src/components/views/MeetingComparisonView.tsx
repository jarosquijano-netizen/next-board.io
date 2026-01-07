'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface ComparisonData {
  previous: {
    id: string;
    number: number | null;
    date: Date;
    totalItems: number;
    completed: number;
    completionRate: number;
    blockers: number;
  };
  current: {
    id: string;
    number: number | null;
    date: Date;
    totalItems: number;
    completed: number;
    completionRate: number;
    blockers: number;
  };
  changes: {
    daysBetween: number;
    carriedOver: number;
    newItems: number;
    stillBlocked: number;
    completionRateChange: number;
    newPeople: string[];
    removedPeople: string[];
  };
  insights: string[];
}

interface MeetingComparisonViewProps {
  currentMeetingId: string;
  comparisonData: ComparisonData;
}

export function MeetingComparisonView({ 
  comparisonData 
}: MeetingComparisonViewProps) {
  const { previous, current, changes, insights } = comparisonData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Meeting Comparison
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Compare this meeting to the previous one in the series
        </p>
      </div>

      {/* Meeting Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-blue-500">
        <div className="flex items-center justify-between">
          {/* Previous Meeting */}
          <div className="flex-1">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Previous Meeting</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              #{previous.number || 1} - {format(new Date(previous.date), 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {changes.daysBetween} days ago
            </div>
          </div>

          {/* Arrow */}
          <div className="px-8">
            <ArrowRight className="w-8 h-8 text-blue-400" />
          </div>

          {/* Current Meeting */}
          <div className="flex-1 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Meeting</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              #{current.number || 2} - {format(new Date(current.date), 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-blue-500 font-semibold">
              Today
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-500 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Key Insights
        </h3>
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg"
            >
              <span className="text-2xl">{insight.charAt(0)}</span>
              <p className="text-gray-900 dark:text-white flex-1">{insight.slice(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <StatCard
          title="Completion Rate"
          previous={`${previous.completionRate.toFixed(0)}%`}
          current={`${current.completionRate.toFixed(0)}%`}
          change={changes.completionRateChange}
          icon={<CheckCircle2 className="w-6 h-6" />}
          isPercentage
        />

        {/* Total Items */}
        <StatCard
          title="Total Items"
          previous={previous.totalItems.toString()}
          current={current.totalItems.toString()}
          change={current.totalItems - previous.totalItems}
          icon={<Calendar className="w-6 h-6" />}
        />

        {/* Blockers */}
        <StatCard
          title="Blocked Items"
          previous={previous.blockers.toString()}
          current={current.blockers.toString()}
          change={current.blockers - previous.blockers}
          icon={<AlertTriangle className="w-6 h-6" />}
          isNegativeGood
        />

        {/* Carried Over */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">Carried Over</h3>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">
            {changes.carriedOver}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Items from last meeting
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Changed */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What Changed</h3>
          <div className="space-y-3">
            <DetailRow
              label="New items this meeting"
              value={changes.newItems}
              color="text-green-600 dark:text-green-400"
            />
            <DetailRow
              label="Carried over from last meeting"
              value={changes.carriedOver}
              color="text-yellow-600 dark:text-yellow-400"
            />
            <DetailRow
              label="Still blocked since last time"
              value={changes.stillBlocked}
              color="text-red-600 dark:text-red-400"
            />
            <DetailRow
              label="Days between meetings"
              value={changes.daysBetween}
              color="text-blue-600 dark:text-blue-400"
            />
          </div>
        </div>

        {/* People Changes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            People Changes
          </h3>
          
          {changes.newPeople.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New people involved:</p>
              <div className="flex flex-wrap gap-2">
                {changes.newPeople.map(person => (
                  <span 
                    key={person}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-500/50 text-green-700 dark:text-green-400 rounded-full text-sm"
                  >
                    + {person}
                  </span>
                ))}
              </div>
            </div>
          )}

          {changes.removedPeople.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">No longer involved:</p>
              <div className="flex flex-wrap gap-2">
                {changes.removedPeople.map(person => (
                  <span 
                    key={person}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-500/50 text-gray-700 dark:text-gray-400 rounded-full text-sm"
                  >
                    - {person}
                  </span>
                ))}
              </div>
            </div>
          )}

          {changes.newPeople.length === 0 && changes.removedPeople.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              Same people as last meeting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  previous: string;
  current: string;
  change: number;
  icon: React.ReactNode;
  isPercentage?: boolean;
  isNegativeGood?: boolean;
}

function StatCard({ 
  title, 
  previous, 
  current, 
  change, 
  icon,
  isPercentage = false,
  isNegativeGood = false
}: StatCardProps) {
  const isPositive = isNegativeGood ? change <= 0 : change >= 0;
  const changeColor = isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
  const bgColor = isPositive 
    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-500/50' 
    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500/50';

  return (
    <div className={`border-2 rounded-xl p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={changeColor}>{icon}</div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{title}</h3>
      </div>
      
      <div className="flex items-end gap-3 mb-2">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-500">Previous</p>
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{previous}</p>
        </div>
        <TrendingRight />
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-500">Current</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{current}</p>
        </div>
      </div>

      <div className={`flex items-center gap-1 text-sm font-semibold ${changeColor}`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>
          {change > 0 ? '+' : ''}{change.toFixed(isPercentage ? 1 : 0)}{isPercentage ? '%' : ''}
        </span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function TrendingRight() {
  return <ArrowRight className="w-4 h-4 text-gray-400" />;
}







