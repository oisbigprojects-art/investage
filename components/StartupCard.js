import Link from 'next/link';
import { StageBadge, Verified, ScoreRing, Monogram } from './ui';
import { LockIcon } from './icons';
import SaveButton from './SaveButton';

// canSave: faqat investor ko'radi. saved: hozir saqlanganmi. back: amaldan keyin qaytish manzili
export default function StartupCard({ s, t, canSave = false, saved = false, back = '/startaplar' }) {
  return (
    <div className={`scard-wrap ${canSave ? 'has-save' : ''}`}>
      <Link href={`/startaplar/${s.id}`} className="scard">
        <div className="scard-head">
          <Monogram name={s.name} logo={s.logo_url} />
          <div className="scard-title">
            <h3>{s.name}</h3>
            <span className="muted small">{s.sector || t('card.no_sector')}</span>
          </div>
          <ScoreRing value={s.score} t={t} />
        </div>
        {s.short_desc && <p className="scard-desc">{s.short_desc}</p>}
        <div className="scard-meta">
          <StageBadge stage={s.stage} t={t} />
          <Verified on={s.verified} t={t} />
          {s.is_demo && <span className="chip chip-muted">{t('ui.demo')}</span>}
        </div>
        <div className="scard-seal">
          <LockIcon size={14} />
          <span>{t('card.sealed')}</span>
          {!canSave && (
            <span className="redact-row" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      </Link>
      {canSave && <SaveButton startupId={s.id} saved={saved} back={back} t={t} />}
    </div>
  );
}
