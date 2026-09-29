import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { Flash, StageBadge, Verified, ScoreRing, StatusBadge, Monogram, Redact } from '@/components/ui';
import PrivateDetails from '@/components/PrivateDetails';
import { LockIcon, UnlockIcon, ClockIcon } from '@/components/icons';
import { requestAccess } from '@/app/kabinet/actions';
import { formatDate } from '@/lib/labels';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { supabase } = await getSession();
  const { data } = await supabase.from('startups').select('name').eq('id', id).maybeSingle();
  return { title: data?.name ? `${data.name} — Investage` : 'Startap — Investage' };
}

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

  const isOwner = !!user && s.owner_id === user.id;
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
      <Link href="/startaplar" className="back">
        ← Startaplar
      </Link>
      <Flash searchParams={sp} />

      {/* ---------- OMMAVIY TANISHTIRUV ---------- */}
      <section className="card head-card">
        <div className="head-top">
          <Monogram name={s.name} size={64} />
          <div className="head-title">
            <h1>{s.name}</h1>
            {s.sector && <p className="muted">{s.sector}</p>}
          </div>
          <div className="ring-wrap">
            <ScoreRing value={s.score} size={64} />
            <small className="muted">Baho</small>
          </div>
        </div>
        {s.short_desc && <p className="head-desc">{s.short_desc}</p>}
        <div className="head-meta">
          <StageBadge stage={s.stage} />
          <Verified on={s.verified} />
          <span className="muted small">Qo&apos;shilgan: {formatDate(s.created_at)}</span>
        </div>
      </section>

      <div className="detail-grid">
        {/* ---------- YOPIQ QISM ---------- */}
        <section className="card">
          <div className="section-head sm">
            <h2>Batafsil ma&apos;lumot</h2>
            {priv ? (
              <span className="chip chip-ok">
                <i aria-hidden="true" />
                Ochiq
              </span>
            ) : (
              <span className="chip chip-muted">
                <i aria-hidden="true" />
                Yopiq
              </span>
            )}
          </div>
          {priv ? <PrivateDetails p={priv} /> : <Redacted />}
        </section>

        {/* ---------- RUXSAT HOLATI / HARAKAT ---------- */}
        <aside className="card access">
          <AccessPanel
            user={user}
            profile={profile}
            req={myRequest}
            startupId={s.id}
            isOwner={isOwner}
            hasAccess={!!priv && !isOwner}
          />
        </aside>
      </div>
    </>
  );
}

function Redacted() {
  return (
    <div className="dossier is-locked">
      <div className="figures">
        <div className="figure">
          <span>Kerakli mablag&apos;</span>
          <Redact w={124} />
        </div>
        <div className="figure">
          <span>Taklif qilinayotgan ulush</span>
          <Redact w={56} />
        </div>
      </div>
      <div className="block">
        <h3>Jamoa</h3>
        <Redact w={220} />
      </div>
      <div className="block">
        <h3>Kontaktlar</h3>
        <Redact w={160} />
      </div>
    </div>
  );
}

function AccessPanel({ user, profile, req, startupId, isOwner, hasAccess }) {
  if (isOwner) {
    return (
      <>
        <h2 className="access-title">Sizning sahifangiz</h2>
        <p className="muted">
          Investorlar tanishtiruvni ko&apos;radi. Yopiq qism faqat siz ruxsat bergan investorlarga ochiladi.
        </p>
        <div className="col">
          <Link className="btn btn-gold" href="/kabinet/startap">
            Profilni tahrirlash
          </Link>
          <Link className="btn btn-ghost" href="/kabinet/startap#sorovlar">
            So&apos;rovlarni ko&apos;rish
          </Link>
        </div>
      </>
    );
  }

  if (hasAccess) {
    return (
      <>
        <h2 className="access-title access-open">
          <UnlockIcon size={20} /> Ruxsat berilgan
        </h2>
        <p className="muted">
          Startap sizga batafsil ma&apos;lumotni ochdi{req?.decided_at ? ` (${formatDate(req.decided_at)})` : ''}. Kontaktlar
          chapdagi bo&apos;limda.
        </p>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <h2 className="access-title">
          <LockIcon size={20} /> Ma&apos;lumot yopiq
        </h2>
        <p className="muted">
          Summa, ulush va kontaktlarni ko&apos;rish uchun investor sifatida kiring va kirish so&apos;rovi yuboring.
        </p>
        <div className="col">
          <Link href="/kirish" className="btn btn-gold">
            Kirish
          </Link>
          <Link href="/royxat?rol=investor" className="btn btn-ghost">
            Investor sifatida ro&apos;yxatdan o&apos;tish
          </Link>
        </div>
      </>
    );
  }

  if (profile?.role !== 'investor') {
    return (
      <>
        <h2 className="access-title">
          <LockIcon size={20} /> Ma&apos;lumot yopiq
        </h2>
        <p className="muted">Bu ma&apos;lumotlar faqat startap ruxsat bergan investorlarga ochiladi.</p>
      </>
    );
  }

  if (req?.status === 'pending') {
    return (
      <>
        <h2 className="access-title">
          <ClockIcon size={20} /> So&apos;rov yuborildi
        </h2>
        <p className="muted">
          So&apos;rovingiz {formatDate(req.created_at)} da yuborilgan. Startap javob bergach, natija &laquo;So&apos;rovlarim&raquo;
          bo&apos;limida ko&apos;rinadi.
        </p>
        <StatusBadge status="pending" />
      </>
    );
  }

  const again = req?.status === 'rejected' || req?.status === 'revoked';
  return (
    <form action={requestAccess} className="request-form">
      <h2 className="access-title">
        <LockIcon size={20} /> Kirish so&apos;rovi
      </h2>
      <p className="muted">
        {again
          ? req.status === 'rejected'
            ? "Oldingi so'rovingiz rad etilgan. Qo'shimcha izoh bilan qayta so'rashingiz mumkin."
            : "Startap ruxsatni yopgan. Qayta so'rov yuborishingiz mumkin."
          : "Tasdiqlansa, ma'lumotlar faqat sizga ochiladi."}
      </p>
      <input type="hidden" name="startup_id" value={startupId} />
      <label>
        Xabar (ixtiyoriy)
        <textarea
          name="message"
          rows={4}
          maxLength={1000}
          placeholder="Kimligingiz va nima uchun qiziqayotganingiz haqida qisqacha"
        />
      </label>
      <button className="btn btn-gold" type="submit">
        {again ? "Qayta so'rov yuborish" : "Kirish so'rovini yuborish"}
      </button>
    </form>
  );
}
