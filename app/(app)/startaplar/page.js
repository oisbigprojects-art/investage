import Link from 'next/link';
import { getAuthUser, getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import StartupCard from '@/components/StartupCard';
import { SearchIcon } from '@/components/icons';
import { Stat, Donut, HBar } from '@/components/charts';
import { getSaved } from '@/lib/data';
import { getCatalogFacets, safe } from '@/lib/public-data';
import { STAGE_KEYS } from '@/lib/labels';
import { SECTOR_KEYWORDS, sectorFilter } from '@/lib/sectors';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.startups') };
}

// PostgREST filtrini buzadigan belgilarni olib tashlaymiz
const clean = (v) => String(v || '').replace(/[,()%*\\:"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

export default async function StartupsPage({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const stage = STAGE_KEYS.includes(sp?.bosqich) ? sp.bosqich : null;
  const term = clean(sp?.q);
  const sector = String(sp?.soha || '').trim().slice(0, 100); // faqat .eq() ga beriladi, xavfsiz
  const yonalish = SECTOR_KEYWORDS[sp?.yonalish] ? sp.yonalish : null; // bosh sahifadagi soha kartalari
  const { supabase } = await getAuthUser();

  let q = supabase
    .from('startups')
    .select('id, name, sector, short_desc, stage, score, verified, logo_url, is_demo')
    .eq('hidden', false)
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false });
  if (stage) q = q.eq('stage', stage);
  if (sector) q = q.eq('sector', sector);
  const termF = term ? `name.ilike.%${term}%,sector.ilike.%${term}%,short_desc.ilike.%${term}%` : null;
  const secF = yonalish ? sectorFilter(yonalish) : null;
  // ikkala shart birga bo'lsa: and(or(...),or(...))
  if (termF && secF) q = q.or(`and(or(${termF}),or(${secF}))`);
  else if (termF || secF) q = q.or(termF || secF);

  // getSaved o'zi rolni tekshiradi (investor bo'lmasa bo'sh); hammasi bir vaqtda ketadi
  const [{ data: startups }, all, savedRes, { profile }] = await Promise.all([q, safe(getCatalogFacets, []), getSaved(), getSession()]);
  const isInvestor = profile?.role === 'investor';

  const sectorCount = new Map();
  for (const r of all) if (r.sector) sectorCount.set(r.sector, (sectorCount.get(r.sector) || 0) + 1);
  const sectors = [...sectorCount.keys()].sort((a, b) => a.localeCompare(b));
  const topSectors = [...sectorCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
  const byStage = (k) => all.filter((r) => r.stage === k).length;
  const saved = new Set(savedRes.map((r) => r.startup.id));
  const filtered = !!(stage || term || sector || yonalish);

  const href = (over = {}) => {
    const p = new URLSearchParams();
    const v = { bosqich: stage, q: term, soha: sector, yonalish, ...over };
    for (const [k, val] of Object.entries(v)) if (val) p.set(k, val);
    const qs = p.toString();
    return qs ? `/startaplar?${qs}` : '/startaplar';
  };
  const here = href();

  return (
    <>
      <div className="page-head">
        <h1>{t('cat.title')}</h1>
        <p className="muted">{t('cat.sub')}</p>
      </div>

      <div className="stats stats-4">
        <Stat value={all.length} label={t('cat.stat_total')} />
        <Stat value={all.filter((r) => r.verified).length} label={t('cat.stat_verified')} tone="gold" />
        <Stat value={byStage('mvp') + byStage('daromad')} label={t('cat.stat_mvp')} />
        <Stat value={sectors.length} label={t('cat.stat_sectors')} />
      </div>

      {all.length > 0 && (
        <details className="card insight">
          <summary>{t('cat.insight')}</summary>
          <div className="dash-row insight-body">
            <div>
              <h3>{t('cat.by_stage')}</h3>
              <Donut
                title={t('cat.stage_chart')}
                centerLabel={t('cat.center')}
                parts={[
                  { label: t('stage.goya'), value: byStage('goya'), tone: 'muted' },
                  { label: t('stage.mvp'), value: byStage('mvp'), tone: 'warn' },
                  { label: t('stage.daromad'), value: byStage('daromad'), tone: 'ok' },
                ]}
              />
            </div>
            <div>
              <h3>{t('cat.top_sectors')}</h3>
              {topSectors.length ? <HBar rows={topSectors} title={t('cat.sectors_chart')} /> : <p className="muted small">{t('cat.no_sectors')}</p>}
            </div>
          </div>
        </details>
      )}

      <form className="searchbar" action="/startaplar" role="search">
        {stage && <input type="hidden" name="bosqich" value={stage} />}
        <label className="search-field">
          <span className="visually-hidden">{t('cat.search_label')}</span>
          <SearchIcon size={18} />
          <input name="q" type="search" defaultValue={term} placeholder={t('cat.search_ph')} maxLength={60} />
        </label>
        {sectors.length > 0 && (
          <label className="search-select">
            <span className="visually-hidden">{t('cat.sector')}</span>
            <select name="soha" defaultValue={sector}>
              <option value="">{t('cat.sector_all')}</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="btn btn-gold" type="submit">
          {t('cat.search_btn')}
        </button>
      </form>

      <div className="filters" role="group" aria-label={t('cat.filter_aria')}>
        <Link href={href({ bosqich: null })} className={`filter ${!stage ? 'is-on' : ''}`}>
          {t('cat.all')}
        </Link>
        {STAGE_KEYS.map((k) => (
          <Link key={k} href={href({ bosqich: k })} className={`filter ${stage === k ? 'is-on' : ''}`}>
            {t(`stage.${k}`)}
          </Link>
        ))}
        {yonalish && (
          <Link href={href({ yonalish: null })} className="filter is-on" title={t('cat.clear')}>
            {t(`sec.${yonalish}`)} ✕
          </Link>
        )}
        {filtered && (
          <Link href="/startaplar" className="filter filter-clear">
            {t('cat.clear')}
          </Link>
        )}
      </div>

      {startups?.length ? (
        <>
          <p className="muted small results-note">{t('cat.found', { n: startups.length })}</p>
          <div className="grid">
            {startups.map((s) => (
              <StartupCard key={s.id} s={s} t={t} canSave={isInvestor} saved={saved.has(s.id)} back={here} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty">
          <h3>{filtered ? t('cat.empty_none_title') : t('cat.empty_first_title')}</h3>
          <p>{filtered ? t('cat.empty_none_text') : t('cat.empty_first_text')}</p>
          {filtered ? (
            <Link className="btn btn-ghost" href="/startaplar">
              {t('cat.empty_all')}
            </Link>
          ) : (
            !profile && (
              <Link className="btn btn-gold" href="/royxat?rol=startup">
                {t('cat.empty_create')}
              </Link>
            )
          )}
        </div>
      )}
    </>
  );
}
