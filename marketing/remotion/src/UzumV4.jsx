// 024 · Uzum v4 — hook va hozirgi holat bilan kuchaytirilgan hikoya (../uzum-storyboard.md, "v4" bo'limi).
// Hozirgi holat: TechCrunch 2025-08-05 (16 000 sotuvchi, 1 500+ punkt, kuniga 200 000+ buyurtma, ≈1,5 mlrd $, Tencent).
// Faktlar asl videodan o'zgarmagan: TechCrunch 2024-03-25 (1,16 mlrd $, birinchi unikorn, 600 000+ vs ~70 000 tovar, 8 mln+),
// TechCrunch 2025-08-05 (2022-yilda tashkil topgan, 17 mln+). 2022-10 → 2024-03 = 17 oy (javob C).
import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useVideoConfig } from 'remotion';
import { At, Burst, C as K, Dots, EXPO, FONT, IO, Letters, Pill, Ring, Scene, Words, bump, num, ramp, sp, useSec } from './kit';

// Brifdagi palitra
const C = { ...K, black: '#101010', grey: '#F2F2F2' };

const DUR = [4.5, 5.3, 4.6, 4.6, 5.8, 4.4, 4.6, 6.0, 5.3];
const OV = 0.6;
const START = DUR.reduce((a, d, i) => [...a, i ? a[i - 1] + DUR[i - 1] : 0], []);
export const UZUM_V4_SECONDS = DUR.reduce((a, b) => a + b, 0);
const from = (i) => (i === 0 ? 0 : START[i] - OV);


// Uzum rasmiy belgisi (uzum.uz/static/img/icons/favicon.svg): binafsha #7000FF plitka, oq "U" va chiziq.
// Egasi so'rovi bilan (2026-11-24) kompaniyani tanitish uchun; homiylik emas.
const UzumLogo = ({ size = 120, style }) => (
  <svg width={size} height={size} viewBox="3 3.6 29.8 28.4" style={style}>
    <path d="M4.22414 16.6547C3.69249 13.6396 3.42667 12.132 3.81039 10.8769C4.14791 9.77292 4.82628 8.80411 5.74826 8.10934C6.79642 7.3195 8.30397 7.05368 11.3191 6.52204L20.4272 4.91603C23.4424 4.38438 24.9499 4.11856 26.205 4.50228C27.309 4.83981 28.2778 5.51818 28.9726 6.44016C29.7624 7.48831 30.0282 8.99587 30.5599 12.011L31.809 19.0953C32.3407 22.1104 32.6065 23.6179 32.2228 24.873C31.8853 25.977 31.2069 26.9458 30.2849 27.6406C29.2368 28.4304 27.7292 28.6963 24.7141 29.2279L15.6059 30.8339C12.5908 31.3656 11.0833 31.6314 9.82818 31.2477C8.72418 30.9101 7.75537 30.2318 7.06061 29.3098C6.27077 28.2616 6.00494 26.7541 5.4733 23.739L4.22414 16.6547Z" fill="#7000FF" />
    <path d="M23.1346 12.4787C23.6777 12.5983 24.2032 12.7004 24.7188 12.8324C25.2668 12.9719 25.8098 13.1413 26.3528 13.2932C26.43 13.3156 26.4599 13.3455 26.4599 13.4327C26.4574 15.1289 26.4749 16.8277 26.4525 18.524C26.4275 20.3472 25.8522 21.9962 24.7437 23.4458C23.5083 25.0624 21.8917 26.1036 19.914 26.5768C19.1344 26.7636 18.3398 26.8259 17.5402 26.7786C15.6397 26.6665 13.9559 25.9965 12.5162 24.7535C11.0316 23.4757 10.0951 21.8667 9.71898 19.9387C9.61187 19.3908 9.56953 18.8353 9.56953 18.2774C9.56704 16.6708 9.56953 15.0667 9.56454 13.4601C9.56454 13.353 9.59942 13.3156 9.69656 13.2857C10.7327 12.9544 11.7889 12.6929 12.8574 12.4986C12.8674 12.4961 12.8774 12.4986 12.9023 12.4961C12.9023 12.5385 12.9023 12.5808 12.9023 12.6207C12.9023 14.6358 12.8948 16.6533 12.9073 18.6684C12.9147 19.6847 13.0517 20.6885 13.3979 21.6524C13.6719 22.4171 14.0779 23.0996 14.6832 23.6526C15.2511 24.1682 15.9162 24.4945 16.661 24.6539C17.7146 24.8806 18.7657 24.8631 19.7994 24.5368C21.0199 24.1532 21.8668 23.3412 22.4098 22.1979C22.7012 21.5877 22.8756 20.9401 22.9852 20.275C23.1072 19.5352 23.1371 18.788 23.1371 18.0407C23.1371 16.2424 23.1371 14.4415 23.1371 12.6431C23.1346 12.5958 23.1346 12.5509 23.1346 12.4787Z" fill="white" />
    <path d="M19.4956 16.2151C18.5017 16.2151 17.5178 16.2151 16.529 16.2151C16.529 13.8987 16.529 11.5847 16.529 9.27319C16.8378 9.17605 18.9077 9.16857 19.4956 9.26572C19.4956 11.5822 19.4956 13.8987 19.4956 16.2151Z" fill="white" />
  </svg>
);

