import { formatMoney, EXTRA_FIELDS } from '@/lib/labels';

// Yopiq ma'lumotlar — faqat egasi yoki tasdiqlangan investor ko'radi
export default function PrivateDetails({ p, t }) {
  const extra = p.extra || {};
  const extras = EXTRA_FIELDS.filter((f) => extra[f.key]);
  const hasContact = p.contact_email || p.contact_phone || p.contact_telegram;

  return (
    <div className="dossier">
      <div className="figures">
        <div className="figure">
          <span>{t('pd.funding')}</span>
          <b className="num">{formatMoney(p.funding_amount)}</b>
        </div>
        <div className="figure">
          <span>{t('pd.equity')}</span>
          <b className="num">{p.equity_percent != null ? `${p.equity_percent}%` : '—'}</b>
        </div>
      </div>

      {extras.length > 0 && (
        <dl className="dlist">
          {extras.map((f) => (
            <div key={f.key}>
              <dt>{t(`extra.${f.key}`)}</dt>
              <dd className="num">{extra[f.key]}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="block">
        <h3>{t('pd.team')}</h3>
        <p className="pre">{p.team || t('pd.none')}</p>
      </div>

      <div className="block">
        <h3>{t('pd.contacts')}</h3>
        {hasContact ? (
          <ul className="contacts">
            {p.contact_email && (
              <li>
                <span>{t('pd.email')}</span>
                <a href={`mailto:${p.contact_email}`}>{p.contact_email}</a>
              </li>
            )}
            {p.contact_phone && (
              <li>
                <span>{t('pd.phone')}</span>
                <a href={`tel:${p.contact_phone}`}>{p.contact_phone}</a>
              </li>
            )}
            {p.contact_telegram && (
              <li>
                <span>{t('pd.telegram')}</span>
                <b>{p.contact_telegram}</b>
              </li>
            )}
          </ul>
        ) : (
          <p className="muted">{t('pd.none')}</p>
        )}
      </div>
    </div>
  );
}
