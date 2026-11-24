// 024 · Uzum — «Özbek kompaniyalari», 2-qism. Ssenariy va manbalar: ../uzum-storyboard.md
// Faktlar: TechCrunch 2024-03-25 (1,16 mlrd $, birinchi unikorn, 600 000+ tovar vs bozorda ~70 000, 8 mln+ foydalanuvchi),
// TechCrunch 2025-08-05 (2022-yilda tashkil topgan, Tencent va VR Capital, ≈1,5 mlrd $, 17 mln+ foydalanuvchi).
import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useVideoConfig } from 'remotion';
import { At, Burst, C, Dots, EXPO, FONT, IO, Letters, Pill, Ring, Scene, Words, bump, num, ramp, sp, useSec } from './kit';

const DUR = [5.0, 3.5, 4.0, 5.0, 4.5, 4.5, 4.0, 4.0, 5.0, 3.0];
const OV = 0.6; // keyingi sahna oldingisi ustidan shuncha soniya ochiladi
const START = DUR.reduce((a, d, i) => [...a, i ? a[i - 1] + DUR[i - 1] : 0], []);
export const UZUM_SECONDS = DUR.reduce((a, b) => a + b, 0);

// ---------- geometrik belgilar
const Shape = ({ kind, size, fill, stroke, sw = 10, rot = 0, label, labelColor = C.black, labelSize }) => {
  const h = size / 2;
  const el = {
    circle: <circle cx={h} cy={h} r={h - sw} />,
    square: <rect x={sw} y={sw} width={size - sw * 2} height={size - sw * 2} rx={size * 0.12} />,
    triangle: <polygon points={`${h},${sw * 1.4} ${size - sw},${size - sw} ${sw},${size - sw}`} strokeLinejoin="round" />,
    hex: <polygon points={Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i - Math.PI / 2; return `${h + Math.cos(a) * (h - sw)},${h + Math.sin(a) * (h - sw)}`; }).join(' ')} strokeLinejoin="round" />,
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

const Abs = ({ x, y, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', ...style }}>{children}</div>
);

// ---------- 1. Hook: sarlavha harf-harf, savol va variantlar 0-soniyadan
const OPTS = [['A', '60 oy'], ['B', '36 oy'], ['C', '17 oy']];
// Raqam ustuni "slot" kabi aylanib, `land` soniyada to'xtaydi
const Roll = ({ digit, land, size, i }) => {
  const { t, f, fps } = useSec();
  const h = size * 1.05;
  const spin = t < land ? (t * (26 + i * 3) + i * 0.37) % 10 : digit;
  const settle = t < land ? 0 : sp(f, fps, land, { damping: 12, stiffness: 260 });
  const off = t < land ? (spin % 1) * h : (1 - settle) * -h * 0.6;
  const shown = t < land ? Math.floor(spin) : digit;
  return (
    <span style={{ display: 'inline-block', height: h, overflow: 'hidden', verticalAlign: 'top' }}>
      <span style={{ display: 'block', transform: `translateY(${-off}px)`, filter: t < land ? 'blur(2.5px)' : 'none' }}>
        <span style={{ display: 'block', height: h, lineHeight: `${h}px` }}>{shown}</span>
        <span style={{ display: 'block', height: h, lineHeight: `${h}px` }}>{(shown + 1) % 10}</span>
      </span>
    </span>
  );
};

// ---------- 1. Hook: 0-kadrdan aylanayotgan "1 000 000 000 $" hisoblagichi, zarb, savol va variantlar
const HIT = 0.95; // hisoblagich to'xtab zarb beradigan lahza
const Hook = () => {
  const { t, f, fps } = useSec();
  const shake = bump(t, HIT, 0.35);
  const sx = Math.sin(t * 90) * 14 * shake, sy = Math.cos(t * 70) * 10 * shake;
  const digits = '1000000000'.split('');
  const SIZE = 118;
  return (
    <Scene bg={C.coral} dur={DUR[0]} enter="none" zoom={[1, 1.04]}>
      <Dots seed="h" color={C.white} op={0.35} speed={2.2} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.05 * shake})` }}>
        <At y={250}><Pill text="ÖZBEK KOMPANIYALARI · 2-QISM" at={-1} size={32} /></At>
        <Ring at={HIT} cx={540} cy={520} r={640} color={C.white} w={20} d={0.8} />
        <At y={520}>
          <div style={{ display: 'flex', alignItems: 'flex-start', fontFamily: FONT, fontWeight: 800, fontSize: SIZE, color: C.white, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {digits.map((d, i) => (
              <React.Fragment key={i}>
                {i > 0 && (digits.length - i) % 3 === 0 && <span style={{ width: SIZE * 0.22 }} />}
                <Roll digit={+d} land={0.35 + i * 0.065} size={SIZE} i={i} />
              </React.Fragment>
            ))}
            <span style={{ marginLeft: SIZE * 0.18, lineHeight: `${SIZE * 1.05}px` }}>$</span>
          </div>
        </At>
        <At y={700}><Words text="Özbek startapi Uzum bunga" at={-1} size={58} weight={700} color={C.black} /></At>
        <At y={815}><Letters text="neça oyda yetdi?" at={-0.6} size={104} color={C.white} gap={0.02} /></At>
        <At y={1090}>
          <div style={{ display: 'flex', gap: 28 }}>
            {OPTS.map(([l, w], i) => {
              const p = sp(f, fps, HIT + 0.15 + i * 0.12, { damping: 11, stiffness: 170 });
              const fl = Math.sin(t * 2.4 - i * 0.9) * 6;
              return (
                <div key={l} style={{ width: 290, height: 220, borderRadius: 40, background: C.white, boxShadow: '0 24px 60px rgba(13,13,15,.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `translateY(${(1 - p) * 300 + fl}px) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2) }}>
                  <div style={{ width: 70, height: 70, borderRadius: 35, background: C.black, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l}</div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 62, color: C.black }}>{w}</div>
                </div>
              );
            })}
          </div>
        </At>
      </AbsoluteFill>
      {/* zarbdagi oq chaqnash */}
      <AbsoluteFill style={{ background: C.white, opacity: 0.55 * (1 - ramp(t, HIT, HIT + 0.3)) * (t >= HIT ? 1 : 0), pointerEvents: 'none' }} />
    </Scene>
  );
};

