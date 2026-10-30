import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { logout } from '@/app/auth-actions';
import Logo from '@/components/Logo';
import LangSwitch from '@/components/LangSwitch';
import ThemeToggle from '@/components/ThemeToggle';
import { getTheme } from '@/lib/i18n/server';
import MobileMenu from '@/components/MobileMenu';

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
  const [{ profile }, t, theme] = await Promise.all([getSession(), getT(), getTheme()]);
  const role = profile?.role;
  const cabinet = role === 'startup' ? '/kabinet/startap' : '/kabinet/investor';

  return (
    <TopbarShell homeLabel={t('brand.home_aria')}>
      {/* Telefon: bitta asosiy tugma + ☰ menyu (qolgan havolalar, til, rejim ichida) */}
      <div className="nav-m">
        {role ? (
          <Link href={cabinet} className="btn btn-gold btn-sm">
            {t('nav.cabinet')}
          </Link>
        ) : (
          <Link href="/royxat" className="btn btn-gold btn-sm">
            {t('nav.signup')}
          </Link>
        )}
        <MobileMenu label={t('nav.menu')} closeLabel={t('nav.close')}>
          <nav className="sheet-links" aria-label={t('nav.main')}>
            <Link href="/">{t('nav.home')}</Link>
            <Link href="/startaplar">{t('nav.startups')}</Link>
            <Link href="/investorlar">{t('nav.investors')}</Link>
            {role && <Link href={cabinet}>{t('nav.cabinet')}</Link>}
            {role === 'startup' && <Link href="/kabinet/startap/sorovlar">{t('nav.requests')}</Link>}
            <Link href="/yangiliklar">{t('news.title')}</Link>
            <Link href="/yordam">{t('nav.help')}</Link>
          </nav>
          <div className="sheet-tools">
            <LangSwitch current={t.lang} label={t('lang.label')} />
            <ThemeToggle initial={theme} labels={{ dark: t('theme.dark'), light: t('theme.light') }} />
          </div>
          {role ? (
            <form action={logout} className="sheet-actions">
              <button className="btn btn-ghost" type="submit">
                {t('nav.logout')}
              </button>
            </form>
          ) : (
            <div className="sheet-actions">
              <Link href="/royxat" className="btn btn-gold">
                {t('nav.signup')}
              </Link>
              <Link href="/kirish" className="btn btn-ghost">
                {t('nav.login')}
              </Link>
            </div>
          )}
        </MobileMenu>
      </div>
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
        <ThemeToggle initial={theme} labels={{ dark: t('theme.dark'), light: t('theme.light') }} />
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
