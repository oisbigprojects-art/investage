/** @type {import('next').NextConfig} */

// Har bir javobga xavfsizlik sarlavhalari: clickjacking, MIME almashtirish, ortiqcha referer va
// brauzer ruxsatlaridan himoya; HTTPS majburiy. CSP hozircha yo'q: Next.js inline skriptlari va
// Supabase bilan alohida sozlab, avval report-only rejimda sinash kerak.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];

const nextConfig = {
  poweredByHeader: false,
  // Logotip yuklash (1 MB gacha) uchun server action hajmi
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
