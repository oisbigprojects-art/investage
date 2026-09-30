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

export function GridIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" />
    </svg>
  );
}

export function InboxIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M3 11l2-6h10l2 6v4a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 15v-4z" />
      <path d="M3 11h4l1 2h4l1-2h4" />
    </svg>
  );
}

export function UserIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="10" cy="7" r="3.2" />
      <path d="M3.8 16.5c.8-3 3.2-4.5 6.2-4.5s5.4 1.5 6.2 4.5" />
    </svg>
  );
}

export function SearchIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="9" cy="9" r="5.2" />
      <path d="M13 13l3.8 3.8" />
    </svg>
  );
}

export function BookmarkIcon({ size = 18, filled = false }) {
  return (
    <svg {...base} width={size} height={size} fill={filled ? 'currentColor' : 'none'}>
      <path d="M5.5 3.5h9a1 1 0 011 1v12l-5.5-3.5L4.5 16.5v-12a1 1 0 011-1z" />
    </svg>
  );
}

export function GlobeIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2 3 4.3 3 7s-1 5-3 7c-2-2-3-4.3-3-7s1-5 3-7z" />
    </svg>
  );
}

export function EyeOffIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M2.5 10s2.8-5 7.5-5c1.2 0 2.3.3 3.2.8M17.5 10s-2.8 5-7.5 5c-1.2 0-2.3-.3-3.2-.8" />
      <path d="M3.5 3.5l13 13" />
    </svg>
  );
}

export function BellIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M5 8a5 5 0 0110 0c0 4.5 1.5 5.5 1.5 5.5h-13S5 12.5 5 8z" />
      <path d="M8.5 16.5a1.6 1.6 0 003 0" />
    </svg>
  );
}

export function HomeIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M3.5 9.5L10 4l6.5 5.5" />
      <path d="M5 8.5V16h3.5v-4h3v4H15V8.5" />
    </svg>
  );
}

export function PulseIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M2.5 10h3.2l2-5.5 3.6 11 2-5.5h4.2" />
    </svg>
  );
}

export function LogoutIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M8 3.5H5a1.5 1.5 0 00-1.5 1.5v10A1.5 1.5 0 005 16.5h3" />
      <path d="M12 6.5l3.5 3.5-3.5 3.5M15.5 10H8" />
    </svg>
  );
}

export function PlusIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

export function UsersIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="7.5" cy="7" r="2.8" />
      <path d="M2.5 16c0-2.8 2.2-4.6 5-4.6s5 1.8 5 4.6" />
      <circle cx="14" cy="8" r="2.2" />
      <path d="M14.5 11.8c2 .2 3.2 1.6 3.2 3.6" />
    </svg>
  );
}

export function HelpIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.7 8a2.4 2.4 0 014.6.8c0 1.6-2.3 1.9-2.3 3.2M10 14.4v.01" />
    </svg>
  );
}
