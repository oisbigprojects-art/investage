import Link from 'next/link';
import { adminContext, pageOf, qs, PAGE_SIZE } from '@/lib/admin';
import { pick } from '@/lib/cabinet';
import { Flash, Monogram } from '@/components/ui';
import AdminPager from '@/components/AdminPager';
import { setStartup } from '@/app/admin-actions';

const FILTERS = [
  ['', 'Hammasi'],
  ['real', 'Haqiqiy'],
  ['unverified', 'Tasdiqlanmagan'],
  ['verified', 'Tasdiqlangan'],
  ['hidden', 'Yashirin'],
  ['demo', 'Namunaviy'],
];
const STAGE = { goya: "G'oya", mvp: 'MVP', daromad: 'Daromad' };

export default async function AdminStartups({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const q = String(sp?.q || '').slice(0, 60);
  const filtr = pick(sp?.filtr, FILTERS.map((f) => f[0]), '');
  const page = pageOf(sp);
  const { data: rows } = await supabase.rpc('admin_startups', { p_q: q, p_filter: filtr, p_limit: PAGE_SIZE, p_offset: (page - 1) * PAGE_SIZE });
  const total = Number(rows?.[0]?.total ?? 0);
  const here = qs('/admin/startaplar', { q, filtr, sahifa: page });

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>Startaplar</h1>
        <p className="muted">Tasdiq belgisi, ball va ko'rinishni boshqaring. Har bir o'zgarish jurnalga yoziladi.</p>
      </div>
      <Flash searchParams={sp} />

      <form className="admin-search" action="/admin/startaplar" role="search">
        <input name="q" type="search" defaultValue={q} placeholder="Nomi, sohasi yoki egasining emaili" maxLength={60} aria-label="Qidirish" />
        {filtr && <input type="hidden" name="filtr" value={filtr} />}
        <button className="btn btn-ghost btn-sm" type="submit">Qidirish</button>
      </form>
      <div className="filters" role="group" aria-label="Filtr">
        {FILTERS.map(([k, label]) => (
          <Link key={k || 'all'} href={qs('/admin/startaplar', { q, filtr: k })} className={`filter ${filtr === k ? 'is-on' : ''}`}>{label}</Link>
        ))}
      </div>

      {!rows?.length ? (
        <div className="empty"><h3>Hech narsa topilmadi</h3></div>
      ) : (
        <section className="card admin-list">
          {rows.map((s) => (
            <article key={s.id} className="admin-row">
              <div className="admin-main">
                <Monogram name={s.name} size={40} />
                <div>
                  <Link href={`/startaplar/${s.id}`}><strong>{s.name}</strong></Link>
                  <div className="muted small">
                    {[s.sector, STAGE[s.stage] || s.stage].filter(Boolean).join(' · ')}
                    {' · '}{s.requests} ta so'rov
                  </div>
                  <div className="muted small">{s.is_demo ? 'Namunaviy startap' : `${s.owner_name || '—'} · ${s.owner_email || ''}`}</div>
                </div>
              </div>
              <div className="admin-flags">
                {s.is_demo && <span className="chip chip-muted">Namuna</span>}
                {s.verified && <span className="chip chip-ok">Tasdiqlangan</span>}
                {s.hidden && <span className="chip chip-warn">Yashirin</span>}
              </div>
              <div className="admin-actions">
                <form action={setStartup}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="back" value={here} />
                  <input type="hidden" name="verified" value={s.verified ? '0' : '1'} />
                  <button className={`btn btn-sm ${s.verified ? 'btn-ghost' : 'btn-gold'}`} type="submit">{s.verified ? 'Tasdiqni olib tashlash' : 'Tasdiqlash'}</button>
                </form>
                <form action={setStartup}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="back" value={here} />
                  <input type="hidden" name="hidden" value={s.hidden ? '0' : '1'} />
                  <button className="btn btn-ghost btn-sm" type="submit">{s.hidden ? "Qayta ko'rsatish" : 'Yashirish'}</button>
                </form>
                <form action={setStartup} className="admin-score">
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="back" value={here} />
                  <label>
                    <span className="visually-hidden">Ball</span>
                    <input name="score" type="number" min="0" max="100" step="1" defaultValue={s.score} aria-label={`${s.name} balli`} />
                  </label>
                  <button className="btn btn-ghost btn-sm" type="submit">Ball</button>
                </form>
              </div>
            </article>
          ))}
        </section>
      )}
      <AdminPager base="/admin/startaplar" params={{ q, filtr }} page={page} total={total} />
    </>
  );
}
