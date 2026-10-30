import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Monogram } from '@/components/ui';
import { SearchIcon, LockIcon } from '@/components/icons';
import { checkRange, INVESTOR_TYPES } from '@/lib/investor';
import { getMyStartup } from '@/lib/data';
import { STAGE_KEYS } from '@/lib/labels';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.investors') };
}

const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 60).toLowerCase();

// Investorlar katalogi: faqat tizimga kirganlarga va faqat o'zi ochiq qilgan profillar (email ko'rinmaydi)
export default async function InvestorsPage({ searchParams }) {
  const sp = await searchParams;
  const [{ supabase, user, profile }, t] = await Promise.all([getSession(), getT()]);

  if (!user) {
    return (
      <>
        <div className="page-head">
          <h1>{t('inv.title')}</h1>
          <p className="muted">{t('inv.sub')}</p>
        </div>
        <div className="empty">
          <LockIcon size={28} />
          <h3>{t('inv.login_title')}</h3>
          <p>{t('inv.login_text')}</p>
          <div className="row">
            <Link className="btn btn-gold" href="/kirish">
              {t('nav.login')}
            </Link>
            <Link className="btn btn-ghost" href="/royxat">
              {t('nav.signup')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const term = clean(sp?.q);
  const type = INVESTOR_TYPES.includes(sp?.tur) ? sp.tur : null;
  const stage = STAGE_KEYS.includes(sp?.bosqich) ? sp.bosqich : null;
  const [{ data }, mine] = await Promise.all([supabase.rpc('investor_directory'), profile?.role === 'startup' ? getMyStartup(user.id) : null]);
  const all = data || [];
  const list = all.filter((p) =>
    (!term || [p.full_name, p.company, p.city, p.interests, p.bio, p.investor_type && t(`ivp.type_${p.investor_type}`)].join(' ').toLowerCase().includes(term))
    && (!type || p.investor_type === type)
    && (!stage || (p.stages || []).includes(stage))
  );
  const href = (over) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: term, tur: type, bosqich: stage, ...over })) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/investorlar?${s}` : '/investorlar';
  };

  return (
    <>
      <div className="page-head">
        <h1>{t('inv.title')}</h1>
        <p className="muted">{t('inv.sub')}</p>
      </div>

      <form className="searchbar" action="/investorlar" role="search">
        <label className="search-field">
          <span className="visually-hidden">{t('cat.search_label')}</span>
          <SearchIcon size={18} />
          <input name="q" defaultValue={sp?.q || ''} placeholder={t('inv.search_ph')} maxLength={60} />
        </label>
        <button className="btn btn-gold" type="submit">
          {t('cat.search_btn')}
        </button>
      </form>
      <div className="filters filters-scroll" role="group" aria-label={t('ip.type')}>
        <Link href={href({ tur: null })} className={`filter ${!type ? 'is-on' : ''}`}>{t('cat.all')}</Link>
        {INVESTOR_TYPES.map((k) => (
          <Link key={k} href={href({ tur: k })} className={`filter ${type === k ? 'is-on' : ''}`}>{t(`ivp.type_${k}`)}</Link>
        ))}
      </div>
      <div className="filters filters-scroll" role="group" aria-label={t('ip.stages')}>
        <Link href={href({ bosqich: null })} className={`filter ${!stage ? 'is-on' : ''}`}>{t('cat.all')}</Link>
        {STAGE_KEYS.map((k) => (
          <Link key={k} href={href({ bosqich: k })} className={`filter ${stage === k ? 'is-on' : ''}`}>{t(`stage.${k}`)}</Link>
        ))}
      </div>
      <p className="muted small results-note">{t('inv.found', { n: list.length })}</p>

      {list.length ? (
        <div className="grid">
          {list.map((p) => (
            <Link key={p.id} href={`/investorlar/${p.id}`} className="scard inv-card">
              <div className="scard-head">
                <Monogram name={p.company || p.full_name} size={48} />
                <div className="scard-title">
                  <h3>{p.company || p.full_name}</h3>
                  <span className="muted small">{p.company ? p.full_name : t('role.investor')}</span>
                </div>
                {p.is_demo && <span className="chip chip-muted">{t('ui.demo')}</span>}
              </div>
              {p.city && (
                <p className="inv-city small">
                  <b>{t('inv.city')}:</b> {p.city}
                </p>
              )}
              {p.interests && (
                <p className="inv-city small">
                  <b>{t('inv.focus')}:</b> {p.interests}
                </p>
              )}
              {p.bio && <p className="scard-desc">{p.bio}</p>}
              <div className="scard-meta">
                {p.investor_type && <span className="chip">{t(`ivp.type_${p.investor_type}`)}</span>}
                {checkRange(p, t) && <span className="chip chip-warn">{checkRange(p, t)}</span>}
                {mine?.stage && (p.stages || []).includes(mine.stage) && <span className="chip chip-ok">{t('inv.match')}</span>}
                <span className="inv-more">{t('ivp.view')} →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>{t('inv.empty_title')}</h3>
          <p>{t('inv.empty_text')}</p>
        </div>
      )}
    </>
  );
}
