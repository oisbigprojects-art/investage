// Umumiy motion "to'plami": rang, harakat egri chiziqlari, kinetik matn, zarrachalar, sahna o'tishlari.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const C = {
  white: '#FFFFFF',
  black: '#0D0D0F',
  grey: '#EFEFF1',
  line: '#D8D8DE',
  mid: '#8B8B93',
  coral: '#E76F51',
  coralSoft: '#F6C3B6',
};
export const FONT = 'Manrope, sans-serif';
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const IO = Easing.bezier(0.65, 0, 0.35, 1);

export const useSec = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { f, fps, t: f / fps };
};

// 0..1 oraliqdagi silliq o'tish (a..b soniya)
export const ramp = (t, a, b, easing = EXPO) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

// Prujina: `at` soniyadan boshlanadi
export const sp = (f, fps, at, cfg = {}) =>
  spring({ frame: f - Math.round(at * fps), fps, config: { damping: 14, stiffness: 170, mass: 0.7, ...cfg } });

// Qisqa "zarba" (0 → 1 → 0)
export const bump = (t, a, d = 0.4) => Math.sin(Math.PI * ramp(t, a, a + d, Easing.linear));

// O'zbekcha raqam: 600 000, 1,16
export const num = (v, dec = 0) =>
  v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Gorizontal markazda, y bo'yicha markazlangan qator
export const At = ({ y, x = 540, children, style }) => (
  <div style={{ position: 'absolute', left: x - 540, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translateY(-50%)', ...style }}>
    {children}
  </div>
);

// Harf-harf prujinali sarlavha (blur + ko'tarilish)
export const Letters = ({ text, at = 0, size = 200, weight = 800, color = C.black, gap = 0.04, track = -0.035, style }) => {
  const { f, fps } = useSec();
  return (
    <div style={{ display: 'flex', fontFamily: FONT, fontWeight: weight, fontSize: size, color, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: 'pre', ...style }}>
      {[...text].map((ch, i) => {
        const p = sp(f, fps, at + i * gap, { damping: 12, stiffness: 150, mass: 0.6 });
        return (
          <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - p) * size * 0.65}px) scale(${0.55 + 0.45 * p})`, opacity: Math.min(1, p * 1.6), filter: `blur(${Math.max(0, 1 - p) * 12}px)` }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// So'zlar niqob ichidan pastdan ko'tariladi; hi — ajratiladigan so'z indekslari
export const Words = ({ text, at = 0, size = 64, weight = 700, color = C.black, hi = [], hiColor = C.coral, gap = 0.07, width = 940, lh = 1.16, style }) => {
  const { t } = useSec();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.27, width, fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: lh, color, ...style }}>
      {text.split(' ').map((w, i) => {
        const p = ramp(t, at + i * gap, at + i * gap + 0.6);
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', padding: `0 0 ${size * 0.14}px` }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)`, color: hi.includes(i) ? hiColor : color }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

export const Pill = ({ text, at = 0, bg = C.black, color = C.white, size = 34 }) => {
  const { f, fps } = useSec();
  const p = sp(f, fps, at, { damping: 15, stiffness: 200 });
  return (
    <div style={{ transform: `scale(${p})`, opacity: Math.min(1, p * 2), background: bg, color, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: '0.06em', padding: `${size * 0.42}px ${size * 0.95}px`, borderRadius: 999, whiteSpace: 'nowrap' }}>
      {text}
    </div>
  );
};

// Sekin suzuvchi nuqtalar (chuqurlik). pull > 0 bo'lsa markazga tortiladi.
export const Dots = ({ n = 36, color = C.mid, seed = 'd', op = 0.3, speed = 1, size = [4, 11], pull = 0 }) => {
  const { t } = useSec();
  return (
    <AbsoluteFill>
      {Array.from({ length: n }).map((_, i) => {
        const r = (k) => random(`${seed}${k}${i}`);
        const v = (18 + 40 * r('v')) * speed;
        let x = r('x') * 1080 + Math.sin(t * 0.7 + i) * 14;
        let y = (((r('y') * 1920 - t * v) % 1920) + 1920) % 1920;
        x += (540 - x) * pull; y += (960 - y) * pull;
        const d = size[0] + (size[1] - size[0]) * r('s');
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: d, height: d, borderRadius: '50%', background: color, opacity: op * (0.35 + 0.65 * r('o')) }} />;
      })}
    </AbsoluteFill>
  );
};

// Zarrachalar portlashi (at soniyada, cx, cy markazdan)
export const Burst = ({ at, cx = 540, cy = 760, n = 46, colors = [C.coral, C.white], seed = 'b' }) => {
  const { t } = useSec();
  const s = t - at;
  if (s < 0 || s > 1.6) return null;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }).map((_, i) => {
        const r = (k) => random(`${seed}${k}${i}`);
        const a = r('a') * Math.PI * 2, v = 380 + 760 * r('v');
        const e = EXPO(Math.min(1, s / 1.2));
        const x = cx + Math.cos(a) * v * e, y = cy + Math.sin(a) * v * e + 160 * s * s;
        const d = 8 + 14 * r('d');
        return <div key={i} style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: i % 3 ? '50%' : 3, background: colors[i % colors.length], opacity: 1 - ramp(s, 0.7, 1.5) }} />;
      })}
    </AbsoluteFill>
  );
};

// To'lqin halqasi
export const Ring = ({ at, cx, cy, r = 300, color = C.coral, w = 14, d = 0.8 }) => {
  const { t } = useSec();
  const p = ramp(t, at, at + d);
  if (p <= 0 || p >= 1) return null;
  const R = r * p;
  return <div style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, borderRadius: '50%', border: `${w * (1 - p) + 2}px solid ${color}`, opacity: 1 - p }} />;
};

// Sahna: oldingi sahna ustidan niqob bilan ochiladi va butun davomida sekin yaqinlashadi
export const Scene = ({ bg, dur, enter = 'circle', origin = [540, 960], zoom = [1, 1.045], children }) => {
  const { t } = useSec();
  const p = ramp(t, 0, 0.6, IO);
  const clips = {
    circle: `circle(${p * 130}% at ${origin[0]}px ${origin[1]}px)`,
    up: `inset(${(1 - p) * 100}% 0 0 0)`,
    left: `polygon(0 0, ${p * 140}% 0, ${p * 140 - 40}% 100%, 0 100%)`,
  };
  const z = interpolate(t, [0, dur], zoom) * (enter === 'none' ? 1 : 1.08 - 0.08 * EXPO(ramp(t, 0, 0.9, Easing.linear)));
  return (
    <AbsoluteFill style={{ background: bg, clipPath: enter === 'none' || p >= 1 ? undefined : clips[enter] }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
