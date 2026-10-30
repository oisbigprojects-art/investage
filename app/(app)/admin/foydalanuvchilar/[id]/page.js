import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminContext } from '@/lib/admin';
import { Flash } from '@/components/ui';
import { clearVideo, setBlocked } from '@/app/admin-actions';

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tashkent' }) : '—');

// Bitta foydalanuvchi: umumiy ma'lumot va bloklash. Yopiq startap ma'lumotlari va yozishmalar ko'rinmaydi.
export default async function AdminUser({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const { data: u, error } = await supabase.rpc('admin_user_detail', { p_id: id });
  if (error || !u) notFound();
  const rows = [
    ['Email', u.email],
    ['Roli', u.role === 'startup' ? 'Startap' : 'Investor'],
    ['Kompaniya', u.company || '—'],
    ['Shahar', u.city || '—'],
    ["Ro'yxatdan o'tgan", fmt(u.created_at)],
    ['Oxirgi kirish', fmt(u.last_sign_in_at)],
    ['Email tasdiqlangan', u.confirmed ? 'Ha' : "Yo'q"],
    ['Ikki bosqichli kirish', u.mfa ? 'Yoqilgan' : "O'chiq"],
    ["So'rovlar soni", u.requests],
  ];

  return (
    <>
      <Link href="/admin/foydalanuvchilar" className="back">← Foydalanuvchilar</Link>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>{u.full_name || '—'}</h1>
        {u.blocked && <p><span className="chip chip-muted">Bloklangan</span></p>}
      </div>
      <Flash searchParams={sp} />

      <section className="card">
        <dl className="admin-facts">
          {rows.map(([k, v]) => (
            <div key={k}><dt className="muted small">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </section>

      {u.startup && (
        <section className="card">
          <div className="section-head sm">
            <h2>{u.startup.name}</h2>
            <Link href={`/startaplar/${u.startup.id}`}>Sahifasi</Link>
          </div>
          <p className="muted">
            {[u.startup.verified ? 'Tasdiqlangan' : 'Tasdiqlanmagan', u.startup.hidden ? 'Yashirin' : u.startup.listed ? 'Katalogda' : "Profil to'liq emas", u.startup.score != null && `Ball: ${u.startup.score}`].filter(Boolean).join(' · ')}
          </p>
          {u.startup.video_url && (
            <>
              <video className="pitch-video" src={u.startup.video_url} controls playsInline preload="metadata" />
              <form action={clearVideo}>
                <input type="hidden" name="startup" value={u.startup.id} />
                <input type="hidden" name="user" value={u.id} />
                <button className="btn btn-danger btn-sm" type="submit">Videoni o'chirish</button>
              </form>
            </>
          )}
        </section>
      )}

      {!u.is_admin && (
        <section className="card danger-zone">
          <h2>{u.blocked ? 'Blokdan chiqarish' : 'Bloklash'}</h2>
          <p className="muted">
            {u.blocked
              ? 'Foydalanuvchi yana kira oladi. Startapi avtomatik qaytmaydi: uni Startaplar bo‘limida alohida oching.'
              : 'Foydalanuvchi darhol tizimdan chiqariladi va qayta kira olmaydi. Startapi katalogdan yashiriladi. Amal jurnalga yoziladi.'}
          </p>
          <form action={setBlocked}>
            <input type="hidden" name="id" value={u.id} />
            <input type="hidden" name="blocked" value={u.blocked ? '0' : '1'} />
            <button className={`btn ${u.blocked ? 'btn-ghost' : 'btn-danger'}`} type="submit">
              {u.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