// ---------- yordamchilar
const Abs = ({ x, y, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', ...style }}>{children}</div>
);

const Shape = ({ kind, size, fill, stroke, sw = 10, rot = 0, label, labelColor = C.black, labelSize }) => {
  const h = size / 2;
  const el = {
    circle: <circle cx={h} cy={h} r={h - sw} />,
    square: <rect x={sw} y={sw} width={size - sw * 2} height={size - sw * 2} rx={size * 0.16} />,
    triangle: <polygon points={`${h},${sw * 1.4} ${size - sw},${size - sw} ${sw},${size - sw}`} strokeLinejoin="round" />,
    hex: <polygon points={Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${h + Math.cos(a) * (h - sw)},${h + Math.sin(a) * (h - sw)}`; }).join(' ')} strokeLinejoin="round" />,
  }[kind];
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: `rotate(${rot}deg)`, overflow: 'visible' }}>
        <g fill={fill || 'none'} stroke={stroke || 'none'} strokeWidth={sw}>{el}</g>
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: kind === 'triangle' ? size * 0.22 : 0, fontFamily: FONT, fontWeight: 800, fontSize: labelSize || size * 0.36, color: labelColor }}>{label}</div>
      )}
    </div>
  );
};

// Fondagi katta xira belgilar — sekin parallaks qatlami
const Glyphs = ({ chars, color, op = 0.08, seed = 'g', n = 10, speed = 1, size = [160, 380] }) => {
  const { t } = useSec();
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {Array.from({ length: n }).map((_, i) => {
        const r = (k) => random(`${seed}${k}${i}`);
        const s = size[0] + (size[1] - size[0]) * r('s');
        const v = (14 + 30 * r('v')) * speed * (s / 300);
        const x = r('x') * 1080, y = ((((r('y') * 2300 - t * v) % 2300) + 2300) % 2300) - 200;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, fontFamily: FONT, fontWeight: 800, fontSize: s, color, opacity: op * (0.5 + 0.5 * r('o')), transform: `translate(-50%,-50%) rotate(${(r('r') - 0.5) * 30 + t * 4 * (r('d') - 0.5)}deg)` }}>{chars[i % chars.length]}</div>;
      })}
    </AbsoluteFill>
  );
};

// Raqam ustuni: slot kabi aylanadi va `land` da prujina bilan to'xtaydi
const Roll = ({ digit, land, size, i }) => {
  const { t, f, fps } = useSec();
  const h = size * 1.05;
  const spinning = t < land;
  const spin = (t * (26 + i * 3) + i * 0.37) % 10;
  const settle = spinning ? 0 : sp(f, fps, land, { damping: 12, stiffness: 260 });
  const off = spinning ? (spin % 1) * h : (1 - settle) * -h * 0.6;
  const shown = spinning ? Math.floor(spin) : digit;
  return (
    <span style={{ display: 'inline-block', height: h, overflow: 'hidden', verticalAlign: 'top' }}>
      <span style={{ display: 'block', transform: `translateY(${-off}px)`, filter: spinning ? 'blur(2.5px)' : 'none' }}>
        <span style={{ display: 'block', height: h, lineHeight: `${h}px` }}>{shown}</span>
        <span style={{ display: 'block', height: h, lineHeight: `${h}px` }}>{(shown + 1) % 10}</span>
      </span>
    </span>
  );
};

const Card = ({ letter, text, k, dark = C.black, hi = 0, w = 290, h = 200 }) => (
  <div style={{ width: w, height: h, borderRadius: 40, background: C.white, boxShadow: '0 24px 60px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, transform: `translateY(${(1 - k) * 280 - 18 * hi}px) scale(${(0.6 + 0.4 * k) * (1 + 0.06 * hi)})`, opacity: Math.min(1, k * 2) }}>
    <div style={{ width: 66, height: 66, borderRadius: 33, background: dark, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{letter}</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.black }}>{text}</div>
  </div>
);

// "?" belgili sirli ilova plitkasi (3-sahnada Uzum logosiga aylanadi)
const Mystery = ({ size = 130 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size * 0.62, color: C.coral, boxShadow: '0 14px 30px rgba(16,16,16,.22)' }}>?</div>
);

// ---------- 1. Hook: 0-kadrdan aylanayotgan 17 000 000, sirli ilova, "3 yil oldin u yöq edi"
const HIT = 0.85;
const TICKERS = [['+12 400', 150, 1330], ['$ 3,2 mln', 860, 1250], ['×8', 940, 1520], ['+1,8 mln', 170, 1600], ['600 000+', 760, 1700], ['$', 300, 1450]];
const Opening = () => {
  const { t, f, fps } = useSec();
  const shake = bump(t, HIT, 0.35);
  const sx = Math.sin(t * 90) * 14 * shake, sy = Math.cos(t * 70) * 10 * shake;
  const digits = '17000000'.split('');
  const SIZE = 150;
  const line2 = sp(f, fps, 2.0, { damping: 14 });
  return (
    <Scene bg={C.coral} dur={DUR[0]} enter="none" zoom={[1, 1.04]}>
      <Glyphs chars={['$', '0', '%', '1', '$', '7']} color={C.white} op={0.1} seed="o1" speed={1.6} />
      <Dots seed="o2" color={C.white} op={0.35} speed={2.4} />
      {TICKERS.map(([s, x, y], i) => {
        const k = ramp(t, 0.05 + i * 0.07, 0.3 + i * 0.07) * (1 - ramp(t, 1.4 + i * 0.1, 1.9 + i * 0.1));
        return <div key={i} style={{ position: 'absolute', left: x, top: y - 40 * t, transform: 'translate(-50%,-50%)', fontFamily: FONT, fontWeight: 800, fontSize: 44, color: C.white, opacity: 0.55 * k }}>{s}</div>;
      })}
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.05 * shake})` }}>
        <At y={250}><Pill text="ÖZBEK KOMPANIYALARI — 2-QISM" at={-1} size={32} bg={C.black} /></At>
        <Abs x={540} y={395} style={{ transform: `translate(-50%,-50%) rotate(${Math.sin(t * 2.4) * 6}deg) scale(${1 + 0.12 * shake})` }}><Mystery size={130} /></Abs>
        <Ring at={HIT} cx={540} cy={570} r={640} color={C.white} w={20} d={0.8} />
        <At y={570}>
          <div style={{ display: 'flex', alignItems: 'flex-start', fontFamily: FONT, fontWeight: 800, fontSize: SIZE, color: C.white, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {digits.map((d, i) => (
              <React.Fragment key={i}>
                {i > 0 && (digits.length - i) % 3 === 0 && <span style={{ width: SIZE * 0.22 }} />}
                <Roll digit={+d} land={0.3 + i * 0.065} size={SIZE} i={i} />
              </React.Fragment>
            ))}
          </div>
        </At>
        <At y={740}><Words text="kişi har oy şu ilovadan foydalanadi" at={-1} size={56} weight={700} color={C.black} width={900} /></At>
        <At y={960} style={{ transform: `translateY(-50%) scale(${0.85 + 0.15 * line2})`, opacity: Math.min(1, line2 * 1.5) }}>
          <Words text="3 yil oldin u yöq edi." at={2.0} size={92} weight={800} color={C.white} hi={[4, 5]} hiColor={C.black} />
        </At>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.white, opacity: t >= HIT ? 0.55 * (1 - ramp(t, HIT, HIT + 0.3)) : 0 }} />
    </Scene>
  );
};