// ---------- 2. Izohga chaqiriq: A/B/C shakllari
const SH = [['circle', 'A', 270], ['square', 'B', 540], ['triangle', 'C', 810]];
const Ask = () => {
  const { t, f, fps } = useSec();
  return (
    <Scene bg={C.black} dur={DUR[1]} enter="circle" origin={[810, 1150]}>
      <Dots seed="a" color="#3A3A40" op={1} />
      {SH.map(([k, l, x], i) => {
        const p = sp(f, fps, 0.25 + i * 0.1, { damping: 10 });
        const y = 660 + Math.sin(t * 2.2 + i * 1.3) * 18;
        return (
          <Abs key={k} x={x} y={y} style={{ transform: `translate(-50%,-50%) scale(${p})` }}>
            <Shape kind={k} size={210} fill={i === 2 ? C.coral : i === 0 ? C.white : undefined} stroke={i === 1 ? C.white : undefined} rot={(i === 1 ? 1 : 0) * Math.sin(t * 1.6) * 10} label={l} labelColor={i === 1 ? C.white : C.black} />
          </Abs>
        );
      })}
      <At y={1010}><Words text="Taxminingizni izohga yozing" at={0.4} size={72} weight={700} color={C.white} /></At>
      <At y={1170}><Letters text="A, B yoki C?" at={0.8} size={128} color={C.coral} gap={0.035} /></At>
    </Scene>
  );
};

