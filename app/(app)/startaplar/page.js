import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import StartupCard from '@/components/StartupCard';
import { SearchIcon } from '@/components/icons';
import { Stat, Donut, HBar } from '@/components/charts';
import { getSaved } from '@/lib/data';
import { STAGES } from '@/lib/labels';

export const metadata = { title: 'Startaplar — Investage' };

// PostgREST filtrini buzadigan belgilarni olib tashlaymiz
const clean = (v) => String(v || '').replace(/[,()%*\\:"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

export default async function StartupsPage({ searchParams }) {
  const sp = await searchParams;
  const stage = STAGES[sp?.bosqich] ? sp.bosqich : null;
  const term = clean(sp?.q);
  const sector = String(sp?.soha || '').trim().slice(0, 100); // faqat .eq() ga beriladi, xavfsiz
  const { supabase, user, profile } = await getSession();
  const isInvestor = profile?.role === 'investor';

  let q = supabase
    .from('startups')
    .select('id, name, sector, short_desc, stage, score, verified, logo_url')
    .eq('hidden', false)
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false });
  if (stage) q = q.eq('stage', stage);
  if (sector) q = q.eq('sector', sector);
  if (term) q = q.or(`name.ilike.%${term}%,sector.ilike.%${term}%,short_desc.ilike.%${term}%`);

  const [{ data: startups }, { data: allSectors }, savedRes] = await Promise.all([
    q,
    supabase.from('startups').select('stage, sector, verified').eq('hidden', false),
    isInvestor ? getSaved() : Promise.resolve([]),
  ]);

  const all = allSectors || [];
  const sectorCount = new Map();
  for (const r of all) if (r.sector) sectorCount.set(r.sector, (sectorCount.get(r.sector) || 0) + 1);
  const sectors = [...sectorCount.keys()].sort((a, b) => a.localeCompare(b));
  const topSectors = [...sectorCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
  const byStage = (k) => all.filter((r) => r.stage === k).length;
  const saved = new Set(savedRes.map((r) => r.startup.id));
  const filtered = !!(stage || term || sector);

  const href = (over = {}) => {
    const p = new URLSearchParams();
    const v = { bosqich: stage, q: term, soha: sector, ...over };
    for (const [k, val] of Object.entries(v)) if (val) p.set(k, val);
    const qs = p.toString();
    return qs ? `/startaplar?${qs}` : '/startaplar';
  };
  const here = href();

  return (
    <>
      <div className="page-head">
        <h1>Startaplar</h1>
        <p className="muted">
          Tanishtiruvlar hammaga ochiq. Summa, ulush va kontaktlarni ko&apos;rish uchun startapga kirish so&apos;rovi
          yuboriladi.
        </p>
      </div>

      <div className="stats stats-4">
        <Stat value={all.length} label="Startaplar katalogda" />
        <Stat value={all.filter((r) => r.verified).length} label="Tasdiqlangan" tone="gold" />
        <Stat value={byStage('mvp') + byStage('daromad')} label="MVP yoki daromadli" />
        <Stat value={sectors.length} label="Turli sohalar" />
      </div>

      {all.length > 0 && (
        <details className="card insight">
          <summary>Katalog tahlili</summary>
          <div className="dash-row insight-body">
            <div>
              <h3>Bosqichlar bo&apos;yicha</h3>
              <Donut
                title="Startaplar bosqichlari"
                centerLabel="startap"
                parts={[
                  { label: "G'oya", value: byStage('goya'), tone: 'muted' },
                  { label: 'MVP', value: byStage('mvp'), tone: 'warn' },
                  { label: 'Daromad bor', value: byStage('daromad'), tone: 'ok' },
                ]}
              />
            </div>
            <div>
              <h3>Eng ko&apos;p sohalar</h3>
              {topSectors.length ? <HBar rows={topSectors} title="Sohalar bo'yicha startaplar" /> : <p className="muted small">Sohalar hali ko&apos;rsatilmagan.</p>}
            </div>
          </div>
        </details>
      )}

      <form className="searchbar" action="/startaplar" role="search">
        {stage && <input type="hidden" name="bosqich" value={stage} />}
        <label className="search-field">
          <span className="visually-hidden">Qidirish</span>
          <SearchIcon size={18} />
          <input name="q" type="search" defaultValue={term} placeholder="Nomi, sohasi yoki tavsifi bo'yicha qidiring" maxLength={60} />
        </label>
        {sectors.length > 0 && (
          <label className="search-select">
            <span className="visually-hidden">Soha</span>
            <select name="soha" defaultValue={sector}>
              <option value="">Barcha sohalar</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="btn btn-gold" type="submit">
          Qidirish
        </button>
      </form>

      <div className="filters" role="group" aria-label="Bosqich bo'yicha saralash">
        <Link href={href({ bosqich: null })} className={`filter ${!stage ? 'is-on' : ''}`}>
          Hammasi
        </Link>
        {Object.entries(STAGES).map(([k, v]) => (
          <Link key={k} href={href({ bosqich: k })} className={`filter ${stage === k ? 'is-on' : ''}`}>
            {v}
          </Link>
        ))}
        {filtered && (
          <Link href="/startaplar" className="filter filter-clear">
            Tozalash
          </Link>
        )}
      </div>

      {startups?.length ? (
        <>
          <p className="muted small results-note">{startups.length} ta startap topildi</p>
          <div className="grid">
            {startups.map((s) => (
              <StartupCard key={s.id} s={s} canSave={isInvestor} saved={saved.has(s.id)} back={here} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty">
          <h3>{filtered ? 'Hech narsa topilmadi' : "Hozircha startaplar yo'q"}</h3>
          <p>
            {filtered
              ? "Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang."
              : "Birinchi bo'lib profil oching, investorlar sizni birinchi ko'rishadi."}
          </p>
          {filtered ? (
            <Link className="btn btn-ghost" href="/startaplar">
              Barcha startaplar
            </Link>
          ) : (
            !profile && (
              <Link className="btn btn-gold" href="/royxat?rol=startup">
                Startap profilini yaratish
              </Link>
            )
          )}
        </div>
      )}
    </>
  );
}
