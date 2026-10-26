import Link from 'next/link';
import { adminContext } from '@/lib/admin';
import { KINDS, QUESTIONS } from '@/lib/survey';

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tashkent' }) : '');

function Bars({ items, total }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map(([label, n]) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.88rem' }}>
            <span>{label}</span>
            <b>{n}</b>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'var(--panel-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (total ? Math.round((n / total) * 100) : 0) + '%', background: 'var(--gold)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminSurvey({ searchParams }) {
  const sp = await searchParams;
  const { supabase } = await adminContext();
  const kind = sp?.tur === 'investor' ? 'investor' : 'startup';

  const { data, error } = await supabase.rpc('admin_survey_list', { p_kind: '', p_limit: 500 });
  const all = data || [];
  const counts = { startup: all.filter((r) => r.kind === 'startup').length, investor: all.filter((r) => r.kind === 'investor').length };
  const rows = all.filter((r) => r.kind === kind);
  const qs = QUESTIONS[kind];

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Admin</span>
        <h1>So'rovnoma natijalari</h1>
        <p className="muted">
          Ommaviy havola: <b>investage.uz/sorovnoma</b>. Javoblar anonim, aloqa ma'lumoti ixtiyoriy. Oxirgi 500 ta javob ko'rsatiladi.
        </p>
      </div>

      {error && (
        <div className="flash flash-bad" role="alert">
          So'rovnoma jadvali topilmadi. <code>supabase/survey.sql</code> faylini Supabase SQL Editor'da ishga tushiring.
        </div>
      )}

      <nav className="filters" aria-label="So'rovnoma turi">
        {Object.entries(KINDS).map(([k, v]) => (
          <Link key={k} href={'/admin/sorovnoma?tur=' + k} className={'filter ' + (k === kind ? 'is-on' : '')}>
            {v.short} ({counts[k]})
          </Link>
        ))}
      </nav>

      {!rows.length ? (
        <section className="card">
          <p className="muted small">Hozircha javob yo'q.</p>
        </section>
      ) : (
        <>
          {qs
            .filter((q) => q.type === 'single' || q.type === 'multi' || q.type === 'scale')
            .map((q) => {
              const tally = new Map();
              let answered = 0;
              let sum = 0;
              for (const r of rows) {
                const v = r.answers && r.answers[q.id];
                if (v === undefined || v === null) continue;
                answered += 1;
                if (q.type === 'scale') {
                  sum += Number(v);
                  tally.set(String(v), (tally.get(String(v)) || 0) + 1);
                } else for (const x of Array.isArray(v) ? v : [v]) tally.set(x, (tally.get(x) || 0) + 1);
              }
              const items = q.type === 'scale' ? [1, 2, 3, 4, 5].map((n) => [String(n), tally.get(String(n)) || 0]) : (q.options || []).map((o) => [o, tally.get(o) || 0]);
              return (
                <section key={q.id} className="card">
                  <h2 style={{ fontSize: '1.02rem' }}>{q.q}</h2>
                  <p className="muted small">
                    Javob berganlar: {answered} / {rows.length}
                    {q.type === 'scale' && answered ? ' | o\'rtacha: ' + (sum / answered).toFixed(1) : ''}
                  </p>
                  <Bars items={items} total={answered} />
                </section>
              );
            })}

          {qs
            .filter((q) => q.type === 'long')
            .map((q) => {
              const texts = rows.map((r) => ({ t: r.answers && r.answers[q.id], at: r.created_at })).filter((x) => x.t);
              return (
                <section key={q.id} className="card">
                  <h2 style={{ fontSize: '1.02rem' }}>{q.q}</h2>
                  <p className="muted small">Javoblar: {texts.length}</p>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {texts.slice(0, 40).map((x, n) => (
                      <blockquote key={n} style={{ margin: 0, padding: '10px 14px', borderLeft: '3px solid var(--gold)', background: 'var(--panel-2)', borderRadius: 8, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>
                        {x.t}
                        <div className="muted small">{fmt(x.at)}</div>
                      </blockquote>
                    ))}
                  </div>
                </section>
              );
            })}

          <section className="card">
            <h2 style={{ fontSize: '1.02rem' }}>Aloqa qoldirganlar</h2>
            <div style={{ display: 'grid', gap: 6 }}>
              {rows
                .filter((r) => r.answers && r.answers.contact)
                .slice(0, 100)
                .map((r) => (
                  <div key={r.id} style={{ fontSize: '0.92rem' }}>
                    <b>{r.answers.name || 'Nomsiz'}</b> | {r.answers.contact} <span className="muted small">{fmt(r.created_at)}</span>
                  </div>
                ))}
              {!rows.some((r) => r.answers && r.answers.contact) && <p className="muted small">Hozircha yo'q.</p>}
            </div>
          </section>
        </>
      )}
    </>
  );
}
