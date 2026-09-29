import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { Flash, StageBadge, Verified, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/labels';

export default async function InvestorCabinet({ searchParams }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'investor') redirect('/kabinet/startap');

  const { data: reqs } = await supabase
    .from('access_requests')
    .select('id, status, created_at, decided_at, startup:startups(id, name, sector, stage, verified)')
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false });

  const list = reqs || [];
  const approved = list.filter((r) => r.status === 'approved');
  const pending = list.filter((r) => r.status === 'pending');
  const other = list.filter((r) => r.status === 'rejected' || r.status === 'revoked');

  return (
    <>
      <div className="page-head">
        <span className="role-tag role-tag-investor">Investor kabineti</span>
        <h1>Salom, {profile.full_name || 'investor'}</h1>
        <div className="row">
          <Link href="/startaplar" className="btn btn-primary">Startaplarni ko&apos;rish</Link>
        </div>
      </div>
      <Flash searchParams={sp} />

      <div className="stats">
        <div className="stat"><b>{approved.length}</b><span>Ochiq startaplar</span></div>
        <div className="stat"><b>{pending.length}</b><span>Javob kutilmoqda</span></div>
        <div className="stat"><b>{other.length}</b><span>Rad etilgan / yopilgan</span></div>
      </div>

      <RequestGroup
        title="Sizga ochilgan startaplar"
        hint="Summa, ulush va kontaktlarni ko'rish uchun startapni oching."
        items={approved}
        empty="Hali hech bir startap sizga ruxsat bermagan."
      />
      <RequestGroup title="Javob kutilmoqda" items={pending} empty="Kutilayotgan so'rovlar yo'q." />
      {other.length > 0 && (
        <RequestGroup
          title="Rad etilgan yoki yopilgan"
          hint="Startap sahifasidan qayta so'rov yuborishingiz mumkin."
          items={other}
        />
      )}
    </>
  );
}

function RequestGroup({ title, hint, items, empty }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {hint && <p className="muted small">{hint}</p>}
      {items.length === 0 && empty && <p className="muted small">{empty}</p>}
      {items.map((r) => (
        <Link href={`/startaplar/${r.startup?.id}`} className="req req-link" key={r.id}>
          <div className="req-main">
            <strong>{r.startup?.name}</strong> <Verified on={r.startup?.verified} />
            <div className="muted small">
              {r.startup?.sector && <>{r.startup.sector} · </>}
              so&apos;rov: {formatDate(r.created_at)}
              {r.decided_at && <> · javob: {formatDate(r.decided_at)}</>}
            </div>
          </div>
          <div className="req-actions">
            {r.startup?.stage && <StageBadge stage={r.startup.stage} />}
            <StatusBadge status={r.status} />
          </div>
        </Link>
      ))}
    </section>
  );
}
