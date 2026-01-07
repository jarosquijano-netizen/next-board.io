'use client';

import { CheckCircle2, X, ArrowRight, Trash2 } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusChange?: (status: string) => void;
  onBulkDelete?: () => void;
}

export function BulkActionsBar({ 
  selectedCount, 
  onClearSelection,
  onBulkStatusChange,
  onBulkDelete 
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-blue-500 p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          {selectedCount}
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">
          {selectedCount} card{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="flex items-center gap-2 border-l border-gray-200 dark:border-slate-700 pl-4">
        {onBulkStatusChange && (
          <>
            <button
              onClick={() => onBulkStatusChange('In Progress')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Move to In Progress
            </button>
            <button
              onClick={() => onBulkStatusChange('Done')}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Done
            </button>
          </>
        )}
        {onBulkDelete && (
          <button
            onClick={onBulkDelete}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      <button
        onClick={onClearSelection}
        className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        aria-label="Clear selection"
      >
        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
}