// ---------- 3. 2022: uch shakl bitta nuqtaga birlashadi va vaqt chizig'i bo'ylab yuradi
const Launch = () => {
  const { t } = useSec();
  const m = ramp(t, 0.1, 0.7, IO), run = ramp(t, 0.7, 1.45, IO);
  const LX = [110, 970], Y = 990, TX = 640;
  return (
    <Scene bg={C.grey} dur={DUR[2]} enter="up">
      <Dots seed="l" color={C.line} op={1} />
      {/* vaqt chizig'i */}
      <div style={{ position: 'absolute', left: LX[0], top: Y - 3, height: 6, borderRadius: 3, background: C.black, width: (LX[1] - LX[0]) * ramp(t, 0.15, 1.0, IO) }} />
      {[2020, 2021, 2022, 2023, 2024].map((yr, i) => {
        const x = LX[0] + 70 + i * 190, k = ramp(t, 0.3 + i * 0.08, 0.7 + i * 0.08);
        return (
          <React.Fragment key={yr}>
            <div style={{ position: 'absolute', left: x - 3, top: Y - 22 * k, width: 6, height: 44 * k, background: C.black, borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: x - 60, width: 120, top: Y + 40, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: yr === 2022 ? C.coral : C.mid, opacity: k }}>{yr}</div>
          </React.Fragment>
        );
      })}
      {/* birlashgan nuqta */}
      {[270, 540, 810].map((x0, i) => {
        const x = interpolate(m, [0, 1], [x0, LX[0]]) + (TX - LX[0]) * run, y = interpolate(m, [0, 1], [660, Y]);
        const d = interpolate(m, [0, 1], [150, 40]);
        return <div key={i} style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', background: C.coral, opacity: i === 0 || m < 1 ? 1 : 0 }} />;
      })}
      <Ring at={1.45} cx={TX} cy={Y} r={170} />
      <Ring at={1.6} cx={TX} cy={Y} r={110} />
      <At y={560}><Letters text="2022" at={0.75} size={270} /></At>
      <At y={745}><Letters text="OKTABR" at={1.05} size={60} color={C.coral} track={0.2} gap={0.03} /></At>
      <At y={1260}><Words text="Uzum Market işga tuşdi." at={1.35} size={76} weight={800} hi={[0, 1]} /></At>
    </Scene>
  );
};

// ---------- 4. Tovarlar soni: ustunlar
const Goods = () => {
  const { t, f, fps } = useSec();
  const BASE = 1200, MAXH = 700;
  const b1 = sp(f, fps, 0.7, { damping: 16, stiffness: 120 }), b2 = sp(f, fps, 1.05, { damping: 13, stiffness: 70, mass: 1.1 });
  const bars = [
    { x: 330, h: (70 / 600) * MAXH * b1, col: C.line, v: 70000 * Math.min(1, b1), pre: '~', post: '', label: 'Eng katta bozor', lc: C.mid },
    { x: 750, h: MAXH * b2, col: C.coral, v: 600000 * Math.min(1, b2), pre: '', post: '+', label: 'Uzum', lc: C.black },
  ];
  return (
    <Scene bg={C.white} dur={DUR[3]} enter="left">
      <At y={250}><Words text="Tovarlar soni" at={0.3} size={70} weight={800} /></At>
      <At y={330}><Words text="2024-yil" at={0.45} size={40} weight={600} color={C.mid} /></At>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: 'absolute', left: 120, right: 120, top: BASE - (i + 1) * 175, height: 2, background: C.grey, opacity: ramp(t, 0.3 + i * 0.05, 0.6 + i * 0.05) }} />)}
      <div style={{ position: 'absolute', left: 120, right: 120, top: BASE, height: 4, background: C.black, transformOrigin: 'left', transform: `scaleX(${ramp(t, 0.2, 0.8, IO)})` }} />
      {bars.map((b, i) => (
        <React.Fragment key={i}>
          <div style={{ position: 'absolute', left: b.x - 130, width: 260, top: BASE - b.h, height: b.h, background: b.col, borderRadius: '28px 28px 0 0' }} />
          <div style={{ position: 'absolute', left: b.x - 250, width: 500, top: BASE - b.h - 105, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: i ? 84 : 62, color: i ? C.coral : C.mid, opacity: ramp(t, 0.75 + i * 0.35, 1.0 + i * 0.35) }}>
            {b.pre}{num(Math.round(b.v / 1000) * 1000)}{b.post}
          </div>
          <div style={{ position: 'absolute', left: b.x - 250, width: 500, top: BASE + 26, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 44, color: b.lc, opacity: ramp(t, 0.6 + i * 0.3, 0.9 + i * 0.3) }}>{b.label}</div>
        </React.Fragment>
      ))}
      <At y={1375}><Words text="Uzumda bozordan 8 baravardan köp tovar." at={1.9} size={54} weight={800} hi={[2, 3]} /></At>
    </Scene>
  );
};

