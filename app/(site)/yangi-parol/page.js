import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { setNewPassword } from '@/app/auth-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.reset') };
}

// Emaildagi havola orqali kelgan foydalanuvchi yangi parol o'rnatadi
export default async function NewPasswordPage({ searchParams }) {
  const sp = await searchParams;
  const [{ user }, t] = await Promise.all([getSession(), getT()]);
  return (
    <div className="auth">
      <h1>{t('reset.new_title')}</h1>
      <Flash searchParams={sp} />
      {user ? (
        <form action={setNewPassword} className="card form">
          <p className="muted small">{t('reset.for', { email: user.email })}</p>
          <label>
            {t('reset.new')}
            <input name="password" type="password" required minLength={6} autoComplete="new-password" />
          </label>
          <label>
            {t('reset.new2')}
            <input name="password2" type="password" required minLength={6} autoComplete="new-password" />
          </label>
          <button className="btn btn-gold" type="submit">{t('reset.save')}</button>
        </form>
      ) : (
        <div className="card">
          <p>{t('reset.err_expired')}</p>
          <Link className="btn btn-gold" href="/parol-tiklash">{t('reset.again')}</Link>
        </div>
      )}
    </div>
  );
}
