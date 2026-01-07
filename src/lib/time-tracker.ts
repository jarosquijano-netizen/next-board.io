import { differenceInHours, differenceInDays, differenceInMinutes } from 'date-fns';

export interface TimeInStatus {
  days: number;
  hours: number;
  displayText: string;
  color: string;
  isStale: boolean; // True if > 3 days
  urgencyLevel: 'fresh' | 'aging' | 'stale' | 'critical';
}

/**
 * Calculate how long card has been in current status
 */
export function getTimeInCurrentStatus(currentStatusSince: Date | string | null): TimeInStatus {
  if (!currentStatusSince) {
    return {
      days: 0,
      hours: 0,
      displayText: 'Just now',
      color: 'text-gray-400 dark:text-gray-500',
      isStale: false,
      urgencyLevel: 'fresh',
    };
  }

  const now = new Date();
  const statusDate = new Date(currentStatusSince);
  const hours = differenceInHours(now, statusDate);
  const days = differenceInDays(now, statusDate);
  
  let urgencyLevel: TimeInStatus['urgencyLevel'];
  let color: string;
  let isStale = false;
  
  if (days === 0) {
    urgencyLevel = 'fresh';
    color = 'text-gray-600 dark:text-gray-400';
  } else if (days <= 2) {
    urgencyLevel = 'aging';
    color = 'text-blue-600 dark:text-blue-400';
  } else if (days <= 5) {
    urgencyLevel = 'stale';
    color = 'text-yellow-600 dark:text-yellow-400';
    isStale = true;
  } else {
    urgencyLevel = 'critical';
    color = 'text-red-600 dark:text-red-400';
    isStale = true;
  }
  
  let displayText: string;
  if (days === 0) {
    if (hours === 0) {
      const minutes = differenceInMinutes(now, statusDate);
      displayText = minutes === 0 ? 'Just now' : `${minutes}m`;
    } else {
      displayText = `${hours}h`;
    }
  } else if (days === 1) {
    displayText = '1 day';
  } else {
    displayText = `${days} days`;
  }
  
  return {
    days,
    hours,
    displayText,
    color,
    isStale,
    urgencyLevel,
  };
}

/**
 * Calculate total card age (since creation)
 */
export function getCardAge(createdAt: Date | string): TimeInStatus {
  return getTimeInCurrentStatus(createdAt);
}

/**
 * Get background color intensity based on time
 */
export function getStaleBackgroundClass(urgencyLevel: TimeInStatus['urgencyLevel']): string {
  const classes = {
    fresh: '',
    aging: 'bg-blue-50 dark:bg-blue-900/10',
    stale: 'bg-yellow-50 dark:bg-yellow-900/20',
    critical: 'bg-red-50 dark:bg-red-900/30',
  };
  return classes[urgencyLevel];
}

/**
 * Get border color based on urgency
 */
export function getUrgencyBorderClass(urgencyLevel: TimeInStatus['urgencyLevel']): string {
  const classes = {
    fresh: 'border-l-gray-300 dark:border-l-gray-600',
    aging: 'border-l-blue-500',
    stale: 'border-l-yellow-500',
    critical: 'border-l-red-500 animate-pulse',
  };
  return classes[urgencyLevel];
}

/**
 * Auto-escalate priority based on time in status
 */
export function calculateAutoPriority(
  currentPriority: string,
  status: string,
  timeInStatus: TimeInStatus
): { newPriority: string; shouldUpdate: boolean; reason: string } {
  // Don't auto-escalate completed items
  if (status === 'Done') {
    return { newPriority: currentPriority, shouldUpdate: false, reason: '' };
  }
  
  const priorityLevels = ['low', 'medium', 'high', 'urgent'];
  const currentIndex = priorityLevels.indexOf(currentPriority.toLowerCase());
  
  // Escalation rules
  if (status === 'Blocked') {
    // Blocked items escalate faster
    if (timeInStatus.days >= 2 && currentIndex < 3) {
      return {
        newPriority: 'urgent',
        shouldUpdate: true,
        reason: `Blocked for ${timeInStatus.days} days`,
      };
    } else if (timeInStatus.days >= 1 && currentIndex < 2) {
      return {
        newPriority: 'high',
        shouldUpdate: true,
        reason: `Blocked for ${timeInStatus.days} day${timeInStatus.days > 1 ? 's' : ''}`,
      };
    }
  } else if (status === 'In Progress') {
    // In Progress items escalate if stuck
    if (timeInStatus.days >= 7 && currentIndex < 3) {
      return {
        newPriority: 'urgent',
        shouldUpdate: true,
        reason: `In progress for ${timeInStatus.days} days`,
      };
    } else if (timeInStatus.days >= 5 && currentIndex < 2) {
      return {
        newPriority: 'high',
        shouldUpdate: true,
        reason: `In progress for ${timeInStatus.days} days`,
      };
    }
  } else if (status === 'To Do') {
    // Todo items escalate if neglected
    if (timeInStatus.days >= 10 && currentIndex < 3) {
      return {
        newPriority: 'urgent',
        shouldUpdate: true,
        reason: `Waiting for ${timeInStatus.days} days`,
      };
    } else if (timeInStatus.days >= 7 && currentIndex < 2) {
      return {
        newPriority: 'high',
        shouldUpdate: true,
        reason: `Waiting for ${timeInStatus.days} days`,
      };
    } else if (timeInStatus.days >= 4 && currentIndex < 1) {
      return {
        newPriority: 'medium',
        shouldUpdate: true,
        reason: `Waiting for ${timeInStatus.days} days`,
      };
    }
  }
  
  return { newPriority: currentPriority, shouldUpdate: false, reason: '' };
}

/**
 * Format time spent breakdown
 */
export function formatTimeBreakdown(card: {
  timeInTodo: number;
  timeInProgress: number;
  timeInBlocked: number;
}): string {
  const parts: string[] = [];
  
  if (card.timeInTodo > 0) {
    const days = Math.floor(card.timeInTodo / 24);
    const hours = card.timeInTodo % 24;
    parts.push(`To Do: ${days}d ${hours}h`);
  }
  if (card.timeInProgress > 0) {
    const days = Math.floor(card.timeInProgress / 24);
    const hours = card.timeInProgress % 24;
    parts.push(`Progress: ${days}d ${hours}h`);
  }
  if (card.timeInBlocked > 0) {
    const days = Math.floor(card.timeInBlocked / 24);
    const hours = card.timeInBlocked % 24;
    parts.push(`Blocked: ${days}d ${hours}h`);
  }
  
  return parts.join(' • ');
}

/**
 * Get icon for time indicator
 */
export function getTimeIcon(urgencyLevel: TimeInStatus['urgencyLevel']): string {
  const icons = {
    fresh: '🟢',
    aging: '🔵',
    stale: '🟡',
    critical: '🔴',
  };
  return icons[urgencyLevel];
}







