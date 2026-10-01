import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getAuthUser, getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Monogram, StatusBadge } from '@/components/ui';
import { LockIcon } from '@/components/icons';
import { formatDate, STAGE_KEYS } from '@/lib/labels';
import { checkRange, splitTags } from '@/lib/investor';

const getInvestor = cache(async (id) => {
  const { supabase, user } = await getAuthUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.rpc('investor_profile', { p_id: id });
  return Array.isArray(data) ? data[0] || null : data || null;
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const [p, t] = await Promise.all([getInvestor(id), getT()]);
  return { title: p ? `${p.company || p.full_name} — Investage` : t('meta.investors') };
}

// Investorning to'liq profili (faqat tizimga kirganlarga; ko'rish huquqi bazada tekshiriladi)
export default async function InvestorProfilePage({ params }) {
  const { id } = await params;
  const [{ user }, t] = await Promise.all([getSession(), getT()]);

  if (!user) {
    return (
      <div className="empty">
        <LockIcon size={28} />
        <h3>{t('inv.login_title')}</h3>
        <p>{t('inv.login_text')}</p>
        <div className="row">
          <Link className="btn btn-gold" href="/kirish">{t('nav.login')}</Link>
          <Link className="btn btn-ghost" href="/royxat">{t('nav.signup')}</Link>
        </div>
      </div>
    );
  }

  const p = await getInvestor(id);
  if (!p) notFound();

  const range = checkRange(p, t);
  const sectors = splitTags(p.interests);
  const stages = (p.stages || []).filter((s) => STAGE_KEYS.includes(s));
  const title = p.company || p.full_name;
  const contacts = [
    p.email && { label: t('ivp.email'), value: p.email, href: `mailto:${p.email}` },
    p.telegram && { label: 'Telegram', value: p.telegram, href: `https://t.me/${p.telegram.replace(/^@/, '')}` },
    p.website && { label: t('ivp.website'), value: p.website.replace(/^https?:\/\//, ''), href: /^https?:\/\//.test(p.website) ? p.website : `https://${p.website}` },
    p.linkedin && { label: 'LinkedIn', value: p.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: /^https?:\/\//.test(p.linkedin) ? p.linkedin : `https://${p.linkedin}` },
  ].filter(Boolean);

  return (
    <>
      <Link href="/investorlar" className="back">{t('ivp.back')}</Link>

      {p.is_demo && (
        <div className="flash flash-warn" role="note">{t('ivp.demo_note')}</div>
      )}
      {p.requested_my_startup && (
        <div className="flash flash-ok inv-rel" role="status">
          <span>{t('ivp.requested_you')}</span>
          <StatusBadge status={p.requested_my_startup} t={t} />
          <Link href="/kabinet/startap/sorovlar">{t('ivp.open_requests')}</Link>
        </div>
      )}

      <section className="card head-card inv-head">
        <div className="head-top">
          <Monogram name={title} size={72} />
          <div className="head-title">
            <h1>{title}</h1>
            <p className="muted">
              {p.company ? p.full_name : t('role.investor')}
              {p.investor_type && <> · {t(`ivp.type_${p.investor_type}`)}</>}
            </p>
          </div>
          {p.is_me && (
            <Link className="btn btn-ghost btn-sm" href="/kabinet/investor/profil">{t('ivp.edit')}</Link>
          )}
        </div>
        <div className="head-meta">
          {p.city && <span className="chip"><i aria-hidden="true" />{p.city}</span>}
          {p.experience_years != null && <span className="chip">{t.n('ivp.years', p.experience_years)}</span>}
          <span className="chip chip-muted">{t('ivp.member_since', { date: formatDate(p.member_since, t) })}</span>
          {p.is_demo && <span className="chip chip-muted">{t('ui.demo')}</span>}
        </div>
      </section>

      <div className="figures inv-figures">
        <div className="figure"><span>{t('ivp.check')}</span><b>{range || '—'}</b></div>
        <div className="figure"><span>{t('ivp.stages')}</span><b className="inv-stages">{stages.length ? stages.map((s) => t(`stage.${s}`)).join(', ') : '—'}</b></div>
        <div className="figure"><span>{t('ivp.req_total')}</span><b>{Number(p.requests_total) || 0}</b></div>
        <div className="figure"><span>{t('ivp.req_approved')}</span><b>{Number(p.requests_approved) || 0}</b></div>
      </div>

      <div className="detail-grid inv-grid">
        <div>
          {sectors.length > 0 && (
            <section className="card">
              <h2>{t('ivp.sectors')}</h2>
              <div className="chips-row">
                {sectors.map((s) => <span key={s} className="chip chip-warn">{s}</span>)}
              </div>
            </section>
          )}
          <section className="card">
            <h2>{t('ivp.about')}</h2>
            {p.bio ? <p className="pre">{p.bio}</p> : <p className="muted">{t('ivp.no_about')}</p>}
          </section>
          <section className="card">
            <h2>{t('ivp.portfolio')}</h2>
            {p.portfolio ? <p className="pre">{p.portfolio}</p> : <p className="muted">{t('ivp.no_portfolio')}</p>}
          </section>
        </div>

        <aside className="card access">
          <h2 className="access-title">{t('ivp.contacts')}</h2>
          {p.contacts_visible && contacts.length ? (
            <ul className="contacts">
              {contacts.map((c) => (
                <li key={c.label}>
                  <span>{c.label}</span>
                  <a href={c.href} target="_blank" rel="noopener noreferrer">{c.value}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">
              {p.is_demo ? t('ivp.demo_contacts') : p.contacts_visible ? t('ivp.no_contacts') : t('ivp.hidden_contacts')}
            </p>
          )}
          {p.last_active && <p className="muted small inv-active">{t('ivp.last_active', { date: formatDate(p.last_active, t) })}</p>}
        </aside>
      </div>
    </>
  );
}
