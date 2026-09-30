import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';

// Startap + kutilayotgan so'rovlar soni: layout va sahifa uchun bitta so'rov
export const getMyStartup = cache(async (userId) => {
  const { supabase } = await getSession();
  const { data } = await supabase
    .from('startups')
    .select('*, pending:access_requests(count)')
    .eq('owner_id', userId)
    .eq('access_requests.status', 'pending')
    .maybeSingle();
  if (!data) return null;
  const { pending, ...s } = data;
  return { s, pending: pending?.[0]?.count || 0 };
});

// Startap kabineti sahifalari uchun umumiy ma'lumot
export async function startupContext({ requireProfile = true, withPrivate = false } = {}) {
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'startup') redirect('/kabinet/investor');

  const mine = await getMyStartup(user.id);
  const s = mine?.s || null;
  if (!s && requireProfile) redirect('/kabinet/startap/profil');
  const { data: p } = s && withPrivate
    ? await supabase.from('startup_private').select('*').eq('startup_id', s.id).maybeSingle()
    : { data: null };
  return { supabase, user, profile, s, p };
}

export async function investorContext() {
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'investor') redirect('/kabinet/startap');
  return { supabase, user, profile };
}

// Filtr qiymatini ruxsat etilganlar ichidan tanlaydi
export function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}
