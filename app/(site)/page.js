import { Suspense } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getPlatformStats, getLatestStartups, safe } from '@/lib/public-data';
import { getT } from '@/lib/i18n/server';
import { pickStrings } from '@/lib/i18n';
import StartupCard from '@/components/StartupCard';
import SealedDemo from '@/components/SealedDemo';
import { DEMO_KEYS } from '@/lib/i18n/demo-keys';
import { ScoreRing } from '@/components/ui';
import { CheckIcon, LockIcon, SealIcon } from '@/components/icons';
import Splash from '@/components/Splash';
import ValuationCalc from '@/components/ValuationCalc';
import { CALC_KEYS } from '@/lib/i18n/calc-keys';
import { SectorIcon, ArrowIcon, SECTOR_KEYS } from '@/components/SectorIcons';

// Rolga bog'liq tugmalar (sessiya keyin keladi, matn esa darrov ko'rinadi)
async function HeroActions({ onDark = false }) {
  const [{ profile }, t] = await Promise.all([getSession(), getT()]);
  const ghost = onDark ? 'btn btn-light' : 'btn btn-ghost';
  return profile ? (
    <div className="row">
      <Link className="btn btn-gold" href="/kabinet">
        {t('home.cta_cabinet')} <ArrowIcon size={16} />
      </Link>
      <Link className={ghost} href="/startaplar">
        {t('home.cta_browse')}
      </Link>
    </div>
  ) : (
    <div className="row">
      <Link className="btn btn-gold" href="/royxat?rol=startup">
        {t('home.cta_startup')} <ArrowIcon size={16} />
      </Link>
      <Link className={ghost} href="/royxat?rol=investor">
        {t('home.cta_investor')}
      </Link>
    </div>
  );
}

// Platforma raqamlari: haqiqiy sonlar bo'lsa ko'rsatiladi, bo'sh bo'lsa aniq faktlar
async function StatBand() {
  const [data, t] = await Promise.all([safe(getPlatformStats, null), getT()]);
  const n = (k) => Number(data?.[k]) || 0;
  const real = n('startups') + n('investors') > 0;
  const items = real
    ? [
        [n('startups'), t('home.stat_startups')],
        [n('verified'), t('home.stat_verified')],
        [n('investors'), t('home.stat_investors')],
        [n('approved'), t('home.stat_approved')],
      ]
    : [
        [t('home.fact_score_n'), t('home.fact_score')],
        [t('home.fact_lang_n'), t('home.fact_lang')],
        [t('home.fact_ctrl_n'), t('home.fact_ctrl')],
      ];
  return (
    <div className={`statband ${real ? 'is-4' : ''}`}>
      {items.map(([v, l]) => (
        <div key={l}>
          <b className="num">{v}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

// Faqat kirmagan mehmonga ko'rsatiladi
async function GuestOnly({ children }) {
  const { profile } = await getSession();
  return profile ? null : children;
}

async function LatestStartups() {
  const [startups, { profile }, t] = await Promise.all([safe(getLatestStartups, []), getSession(), getT()]);

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
      <Splash />
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{t('home.tag')}</span>
          <h1>
            <span>{t('home.h1a')}</span>
            <span className="hl">{t('home.h1b')}</span>
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

        <div className="hero-visual">
          <span className="float float-a">
            <ScoreRing value={78} size={40} t={t} />
            <b>{t('ui.score')}</b>
          </span>
          <span className="float float-b">
            <SealIcon size={22} />
            <b>{t('ui.verified')}</b>
          </span>
          <SealedDemo strings={pickStrings(t, DEMO_KEYS)} lang={t.lang} />
        </div>
      </section>

      <section className="section section-tight">
        <Suspense fallback={<div className="statband"><span className="skel skel-stat" /></div>}>
          <StatBand />
        </Suspense>
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
        <div className="section-head">
          <h2>{t('home.sectors_title')}</h2>
          <p className="muted">{t('home.sectors_sub')}</p>
        </div>
        <div className="sectors">
          {SECTOR_KEYS.map((k) => (
            <Link key={k} className="sector" href={`/startaplar?q=${encodeURIComponent(t(`sec.${k}`))}`}>
              <span className="sector-ico">
                <SectorIcon name={k} />
              </span>
              <b>{t(`sec.${k}`)}</b>
              <ArrowIcon size={18} />
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <ValuationCalc strings={pickStrings(t, CALC_KEYS)} lang={t.lang} />
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

      <section className="section">
        <div className="cta">
          <div>
            <h2>{t('home.cta_title')}</h2>
            <p>{t('home.cta_text')}</p>
          </div>
          <Suspense fallback={<div className="row"><span className="skel skel-btn" /></div>}>
            <HeroActions onDark />
          </Suspense>
        </div>
      </section>
    </>
  );
}
