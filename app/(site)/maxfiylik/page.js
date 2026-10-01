import { getT } from '@/lib/i18n/server';
import { PRIVACY, UPDATED } from '@/lib/legal';
import LegalDoc from '@/components/LegalDoc';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.privacy'), alternates: { canonical: '/maxfiylik' } };
}

export default async function Page() {
  const t = await getT();
  return (
    <LegalDoc
      title={t('legal.privacy_title')}
      sections={PRIVACY[t.lang] || PRIVACY.uz}
      updated={UPDATED}
      t={t}
      other={{ href: '/shartlar', label: t('legal.terms_title') }}
    />
  );
}
