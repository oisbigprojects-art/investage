import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import StartupCard from '@/components/StartupCard';
import { STAGES } from '@/lib/labels';

export default async function StartupsPage({ searchParams }) {
  const sp = await searchParams;
  const stage = STAGES[sp?.bosqich] ? sp.bosqich : null;
  const { supabase } = await getSession();

  let q = supabase
    .from('startups')
    .select('id, name, sector, short_desc, stage, score, verified')
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false });
  if (stage) q = q.eq('stage', stage);
  const { data: startups } = await q;

  return (
    <>
      <div className="page-head">
        <h1>Startaplar</h1>
        <p className="muted">Ochiq ma&apos;lumotlar. Summa, ulush va kontaktlar — startap ruxsat bergandan keyin.</p>
      </div>

      <div className="filters">
        <Link href="/startaplar" className={`filter ${!stage ? 'is-on' : ''}`}>Hammasi</Link>
        {Object.entries(STAGES).map(([k, v]) => (
          <Link key={k} href={`/startaplar?bosqich=${k}`} className={`filter ${stage === k ? 'is-on' : ''}`}>
            {v}
          </Link>
        ))}
      </div>

      {startups?.length ? (
        <div className="grid">
          {startups.map((s) => (
            <StartupCard key={s.id} s={s} />
          ))}
        </div>
      ) : (
        <div className="empty">Bu bo&apos;limda hozircha startap yo&apos;q.</div>
      )}
    </>
  );
}
