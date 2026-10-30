import { withSentryConfig } from '@sentry/nextjs/config';

/** @type {import('next').NextConfig} */

// Har bir javobga xavfsizlik sarlavhalari: clickjacking, MIME almashtirish, ortiqcha referer va
// brauzer ruxsatlaridan himoya; HTTPS majburiy. CSP hozircha report-only: hech narsani to'smaydi, faqat
// buzilishlarni brauzer konsoliga yozadi. Sinovdan o'tgach, sarlavha nomidan "-Report-Only" olib tashlanadi.
const SUPABASE = 'https://fuklumjbymmkaflzndxp.supabase.co';
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${SUPABASE}`,
  "font-src 'self'",
  `connect-src 'self' ${SUPABASE} wss://fuklumjbymmkaflzndxp.supabase.co https://*.ingest.de.sentry.io https://*.ingest.sentry.io`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy-Report-Only', value: csp },
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

// Manba xaritalari yuklanmaydi: token kerak emas, Sentry telemetriyasi o'chiq
export default withSentryConfig(nextConfig, { silent: true, telemetry: false, sourcemaps: { disable: true }, bundleSizeOptimizations: { excludeDebugStatements: true, excludeTracing: true, excludeReplayIframe: true, excludeReplayShadowDom: true, excludeReplayWorker: true } });