// ---------- 5. Javob: 17 oy
const Answer = () => {
  const { t, f, fps } = useSec();
  const R = 1.15; // javob lahzasi
  const pre = 1 - ramp(t, R - 0.12, R + 0.05);
  const punch = 1 + 0.06 * bump(t, R, 0.45);
  const v = 1.16 * ramp(t, 1.75, 2.6);
  return (
    <Scene bg={C.black} dur={DUR[4]} enter="circle">
      <Dots seed="j" color="#34343A" op={1} />
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {pre > 0 && (
          <At y={800} style={{ opacity: pre, transform: `translateY(-50%) scale(${1 + 0.15 * (1 - pre)})` }}>
            <Letters text={'JAVOB' + '.'.repeat(1 + (Math.floor(t * 5) % 3))} at={0.12} size={130} color={C.white} />
          </At>
        )}
        {/* marjon to'lqin */}
        {t > R && (() => {
          const p = ramp(t, R, R + 0.7);
          const r = 900 * p;
          return <div style={{ position: 'absolute', left: 540 - r, top: 780 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.coral, opacity: 0.55 * (1 - p) }} />;
        })()}
        <Ring at={R} cx={540} cy={780} r={620} color={C.white} w={18} d={0.9} />
        <Burst at={R} cx={540} cy={780} />
        {t > R - 0.02 && <At y={350}><Pill text="C · 17 OY  ✓" at={R + 0.25} bg={C.coral} size={44} /></At>}
        {t > R - 0.02 && (
          <>
            <At y={790}><Letters text="17" at={R} size={480} color={C.coral} gap={0.06} track={-0.06} /></At>
            <At y={1065}><Letters text="OY" at={R + 0.2} size={110} color={C.white} track={0.25} /></At>
            <At y={1210}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, color: C.white, opacity: ramp(t, 1.65, 1.9) }}>
                <span style={{ color: C.coral }}>{num(v, 2)}</span> milliard $
              </div>
            </At>
            <At y={1320}><Words text="2022-yil oktabr → 2024-yil mart" at={1.95} size={40} weight={600} color="#9A9AA2" /></At>
          </>
        )}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- 6. Unikorn nima
const Unicorn = () => {
  const { t, f, fps } = useSec();
  const p = sp(f, fps, 0.1, { damping: 18 });
  return (
    <Scene bg={C.coral} dur={DUR[5]} enter="up">
      <Abs x={540} y={600} style={{ transform: `translate(-50%,-50%) scale(${p}) rotate(${t * 18}deg)` }}>
        <Shape kind="hex" size={620} stroke="rgba(255,255,255,.55)" sw={8} />
      </Abs>
      <Abs x={540} y={600} style={{ transform: `translate(-50%,-50%) scale(${p}) rotate(${-t * 30}deg)` }}>
        <Shape kind="triangle" size={330} stroke="rgba(13,13,15,.25)" sw={8} />
      </Abs>
      <At y={600}><Letters text="UNIKORN" at={0.3} size={176} color={C.white} gap={0.045} /></At>
      <At y={920}><Words text="= qiymati 1 milliard $ dan oşgan startap" at={0.85} size={66} weight={800} color={C.black} /></At>
      <At y={1190}><Words text="Uzum — Özbekistonda birinçi." at={2.0} size={78} weight={800} color={C.white} /></At>
    </Scene>
  );
};

