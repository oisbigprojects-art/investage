import { investorContext } from '@/lib/cabinet';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { saveInvestorProfile } from '@/app/cabinet-actions';

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
        <p className="muted small">{t('ip.email_note', { email: profile.email })}</p>
        <button className="btn btn-gold" type="submit">
          {t('ip.save')}
        </button>
      </form>
    </>
  );
}
