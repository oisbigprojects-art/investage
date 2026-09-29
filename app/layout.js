import './globals.css';
import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { logout } from './auth-actions';

export const metadata = {
  title: 'Investage — startaplar va investorlar platformasi',
  description: "O'zbekistondagi startaplar va investorlarni bog'lovchi platforma",
};

export default async function RootLayout({ children }) {
  const { profile } = await getSession();
  const role = profile?.role;

  return (
    <html lang="uz">
      <body>
        <header className="topbar">
          <div className="wrap topbar-inner">
            <Link href="/" className="logo">
              Invest<span>age</span>
            </Link>
            <nav className="nav">
              {role === 'startup' && (
                <>
                  <Link href="/kabinet/startap">Mening startapim</Link>
                  <Link href="/kabinet/startap#sorovlar">So&apos;rovlar</Link>
                </>
              )}
              {role === 'investor' && (
                <>
                  <Link href="/startaplar">Startaplar</Link>
                  <Link href="/kabinet/investor">So&apos;rovlarim</Link>
                </>
              )}
              {!role && <Link href="/startaplar">Startaplar</Link>}
              {role ? (
                <form action={logout}>
                  <button className="btn btn-ghost btn-sm" type="submit">Chiqish</button>
                </form>
              ) : (
                <>
                  <Link href="/kirish">Kirish</Link>
                  <Link href="/royxat" className="btn btn-primary btn-sm">Ro&apos;yxatdan o&apos;tish</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="wrap main">{children}</main>
        <footer className="footer">
          <div className="wrap">
            © {new Date().getFullYear()} Investage. Platforma orqali pul o&apos;tkazilmaydi — kelishuvlar tomonlar o&apos;rtasida to&apos;g&apos;ridan-to&apos;g&apos;ri amalga oshiriladi.
          </div>
        </footer>
      </body>
    </html>
  );
}