// ---------- 7. Foydalanuvchilar: chiziqli grafik
const Users = () => {
  const { t } = useSec();
  const X0 = 200, X1 = 880, YB = 1120, H = 560;
  const yv = (v) => YB - (v / 20) * H;
  const P0 = [X0, yv(8)], P1 = [X1, yv(17)];
  const path = `M ${P0[0]} ${P0[1]} C ${X0 + 260} ${yv(8.6)}, ${X1 - 240} ${yv(15)}, ${P1[0]} ${P1[1]}`;
  const d = ramp(t, 0.65, 1.7, IO);
  const LEN = 900;
  const bez = (u) => {
    const c = [P0, [X0 + 260, yv(8.6)], [X1 - 240, yv(15)], P1], m = 1 - u;
    return [0, 1].map((k) => m * m * m * c[0][k] + 3 * m * m * u * c[1][k] + 3 * m * u * u * c[2][k] + u * u * u * c[3][k]);
  };
  const [dx, dy] = bez(d);
  const val = 8 + 9 * d;
  return (
    <Scene bg={C.white} dur={DUR[6]} enter="circle" origin={[1000, 200]}>
      <At y={250}><Words text="Oylik foydalanuvçilar" at={0.3} size={68} weight={800} /></At>
      {[5, 10, 15, 20].map((v, i) => <div key={v} style={{ position: 'absolute', left: 140, right: 140, top: yv(v), height: 2, background: C.grey, opacity: ramp(t, 0.3 + i * 0.05, 0.6 + i * 0.05) }} />)}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="reveal"><rect x={0} y={0} width={X0 + (X1 - X0) * d} height={1920} /></clipPath>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.coral} stopOpacity="0.28" /><stop offset="1" stopColor={C.coral} stopOpacity="0" /></linearGradient>
        </defs>
        <path d={`${path} L ${X1} ${YB} L ${X0} ${YB} Z`} fill="url(#fill)" clipPath="url(#reveal)" />
        <path d={path} fill="none" stroke={C.coral} strokeWidth={14} strokeLinecap="round" strokeDasharray={LEN} strokeDashoffset={LEN * (1 - d)} />
        <line x1={140} x2={940} y1={YB} y2={YB} stroke={C.black} strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: P0[0] - 18, top: P0[1] - 18, width: 36, height: 36, borderRadius: 18, background: C.black, transform: `scale(${ramp(t, 0.5, 0.8)})` }} />
      {d > 0 && <div style={{ position: 'absolute', left: dx - 24, top: dy - 24, width: 48, height: 48, borderRadius: 24, background: C.coral, boxShadow: '0 0 0 12px rgba(231,111,81,.2)' }} />}
      <Ring at={1.7} cx={P1[0]} cy={P1[1]} r={130} />
      <div style={{ position: 'absolute', left: P0[0] - 120, width: 240, top: P0[1] - 100, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 52, color: C.black, opacity: ramp(t, 0.55, 0.85) }}>8 mln</div>
      <div style={{ position: 'absolute', left: P1[0] - 220, width: 300, top: P1[1] - 150, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 92, color: C.coral, opacity: ramp(t, 0.7, 1.0) }}>{num(val)} mln</div>
      {[['2024', X0], ['2025', X1]].map(([y, x]) => <div key={y} style={{ position: 'absolute', left: x - 80, width: 160, top: YB + 24, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.mid }}>{y}</div>)}
      <At y={1330}><Words text="2 baravardan köp" at={1.8} size={76} weight={800} hi={[0, 1]} /></At>
    </Scene>
  );
};

// ---------- 8. Tencent
const Tencent = () => {
  const { t, f, fps } = useSec();
  const v = 1.16 + 0.34 * ramp(t, 1.4, 2.3);
  const a = sp(f, fps, 2.3, { damping: 10 });
  return (
    <Scene bg={C.black} dur={DUR[7]} enter="left">
      {[0, 1, 2].map((i) => {
        const k = ramp(t, 0.1 + i * 0.12, 0.7 + i * 0.12);
        const rx = 300 + i * 110, ry = 110 + i * 46, ang = t * (0.9 - i * 0.2) + i * 2;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: 540 - rx, top: 640 - ry, width: rx * 2, height: ry * 2, borderRadius: '50%', border: '3px solid #2E2E34', opacity: k, transform: `rotate(${-12 + i * 12}deg)` }} />
            <div style={{ position: 'absolute', left: 540 + Math.cos(ang) * rx - 11, top: 640 + Math.sin(ang) * ry - 11 + Math.cos(ang) * rx * Math.sin((-12 + i * 12) * Math.PI / 180), width: 22, height: 22, borderRadius: 11, background: i === 1 ? C.coral : C.white, opacity: k }} />
          </React.Fragment>
        );
      })}
      <At y={360}><Words text="2025-yil avgust" at={0.2} size={46} weight={700} color="#9A9AA2" /></At>
      <At y={640}><Letters text="TENCENT" at={0.4} size={158} color={C.white} gap={0.045} /></At>
      <At y={830}><Words text="investitsiya qildi" at={0.9} size={68} weight={800} color={C.coral} /></At>
      <At y={1020}><Words text="Uzum bahosi" at={1.2} size={44} weight={700} color="#9A9AA2" /></At>
      <At y={1140}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, fontFamily: FONT, fontWeight: 800, fontSize: 120, color: C.white, opacity: ramp(t, 1.3, 1.5) }}>
          <span>≈ {num(v, v >= 1.499 ? 1 : 2)}</span>
          <span style={{ fontSize: 60 }}>mlrd $</span>
          <span style={{ color: C.coral, display: 'inline-block', transform: `translateY(${(1 - a) * 60}px) scale(${a})`, fontSize: 110 }}>↑</span>
        </div>
      </At>
    </Scene>
  );
};

