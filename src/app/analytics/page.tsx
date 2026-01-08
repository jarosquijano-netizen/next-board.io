'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Activity,
  Download,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { userId, isLoaded } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchAnalytics();
    }
  }, [period, isLoaded, userId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center h-screen transition-all duration-300">
          <div className="text-white text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center h-screen transition-all duration-300">
          <div className="text-white text-lg">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex">
      <Sidebar />
      
      <div className="flex-1 min-h-screen transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  📊 Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                  Track your team&apos;s performance and identify improvements
                </p>
              </div>

              {/* Period Selector */}
              <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                {(['7d', '30d', '90d', 'all'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all text-sm
                      ${period === p 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
                    `}
                  >
                    {p === 'all' ? 'All Time' : p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Completion Rate"
              value={`${data.velocity.completionRate.toFixed(0)}%`}
              change={data.meetingEfficiency.completionRateTrend}
              icon={<CheckCircle2 className="w-6 h-6" />}
              color="green"
            />
            
            <MetricCard
              title="Items Completed"
              value={data.velocity.itemsCompleted.toString()}
              subtitle={`${data.velocity.velocity.toFixed(1)}/week`}
              icon={<Target className="w-6 h-6" />}
              color="blue"
              trend={data.velocity.trend}
            />

            <MetricCard
              title="Avg Completion Time"
              value={`${data.velocity.avgCompletionTime.toFixed(1)}d`}
              subtitle="From created to done"
              icon={<Clock className="w-6 h-6" />}
              color="purple"
            />

            <MetricCard
              title="Active Blockers"
              value={data.blockers.totalBlockers.toString()}
              subtitle={`${data.blockers.avgBlockedDays.toFixed(1)}d avg`}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
            />
          </div>

          {/* Meeting Efficiency */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Meeting Efficiency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">How productive are your meetings?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EfficiencyStat
                label="Total Meetings"
                value={data.meetingEfficiency.totalMeetings}
                suffix="meetings"
              />
              <EfficiencyStat
                label="Avg Items/Meeting"
                value={data.meetingEfficiency.avgItemsPerMeeting.toFixed(1)}
                change={data.meetingEfficiency.itemsPerMeetingTrend}
                changeLabel="vs previous period"
                lowerIsBetter
              />
              <EfficiencyStat
                label="Avg Duration"
                value={data.meetingEfficiency.avgMeetingDuration.toFixed(0)}
                suffix="minutes"
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500 dark:text-green-400" />
                Completion Trend
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Card Type Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                By Card Type
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.cardTypes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="type" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="total" fill="#475569" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Contributors */}
          {data.contributors.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Contributors</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Who&apos;s getting things done?</p>
                </div>
              </div>

              <div className="space-y-3">
                {data.contributors.slice(0, 5).map((contributor: any, idx: number) => (
                  <ContributorRow
                    key={contributor.person}
                    rank={idx + 1}
                    contributor={contributor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Top Blockers */}
          {data.blockers.topBlockers.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Blockers</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">What&apos;s slowing your team down?</p>
                </div>
              </div>

              <div className="space-y-3">
                {data.blockers.topBlockers.map((blocker: any, idx: number) => (
                  <BlockerRow key={idx} blocker={blocker} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'red';
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({ title, value, change, subtitle, icon, color, trend }: MetricCardProps) {
  const colors = {
    green: 'from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/30 border-green-200 dark:border-green-500/50',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/30 border-blue-200 dark:border-blue-500/50',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/30 border-purple-200 dark:border-purple-500/50',
    red: 'from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/30 border-red-200 dark:border-red-500/50',
  };

  const iconColors = {
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border-2 rounded-xl p-5 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <div className={iconColors[color]}>{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend !== 'stable' && trend}
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</p>
      
      {change !== undefined && (
        <div className={`text-sm font-semibold ${
          change > 0 ? 'text-green-600 dark:text-green-400' : change < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}% vs previous
        </div>
      )}
      
      {subtitle && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Efficiency Stat Component
function EfficiencyStat({ label, value, suffix, change, changeLabel, lowerIsBetter }: any) {
  const hasChange = change !== undefined && change !== 0;
  const isPositive = lowerIsBetter ? change < 0 : change > 0;

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 transition-colors">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        {suffix && <span className="text-sm text-gray-500 dark:text-gray-500 mb-1">{suffix}</span>}
      </div>
      {hasChange && (
        <div className={`text-sm font-semibold mt-1 flex items-center gap-1 ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(1)} {changeLabel}
        </div>
      )}
    </div>
  );
}

// Contributor Row Component
function ContributorRow({ rank, contributor }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
      <div className="text-2xl font-black text-gray-400 dark:text-gray-600 w-8">#{rank}</div>
      
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-lg">
          {contributor.person.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{contributor.person}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span>{contributor.itemsCompleted} completed</span>
          <span>•</span>
          <span>{contributor.completionRate.toFixed(0)}% rate</span>
          <span>•</span>
          <span>{contributor.avgCompletionTime.toFixed(1)}d avg</span>
        </div>
      </div>

      {contributor.currentBlocked > 0 && (
        <div className="text-right flex-shrink-0">
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-400 rounded text-xs font-semibold">
            {contributor.currentBlocked} blocked
          </span>
        </div>
      )}

      <div className="w-32 flex-shrink-0">
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
            style={{ width: `${Math.min(100, contributor.completionRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Blocker Row Component
function BlockerRow({ blocker }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg transition-colors">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{blocker.reason}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span>{blocker.count} occurrences</span>
          <span>•</span>
          <span>{blocker.avgDuration.toFixed(1)} days avg duration</span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{blocker.count}</div>
        <div className="text-xs text-gray-500 dark:text-gray-500">times</div>
      </div>
    </div>
  );
}





