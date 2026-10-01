import { SITE_URL } from '@/lib/site-url';
import { getSitemapStartups } from '@/lib/public-data';

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const pages = ['', '/startaplar', '/investorlar', '/yordam', '/royxat', '/kirish', '/shartlar', '/maxfiylik'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === '' || p === '/startaplar' ? 'daily' : 'monthly',
    priority: p === '' ? 1 : p === '/startaplar' ? 0.9 : 0.5,
  }));
  let startups = [];
  try {
    startups = await getSitemapStartups();
  } catch {}
  return [
    ...pages,
    ...startups.map((s) => ({ url: `${SITE_URL}/startaplar/${s.id}`, lastModified: new Date(s.created_at), changeFrequency: 'weekly', priority: 0.7 })),
  ];
}
