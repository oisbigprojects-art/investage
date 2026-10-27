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
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
