// Startap profilining to'liqligi: har bir band bir xil vazn bilan.
// Sarlavhalari lug'atda: comp.<key>
export function completeness(s, p) {
  const items = [
    { key: 'name', done: !!s?.name },
    { key: 'sector', done: !!s?.sector },
    { key: 'short_desc', done: !!s?.short_desc },
    { key: 'logo', done: !!s?.logo_url },
    { key: 'funding', done: p?.funding_amount != null },
    { key: 'equity', done: p?.equity_percent != null },
    { key: 'team', done: !!p?.team },
    { key: 'contact', done: !!(p?.contact_email || p?.contact_phone || p?.contact_telegram) },
  ];
  const done = items.filter((i) => i.done).length;
  return { items, done, total: items.length, percent: Math.round((done / items.length) * 100) };
}
