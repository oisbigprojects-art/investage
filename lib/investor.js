import { formatMoney } from '@/lib/labels';

export const INVESTOR_TYPES = ['angel', 'fund', 'corporate', 'family', 'other'];

// "$20 000 – $100 000" ko'rinishidagi chek oralig'i
export function checkRange(p, t) {
  const a = p.check_min != null ? formatMoney(p.check_min) : null;
  const b = p.check_max != null ? formatMoney(p.check_max) : null;
  if (a && b) return `${a} – ${b}`;
  if (a) return t('ivp.from', { v: a });
  if (b) return t('ivp.upto', { v: b });
  return null;
}

export function splitTags(s) {
  return String(s || '')
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);
}
