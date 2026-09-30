import { Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Topbar, { TopbarFallback } from '@/components/Topbar';
import { CONTACT } from '@/lib/site';

// Bosh sahifa, kirish va ro'yxat sahifalari uchun yuqori menyu va pastki qism
export default function SiteChrome({ children }) {
  return (
    <>
        <a className="skip" href="#main">
          Asosiy qismga o&apos;tish
        </a>
        <Suspense fallback={<TopbarFallback />}>
          <Topbar />
        </Suspense>

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
    </>
  );
}
