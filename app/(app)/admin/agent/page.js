import Link from 'next/link';
import { adminContext } from '@/lib/admin';
import { Flash } from '@/components/ui';
import { KINDS } from '@/lib/agent';
import { runAgent, decideProposal } from '@/app/agent-actions';

// Tahlil bir necha o'n soniya olishi mumkin
export const maxDuration = 60;

const SEV = { high: ['chip-bad', 'Yuqori'], medium: ['chip-warn', "O'rta"], low: ['chip-muted', 'Past'] };
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tashkent' }) : '');

function targetHref(p) {
  if (p.target_type === 'startup') return `/startaplar/${p.target_id}`;
  if (p.target_type === 'feedback') return '/admin/murojaatlar?holat=new';
  return `/admin/foydalanuvchilar?q=${encodeURIComponent(String(p.target_label || '').slice(0, 60))}`;
}

export default async function AdminAgent({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const [pend, all] = await Promise.all([
    supabase.rpc('admin_agent_list', { p_status: 'pending', p_limit: 100 }),
    supabase.rpc('admin_agent_list', { p_status: '', p_limit: 200 }),
  ]);
  const setupMissing = !!pend.error;
  const pending = pend.data || [];
  const done = (all.data || [])
    .filter((p) => p.status !== 'pending')
    .sort((a, b) => String(b.decided_at).localeCompare(String(a.decided_at)))
    .slice(0, 10);

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>Agent</h1>
        <p className="muted">
          Agent yangi foydalanuvchilar, startaplar va murojaatlarni ko&apos;zdan kechirib, taklif yozadi. U o&apos;zi hech narsani o&apos;zgartirmaydi: har bir taklifni siz tasdiqlaysiz yoki rad etasiz.
          Modelga email, telefon, yopiq startap ma&apos;lumotlari va yozishmalar yuborilmaydi.
        </p>
      </div>
      <Flash searchParams={sp} />

      {setupMissing && (
        <div className="flash flash-bad" role="alert">
          Agent jadvali hali yaratilmagan. <code>supabase/agent.sql</code> faylini Supabase &gt; SQL Editor&apos;da bir marta ishga tushiring.
        </div>
      )}

      <section className="card">
        <div className="section-head sm">
          <h2>Tahlil</h2>
        </div>
        <p className="muted small">Tugmani bosganingizda agent hozirgi holatni tahlil qiladi. 30 soniyagacha vaqt olishi mumkin.</p>
        <form action={runAgent}>
          <button className="btn btn-gold" type="submit" disabled={setupMissing}>Tahlilni ishga tushirish</button>
        </form>
      </section>

      <section className="card">
        <div className="section-head sm">
          <h2>Kutilayotgan takliflar ({pending.length})</h2>
        </div>
        {!pending.length ? (
          <p className="muted small">Hozircha taklif yo&apos;q.</p>
        ) : (
          <div className="admin-list">
            {pending.map((p) => {
              const k = KINDS[p.kind];
              const [sevClass, sevLabel] = SEV[p.severity] || SEV.low;
              return (
                <article key={p.id} className="admin-row">
                  <div className="admin-main">
                    <div>
                      <strong>{k?.label || p.kind}</strong> · <Link href={targetHref(p)}>{p.target_label || p.target_type}</Link>
                      <div className="muted small">{p.reason}</div>
                      <div className="muted small">{fmt(p.created_at)}</div>
                    </div>
                  </div>
                  <div className="admin-flags">
                    <span className={`chip ${sevClass}`}>{sevLabel}</span>
                  </div>
                  <div className="admin-actions">
                    <form action={decideProposal}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn btn-gold btn-sm" type="submit" name="decision" value="approve">{k?.apply ? "Qo'llash" : "Ko'rildi"}</button>
                      <button className="btn btn-ghost btn-sm" type="submit" name="decision" value="dismiss">Rad etish</button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {!!done.length && (
        <section className="card">
          <div className="section-head sm">
            <h2>Oxirgi qarorlar</h2>
          </div>
          <ul className="admin-log">
            {done.map((p) => (
              <li key={p.id}>
                <span>
                  <b>{p.target_label || p.target_type}</b> — {KINDS[p.kind]?.label || p.kind}
                </span>
                <span className="muted small">
                  <span className={`chip ${p.status === 'approved' ? 'chip-ok' : 'chip-muted'}`}>{p.status === 'approved' ? 'Bajarildi' : 'Rad etildi'}</span> <time>{fmt(p.decided_at)}</time>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
