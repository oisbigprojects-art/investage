import Link from 'next/link';
import { adminContext } from '@/lib/admin';
import { Flash } from '@/components/ui';

const ACT = {
  startup_update: (d) => {
    const bits = [];
    if (d?.verified && d.verified[0] !== d.verified[1]) bits.push(d.verified[1] ? 'tasdiqlandi' : 'tasdiq olib tashlandi');
    if (d?.hidden && d.hidden[0] !== d.hidden[1]) bits.push(d.hidden[1] ? 'yashirildi' : "qayta ko'rsatildi");
    if (d?.score && d.score[0] !== d.score[1]) bits.push(`ball ${d.score[0]} → ${d.score[1]}`);
    return bits.join(', ') || "o'zgarish yo'q";
  },
};

const fmt = (iso) => new Date(iso).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tashkent' });

// Platforma holati: faqat sonlar. Startaplarning yopiq ma'lumotlari va yozishmalar adminga ochilmaydi.
export default async function AdminHome({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const [{ data: o }, { data: log }] = await Promise.all([supabase.rpc('admin_overview'), supabase.rpc('admin_log', { p_limit: 12 })]);
  const n = (k) => Number(o?.[k] ?? 0);

  const cards = [
    { b: n('users'), l: 'Foydalanuvchilar', s: `${n('startup_users')} startap · ${n('investor_users')} investor`, href: '/admin/foydalanuvchilar' },
    { b: n('users_7d'), l: "Oxirgi 7 kunda qo'shilgan", s: `30 kunda: ${n('users_30d')}`, href: '/admin/foydalanuvchilar' },
    { b: n('startups'), l: 'Startaplar', s: `${n('startups_verified')} tasdiqlangan · ${n('startups_hidden')} yashirin`, href: '/admin/startaplar?filtr=real' },
    { b: n('req_pending'), l: "Kutilayotgan so'rovlar", s: `${n('req_approved')} ruxsat berilgan · ${n('req_rejected')} rad/yopilgan` },
    { b: n('messages'), l: 'Xabarlar (chat)', s: 'faqat soni, mazmuni ko\'rinmaydi' },
    { b: n('documents'), l: 'Yuklangan hujjatlar', s: 'faqat soni' },
    { b: n('feedback_new'), l: 'Yangi murojaatlar', s: `jami: ${n('feedback_total')}`, href: '/admin/murojaatlar?holat=new' },
    { b: n('demo_startups') + n('demo_investors'), l: 'Namunaviy yozuvlar', s: `${n('demo_startups')} startap · ${n('demo_investors')} investor (statistikaga kirmaydi)` },
  ];

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>Platforma holati</h1>
        <p className="muted">Haqiqiy foydalanuvchilar bo'yicha ko'rsatkichlar. Namunaviy (demo) yozuvlar hisobga olinmaydi.</p>
      </div>
      <Flash searchParams={sp} />

      <div className="stats stats-4 admin-stats">
        {cards.map((c) => {
          const inner = (
            <>
              <b>{c.b}</b>
              <span>{c.l}</span>
              <small className="muted">{c.s}</small>
            </>
          );
          return c.href ? (
            <Link key={c.l} href={c.href} className="stat stat-link">{inner}</Link>
          ) : (
            <div key={c.l} className="stat">{inner}</div>
          );
        })}
      </div>

      <section className="card">
        <div className="section-head sm">
          <h2>Oxirgi admin amallari</h2>
        </div>
        {!log?.length ? (
          <p className="muted small">Hali amal bajarilmagan.</p>
        ) : (
          <ul className="admin-log">
            {log.map((a) => (
              <li key={a.id}>
                <span>
                  <b>{a.target}</b> — {(ACT[a.action] || (() => a.action))(a.detail)}
                </span>
                <span className="muted small">
                  {a.admin_email} · <time>{fmt(a.created_at)}</time>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
