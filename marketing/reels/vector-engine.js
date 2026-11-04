// Tekis vektor animatsiya dvigateli (Kurzgesagt uslubi): to'q fon, yulduzlar, yumshoq nur, tekis shakllar,
// silliq harakat va so'zma-so'z subtitr. Kadr faqat vaqtga bog'liq: window.seek(ms) istalgan kadrni bir xil chizadi.
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');
const W = 1080, H = 1920;
const FONT = 'Manrope, sans-serif';
const C = {
  night: '#150F3A', deep: '#21185C', violet: '#3A2A8C', pink: '#FF4F8B', cyan: '#3EE0D0', teal: '#1FA39A',
  yellow: '#FFD23F', orange: '#FF8A3D', red: '#E8333A', cola: '#6B2416', cream: '#FFF4DC', white: '#FFFFFF',
  ink: '#120C2E', gold: '#F5BF17', land: '#3FCF8E', sea: '#2B6FE0',
};

// ---------- yordamchilar
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const ease = {
  in: (x) => x * x * x,
  out: (x) => 1 - Math.pow(1 - x, 3),
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: (x) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2),
};
function hash(a, b = 0) { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); }
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb, e] = keys[i];
      const k = (ease[e] || ease.io)((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}
const pop = (t, a, d = 0.45) => ease.back(prog(t, a, a + d));
const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ---------- fon va bezaklar
function space(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, o.top || C.night); g.addColorStop(1, o.bottom || C.deep);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // uzoq tumanliklar
  glow(o.nx || 240, o.ny || 520, 620, o.neb || C.violet, 0.45);
  glow(860, 1500, 700, o.neb2 || '#2E1F7A', 0.5);
  // yulduzlar: miltillaydi va sekin suzadi
  const drift = (o.drift === undefined ? 6 : o.drift) * t;
  for (let i = 0; i < 140; i++) {
    const x = (hash(i, 1) * W + drift * (0.3 + hash(i, 3))) % W, y = hash(i, 2) * H;
    const r = 1 + hash(i, 4) * 2.6, a = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + hash(i, 5) * 1.6) + i));
    ctx.globalAlpha = a; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // suzib yuruvchi rangli zarrachalar (oldingi plan)
  if (o.dust !== false) {
    const cols = [C.pink, C.cyan, C.yellow, C.orange];
    for (let i = 0; i < 18; i++) {
      const x = (hash(i, 21) * W + t * (12 + hash(i, 22) * 20)) % (W + 80) - 40;
      const y = (hash(i, 23) * H - t * (18 + hash(i, 24) * 26) + H * 4) % H;
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 1.3 + i);
      circle(x, y, 4 + hash(i, 25) * 7, cols[i % 4]);
    }
    ctx.globalAlpha = 1;
  }
}
function glow(x, y, r, color, a = 0.6) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, a)); g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function rrect(x, y, w, h, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
function circle(x, y, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function text(s, x, y, size, o = {}) {
  ctx.save();
  ctx.font = `${o.weight || 800} ${size}px ${FONT}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.letter) ctx.letterSpacing = o.letter + 'px';
  ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(10,6,30,.55)'; ctx.shadowBlur = size * 0.25; ctx.shadowOffsetY = size * 0.06; }
  ctx.fillStyle = o.color || C.white; ctx.fillText(s, x, y);
  ctx.restore();
}
// Ichimlik stakani: tekis, yuqorisi yorug'roq, ichida ko'piklar va muz. fill 0..1 — qanchasi to'la
function glass(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const fill = o.fill === undefined ? 1 : o.fill;
  if (o.glow !== false) glow(0, -40, 260, C.orange, 0.35);
  // soya
  ctx.fillStyle = 'rgba(8,5,25,.35)'; ctx.beginPath(); ctx.ellipse(0, 160, 120, 22, 0, 0, Math.PI * 2); ctx.fill();
  // shisha
  const top = -170, bot = 150, wt = 110, wb = 82;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-wt, top); ctx.lineTo(wt, top); ctx.lineTo(wb, bot); ctx.quadraticCurveTo(0, bot + 18, -wb, bot); ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill();
  ctx.clip();
  // ichimlik
  const ly = lerp(bot + 20, top + 38, fill);
  const g = ctx.createLinearGradient(0, ly, 0, bot);
  g.addColorStop(0, '#A8452A'); g.addColorStop(1, C.cola);
  ctx.fillStyle = g; ctx.fillRect(-140, ly, 280, bot - ly + 30);
  ctx.fillStyle = 'rgba(255,230,200,.55)'; ctx.fillRect(-140, ly - 6, 280, 10);
  // ko'piklar
  for (let i = 0; i < 14; i++) {
    const p = (t * (0.35 + hash(i, 7) * 0.4) + hash(i, 8)) % 1;
    const bx = (hash(i, 9) - 0.5) * 150, by = lerp(bot - 10, ly + 8, p);
    if (by > ly) circle(bx, by, 3 + hash(i, 6) * 5, 'rgba(255,220,190,.55)');
  }
  // muz
  if (fill > 0.6) {
    ctx.save(); ctx.translate(-26, ly + 30); ctx.rotate(0.25 + Math.sin(t * 1.3) * 0.05);
    rrect(-30, -30, 60, 60, 12, 'rgba(255,255,255,.5)'); ctx.restore();
    ctx.save(); ctx.translate(34, ly + 22); ctx.rotate(-0.3 + Math.sin(t * 1.1) * 0.05);
    rrect(-24, -24, 48, 48, 10, 'rgba(255,255,255,.42)'); ctx.restore();
  }
  ctx.restore();
  // shisha qirrasi va yaltirashi
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-wt, top); ctx.lineTo(-wb, bot); ctx.quadraticCurveTo(0, bot + 18, wb, bot); ctx.lineTo(wt, top); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(-wt + 22, top + 20); ctx.lineTo(-wt + 44, top + 20); ctx.lineTo(-wb + 30, bot - 20); ctx.lineTo(-wb + 14, bot - 20); ctx.fill();
  // somon (trubka)
  if (o.straw !== false) {
    ctx.strokeStyle = C.pink; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(30, 80); ctx.lineTo(70, top - 40); ctx.lineTo(120, top - 80); ctx.stroke();
  }
  ctx.restore();
}
// Tanga (sent)
function coin(x, y, r, label = '¢', rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  circle(0, 4, r, '#C98A12'); circle(0, 0, r, C.yellow); circle(0, 0, r * 0.74, '#FFE27A');
  text(label, 0, 2, r * 0.9, { color: '#B37400', shadow: false });
  ctx.restore();
}

// ---------- subtitr: so'zlar navbat bilan, joriy so'z sariq
function subtitle(words, t, o = {}) {
  // words: [[so'z, boshlanish, tugash], ...] sahna vaqti bo'yicha
  const shown = words.filter((w) => t >= w[1] - 0.02);
  if (!shown.length) return;
  const size = o.size || 52, y = o.y || 1590, maxW = 900;
  ctx.save();
  ctx.font = `800 ${size}px ${FONT}`;
  const lines = []; let cur = [];
  for (const w of words) {
    const test = [...cur, w].map((x) => x[0]).join(' ');
    if (ctx.measureText(test).width > maxW && cur.length) { lines.push(cur); cur = [w]; } else cur.push(w);
  }
  if (cur.length) lines.push(cur);
  ctx.textBaseline = 'middle';
  lines.forEach((ln, li) => {
    const full = ln.map((x) => x[0]).join(' ');
    let x = 540 - ctx.measureText(full).width / 2;
    const yy = y + (li - (lines.length - 1) / 2) * size * 1.22;
    ln.forEach((w) => {
      const s = w[0] + ' ';
      if (t >= w[1] - 0.02) {
        const k = ease.out(prog(t, w[1] - 0.02, w[1] + 0.12));
        ctx.globalAlpha = k;
        ctx.shadowColor = 'rgba(8,5,25,.8)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 3;
        ctx.fillStyle = t < w[2] ? C.yellow : C.white;
        ctx.textAlign = 'left';
        ctx.fillText(s, x, yy + (1 - k) * 10);
      }
      x += ctx.measureText(s).width;
    });
  });
  ctx.restore();
}
// Matnni so'zlarga bo'lib, vaqtni bo'g'in og'irligiga qarab taqsimlaydi (haqiqiy ovoz bo'lmaganda)
function spread(line, a, b) {
  const ws = line.split(' ');
  const wt = ws.map((w) => Math.max(1, (w.match(/[aeiouo'‘’AEIOUаеёиоуыэюя0-9]/gi) || []).length));
  const sum = wt.reduce((x, y) => x + y, 0);
  let tt = a; const out = [];
  ws.forEach((w, i) => { const d = ((b - a) * wt[i]) / sum; out.push([w, tt, tt + d]); tt += d; });
  return out;
}

// ---------- ssenariy qurilishi (stick.py bilan bir xil shartnoma)
const S = { scenes: [], cues: [], total: 0, spec: {} };
const scene = (dur, draw, flags = {}) => { S.scenes.push({ dur, draw, at: S.total, flags }); S.total += dur; };
const cue = (t, name, gain = 1, rate = 1) => S.cues.push({ t, name, gain, rate });
window.EPISODES = window.EPISODES || {};
window.build = function (spec) {
  S.spec = spec;
  window.EPISODES[spec.episode]({ scene, cue, spec });
  return { duration: S.total * 1000, cues: S.cues, bounds: S.scenes.map((s) => [s.at * 1000, (s.at + s.dur) * 1000]), flags: S.scenes.map((s) => s.flags) };
};
// Kamera doim sekin "nafas oladi", sahnalar orasida esa zoom bilan silliq o'tish: eski sahna kattalashib
// so'nadi, yangisi kichikdan kelib o'rnashadi (Kurzgesagt'dagi "uchib o'tish" hissi).
const TR = 0.42;
const off = document.createElement('canvas'); off.width = W; off.height = H;
function drawScene(sc, t, g) {
  ctx.save();
  ctx.translate(540 + Math.sin(g * 0.37) * 9, 960 + Math.cos(g * 0.29) * 12);
  ctx.rotate(Math.sin(g * 0.21) * 0.006);
  ctx.translate(-540, -960);
  sc.draw(t, g);
  ctx.restore();
}
window.seek = function (ms) {
  const g = ms / 1000;
  const i = Math.max(0, S.scenes.findIndex((s) => g < s.at + s.dur));
  const sc = S.scenes[i === -1 ? S.scenes.length - 1 : i];
  const t = g - sc.at;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const p = i > 0 && !sc.flags.cut ? prog(t, 0, TR) : 1;
  ctx.save();
  if (p < 1) { const z = lerp(0.82, 1, ease.out(p)); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960); }
  drawScene(sc, t, g);
  ctx.restore();
  if (p < 1) {
    // oldingi sahnaning oxirgi kadri ustidan kattalashib so'nadi
    const prev = S.scenes[i - 1];
    const main = ctx;
    const octx = off.getContext('2d');
    octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, W, H);
    ctxSwap(octx, () => drawScene(prev, prev.dur - 0.001 + t, g));
    main.save();
    main.globalAlpha = 1 - ease.in(p);
    const z = lerp(1, 1.45, ease.in(p));
    main.translate(540, 960); main.scale(z, z); main.translate(-540, -960);
    main.drawImage(off, 0, 0);
    main.restore();
  }
};
// Chizish funksiyalari global "ctx" dan foydalanadi: vaqtincha boshqa kanvasga yo'naltiramiz
function ctxSwap(other, fn) { const keep = ctx; ctx = other; try { fn(); } finally { ctx = keep; } }
