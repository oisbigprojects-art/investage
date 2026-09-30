import Link from 'next/link';
import { startupContext } from '@/lib/cabinet';
import { getRequests } from '@/lib/data';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { completeness } from '@/lib/completeness';
import { buildEvents, notificationsOf } from '@/lib/events';
import { weeklyCounts, statusCounts, acceptRate, avgResponseHours, formatHours } from '@/lib/metrics';
import { Flash, StageBadge, Verified, ScoreRing, Monogram, Progress } from '@/components/ui';
import { Stat, BarChart, Donut } from '@/components/charts';
import ActivityFeed from '@/components/Activity';
import StartupRequest from '@/components/StartupRequest';
import { CheckIcon, EyeOffIcon, GlobeIcon } from '@/components/icons';
import { setVisibility } from '@/app/cabinet-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.startup_overview') };
}

export default async function StartupOverview({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  // Startap va so'rovlar bir vaqtda (so'rovlar menyu bilan umumiy so'rovdan olinadi)
  const [{ s, p }, requests, { profile }] = await Promise.all([
    startupContext({ withPrivate: true }),
    getRequests(),
    getSession(),
  ]);

  const counts = statusCounts(requests);
  const pending = requests.filter((r) => r.status === 'pending');
  const rate = acceptRate(counts);
  const events = buildEvents('startup', requests, [], t);
  const { seen } = notificationsOf(events, profile.notifications_seen_at);
  const c = completeness(s, p);

  return (
    <>
      <div className="page-head cab-head">
        <Monogram name={s.name} logo={s.logo_url} size={60} />
        <div className="cab-head-text">
          <span className="role-tag">{t('cab.startup')}</span>
          <h1>{s.name}</h1>
          <div className="head-meta">
            <StageBadge stage={s.stage} t={t} />
            <Verified on={s.verified} t={t} />
            {s.hidden && (
              <span className="chip chip-warn">
                <i aria-hidden="true" />
                {t('ui.hidden_chip')}
              </span>
            )}
          </div>
        </div>
        <div className="ring-wrap">
          <ScoreRing value={s.score} size={56} t={t} />
          <small className="muted">{t('ui.score')}</small>
        </div>
      </div>
      <Flash searchParams={sp} />

      <div className="stats stats-4">
        <Stat value={counts.pending} label={t('so.stat_pending')} href="/kabinet/startap/sorovlar?holat=kutilmoqda" tone={counts.pending ? 'gold' : undefined} />
        <Stat value={counts.approved} label={t('so.stat_approved')} href="/kabinet/startap/sorovlar?holat=ruxsat" />
        {rate === null ? (
          <Stat text="—" label={t('so.stat_rate')} hint={t('so.stat_rate_none')} />
        ) : (
          <Stat value={rate} suffix="%" label={t('so.stat_rate')} hint={t('so.stat_rate_hint')} />
        )}
        <Stat text={formatHours(avgResponseHours(requests), t)} label={t('so.stat_resp')} hint={t('so.stat_resp_hint')} />
      </div>

      <div className="dash-row">
        <section className="card">
          <div className="section-head sm">
            <h2>{t('so.dynamics')}</h2>
            <span className="muted small">{t('so.last8')}</span>
          </div>
          <BarChart data={weeklyCounts(requests)} title={t('so.weekly')} t={t} />
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
              { label: t('donut.approved_s'), value: counts.approved, tone: 'ok' },
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
              <h2>{t('so.new')}</h2>
              {pending.length > 3 && (
                <Link className="small" href="/kabinet/startap/sorovlar?holat=kutilmoqda">
                  {t('so.all', { n: pending.length })}
                </Link>
              )}
            </div>
            {pending.length === 0 ? (
              <p className="muted small">{t('so.no_new')}</p>
            ) : (
              pending.slice(0, 3).map((r) => <StartupRequest key={r.id} r={r} back="/kabinet/startap" t={t} />)
            )}
          </section>
          <section className="card">
            <div className="section-head sm">
              <h2>{t('vis.title')}</h2>
            </div>
            <p className="muted small">{s.hidden ? t('vis.hidden_text') : t('vis.shown_text')}</p>
            <form action={setVisibility}>
              <input type="hidden" name="hidden" value={s.hidden ? 'false' : 'true'} />
              <input type="hidden" name="back" value="/kabinet/startap" />
              <button className={`btn btn-sm ${s.hidden ? 'btn-gold' : 'btn-ghost'}`} type="submit">
                {s.hidden ? <GlobeIcon size={16} /> : <EyeOffIcon size={16} />}
                {s.hidden ? t('vis.show') : t('vis.hide')}
              </button>
            </form>
          </section>
        </div>

        <div className="cab-stack">
          <section className="card">
            <div className="section-head sm">
              <h2>{t('feed.title')}</h2>
            </div>
            <ActivityFeed events={events} showUnread={seen} t={t} />
          </section>

          <section className="card">
            <div className="section-head sm">
              <h2>{t('comp.title')}</h2>
              <b className="num c-gold">{c.percent}%</b>
            </div>
            <Progress value={c.percent} label={t('comp.title')} />
            <ul className="checklist">
              {c.items.map((i) => (
                <li key={i.key} className={i.done ? 'is-done' : ''}>
                  <span className="check-dot" aria-hidden="true">
                    {i.done && <CheckIcon size={12} />}
                  </span>
                  {t(`comp.${i.key}`)}
                </li>
              ))}
            </ul>
            {c.done < c.total && (
              <Link className="btn btn-ghost btn-sm" href="/kabinet/startap/profil">
                {t('comp.fill')}
              </Link>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
