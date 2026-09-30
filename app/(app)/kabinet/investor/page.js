import Link from 'next/link';
import { investorContext } from '@/lib/cabinet';
import { getRequests, getSaved } from '@/lib/data';
import { buildEvents, notificationsOf } from '@/lib/events';
import { weeklyCounts, statusCounts, acceptRate } from '@/lib/metrics';
import { Flash, StageBadge, StatusBadge, Verified, Monogram } from '@/components/ui';
import { Stat, BarChart, Donut } from '@/components/charts';
import ActivityFeed from '@/components/Activity';
import { formatDate } from '@/lib/labels';

export const metadata = { title: "Umumiy ko'rinish — Investor kabineti — Investage" };

export default async function InvestorOverview({ searchParams }) {
  const sp = await searchParams;
  const [{ profile }, requests, saved] = await Promise.all([investorContext(), getRequests(), getSaved()]);

  const counts = statusCounts(requests);
  const rate = acceptRate(counts);
  const events = buildEvents('investor', requests, saved);
  const { seen } = notificationsOf(events, profile.notifications_seen_at);
  const profileDone = !!(profile.bio && profile.interests);

  return (
    <>
      <div className="page-head cab-head">
        <div className="cab-head-text">
          <span className="role-tag">Investor kabineti</span>
          <h1>Salom, {profile.full_name || 'investor'}</h1>
          <p className="muted">Ochilgan startaplar, javob kutayotgan so&apos;rovlar va saqlanganlaringiz shu yerda.</p>
        </div>
        <Link href="/startaplar" className="btn btn-gold">
          Startaplarni ko&apos;rish
        </Link>
      </div>
      <Flash searchParams={sp} />

      <div className="stats stats-4">
        <Stat value={counts.approved} label="Ochilgan startap" href="/kabinet/investor/sorovlar?holat=ochilgan" />
        <Stat value={counts.pending} label="Javob kutilmoqda" href="/kabinet/investor/sorovlar?holat=kutilmoqda" tone={counts.pending ? 'gold' : undefined} />
        <Stat value={saved.length} label="Saqlangan" href="/kabinet/investor/saqlangan" />
        {rate === null ? (
          <Stat text="—" label="Ochilish ulushi" hint="Hali javob yo'q" />
        ) : (
          <Stat value={rate} suffix="%" label="Ochilish ulushi" hint="Ruxsat / javoblar" />
        )}
      </div>

      {!profileDone && (
        <section className="card nudge">
          <div>
            <h2>Profilingizni to&apos;ldiring</h2>
            <p className="muted small">
              Startap so&apos;rovingizni ko&apos;rganda sizning kimligingiz va qiziqishingizni ham ko&apos;radi. To&apos;liq
              profil tasdiqlanish ehtimolini oshiradi.
            </p>
          </div>
          <Link href="/kabinet/investor/profil" className="btn btn-ghost btn-sm">
            Profilga o&apos;tish
          </Link>
        </section>
      )}

      <div className="dash-row">
        <section className="card">
          <div className="section-head sm">
            <h2>Yuborgan so&apos;rovlaringiz</h2>
            <span className="muted small">oxirgi 8 hafta</span>
          </div>
          <BarChart data={weeklyCounts(requests)} title="Haftalik yuborilgan so'rovlar" />
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
              { label: 'Ochilgan', value: counts.approved, tone: 'ok' },
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
              <h2>So&apos;nggi so&apos;rovlar</h2>
              {requests.length > 4 && (
                <Link className="small" href="/kabinet/investor/sorovlar">
                  Hammasi ({requests.length})
                </Link>
              )}
            </div>
            {requests.length === 0 ? (
              <p className="muted small">Hali so&apos;rov yubormagansiz. Katalogdan qiziqqan startapni tanlang.</p>
            ) : (
              requests.slice(0, 4).map((r) => (
                <Link href={`/startaplar/${r.startup.id}`} className="req req-link" key={r.id}>
                  <div className="req-who">
                    <Monogram name={r.startup.name} logo={r.startup.logo_url} size={40} />
                    <div className="req-main">
                      <strong>{r.startup.name}</strong>
                      <div className="muted small">{formatDate(r.decided_at || r.created_at)}</div>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))
            )}
          </section>

          <section className="card">
            <div className="section-head sm">
              <h2>Saqlanganlar</h2>
              {saved.length > 4 && (
                <Link className="small" href="/kabinet/investor/saqlangan">
                  Hammasi ({saved.length})
                </Link>
              )}
            </div>
            {saved.length === 0 ? (
              <p className="muted small">Katalogda yoqqan startapni belgilab qo&apos;ying, keyin shu yerdan topasiz.</p>
            ) : (
              saved.slice(0, 4).map((r) => (
                <Link href={`/startaplar/${r.startup.id}`} className="req req-link" key={r.startup.id}>
                  <div className="req-who">
                    <Monogram name={r.startup.name} logo={r.startup.logo_url} size={40} />
                    <div className="req-main">
                      <strong>{r.startup.name}</strong> <Verified on={r.startup.verified} />
                      <div className="muted small">{r.startup.sector || 'Soha ko‘rsatilmagan'}</div>
                    </div>
                  </div>
                  <StageBadge stage={r.startup.stage} />
                </Link>
              ))
            )}
          </section>
        </div>

        <section className="card">
          <div className="section-head sm">
            <h2>Faollik</h2>
          </div>
          <ActivityFeed events={events} limit={8} showUnread={seen} />
        </section>
      </div>
    </>
  );
}
