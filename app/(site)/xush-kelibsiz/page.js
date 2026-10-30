import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { finishOnboarding } from '@/app/auth-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('ob.title') };
}

// Google bilan birinchi kirish: rol va shartlarga rozilik
export default async function OnboardingPage({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const { user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.onboarded) redirect('/kabinet');

  return (
    <div className="auth">
      <h1>{t('ob.title')}</h1>
      <p className="muted">{t('ob.sub')}</p>
      <Flash searchParams={sp} />
      <form action={finishOnboarding} className="card form">
        <fieldset className="role-radio">
          <legend>{t('signup.who')}</legend>
          <label className="radio-card">
            <input type="radio" name="role" value="startup" required />
            <span>
              <strong>{t('signup.startup')}</strong>
              <small>{t('signup.startup_sub')}</small>
            </span>
          </label>
          <label className="radio-card">
            <input type="radio" name="role" value="investor" required />
            <span>
              <strong>{t('signup.investor')}</strong>
              <small>{t('signup.investor_sub')}</small>
            </span>
          </label>
        </fieldset>
        <label className="agree small">
          <input type="checkbox" name="agree" required />
          <span>
            {t('signup.agree_pre')} <Link href="/shartlar" target="_blank">{t('legal.terms_title')}</Link>{' '}
            {t('signup.agree_mid')} <Link href="/maxfiylik" target="_blank">{t('legal.privacy_title')}</Link>
            {t('signup.agree_post')}
          </span>
        </label>
        <button className="btn btn-gold" type="submit">{t('ob.submit')}</button>
      </form>
    </div>
  );
}
