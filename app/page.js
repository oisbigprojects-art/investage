import { Suspense } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import StartupCard from '@/components/StartupCard';
import SealedDemo from '@/components/SealedDemo';
import { ScoreRing } from '@/components/ui';
import { CheckIcon, LockIcon, SealIcon } from '@/components/icons';

const STARTUP_POINTS = [
  "Ochiq tanishtiruv va yopiq ma'lumotni alohida to'ldiring",
  "Kirish so'rovlarini tasdiqlang yoki rad eting",
  'Bergan ruxsatingizni istalgan payt yoping',
  "Baho va tasdiq belgisi bilan ishonchni oshiring",
];

const INVESTOR_POINTS = [
  "Startaplarni bosqich bo'yicha saralang",
  "Qiziqqan startapga kirish so'rovi yuboring",
  "So'rovlaringiz holatini bir joyda kuzating",
  "Ruxsat berilgach summa, ulush va kontaktlarni ko'ring",
];

// Rolga bog'liq tugmalar (sessiya keyin keladi, matn esa darrov ko'rinadi)
async function HeroActions() {
  const { profile } = await getSession();
  return profile ? (
    <div className="row">
      <Link className="btn btn-gold" href="/kabinet">
        Kabinetga o&apos;tish
      </Link>
      <Link className="btn btn-ghost" href="/startaplar">
        Startaplarni ko&apos;rish
      </Link>
    </div>
  ) : (
    <div className="row">
      <Link className="btn btn-gold" href="/royxat?rol=startup">
        Startap sifatida boshlash
      </Link>
      <Link className="btn btn-ghost" href="/royxat?rol=investor">
        Investor sifatida boshlash
      </Link>
    </div>
  );
}

// Faqat kirmagan mehmonga ko'rsatiladi
async function GuestOnly({ children }) {
  const { profile } = await getSession();
  return profile ? null : children;
}

async function LatestStartups() {
  const { supabase, profile } = await getSession();
  const { data: startups } = await supabase
    .from('startups')
    .select('id, name, sector, short_desc, stage, score, verified, logo_url')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(6);

  return startups?.length ? (
    <div className="grid">
      {startups.map((s) => (
        <StartupCard key={s.id} s={s} />
      ))}
    </div>
  ) : (
    <div className="empty">
      <h3>Birinchi startap siz bo&apos;ling</h3>
      <p>Hozircha ro&apos;yxat bo&apos;sh. Profil oching, investorlar sizni birinchi bo&apos;lib ko&apos;rishadi.</p>
      {!profile && (
        <Link className="btn btn-gold" href="/royxat?rol=startup">
          Startap profilini yaratish
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            <span>Startap tanishtiradi.</span>
            <span>Investor so&apos;raydi.</span>
            <span>Qaror startapniki.</span>
          </h1>
          <p className="lead">
            Investage — O&apos;zbekiston startaplari va investorlari uchun platforma. Summa, ulush va kontaktlar faqat
            startap tasdiqlagan investorga ochiladi.
          </p>

          <Suspense fallback={<div className="row"><span className="skel skel-btn" /><span className="skel skel-btn" /></div>}>
            <HeroActions />
          </Suspense>

          <p className="hero-note">
            <LockIcon size={15} />
            Platforma orqali pul o&apos;tkazilmaydi: kelishuv tomonlar o&apos;rtasida.
          </p>
        </div>

        <SealedDemo />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Ruxsat qanday ishlaydi</h2>
          <p className="muted">Ma&apos;lumot ochilishini har doim startapning o&apos;zi hal qiladi.</p>
        </div>
        <ol className="steps">
          <li>
            <span className="step-n">1</span>
            <h3>Tanishtiruv hammaga ochiq</h3>
            <p className="muted">
              Nomi, sohasi, bosqichi, bahosi va tasdiq belgisi ro&apos;yxatdan o&apos;tmagan mehmonga ham ko&apos;rinadi.
            </p>
          </li>
          <li>
            <span className="step-n">2</span>
            <h3>Investor so&apos;rov yuboradi</h3>
            <p className="muted">Qiziqqan startapiga qisqa xabar bilan so&apos;rov yuboradi. Har bir so&apos;rov alohida ko&apos;riladi.</p>
          </li>
          <li>
            <span className="step-n">3</span>
            <h3>Startap qaror qiladi</h3>
            <p className="muted">
              Tasdiqlasa, summa, ulush va kontaktlar faqat shu investorga ochiladi. Ruxsatni istalgan payt yopish mumkin.
            </p>
          </li>
        </ol>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Har tomon o&apos;ziga kerakli narsani ko&apos;radi</h2>
        </div>
        <div className="split">
          <div className="panel">
            <h3>Startap uchun</h3>
            <p className="sub muted">Ma&apos;lumotingiz sizning nazoratingizda.</p>
            <ul className="checks">
              {STARTUP_POINTS.map((t) => (
                <li key={t}>
                  <CheckIcon size={18} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Suspense fallback={null}>
              <GuestOnly>
                <Link className="btn btn-gold panel-btn" href="/royxat?rol=startup">
                  Startap profilini ochish
                </Link>
              </GuestOnly>
            </Suspense>
          </div>
          <div className="panel">
            <h3>Investor uchun</h3>
            <p className="sub muted">Qiziqqan loyihalarni topib, to&apos;g&apos;ridan-to&apos;g&apos;ri so&apos;rang.</p>
            <ul className="checks">
              {INVESTOR_POINTS.map((t) => (
                <li key={t}>
                  <CheckIcon size={18} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Suspense fallback={null}>
              <GuestOnly>
                <Link className="btn btn-ghost panel-btn" href="/royxat?rol=investor">
                  Investor sifatida ro&apos;yxatdan o&apos;tish
                </Link>
              </GuestOnly>
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="trust">
          <div>
            <h2>Baho va tasdiq belgisini startap o&apos;zi qo&apos;ya olmaydi</h2>
            <p className="muted">
              Baho (0 dan 100 gacha) va &laquo;Tasdiqlangan&raquo; belgisi Investage jamoasi tomonidan qo&apos;yiladi.
              Startap ularni o&apos;zgartira olmaydi, shuning uchun investor ularga tayana oladi.
            </p>
          </div>
          <div className="trust-visual">
            <div className="tile">
              <ScoreRing value={78} size={64} />
              <b>Baho</b>
              <span className="muted small">0 dan 100 gacha</span>
            </div>
            <div className="tile">
              <span className="tile-seal">
                <SealIcon size={40} />
              </span>
              <b>Tasdiqlangan</b>
              <span className="muted small">Hujjatlari tekshirilgan</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Yangi startaplar</h2>
          <Link href="/startaplar">Barchasini ko&apos;rish</Link>
        </div>
        <Suspense fallback={<div className="skel-row"><span className="skel skel-card" /><span className="skel skel-card" /><span className="skel skel-card" /></div>}>
          <LatestStartups />
        </Suspense>
      </section>
    </>
  );
}
