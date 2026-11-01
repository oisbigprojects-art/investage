import Link from 'next/link';
import { getT } from '@/lib/i18n/server';
import { CONTACT, OPERATOR } from '@/lib/site';
import { LockIcon, SealIcon, UsersIcon, SearchIcon, PlusIcon, ChatIcon } from '@/components/icons';

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t('nav.about')} — Investage`, description: t('about.lead'), alternates: { canonical: '/biz-haqimizda' } };
}

export default async function AboutPage() {
  const t = await getT();
  const sides = [
    [PlusIcon, 'about.side1_t', 'about.side1_d'],
    [SearchIcon, 'about.side2_t', 'about.side2_d'],
  ];
  const rules = [
    [LockIcon, 'about.rule1_t', 'about.rule1_d'],
    [ChatIcon, 'about.rule2_t', 'about.rule2_d'],
    [SealIcon, 'about.rule3_t', 'about.rule3_d'],
    [UsersIcon, 'about.rule4_t', 'about.rule4_d'],
  ];
  return (
    <>
      <section className="about-hero">
        <span className="eyebrow">{t('nav.about')}</span>
        <h1>{t('about.title')}</h1>
        <p className="lead">{t('about.lead')}</p>
      </section>

      <section className="section about-why">
        <h2>{t('about.why_t')}</h2>
        <p>{t('about.why_d')}</p>
      </section>

      <section className="section">
        <h2>{t('about.do_t')}</h2>
        <div className="about-grid about-grid-2">
          {sides.map(([Icon, a, b]) => (
            <div className="card about-card" key={a}>
              <span className="perk-ic"><Icon size={22} /></span>
              <h3>{t(a)}</h3>
              <p className="muted">{t(b)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{t('about.rules_t')}</h2>
        <div className="about-grid about-grid-2">
          {rules.map(([Icon, a, b]) => (
            <div className="card about-card" key={a}>
              <span className="perk-ic"><Icon size={22} /></span>
              <h3>{t(a)}</h3>
              <p className="muted">{t(b)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section about-contact card">
        <h2>{t('about.contact_t')}</h2>
        <p className="muted">{OPERATOR[t.lang] || OPERATOR.uz}</p>
        <div className="about-links">
          {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
          {CONTACT.phone && <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>}
          {CONTACT.telegram && <a href={`https://t.me/${CONTACT.telegram.replace('@', '')}`} rel="noopener noreferrer">{CONTACT.telegram}</a>}
        </div>
        <Link className="btn btn-gold" href="/royxat">{t('nav.signup')}</Link>
      </section>
    </>
  );
}
