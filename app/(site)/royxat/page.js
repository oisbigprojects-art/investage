import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { signup} from '@/app/auth-actions';
import { MIN_PW } from '@/lib/password';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.signup') };
}

export default async function SignupPage({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const { user } = await getSession();
  if (user) redirect('/kabinet');
  const preset = sp?.rol === 'investor' ? 'investor' : sp?.rol === 'startup' ? 'startup' : null;

  return (
    <div className="auth">
      <h1>{t('signup.title')}</h1>
      <p className="muted">{t('signup.sub')}</p>
      <Flash searchParams={sp} />
      <form action={signup} className="card form">
        <fieldset className="role-radio">
          <legend>{t('signup.who')}</legend>
          <label className="radio-card">
            <input type="radio" name="role" value="startup" defaultChecked={preset === 'startup'} required />
            <span>
              <strong>{t('signup.startup')}</strong>
              <small>{t('signup.startup_sub')}</small>
            </span>
          </label>
          <label className="radio-card">
            <input type="radio" name="role" value="investor" defaultChecked={preset === 'investor'} required />
            <span>
              <strong>{t('signup.investor')}</strong>
              <small>{t('signup.investor_sub')}</small>
            </span>
          </label>
        </fieldset>
        <label>
          {t('signup.fullname')}
          <input name="full_name" required autoComplete="name" />
        </label>
        <label>
          {t('form.email')}
          <input name="email" type="email" required autoComplete="email" placeholder="name@company.com" />
        </label>
        <label>
          {t('signup.password')}
          <input name="password" type="password" minLength={MIN_PW} required autoComplete="new-password" />
        </label>
        <label className="agree small">
          <input type="checkbox" name="agree" required />
          <span>
            {t('signup.agree_pre')} <Link href="/shartlar" target="_blank">{t('legal.terms_title')}</Link>{' '}
            {t('signup.agree_mid')} <Link href="/maxfiylik" target="_blank">{t('legal.privacy_title')}</Link>
            {t('signup.agree_post')}
          </span>
        </label>
        <button className="btn btn-gold" type="submit">
          {t('signup.submit')}
        </button>
      </form>
      <p className="muted center">
        {t('signup.have')} <Link href="/kirish">{t('signup.have_link')}</Link>
      </p>
    </div>
  );
}
