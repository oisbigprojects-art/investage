import { SITE_URL } from '@/lib/site-url';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/kabinet', '/api/', '/auth/', '/yangi-parol'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
