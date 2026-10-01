// So'rovlar va saqlashlardan faollik yozuvlari yasaladi (alohida jadval kerak emas).
// mine=true: harakatni foydalanuvchining o'zi qilgan. mine=false: boshqa tomon (bildirishnoma).
export function buildEvents(role, requests, saved = [], t) {
  const ev = [];
  for (const r of requests) {
    if (role === 'startup') {
      const who = r.investor?.full_name || t('ev.investor_default');
      if (r.initiated_by === 'startup') {
        ev.push({ id: `${r.id}-req`, at: r.created_at, kind: 'offer', mine: true, text: t('ev.s_offer', { who }), href: `/investorlar/${r.investor_id}` });
        if (r.status === 'rejected') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'rejected', mine: false, text: t('ev.s_offer_declined', { who }), href: `/investorlar/${r.investor_id}` });
        continue;
      }
      ev.push({ id: `${r.id}-req`, at: r.created_at, kind: 'request', mine: false, text: t('ev.s_request', { who }), href: '/kabinet/startap/sorovlar?holat=kutilmoqda' });
      if (r.status === 'approved') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'approved', mine: true, text: t('ev.s_approved', { who }), href: '/kabinet/startap/sorovlar?holat=ruxsat' });
      if (r.status === 'rejected') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'rejected', mine: true, text: t('ev.s_rejected', { who }), href: '/kabinet/startap/sorovlar?holat=tarix' });
      if (r.status === 'revoked') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'revoked', mine: true, text: t('ev.s_revoked', { who }), href: '/kabinet/startap/sorovlar?holat=tarix' });
    } else {
      const st = r.startup?.name || t('ev.startup_default');
      const href = `/startaplar/${r.startup_id}`;
      if (r.initiated_by === 'startup') {
        ev.push({ id: `${r.id}-req`, at: r.created_at, kind: 'offer', mine: false, text: t('ev.i_offer', { who: st }), href });
        if (r.status === 'rejected') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'rejected', mine: true, text: t('ev.i_offer_declined', { who: st }), href });
        if (r.status === 'revoked') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'revoked', mine: false, text: t('ev.i_revoked', { who: st }), href });
        continue;
      }
      ev.push({ id: `${r.id}-req`, at: r.created_at, kind: 'request', mine: true, text: t('ev.i_request', { who: st }), href });
      if (r.status === 'approved') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'approved', mine: false, text: t('ev.i_approved', { who: st }), href });
      if (r.status === 'rejected') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'rejected', mine: false, text: t('ev.i_rejected', { who: st }), href });
      if (r.status === 'revoked') ev.push({ id: `${r.id}-dec`, at: r.decided_at, kind: 'revoked', mine: false, text: t('ev.i_revoked', { who: st }), href });
    }
  }
  for (const s of saved) {
    ev.push({ id: `sv-${s.startup.id}`, at: s.created_at, kind: 'saved', mine: true, text: t('ev.i_saved', { who: s.startup.name }), href: `/startaplar/${s.startup.id}` });
  }
  return ev.filter((e) => e.at).sort((a, b) => new Date(b.at) - new Date(a.at));
}

// Bildirishnoma: boshqa tomon qilgan va foydalanuvchi hali ko'rmagan yozuvlar
export function notificationsOf(events, seenAt) {
  const seen = seenAt ? new Date(seenAt).getTime() : 0;
  const list = events.filter((e) => !e.mine);
  return { list, unread: list.filter((e) => new Date(e.at).getTime() > seen).length, seen };
}
