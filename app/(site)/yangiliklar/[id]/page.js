import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getT } from '@/lib/i18n/server';
import { getNewsItem, safe } from '@/lib/public-data';
import { formatDate } from '@/lib/labels';

const isId = (v) => /^[0-9a-f-]{36}$/i.test(v);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const n = isId(id) ? await safe(() => getNewsItem(id), null) : null;
  if (!n) return {};
  return { title: `${n.title} — Investage`, description: n.body.slice(0, 160), alternates: { canonical: `/yangiliklar/${id}` } };
}

// Matn oddiy matn sifatida chiqadi: HTML ishlamaydi
export default async function NewsItem({ params }) {
  const { id } = await params;
  const [n, t] = await Promise.all([isId(id) ? safe(() => getNewsItem(id), null) : null, getT()]);
  if (!n) notFound();
  return (
    <article className="news-item">
      <Link href="/yangiliklar" className="back">← {t('news.title')}</Link>
      <time className="muted small">{formatDate(n.published_at, t)}</time>
      <h1>{n.title}</h1>
      <p className="pre">{n.body}</p>
    </article>
  );
}
