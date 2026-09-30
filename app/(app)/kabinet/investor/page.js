import Link from 'next/link';
import { investorContext } from '@/lib/cabinet';
import { getT } from '@/lib/i18n/server';
import { getRequests, getSaved } from '@/lib/data';
import { buildEvents, notificationsOf } from '@/lib/events';
import { weeklyCounts, statusCounts, acceptRate } from '@/lib/metrics';
import { Flash, StageBadge, StatusBadge, Verified, Monogram } from '@/components/ui';
import { Stat, BarChart, Donut } from '@/components/charts';
import ActivityFeed from '@/components/Activity';
import { formatDate } from '@/lib/labels';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.investor_overview') };
}

export default async function InvestorOverview({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const [{ profile }, requests, saved] = await Promise.all([investorContext(), getRequests(), getSaved()]);

  const counts = statusCounts(requests);
  const rate = acceptRate(counts);
  const events = buildEvents('investor', requests, saved, t);
  const { seen } = notificationsOf(events, profile.notifications_seen_at);
  const profileDone = !!(profile.bio && profile.interests);

  return (
    <>
      <div className="page-head cab-head">
        <div className="cab-head-text">
          <span className="role-tag">{t('cab.investor')}</span>
          <h1>{t('io.hello', { name: profile.full_name || t('io.default_name') })}</h1>
          <p className="muted">{t('io.sub')}</p>
        </div>
        <Link href="/startaplar" className="btn btn-gold">
          {t('io.browse')}
        </Link>
      </div>
      <Flash searchParams={sp} />

      <div className="stats stats-4">
        <Stat value={counts.approved} label={t('io.stat_approved')} href="/kabinet/investor/sorovlar?holat=ochilgan" />
        <Stat value={counts.pending} label={t('io.stat_pending')} href="/kabinet/investor/sorovlar?holat=kutilmoqda" tone={counts.pending ? 'gold' : undefined} />
        <Stat value={saved.length} label={t('io.stat_saved')} href="/kabinet/investor/saqlangan" />
        {rate === null ? (
          <Stat text="—" label={t('io.stat_rate')} hint={t('io.stat_rate_none')} />
        ) : (
          <Stat value={rate} suffix="%" label={t('io.stat_rate')} hint={t('io.stat_rate_hint')} />
        )}
      </div>

      {!profileDone && (
        <section className="card nudge">
          <div>
            <h2>{t('io.nudge_title')}</h2>
            <p className="muted small">{t('io.nudge_text')}</p>
          </div>
          <Link href="/kabinet/investor/profil" className="btn btn-ghost btn-sm">
            {t('io.nudge_cta')}
          </Link>
        </section>
      )}

      <div className="dash-row">
        <section className="card">
          <div className="section-head sm">
            <h2>{t('io.sent')}</h2>
            <span className="muted small">{t('so.last8')}</span>
          </div>
          <BarChart data={weeklyCounts(requests)} title={t('io.weekly')} t={t} />
        </section>
        <section className="card">
          <div className="section-head sm">
            <h2>{t('so.states')}</h2>
          </div>
          <Donut
            title={t('so.states_chart')}
            centerLabel={t('so.states_center')}
            parts={[
              { label: t('donut.pending'), value: counts.pending, tone: 'warn' },
              { label: t('donut.approved_i'), value: counts.approved, tone: 'ok' },
              { label: t('donut.rejected'), value: counts.rejected, tone: 'bad' },
              { label: t('donut.revoked'), value: counts.revoked, tone: 'muted' },
            ]}
          />
        </section>
      </div>

      <div className="cab-cols">
        <div className="cab-stack">
          <section className="card">
            <div className="section-head sm">
              <h2>{t('io.recent')}</h2>
              {requests.length > 4 && (
                <Link className="small" href="/kabinet/investor/sorovlar">
                  {t('so.all', { n: requests.length })}
                </Link>
              )}
            </div>
            {requests.length === 0 ? (
              <p className="muted small">{t('io.no_requests')}</p>
            ) : (
              requests.slice(0, 4).map((r) => (
                <Link href={`/startaplar/${r.startup.id}`} className="req req-link" key={r.id}>
                  <div className="req-who">
                    <Monogram name={r.startup.name} logo={r.startup.logo_url} size={40} />
                    <div className="req-main">
                      <strong>{r.startup.name}</strong>
                      <div className="muted small">{formatDate(r.decided_at || r.created_at, t)}</div>
                    </div>
                  </div>
                  <StatusBadge status={r.status} t={t} />
                </Link>
              ))
            )}
          </section>

          <section className="card">
            <div className="section-head sm">
              <h2>{t('io.saved')}</h2>
              {saved.length > 4 && (
                <Link className="small" href="/kabinet/investor/saqlangan">
                  {t('so.all', { n: saved.length })}
                </Link>
              )}
            </div>
            {saved.length === 0 ? (
              <p className="muted small">{t('io.no_saved')}</p>
            ) : (
              saved.slice(0, 4).map((r) => (
                <Link href={`/startaplar/${r.startup.id}`} className="req req-link" key={r.startup.id}>
                  <div className="req-who">
                    <Monogram name={r.startup.name} logo={r.startup.logo_url} size={40} />
                    <div className="req-main">
                      <strong>{r.startup.name}</strong> <Verified on={r.startup.verified} t={t} />
                      <div className="muted small">{r.startup.sector || t('card.no_sector')}</div>
                    </div>
                  </div>
                  <StageBadge stage={r.startup.stage} t={t} />
                </Link>
              ))
            )}
          </section>
        </div>

        <section className="card">
          <div className="section-head sm">
            <h2>{t('feed.title')}</h2>
          </div>
          <ActivityFeed events={events} limit={8} showUnread={seen} t={t} />
        </section>
      </div>
    </>
  );
}
