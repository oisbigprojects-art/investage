import CabinetSplash from '@/components/CabinetSplash';
import { getT } from '@/lib/i18n/server';

// Kabinetga kirishda animatsiya (startap va investorga alohida)
export default async function KabinetLayout({ children }) {
  const t = await getT();
  return (
    <>
      <CabinetSplash labels={{ startup: t('cab.startup'), investor: t('cab.investor') }} />
      {children}
    </>
  );
}
