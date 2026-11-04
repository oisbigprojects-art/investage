import Link from 'next/link';
import { getT } from '@/lib/i18n/server';
import { clampScore, levelOf } from '@/lib/readiness';
import { ScoreRing } from '@/components/ReadinessTest';

// Ulashilgan havola: do'stning umumiy bali (javoblar emas) va o'zingiz tekshirishga taklif.
// Ball havoladan olinadi, shuning uchun bu sahifa qidiruvga qo'yilmaydi.
export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const b = clampScore(sp?.b);
  const title = `${b}/100 — ${t('rt.title')}`;
  const description = t('rt.home_text');
  const image = `/api/test-rasm?f=og&b=${b}&til=${t.lang}`;
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function SharedResult({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const b = clampScore(sp?.b);
  const level = levelOf(b);
  return (
    <div className="rt-page">
      <div className="card rt-card rt-score">
        <p className="rt-kicker">{t('rt.friend')}</p>
        <ScoreRing score={b} />
        <h1>{level.title[t.lang] || level.title.uz}</h1>
        <p className="muted">{t('rt.home_text')}</p>
        <div className="row rt-actions">
          <Link className="btn btn-gold" href="/test">{t('rt.try')}</Link>
        </div>
      </div>
    </div>
  );
}
