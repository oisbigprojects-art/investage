import Link from 'next/link';
import { investorContext } from '@/lib/cabinet';
import { Flash, StageBadge, StatusBadge, Verified, Monogram } from '@/components/ui';
import { formatDate } from '@/lib/labels';

export const metadata = { title: "Umumiy ko'rinish — Investor kabineti — Investage" };

const SELECT =
  'id, status, created_at, decided_at, startup:startups(id, name, sector, stage, verified, logo_url)';

export default async function InvestorOverview({ searchParams }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await investorContext();

  const [{ data: reqs }, { data: saved }] = await Promise.all([
    supabase.from('access_requests').select(SELECT).eq('investor_id', user.id).order('created_at', { ascending: false }),
    supabase
      .from('saved_startups')
      .select('created_at, startup:startups(id, name, sector, stage, verified, logo_url)')
      .eq('investor_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  // Yashirilgan startaplar bilan bog'liq qatorlarda startup null bo'ladi
  const list = (reqs || []).filter((r) => r.startup);
  const savedList = (saved || []).filter((r) => r.startup);
  const approved = list.filter((r) => r.status === 'approved');
  const pending = list.filter((r) => r.status === 'pending');
  const closed = list.filter((r) => r.status === 'rejected' || r.status === 'revoked');
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
        <Link className="stat stat-link" href="/kabinet/investor/sorovlar?holat=ochilgan">
          <b className="num">{approved.length}</b>
          <span>Ochilgan startap</span>
        </Link>
        <Link className="stat stat-link" href="/kabinet/investor/sorovlar?holat=kutilmoqda">
          <b className="num">{pending.length}</b>
          <span>Javob kutilmoqda</span>
        </Link>
        <Link className="stat stat-link" href="/kabinet/investor/sorovlar?holat=tarix">
          <b className="num">{closed.length}</b>
          <span>Rad etilgan yoki yopilgan</span>
        </Link>
        <Link className="stat stat-link" href="/kabinet/investor/saqlangan">
          <b className="num">{savedList.length}</b>
          <span>Saqlangan</span>
        </Link>
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

      <div className="cab-cols cab-cols-even">
        <section className="card">
          <div className="section-head sm">
            <h2>So&apos;nggi so&apos;rovlar</h2>
            {list.length > 4 && (
              <Link className="small" href="/kabinet/investor/sorovlar">
                Hammasi ({list.length})
              </Link>
            )}
          </div>
          {list.length === 0 ? (
            <p className="muted small">Hali so&apos;rov yubormagansiz. Katalogdan qiziqqan startapni tanlang.</p>
          ) : (
            list.slice(0, 4).map((r) => (
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
            {savedList.length > 4 && (
              <Link className="small" href="/kabinet/investor/saqlangan">
                Hammasi ({savedList.length})
              </Link>
            )}
          </div>
          {savedList.length === 0 ? (
            <p className="muted small">Katalogda yoqqan startapni belgilab qo&apos;ying, keyin shu yerdan topasiz.</p>
          ) : (
            savedList.slice(0, 4).map((r) => (
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
    </>
  );
}