// ---------- 2. Viktorina: shakllar → kartalar, sarlavha, "A, B yoki C?"
const Q = [['circle', 'A', '60 oy', 220], ['square', 'B', '36 oy', 540], ['triangle', 'C', '17 oy', 860]];
const Quiz = () => {
  const { t, f, fps } = useSec();
  return (
    <Scene bg={C.black} dur={DUR[1]} enter="circle" origin={[540, 540]}>
      <Glyphs chars={['A', 'B', 'C', '?']} color={C.white} op={0.05} seed="q1" />
      <Dots seed="q2" color="#3A3A40" op={1} />
      {/* shakldan kartaga tushuvchi ingichka chiziqlar */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {Q.map(([, , , x], i) => {
          const d = ramp(t, 0.75 + i * 0.1, 1.2 + i * 0.1, IO);
          return <line key={i} x1={x} x2={x} y1={540} y2={540 + 230 * d} stroke="#4A4A52" strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-t * 40} />;
        })}
      </svg>
      {Q.map(([k, l, , x], i) => {
        const p = sp(f, fps, 0.2 + i * 0.12, { damping: 10 });
        const y = 470 + Math.sin(t * 2.2 + i * 1.3) * 14;
        return (
          <Abs key={k} x={x} y={y} style={{ transform: `translate(-50%,-50%) scale(${p}) rotate(${(1 - Math.min(1, p)) * -90}deg)` }}>
            <Shape kind={k} size={180} fill={i === 0 ? C.white : i === 2 ? C.coral : undefined} stroke={i === 1 ? C.white : undefined} rot={i === 1 ? Math.sin(t * 1.6) * 8 : 0} label={l} labelColor={i === 1 ? C.white : C.black} />
          </Abs>
        );
      })}
      <At y={840}>
        <div style={{ display: 'flex', gap: 30 }}>
          {Q.map(([, l, w], i) => {
            const k = sp(f, fps, 0.65 + i * 0.13, { damping: 11, stiffness: 170 });
            const think = bump(t, 3.0 + i * 0.32, 0.4); // navbatma-navbat "o'ylash" urg'usi
            return <Card key={l} letter={l} text={w} k={k} hi={think} />;
          })}
        </div>
      </At>
      <At y={250}><Pill text="TAXMININGIZNI IZOHLARDA YOZING" at={0.15} bg={C.coral} size={30} /></At>
      <At y={1120}><Words text="U 1 milliard $ ga neça oyda yetdi?" at={0.9} size={68} weight={800} color={C.white} width={900} hi={[5, 6]} /></At>
      <At y={1290} style={{ transform: `translateY(-50%) scale(${1 + 0.08 * bump(t, 2.65, 0.45)})` }}>
        <Letters text="A, B yoki C?" at={2.0} size={132} color={C.coral} gap={0.035} />
      </At>
    </Scene>
  );
};

