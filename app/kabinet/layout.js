import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import CabinetNav from '@/components/CabinetNav';
import { getMyStartup } from '@/lib/cabinet';

// Kabinet: chapda yon menyu, o'ngda tanlangan bo'lim
export default async function CabinetLayout({ children }) {
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');

  let items;
  let roleLabel;
  let hint;

  if (profile?.role === 'startup') {
    roleLabel = 'Startap';
    const mine = await getMyStartup(user.id);
    const s = mine?.s;
    const pending = mine?.pending || 0;
    items = [
      { href: '/kabinet/startap', label: "Umumiy ko'rinish", icon: 'grid', exact: true },
      { href: '/kabinet/startap/sorovlar', label: "So'rovlar", icon: 'inbox', badge: pending },
      { href: '/kabinet/startap/profil', label: 'Profil', icon: 'user' },
      ...(s ? [{ href: `/startaplar/${s.id}`, label: 'Ochiq sahifam', icon: 'globe', exact: true }] : []),
    ];
    if (s?.hidden) hint = 'Profilingiz yashirilgan: investorlar katalogda ko‘rmaydi.';
  } else {
    roleLabel = 'Investor';
    const [{ count: pending }, { count: saved }] = await Promise.all([
      supabase.from('access_requests').select('id', { count: 'exact', head: true }).eq('investor_id', user.id).eq('status', 'pending'),
      supabase.from('saved_startups').select('startup_id', { count: 'exact', head: true }).eq('investor_id', user.id),
    ]);
    items = [
      { href: '/kabinet/investor', label: "Umumiy ko'rinish", icon: 'grid', exact: true },
      { href: '/startaplar', label: 'Startaplar', icon: 'search', exact: true },
      { href: '/kabinet/investor/sorovlar', label: "So'rovlarim", icon: 'inbox', badge: pending || 0 },
      { href: '/kabinet/investor/saqlangan', label: 'Saqlanganlar', icon: 'bookmark', badge: saved || 0 },
      { href: '/kabinet/investor/profil', label: 'Profil', icon: 'user' },
    ];
  }

  return (
    <div className="cab">
      <CabinetNav items={items} name={profile?.full_name} roleLabel={roleLabel} hint={hint} />
      <div className="cab-body">{children}</div>
    </div>
  );
}
