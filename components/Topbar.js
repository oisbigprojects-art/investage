import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { logout } from '@/app/auth-actions';
import Logo from '@/components/Logo';
import LangSwitch from '@/components/LangSwitch';

// Sahifa qobig'i darrov chiqadi, menyu (rolga bog'liq) keyin oqib keladi
export function TopbarShell({ children, homeLabel }) {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link href="/" className="logo" aria-label={homeLabel}>
          <Logo height={26} />
        </Link>
        {children}
      </div>
    </header>
  );
}

export function TopbarFallback({ homeLabel }) {
  return (
    <TopbarShell homeLabel={homeLabel}>
      <nav className="nav" aria-hidden="true">
        <span className="skel skel-nav" />
        <span className="skel skel-nav" />
      </nav>
    </TopbarShell>
  );
}

export default async function Topbar() {
  const [{ profile }, t] = await Promise.all([getSession(), getT()]);
  const role = profile?.role;

  return (
    <TopbarShell homeLabel={t('brand.home_aria')}>
      <nav className="nav" aria-label={t('nav.main')}>
        {role === 'startup' && (
          <>
            <Link className="nav-link" href="/kabinet/startap">
              {t('nav.cabinet')}
            </Link>
            <Link className="nav-link" href="/kabinet/startap/sorovlar">
              {t('nav.requests')}
            </Link>
          </>
        )}
        {role === 'investor' && (
          <>
            <Link className="nav-link" href="/startaplar">
              {t('nav.startups')}
            </Link>
            <Link className="nav-link" href="/kabinet/investor">
              {t('nav.cabinet')}
            </Link>
          </>
        )}
        {!role && (
          <Link className="nav-link" href="/startaplar">
            {t('nav.startups')}
          </Link>
        )}
        <LangSwitch current={t.lang} label={t('lang.label')} />
        {role ? (
          <form action={logout}>
            <button className="btn btn-ghost btn-sm" type="submit">
              {t('nav.logout')}
            </button>
          </form>
        ) : (
          <>
            <Link className="nav-link" href="/kirish">
              {t('nav.login')}
            </Link>
            <Link href="/royxat" className="btn btn-gold btn-sm">
              {t('nav.signup')}
            </Link>
          </>
        )}
      </nav>
    </TopbarShell>
  );
}
