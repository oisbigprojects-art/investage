const DAY = 86400000;

// Oxirgi N haftada har hafta nechta so'rov kelgan/yuborilgan
export function weeklyCounts(requests, weeks = 8, now = Date.now()) {
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const to = now - i * 7 * DAY;
    const from = to - 7 * DAY;
    const d = new Date(from + DAY);
    out.push({
      label: `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      value: requests.filter((r) => {
        const t = new Date(r.created_at).getTime();
        return t > from && t <= to;
      }).length,
    });
  }
  return out;
}

export function statusCounts(requests) {
  const c = { pending: 0, approved: 0, rejected: 0, revoked: 0 };
  for (const r of requests) if (c[r.status] !== undefined) c[r.status]++;
  return c;
}

// Qaror qabul qilinganlarning ulushi (ruxsat berilgan yoki keyin yopilgan / hamma qaror qilingan)
export function acceptRate(counts) {
  const decided = counts.approved + counts.rejected + counts.revoked;
  if (!decided) return null;
  return Math.round(((counts.approved + counts.revoked) / decided) * 100);
}

// Javob berish o'rtacha vaqti (soat). Yopilgan ruxsatlar hisobga olinmaydi: ularning decided_at yopilgan vaqt
export function avgResponseHours(requests) {
  const times = requests
    .filter((r) => (r.status === 'approved' || r.status === 'rejected') && r.decided_at)
    .map((r) => (new Date(r.decided_at) - new Date(r.created_at)) / 3600000)
    .filter((h) => h >= 0);
  if (!times.length) return null;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

export function formatHours(h, t) {
  if (h === null || h === undefined) return '—';
  if (h < 1) return t('hours.lt1');
  if (h < 24) return t('hours.h', { n: Math.round(h) });
  return t('hours.d', { n: Math.round(h / 24) });
}
