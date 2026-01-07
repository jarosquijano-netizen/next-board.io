'use client';

import { LayoutGrid, Target, Grid2X2, Calendar, BarChart3 } from 'lucide-react';
import { ViewType, VIEWS } from '@/types/view-types';

interface ViewSelectorProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
  hasComparison?: boolean; // Whether comparison is available
}

const iconMap = {
  LayoutGrid,
  Target,
  Grid2X2,
  Calendar,
  BarChart3,
};

export function ViewSelector({ currentView, onChange, hasComparison = false }: ViewSelectorProps) {
  return (
    <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
      {Object.values(VIEWS)
        .filter(view => view.id !== 'comparison' || hasComparison) // Hide comparison if not available
        .map(view => {
        const Icon = iconMap[view.icon as keyof typeof iconMap];
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onChange(view.id)}
            className={`
              px-4 py-3 rounded-lg flex items-center gap-3 transition-all
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'}
            `}
          >
            <Icon className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold text-sm">{view.label}</div>
              <div className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
                {view.description}
              </div>
            </div>
            {view.shortcut && (
              <kbd className={`
                px-2 py-1 rounded text-xs font-mono
                ${isActive ? 'bg-blue-700' : 'bg-gray-200 dark:bg-slate-900 text-gray-500'}
              `}>
                {view.shortcut}
              </kbd>
            )}
          </button>
        );
      })}
    </div>
  );
}

