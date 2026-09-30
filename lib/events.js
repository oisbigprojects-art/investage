// So'rovlar va saqlashlardan faollik yozuvlari yasaladi (alohida jadval kerak emas).
// mine=true: harakatni foydalanuvchining o'zi qilgan. mine=false: boshqa tomon (bildirishnoma).
export function buildEvents(role, requests, saved = []) {
  const ev = [];
  for (const r of requests) {
    if (role === 'startup') {
      const who = r.investor?.full_name || 'Investor';
      ev.push({ id: `${r.id}-req`, at: r.created_at, kind: 'request', mine: false, text: `${who} kirish so'rovi yubordi`, href: '/kabinet/startap/sorovlar?holat=kutilmoqda' });
      if (r.status === 'approved') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'approved', mine: true, text: `Siz ${who} ga ruxsat berdingiz`, href: '/kabinet/startap/sorovlar?holat=ruxsat' });
      if (r.status === 'rejected') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'rejected', mine: true, text: `Siz ${who} so'rovini rad etdingiz`, href: '/kabinet/startap/sorovlar?holat=tarix' });
      if (r.status === 'revoked') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'revoked', mine: true, text: `Siz ${who} ruxsatini yopdingiz`, href: '/kabinet/startap/sorovlar?holat=tarix' });
    } else {
      const st = r.startup?.name || 'Startap';
      const href = `/startaplar/${r.startup_id}`;
      ev.push({ id: `${r.id}-req`, at: r.created_at, kind: 'request', mine: true, text: `Siz ${st} ga so'rov yubordingiz`, href });
      if (r.status === 'approved') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'approved', mine: false, text: `${st} sizga ruxsat berdi`, href });
      if (r.status === 'rejected') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'rejected', mine: false, text: `${st} so'rovingizni rad etdi`, href });
      if (r.status === 'revoked') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'revoked', mine: false, text: `${st} ruxsatni yopdi`, href });
    }
  }
  for (const s of saved) {
    ev.push({ id: `sv-${s.startup.id}`, at: s.created_at, kind: 'saved', mine: true, text: `Siz ${s.startup.name} ni saqladingiz`, href: `/startaplar/${s.startup.id}` });
  }
  return ev.filter((e) => e.at).sort((a, b) => new Date(b.at) - new Date(a.at));
}

// Bildirishnoma: boshqa tomon qilgan va foydalanuvchi hali ko'rmagan yozuvlar
export function notificationsOf(events, seenAt) {
  const seen = seenAt ? new Date(seenAt).getTime() : 0;
  const list = events.filter((e) => !e.mine);
  return { list, unread: list.filter((e) => new Date(e.at).getTime() > seen).length, seen };
}
