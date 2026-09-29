import Link from 'next/link';
import { StageBadge, Verified, ScoreRing, Monogram } from './ui';
import { LockIcon } from './icons';

export default function StartupCard({ s }) {
  return (
    <Link href={`/startaplar/${s.id}`} className="scard">
      <div className="scard-head">
        <Monogram name={s.name} />
        <div className="scard-title">
          <h3>{s.name}</h3>
          <span className="muted small">{s.sector || "Soha ko'rsatilmagan"}</span>
        </div>
        <ScoreRing value={s.score} />
      </div>
      {s.short_desc && <p className="scard-desc">{s.short_desc}</p>}
      <div className="scard-meta">
        <StageBadge stage={s.stage} />
        <Verified on={s.verified} />
      </div>
      <div className="scard-seal">
        <LockIcon size={14} />
        <span>Summa, ulush, kontaktlar yopiq</span>
        <span className="redact-row" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </Link>
  );
}
