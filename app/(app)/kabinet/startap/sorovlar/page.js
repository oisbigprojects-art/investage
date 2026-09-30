import Link from 'next/link';
import { startupContext, pick } from '@/lib/cabinet';
import { getRequests } from '@/lib/data';
import { Flash } from '@/components/ui';
import StartupRequest from '@/components/StartupRequest';

export const metadata = { title: "So'rovlar — Startap kabineti — Investage" };

const FILTERS = [
  { key: 'hammasi', label: 'Hammasi', match: () => true },
  { key: 'kutilmoqda', label: 'Kutilmoqda', match: (r) => r.status === 'pending' },
  { key: 'ruxsat', label: 'Ruxsat berilgan', match: (r) => r.status === 'approved' },
  { key: 'tarix', label: 'Tarix', match: (r) => r.status === 'rejected' || r.status === 'revoked' },
];

const EMPTY = {
  hammasi: "Hali hech kim so'rov yubormagan.",
  kutilmoqda: "Javob kutayotgan so'rov yo'q.",
  ruxsat: 'Hali hech kimga ruxsat bermagansiz.',
  tarix: "Rad etilgan yoki yopilgan so'rovlar yo'q.",
};

export default async function StartupRequests({ searchParams }) {
  const sp = await searchParams;
  const holat = pick(sp?.holat, FILTERS.map((f) => f.key), 'hammasi');
  const [, all] = await Promise.all([startupContext(), getRequests()]);

  const active = FILTERS.find((f) => f.key === holat);
  const list = all.filter(active.match);

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Startap kabineti</span>
        <h1>Kirish so&apos;rovlari</h1>
        <p className="muted">Investorlar yopiq ma&apos;lumotlaringizni ko&apos;rish uchun so&apos;rov yuboradi. Qaror sizniki.</p>
      </div>
      <Flash searchParams={sp} />

      <div className="filters" role="group" aria-label="So'rovlarni saralash">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'hammasi' ? '/kabinet/startap/sorovlar' : `/kabinet/startap/sorovlar?holat=${f.key}`}
            className={`filter ${holat === f.key ? 'is-on' : ''}`}
          >
            {f.label} <span className="filter-n">{all.filter(f.match).length}</span>
          </Link>
        ))}
      </div>

      <section className="card">
        {list.length === 0 ? (
          <p className="muted small">{EMPTY[holat]}</p>
        ) : (
          list.map((r) => (
            <StartupRequest key={r.id} r={r} back={`/kabinet/startap/sorovlar${holat === 'hammasi' ? '' : `?holat=${holat}`}`} />
          ))
        )}
      </section>
    </>
  );
}
