import Link from 'next/link';
import { KINDS } from '@/lib/survey';
import s from '@/components/survey.module.css';

export const metadata = {
  title: "So'rovnoma | Investage",
  description: "Investage platformasini haqiqiy ehtiyojga moslab qurish uchun qisqa so'rovnoma.",
  robots: { index: false, follow: false },
};

export default function SurveyIntro() {
  return (
    <div className={s.page}>
      <header className={s.top}>
        <Link href="/" aria-label="Investage">
          <img src="/logo-dark.webp" alt="Investage" />
        </Link>
      </header>
      <div className={s.intro}>
        <h1>Investage'ni birga quraylik</h1>
        <p>
          Biz O'zbekistondagi startaplar va investorlarni bog'laydigan platforma qurmoqdamiz. Sizning haqiqiy tajribangiz biz uchun eng qimmatli ma'lumot. So'rovnoma 3-4 daqiqa oladi, javoblaringiz maxfiy.
        </p>
        <div className={s.choices}>
          {Object.values(KINDS).map((k) => (
            <Link key={k.slug} href={'/sorovnoma/' + k.slug} className={s.choice}>
              <div>
                <strong>{k.short}</strong>
                <span>{k.blurb}</span>
              </div>
              <em aria-hidden="true">&rarr;</em>
            </Link>
          ))}
        </div>
        <p className={s.note}>Aloqa ma'lumotlarini qoldirish ixtiyoriy.</p>
      </div>
    </div>
  );
}
