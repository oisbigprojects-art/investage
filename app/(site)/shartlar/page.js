import { getT } from '@/lib/i18n/server';
import { TERMS, UPDATED } from '@/lib/legal';
import LegalDoc from '@/components/LegalDoc';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.terms'), alternates: { canonical: '/shartlar' } };
}

export default async function Page() {
  const t = await getT();
  return (
    <LegalDoc
      title={t('legal.terms_title')}
      sections={TERMS[t.lang] || TERMS.uz}
      updated={UPDATED}
      t={t}
      other={{ href: '/maxfiylik', label: t('legal.privacy_title') }}
    />
  );
}
