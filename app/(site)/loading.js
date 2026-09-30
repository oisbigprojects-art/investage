import PageSkeleton from '@/components/Skeleton';
import { getT } from '@/lib/i18n/server';

export default async function Loading() {
  const t = await getT();
  return <PageSkeleton label={t('loading')} />;
}
