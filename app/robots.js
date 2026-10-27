import { SITE_URL } from '@/lib/site-url';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/kabinet', '/admin', '/api/', '/auth/', '/yangi-parol', '/sorovnoma'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
