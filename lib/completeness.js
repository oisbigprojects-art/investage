// Startap profilining to'liqligi: har bir band bir xil vazn bilan
export function completeness(s, p) {
  const items = [
    { key: 'name', label: 'Startap nomi', done: !!s?.name },
    { key: 'sector', label: 'Soha', done: !!s?.sector },
    { key: 'short_desc', label: 'Qisqa tavsif', done: !!s?.short_desc },
    { key: 'logo', label: 'Logotip', done: !!s?.logo_url },
    { key: 'funding', label: "Kerakli mablag'", done: p?.funding_amount != null },
    { key: 'equity', label: 'Taklif qilinayotgan ulush', done: p?.equity_percent != null },
    { key: 'team', label: 'Jamoa haqida', done: !!p?.team },
    { key: 'contact', label: 'Kamida bitta kontakt', done: !!(p?.contact_email || p?.contact_phone || p?.contact_telegram) },
  ];
  const done = items.filter((i) => i.done).length;
  return { items, done, total: items.length, percent: Math.round((done / items.length) * 100) };
}
