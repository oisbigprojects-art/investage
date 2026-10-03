import { headers } from 'next/headers';

// Saytning to'liq manzili (havolalar uchun). SITE_URL o'rnatilsa — o'sha, aks holda so'rov kelgan manzil.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://investage.uz';

export async function originUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : SITE_URL;
}
