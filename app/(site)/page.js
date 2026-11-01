import { Suspense } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getPlatformStats, getLatestStartups, getNews, safe } from '@/lib/public-data';
import { formatDate } from '@/lib/labels';
import { getT } from '@/lib/i18n/server';
import { pickStrings } from '@/lib/i18n';
import StartupCard from '@/components/StartupCard';
import SealedDemo from '@/components/SealedDemo';
import { DEMO_KEYS } from '@/lib/i18n/demo-keys';
import { CheckIcon, LockIcon, SealIcon, PlusIcon, SearchIcon, ChatIcon } from '@/components/icons';
import Splash from '@/components/Splash';
import ValuationCalc from '@/components/ValuationCalc';
import HomeStory from '@/components/HomeStory';
import RoleSwitch from '@/components/RoleSwitch';
import { CALC_KEYS } from '@/lib/i18n/calc-keys';
import { SectorIcon, ArrowIcon, SECTOR_KEYS } from '@/components/SectorIcons';
import { SITE_URL } from '@/lib/site-url';
import { CONTACT } from '@/lib/site';

// Rolga bog'liq tugmalar (sessiya keyin keladi, matn esa darrov ko'rinadi)
export const metadata = { alternates: { canonical: '/' } };

async function HeroActions({ onDark = false }) {
  const [{ profile }, t] = await Promise.all([getSession(), getT()]);
  const ghost = onDark ? 'btn btn-light' : 'btn btn-ghost';
  if (!profile && onDark) {
    // Birinchi ekran: odam o'zini bir qarashda topadigan ikki katta tanlov
    return (
      <>
        <div className="hero-choices">
          <Link className="choice choice-gold" href="/royxat?rol=startup">
            <span className="choice-ic"><PlusIcon size={24} /></span>
            <span className="choice-tx"><b>{t('home.choice1_t')}</b><small>{t('home.choice1_d')}</small></span>
            <ArrowIcon size={18} />
          </Link>
          <Link className="choice" href="/royxat?rol=investor">
            <span className="choice-ic"><SearchIcon size={24} /></span>
            <span className="choice-tx"><b>{t('home.choice2_t')}</b><small>{t('home.choice2_d')}</small></span>
            <ArrowIcon size={18} />
          </Link>
        </div>
        <Link className="hero-browse" href="/startaplar">{t('home.cta_browse')} <ArrowIcon size={15} /></Link>
      </>
    );
  }
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

// Raqamlar startaplar soni ishonarli bo'lgandagina ko'rsatiladi ("1 startap, 0 tasdiqlangan" bo'sh saytdek ko'rinadi),
// aks holda odamga aniq foyda aytiladi
const STATS_MIN_STARTUPS = 10;
async function StatBand() {
  const [data, t] = await Promise.all([safe(getPlatformStats, null), getT()]);
  const n = (k) => Number(data?.[k]) || 0;
  if (n('startups') < STATS_MIN_STARTUPS) {
    const perks = [
      [CheckIcon, 'home.perk1_t', 'home.perk1_d'],
      [LockIcon, 'home.perk2_t', 'home.perk2_d'],
      [ChatIcon, 'home.perk3_t', 'home.perk3_d'],
    ];
    return (
      <div className="perks">
        {perks.map(([Icon, a, b]) => (
          <div className="perk" key={a}>
            <span className="perk-ic"><Icon size={22} /></span>
            <div><b>{t(a)}</b><p>{t(b)}</p></div>
          </div>
        ))}
      </div>
    );
  }
  const items = [
    [n('startups'), t('home.stat_startups')],
    [n('verified'), t('home.stat_verified')],
    [n('investors'), t('home.stat_investors')],
    [n('approved'), t('home.stat_approved')],
  ];
  return (
    <div className="statband is-4">
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

async function LatestNews() {
  const [news, t] = await Promise.all([safe(() => getNews(3), []), getT()]);
  if (!news.length) return null;
  return (
    <section className="section">
      <div className="section-head">
        <h2>{t('news.title')}</h2>
        <Link href="/yangiliklar">{t('home.see_all')}</Link>
      </div>
      <div className="news-list news-row">
        {news.map((n) => (
          <Link key={n.id} href={`/yangiliklar/${n.id}`} className="card news-card">
            <time className="muted small">{formatDate(n.published_at, t)}</time>
            <h3>{n.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const t = await getT();
  const points = (role) => [1, 2, 3, 4].map((i) => t(`home.${role}_p${i}`));
  // Qidiruv tizimlari uchun tashkilot haqida tuzilgan ma'lumot (schema.org)
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Investage',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    description: t('meta.site_desc'),
    areaServed: 'UZ',
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: CONTACT.email, telephone: CONTACT.phone, availableLanguage: ['uz', 'ru', 'en'] }],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd).replace(/</g, '\\u003c') }} />
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
            <HeroActions onDark />
          </Suspense>

          <p className="hero-explain">{t('home.explain')}</p>
        </div>

        <div className="hero-visual">
          <span className="vault-ring" aria-hidden="true" />
          <span className="vault-ring vault-ring-2" aria-hidden="true" />
          <span className="float float-b">
            <SealIcon size={22} />
            <b>{t('ui.verified')}</b>
          </span>
          <SealedDemo strings={pickStrings(t, DEMO_KEYS)} lang={t.lang} />
        </div>

        <div className="hero-stats">
          <Suspense fallback={<div className="statband"><span className="skel skel-stat" /></div>}>
            <StatBand />
          </Suspense>
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

      <Suspense fallback={null}>
        <LatestNews />
      </Suspense>

      <section className="section section-dark">
        <div className="section-head">
          <h2>{t('home.how_title')}</h2>
          <p className="muted">{t('home.how_sub')}</p>
        </div>
        <HomeStory
          steps={[1, 2, 3].map((i) => ({ title: t(`home.step${i}_t`), text: t(`home.step${i}_d`) }))}
          strings={pickStrings(t, DEMO_KEYS)}
          lang={t.lang}
        />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{t('home.roles_title')}</h2>
        </div>
        <RoleSwitch tabs={[t('home.startup_title'), t('home.investor_title')]}>
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
        </RoleSwitch>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{t('home.sectors_title')}</h2>
          <p className="muted">{t('home.sectors_sub')}</p>
        </div>
        <div className="sector-lane">
          <div className="sector-track">
            {[0, 1].map((copy) =>
              SECTOR_KEYS.map((k) => (
                <Link key={`${copy}-${k}`} className="sector-chip" href={`/startaplar?yonalish=${k}`} aria-hidden={copy === 1} tabIndex={copy === 1 ? -1 : undefined}>
                  <SectorIcon name={k} />
                  <b>{t(`sec.${k}`)}</b>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <details className="card calc-fold">
          <summary>{t('calc.title')}</summary>
          <ValuationCalc strings={pickStrings(t, CALC_KEYS)} lang={t.lang} />
        </details>
      </section>

      <section className="section">
        <div className="cta">
          <div>
            <h2>{t('home.cta_title')}</h2>
            <p>{t('home.cta_text')}</p>
          </div>
          <Suspense fallback={<div className="row"><span className="skel skel-btn" /></div>}>
            <HeroActions />
          </Suspense>
        </div>
      </section>
    </>
  );
}
