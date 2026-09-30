import './globals.css';
import { Inter, Manrope } from 'next/font/google';
import { getLang, getT, getTheme } from '@/lib/i18n/server';

// Shriftlar build vaqtida yuklab olinib saytning o'zidan beriladi (Google'ga so'rov yo'q)
const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const display = Manrope({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-display', display: 'swap' });

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.site_title'), description: t('meta.site_desc') };
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
      </body>
    </html>
  );
}
