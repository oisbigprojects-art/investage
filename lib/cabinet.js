import { redirect } from 'next/navigation';
import { getSession, getAuthUser } from '@/lib/supabase/server';
import { getMyStartup } from '@/lib/data';

// Startap kabineti sahifalari uchun umumiy ma'lumot
export async function startupContext({ requireProfile = true, withPrivate = false } = {}) {
  const auth = await getAuthUser();
  if (!auth.user) redirect('/kirish');
  // Startap profil bilan bir vaqtda so'raladi (bitta tarmoq qadami tejaladi)
  const [{ supabase, user, profile }, s] = await Promise.all([getSession(), getMyStartup(auth.user.id)]);
  if (!user) redirect('/kirish');
  if (profile?.role !== 'startup') redirect('/kabinet/investor');
  if (!s && requireProfile) redirect('/kabinet/startap/profil');
  const { data: p } =
    s && withPrivate
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
