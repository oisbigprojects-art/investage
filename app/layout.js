import './globals.css';
import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { logout } from './auth-actions';
import Logo from '@/components/Logo';
import { CONTACT } from '@/lib/site';

export const metadata = {
  title: 'Investage — startaplar va investorlar platformasi',
  description:
    "O'zbekiston startaplari va investorlari uchun platforma. Tanishtiruv ochiq, summa, ulush va kontaktlar faqat startap ruxsati bilan ochiladi.",
};

export const viewport = {
  themeColor: '#0F0F0F',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }) {
  const { profile } = await getSession();
  const role = profile?.role;

  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap"
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Asosiy qismga o&apos;tish
        </a>
        <header className="topbar">
          <div className="wrap topbar-inner">
            <Link href="/" className="logo" aria-label="Investage — bosh sahifa">
              <Logo height={26} />
            </Link>
            <nav className="nav" aria-label="Asosiy menyu">
              {role === 'startup' && (
                <>
                  <Link className="nav-link" href="/kabinet/startap">
                    Mening startapim
                  </Link>
                  <Link className="nav-link" href="/kabinet/startap#sorovlar">
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
                    So&apos;rovlarim
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
          </div>
        </header>

        <main id="main" className="wrap main">
          {children}
        </main>

        <footer className="footer">
          <div className="wrap footer-grid">
            <div className="footer-brand">
              <Logo height={22} />
              <p className="muted small">O&apos;zbekiston startaplari va investorlari uchun platforma.</p>
            </div>
            <nav className="footer-links" aria-label="Pastki menyu">
              <Link href="/startaplar">Startaplar</Link>
              <Link href="/kirish">Kirish</Link>
              <Link href="/royxat">Ro&apos;yxatdan o&apos;tish</Link>
            </nav>
            {(CONTACT.email || CONTACT.phone || CONTACT.telegram || CONTACT.address || CONTACT.hours) && (
              <address className="footer-contact small">
                <b>Aloqa</b>
                {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
                {CONTACT.phone && <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>}
                {CONTACT.telegram && (
                  <a href={`https://t.me/${CONTACT.telegram.replace('@', '')}`} rel="noopener noreferrer">
                    {CONTACT.telegram}
                  </a>
                )}
                {CONTACT.address && <span className="muted">{CONTACT.address}</span>}
                {CONTACT.hours && <span className="muted">{CONTACT.hours}</span>}
              </address>
            )}
            <p className="footer-note small muted">
              Investage hozircha katalog sifatida ishlaydi: platforma orqali pul o&apos;tkazilmaydi, kelishuv tomonlar
              o&apos;rtasida amalga oshiriladi.
            </p>
          </div>
          <div className="wrap footer-copy small muted">© {new Date().getFullYear()} Investage</div>
        </footer>
      </body>
    </html>
  );
}