// ---------- 9. Saboq: uch shakl bitta ekotizimga birlashadi
const ECO = [['circle', 'BOZOR', 230], ['square', 'BANK', 540], ['triangle', 'YETKAZIŞ', 850]];
const Lesson = () => {
  const { t, f, fps } = useSec();
  const M = 2.6; // birlashish
  const mg = ramp(t, M, M + 0.55, IO);
  const core = sp(f, fps, M + 0.45, { damping: 11 });
  return (
    <Scene bg={C.grey} dur={DUR[8]} enter="up">
      <Dots seed="s" color={C.line} op={1} pull={0.6 * ramp(t, M, M + 1)} />
      <At y={250}><Pill text="SABOQ" at={0.1} bg={C.coral} size={38} /></At>
      {ECO.map(([k, l, x], i) => {
        const p = sp(f, fps, 0.3 + i * 0.12, { damping: 11 });
        const xx = interpolate(mg, [0, 1], [x, 540]), s = p * (1 - 0.75 * mg);
        return (
          <Abs key={k} x={xx} y={600 + Math.sin(t * 2 + i) * 10 * (1 - mg)} style={{ transform: `translate(-50%,-50%) scale(${s})`, opacity: 1 - ramp(t, M + 0.35, M + 0.6) }}>
            <Shape kind={k} size={230} fill={i === 1 ? undefined : i === 0 ? C.black : C.coral} stroke={i === 1 ? C.black : undefined} sw={i === 1 ? 12 : 10} />
            <div style={{ position: 'absolute', top: 250, left: -60, right: -60, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.black, letterSpacing: '0.04em' }}>{l}</div>
          </Abs>
        );
      })}
      <Ring at={M + 0.45} cx={540} cy={600} r={330} />
      <Abs x={540} y={600} style={{ transform: `translate(-50%,-50%) scale(${core})` }}>
        <div style={{ width: 300, height: 300, borderRadius: 150, background: C.coral, boxShadow: '0 30px 80px rgba(231,111,81,.35)' }} />
      </Abs>
      <At y={1000}><Words text="Bitta ilova emas — bozor, bank va yetkazib beriş birga." at={0.75} size={62} weight={800} hi={[4, 5, 7, 8]} width={900} /></At>
      <At y={1250}><Letters text="= EKOTIZIM" at={M + 0.55} size={118} color={C.coral} gap={0.035} /></At>
    </Scene>
  );
};

// ---------- 10. Yakun: keyingi qism, nuqtalar markazga tortiladi; oxiri oq — 1-kadrga ulanadi
const Outro = () => {
  const { t } = useSec();
  const out = 1 - ramp(t, 2.45, 2.95, IO);
  return (
    <Scene bg={C.white} dur={DUR[9]} enter="circle" zoom={[1.05, 0.97]}>
      <Dots seed="o" color={C.coral} op={0.55} size={[6, 14]} pull={0.85 * ramp(t, 0.2, 2.6, IO)} />
      <AbsoluteFill style={{ opacity: out }}>
        <At y={620}><Words text="Keyingisi —" at={0.2} size={60} weight={700} color={C.mid} /></At>
        <At y={790}><Letters text="CLICK" at={0.4} size={250} gap={0.05} /></At>
        <At y={1060}><Pill text="DÖSTINGIZGA YUBORING ↗" at={0.95} bg={C.coral} size={42} /></At>
      </AbsoluteFill>
    </Scene>
  );
};

const SCENES = [Hook, Ask, Launch, Goods, Answer, Unicorn, Users, Tencent, Lesson, Outro];

