interface IconProps {
  className?: string;
}

export function TodoIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="3" y="10.75" width="12" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="3" y="16.5" width="12" height="2.5" rx="1.25" fill="currentColor" />
    </svg>
  );
}

export function InProgressIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M21 12L18 9M21 12L18 15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BlockedIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3L21 20H3L12 3Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function DoneIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8 12L11 15L16 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}







