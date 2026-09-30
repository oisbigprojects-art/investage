import { STAGES, STATUS } from '@/lib/labels';
import { SealIcon } from './icons';

export function Flash({ searchParams }) {
  if (searchParams?.xato)
    return (
      <div className="flash flash-bad" role="alert">
        {searchParams.xato}
      </div>
    );
  if (searchParams?.xabar)
    return (
      <div className="flash flash-ok" role="status">
        {searchParams.xabar}
      </div>
    );
  return null;
}

export function StageBadge({ stage }) {
  return (
    <span className={`chip chip-stage-${stage}`}>
      <i aria-hidden="true" />
      {STAGES[stage] || stage}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, tone: 'muted' };
  return (
    <span className={`chip chip-${s.tone}`}>
      <i aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function Verified({ on }) {
  if (!on) return null;
  return (
    <span className="verified" title="Hujjatlari Investage jamoasi tomonidan tekshirilgan">
      <SealIcon size={15} />
      Tasdiqlangan
    </span>
  );
}

// Investage bahosi (0–100) — aylana ko'rsatkich
export function ScoreRing({ value, size = 44 }) {
  const has = value !== null && value !== undefined;
  const tone = !has ? 'empty' : value >= 70 ? 'ok' : value >= 40 ? 'gold' : 'bad';
  const label = has ? `Investage bahosi: ${value} dan 100` : "Baho hali qo'yilmagan";
  return (
    <span
      className={`ring ring-${tone}`}
      style={{ width: size, height: size, fontSize: size >= 60 ? '1.05rem' : '.8rem' }}
      role="img"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="ring-track" cx="18" cy="18" r="15.9155" />
        {has && <circle className="ring-val" cx="18" cy="18" r="15.9155" strokeDasharray={`${value} 100`} />}
      </svg>
      <b>{has ? value : '—'}</b>
    </span>
  );
}

// Startap logotipi yoki nomining bosh harfi
export function Monogram({ name, size = 44, logo }) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="mono-tile mono-img" src={logo} alt="" width={size} height={size} style={{ width: size, height: size }} />
    );
  }
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <span className="mono-tile" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">
      {initial}
    </span>
  );
}

// Foiz ko'rsatkichi (profil to'liqligi)
export function Progress({ value, label }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <i style={{ width: `${value}%` }} />
    </div>
  );
}

// Yopiq qiymat o'rnida qora chiziq
export function Redact({ w = 96 }) {
  return <span className="redact" style={{ width: w }} aria-hidden="true" />;
}
