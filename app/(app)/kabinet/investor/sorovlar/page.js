import Link from 'next/link';
import { investorContext, pick } from '@/lib/cabinet';
import { getRequests } from '@/lib/data';
import { getT } from '@/lib/i18n/server';
import { Flash, StageBadge, StatusBadge, Verified, Monogram } from '@/components/ui';
import { withdrawRequest } from '@/app/cabinet-actions';
import { formatDate } from '@/lib/labels';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.investor_requests') };
}

const FILTERS = [
  { key: 'hammasi', label: 'ir.f_all', empty: 'ir.empty_all', match: () => true },
  { key: 'ochilgan', label: 'ir.f_opened', empty: 'ir.empty_opened', match: (r) => r.status === 'approved' },
  { key: 'kutilmoqda', label: 'ir.f_pending', empty: 'ir.empty_pending', match: (r) => r.status === 'pending' },
  { key: 'tarix', label: 'ir.f_history', empty: 'ir.empty_history', match: (r) => r.status === 'rejected' || r.status === 'revoked' },
];

export default async function InvestorRequests({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const holat = pick(sp?.holat, FILTERS.map((f) => f.key), 'hammasi');
  const [, all] = await Promise.all([investorContext(), getRequests()]);

  const active = FILTERS.find((f) => f.key === holat);
  const list = all.filter(active.match);
  const backPath = `/kabinet/investor/sorovlar${holat === 'hammasi' ? '' : `?holat=${holat}`}`;

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{t('cab.investor')}</span>
        <h1>{t('ir.title')}</h1>
        <p className="muted">{t('ir.sub')}</p>
      </div>
      <Flash searchParams={sp} />

      <div className="filters" role="group" aria-label={t('rq.filter_aria')}>
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'hammasi' ? '/kabinet/investor/sorovlar' : `/kabinet/investor/sorovlar?holat=${f.key}`}
            className={`filter ${holat === f.key ? 'is-on' : ''}`}
          >
            {t(f.label)} <span className="filter-n">{all.filter(f.match).length}</span>
          </Link>
        ))}
      </div>

      <section className="card">
        {list.length === 0 ? (
          <p className="muted small">{t(active.empty)}</p>
        ) : (
          list.map((r) => (
            <div className="req" key={r.id}>
              <Link href={`/startaplar/${r.startup.id}`} className="req-who req-open">
                <Monogram name={r.startup.name} logo={r.startup.logo_url} size={44} />
                <div className="req-main">
                  <strong>{r.startup.name}</strong> <Verified on={r.startup.verified} t={t} />
                  <div className="muted small">
                    {r.startup.sector && <>{r.startup.sector} · </>}
                    {t('ir.requested', { date: formatDate(r.created_at, t) })}
                    {r.decided_at && <> · {t('ir.answered', { date: formatDate(r.decided_at, t) })}</>}
                  </div>
                </div>
              </Link>
              <div className="req-actions">
                <StageBadge stage={r.startup.stage} t={t} />
                <StatusBadge status={r.status} t={t} />
                {r.status === 'pending' && (
                  <form action={withdrawRequest}>
                    <input type="hidden" name="request_id" value={r.id} />
                    <input type="hidden" name="back" value={backPath} />
                    <button className="btn btn-ghost btn-sm" type="submit">
                      {t('ir.withdraw')}
                    </button>
                  </form>
                )}
                {(r.status === 'rejected' || r.status === 'revoked') && (
                  <Link className="btn btn-ghost btn-sm" href={`/startaplar/${r.startup.id}`}>
                    {t('ir.again')}
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