// ---------- 3. Vaqt chizig'i
const Timeline = () => {
  const { t, f, fps } = useSec();
  const Y = 1010, TX = 540;
  const ticks = [2020, 2021, 2022, 2023, 2024].map((yr, i) => [yr, 180 + i * 180]);
  const run = ramp(t, 0.55, 1.35, IO);
  const dx = interpolate(run, [0, 1], [110, TX]);
  return (
    <Scene bg={C.white} dur={DUR[2]} enter="up">
      {/* fonda katta kontur yil — parallaks */}
      <div style={{ position: 'absolute', left: 540 - 200 * t, top: 1500, transform: 'translate(-50%,-50%)', fontFamily: FONT, fontWeight: 800, fontSize: 520, color: 'transparent', WebkitTextStroke: `3px ${C.line}`, whiteSpace: 'nowrap', opacity: 0.8 }}>2022 2022</div>
      <Dots seed="t1" color={C.line} op={1} />
      <div style={{ position: 'absolute', left: 110, top: Y - 3, height: 6, borderRadius: 3, background: C.black, width: 860 * ramp(t, 0.1, 0.9, IO) }} />
      <div style={{ position: 'absolute', left: 110, top: Y - 3, height: 6, borderRadius: 3, background: C.coral, width: (dx - 110) }} />
      {ticks.map(([yr, x], i) => {
        const k = ramp(t, 0.25 + i * 0.07, 0.6 + i * 0.07);
        const on = yr === 2022 && run >= 1;
        return (
          <React.Fragment key={yr}>
            <div style={{ position: 'absolute', left: x - 3, top: Y - 22 * k, width: 6, height: 44 * k, background: yr === 2022 ? C.coral : C.black, borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: x - 70, width: 140, top: Y + 40, textAlign: 'center', fontFamily: FONT, fontWeight: on ? 800 : 600, fontSize: on ? 42 : 34, color: yr === 2022 ? C.coral : C.mid, opacity: k }}>{yr}</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: dx - 22, top: Y - 22, width: 44, height: 44, borderRadius: 22, background: C.coral, transform: `scale(${ramp(t, 0.4, 0.6)})` }} />
      <Ring at={1.35} cx={TX} cy={Y} r={180} />
      <Ring at={1.5} cx={TX} cy={Y} r={110} />
      <At y={560} style={{ transform: `translateY(-50%) scale(${1 + 0.03 * ramp(t, 1, 4.8, Easing.linear)})` }}><Letters text="2022" at={0.65} size={290} /></At>
      <At y={755}><Letters text="OKTABR" at={0.95} size={62} color={C.coral} track={0.22} gap={0.03} /></At>
      {(() => {
        const flip = ramp(t, 1.35, 1.75, IO); // 0..1: "?" → logo
        const sx = Math.abs(Math.cos(flip * Math.PI));
        const k = sp(f, fps, 0.9, { damping: 11 });
        return (
          <Abs x={TX} y={Y - 135} style={{ transform: `translate(-50%,-50%) scale(${k * (1 + 0.12 * bump(t, 1.75, 0.4))}) scaleX(${sx})` }}>
            {flip < 0.5 ? <Mystery size={120} /> : <UzumLogo size={130} />}
          </Abs>
        );
      })()}
      <Ring at={1.75} cx={TX} cy={Y - 135} r={150} color={'#7000FF'} />
      <At y={1260}><Words text="Uzum Market işga tuşdi." at={1.3} size={78} weight={800} hi={[0, 1]} /></At>
    </Scene>
  );
};

// ---------- 4. Tovarlar soni
const Goods = () => {
  const { t, f, fps } = useSec();
  const BASE = 1180, MAXH = 680;
  const b1 = sp(f, fps, 0.7, { damping: 16, stiffness: 120 }), b2 = sp(f, fps, 1.05, { damping: 13, stiffness: 70, mass: 1.1 });
  const h1 = (70 / 600) * MAXH * b1, h2 = MAXH * b2;
  const arrow = ramp(t, 1.9, 2.5, IO), xk = sp(f, fps, 2.4, { damping: 10 });
  return (
    <Scene bg={C.grey} dur={DUR[3]} enter="left">
      <Glyphs chars={['0', '+', '0']} color={C.black} op={0.03} seed="g4" />
      <At y={240}><Words text="Tovarlar soni" at={0.3} size={74} weight={800} /></At>
      <At y={318}><Words text="2024-yil" at={0.45} size={40} weight={600} color={C.mid} /></At>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: 'absolute', left: 120, right: 120, top: BASE - (i + 1) * 170, height: 2, background: C.line, opacity: 0.6 * ramp(t, 0.3 + i * 0.05, 0.6 + i * 0.05) }} />)}
      <div style={{ position: 'absolute', left: 120, right: 120, top: BASE, height: 4, background: C.black, transformOrigin: 'left', transform: `scaleX(${ramp(t, 0.2, 0.8, IO)})` }} />
      <div style={{ position: 'absolute', left: 330 - 130, width: 260, top: BASE - h1, height: h1, background: '#CFCFD6', borderRadius: '28px 28px 0 0' }} />
      <div style={{ position: 'absolute', left: 750 - 130, width: 260, top: BASE - h2, height: h2, background: C.coral, borderRadius: '28px 28px 0 0', overflow: 'hidden' }}>
        {/* yorqin chiziq ustun bo'ylab yuguradi */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: 140, top: `${((t * 0.6) % 1.4) * 100 - 20}%`, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,.22), transparent)' }} />
      </div>
      <div style={{ position: 'absolute', left: 80, width: 500, top: BASE - h1 - 95, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.mid, opacity: ramp(t, 0.75, 1.0) }}>~{num(Math.round(70000 * Math.min(1, b1) / 1000) * 1000)}</div>
      <div style={{ position: 'absolute', left: 500, width: 500, top: BASE - h2 - 110, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 86, color: C.coral, opacity: ramp(t, 1.1, 1.35) }}>{num(Math.round(600000 * Math.min(1, b2) / 1000) * 1000)}+</div>
      <div style={{ position: 'absolute', left: 80, width: 500, top: BASE + 26, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 42, color: C.mid, opacity: ramp(t, 0.6, 0.9) }}>Eng katta bozor</div>
      <div style={{ position: 'absolute', left: 500, width: 500, top: BASE + 26, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: C.black, opacity: ramp(t, 0.9, 1.2), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}><UzumLogo size={52} />Uzum</div>
      {/* ×8: kichik ustundan kattasiga yoysimon strelka */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M 330 ${BASE - h1 - 120} Q 470 ${BASE - MAXH - 60} 600 ${BASE - MAXH + 120}`} fill="none" stroke={C.black} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - arrow} />
      </svg>
      <Abs x={445} y={BASE - MAXH + 70} style={{ transform: `translate(-50%,-50%) scale(${xk}) rotate(${-8 * xk}deg)` }}>
        <div style={{ background: C.black, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 64, padding: '10px 30px', borderRadius: 999 }}>×8</div>
      </Abs>
      <At y={1385}><Words text="Uzumda bozordagidan 8 baravardan köp tovar." at={2.2} size={54} weight={800} hi={[2, 3]} /></At>
    </Scene>
  );
};

// ---------- 5. Javob: 17 oy
const R = 1.2;
const Answer = () => {
  const { t } = useSec();
  const pre = 1 - ramp(t, R - 0.12, R + 0.05);
  const punch = 1 + 0.06 * bump(t, R, 0.45);
  const v = 1.16 * ramp(t, R + 0.55, R + 1.35);
  const cam = interpolate(t, [R, DUR[4] + OV], [0, -1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cd = ramp(t, 0.15, R, Easing.linear); // kutish halqasi
  return (
    <Scene bg={C.black} dur={DUR[4]} enter="circle">
      <Glyphs chars={['1', '7']} color={C.white} op={0.04} seed="a1" speed={0.6} />
      <Dots seed="a2" color="#34343A" op={1} speed={0.6} />
      <AbsoluteFill style={{ transform: `scale(${punch}) rotate(${cam}deg)` }}>
        {pre > 0 && (
          <>
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: pre }}>
              <circle cx={540} cy={800} r={260} fill="none" stroke="#2A2A30" strokeWidth={14} />
              <circle cx={540} cy={800} r={260} fill="none" stroke={C.coral} strokeWidth={14} strokeLinecap="round" strokeDasharray={2 * Math.PI * 260} strokeDashoffset={2 * Math.PI * 260 * (1 - cd)} transform="rotate(-90 540 800)" />
            </svg>
            <At y={800} style={{ opacity: pre, transform: `translateY(-50%) scale(${1 + 0.15 * (1 - pre)})` }}>
              <Letters text={'JAVOB' + '.'.repeat(1 + (Math.floor(t * 5) % 3))} at={0.12} size={110} color={C.white} />
            </At>
          </>
        )}
        {t > R && (() => {
          const p = ramp(t, R, R + 0.7);
          const r = 900 * p;
          return <div style={{ position: 'absolute', left: 540 - r, top: 780 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.coral, opacity: 0.55 * (1 - p) }} />;
        })()}
        <Ring at={R} cx={540} cy={780} r={620} color={C.white} w={18} d={0.9} />
        <Burst at={R} cx={540} cy={780} n={54} />
        {t > R - 0.02 && (
          <>
            <At y={330}><Pill text="C — 17 OY ✓" at={R + 0.25} bg={C.coral} size={46} /></At>
            <At y={790}><Letters text="17" at={R} size={500} color={C.coral} gap={0.06} track={-0.06} /></At>
            <At y={1075}><Letters text="OY" at={R + 0.2} size={112} color={C.white} track={0.3} /></At>
            <At y={1215}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, color: C.white, opacity: ramp(t, R + 0.5, R + 0.75) }}>
                <span style={{ color: C.coral }}>{num(v, 2)}</span> milliard $
              </div>
            </At>
            <At y={1325}><Words text="2022-yil oktabr → 2024-yil mart" at={R + 0.85} size={40} weight={600} color="#9A9AA2" /></At>
          </>
        )}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- 6. Unikorn: bo'laklar "shox"ka yig'iladi
const SHARDS = [
  // [uchburchak nuqtalari (shox ichida), uchib keladigan joy]
  ['540,250 500,380 580,380', [-500, -300]],
  ['500,380 580,380 470,500', [700, -200]],
  ['580,380 610,500 470,500', [-600, 300]],
  ['470,500 610,500 440,620', [600, 400]],
  ['610,500 640,620 440,620', [-300, 700]],
];
const Unicorn = () => {
  const { t, f, fps } = useSec();
  const p = sp(f, fps, 0.1, { damping: 18 });
  return (
    <Scene bg={C.coral} dur={DUR[5]} enter="up">
      <Glyphs chars={['◆', '▲', '⬡']} color={C.white} op={0.08} seed="u1" size={[120, 260]} />
      <Abs x={540} y={440} style={{ transform: `translate(-50%,-50%) scale(${p}) rotate(${t * 16}deg)` }}>
        <Shape kind="hex" size={640} stroke="rgba(255,255,255,.45)" sw={6} />
      </Abs>
      <Abs x={540} y={440} style={{ transform: `translate(-50%,-50%) scale(${p * 0.62}) rotate(${-t * 26}deg)` }}>
        <Shape kind="hex" size={640} stroke="rgba(16,16,16,.18)" sw={8} />
      </Abs>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`rotate(${Math.sin(t * 1.5) * 4} 540 440) translate(0 ${-60 + Math.sin(t * 2) * 8})`}>
          {SHARDS.map(([pts, [ox, oy]], i) => {
            const k = sp(f, fps, 0.25 + i * 0.09, { damping: 13, stiffness: 120 });
            return <polygon key={i} points={pts} fill={i % 2 ? C.white : '#FFE3DA'} stroke={C.coral} strokeWidth={3} strokeLinejoin="round" transform={`translate(${ox * (1 - k)} ${oy * (1 - k)}) rotate(${(1 - k) * 160} 540 440)`} opacity={Math.min(1, k * 1.5)} />;
          })}
        </g>
      </svg>
      <At y={720}><Letters text="UNIKORN" at={0.55} size={170} color={C.white} gap={0.045} /></At>
      <At y={930}><Words text="= qiymati 1 milliard $ dan oşgan startap" at={1.0} size={64} weight={800} color={C.black} /></At>
      <At y={1190}><Words text="Uzum — Özbekistonda birinçi." at={2.1} size={78} weight={800} color={C.white} /></At>
    </Scene>
  );
};

// ---------- 7. O'sish: chiziq grafik, oqayotgan ma'lumot nuqtalari
const Growth = () => {
  const { t, f, fps } = useSec();
  const X0 = 200, X1 = 880, YB = 1130, H = 560;
  const yv = (v) => YB - (v / 20) * H;
  const c = [[X0, yv(8)], [X0 + 260, yv(8.6)], [X1 - 240, yv(15)], [X1, yv(17)]];
  const bez = (u) => { const m = 1 - u; return [0, 1].map((k) => m * m * m * c[0][k] + 3 * m * m * u * c[1][k] + 3 * m * u * u * c[2][k] + u * u * u * c[3][k]); };
  const path = `M ${c[0][0]} ${c[0][1]} C ${c[1][0]} ${c[1][1]}, ${c[2][0]} ${c[2][1]}, ${c[3][0]} ${c[3][1]}`;
  const d = ramp(t, 1.0, 2.0, IO);
  const LEN = 900;
  const [dx, dy] = bez(d);
  const big = sp(f, fps, 0.35, { damping: 12 });
  return (
    <Scene bg={C.white} dur={DUR[6]} enter="circle" origin={[1000, 200]}>
      <At y={240}><Words text="Oylik foydalanuvçilar" at={0.3} size={70} weight={800} /></At>
      {[5, 10, 15, 20].map((v, i) => <div key={v} style={{ position: 'absolute', left: 140, right: 140, top: yv(v), height: 2, background: C.grey, opacity: ramp(t, 0.3 + i * 0.05, 0.6 + i * 0.05) }} />)}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="rv3"><rect x={0} y={0} width={X0 + (X1 - X0) * d} height={1920} /></clipPath>
          <linearGradient id="fv3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.coral} stopOpacity="0.28" /><stop offset="1" stopColor={C.coral} stopOpacity="0" /></linearGradient>
        </defs>
        <path d={`${path} L ${X1} ${YB} L ${X0} ${YB} Z`} fill="url(#fv3)" clipPath="url(#rv3)" />
        <path d={path} fill="none" stroke={C.coral} strokeWidth={14} strokeLinecap="round" strokeDasharray={LEN} strokeDashoffset={LEN * (1 - d)} />
        <line x1={140} x2={940} y1={YB} y2={YB} stroke={C.black} strokeWidth={4} />
        {/* chiziq bo'ylab oqayotgan ma'lumot nuqtalari */}
        {d >= 1 && Array.from({ length: 6 }).map((_, i) => { const u = ((t - 2.0) * 0.35 + i / 6) % 1; const [x, y] = bez(u); return <circle key={i} cx={x} cy={y} r={7} fill={C.white} stroke={C.coral} strokeWidth={4} opacity={Math.sin(Math.PI * u)} />; })}
      </svg>
      {/* katta "8 mln" avval markazda, keyin grafik boshiga tushadi */}
      {(() => {
        const mv = ramp(t, 0.85, 1.25, IO);
        const x = interpolate(mv, [0, 1], [540, c[0][0]]), y = interpolate(mv, [0, 1], [700, c[0][1] - 70]);
        const s = interpolate(mv, [0, 1], [2.6, 1]) * big;
        return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: C.black, whiteSpace: 'nowrap' }}>8 mln</div>;
      })()}
      <div style={{ position: 'absolute', left: c[0][0] - 18, top: c[0][1] - 18, width: 36, height: 36, borderRadius: 18, background: C.black, transform: `scale(${ramp(t, 1.0, 1.2)})` }} />
      {d > 0 && d < 1 && <div style={{ position: 'absolute', left: dx - 24, top: dy - 24, width: 48, height: 48, borderRadius: 24, background: C.coral, boxShadow: '0 0 0 12px rgba(231,111,81,.2)' }} />}
      {d >= 1 && <div style={{ position: 'absolute', left: c[3][0] - 24, top: c[3][1] - 24, width: 48, height: 48, borderRadius: 24, background: C.coral }} />}
      <Ring at={2.0} cx={c[3][0]} cy={c[3][1]} r={140} />
      <div style={{ position: 'absolute', left: c[3][0] - 230, width: 300, top: c[3][1] - 150, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 92, color: C.coral, opacity: ramp(t, 1.05, 1.3) }}>{num(8 + 9 * d)} mln</div>
      {[['2024', X0], ['2025', X1]].map(([y, x]) => <div key={y} style={{ position: 'absolute', left: x - 80, width: 160, top: YB + 24, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.mid, opacity: ramp(t, 0.9, 1.2) }}>{y}</div>)}
      <At y={1335}><Words text="2 baravardan köp" at={2.1} size={78} weight={800} hi={[0, 1]} /></At>
    </Scene>
  );
};

// ---------- 8. Uzum bugun: hozirgi holat (TechCrunch, 2025-yil avgust) — 2×2 hisoblagich plitkalar
const TILES = [
  { v: 16000, fmt: (x) => num(Math.round(x / 100) * 100), label: 'sotuvçi' },
  { v: 1500, fmt: (x) => num(Math.round(x / 10) * 10) + '+', label: 'topşiriş punkti' },
  { v: 200000, fmt: (x) => num(Math.round(x / 1000) * 1000) + '+', label: 'buyurtma kuniga' },
  { v: 1.5, fmt: (x) => '≈ ' + num(x, 1) + ' mlrd $', label: 'baho · Tencent sarmoyasi', hero: true },
];
const Today = () => {
  const { t, f, fps } = useSec();
  return (
    <Scene bg={C.black} dur={DUR[7]} enter="left">
      <Glyphs chars={['+', '0', '$']} color={C.white} op={0.04} seed="d1" />
      <Dots seed="d2" color="#303036" op={1} />
      <At y={250} style={{ transform: 'translateY(-50%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <div style={{ transform: `scale(${sp(f, fps, 0.15, { damping: 10 })}) rotate(${Math.sin(t * 2) * 4}deg)` }}><UzumLogo size={96} /></div>
          <Letters text="UZUM BUGUN" at={0.25} size={96} color={C.white} gap={0.03} />
        </div>
      </At>
      <At y={345}><Words text="2025-yil avgust holati" at={0.55} size={40} weight={600} color="#9A9AA2" /></At>
      {TILES.map((tl, i) => {
        const x = i % 2 ? 785 : 295, y = i < 2 ? 640 : 1000;
        const st = 0.6 + i * 0.32;
        const k = sp(f, fps, st, { damping: 13, stiffness: 150 });
        const c = ramp(t, st + 0.1, st + 1.0);
        const val = tl.hero ? 1.16 + (tl.v - 1.16) * c : tl.v * c;
        return (
          <Abs key={i} x={x} y={y} style={{ transform: `translate(-50%,-50%) translateY(${(1 - k) * 120}px) scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 1.6) }}>
            <div style={{ width: 460, height: 330, borderRadius: 44, background: tl.hero ? C.coral : '#1C1C21', border: tl.hero ? 'none' : '2px solid #2A2A30', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px', boxSizing: 'border-box', gap: 14, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, background: tl.hero ? 'rgba(255,255,255,.14)' : 'rgba(231,111,81,.12)', transform: `scale(${1 + 0.1 * Math.sin(t * 2 + i)})` }} />
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: tl.hero ? 64 : 86, color: C.white, letterSpacing: '-0.02em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{tl.fmt(val)}</div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: tl.hero ? C.black : '#A9A9B2' }}>{tl.label}</div>
            </div>
          </Abs>
        );
      })}
      <At y={1300}><Words text="Manba: TechCrunch" at={2.3} size={30} weight={600} color="#6A6A72" /></At>
    </Scene>
  );
};

