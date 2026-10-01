import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { changePassword, changeEmail, deleteAccount } from '@/app/auth-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.settings') };
}

// Hisob sozlamalari: parol, email, hisobni o'chirish
export default async function SettingsPage({ searchParams }) {
  const sp = await searchParams;
  const [{ user, profile }, t] = await Promise.all([getSession(), getT()]);
  if (!user) redirect('/kirish');
  const profileHref = profile.role === 'startup' ? '/kabinet/startap/profil' : '/kabinet/investor/profil';

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{profile.role === 'startup' ? t('cab.startup') : t('cab.investor')}</span>
        <h1>{t('set.title')}</h1>
        <p className="muted">{t('set.sub')} <Link href={profileHref}>{t('set.profile_link')}</Link></p>
      </div>
      <Flash searchParams={sp} />

      <div className="cab-cols cab-cols-even settings">
        <section className="card">
          <h2>{t('set.pw_title')}</h2>
          <form action={changePassword} className="form">
            <label>
              {t('set.current')}
              <input name="current" type="password" required autoComplete="current-password" />
            </label>
            <label>
              {t('reset.new')}
              <input name="password" type="password" required minLength={6} autoComplete="new-password" />
            </label>
            <label>
              {t('reset.new2')}
              <input name="password2" type="password" required minLength={6} autoComplete="new-password" />
            </label>
            <button className="btn btn-gold" type="submit">{t('set.pw_save')}</button>
          </form>
        </section>

        <section className="card">
          <h2>{t('set.email_title')}</h2>
          <p className="muted small">{t('set.email_now', { email: user.email })}</p>
          <form action={changeEmail} className="form">
            <label>
              {t('set.email_new')}
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <button className="btn btn-ghost" type="submit">{t('set.email_save')}</button>
            <p className="muted small">{t('set.email_hint')}</p>
          </form>
        </section>
      </div>

      <section className="card danger-zone">
        <h2>{t('set.del_title')}</h2>
        <p className="muted">{t('set.del_text')}</p>
        <form action={deleteAccount} className="form">
          <div className="two">
            <label>
              {t('set.del_confirm', { word: t('set.del_word') })}
              <input name="confirm" required autoComplete="off" />
            </label>
            <label>
              {t('set.current')}
              <input name="password" type="password" required autoComplete="current-password" />
            </label>
          </div>
          <button className="btn btn-danger" type="submit">{t('set.del_btn')}</button>
        </form>
      </section>
    </>
  );
}
