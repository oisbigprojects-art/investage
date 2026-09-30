import Link from 'next/link';
import { getAuthUser } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Monogram } from '@/components/ui';
import { SearchIcon, LockIcon } from '@/components/icons';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.investors') };
}

const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 60).toLowerCase();

// Investorlar katalogi: faqat tizimga kirganlarga va faqat o'zi ochiq qilgan profillar (email ko'rinmaydi)
export default async function InvestorsPage({ searchParams }) {
  const sp = await searchParams;
  const [{ supabase, user }, t] = await Promise.all([getAuthUser(), getT()]);

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
  const { data } = await supabase.rpc('investor_directory');
  const all = data || [];
  const list = term
    ? all.filter((p) => [p.full_name, p.company, p.city, p.interests, p.bio].join(' ').toLowerCase().includes(term))
    : all;

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
      <p className="muted small results-note">{t('inv.found', { n: list.length })}</p>

      {list.length ? (
        <div className="grid">
          {list.map((p) => (
            <article key={p.id} className="scard inv-card">
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
            </article>
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
