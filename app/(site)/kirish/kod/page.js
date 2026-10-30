import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { logout, verifyMfa } from '@/app/auth-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('mfa.login_title') };
}

// Ikkinchi bosqich: parol to'g'ri, endi ilovadagi 6 raqamli kod
export default async function MfaLoginPage({ searchParams }) {
  const sp = await searchParams;
  const [{ supabase, user }, t] = await Promise.all([getAuthUser(), getT()]);
  if (!user) redirect('/kirish');
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const keyin = sp?.keyin === 'yangi-parol';
  if (aal?.currentLevel === aal?.nextLevel) redirect(keyin ? '/yangi-parol' : '/kabinet');

  return (
    <div className="auth">
      <h1>{t('mfa.login_title')}</h1>
      <p className="muted">{t('mfa.login_sub')}</p>
      <Flash searchParams={sp} />
      <form action={verifyMfa} className="card form">
        {keyin && <input type="hidden" name="keyin" value="yangi-parol" />}
        <label>
          {t('mfa.code')}
          <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus />
        </label>
        <button className="btn btn-gold" type="submit">{t('mfa.login_submit')}</button>
      </form>
      <form action={logout} className="center">
        <button className="link-btn" type="submit">{t('nav.logout')}</button>
      </form>
    </div>
  );
}
