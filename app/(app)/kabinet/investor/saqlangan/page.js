import Link from 'next/link';
import { investorContext } from '@/lib/cabinet';
import { getSaved } from '@/lib/data';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import StartupCard from '@/components/StartupCard';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.investor_saved') };
}

export default async function SavedStartups({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const [, list] = await Promise.all([investorContext(), getSaved()]);

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{t('cab.investor')}</span>
        <h1>{t('sv.title')}</h1>
        <p className="muted">{t('sv.sub')}</p>
      </div>
      <Flash searchParams={sp} />

      {list.length ? (
        <div className="grid">
          {list.map((r) => (
            <StartupCard key={r.startup.id} s={r.startup} t={t} canSave saved back="/kabinet/investor/saqlangan" />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>{t('sv.empty_title')}</h3>
          <p>{t('sv.empty_text')}</p>
          <Link className="btn btn-gold" href="/startaplar">
            {t('sv.empty_cta')}
          </Link>
        </div>
      )}
    </>
  );
}
