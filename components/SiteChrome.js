import { Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Topbar, { TopbarFallback } from '@/components/Topbar';
import { CONTACT } from '@/lib/site';
import { getT } from '@/lib/i18n/server';

// Bosh sahifa, kirish va ro'yxat sahifalari uchun yuqori menyu va pastki qism
export default async function SiteChrome({ children }) {
  const t = await getT();
  return (
    <>
        <a className="skip" href="#main">
          {t('skip')}
        </a>
        <Suspense fallback={<TopbarFallback homeLabel={t('brand.home_aria')} />}>
          <Topbar />
        </Suspense>

        <main id="main" className="wrap main">
          {children}
        </main>

        <footer className="footer">
          <div className="wrap footer-grid">
            <div className="footer-brand">
              <Logo height={22} />
              <p className="muted small">{t('brand.tagline')}</p>
            </div>
            <nav className="footer-links" aria-label={t('nav.footer')}>
              <Link href="/startaplar">{t('nav.startups')}</Link>
              <Link href="/investorlar">{t('nav.investors')}</Link>
              <Link href="/yordam">{t('nav.help')}</Link>
              <Link href="/kirish">{t('nav.login')}</Link>
              <Link href="/royxat">{t('nav.signup')}</Link>
            </nav>
            {(CONTACT.email || CONTACT.phone || CONTACT.telegram || CONTACT.address || CONTACT.hours) && (
              <address className="footer-contact small">
                <b>{t('footer.contact')}</b>
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
              {t('footer.note')}
            </p>
          </div>
          <div className="wrap footer-copy small muted">© {new Date().getFullYear()} Investage</div>
        </footer>
    </>
  );
}
