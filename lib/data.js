import { cache } from 'react';
import { getSession, getAuthUser } from '@/lib/supabase/server';

// Barcha kabinet ma'lumotlari bir so'rovda olinadi va bir so'rov davomida qayta ishlatiladi.
// RLS: startap faqat o'z startapiga kelgan, investor faqat o'zi yuborgan so'rovlarni ko'radi.
const REQUEST_SELECT =
  'id, status, message, created_at, decided_at, startup_id, investor_id, ' +
  'investor:profiles!access_requests_investor_id_fkey(full_name, email, company, interests, bio), ' +
  'startup:startups(id, name, sector, stage, verified, logo_url)';

// Ma'lumot so'rovi profil so'rovi bilan bir vaqtda ketadi (RLS baribir himoya qiladi; profil yo'q bo'lsa natija tashlanadi)
export const getRequests = cache(async () => {
  const { supabase, user } = await getAuthUser();
  if (!user) return [];
  const [{ data }, { profile }] = await Promise.all([
    supabase.from('access_requests').select(REQUEST_SELECT).order('created_at', { ascending: false }).limit(300),
    getSession(),
  ]);
  if (!profile) return [];
  const rows = data || [];
  // Investor uchun yashirilgan startap qatori (startup = null) ko'rsatilmaydi
  return profile.role === 'investor' ? rows.filter((r) => r.startup) : rows;
});

export const getSaved = cache(async () => {
  const { supabase, user } = await getAuthUser();
  if (!user) return [];
  const [{ data }, { profile }] = await Promise.all([
    supabase
      .from('saved_startups')
      .select('created_at, startup:startups(id, name, sector, short_desc, stage, score, verified, logo_url)')
      .eq('investor_id', user.id)
      .order('created_at', { ascending: false }),
    getSession(),
  ]);
  if (profile?.role !== 'investor') return [];
  return (data || []).filter((r) => r.startup);
});

export const getMyStartup = cache(async (userId) => {
  const { supabase } = await getAuthUser();
  const { data } = await supabase.from('startups').select('*').eq('owner_id', userId).maybeSingle();
  return data || null;
});
