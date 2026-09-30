import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { Flash, StageBadge, Verified, ScoreRing, StatusBadge, Monogram } from '@/components/ui';
import { saveStartup, decideRequest, revokeAccess } from '../actions';
import { STAGES, EXTRA_FIELDS, formatDate } from '@/lib/labels';

export const metadata = { title: 'Startap kabineti — Investage' };

export default async function StartupCabinet({ searchParams }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'startup') redirect('/kabinet/investor');

  const { data: s } = await supabase.from('startups').select('*').eq('owner_id', user.id).maybeSingle();
  const { data: p } = s
    ? await supabase.from('startup_private').select('*').eq('startup_id', s.id).maybeSingle()
    : { data: null };
  const { data: reqs } = s
    ? await supabase
        .from('access_requests')
        .select(
          'id, status, message, created_at, decided_at, investor:profiles!access_requests_investor_id_fkey(full_name, email)'
        )
        .eq('startup_id', s.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const pending = (reqs || []).filter((r) => r.status === 'pending');
  const approved = (reqs || []).filter((r) => r.status === 'approved');
  const history = (reqs || []).filter((r) => r.status === 'rejected' || r.status === 'revoked');
  const extra = p?.extra || {};

  return (
    <>
      <div className="page-head cab-head">
        {s && <Monogram name={s.name} size={56} />}
        <div className="cab-head-text">
          <span className="role-tag">Startap kabineti</span>
          <h1>{s ? s.name : 'Startap profilini yarating'}</h1>
          {s ? (
            <div className="head-meta">
              <StageBadge stage={s.stage} />
              <Verified on={s.verified} />
              <Link href={`/startaplar/${s.id}`}>Investorlar ko&apos;radigan sahifa</Link>
            </div>
          ) : (
            <p className="muted">Avval ochiq tanishtiruvni to&apos;ldiring, keyin yopiq ma&apos;lumotni kiriting.</p>
          )}
        </div>
        {s && (
          <div className="ring-wrap">
            <ScoreRing value={s.score} size={56} />
            <small className="muted">Baho</small>
          </div>
        )}
      </div>
      <Flash searchParams={sp} />

      {s && (
        <div className="stats">
          <div className="stat">
            <b className="num">{pending.length}</b>
            <span>Kutilayotgan so&apos;rov</span>
          </div>
          <div className="stat">
            <b className="num">{approved.length}</b>
            <span>Ruxsat berilgan investor</span>
          </div>
          <div className="stat">
            <b className="num">{history.length}</b>
            <span>Rad etilgan yoki yopilgan</span>
          </div>
        </div>
      )}

      {/* ---------------- SO'ROVLAR ---------------- */}
      {s && (
        <section className="card" id="sorovlar">
          <h2>Kirish so&apos;rovlari</h2>

          <h3 className="group">Kutilmoqda ({pending.length})</h3>
          {pending.length === 0 && <p className="muted small">Yangi so&apos;rovlar yo&apos;q.</p>}
          {pending.map((r) => (
            <div className="req" key={r.id}>
              <div className="req-who">
                <Monogram name={r.investor?.full_name} size={40} />
                <div className="req-main">
                  <strong>{r.investor?.full_name || 'Investor'}</strong>
                  <div className="muted small">
                    {r.investor?.email} · {formatDate(r.created_at)}
                  </div>
                  {r.message && <p className="req-msg">{r.message}</p>}
                </div>
              </div>
              <div className="req-actions">
                <form action={decideRequest}>
                  <input type="hidden" name="request_id" value={r.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button className="btn btn-gold btn-sm" type="submit">
                    Tasdiqlash
                  </button>
                </form>
                <form action={decideRequest}>
                  <input type="hidden" name="request_id" value={r.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <button className="btn btn-danger btn-sm" type="submit">
                    Rad etish
                  </button>
                </form>
              </div>
            </div>
          ))}

          <h3 className="group">Ruxsat berilgan ({approved.length})</h3>
          {approved.length === 0 && <p className="muted small">Hali hech kimga ruxsat bermagansiz.</p>}
          {approved.map((r) => (
            <div className="req" key={r.id}>
              <div className="req-who">
                <Monogram name={r.investor?.full_name} size={40} />
                <div className="req-main">
                  <strong>{r.investor?.full_name || 'Investor'}</strong>
                  <div className="muted small">
                    {r.investor?.email} · ruxsat: {formatDate(r.decided_at)}
                  </div>
                </div>
              </div>
              <div className="req-actions">
                <form action={revokeAccess}>
                  <input type="hidden" name="request_id" value={r.id} />
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Ruxsatni yopish
                  </button>
                </form>
              </div>
            </div>
          ))}

          {history.length > 0 && (
            <details className="history">
              <summary>Tarix ({history.length})</summary>
              {history.map((r) => (
                <div className="req" key={r.id}>
                  <div className="req-who">
                    <Monogram name={r.investor?.full_name} size={40} />
                    <div className="req-main">
                      <strong>{r.investor?.full_name || 'Investor'}</strong>
                      <div className="muted small">{formatDate(r.decided_at)}</div>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </details>
          )}
        </section>
      )}

      {/* ---------------- PROFIL FORMASI ---------------- */}
      <form action={saveStartup} className="card form">
        <h2>Profil</h2>

        <div className="form-block">
          <div className="form-block-head">
            <h3>Ochiq tanishtiruv</h3>
            <span className="chip chip-muted">Hamma ko&apos;radi</span>
          </div>
          <label>
            Startap nomi
            <input name="name" defaultValue={s?.name || ''} required />
          </label>
          <label>
            Soha
            <input name="sector" defaultValue={s?.sector || ''} placeholder="Masalan: FinTech, EdTech, AgroTech" />
          </label>
          <label>
            Qisqa tavsif
            <textarea name="short_desc" rows={3} maxLength={300} defaultValue={s?.short_desc || ''} />
          </label>
          <label>
            Bosqich
            <select name="stage" defaultValue={s?.stage || 'goya'}>
              {Object.entries(STAGES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">
            Baho va &laquo;Tasdiqlangan&raquo; belgisini Investage jamoasi qo&apos;yadi, ularni o&apos;zgartirib bo&apos;lmaydi.
          </p>
        </div>

        <div className="form-block form-block-locked">
          <div className="form-block-head">
            <h3>Yopiq ma&apos;lumot</h3>
            <span className="chip chip-ok">
              <i aria-hidden="true" />
              Faqat ruxsat bergan investorlarga
            </span>
          </div>
          <div className="two">
            <label>
              Kerakli mablag&apos; (USD, $)
              <input
                name="funding_amount"
                inputMode="numeric"
                defaultValue={p?.funding_amount ?? ''}
                placeholder="Masalan: 50000"
              />
            </label>
            <label>
              Taklif qilinayotgan ulush (%)
              <input name="equity_percent" inputMode="decimal" defaultValue={p?.equity_percent ?? ''} />
            </label>
          </div>
          <label>
            Jamoa
            <textarea name="team" rows={3} defaultValue={p?.team || ''} placeholder="Asoschilar, rollari, tajribasi" />
          </label>
          <div className="two">
            <label>
              Kontakt email
              <input name="contact_email" type="email" defaultValue={p?.contact_email || ''} />
            </label>
            <label>
              Telefon
              <input name="contact_phone" defaultValue={p?.contact_phone || ''} placeholder="+998 90 123 45 67" />
            </label>
          </div>
          <label>
            Telegram
            <input name="contact_telegram" defaultValue={p?.contact_telegram || ''} placeholder="@username" />
          </label>

          <div className="placeholder-box">
            <span className="muted small">
              Namunaviy maydonlar. Yakuniy ro&apos;yxat tayyor bo&apos;lgach shu yerda almashtiriladi.
            </span>
            <div className="two">
              {EXTRA_FIELDS.map((f) => (
                <label key={f.key}>
                  {f.label}
                  <input name={`extra_${f.key}`} defaultValue={extra[f.key] || ''} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-gold" type="submit">
          {s ? 'Saqlash' : 'Profilni yaratish'}
        </button>
      </form>
    </>
  );
}
