import Link from 'next/link';
import { startupContext } from '@/lib/cabinet';
import { completeness } from '@/lib/completeness';
import { STARTUP_REQUESTS_SELECT } from '@/lib/queries';
import { Flash, StageBadge, Verified, ScoreRing, Monogram, Progress } from '@/components/ui';
import StartupRequest from '@/components/StartupRequest';
import { CheckIcon, EyeOffIcon, GlobeIcon } from '@/components/icons';
import { setVisibility } from '../actions';

export const metadata = { title: "Umumiy ko'rinish — Startap kabineti — Investage" };

export default async function StartupOverview({ searchParams }) {
  const sp = await searchParams;
  const { supabase, s } = await startupContext();

  // Ikkala so'rov bir vaqtda ketadi
  const [{ data: reqs }, { data: p }] = await Promise.all([
    supabase
      .from('access_requests')
      .select(STARTUP_REQUESTS_SELECT)
      .eq('startup_id', s.id)
      .order('created_at', { ascending: false }),
    supabase.from('startup_private').select('*').eq('startup_id', s.id).maybeSingle(),
  ]);

  const all = reqs || [];
  const pending = all.filter((r) => r.status === 'pending');
  const approved = all.filter((r) => r.status === 'approved');
  const closed = all.filter((r) => r.status === 'rejected' || r.status === 'revoked');
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

      <div className="stats">
        <Link className="stat stat-link" href="/kabinet/startap/sorovlar?holat=kutilmoqda">
          <b className="num">{pending.length}</b>
          <span>Kutilayotgan so&apos;rov</span>
        </Link>
        <Link className="stat stat-link" href="/kabinet/startap/sorovlar?holat=ruxsat">
          <b className="num">{approved.length}</b>
          <span>Ruxsat berilgan investor</span>
        </Link>
        <Link className="stat stat-link" href="/kabinet/startap/sorovlar?holat=tarix">
          <b className="num">{closed.length}</b>
          <span>Rad etilgan yoki yopilgan</span>
        </Link>
      </div>

      <div className="cab-cols">
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

        <div className="cab-stack">
          <section className="card">
            <div className="section-head sm">
              <h2>Profil to&apos;liqligi</h2>
              <b className="num c-gold">{c.percent}%</b>
            </div>
            <Progress value={c.percent} label="Profil to'liqligi" />
            <ul className="checklist">
              {c.items.map((i) => (
                <li key={i.key} className={i.done ? 'is-done' : ''}>
                  <span className="check-dot" aria-hidden="true">{i.done && <CheckIcon size={12} />}</span>
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
      </div>
    </>
  );
}
