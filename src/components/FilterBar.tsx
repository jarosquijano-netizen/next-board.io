'use client';

import { Filter, CheckCircle2, AlertOctagon, ShieldAlert, Zap, Target, MessageSquare, HelpCircle, FileText, Lightbulb } from 'lucide-react';
import { CardType } from '@/types/meeting';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  selectedTypes: CardType[];
  onFilterChange: (types: CardType[]) => void;
  variant?: 'horizontal' | 'grid'; // Default horizontal, grid for side panel
}

// Standardized color palette - semantic colors only for critical states
const cardTypes: { type: CardType; label: string; color: string; bgColor: string; Icon: React.ElementType }[] = [
  { type: 'Blocker', label: 'Blockers', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10 border-red-500/30', Icon: AlertOctagon },
  { type: 'Risk', label: 'Risks', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30', Icon: ShieldAlert },
  { type: 'Action', label: 'Actions', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30', Icon: Zap },
  { type: 'Decision', label: 'Decisions', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-500/10 border-gray-500/30', Icon: Target },
  { type: 'Follow-up', label: 'Follow-ups', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-500/10 border-gray-500/30', Icon: MessageSquare },
  { type: 'Question', label: 'Questions', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-500/10 border-gray-500/30', Icon: HelpCircle },
  { type: 'Update', label: 'Updates', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-500/10 border-gray-500/30', Icon: FileText },
  { type: 'Idea', label: 'Ideas', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-500/10 border-gray-500/30', Icon: Lightbulb },
];

export default function FilterBar({ selectedTypes, onFilterChange, variant = 'horizontal' }: FilterBarProps) {
  const toggleType = (type: CardType) => {
    if (selectedTypes.includes(type)) {
      onFilterChange(selectedTypes.filter(t => t !== type));
    } else {
      onFilterChange([...selectedTypes, type]);
    }
  };

  const toggleAll = () => {
    if (selectedTypes.length === cardTypes.length) {
      onFilterChange([]);
    } else {
      onFilterChange(cardTypes.map(ct => ct.type));
    }
  };

  if (variant === 'grid') {
    // Grid layout for side panel (4x4 grid)
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
          <Filter className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-sm font-medium">Filter:</span>
        </div>

        {/* All Types button */}
        <button
          onClick={toggleAll}
          className={cn(
            "w-full px-3 py-2 rounded-lg border transition-all text-sm font-medium",
            selectedTypes.length === cardTypes.length
              ? "bg-blue-600 text-white font-semibold"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300"
          )}
        >
          All Types
        </button>

        {/* Grid of filter buttons */}
        <div className="grid grid-cols-2 gap-2">
          {cardTypes.map(({ type, label, color, bgColor, icon: Icon }) => {
            const isSelected = selectedTypes.includes(type);
            
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "px-3 py-2 rounded-lg border transition-all text-xs font-medium flex flex-col items-center justify-center gap-1 h-16 relative",
                  isSelected
                    ? `${bgColor} ${color} border-current`
                    : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-all duration-300"
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-center leading-tight">{label}</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 absolute top-1 right-1" strokeWidth={1.5} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filter:</span>
      </div>

      <button
        onClick={toggleAll}
        className={cn(
          "px-4 py-2 rounded-lg border transition-all text-sm font-medium",
            selectedTypes.length === cardTypes.length
            ? "bg-indigo-600 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-600 text-white shadow-sm font-semibold"
            : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 font-medium transition-all duration-300"
        )}
      >
        All Types
      </button>

      {cardTypes.map(({ type, label, color, bgColor, icon: Icon }) => {
        const isSelected = selectedTypes.includes(type);
        
        return (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={cn(
              "px-4 py-2 rounded-lg border transition-all text-sm font-medium flex items-center gap-2",
              isSelected
                ? `${bgColor} ${color} border-current`
                : "bg-white dark:bg-slate-800/50 border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
            {isSelected && <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        );
      })}
    </div>
  );
}

