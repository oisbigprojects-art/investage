import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { login, resendConfirmation } from '@/app/auth-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.login') };
}

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const { user } = await getSession();
  if (user) redirect('/kabinet');

  return (
    <div className="auth">
      <h1>{t('login.title')}</h1>
      <p className="muted">{t('login.sub')}</p>
      <Flash searchParams={sp} />
      <form action={login} className="card form">
        <label>
          {t('form.email')}
          <input name="email" type="email" required autoComplete="email" placeholder="name@company.com" />
        </label>
        <label>
          {t('form.password')}
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <Link href="/parol-tiklash" className="small forgot">{t('login.forgot')}</Link>
        <button className="btn btn-gold" type="submit">
          {t('login.submit')}
        </button>
      </form>
      {sp?.tasdiq === '1' && (
        <form action={resendConfirmation} className="card form">
          <p className="muted small">{t('auth.resend_text')}</p>
          <label>
            {t('form.email')}
            <input name="email" type="email" required autoComplete="email" placeholder="name@company.com" />
          </label>
          <button className="btn btn-ghost" type="submit">
            {t('auth.resend_submit')}
          </button>
        </form>
      )}
      <p className="muted center">
        {t('login.no_account')} <Link href="/royxat">{t('login.no_account_link')}</Link>
      </p>
    </div>
  );
}
