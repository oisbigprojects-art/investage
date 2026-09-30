import Link from 'next/link';
import { investorContext, pick } from '@/lib/cabinet';
import { getRequests } from '@/lib/data';
import { Flash, StageBadge, StatusBadge, Verified, Monogram } from '@/components/ui';
import { withdrawRequest } from '@/app/cabinet-actions';
import { formatDate } from '@/lib/labels';

export const metadata = { title: "So'rovlarim — Investor kabineti — Investage" };

const FILTERS = [
  { key: 'hammasi', label: 'Hammasi', match: () => true },
  { key: 'ochilgan', label: 'Ochilgan', match: (r) => r.status === 'approved' },
  { key: 'kutilmoqda', label: 'Kutilmoqda', match: (r) => r.status === 'pending' },
  { key: 'tarix', label: 'Rad etilgan / yopilgan', match: (r) => r.status === 'rejected' || r.status === 'revoked' },
];

const EMPTY = {
  hammasi: "Hali so'rov yubormagansiz.",
  ochilgan: 'Hali hech bir startap sizga ruxsat bermagan.',
  kutilmoqda: "Kutilayotgan so'rovlar yo'q.",
  tarix: "Rad etilgan yoki yopilgan so'rovlar yo'q.",
};

export default async function InvestorRequests({ searchParams }) {
  const sp = await searchParams;
  const holat = pick(sp?.holat, FILTERS.map((f) => f.key), 'hammasi');
  const [, all] = await Promise.all([investorContext(), getRequests()]);

  const active = FILTERS.find((f) => f.key === holat);
  const list = all.filter(active.match);
  const backPath = `/kabinet/investor/sorovlar${holat === 'hammasi' ? '' : `?holat=${holat}`}`;

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Investor kabineti</span>
        <h1>So&apos;rovlarim</h1>
        <p className="muted">Javob kelmagan so&apos;rovni qaytarib olishingiz, rad etilganini qayta yuborishingiz mumkin.</p>
      </div>
      <Flash searchParams={sp} />

      <div className="filters" role="group" aria-label="So'rovlarni saralash">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'hammasi' ? '/kabinet/investor/sorovlar' : `/kabinet/investor/sorovlar?holat=${f.key}`}
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
            <div className="req" key={r.id}>
              <Link href={`/startaplar/${r.startup.id}`} className="req-who req-open">
                <Monogram name={r.startup.name} logo={r.startup.logo_url} size={44} />
                <div className="req-main">
                  <strong>{r.startup.name}</strong> <Verified on={r.startup.verified} />
                  <div className="muted small">
                    {r.startup.sector && <>{r.startup.sector} · </>}
                    so&apos;rov: {formatDate(r.created_at)}
                    {r.decided_at && <> · javob: {formatDate(r.decided_at)}</>}
                  </div>
                </div>
              </Link>
              <div className="req-actions">
                <StageBadge stage={r.startup.stage} />
                <StatusBadge status={r.status} />
                {r.status === 'pending' && (
                  <form action={withdrawRequest}>
                    <input type="hidden" name="request_id" value={r.id} />
                    <input type="hidden" name="back" value={backPath} />
                    <button className="btn btn-ghost btn-sm" type="submit">
                      Qaytarib olish
                    </button>
                  </form>
                )}
                {(r.status === 'rejected' || r.status === 'revoked') && (
                  <Link className="btn btn-ghost btn-sm" href={`/startaplar/${r.startup.id}`}>
                    Qayta so&apos;rash
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
