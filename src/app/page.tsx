'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { MetricCardSkeleton, DashboardCardSkeleton } from '@/components/SkeletonLoader';
import {
  AlertTriangle,
  Clock,
  Target,
  CheckCircle2,
  Calendar,
  Users,
  Activity,
  BarChart3,
  ArrowRight,
  Search,
  Plus,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'critical' | 'mine' | 'recent' | 'all'>('critical');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData();
    }
  }, [isLoaded, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('dashboard-search') as HTMLInputElement;
        searchInput?.focus();
      }

      // Number keys for quick filter switching (when not in input)
      if (document.activeElement?.tagName !== 'INPUT') {
        if (e.key === '1') setActiveFilter('critical');
        if (e.key === '2') setActiveFilter('mine');
        if (e.key === '3') setActiveFilter('recent');
        if (e.key === '4') setActiveFilter('all');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, statsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/dashboard/stats'),
      ]);
      
      if (dashboardRes.ok && statsRes.ok) {
        const dashboardData = await dashboardRes.json();
        const statsData = await statsRes.json();
        setData(dashboardData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { emoji: '🌅', text: 'Good morning' };
    if (hour < 17) return { emoji: '☀️', text: 'Good afternoon' };
    return { emoji: '🌙', text: 'Good evening' };
  };

  const greeting = getTimeBasedGreeting();

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Sidebar />
        <div className="lg:ml-64 min-h-screen transition-colors duration-300 pb-20 lg:pb-0">
          <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="mb-6">
                <div className="h-10 w-64 bg-gray-200 dark:bg-slate-700 rounded-lg mb-2 animate-pulse" />
                <div className="h-6 w-96 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4 mb-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <DashboardCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !stats) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Sidebar />
        <div className="lg:ml-64 flex items-center justify-center h-screen">
          <div className="text-gray-900 dark:text-white text-lg">No dashboard data available</div>
        </div>
      </div>
    );
  }

  const criticalCount = 
    data.criticalItems.overdue.length +
    data.criticalItems.dueToday.length +
    data.criticalItems.dueTomorrow.length +
    data.criticalItems.dueThisWeek.length +
    data.criticalItems.dueNextWeek.length +
    data.criticalItems.blocked.length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      
      <div className="lg:ml-64 min-h-screen transition-colors duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl">{greeting.emoji}</span>
                  <span>{greeting.text}, {user?.firstName || 'User'}!</span>
                </h1>
                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
                  Here&apos;s everything across your {data.meetingSummaries.length} active meetings
                </p>
              </div>
              <button
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className="ml-2 sm:ml-4 p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0 touch-manipulation"
                title={isHeaderCollapsed ? "Expand widgets" : "Collapse widgets"}
              >
                {isHeaderCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>

            {/* Collapsible Section */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHeaderCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
            {/* Search Bar */}
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <input
                id="dashboard-search"
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search meetings..."
                className="w-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none transition-colors text-base touch-manipulation"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result: any) => (
                    <div
                      key={result.id}
                      onClick={() => {
                        router.push(`/board/${result.meetingId}?cardId=${result.id}`);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-200 dark:border-slate-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">{result.meetingTitle}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">
                          {result.type}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{result.summary}</h4>
                      {result.owner && (
                        <p className="text-xs text-gray-500 mt-1">👤 {result.owner}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Keyboard Hints - Hidden on mobile */}
            <div className="hidden sm:flex text-xs text-gray-500 items-center gap-4 mb-4 sm:mb-6">
              <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-600">⌘K</kbd> Search</span>
              <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-600">1-4</kbd> Switch tabs</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
              <QuickStat label="Active Items" value={stats.totalActive} icon={<Target className="w-5 h-5" />} color="blue" />
              <QuickStat label="Overdue" value={stats.overdue} icon={<AlertTriangle className="w-5 h-5" />} color="red" pulse={stats.overdue > 0} />
              <QuickStat label="Due Today" value={stats.dueToday} icon={<Clock className="w-5 h-5" />} color="orange" />
              <QuickStat label="Due Tomorrow" value={stats.dueTomorrow} icon={<Calendar className="w-5 h-5" />} color="purple" />
              <QuickStat label="This Week" value={stats.dueThisWeek} icon={<Calendar className="w-5 h-5" />} color="blue" />
              <QuickStat label="Next Week" value={stats.dueNextWeek} icon={<Calendar className="w-5 h-5" />} color="purple" />
              <QuickStat label="Blocked" value={stats.blocked} icon={<AlertTriangle className="w-5 h-5" />} color="yellow" />
              <QuickStat label="Done Today" value={stats.completedToday} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => router.push('/new-board')}
                className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-500/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95 transition-all touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">New Board</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Upload & process</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/boards')}
                className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-500/50 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 active:scale-95 transition-all touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">All Boards</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{data.meetingSummaries.length} meetings</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/analytics')}
                className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-500/50 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 active:scale-95 transition-all touch-manipulation sm:col-span-2 lg:col-span-1"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Analytics</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">View insights</p>
                </div>
              </button>
            </div>
            </div>

            {/* Filter Tabs - Always Visible */}
            <div className={`flex gap-1 sm:gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-hide ${isHeaderCollapsed ? 'mt-0' : 'mt-0'}`}>
              <FilterTab label="Critical" count={criticalCount} active={activeFilter === 'critical'} onClick={() => setActiveFilter('critical')} icon={<AlertTriangle className="w-4 h-4" />} />
              <FilterTab label="My Items" count={data.myItems.assignedToMe.length} active={activeFilter === 'mine'} onClick={() => setActiveFilter('mine')} icon={<Users className="w-4 h-4" />} />
              <FilterTab label="Recent" count={data.recentActivity.updated.length} active={activeFilter === 'recent'} onClick={() => setActiveFilter('recent')} icon={<Activity className="w-4 h-4" />} />
              <FilterTab label="All Meetings" count={data.meetingSummaries.length} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} icon={<BarChart3 className="w-4 h-4" />} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {activeFilter === 'critical' && <CriticalView data={data.criticalItems} router={router} />}
          {activeFilter === 'mine' && <MyItemsView data={data.myItems} router={router} />}
          {activeFilter === 'recent' && <RecentView data={data.recentActivity} router={router} />}
          {activeFilter === 'all' && <AllMeetingsView meetings={data.meetingSummaries} upcomingDeadlines={data.upcomingDeadlines} router={router} />}
        </div>
      </div>
    </div>
  );
}

// Component definitions (continuing in next file due to size)
function QuickStat({ label, value, icon, color, pulse }: any) {
  const colors = {
    blue: {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/30',
      border: 'border-blue-200 dark:border-blue-500/50',
      icon: 'text-blue-600 dark:text-blue-400',
      number: 'text-blue-700 dark:text-blue-300',
      hover: 'hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40',
    },
    red: {
      bg: 'from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/30',
      border: 'border-red-200 dark:border-red-500/50',
      icon: 'text-red-600 dark:text-red-400',
      number: 'text-red-700 dark:text-red-300',
      hover: 'hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/40 dark:hover:to-red-700/40',
    },
    orange: {
      bg: 'from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/30',
      border: 'border-orange-200 dark:border-orange-500/50',
      icon: 'text-orange-600 dark:text-orange-400',
      number: 'text-orange-700 dark:text-orange-300',
      hover: 'hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/40 dark:hover:to-orange-700/40',
    },
    yellow: {
      bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/50 dark:to-yellow-800/30',
      border: 'border-yellow-200 dark:border-yellow-500/50',
      icon: 'text-yellow-600 dark:text-yellow-400',
      number: 'text-yellow-700 dark:text-yellow-300',
      hover: 'hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/40 dark:hover:to-yellow-700/40',
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/30',
      border: 'border-purple-200 dark:border-purple-500/50',
      icon: 'text-purple-600 dark:text-purple-400',
      number: 'text-purple-700 dark:text-purple-300',
      hover: 'hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/40 dark:hover:to-purple-700/40',
    },
    green: {
      bg: 'from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/30',
      border: 'border-green-200 dark:border-green-500/50',
      icon: 'text-green-600 dark:text-green-400',
      number: 'text-green-700 dark:text-green-300',
      hover: 'hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/40 dark:hover:to-green-700/40',
    },
  };

  const colorScheme = colors[color as keyof typeof colors];

  return (
    <div className={`bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 transition-all duration-300 cursor-default ${colorScheme.hover} hover:scale-105 hover:shadow-lg ${pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`${colorScheme.icon} w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110`}>{icon}</div>
      </div>
      <p className={`text-2xl sm:text-3xl lg:text-4xl font-black ${colorScheme.number} mb-1 sm:mb-2 transition-all duration-300`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

function FilterTab({ label, count, active, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all touch-manipulation active:scale-95 whitespace-nowrap ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
      }`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      <span className="text-xs sm:text-sm">{label}</span>
      {count > 0 && (
        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 ${active ? 'bg-blue-700' : 'bg-gray-300 dark:bg-slate-700'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Critical View Component
function CriticalView({ data, router }: any) {
  const hasItems = data.overdue.length > 0 || data.dueToday.length > 0 || data.dueTomorrow.length > 0 || 
                    data.dueThisWeek.length > 0 || data.dueNextWeek.length > 0 || data.blocked.length > 0 || data.urgent.length > 0;

  if (!hasItems) {
    return (
      <EmptyState
        emoji="🎉"
        title="All Clear!"
        description="No critical items right now. Great work!"
        actionLabel="Create New Board"
        onAction={() => router.push('/new-board')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {data.urgent.length > 0 && (
        <CriticalSection title="⚡ Urgent Priority" subtitle={`${data.urgent.length} high-priority items requiring immediate attention`} cards={data.urgent} color="purple" router={router} />
      )}
      {data.overdue.length > 0 && (
        <CriticalSection title="🚨 Overdue - Handle Now" subtitle={`${data.overdue.length} items past their deadline`} cards={data.overdue} color="red" router={router} />
      )}
      {data.dueToday.length > 0 && (
        <CriticalSection title="🎯 Due Today" subtitle={`${data.dueToday.length} items must be completed today`} cards={data.dueToday} color="orange" router={router} />
      )}
      {data.dueTomorrow.length > 0 && (
        <CriticalSection title="📅 Due Tomorrow" subtitle={`${data.dueTomorrow.length} items due tomorrow`} cards={data.dueTomorrow} color="purple" router={router} />
      )}
      {data.dueThisWeek.length > 0 && (
        <DueThisWeekSection title="📆 Due This Week" subtitle={`${data.dueThisWeek.length} items due in the next 7 days`} cards={data.dueThisWeek} router={router} />
      )}
      {data.dueNextWeek.length > 0 && (
        <CriticalSection title="📋 Due Next Week" subtitle={`${data.dueNextWeek.length} items due in 8-14 days`} cards={data.dueNextWeek} color="purple" router={router} />
      )}
      {data.blocked.length > 0 && (
        <CriticalSection title="🚧 Blocked Items" subtitle={`${data.blocked.length} items need unblocking`} cards={data.blocked} color="yellow" router={router} />
      )}
    </div>
  );
}

function CriticalSection({ title, subtitle, cards, color, router }: any) {
  const colors = {
    red: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-500',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-500',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-500',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500',
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} border-2 rounded-xl p-6 transition-colors`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card: any) => (
          <DashboardCard key={card.id} card={card} router={router} />
        ))}
      </div>
    </div>
  );
}

function MyItemsView({ data, router }: any) {
  const hasItems = data.assignedToMe.length > 0 || data.needingMyAction.length > 0 || data.mentioningMe.length > 0;

  if (!hasItems) {
    return (
      <EmptyState
        emoji="😌"
        title="Nothing Assigned"
        description="No items currently assigned to you. Take a break or explore your boards!"
        actionLabel="View All Boards"
        onAction={() => router.push('/boards')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {data.assignedToMe.length > 0 && (
        <Section title="📋 Assigned to Me" subtitle={`${data.assignedToMe.length} items you own`} cards={data.assignedToMe} router={router} />
      )}
      {data.needingMyAction.length > 0 && (
        <Section title="💬 Needing My Action" subtitle={`${data.needingMyAction.length} items where someone needs to contact you`} cards={data.needingMyAction} router={router} />
      )}
      {data.mentioningMe.length > 0 && (
        <Section title="👥 Involving Me" subtitle={`${data.mentioningMe.length} items you're involved in`} cards={data.mentioningMe} router={router} />
      )}
    </div>
  );
}

function RecentView({ data, router }: any) {
  return (
    <div className="space-y-6">
      {data.completed.length > 0 && (
        <Section title="✅ Recently Completed" subtitle={`${data.completed.length} items done in the last 7 days`} cards={data.completed} router={router} showCompletedDate />
      )}
      {data.created.length > 0 && (
        <Section title="🆕 Recently Created" subtitle={`${data.created.length} new items in the last 7 days`} cards={data.created} router={router} />
      )}
      {data.updated.length > 0 && (
        <Section title="📝 Recently Updated" subtitle={`${data.updated.length} items modified in the last 7 days`} cards={data.updated} router={router} />
      )}
    </div>
  );
}

function AllMeetingsView({ meetings, upcomingDeadlines, router }: any) {
  return (
    <div className="space-y-6">
      {upcomingDeadlines.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            Upcoming Deadlines (Next 7 Days)
          </h3>
          <div className="space-y-2">
            {upcomingDeadlines.map((card: any) => (
              <DashboardCard key={card.id} card={card} router={router} compact />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          All Meetings Overview
        </h3>
        <div className="space-y-3">
          {meetings.map((item: any) => (
            <MeetingSummaryCard key={item.meeting.id} meeting={item.meeting} stats={item.stats} router={router} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, cards, router, showCompletedDate }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card: any) => (
          <DashboardCard key={card.id} card={card} router={router} showCompletedDate={showCompletedDate} />
        ))}
      </div>
    </div>
  );
}

function DashboardCard({ card, router, compact, showCompletedDate }: any) {
  const handleClick = () => {
    router.push(`/board/${card.meetingId}?cardId=${card.id}`);
  };

  const priorityColors = {
    urgent: 'bg-red-600',
    high: 'bg-orange-600',
    medium: 'bg-blue-600',
    low: 'bg-gray-600',
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border border-gray-200 dark:border-slate-700 touch-manipulation"
    >
      <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
        <span>{card.meetingTitle}</span>
        <ArrowRight className="w-3 h-3" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
          {card.type}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${priorityColors[card.priority as keyof typeof priorityColors] || 'bg-gray-600'}`}>
          {card.priority}
        </span>
      </div>

      <h4 className={`font-semibold text-gray-900 dark:text-white mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
        {card.summary}
      </h4>

      {card.dueDate && !showCompletedDate && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          📅 Due: {new Date(card.dueDate).toLocaleDateString()}
        </div>
      )}

      {showCompletedDate && card.completedAt && (
        <div className="text-sm text-green-600 dark:text-green-400 mb-2">
          ✓ Completed {new Date(card.completedAt).toLocaleDateString()}
        </div>
      )}

      {card.owner && (
        <div className="text-xs text-gray-500">
          👤 {card.owner}
        </div>
      )}
    </div>
  );
}

function MeetingSummaryCard({ meeting, stats, router }: any) {
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const hasIssues = stats.overdue > 0 || stats.blocked > 0;

  return (
    <div
      onClick={() => router.push(`/board/${meeting.id}`)}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-all border border-gray-200 dark:border-slate-700 hover:shadow-md hover:scale-[1.01]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{meeting.title}</h4>
          {meeting.seriesNumber && (
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-bold flex-shrink-0">
              #{meeting.seriesNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
          <span>{stats.completed}/{stats.total} completed</span>
          {stats.overdue > 0 && (
            <span className="text-red-600 dark:text-red-400">{stats.overdue} overdue</span>
          )}
          {stats.blocked > 0 && (
            <span className="text-yellow-600 dark:text-yellow-400">{stats.blocked} blocked</span>
          )}
        </div>
      </div>

      <div className="relative w-12 h-12 flex-shrink-0 ml-4">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-300 dark:text-slate-700" />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - completionRate / 100)}`}
            className={hasIssues ? 'text-yellow-500' : 'text-green-500'}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
          {completionRate.toFixed(0)}%
        </span>
      </div>

      <ArrowRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
    </div>
  );
}

// Empty State Component
function EmptyState({ emoji, title, description, actionLabel, onAction }: any) {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-8xl mb-6 animate-bounce">{emoji}</div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Improved Due This Week Section
function DueThisWeekSection({ title, subtitle, cards, router }: any) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-500/50 rounded-xl p-6 transition-all hover:shadow-lg">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card: any) => (
          <DueThisWeekCard key={card.id} card={card} router={router} />
        ))}
      </div>
    </div>
  );
}

function DueThisWeekCard({ card, router }: any) {
  const handleClick = () => {
    router.push(`/board/${card.meetingId}?cardId=${card.id}`);
  };

  const daysUntilDue = card.dueDate 
    ? Math.ceil((new Date(card.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-gray-200 dark:border-slate-700 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span className="truncate">{card.meetingTitle}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {card.summary}
          </h4>
        </div>
        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white flex-shrink-0 ml-2">
          {card.type}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {daysUntilDue !== null && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`}
            </span>
          </div>
        )}
        {card.owner && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {card.owner}
          </div>
        )}
      </div>
    </div>
  );
}
