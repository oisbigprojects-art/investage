import { investorContext } from '@/lib/cabinet';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import Link from 'next/link';
import { saveInvestorProfile } from '@/app/cabinet-actions';
import { INVESTOR_TYPES } from '@/lib/investor';
import { STAGE_KEYS } from '@/lib/labels';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.investor_profile') };
}

export default async function InvestorProfile({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const { profile } = await investorContext();

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{t('cab.investor')}</span>
        <h1>{t('ip.title')}</h1>
        <p className="muted">{t('ip.sub')}</p>
        <Link className="btn btn-ghost btn-sm ip-view" href={`/investorlar/${profile.id}`}>{t('ip.view_public')} →</Link>
      </div>
      <Flash searchParams={sp} />

      <form action={saveInvestorProfile} className="card form">
        <div className="two">
          <label>
            {t('ip.name')}
            <input name="full_name" defaultValue={profile.full_name || ''} required maxLength={120} />
          </label>
          <label>
            {t('ip.company')}
            <input name="company" defaultValue={profile.company || ''} maxLength={120} placeholder={t('ip.optional')} />
          </label>
        </div>
        <div className="two">
          <label>
            {t('ip.type')}
            <select name="investor_type" defaultValue={profile.investor_type || ''}>
              <option value="">{t('ip.type_none')}</option>
              {INVESTOR_TYPES.map((k) => (
                <option key={k} value={k}>{t(`ivp.type_${k}`)}</option>
              ))}
            </select>
          </label>
          <label>
            {t('ip.experience')}
            <input name="experience_years" type="number" min="0" max="80" inputMode="numeric" defaultValue={profile.experience_years ?? ''} placeholder={t('ip.optional')} />
          </label>
        </div>
        <div className="two">
          <label>
            {t('ip.check_min')}
            <input name="check_min" inputMode="numeric" defaultValue={profile.check_min ?? ''} placeholder="$10 000" />
          </label>
          <label>
            {t('ip.check_max')}
            <input name="check_max" inputMode="numeric" defaultValue={profile.check_max ?? ''} placeholder="$100 000" />
          </label>
        </div>
        <fieldset className="stage-pick">
          <legend>{t('ip.stages')}</legend>
          {STAGE_KEYS.map((k) => (
            <label key={k} className="check-inline">
              <input type="checkbox" name="stages" value={k} defaultChecked={(profile.stages || []).includes(k)} />
              <span>{t(`stage.${k}`)}</span>
            </label>
          ))}
        </fieldset>
        <label>
          {t('ip.city')}
          <input name="city" defaultValue={profile.city || ''} maxLength={80} placeholder={t('ip.city_ph')} />
        </label>
        <label>
          {t('ip.interests')}
          <input name="interests" defaultValue={profile.interests || ''} maxLength={200} placeholder={t('sp.sector_ph')} />
        </label>
        <label>
          {t('ip.bio')}
          <textarea
            name="bio"
            rows={5}
            maxLength={600}
            defaultValue={profile.bio || ''}
            placeholder={t('ip.bio_ph')}
          />
        </label>
        <label>
          {t('ip.portfolio')}
          <textarea name="portfolio" rows={4} maxLength={1500} defaultValue={profile.portfolio || ''} placeholder={t('ip.portfolio_ph')} />
        </label>
        <div className="form-block">
          <div className="form-block-head"><h3>{t('ip.contacts')}</h3></div>
          <div className="two">
            <label>
              Telegram
              <input name="telegram" defaultValue={profile.telegram || ''} maxLength={64} placeholder="@username" />
            </label>
            <label>
              {t('ivp.website')}
              <input name="website" defaultValue={profile.website || ''} maxLength={200} placeholder="example.uz" />
            </label>
          </div>
          <label>
            LinkedIn
            <input name="linkedin" defaultValue={profile.linkedin || ''} maxLength={200} placeholder="linkedin.com/in/..." />
          </label>
          <label className="check-inline">
            <input type="checkbox" name="public_contacts" defaultChecked={!!profile.public_contacts} />
            <span>{t('ip.public_contacts')}</span>
          </label>
          <p className="muted small">{t('ip.contacts_hint')}</p>
        </div>
        <label className="check-inline">
          <input type="checkbox" name="public_profile" defaultChecked={!!profile.public_profile} />
          <span>{t('ip.public')}</span>
        </label>
        <p className="muted small">{t('ip.public_hint')}</p>
        <p className="muted small">{t('ip.email_note', { email: profile.email })}</p>
        <button className="btn btn-gold" type="submit">
          {t('ip.save')}
        </button>
      </form>
    </>
  );
}
