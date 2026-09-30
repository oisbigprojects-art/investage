import { LOCALES } from '@/lib/i18n/format';

export const STAGE_KEYS = ['goya', 'mvp', 'daromad'];

export const STATUS_TONE = {
  pending: 'warn',
  approved: 'ok',
  rejected: 'bad',
  revoked: 'muted',
};

// Mirkomil belgilaguncha namunaviy qo'shimcha maydonlar (startup_private.extra ichida).
// Sarlavhalari lug'atda: extra.<key>
export const EXTRA_FIELDS = [{ key: 'monthly_revenue' }, { key: 'users_count' }];

export function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (isNaN(n)) return '—';
  return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

// t: makeT() natijasi (til shundan olinadi)
export function formatDate(v, t) {
  if (!v) return '';
  return new Date(v).toLocaleDateString(LOCALES[t?.lang] || 'uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

// "3 soat oldin" ko'rinishida nisbiy vaqt
export function timeAgo(v, t, now = Date.now()) {
  if (!v) return '';
  const diff = now - new Date(v).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('ago.now');
  if (min < 60) return t.n('ago.min', min);
  const h = Math.floor(min / 60);
  if (h < 24) return t.n('ago.hour', h);
  const d = Math.floor(h / 24);
  if (d === 1) return t('ago.yesterday');
  if (d < 7) return t.n('ago.day', d);
  return formatDate(v, t);
}
