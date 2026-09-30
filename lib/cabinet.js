import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';

// Startap kabineti sahifalari uchun umumiy ma'lumot
export async function startupContext({ requireProfile = true } = {}) {
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'startup') redirect('/kabinet/investor');

  const { data: s } = await supabase.from('startups').select('*').eq('owner_id', user.id).maybeSingle();
  if (!s && requireProfile) redirect('/kabinet/startap/profil');
  const { data: p } = s
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
