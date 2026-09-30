import Link from 'next/link';
import { startupContext } from '@/lib/cabinet';
import { getT } from '@/lib/i18n/server';
import { Flash, Monogram } from '@/components/ui';
import { saveStartup } from '@/app/cabinet-actions';
import { STAGE_KEYS, EXTRA_FIELDS } from '@/lib/labels';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.startup_profile') };
}

export default async function StartupProfile({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const { s, p } = await startupContext({ requireProfile: false, withPrivate: true });
  const extra = p?.extra || {};

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{t('cab.startup')}</span>
        <h1>{s ? t('sp.title') : t('sp.title_new')}</h1>
        <p className="muted">
          {s ? (
            <>
              {t('sp.sub_edit')} <Link href={`/startaplar/${s.id}`}>{t('sp.sub_edit_link')}</Link>
            </>
          ) : (
            t('sp.sub_new')
          )}
        </p>
      </div>
      <Flash searchParams={sp} />

      <form action={saveStartup} className="card form">
        <div className="form-block">
          <div className="form-block-head">
            <h3>{t('sp.pub')}</h3>
            <span className="chip chip-muted">{t('sp.pub_chip')}</span>
          </div>

          <div className="logo-field">
            <Monogram name={s?.name || '?'} logo={s?.logo_url} size={72} />
            <div className="logo-field-body">
              <label>
                {t('sp.logo')}
                <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>
              <span className="muted small">{t('sp.logo_hint')}</span>
              {s?.logo_url && (
                <label className="check-inline">
                  <input name="remove_logo" type="checkbox" />
                  {t('sp.logo_remove')}
                </label>
              )}
            </div>
          </div>

          <label>
            {t('sp.name')}
            <input name="name" defaultValue={s?.name || ''} required />
          </label>
          <label>
            {t('sp.sector')}
            <input name="sector" defaultValue={s?.sector || ''} placeholder={t('sp.sector_ph')} />
          </label>
          <label>
            {t('sp.desc')}
            <textarea name="short_desc" rows={3} maxLength={300} defaultValue={s?.short_desc || ''} />
          </label>
          <label>
            {t('sp.stage')}
            <select name="stage" defaultValue={s?.stage || 'goya'}>
              {STAGE_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t(`stage.${k}`)}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">{t('sp.score_note')}</p>
        </div>

        <div className="form-block form-block-locked">
          <div className="form-block-head">
            <h3>{t('sp.priv')}</h3>
            <span className="chip chip-ok">
              <i aria-hidden="true" />
              {t('sp.priv_chip')}
            </span>
          </div>
          <div className="two">
            <label>
              {t('sp.funding')}
              <input
                name="funding_amount"
                inputMode="numeric"
                defaultValue={p?.funding_amount ?? ''}
                placeholder={t('sp.funding_ph')}
              />
            </label>
            <label>
              {t('sp.equity')}
              <input name="equity_percent" inputMode="decimal" defaultValue={p?.equity_percent ?? ''} />
            </label>
          </div>
          <label>
            {t('sp.team')}
            <textarea name="team" rows={3} defaultValue={p?.team || ''} placeholder={t('sp.team_ph')} />
          </label>
          <div className="two">
            <label>
              {t('sp.email')}
              <input name="contact_email" type="email" defaultValue={p?.contact_email || ''} />
            </label>
            <label>
              {t('sp.phone')}
              <input name="contact_phone" defaultValue={p?.contact_phone || ''} placeholder="+998 90 123 45 67" />
            </label>
          </div>
          <label>
            {t('sp.tg')}
            <input name="contact_telegram" defaultValue={p?.contact_telegram || ''} placeholder="@username" />
          </label>

          <div className="placeholder-box">
            <span className="muted small">{t('sp.extra_note')}</span>
            <div className="two">
              {EXTRA_FIELDS.map((f) => (
                <label key={f.key}>
                  {t(`extra.${f.key}`)}
                  <input name={`extra_${f.key}`} defaultValue={extra[f.key] || ''} />
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-gold" type="submit">
          {s ? t('sp.save') : t('sp.create')}
        </button>
      </form>
    </>
  );
}
