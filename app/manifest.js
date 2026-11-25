// Telefonda "Bosh ekranga qo'shish" va brauzer uchun ilova ma'lumotlari
export default function manifest() {
  return {
    name: 'Investage',
    short_name: 'Investage',
    description: "O'zbekistondagi startaplar va investorlarni bog'laydigan platforma",
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F5F3',
    theme_color: '#F5F5F3',
    lang: 'uz',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
