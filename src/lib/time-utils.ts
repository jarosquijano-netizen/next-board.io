import { 
  format, 
  formatDistanceToNow, 
  isPast, 
  differenceInDays, 
  differenceInHours,
  differenceInMinutes,
  parseISO,
  isToday,
  isTomorrow,
  isThisWeek,
  isValid
} from 'date-fns';

export interface TimeStatus {
  isOverdue: boolean;
  daysUntil: number;
  hoursUntil: number;
  minutesUntil: number;
  urgencyLevel: 'safe' | 'soon' | 'urgent' | 'overdue' | 'none';
  displayText: string;
  displayColor: string;
  badgeColor: string;
}

/**
 * Analyzes a due date and returns comprehensive time status
 */
export function getTimeStatus(dueDate: Date | string | null): TimeStatus {
  if (!dueDate) {
    return {
      isOverdue: false,
      daysUntil: 999,
      hoursUntil: 999,
      minutesUntil: 999,
      urgencyLevel: 'none',
      displayText: 'No deadline',
      displayColor: 'text-gray-400 dark:text-gray-500',
      badgeColor: 'bg-gray-600'
    };
  }

  let due: Date;
  try {
    due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    if (!isValid(due)) {
      throw new Error('Invalid date');
    }
  } catch {
    return {
      isOverdue: false,
      daysUntil: 999,
      hoursUntil: 999,
      minutesUntil: 999,
      urgencyLevel: 'none',
      displayText: 'Invalid date',
      displayColor: 'text-gray-400 dark:text-gray-500',
      badgeColor: 'bg-gray-600'
    };
  }
  
  const now = new Date();
  
  const daysUntil = differenceInDays(due, now);
  const hoursUntil = differenceInHours(due, now);
  const minutesUntil = differenceInMinutes(due, now);
  const isOverdue = isPast(due) && !isToday(due);

  let urgencyLevel: TimeStatus['urgencyLevel'];
  let displayColor: string;
  let badgeColor: string;
  let displayText: string;

  if (isOverdue) {
    urgencyLevel = 'overdue';
    displayColor = 'text-red-600 dark:text-red-400';
    badgeColor = 'bg-red-600';
    const overdueDays = Math.abs(daysUntil);
    displayText = overdueDays === 0 
      ? `Overdue by ${Math.abs(hoursUntil)}h`
      : `Overdue by ${overdueDays}d`;
  } else if (hoursUntil <= 2) {
    urgencyLevel = 'urgent';
    displayColor = 'text-red-600 dark:text-red-400';
    badgeColor = 'bg-red-600';
    displayText = `Due in ${minutesUntil}min`;
  } else if (hoursUntil <= 24) {
    urgencyLevel = 'urgent';
    displayColor = 'text-orange-600 dark:text-orange-400';
    badgeColor = 'bg-orange-600';
    displayText = `Due in ${hoursUntil}h`;
  } else if (daysUntil <= 3) {
    urgencyLevel = 'soon';
    displayColor = 'text-yellow-600 dark:text-yellow-400';
    badgeColor = 'bg-yellow-600';
    displayText = `Due in ${daysUntil}d`;
  } else if (daysUntil <= 7) {
    urgencyLevel = 'soon';
    displayColor = 'text-blue-600 dark:text-blue-400';
    badgeColor = 'bg-blue-600';
    displayText = `Due ${format(due, 'EEEE')}`;
  } else {
    urgencyLevel = 'safe';
    displayColor = 'text-green-600 dark:text-green-400';
    badgeColor = 'bg-green-600';
    displayText = `Due ${format(due, 'MMM d')}`;
  }

  return {
    isOverdue,
    daysUntil,
    hoursUntil,
    minutesUntil,
    urgencyLevel,
    displayText,
    displayColor,
    badgeColor
  };
}

/**
 * Format due date in human-readable form
 */
export function formatDueDate(date: Date | string | null): string {
  if (!date) return 'No deadline';
  
  let d: Date;
  try {
    d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) {
      return 'Invalid date';
    }
  } catch {
    return 'Invalid date';
  }
  
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isThisWeek(d)) return format(d, 'EEEE'); // "Friday"
  
  return format(d, 'MMM d, yyyy');
}

/**
 * Get color class for priority badge
 */
export function getPriorityColor(priority: string): string {
  const colors = {
    urgent: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-blue-600 text-white',
    low: 'bg-gray-600 text-white'
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-600 text-white';
}

/**
 * Format time estimate for display
 */
export function getTimeEstimateDisplay(minutes: number | null): string {
  if (!minutes) return '';
  
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get urgency border color class
 */
export function getUrgencyBorderClass(urgencyLevel: TimeStatus['urgencyLevel']): string {
  const classes = {
    overdue: 'border-l-4 border-l-red-500 bg-red-950/20',
    urgent: 'border-l-4 border-l-orange-500 bg-orange-950/20',
    soon: 'border-l-4 border-l-yellow-500 bg-yellow-950/20',
    safe: 'border-l-2 border-l-green-500/30',
    none: ''
  };
  return classes[urgencyLevel];
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date | string | null): string {
  if (!date) return '';
  
  let d: Date;
  try {
    d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) {
      return '';
    }
  } catch {
    return '';
  }
  
  return formatDistanceToNow(d, { addSuffix: true });
}







