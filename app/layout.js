import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

// Shriftlar build vaqtida yuklab olinib saytning o'zidan beriladi (Google'ga so'rov yo'q)
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-mono', display: 'swap' });

export const metadata = {
  title: 'Investage — startaplar va investorlar platformasi',
  description:
    "O'zbekiston startaplari va investorlari uchun platforma. Tanishtiruv ochiq, summa, ulush va kontaktlar faqat startap ruxsati bilan ochiladi.",
};

export const viewport = {
  themeColor: '#0F0F0F',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${inter.variable} ${mono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
