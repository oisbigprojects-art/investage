import Link from 'next/link';
import { adminContext, pageOf, qs, PAGE_SIZE } from '@/lib/admin';
import { pick } from '@/lib/cabinet';
import { Flash } from '@/components/ui';
import AdminPager from '@/components/AdminPager';
import { setFeedback } from '@/app/admin-actions';

const STATES = [
  ['', 'Hammasi'],
  ['new', 'Yangi'],
  ['seen', "Ko'rilgan"],
  ['done', 'Hal qilingan'],
];
const KIND = { feedback: 'Fikr', support: "Yordam so'rovi", bug: 'Xato haqida' };
const fmt = (iso) => new Date(iso).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tashkent' });

export default async function AdminFeedback({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const holat = pick(sp?.holat, STATES.map((s) => s[0]), '');
  const page = pageOf(sp);
  const { data: rows } = await supabase.rpc('admin_feedback', { p_status: holat, p_limit: PAGE_SIZE, p_offset: (page - 1) * PAGE_SIZE });
  const total = Number(rows?.[0]?.total ?? 0);
  const here = qs('/admin/murojaatlar', { holat, sahifa: page });

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>Murojaatlar</h1>
        <p className="muted">«Fikr va yordam» bo'limidan kelgan xabarlar. Yangilari Telegramga ham yuboriladi.</p>
      </div>
      <Flash searchParams={sp} />

      <div className="filters" role="group" aria-label="Holat bo'yicha">
        {STATES.map(([k, label]) => (
          <Link key={k || 'all'} href={qs('/admin/murojaatlar', { holat: k })} className={`filter ${holat === k ? 'is-on' : ''}`}>{label}</Link>
        ))}
      </div>

      {!rows?.length ? (
        <div className="empty"><h3>Murojaatlar yo'q</h3></div>
      ) : (
        <section className="card admin-list">
          {rows.map((f) => (
            <article key={f.id} className={`admin-row admin-fb ${f.status === 'done' ? 'is-done' : ''}`}>
              <div className="admin-main admin-fb-main">
                <div>
                  <div className="admin-fb-top">
                    <span className="chip chip-muted">{KIND[f.kind] || f.kind}</span>
                    {f.status === 'new' && <span className="chip chip-warn">Yangi</span>}
                    {f.status === 'done' && <span className="chip chip-ok">Hal qilingan</span>}
                    <time className="muted small">{fmt(f.created_at)}</time>
                  </div>
                  <p className="admin-fb-msg">{f.message}</p>
                  <div className="muted small">
                    {[f.name, f.email].filter(Boolean).join(' · ') || 'Mehmon'}
                    {f.page ? ` · sahifa: ${f.page}` : ''}
                    {f.user_id ? ' · ro\'yxatdan o\'tgan' : ''}
                  </div>
                </div>
              </div>
              <div className="admin-actions">
                {[['seen', "Ko'rildi"], ['done', 'Hal qilindi'], ['new', 'Yangi deb belgilash']]
                  .filter(([s]) => s !== f.status)
                  .map(([s, label]) => (
                    <form key={s} action={setFeedback}>
                      <input type="hidden" name="id" value={f.id} />
                      <input type="hidden" name="status" value={s} />
                      <input type="hidden" name="back" value={here} />
                      <button className={`btn btn-sm ${s === 'done' ? 'btn-gold' : 'btn-ghost'}`} type="submit">{label}</button>
                    </form>
                  ))}
                {f.email && /^[^\s@<>?&]+@[^\s@<>?&]+$/.test(f.email) && <a className="btn btn-ghost btn-sm" href={`mailto:${f.email}`}>Javob yozish</a>}
              </div>
            </article>
          ))}
        </section>
      )}
      <AdminPager base="/admin/murojaatlar" params={{ holat }} page={page} total={total} />
    </>
  );
}
