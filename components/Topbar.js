import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { logout } from '@/app/auth-actions';
import Logo from '@/components/Logo';

// Sahifa qobig'i darrov chiqadi, menyu (rolga bog'liq) keyin oqib keladi
export function TopbarShell({ children }) {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link href="/" className="logo" aria-label="Investage — bosh sahifa">
          <Logo height={26} />
        </Link>
        {children}
      </div>
    </header>
  );
}

export function TopbarFallback() {
  return (
    <TopbarShell>
      <nav className="nav" aria-hidden="true">
        <span className="skel skel-nav" />
        <span className="skel skel-nav" />
      </nav>
    </TopbarShell>
  );
}

export default async function Topbar() {
  const { profile } = await getSession();
  const role = profile?.role;

  return (
    <TopbarShell>
      <nav className="nav" aria-label="Asosiy menyu">
        {role === 'startup' && (
          <>
            <Link className="nav-link" href="/kabinet/startap">
              Kabinet
            </Link>
            <Link className="nav-link" href="/kabinet/startap/sorovlar">
              So&apos;rovlar
            </Link>
          </>
        )}
        {role === 'investor' && (
          <>
            <Link className="nav-link" href="/startaplar">
              Startaplar
            </Link>
            <Link className="nav-link" href="/kabinet/investor">
              Kabinet
            </Link>
          </>
        )}
        {!role && (
          <Link className="nav-link" href="/startaplar">
            Startaplar
          </Link>
        )}
        {role ? (
          <form action={logout}>
            <button className="btn btn-ghost btn-sm" type="submit">
              Chiqish
            </button>
          </form>
        ) : (
          <>
            <Link className="nav-link" href="/kirish">
              Kirish
            </Link>
            <Link href="/royxat" className="btn btn-gold btn-sm">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </>
        )}
      </nav>
    </TopbarShell>
  );
}
