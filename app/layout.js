import './globals.css';
import { Inter, Manrope } from 'next/font/google';
import { getLang, getT } from '@/lib/i18n/server';
import Splash from '@/components/Splash';

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
  const lang = await getLang();
  return (
    <html lang={lang} className={`${inter.variable} ${display.variable}`}>
      <body>
        <Splash />
        {children}
      </body>
    </html>
  );
}
