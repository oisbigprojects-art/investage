import Link from 'next/link';

// Serverda chiziladigan yengil diagrammalar (JavaScript yuklanmaydi). Animatsiya faqat CSS'da.

// Animatsiyali son: ekran o'qigichlar uchun haqiqiy matn, ko'rinishi uchun CSS hisoblagich
export function CountUp({ value, suffix = '' }) {
  return (
    <>
      <span className="visually-hidden">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        <span className="countup" style={{ '--to': Math.max(0, Math.round(value)) }} />
        {suffix}
      </span>
    </>
  );
}

// Ko'rsatkich kartasi: son yoki tayyor matn
export function Stat({ value, text, suffix, label, hint, href, tone }) {
  const inner = (
    <>
      <b className={`num ${tone ? `tone-${tone}` : ''}`}>{text !== undefined ? text : <CountUp value={value} suffix={suffix} />}</b>
      <span>{label}</span>
      {hint && <small className="muted">{hint}</small>}
    </>
  );
  return href ? (
    <Link className="stat stat-link" href={href}>
      {inner}
    </Link>
  ) : (
    <div className="stat">{inner}</div>
  );
}

// Ustunli diagramma: data = [{ label, value }]
export function BarChart({ data, title }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="bars" role="img" aria-label={`${title}: jami ${total}. ${data.map((d) => `${d.label} — ${d.value}`).join(', ')}`}>
      {data.map((d, i) => (
        <div className="bar-col" key={i} aria-hidden="true">
          <span className="bar-val num">{d.value || ''}</span>
          <div className="bar-track">
            <i className={`bar ${d.value === 0 ? 'is-zero' : ''}`} style={{ height: `${Math.max(d.value === 0 ? 3 : 8, (d.value / max) * 100)}%`, '--i': i }} />
          </div>
          <span className="bar-lab">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Halqa diagramma: parts = [{ label, value, tone }] (tone: ok | warn | bad | muted)
export function Donut({ parts, title, centerLabel = 'jami' }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  let acc = 0;
  return (
    <div className="donut-wrap">
      <div className="donut" role="img" aria-label={`${title}: ${parts.map((p) => `${p.label} — ${p.value}`).join(', ')}`}>
        <svg viewBox="0 0 42 42" aria-hidden="true">
          <circle className="donut-track" cx="21" cy="21" r="15.9155" pathLength="100" />
          {total > 0 &&
            parts
              .filter((p) => p.value > 0)
              .map((p, i) => {
                const len = (p.value / total) * 100;
                const el = (
                  <circle
                    key={p.label}
                    className={`donut-seg tone-${p.tone}`}
                    cx="21"
                    cy="21"
                    r="15.9155"
                    pathLength="100"
                    strokeDasharray={`${Math.max(len - 1, 0.5)} ${100 - Math.max(len - 1, 0.5)}`}
                    strokeDashoffset={-acc}
                    style={{ '--i': i }}
                  />
                );
                acc += len;
                return el;
              })}
        </svg>
        <div className="donut-center" aria-hidden="true">
          <b className="num">{total}</b>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.label}>
            <i className={`dot tone-${p.tone}`} aria-hidden="true" />
            <span>{p.label}</span>
            <b className="num">{p.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Gorizontal ustunlar: rows = [{ label, value }]
export function HBar({ rows, title }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="hbars" aria-label={title}>
      {rows.map((r, i) => (
        <li key={r.label}>
          <span className="hbar-lab">{r.label}</span>
          <span className="hbar-track" aria-hidden="true">
            <i style={{ width: `${(r.value / max) * 100}%`, '--i': i }} />
          </span>
          <b className="num">{r.value}</b>
        </li>
      ))}
    </ul>
  );
}
