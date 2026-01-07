export type InteractionType = 
  | 'speak_with'
  | 'meet_with'
  | 'email'
  | 'call'
  | 'check_with'
  | 'follow_up'
  | 'present_to'
  | 'coordinate_with';

export interface InteractionConfig {
  id: InteractionType;
  label: string;
  verb: string;
  icon: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

export const INTERACTION_TYPES: Record<InteractionType, InteractionConfig> = {
  speak_with: {
    id: 'speak_with',
    label: 'Speak With',
    verb: 'Talk to',
    icon: 'MessageCircle',
    emoji: '💬',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600',
    description: 'Casual conversation or quick chat',
  },
  meet_with: {
    id: 'meet_with',
    label: 'Meet With',
    verb: 'Meet with',
    icon: 'Calendar',
    emoji: '📅',
    color: 'text-purple-400',
    bgColor: 'bg-purple-600',
    description: 'Scheduled formal meeting',
  },
  email: {
    id: 'email',
    label: 'Email',
    verb: 'Email',
    icon: 'Mail',
    emoji: '📧',
    color: 'text-green-400',
    bgColor: 'bg-green-600',
    description: 'Send email communication',
  },
  call: {
    id: 'call',
    label: 'Call',
    verb: 'Call',
    icon: 'Phone',
    emoji: '📞',
    color: 'text-orange-400',
    bgColor: 'bg-orange-600',
    description: 'Phone call',
  },
  check_with: {
    id: 'check_with',
    label: 'Check With',
    verb: 'Check with',
    icon: 'CheckCircle',
    emoji: '✅',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600',
    description: 'Get approval or confirmation',
  },
  follow_up: {
    id: 'follow_up',
    label: 'Follow Up',
    verb: 'Follow up with',
    icon: 'RotateCw',
    emoji: '🔄',
    color: 'text-pink-400',
    bgColor: 'bg-pink-600',
    description: 'Continue previous conversation',
  },
  present_to: {
    id: 'present_to',
    label: 'Present To',
    verb: 'Present to',
    icon: 'Presentation',
    emoji: '🎤',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-600',
    description: 'Present or demonstrate',
  },
  coordinate_with: {
    id: 'coordinate_with',
    label: 'Coordinate With',
    verb: 'Coordinate with',
    icon: 'Users',
    emoji: '🤝',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-600',
    description: 'Work together on something',
  },
};

export function getInteractionConfig(type: InteractionType | null): InteractionConfig | null {
  if (!type) return null;
  return INTERACTION_TYPES[type];
}

export function getAllInteractionTypes(): InteractionConfig[] {
  return Object.values(INTERACTION_TYPES);
}







