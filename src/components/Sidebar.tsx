'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  Settings, 
  BarChart3,
  FileText,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import Logo from '@/components/Logo';
import { NotificationSettingsModal } from './NotificationSettingsModal';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Boards', href: '/boards', icon: FolderKanban },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Templates', href: '/templates', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { theme, toggleTheme, mounted } = useTheme();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Don't show sidebar on auth pages
  if (pathname?.includes('/sign-')) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-xl text-white shadow-lg touch-manipulation active:scale-95 transition-transform"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col z-50 transform transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Logo & Collapse Button */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        {!isCollapsed && <Logo showTagline={false} />}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => {
                router.push(item.href);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 touch-manipulation active:scale-95",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </button>
          );
        })}

        {/* Create New Board Button */}
        <button
          onClick={() => {
            router.push('/new-board');
            setIsMobileMenuOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 touch-manipulation active:scale-95",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? 'New Board' : undefined}
        >
          <PlusCircle className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">New Board</span>}
        </button>
      </nav>

      {/* Theme Toggle - At Bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        {/* TEST INDICATOR - Shows current theme colors */}
        {!isCollapsed && (
          <div className="mb-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-600">
            <div className="text-[10px] text-center text-gray-900 dark:text-white font-mono">
              {mounted ? (theme === 'dark' ? '🌙 DARK MODE' : '☀️ LIGHT MODE') : 'Loading...'}
            </div>
          </div>
        )}
        
        <button
          onClick={() => {
            console.log('🔄 Toggle clicked! Current theme:', theme);
            toggleTheme();
          }}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 active:scale-95 border-2 border-transparent hover:border-blue-500",
            isCollapsed && "px-2"
          )}
          title={!mounted ? 'Toggle Theme' : theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {!mounted ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {!isCollapsed && <span className="text-xs font-medium">Theme</span>}
            </>
          ) : theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4" />
              {!isCollapsed && <span className="text-xs font-medium">Light</span>}
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              {!isCollapsed && <span className="text-xs font-medium">Dark</span>}
            </>
          )}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-slate-800/50",
          isCollapsed && "justify-center"
        )}>
          <UserButton />
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Notification Settings"
              >
                <Settings className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Notification Settings Modal */}
    <NotificationSettingsModal 
      isOpen={isSettingsOpen} 
      onClose={() => setIsSettingsOpen(false)} 
    />
    </>
  );
}

