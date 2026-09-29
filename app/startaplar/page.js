import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import StartupCard from '@/components/StartupCard';
import { STAGES } from '@/lib/labels';

export const metadata = { title: 'Startaplar — Investage' };

export default async function StartupsPage({ searchParams }) {
  const sp = await searchParams;
  const stage = STAGES[sp?.bosqich] ? sp.bosqich : null;
  const { supabase, profile } = await getSession();

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
        <p className="muted">
          Tanishtiruvlar hammaga ochiq. Summa, ulush va kontaktlarni ko&apos;rish uchun startapga kirish so&apos;rovi
          yuboriladi.
        </p>
      </div>

      <div className="filters" role="group" aria-label="Bosqich bo'yicha saralash">
        <Link href="/startaplar" className={`filter ${!stage ? 'is-on' : ''}`}>
          Hammasi
        </Link>
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
        <div className="empty">
          <h3>{stage ? "Bu bosqichda hozircha startap yo'q" : "Hozircha startaplar yo'q"}</h3>
          <p>
            {stage
              ? "Boshqa bosqichni tanlang yoki barcha startaplarni ko'ring."
              : "Birinchi bo'lib profil oching, investorlar sizni birinchi ko'rishadi."}
          </p>
          {stage ? (
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
