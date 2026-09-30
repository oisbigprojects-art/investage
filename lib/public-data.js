import { unstable_cache } from 'next/cache';
import { createServerClient } from '@supabase/ssr';

// Hamma uchun bir xil ochiq ma'lumotlar: kirmagan mijoz kabi (cookie'siz) olinadi va qisqa muddat keshlanadi.
// Shunda bosh sahifa va katalog har ko'rishda bazaga (boshqa qit'ada) bormaydi.
function anon() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [], setAll() {} },
  });
}

// Xato bo'lsa throw qilinadi, shunda noto'g'ri natija keshga tushmaydi
export const getPlatformStats = unstable_cache(
  async () => {
    const { data, error } = await anon().rpc('platform_stats');
    if (error) throw error;
    return data;
  },
  ['platform-stats'],
  { revalidate: 60 }
);

export const getLatestStartups = unstable_cache(
  async () => {
    const { data, error } = await anon()
      .from('startups')
      .select('id, name, sector, short_desc, stage, score, verified, logo_url')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    return data || [];
  },
  ['latest-startups'],
  { revalidate: 30 }
);

export const getCatalogFacets = unstable_cache(
  async () => {
    const { data, error } = await anon().from('startups').select('stage, sector, verified').eq('hidden', false);
    if (error) throw error;
    return data || [];
  },
  ['catalog-facets'],
  { revalidate: 60 }
);

export async function safe(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
