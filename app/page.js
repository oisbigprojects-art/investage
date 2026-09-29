import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import StartupCard from '@/components/StartupCard';

export default async function Home() {
  const { supabase, profile } = await getSession();
  const { data: startups } = await supabase
    .from('startups')
    .select('id, name, sector, short_desc, stage, score, verified')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <>
      <section className="hero">
        <h1>O&apos;zbekiston startaplari va investorlari uchun uchrashuv joyi</h1>
        <p className="lead">
          Startaplar o&apos;zini tanishtiradi, investorlar ko&apos;rib chiqadi. Chuqur ma&apos;lumotlar faqat startap
          ruxsat bergan investorga ochiladi.
        </p>

        {!profile && (
          <div className="role-pick">
            <Link href="/royxat?rol=startup" className="card role-card">
              <span className="role-kicker">Men startapman</span>
              <strong>Mablag&apos; izlayapman</strong>
              <span className="muted small">Profil oching, kimga ma&apos;lumot ochishni o&apos;zingiz hal qiling.</span>
            </Link>
            <Link href="/royxat?rol=investor" className="card role-card">
              <span className="role-kicker">Men investorman</span>
              <strong>Loyiha izlayapman</strong>
              <span className="muted small">Startaplarni ko&apos;ring, qiziqqaniga kirish so&apos;rovi yuboring.</span>
            </Link>
          </div>
        )}
        {profile && (
          <div className="hero-cta">
            <Link href="/kabinet" className="btn btn-primary">Kabinetga o&apos;tish</Link>
          </div>
        )}
      </section>

      <section className="steps">
        <div className="step">
          <span className="step-n">1</span>
          <div>
            <strong>Ochiq qism</strong>
            <p className="muted small">Hamma startap nomi, sohasi, bosqichi, bahosi va tasdiq belgisini ko&apos;radi.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-n">2</span>
          <div>
            <strong>Kirish so&apos;rovi</strong>
            <p className="muted small">Investor qiziqqan startapiga qisqa xabar bilan so&apos;rov yuboradi.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-n">3</span>
          <div>
            <strong>Startap qaror qiladi</strong>
            <p className="muted small">Tasdiqlasa — summa, ulush va kontaktlar faqat shu investorga ochiladi.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Yangi startaplar</h2>
          <Link href="/startaplar">Barchasi →</Link>
        </div>
        {startups?.length ? (
          <div className="grid">
            {startups.map((s) => (
              <StartupCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <div className="empty">Hozircha startaplar yo&apos;q.</div>
        )}
      </section>
    </>
  );
}
