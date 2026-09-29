import Link from 'next/link';
import { StageBadge, Verified, Score } from './ui';

export default function StartupCard({ s }) {
  return (
    <Link href={`/startaplar/${s.id}`} className="card startup-card">
      <div className="startup-card-top">
        <h3>{s.name}</h3>
        <Verified on={s.verified} />
      </div>
      {s.sector && <div className="muted small">{s.sector}</div>}
      {s.short_desc && <p className="startup-card-desc">{s.short_desc}</p>}
      <div className="startup-card-foot">
        <StageBadge stage={s.stage} />
        <Score value={s.score} />
      </div>
      <div className="locked-hint">
        <LockIcon /> Summa, ulush va kontaktlar — so&apos;rov orqali
      </div>
    </Link>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true">
      <path fill="currentColor" d="M5 8V6a5 5 0 0110 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h1zm2 0h6V6a3 3 0 00-6 0v2z" />
    </svg>
  );
}
