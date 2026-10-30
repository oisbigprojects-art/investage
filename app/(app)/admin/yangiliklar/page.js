import Link from 'next/link';
import { adminContext } from '@/lib/admin';
import { Flash } from '@/components/ui';
import { saveNews, deleteNews } from '@/app/admin-actions';

const fmt = (iso) => new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Tashkent' });

// Yangiliklar: yozilgani darhol saytda ko'rinadi va kirgan foydalanuvchilarga bildirishnoma bo'ladi
export default async function AdminNews({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const { data: rows } = await supabase.from('news').select('id, title, body, published_at').order('published_at', { ascending: false }).limit(50);
  const edit = rows?.find((n) => n.id === sp?.tahrir);

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>Yangiliklar</h1>
        <p className="muted">Saqlangan yangilik darhol saytda chiqadi va foydalanuvchilarga bildirishnoma bo'lib boradi. Faqat haqiqiy ma'lumot yozing.</p>
      </div>
      <Flash searchParams={sp} />

      <section className="card">
        <h2>{edit ? 'Tahrirlash' : 'Yangi yangilik'}</h2>
        <form action={saveNews} className="form" key={edit?.id || 'new'}>
          {edit && <input type="hidden" name="id" value={edit.id} />}
          <label>
            Sarlavha
            <input name="title" defaultValue={edit?.title || ''} required minLength={3} maxLength={140} />
          </label>
          <label>
            Matn
            <textarea name="body" rows={8} defaultValue={edit?.body || ''} required minLength={10} maxLength={6000} />
          </label>
          <div className="row">
            <button className="btn btn-gold" type="submit">{edit ? 'Saqlash' : 'Chop etish'}</button>
            {edit && <Link className="btn btn-ghost" href="/admin/yangiliklar">Bekor qilish</Link>}
          </div>
        </form>
      </section>

      <section className="card admin-list">
        {!rows?.length && <p className="muted">Hali yangilik yo'q.</p>}
        {rows?.map((n) => (
          <article key={n.id} className="admin-row">
            <div className="admin-main">
              <div>
                <Link href={`/yangiliklar/${n.id}`}><strong>{n.title}</strong></Link>
                <div className="muted small">{fmt(n.published_at)}</div>
              </div>
            </div>
            <div className="admin-actions">
              <Link className="btn btn-ghost btn-sm" href={`/admin/yangiliklar?tahrir=${n.id}`}>Tahrirlash</Link>
              <form action={deleteNews}>
                <input type="hidden" name="id" value={n.id} />
                <button className="btn btn-danger btn-sm" type="submit">O'chirish</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
