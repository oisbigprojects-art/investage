import { getT } from '@/lib/i18n/server';
import { pickStrings } from '@/lib/i18n';
import { RT_KEYS, shortKeys } from '@/lib/readiness-keys';
import ReadinessTest from '@/components/ReadinessTest';

export async function generateMetadata() {
  const t = await getT();
  const title = t('rt.title');
  const description = t('rt.home_text');
  const image = `/api/test-rasm?f=og&til=${t.lang}`;
  return {
    title,
    description,
    alternates: { canonical: '/test' },
    openGraph: { title, description, url: '/test', images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

// Ochiq test: ro'yxatdan o'tish shart emas
export default async function TestPage() {
  const t = await getT();
  return (
    <div className="rt-page">
      <ReadinessTest s={shortKeys(pickStrings(t, RT_KEYS))} lang={t.lang} />
    </div>
  );
}
