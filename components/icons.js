const base = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

export function LockIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 016 0V9" />
    </svg>
  );
}

export function UnlockIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 015.6-1.5" />
    </svg>
  );
}

export function CheckIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

export function ClockIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

export function SealIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M10 1l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L10 19l-2.4-1.8-3 .2-.9-2.9L1.3 12.6l1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z"
      />
      <path fill="#0F0F0F" d="M8.6 13.2L5.8 10.4l1.1-1.1 1.7 1.7 4.5-4.5 1.1 1.1z" />
    </svg>
  );
}
