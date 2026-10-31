import { SITE_URL } from '@/lib/site-url';
import { getNews, getSitemapStartups, safe } from '@/lib/public-data';

export const revalidate = 3600;

export default async function sitemap() {
  const pages = ['', '/startaplar', '/investorlar', '/yangiliklar', '/yordam', '/royxat', '/kirish', '/shartlar', '/maxfiylik'].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: p === '' || p === '/startaplar' ? 'daily' : 'monthly',
    priority: p === '' ? 1 : p === '/startaplar' ? 0.9 : 0.5,
  }));
  let startups = [];
  try {
    startups = await getSitemapStartups();
  } catch {}
  return [
    ...pages,
    ...(await safe(() => getNews(100), [])).map((n) => ({ url: `${SITE_URL}/yangiliklar/${n.id}`, lastModified: new Date(n.published_at), changeFrequency: 'monthly', priority: 0.6 })),
    ...startups.map((s) => ({ url: `${SITE_URL}/startaplar/${s.id}`, lastModified: new Date(s.created_at), changeFrequency: 'weekly', priority: 0.7 })),
  ];
}
