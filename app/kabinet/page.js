import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';

// Rolga qarab to'g'ri kabinetga yo'naltiradi
export default async function Kabinet() {
  const { user, profile } = await getSession();
  if (!user) redirect('/kirish');
  redirect(profile?.role === 'startup' ? '/kabinet/startap' : '/kabinet/investor');
}
