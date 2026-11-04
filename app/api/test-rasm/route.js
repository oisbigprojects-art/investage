import { ImageResponse } from 'next/og';
import { clampScore, levelOf } from '@/lib/readiness';
import { makeT } from '@/lib/i18n';

// Tayyorlik testi natijasi rasmi: f=story (1080x1920, Instagram story) yoki f=og (1200x630, havola ko'rinishi).
// b berilmasa (testning o'z havolasi uchun) ball o'rnida "?" chiqadi. Shriftlar: Manrope va Inter (OFL), statik woff.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'app', 'api', 'test-rasm');
const font = (file) => readFile(join(DIR, file));
let fonts;
function loadFonts() {
  if (!fonts) {
    fonts = Promise.all([
      font('manrope-latin-800-normal.woff'),
      font('manrope-latin-ext-800-normal.woff'),
      font('manrope-cyrillic-800-normal.woff'),
      font('inter-latin-500-normal.woff'),
      font('inter-cyrillic-500-normal.woff'),
    ])
      .then(([m1, m2, m3, i1, i2]) => [
        { name: 'Manrope', data: m1, weight: 800 },
        { name: 'ManropeExt', data: m2, weight: 800 },
        { name: 'ManropeCyr', data: m3, weight: 800 },
        { name: 'Inter', data: i1, weight: 500 },
        { name: 'InterCyr', data: i2, weight: 500 },
      ])
      .catch((e) => {
        fonts = null;
        throw e;
      });
  }
  return fonts;
}

// Satori bir xil nom va qalinlikdagi ikkinchi shriftni e'tiborsiz qoldiradi, shuning uchun har harf to'plami alohida nomda
const HEAD = 'Manrope, ManropeCyr, ManropeExt';
const BODY = 'Inter, InterCyr';
const BG = '#141414';
const GOLD = '#F6BE13';
const tone = (b) => (b >= 70 ? '#2BC48A' : b >= 40 ? GOLD : '#FF8A5B');

function Ring({ b, size }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const known = b !== null;
  return (
    <div style={{ display: 'flex', position: 'relative', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 160 160" style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
        {known && (
          <circle cx="80" cy="80" r={r} fill="none" stroke={tone(b)} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - b / 100)} transform="rotate(-90 80 80)" />
        )}
      </svg>
      <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: HEAD, color: '#fff' }}>
        <span style={{ fontSize: size * 0.34, letterSpacing: -size * 0.012 }}>{known ? b : '?'}</span>
        <span style={{ fontSize: size * 0.1, color: 'rgba(255,255,255,0.55)', marginLeft: 6 }}>/100</span>
      </div>
    </div>
  );
}

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const story = sp.get('f') !== 'og';
  const b = sp.has('b') ? clampScore(sp.get('b')) : null;
  const t = makeT(sp.get('til'));
  const level = b !== null ? levelOf(b) : null;
  const levelTitle = level ? level.title[t.lang] || level.title.uz : t('rt.home_kicker');
  const W = story ? 1080 : 1200;
  const H = story ? 1920 : 630;

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: story ? 22 : 16, height: story ? 22 : 16, borderRadius: 99, background: GOLD }} />
      <span style={{ fontFamily: HEAD, fontSize: story ? 44 : 30, color: '#fff', letterSpacing: 6 }}>INVESTAGE</span>
    </div>
  );
  const cta = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: story ? 'center' : 'flex-start', gap: story ? 18 : 8 }}>
      <span style={{ fontFamily: BODY, fontSize: story ? 40 : 26, color: 'rgba(255,255,255,0.7)' }}>{t('rt.img_cta')}</span>
      <span style={{ fontFamily: HEAD, fontSize: story ? 58 : 34, color: GOLD }}>investage.uz/test</span>
    </div>
  );

  const body = story ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: W, height: H, padding: '150px 90px 170px', background: BG }}>
      {brand}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
        <span style={{ fontFamily: HEAD, fontSize: 72, lineHeight: 1.12, color: '#fff', textAlign: 'center', letterSpacing: -2 }}>{t('rt.title')}</span>
        <Ring b={b} size={620} />
        <span style={{ fontFamily: HEAD, fontSize: 64, color: b !== null ? tone(b) : GOLD, textAlign: 'center' }}>{levelTitle}</span>
      </div>
      {cta}
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: W, height: H, padding: '64px 80px', background: BG }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: 640 }}>
        {brand}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontFamily: HEAD, fontSize: 54, lineHeight: 1.1, color: '#fff', letterSpacing: -1.5 }}>{t('rt.title')}</span>
          <span style={{ fontFamily: HEAD, fontSize: 34, color: b !== null ? tone(b) : GOLD }}>{levelTitle}</span>
        </div>
        {cta}
      </div>
      <Ring b={b} size={400} />
    </div>
  );

  return new ImageResponse(body, {
    width: W,
    height: H,
    fonts: await loadFonts(),
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable' },
  });
}
