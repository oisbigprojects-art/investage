import Link from 'next/link';
import { getT } from '@/lib/i18n/server';
import { getNews, safe } from '@/lib/public-data';
import { formatDate } from '@/lib/labels';

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t('news.title')} — Investage`, description: t('news.sub'), alternates: { canonical: '/yangiliklar' } };
}

export default async function NewsPage() {
  const [news, t] = await Promise.all([safe(() => getNews(30), []), getT()]);
  return (
    <>
      <div className="page-head">
        <h1>{t('news.title')}</h1>
        <p className="muted">{t('news.sub')}</p>
      </div>
      {news.length ? (
        <div className="news-list">
          {news.map((n) => (
            <Link key={n.id} href={`/yangiliklar/${n.id}`} className="card news-card">
              <time className="muted small">{formatDate(n.published_at, t)}</time>
              <h2>{n.title}</h2>
              <p className="muted">{n.body.slice(0, 180)}{n.body.length > 180 ? '…' : ''}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty"><h3>{t('news.empty')}</h3></div>
      )}
    </>
  );
}
