const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

const paths = {
  fintech: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.5 9.5v.01M17.5 14.5v.01" />
    </>
  ),
  edu: (
    <>
      <path d="M2.5 9.5L12 5l9.5 4.5L12 14 2.5 9.5z" />
      <path d="M6.5 11.8V16c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4.2" />
    </>
  ),
  health: (
    <>
      <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
      <path d="M12 9.5v4M10 11.5h4" />
    </>
  ),
  agro: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-3.5-2.2-5.5-5.5-5.5 0 3.5 2.2 5.5 5.5 5.5zM12 14.5c0-3.5 2.2-5.5 5.5-5.5 0 3.5-2.2 5.5-5.5 5.5z" />
    </>
  ),
  ecom: (
    <>
      <path d="M3 4h2.5l2 11h10l2-8H7" />
      <circle cx="9.5" cy="19" r="1.3" />
      <circle cx="16.5" cy="19" r="1.3" />
    </>
  ),
  logistics: (
    <>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </>
  ),
  it: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2.5" />
      <path d="M9.5 9.5L7.5 11l2 1.5M14.5 9.5l2 1.5-2 1.5M8 20h8M12 16.5V20" />
    </>
  ),
  tourism: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.6 2.4 3.6 5.2 3.6 8.5s-1 6.1-3.6 8.5c-2.6-2.4-3.6-5.2-3.6-8.5s1-6.1 3.6-8.5z" />
    </>
  ),
};

export const SECTOR_KEYS = Object.keys(paths);

export function SectorIcon({ name, size = 26 }) {
  return (
    <svg {...base} width={size} height={size}>
      {paths[name]}
    </svg>
  );
}

export function ArrowIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
