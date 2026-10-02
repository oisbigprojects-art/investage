import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession, getAuthUser } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash, StageBadge, Verified, ScoreRing, StatusBadge, Monogram, Redact } from '@/components/ui';
import PrivateDetails from '@/components/PrivateDetails';
import { LockIcon, UnlockIcon, ClockIcon, ChatIcon } from '@/components/icons';
import DocList from '@/components/DocList';
import { withLinks } from '@/lib/docs';
import { getDocuments } from '@/lib/data';
import SaveButton from '@/components/SaveButton';
import { requestAccess, withdrawRequest } from '@/app/cabinet-actions';
import { formatDate } from '@/lib/labels';

// Sarlavha va sahifa bitta so'rovdan foydalanadi
const getStartup = cache(async (id) => {
  const { supabase } = await getAuthUser();
  const { data } = await supabase
    .from('startups')
    .select('id, owner_id, name, sector, short_desc, stage, score, verified, created_at, logo_url, hidden, is_demo')
    .eq('id', id)
    .maybeSingle();
  return data;
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const [data, t] = await Promise.all([getStartup(id), getT()]);
  if (!data?.name) return { title: t('meta.startup_default') };
  const title = `${data.name} — Investage`;
  const description = (data.short_desc || t('meta.site_desc')).slice(0, 200);
  return {
    title,
    description,
    alternates: { canonical: `/startaplar/${id}` },
    openGraph: { type: 'article', siteName: 'Investage', title, description, url: `/startaplar/${id}`, images: [{ url: '/og.png', width: 1200, height: 630, alt: data.name }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}

export default async function StartupDetail({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, user: authUser } = await getAuthUser();

  // Hammasi bir vaqtda (profil ham): startap, yopiq qism (RLS: egasi yoki tasdiqlangan investor), mening so'rovim, saqlanganmi.
  // So'rov va saqlash filtrlari investor_id = o'zim bo'yicha, boshqa rolda bo'sh qaytadi.
  const [t, { profile }, s, { data: priv }, { data: myRequest }, { data: sv }] = await Promise.all([
    getT(),
    getSession(),
    getStartup(id),
    authUser ? supabase.from('startup_private').select('*').eq('startup_id', id).maybeSingle() : { data: null },
    authUser
      ? supabase
          .from('access_requests')
          .select('id, status, created_at, decided_at')
          .eq('startup_id', id)
          .eq('investor_id', authUser.id)
          .maybeSingle()
      : { data: null },
    authUser
      ? supabase.from('saved_startups').select('startup_id').eq('investor_id', authUser.id).eq('startup_id', id).maybeSingle()
      : { data: null },
  ]);
  const user = profile ? authUser : null;
  const isInvestor = profile?.role === 'investor';
  if (!s) notFound();
  const isOwner = !!user && s.owner_id === user.id;
  const isSaved = !!sv;
  // Hujjatlar: egasiga va ruxsat olgan investorga (RLS boshqalarga bo'sh qaytaradi)
  const canDocs = isOwner || (!!priv && !!user);
  const docs = canDocs ? await withLinks(supabase, await getDocuments(s.id)) : [];

  return (
    <>
      <Link href="/startaplar" className="back">
        {t('detail.back')}
      </Link>
      <Flash searchParams={sp} />
      {isOwner && s.hidden && (
        <div className="flash flash-warn" role="status">
          {t('detail.hidden_a')} <Link href="/kabinet/startap">{t('detail.hidden_link')}</Link>
          {t('detail.hidden_b')}
        </div>
      )}

      {s.is_demo && (
        <div className="flash flash-warn" role="note">
          {t('demo.notice')}
        </div>
      )}

      {/* ---------- OMMAVIY TANISHTIRUV ---------- */}
      <section className="card head-card">
        <div className="head-top">
          <Monogram name={s.name} logo={s.logo_url} size={64} />
          <div className="head-title">
            <h1>{s.name}</h1>
            {s.sector && <p className="muted">{s.sector}</p>}
          </div>
          <div className="ring-wrap">
            <ScoreRing value={s.score} size={64} t={t} />
            <small className="muted">{t('ui.score')}</small>
          </div>
        </div>
        {s.short_desc && <p className="head-desc">{s.short_desc}</p>}
        <div className="head-meta">
          <StageBadge stage={s.stage} t={t} />
          <Verified on={s.verified} t={t} />
          <span className="muted small">{t('detail.joined', { date: formatDate(s.created_at, t) })}</span>
          {isInvestor && <SaveButton startupId={s.id} saved={isSaved} back={`/startaplar/${s.id}`} withLabel t={t} />}
        </div>
      </section>

      <div className="detail-grid">
        {/* ---------- YOPIQ QISM ---------- */}
        <section className="card">
          <div className="section-head sm">
            <h2>{t('detail.info')}</h2>
            {priv ? (
              <span className="chip chip-ok">
                <i aria-hidden="true" />
                {t('detail.open')}
              </span>
            ) : (
              <span className="chip chip-muted">
                <i aria-hidden="true" />
                {t('detail.closed')}
              </span>
            )}
          </div>
          {priv ? <PrivateDetails p={priv} t={t} /> : <Redacted t={t} />}
        </section>

        {/* ---------- RUXSAT HOLATI / HARAKAT ---------- */}
        <aside className="card access">
          <AccessPanel
            t={t}
            user={user}
            profile={profile}
            req={myRequest}
            startupId={s.id}
            isOwner={isOwner}
            hasAccess={!!priv && !isOwner}
          />
        </aside>
      </div>

      {/* ---------- HUJJATLAR (pitch deck va boshqalar) ---------- */}
      {canDocs ? (
        <section className="card">
          <div className="section-head sm">
            <h2>{t('doc.public_title')}</h2>
            {isOwner && <Link href="/kabinet/startap/hujjatlar">{t('doc.manage')}</Link>}
          </div>
          <DocList docs={docs} t={t} empty={isOwner ? t('doc.empty') : t('doc.empty_investor')} />
        </section>
      ) : (
        <section className="card docs-locked">
          <LockIcon size={18} />
          <span className="muted">{t('doc.locked')}</span>
        </section>
      )}
    </>
  );
}

function Redacted({ t }) {
  return (
    <div className="dossier is-locked">
      <div className="figures">
        <div className="figure">
          <span>{t('pd.funding')}</span>
          <Redact w={124} />
        </div>
        <div className="figure">
          <span>{t('pd.equity')}</span>
          <Redact w={56} />
        </div>
      </div>
      <div className="block">
        <h3>{t('pd.team')}</h3>
        <Redact w={220} />
      </div>
      <div className="block">
        <h3>{t('pd.contacts')}</h3>
        <Redact w={160} />
      </div>
    </div>
  );
}

function AccessPanel({ t, user, profile, req, startupId, isOwner, hasAccess }) {
  if (isOwner) {
    return (
      <>
        <h2 className="access-title">{t('access.owner_title')}</h2>
        <p className="muted">{t('access.owner_text')}</p>
        <div className="col">
          <Link className="btn btn-gold" href="/kabinet/startap/profil">
            {t('access.owner_edit')}
          </Link>
          <Link className="btn btn-ghost" href="/kabinet/startap/sorovlar">
            {t('access.owner_requests')}
          </Link>
          <Link className="btn btn-ghost" href="/kabinet/xabarlar">
            {t('shell.messages')}
          </Link>
        </div>
      </>
    );
  }

  if (hasAccess) {
    return (
      <>
        <h2 className="access-title access-open">
          <UnlockIcon size={20} /> {t('access.granted_title')}
        </h2>
        <p className="muted">{t('access.granted_text', { when: req?.decided_at ? ` (${formatDate(req.decided_at, t)})` : '' })}</p>
        {req?.id && (
          <div className="col">
            <Link className="btn btn-gold" href={`/kabinet/xabarlar/${req.id}`}>
              <ChatIcon size={18} /> {t('chat.write')}
            </Link>
          </div>
        )}
      </>
    );
  }

  if (!user) {
    return (
      <>
        <h2 className="access-title">
          <LockIcon size={20} /> {t('access.locked_title')}
        </h2>
        <p className="muted">{t('access.guest_text')}</p>
        <div className="col">
          <Link href="/kirish" className="btn btn-gold">
            {t('nav.login')}
          </Link>
          <Link href="/royxat?rol=investor" className="btn btn-ghost">
            {t('home.investor_cta')}
          </Link>
        </div>
      </>
    );
  }

  if (profile?.role !== 'investor') {
    return (
      <>
        <h2 className="access-title">
          <LockIcon size={20} /> {t('access.locked_title')}
        </h2>
        <p className="muted">{t('access.other_text')}</p>
      </>
    );
  }

  if (req?.status === 'pending') {
    return (
      <>
        <h2 className="access-title">
          <ClockIcon size={20} /> {t('access.pending_title')}
        </h2>
        <p className="muted">{t('access.pending_text', { date: formatDate(req.created_at, t) })}</p>
        <StatusBadge status="pending" t={t} />
        <form action={withdrawRequest}>
          <input type="hidden" name="request_id" value={req.id} />
          <input type="hidden" name="back" value={`/startaplar/${startupId}`} />
          <button className="btn btn-ghost btn-sm" type="submit">
            {t('access.withdraw')}
          </button>
        </form>
      </>
    );
  }

  const again = req?.status === 'rejected' || req?.status === 'revoked';
  return (
    <form action={requestAccess} className="request-form">
      <h2 className="access-title">
        <LockIcon size={20} /> {t('access.form_title')}
      </h2>
      <p className="muted">
        {again ? (req.status === 'rejected' ? t('access.form_rejected') : t('access.form_revoked')) : t('access.form_fresh')}
      </p>
      <input type="hidden" name="startup_id" value={startupId} />
      <label>
        {t('access.message')}
        <textarea
          name="message"
          rows={4}
          maxLength={1000}
          placeholder={t('access.message_ph')}
        />
      </label>
      <button className="btn btn-gold" type="submit">
        {again ? t('access.send_again') : t('access.send')}
      </button>
    </form>
  );
}