// ---------- tovushlar: [sahna, soniya, fayl, balandlik, cho'qqi (s), uzunlik (s)]
const PEAK = { swoosh: 0.12, sweep: 0.3, whoosh: 0.15, click: 0, select: 0, lightpop: 0.03, hardpop: 0.01, bubble: 0.13, bass: 0.09, deepimpact: 0.55, correct: 0.03, riser: 1.6 };
const CUES = [
  ...Array.from({ length: 9 }, (_, k) => [0, 0.04 + k * 0.095, 'click', 0.32]), [0, HIT, 'bass', 0.5], [0, HIT, 'deepimpact', 0.42, 1.3], [0, HIT + 0.15, 'select', 0.5], [0, HIT + 0.27, 'select', 0.5], [0, HIT + 0.39, 'select', 0.55],
  [1, 0.25, 'lightpop', 0.5], [1, 0.35, 'lightpop', 0.5], [1, 0.45, 'lightpop', 0.5], [1, 0.8, 'click', 0.45],
  [2, 0.7, 'sweep', 0.45], [2, 1.45, 'bubble', 0.6], [2, 0.75, 'click', 0.35],
  [3, 0.7, 'bubble', 0.45], [3, 1.05, 'bass', 0.5], [3, 1.9, 'click', 0.35],
  [4, R5(), 'deepimpact', 0.65, 1.6], [4, R5(), 'bass', 0.4], [4, 1.4, 'correct', 0.55, 0.9],
  [5, 0.3, 'hardpop', 0.5, 0.3], [5, 2.0, 'lightpop', 0.5],
  [6, 0.65, 'sweep', 0.4], [6, 1.7, 'bubble', 0.55],
  [7, 0.4, 'bass', 0.55], [7, 2.3, 'hardpop', 0.5, 0.3],
  [8, 0.3, 'select', 0.45], [8, 0.42, 'select', 0.45], [8, 0.54, 'select', 0.45], [8, 3.05, 'deepimpact', 0.5, 1.4], [8, 3.05, 'bass', 0.35],
  [9, 0.4, 'click', 0.45], [9, 0.95, 'bubble', 0.55],
];
function R5() { return 1.15; }
// sahna o'tishlari (niqob ochilishi) — har birida "vush"
const TRANS = SCENES.map((_, i) => i).filter((i) => i > 0).map((i) => [i, 0.05, i % 2 ? 'swoosh' : 'whoosh', 0.55]);

const sceneFrom = (i) => (i === 0 ? 0 : START[i] - OV);

const Sfx = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {[...TRANS, [4, 0.3, 'riser', 0.35, 1.0], ...CUES].map(([i, s, name, vol, len], k) => {
        const at = sceneFrom(i) + s - (PEAK[name] || 0);
        const from = Math.max(0, Math.round(at * fps));
        return (
          <Sequence key={k} from={from} durationInFrames={Math.round((len || 2.5) * fps)} layout="none">
            <Audio src={staticFile(`sfx/${name}.mp3`)} volume={vol} />
          </Sequence>
        );
      })}
    </>
  );
};

// Fon musiqasi: "Tech House vibes" — Alejandro Magaña (Mixkit Stock Music Free License).
// Trekdagi 32,28 s dagi fraza boshi (kuchli zarb) javob lahzasiga (sahna 5, R) tushadi; 16,28 s dagi "drop" hook ichida keladi.
const MUSIC_HIT = 32.28;
const Music = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const answerAt = sceneFrom(4) + R5();
  const offset = MUSIC_HIT - answerAt;
  const fadeOut = Math.round(1.2 * fps);
  return (
    <Audio
      src={staticFile('music/techhouse.mp3')}
      trimBefore={Math.round(offset * fps)}
      volume={(fr) => 0.42 * interpolate(fr, [0, 6, durationInFrames - fadeOut, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
    />
  );
};

export const Uzum = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {SCENES.map((S, i) => (
        <Sequence key={i} from={Math.round(sceneFrom(i) * fps)} durationInFrames={Math.round((DUR[i] + (i ? OV : 0)) * fps)}>
          <S />
        </Sequence>
      ))}
      <Music />
      <Sfx />
    </AbsoluteFill>
  );
};
