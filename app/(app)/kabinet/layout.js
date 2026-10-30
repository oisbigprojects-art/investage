import CabinetSplash from '@/components/CabinetSplash';
import { redirect } from 'next/navigation';
import { getT } from '@/lib/i18n/server';
import { getSession } from '@/lib/supabase/server';

// Kabinetga kirishda animatsiya (startap va investorga alohida)
export default async function KabinetLayout({ children }) {
  const [t, { profile }] = await Promise.all([getT(), getSession()]);
  // Google bilan kirgan yangi foydalanuvchi avval rolini tanlaydi
  if (profile && profile.onboarded === false) redirect('/xush-kelibsiz');
  return (
    <>
      <CabinetSplash labels={{ startup: t('cab.startup'), investor: t('cab.investor') }} />
      {children}
    </>
  );
}
