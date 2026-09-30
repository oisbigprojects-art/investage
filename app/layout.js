import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { getLang, getT } from '@/lib/i18n/server';

// Shriftlar build vaqtida yuklab olinib saytning o'zidan beriladi (Google'ga so'rov yo'q)
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-mono', display: 'swap' });

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.site_title'), description: t('meta.site_desc') };
}

export const viewport = {
  themeColor: '#0F0F0F',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${inter.variable} ${mono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
