import { Monogram, StatusBadge } from './ui';
import { decideRequest, revokeAccess } from '@/app/cabinet-actions';
import { formatDate } from '@/lib/labels';

// Startap kabinetidagi bitta kirish so'rovi: investor kimligi va harakatlar
export default function StartupRequest({ r, back, t }) {
  const inv = r.investor || {};
  const meta = [inv.company, inv.interests && t('sr.interests', { v: inv.interests })].filter(Boolean);

  return (
    <article className="req req-rich">
      <div className="req-who">
        <Monogram name={inv.full_name} size={44} />
        <div className="req-main">
          <div className="req-name">
            <strong>{inv.full_name || t('role.investor')}</strong>
            {r.status !== 'pending' && <StatusBadge status={r.status} t={t} />}
          </div>
          <div className="muted small">
            {inv.email} · {r.status === 'pending' ? t('sr.requested', { date: formatDate(r.created_at, t) }) : t('sr.answered', { date: formatDate(r.decided_at, t) })}
          </div>
          {meta.length > 0 && <div className="req-meta small">{meta.join(' · ')}</div>}
          {inv.bio && <p className="req-bio small">{inv.bio}</p>}
          {r.message && (
            <p className="req-msg">
              <span className="muted small">{t('sr.message')}</span>
              {r.message}
            </p>
          )}
        </div>
      </div>

      {r.status === 'pending' && (
        <div className="req-actions">
          <form action={decideRequest}>
            <input type="hidden" name="request_id" value={r.id} />
            <input type="hidden" name="decision" value="approve" />
            <input type="hidden" name="back" value={back} />
            <button className="btn btn-gold btn-sm" type="submit">
              {t('sr.approve')}
            </button>
          </form>
          <form action={decideRequest}>
            <input type="hidden" name="request_id" value={r.id} />
            <input type="hidden" name="decision" value="reject" />
            <input type="hidden" name="back" value={back} />
            <button className="btn btn-danger btn-sm" type="submit">
              {t('sr.reject')}
            </button>
          </form>
        </div>
      )}
      {r.status === 'approved' && (
        <div className="req-actions">
          <form action={revokeAccess}>
            <input type="hidden" name="request_id" value={r.id} />
            <input type="hidden" name="back" value={back} />
            <button className="btn btn-ghost btn-sm" type="submit">
              {t('sr.revoke')}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
