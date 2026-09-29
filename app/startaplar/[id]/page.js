import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { Flash, StageBadge, Verified, Score, StatusBadge } from '@/components/ui';
import PrivateDetails from '@/components/PrivateDetails';
import { LockIcon } from '@/components/StartupCard';
import { requestAccess } from '@/app/kabinet/actions';
import { formatDate } from '@/lib/labels';

export default async function StartupDetail({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, user, profile } = await getSession();

  const { data: s } = await supabase
    .from('startups')
    .select('id, owner_id, name, sector, short_desc, stage, score, verified, created_at')
    .eq('id', id)
    .maybeSingle();
  if (!s) notFound();

  const isOwner = user && s.owner_id === user.id;
  const isInvestor = profile?.role === 'investor';

  // RLS: faqat egasi yoki tasdiqlangan investor uchun qator qaytadi
  const { data: priv } = user
    ? await supabase.from('startup_private').select('*').eq('startup_id', s.id).maybeSingle()
    : { data: null };

  let myRequest = null;
  if (isInvestor) {
    const { data } = await supabase
      .from('access_requests')
      .select('id, status, created_at, decided_at')
      .eq('startup_id', s.id)
      .eq('investor_id', user.id)
      .maybeSingle();
    myRequest = data;
  }

  return (
    <>
      <Link href="/startaplar" className="back">← Startaplar</Link>
      <Flash searchParams={sp} />

      {isOwner && (
        <div className="flash flash-info">
          Bu sizning sahifangiz. Investorlar ochiq qismni ko&apos;radi, yopiq qism faqat siz ruxsat berganlarga ochiladi.
        </div>
      )}

      {/* ---------- OMMAVIY TEASER ---------- */}
      <section className="card detail-head">
        <div className="detail-title">
          <h1>{s.name}</h1>
          <Verified on={s.verified} />
        </div>
        {s.sector && <div className="muted">{s.sector}</div>}
        {s.short_desc && <p className="detail-desc">{s.short_desc}</p>}
        <div className="detail-meta">
          <StageBadge stage={s.stage} />
          <Score value={s.score} />
          <span className="muted small">Qo&apos;shilgan: {formatDate(s.created_at)}</span>
        </div>
      </section>

      {/* ---------- YOPIQ QISM ---------- */}
      <section className="card">
        <div className="section-head">
          <h2>Batafsil ma&apos;lumot</h2>
          {myRequest && <StatusBadge status={myRequest.status} />}
        </div>

        {priv ? (
          <PrivateDetails p={priv} />
        ) : (
          <div className="locked">
            <div className="locked-blur" aria-hidden="true">
              <div className="kv"><span>Kerakli mablag&apos;</span><strong>███ ███ so&apos;m</strong></div>
              <div className="kv"><span>Ulush</span><strong>██%</strong></div>
              <div className="kv"><span>Kontaktlar</span><strong>████████</strong></div>
            </div>
            <div className="locked-panel">
              <LockIcon />
              <LockedAction user={user} profile={profile} req={myRequest} startupId={s.id} />
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function LockedAction({ user, profile, req, startupId }) {
  if (!user) {
    return (
      <>
        <p>Summa, ulush va kontaktlarni ko&apos;rish uchun investor sifatida kiring va so&apos;rov yuboring.</p>
        <div className="row">
          <Link href="/kirish" className="btn btn-primary">Kirish</Link>
          <Link href="/royxat?rol=investor" className="btn btn-ghost">Investor sifatida ro&apos;yxatdan o&apos;tish</Link>
        </div>
      </>
    );
  }
  if (profile?.role !== 'investor') {
    return <p>Bu ma&apos;lumotlar faqat startap ruxsat bergan investorlarga ochiladi.</p>;
  }
  if (req?.status === 'pending') {
    return (
      <p>
        So&apos;rovingiz {formatDate(req.created_at)} da yuborilgan. Startap javobini kutyapmiz — natija
        &laquo;So&apos;rovlarim&raquo; bo&apos;limida ko&apos;rinadi.
      </p>
    );
  }

  const again = req?.status === 'rejected' || req?.status === 'revoked';
  return (
    <form action={requestAccess} className="request-form">
      <p>
        {again
          ? req.status === 'rejected'
            ? "Oldingi so'rovingiz rad etilgan. Qo'shimcha izoh bilan qayta so'rashingiz mumkin."
            : "Startap ruxsatni yopgan. Qayta so'rov yuborishingiz mumkin."
          : "Startapga kirish so'rovi yuboring. Tasdiqlansa, ma'lumotlar faqat sizga ochiladi."}
      </p>
      <input type="hidden" name="startup_id" value={startupId} />
      <textarea
        name="message"
        rows={3}
        maxLength={1000}
        placeholder="Qisqacha o'zingiz haqingizda va nima uchun qiziqayotganingiz (ixtiyoriy)"
      />
      <button className="btn btn-primary" type="submit">
        {again ? "Qayta so'rov yuborish" : "Kirish so'rovini yuborish"}
      </button>
    </form>
  );
}
