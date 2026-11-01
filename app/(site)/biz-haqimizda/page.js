import Link from 'next/link';
import { getT } from '@/lib/i18n/server';
import { CONTACT, OPERATOR } from '@/lib/site';
import { LockIcon, SealIcon, UsersIcon, SearchIcon, PlusIcon, ChatIcon } from '@/components/icons';
import { ArrowIcon } from '@/components/SectorIcons';

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t('nav.about')} — Investage`, description: t('about.lead'), alternates: { canonical: '/biz-haqimizda' } };
}

export default async function AboutPage() {
  const t = await getT();
  const rules = [
    [LockIcon, 'about.rule1_t', 'about.rule1_d'],
    [ChatIcon, 'about.rule2_t', 'about.rule2_d'],
    [SealIcon, 'about.rule3_t', 'about.rule3_d'],
    [UsersIcon, 'about.rule4_t', 'about.rule4_d'],
  ];
  return (
    <>
      <section className="ab-hero">
        <div>
          <span className="eyebrow">{t('nav.about')}</span>
          <h1>{t('about.title_a')} <span className="hl">{t('about.title_b')}</span></h1>
          <p className="lead">{t('about.lead')}</p>
        </div>
        {/* Ikki tomon markazda uchrashadi */}
        <div className="ab-link" aria-hidden="true">
          <span className="ab-node"><PlusIcon size={26} /><b>{t('about.node1')}</b></span>
          <span className="ab-line"><i /><i /></span>
          <span className="ab-hub">!</span>
          <span className="ab-line ab-line-r"><i /><i /></span>
          <span className="ab-node"><SearchIcon size={26} /><b>{t('about.node2')}</b></span>
        </div>
      </section>

      <section className="section ab-why">
        <h2>{t('about.why_t')}</h2>
        <div className="ab-pains">
          <article>
            <span className="ab-tag">{t('about.pain1_t')}</span>
            <p>{t('about.pain1_d')}</p>
          </article>
          <article>
            <span className="ab-tag">{t('about.pain2_t')}</span>
            <p>{t('about.pain2_d')}</p>
          </article>
        </div>
        <p className="ab-answer">{t('about.answer')}</p>
      </section>

      <section className="section">
        <h2>{t('about.do_t')}</h2>
        <div className="ab-sides">
          <Link className="ab-side ab-side-gold" href="/royxat?rol=startup">
            <span className="choice-ic"><PlusIcon size={24} /></span>
            <h3>{t('about.side1_t')}</h3>
            <p>{t('about.side1_d')}</p>
            <b>{t('home.cta_startup')} <ArrowIcon size={16} /></b>
          </Link>
          <Link className="ab-side" href="/royxat?rol=investor">
            <span className="choice-ic"><SearchIcon size={24} /></span>
            <h3>{t('about.side2_t')}</h3>
            <p>{t('about.side2_d')}</p>
            <b>{t('home.cta_investor')} <ArrowIcon size={16} /></b>
          </Link>
        </div>
      </section>

      <section className="section section-dark">
        <h2>{t('about.rules_t')}</h2>
        <div className="ab-rules">
          {rules.map(([Icon, a, b]) => (
            <div className="ab-rule" key={a}>
              <span className="perk-ic"><Icon size={22} /></span>
              <h3>{t(a)}</h3>
              <p>{t(b)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section ab-contact">
        <div>
          <h2>{t('about.contact_t')}</h2>
          <p>{OPERATOR[t.lang] || OPERATOR.uz}</p>
        </div>
        <div className="ab-links">
          {CONTACT.instagram && <a href={`https://www.instagram.com/${CONTACT.instagram.replace('@', '')}/`} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {CONTACT.telegram && <a href={`https://t.me/${CONTACT.telegram.replace('@', '')}`} rel="noopener noreferrer">{CONTACT.telegram}</a>}
          {CONTACT.phone && <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>}
          {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
        </div>
      </section>
    </>
  );
}
