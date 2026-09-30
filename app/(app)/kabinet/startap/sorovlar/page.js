import Link from 'next/link';
import { startupContext, pick } from '@/lib/cabinet';
import { getRequests } from '@/lib/data';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import StartupRequest from '@/components/StartupRequest';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.startup_requests') };
}

const FILTERS = [
  { key: 'hammasi', label: 'rq.f_all', empty: 'rq.empty_all', match: () => true },
  { key: 'kutilmoqda', label: 'rq.f_pending', empty: 'rq.empty_pending', match: (r) => r.status === 'pending' },
  { key: 'ruxsat', label: 'rq.f_approved', empty: 'rq.empty_approved', match: (r) => r.status === 'approved' },
  { key: 'tarix', label: 'rq.f_history', empty: 'rq.empty_history', match: (r) => r.status === 'rejected' || r.status === 'revoked' },
];

export default async function StartupRequests({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const holat = pick(sp?.holat, FILTERS.map((f) => f.key), 'hammasi');
  const [, all] = await Promise.all([startupContext(), getRequests()]);

  const active = FILTERS.find((f) => f.key === holat);
  const list = all.filter(active.match);

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{t('cab.startup')}</span>
        <h1>{t('rq.title')}</h1>
        <p className="muted">{t('rq.sub')}</p>
      </div>
      <Flash searchParams={sp} />

      <div className="filters" role="group" aria-label={t('rq.filter_aria')}>
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'hammasi' ? '/kabinet/startap/sorovlar' : `/kabinet/startap/sorovlar?holat=${f.key}`}
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
            <StartupRequest key={r.id} r={r} t={t} back={`/kabinet/startap/sorovlar${holat === 'hammasi' ? '' : `?holat=${holat}`}`} />
          ))
        )}
      </section>
    </>
  );
}
