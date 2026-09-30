import Link from 'next/link';
import { investorContext } from '@/lib/cabinet';
import { getSaved } from '@/lib/data';
import { Flash } from '@/components/ui';
import StartupCard from '@/components/StartupCard';

export const metadata = { title: 'Saqlanganlar — Investor kabineti — Investage' };

export default async function SavedStartups({ searchParams }) {
  const sp = await searchParams;
  const [, list] = await Promise.all([investorContext(), getSaved()]);

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Investor kabineti</span>
        <h1>Saqlanganlar</h1>
        <p className="muted">Keyinroq qaytish uchun belgilagan startaplaringiz. Ularni faqat siz ko&apos;rasiz.</p>
      </div>
      <Flash searchParams={sp} />

      {list.length ? (
        <div className="grid">
          {list.map((r) => (
            <StartupCard key={r.startup.id} s={r.startup} canSave saved back="/kabinet/investor/saqlangan" />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>Hali hech narsa saqlanmagan</h3>
          <p>Katalogda startap kartasidagi belgi tugmasini bosing, u shu yerga tushadi.</p>
          <Link className="btn btn-gold" href="/startaplar">
            Startaplarni ko&apos;rish
          </Link>
        </div>
      )}
    </>
  );
}
