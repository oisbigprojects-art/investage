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
  { key: 'monthly_revenue', label: "Oylik daromad (so'm)" },
  { key: 'users_count', label: 'Foydalanuvchilar soni' },
];

export function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '—';
  return new Intl.NumberFormat('uz-UZ').format(Number(v)) + " so'm";
}

export function formatDate(v) {
  if (!v) return '';
  return new Date(v).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}
