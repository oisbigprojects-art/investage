import './globals.css';
import { Suspense } from 'react';
import { Inter, Manrope } from 'next/font/google';
import { getLang, getT, getTheme } from '@/lib/i18n/server';
import { SITE_URL } from '@/lib/site-url';
import BotMount from '@/components/BotMount';

// Shriftlar build vaqtida yuklab olinib saytning o'zidan beriladi (Google'ga so'rov yo'q)
const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const display = Manrope({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-display', display: 'swap' });

export async function generateMetadata() {
  const t = await getT();
  const title = t('meta.site_title');
  const description = t('meta.site_desc');
  const OG_LOCALES = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' };
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: 'Investage',
    openGraph: {
      type: 'website',
      siteName: 'Investage',
      title,
      description,
      url: '/',
      locale: OG_LOCALES[t.lang] || 'uz_UZ',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Investage' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
    icons: { apple: '/apple-touch-icon.png' },
  };
}

export const viewport = {
  themeColor: '#F5F5F3',
  colorScheme: 'light',
};

export default async function RootLayout({ children }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  return (
    <html lang={lang} data-theme={theme} className={`${inter.variable} ${display.variable}`}>
      <body>
        {children}
        <Suspense fallback={null}>
          <BotMount />
        </Suspense>
      </body>
    </html>
  );
}
