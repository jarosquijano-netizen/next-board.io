export type ViewType = 'kanban' | 'calendar' | 'focus' | 'matrix' | 'comparison';

export interface ViewConfig {
  id: ViewType;
  label: string;
  icon: string;
  description: string;
  shortcut?: string;
}

export const VIEWS: Record<ViewType, ViewConfig> = {
  focus: {
    id: 'focus',
    label: 'My Focus Today',
    icon: 'Target',
    description: 'Curated daily list of priority items',
    shortcut: 'F',
  },
  kanban: {
    id: 'kanban',
    label: 'Kanban Board',
    icon: 'LayoutGrid',
    description: 'Classic board view with status columns',
    shortcut: 'K',
  },
  calendar: {
    id: 'calendar',
    label: 'Calendar',
    icon: 'Calendar',
    description: 'View cards by due date',
    shortcut: 'C',
  },
  matrix: {
    id: 'matrix',
    label: 'Priority Matrix',
    icon: 'Grid2X2',
    description: 'Eisenhower matrix for decision-making',
    shortcut: 'M',
  },
  comparison: {
    id: 'comparison',
    label: 'Comparison',
    icon: 'BarChart3',
    description: 'Compare with previous meeting',
    shortcut: 'P',
  },
};

