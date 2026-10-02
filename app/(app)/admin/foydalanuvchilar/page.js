import Link from 'next/link';
import { adminContext, pageOf, qs, PAGE_SIZE } from '@/lib/admin';
import { pick } from '@/lib/cabinet';
import AdminPager from '@/components/AdminPager';

const ROLES = [
  ['', 'Hammasi'],
  ['startup', 'Startaplar'],
  ['investor', 'Investorlar'],
];
const fmt = (iso) => new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Tashkent' });

export default async function AdminUsers({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const q = String(sp?.q || '').slice(0, 60);
  const rol = pick(sp?.rol, ROLES.map((r) => r[0]), '');
  const page = pageOf(sp);
  const { data: rows } = await supabase.rpc('admin_users', { p_q: q, p_role: rol, p_limit: PAGE_SIZE, p_offset: (page - 1) * PAGE_SIZE });
  const total = Number(rows?.[0]?.total ?? 0);

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>Foydalanuvchilar</h1>
        <p className="muted">Ro'yxatdan o'tganlar. Bu yerda faqat umumiy ma'lumot ko'rinadi: yopiq startap ma'lumotlari va yozishmalar ochilmaydi.</p>
      </div>

      <form className="admin-search" action="/admin/foydalanuvchilar" role="search">
        <input name="q" type="search" defaultValue={q} placeholder="Ism, email, kompaniya yoki startap nomi" maxLength={60} aria-label="Qidirish" />
        {rol && <input type="hidden" name="rol" value={rol} />}
        <button className="btn btn-ghost btn-sm" type="submit">Qidirish</button>
      </form>
      <div className="filters" role="group" aria-label="Rol bo'yicha">
        {ROLES.map(([k, label]) => (
          <Link key={k || 'all'} href={qs('/admin/foydalanuvchilar', { q, rol: k })} className={`filter ${rol === k ? 'is-on' : ''}`}>{label}</Link>
        ))}
      </div>

      {!rows?.length ? (
        <div className="empty"><h3>Hech narsa topilmadi</h3></div>
      ) : (
        <section className="card admin-list">
          {rows.map((u) => (
            <article key={u.id} className="admin-row">
              <div className="admin-main">
                <div>
                  <strong>{u.full_name || '—'}</strong>
                  <div className="muted small">{u.email}</div>
                  <div className="muted small">
                    {[u.company, u.startup_name && `Startap: ${u.startup_name}`].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
              <div className="admin-flags">
                <span className="chip chip-muted">{u.role === 'startup' ? 'Startap' : 'Investor'}</span>
                {u.is_demo && <span className="chip chip-muted">Namuna</span>}
              </div>
              <div className="admin-actions">
                <span className="muted small">{fmt(u.created_at)}</span>
                {u.startup_id && <Link className="btn btn-ghost btn-sm" href={`/startaplar/${u.startup_id}`}>Startap sahifasi</Link>}
                {u.role === 'investor' && <Link className="btn btn-ghost btn-sm" href={`/investorlar/${u.id}`}>Profil</Link>}
              </div>
            </article>
          ))}
        </section>
      )}
      <AdminPager base="/admin/foydalanuvchilar" params={{ q, rol }} page={page} total={total} />
    </>
  );
}
