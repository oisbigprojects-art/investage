import { Suspense } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { pickStrings } from '@/lib/i18n';
import StartupCard from '@/components/StartupCard';
import SealedDemo, { DEMO_KEYS } from '@/components/SealedDemo';
import { ScoreRing } from '@/components/ui';
import { CheckIcon, LockIcon, SealIcon } from '@/components/icons';

// Rolga bog'liq tugmalar (sessiya keyin keladi, matn esa darrov ko'rinadi)
async function HeroActions() {
  const [{ profile }, t] = await Promise.all([getSession(), getT()]);
  return profile ? (
    <div className="row">
      <Link className="btn btn-gold" href="/kabinet">
        {t('home.cta_cabinet')}
      </Link>
      <Link className="btn btn-ghost" href="/startaplar">
        {t('home.cta_browse')}
      </Link>
    </div>
  ) : (
    <div className="row">
      <Link className="btn btn-gold" href="/royxat?rol=startup">
        {t('home.cta_startup')}
      </Link>
      <Link className="btn btn-ghost" href="/royxat?rol=investor">
        {t('home.cta_investor')}
      </Link>
    </div>
  );
}

// Faqat kirmagan mehmonga ko'rsatiladi
async function GuestOnly({ children }) {
  const { profile } = await getSession();
  return profile ? null : children;
}

async function LatestStartups() {
  const [{ supabase, profile }, t] = await Promise.all([getSession(), getT()]);
  const { data: startups } = await supabase
    .from('startups')
    .select('id, name, sector, short_desc, stage, score, verified, logo_url')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(6);

  return startups?.length ? (
    <div className="grid">
      {startups.map((s) => (
        <StartupCard key={s.id} s={s} t={t} />
      ))}
    </div>
  ) : (
    <div className="empty">
      <h3>{t('home.empty_title')}</h3>
      <p>{t('home.empty_text')}</p>
      {!profile && (
        <Link className="btn btn-gold" href="/royxat?rol=startup">
          {t('home.empty_cta')}
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const t = await getT();
  const points = (role) => [1, 2, 3, 4].map((i) => t(`home.${role}_p${i}`));
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            <span>{t('home.h1a')}</span>
            <span>{t('home.h1b')}</span>
            <span>{t('home.h1c')}</span>
          </h1>
          <p className="lead">
            {t('home.lead')}
          </p>

          <Suspense fallback={<div className="row"><span className="skel skel-btn" /><span className="skel skel-btn" /></div>}>
            <HeroActions />
          </Suspense>

          <p className="hero-note">
            <LockIcon size={15} />
            {t('home.note')}
          </p>
        </div>

        <SealedDemo strings={pickStrings(t, DEMO_KEYS)} lang={t.lang} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{t('home.how_title')}</h2>
          <p className="muted">{t('home.how_sub')}</p>
        </div>
        <ol className="steps">
          <li>
            <span className="step-n">1</span>
            <h3>{t('home.step1_t')}</h3>
            <p className="muted">{t('home.step1_d')}</p>
          </li>
          <li>
            <span className="step-n">2</span>
            <h3>{t('home.step2_t')}</h3>
            <p className="muted">{t('home.step2_d')}</p>
          </li>
          <li>
            <span className="step-n">3</span>
            <h3>{t('home.step3_t')}</h3>
            <p className="muted">{t('home.step3_d')}</p>
          </li>
        </ol>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{t('home.roles_title')}</h2>
        </div>
        <div className="split">
          <div className="panel">
            <h3>{t('home.startup_title')}</h3>
            <p className="sub muted">{t('home.startup_sub')}</p>
            <ul className="checks">
              {points('startup').map((txt) => (
                <li key={txt}>
                  <CheckIcon size={18} />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
            <Suspense fallback={null}>
              <GuestOnly>
                <Link className="btn btn-gold panel-btn" href="/royxat?rol=startup">
                  {t('home.startup_cta')}
                </Link>
              </GuestOnly>
            </Suspense>
          </div>
          <div className="panel">
            <h3>{t('home.investor_title')}</h3>
            <p className="sub muted">{t('home.investor_sub')}</p>
            <ul className="checks">
              {points('investor').map((txt) => (
                <li key={txt}>
                  <CheckIcon size={18} />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
            <Suspense fallback={null}>
              <GuestOnly>
                <Link className="btn btn-ghost panel-btn" href="/royxat?rol=investor">
                  {t('home.investor_cta')}
                </Link>
              </GuestOnly>
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="trust">
          <div>
            <h2>{t('home.trust_title')}</h2>
            <p className="muted">{t('home.trust_text')}</p>
          </div>
          <div className="trust-visual">
            <div className="tile">
              <ScoreRing value={78} size={64} t={t} />
              <b>{t('ui.score')}</b>
              <span className="muted small">{t('home.trust_score_sub')}</span>
            </div>
            <div className="tile">
              <span className="tile-seal">
                <SealIcon size={40} />
              </span>
              <b>{t('ui.verified')}</b>
              <span className="muted small">{t('home.trust_verified_sub')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{t('home.latest')}</h2>
          <Link href="/startaplar">{t('home.see_all')}</Link>
        </div>
        <Suspense fallback={<div className="skel-row"><span className="skel skel-card" /><span className="skel skel-card" /><span className="skel skel-card" /></div>}>
          <LatestStartups />
        </Suspense>
      </section>
    </>
  );
}
