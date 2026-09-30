export const STAGES = {
  goya: "G'oya",
  mvp: 'MVP',
  daromad: 'Daromad bor',
};

export const STATUS = {
  pending: { label: 'Kutilmoqda', tone: 'warn' },
  approved: { label: 'Ruxsat berilgan', tone: 'ok' },
  rejected: { label: 'Rad etilgan', tone: 'bad' },
  revoked: { label: 'Ruxsat yopilgan', tone: 'muted' },
};

// Mirkomil belgilaguncha namunaviy qo'shimcha maydonlar (startup_private.extra ichida)
export const EXTRA_FIELDS = [
  { key: 'monthly_revenue', label: 'Oylik daromad (USD)' },
  { key: 'users_count', label: 'Foydalanuvchilar soni' },
];

export function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (isNaN(n)) return '—';
  return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

export function formatDate(v) {
  if (!v) return '';
  return new Date(v).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

// "3 soat oldin" ko'rinishida nisbiy vaqt
export function timeAgo(v, now = Date.now()) {
  if (!v) return '';
  const diff = now - new Date(v).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'kecha';
  if (d < 7) return `${d} kun oldin`;
  return formatDate(v);
}