// ---------- 8b. Bozor + bank + yetkazish → bitta tizim; yakunda zarrachalar marjon nuqtaga yig'iladi (loop)
const NODES = [['circle', 'BOZOR', 220, 560], ['square', 'BANK', 540, 330], ['triangle', 'YETKAZIB BERIŞ', 860, 560]];
const Connect = () => {
  const { t, f, fps } = useSec();
  const HUB = [540, 720];
  const END = DUR[8] + OV; // sahna oxiri (mahalliy vaqt)
  const gather = ramp(t, END - 1.25, END - 0.45, IO);
  const fill = ramp(t, END - 0.45, END, Easing.in(Easing.cubic));
  const hub = sp(f, fps, 1.5, { damping: 11 });
  const fade = 1 - ramp(t, END - 1.3, END - 0.9);
  return (
    <Scene bg={C.grey} dur={DUR[8]} enter="up">
      <Dots seed="c1" color={C.coral} op={0.5} size={[5, 12]} pull={0.95 * gather} />
      <AbsoluteFill style={{ opacity: fade }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {NODES.map(([, , x, y], i) => {
            const d = ramp(t, 0.9 + i * 0.12, 1.5 + i * 0.12, IO);
            return <line key={i} x1={x} y1={y} x2={x + (HUB[0] - x) * d} y2={y + (HUB[1] - y) * d} stroke={C.black} strokeWidth={4} strokeDasharray="12 10" strokeDashoffset={-t * 50} />;
          })}
          {[[0, 1], [1, 2], [0, 2]].map(([a, b], i) => {
            const d = ramp(t, 0.6 + i * 0.1, 1.1 + i * 0.1, IO);
            const A = NODES[a], B = NODES[b];
            return <line key={`e${i}`} x1={A[2]} y1={A[3]} x2={A[2] + (B[2] - A[2]) * d} y2={A[3] + (B[3] - A[3]) * d} stroke={C.line} strokeWidth={3} />;
          })}
        </svg>
        <Ring at={1.5} cx={HUB[0]} cy={HUB[1]} r={260} />
        <Abs x={HUB[0]} y={HUB[1]} style={{ transform: `translate(-50%,-50%) scale(${hub * (1 + 0.05 * Math.sin(t * 4))})` }}>
          <div style={{ filter: 'drop-shadow(0 20px 40px rgba(112,0,255,.3))' }}><UzumLogo size={150} /></div>
        </Abs>
        {NODES.map(([k, l, x, y], i) => {
          const p = sp(f, fps, 0.2 + i * 0.12, { damping: 11 });
          const pulse = 1 + 0.08 * bump(t, 1.5 + i * 0.12, 0.4);
          return (
            <Abs key={k} x={x} y={y + Math.sin(t * 2 + i) * 8} style={{ transform: `translate(-50%,-50%) scale(${p * pulse})` }}>
              <Shape kind={k} size={170} fill={i === 1 ? C.white : i === 0 ? C.black : C.coral} stroke={i === 1 ? C.black : undefined} sw={i === 1 ? 10 : 8} />
              <div style={{ position: 'absolute', top: 190, left: -120, right: -120, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.black, letterSpacing: '0.04em' }}>{l}</div>
            </Abs>
          );
        })}
        <At y={1080}><Words text="Bitta ilova emas — bozor, bank va yetkazib beriş birga." at={0.6} size={62} weight={800} hi={[4, 5, 7, 8]} width={900} /></At>
        <At y={1310}><Words text="Keyingisi — Click" at={2.6} size={44} weight={700} color={C.mid} /></At>
      </AbsoluteFill>
      {/* marjon nuqta o'sib, butun ekranni qoplaydi — 1-kadrga ulanadi */}
      {fill > 0 && (() => { const r = 30 + 1300 * fill; return <div style={{ position: 'absolute', left: 540 - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.coral }} />; })()}
    </Scene>
  );
};

const SCENES = [Opening, Quiz, Timeline, Goods, Answer, Unicorn, Growth, Today, Connect];

// ---------- tovush dizayni: [sahna, soniya, fayl, balandlik, uzunlik]
const PEAK = { swoosh: 0.12, sweep: 0.3, whoosh: 0.15, click: 0, select: 0, lightpop: 0.03, hardpop: 0.01, bubble: 0.13, bass: 0.09, deepimpact: 0.55, correct: 0.03, riser: 1.6 };
const CUES = [
  ...Array.from({ length: 9 }, (_, k) => [0, 0.04 + k * 0.095, 'click', 0.28]), [0, HIT, 'bass', 0.45], [0, HIT, 'deepimpact', 0.38, 1.3], [0, 2.0, 'hardpop', 0.4, 0.3],
  [1, 0.2, 'lightpop', 0.4], [1, 0.32, 'lightpop', 0.4], [1, 0.44, 'lightpop', 0.4], [1, 0.65, 'select', 0.4], [1, 0.78, 'select', 0.4], [1, 0.91, 'select', 0.45], [1, 1.8, 'click', 0.35],
  [1, 3.0, 'click', 0.25], [1, 3.32, 'click', 0.25], [1, 3.64, 'click', 0.25],
  [2, 0.55, 'sweep', 0.35], [2, 0.9, 'lightpop', 0.4], [2, 1.55, 'swoosh', 0.35], [2, 1.75, 'bubble', 0.55],
  [3, 0.7, 'bubble', 0.4], [3, 1.05, 'bass', 0.35], [3, 2.4, 'hardpop', 0.4, 0.3],
  [4, 0.3, 'riser', 0.3, 1.0], [4, R, 'deepimpact', 0.55, 1.6], [4, R, 'bass', 0.35], [4, R + 0.25, 'correct', 0.45, 0.9],
  [5, 0.3, 'lightpop', 0.4], [5, 0.48, 'lightpop', 0.35], [5, 0.66, 'lightpop', 0.35], [5, 2.1, 'hardpop', 0.4, 0.3],
  [6, 0.4, 'bubble', 0.4], [6, 1.0, 'sweep', 0.35], [6, 2.0, 'bubble', 0.45],
  [7, 0.15, 'lightpop', 0.4], [7, 0.6, 'bubble', 0.4], [7, 0.92, 'bubble', 0.4], [7, 1.24, 'bubble', 0.4], [7, 1.56, 'bass', 0.4],
  ...Array.from({ length: 10 }, (_, k) => [7, 0.75 + k * 0.17, 'click', 0.18]),
  [8, 0.2, 'select', 0.4], [8, 0.32, 'select', 0.4], [8, 0.44, 'select', 0.4], [8, 1.5, 'bubble', 0.5], [8, DUR[8] + OV - 0.45, 'swoosh', 0.5],
];
const TRANS = SCENES.map((_, i) => i).filter((i) => i > 0).map((i) => [i, 0.05, i % 2 ? 'swoosh' : 'whoosh', 0.45]);

const Sfx = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {[...TRANS, ...CUES].map(([i, s, name, vol, len], k) => (
        <Sequence key={k} from={Math.max(0, Math.round((from(i) + s - (PEAK[name] || 0)) * fps))} durationInFrames={Math.round((len || 2.5) * fps)} layout="none">
          <Audio src={staticFile(`sfx/${name}.mp3`)} volume={vol} />
        </Sequence>
      ))}
    </>
  );
};

// Fon musiqasi: "Tech House vibes" — Alejandro Magaña (Mixkit Stock Music Free License). 32,28 s dagi zarb javobga tushadi.
const Music = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const offset = 32.28 - (from(4) + R);
  const fo = Math.round(1.2 * fps);
  return (
    <Audio src={staticFile('music/techhouse.mp3')} trimBefore={Math.round(offset * fps)}
      volume={(fr) => 0.34 * interpolate(fr, [0, 6, durationInFrames - fo, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
  );
};

export const UzumV4 = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.coral }}>
      {SCENES.map((S, i) => (
        <Sequence key={i} from={Math.round(from(i) * fps)} durationInFrames={Math.round((DUR[i] + (i ? OV : 0)) * fps)}>
          <S />
        </Sequence>
      ))}
      <Music />
      <Sfx />
    </AbsoluteFill>
  );
};
