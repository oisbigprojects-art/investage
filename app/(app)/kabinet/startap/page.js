import Link from 'next/link';
import { startupContext } from '@/lib/cabinet';
import { getRequests } from '@/lib/data';
import { getSession } from '@/lib/supabase/server';
import { completeness } from '@/lib/completeness';
import { buildEvents, notificationsOf } from '@/lib/events';
import { weeklyCounts, statusCounts, acceptRate, avgResponseHours, formatHours } from '@/lib/metrics';
import { Flash, StageBadge, Verified, ScoreRing, Monogram, Progress } from '@/components/ui';
import { Stat, BarChart, Donut } from '@/components/charts';
import ActivityFeed from '@/components/Activity';
import StartupRequest from '@/components/StartupRequest';
import { CheckIcon, EyeOffIcon, GlobeIcon } from '@/components/icons';
import { setVisibility } from '@/app/cabinet-actions';

export const metadata = { title: "Umumiy ko'rinish — Startap kabineti — Investage" };

export default async function StartupOverview({ searchParams }) {
  const sp = await searchParams;
  // Startap va so'rovlar bir vaqtda (so'rovlar menyu bilan umumiy so'rovdan olinadi)
  const [{ s, p }, requests, { profile }] = await Promise.all([
    startupContext({ withPrivate: true }),
    getRequests(),
    getSession(),
  ]);

  const counts = statusCounts(requests);
  const pending = requests.filter((r) => r.status === 'pending');
  const rate = acceptRate(counts);
  const events = buildEvents('startup', requests);
  const { seen } = notificationsOf(events, profile.notifications_seen_at);
  const c = completeness(s, p);

  return (
    <>
      <div className="page-head cab-head">
        <Monogram name={s.name} logo={s.logo_url} size={60} />
        <div className="cab-head-text">
          <span className="role-tag">Startap kabineti</span>
          <h1>{s.name}</h1>
          <div className="head-meta">
            <StageBadge stage={s.stage} />
            <Verified on={s.verified} />
            {s.hidden && (
              <span className="chip chip-warn">
                <i aria-hidden="true" />
                Yashirilgan
              </span>
            )}
          </div>
        </div>
        <div className="ring-wrap">
          <ScoreRing value={s.score} size={56} />
          <small className="muted">Baho</small>
        </div>
      </div>
      <Flash searchParams={sp} />

      <div className="stats stats-4">
        <Stat value={counts.pending} label="Kutilayotgan so'rov" href="/kabinet/startap/sorovlar?holat=kutilmoqda" tone={counts.pending ? 'gold' : undefined} />
        <Stat value={counts.approved} label="Ruxsat berilgan investor" href="/kabinet/startap/sorovlar?holat=ruxsat" />
        {rate === null ? (
          <Stat text="—" label="Qabul ulushi" hint="Hali qaror yo'q" />
        ) : (
          <Stat value={rate} suffix="%" label="Qabul ulushi" hint="Ruxsat berilgan / qarorlar" />
        )}
        <Stat text={formatHours(avgResponseHours(requests))} label="O'rtacha javob vaqti" hint="So'rovdan qarorgacha" />
      </div>

      <div className="dash-row">
        <section className="card">
          <div className="section-head sm">
            <h2>So&apos;rovlar dinamikasi</h2>
            <span className="muted small">oxirgi 8 hafta</span>
          </div>
          <BarChart data={weeklyCounts(requests)} title="Haftalik kelgan so'rovlar" />
        </section>
        <section className="card">
          <div className="section-head sm">
            <h2>Holatlar</h2>
          </div>
          <Donut
            title="So'rovlar holati"
            centerLabel="so'rov"
            parts={[
              { label: 'Kutilmoqda', value: counts.pending, tone: 'warn' },
              { label: 'Ruxsat berilgan', value: counts.approved, tone: 'ok' },
              { label: 'Rad etilgan', value: counts.rejected, tone: 'bad' },
              { label: 'Yopilgan', value: counts.revoked, tone: 'muted' },
            ]}
          />
        </section>
      </div>

      <div className="cab-cols">
        <div className="cab-stack">
          <section className="card">
            <div className="section-head sm">
              <h2>Yangi so&apos;rovlar</h2>
              {pending.length > 3 && (
                <Link className="small" href="/kabinet/startap/sorovlar?holat=kutilmoqda">
                  Hammasi ({pending.length})
                </Link>
              )}
            </div>
            {pending.length === 0 ? (
              <p className="muted small">Hozircha yangi so&apos;rov yo&apos;q. Investor so&apos;rov yuborsa, shu yerda ko&apos;rinadi.</p>
            ) : (
              pending.slice(0, 3).map((r) => <StartupRequest key={r.id} r={r} back="/kabinet/startap" />)
            )}
          </section>
          <section className="card">
            <div className="section-head sm">
              <h2>Katalogda ko&apos;rinish</h2>
            </div>
            <p className="muted small">
              {s.hidden
                ? "Profilingiz yashirilgan: katalogda va qidiruvda chiqmaydi, investorlar so'rov yubora olmaydi. Berilgan ruxsatlar saqlanadi, ammo investorlar startapni ko'rmaydi."
                : "Profilingiz katalogda ko'rinadi. Vaqtincha yashirib turishingiz mumkin, hech narsa o'chmaydi."}
            </p>
            <form action={setVisibility}>
              <input type="hidden" name="hidden" value={s.hidden ? 'false' : 'true'} />
              <input type="hidden" name="back" value="/kabinet/startap" />
              <button className={`btn btn-sm ${s.hidden ? 'btn-gold' : 'btn-ghost'}`} type="submit">
                {s.hidden ? <GlobeIcon size={16} /> : <EyeOffIcon size={16} />}
                {s.hidden ? "Katalogda ko'rsatish" : 'Yashirish'}
              </button>
            </form>
          </section>
        </div>

        <div className="cab-stack">
          <section className="card">
            <div className="section-head sm">
              <h2>Faollik</h2>
            </div>
            <ActivityFeed events={events} showUnread={seen} />
          </section>

          <section className="card">
            <div className="section-head sm">
              <h2>Profil to&apos;liqligi</h2>
              <b className="num c-gold">{c.percent}%</b>
            </div>
            <Progress value={c.percent} label="Profil to'liqligi" />
            <ul className="checklist">
              {c.items.map((i) => (
                <li key={i.key} className={i.done ? 'is-done' : ''}>
                  <span className="check-dot" aria-hidden="true">
                    {i.done && <CheckIcon size={12} />}
                  </span>
                  {i.label}
                </li>
              ))}
            </ul>
            {c.done < c.total && (
              <Link className="btn btn-ghost btn-sm" href="/kabinet/startap/profil">
                Profilni to&apos;ldirish
              </Link>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
