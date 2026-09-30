import Link from 'next/link';
import SiteChrome from '@/components/SiteChrome';
import { getT } from '@/lib/i18n/server';

export default async function NotFound() {
  const t = await getT();
  return (
    <SiteChrome>
      <div className="empty">
        <h3>{t('nf.title')}</h3>
        <p>{t('nf.text')}</p>
        <Link className="btn btn-gold" href="/startaplar">
          {t('nf.cta')}
        </Link>
      </div>
    </SiteChrome>
  );
}
