// Stickman animatsiya dvigateli: qo'lda chizilgandek chiziqlar, skelet (burchaklar), pozalar, sahna va tovush "cue"lari.
// Kadr vaqtga bog'liq: window.seek(ms) istalgan kadrni bir xil chizadi, shuning uchun video render aniq.
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const W = 1080, H = 1920, GROUND = 1400;
const INK = '#15140F', PAPER = '#F6F1E4', GOLD = '#F5BF17', RED = '#E5342B', NIGHT = '#141A2B', MOON = '#E9E6DA';
const FONT = 'Manrope, sans-serif';

const R = { torso: 165, upper: 84, lower: 84, thigh: 96, shin: 96, neck: 16, head: 50, line: 17 };

// --- yordamchilar
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const ease = {
  in: (x) => x * x,
  out: (x) => 1 - (1 - x) * (1 - x),
  io: (x) => x * x * (3 - 2 * x),
  back: (x) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2),
  bounce: (x) => {
    const n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
  },
};
// kf(t, [[vaqt, qiymat, ease?], ...]): kalit kadrlar orasida silliq o'tish (son yoki poza)
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb, e] = keys[i];
      return mix(va, vb, (ease[e] || ease.io)((t - a) / (b - a)));
    }
  }
  return keys[keys.length - 1][1];
}
function mix(a, b, t) {
  if (typeof a === 'number') return lerp(a, b, t);
  if (Array.isArray(a)) return a.map((v, i) => mix(v, b[i], t));
  const o = {};
  for (const k in a) o[k] = mix(a[k], b[k], t);
  return o;
}
function hash(a, b = 0) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// Har 1/9 soniyada chiziqlar biroz titraydi: qo'lda chizilgan multfilm hissi
let boilStep = 0;
function jit(seed, amp = 2.4) {
  return [(hash(seed, boilStep) - 0.5) * amp * 2, (hash(seed + 9.1, boilStep) - 0.5) * amp * 2];
}
function ink(points, seed, width = R.line, color = INK) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    const [jx, jy] = jit(seed + i * 3.3);
    if (i === 0) ctx.moveTo(p[0] + jx, p[1] + jy); else ctx.lineTo(p[0] + jx, p[1] + jy);
  });
  ctx.stroke();
}

// --- pozalar. Burchaklar gradusda: 0 = pastga, musbat = oldinga (qaragan tomonga).
// a = [yelka, tirsak], l = [son, tizza]; tizza manfiy = orqaga bukiladi.
const P = {
  stand: { lean: 0, head: 0, aF: [8, 6], aB: [-8, 6], lF: [5, -2], lB: [-5, -2] },
  crossed: { lean: -2, head: 4, aF: [28, 96], aB: [18, 104], lF: [8, -2], lB: [-8, -2] },
  knock0: { lean: 4, head: 0, aF: [78, 60], aB: [-10, 8], lF: [9, -4], lB: [-7, -2] },
  knock1: { lean: 8, head: 0, aF: [96, 22], aB: [-10, 8], lF: [9, -4], lB: [-7, -2] },
  blown: { lean: -28, head: -22, aF: [150, 18], aB: [-150, -18], lF: [62, -34], lB: [30, -70] },
  flat: { lean: 0, head: 6, aF: [-168, 0], aB: [170, 0], lF: [8, 0], lB: [-8, 0] },
  sit: { lean: 26, head: 26, aF: [34, 16], aB: [22, 16], lF: [78, -78], lB: [70, -74] },
  sitUp: { lean: 8, head: -18, aF: [28, 14], aB: [14, 14], lF: [78, -78], lB: [70, -74] },
  think: { lean: 2, head: -8, aF: [50, 118], aB: [-10, 10], lF: [6, -2], lB: [-6, -2] },
  point: { lean: 4, head: -4, aF: [92, 2], aB: [-12, 8], lF: [8, -2], lB: [-8, -2] },
  stop: { lean: 2, head: 0, aF: [84, -58], aB: [-8, 8], lF: [8, -2], lB: [-8, -2] },
  shock: { lean: -8, head: -8, aF: [136, 22], aB: [-136, -22], lF: [14, -4], lB: [-14, -4] },
  cheer: { lean: -4, head: -14, aF: [165, 8], aB: [-165, -8], lF: [12, -2], lB: [-12, -2] },
  type: { lean: 20, head: 18, aF: [52, 44], aB: [40, 54], lF: [84, -84], lB: [76, -80] },
  hold: { lean: 2, head: 0, aF: [96, 58], aB: [-8, 8], lF: [8, -2], lB: [-8, -2] },
  wave: { lean: 0, head: -6, aF: [150, 24], aB: [-8, 8], lF: [8, -2], lB: [-8, -2] },
  jam: { lean: -6, head: 2, aF: [40, 36], aB: [-30, 14], lF: [58, -6], lB: [-14, -4] },
};
function walk(p, amp = 1) {
  const s = Math.sin(p), c = Math.cos(p);
  return {
    lean: 3, head: 0,
    aF: [-20 * s * amp, 14], aB: [20 * s * amp, 14],
    lF: [24 * s * amp, -10 - 28 * Math.max(0, c) * amp], lB: [-24 * s * amp, -10 - 28 * Math.max(0, -c) * amp],
  };
}
function run(p) {
  const s = Math.sin(p), c = Math.cos(p);
  return {
    lean: 16, head: -8,
    aF: [-44 * s, 88], aB: [44 * s, 88],
    lF: [46 * s + 12, -28 - 66 * Math.max(0, c)], lB: [-46 * s + 12, -28 - 66 * Math.max(0, -c)],
  };
}

// Skelet nuqtalari: tos (0,0) atrofida, oldinga = +x
const dir = (deg) => [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
function solve(p, sc) {
  const add = (a, d, l) => [a[0] + d[0] * l * sc, a[1] + d[1] * l * sc];
  const hip = [0, 0];
  const up = [Math.sin((p.lean * Math.PI) / 180), -Math.cos((p.lean * Math.PI) / 180)];
  const neck = add(hip, up, R.torso);
  const hd = (p.lean + p.head) * Math.PI / 180;
  const head = [neck[0] + Math.sin(hd) * (R.head + R.neck) * sc, neck[1] - Math.cos(hd) * (R.head + R.neck) * sc];
  const sh = add(hip, up, R.torso * 0.93);
  const limb = (o, a, l1, l2) => {
    const j1 = add(o, dir(a[0]), l1);
    return [o, j1, add(j1, dir(a[0] + a[1]), l2)];
  };
  return {
    hip, neck, head, hd,
    aF: limb(sh, p.aF, R.upper, R.lower), aB: limb(sh, p.aB, R.upper, R.lower),
    lF: limb(hip, p.lF, R.thigh, R.shin), lB: limb(hip, p.lB, R.thigh, R.shin),
  };
}

// Qahramon chizish. o: {x, y (yer), s, flip, pose, rot, mouth (0..1), mood, color, look: aksessuar, hover, sy (squash)}
function stick(o) {
  const s = o.s || 1, f = o.flip ? -1 : 1, color = o.color || INK, id = o.id || 1;
  const J = solve(o.pose || P.stand, s);
  const feet = Math.max(J.lF[2][1], J.lB[2][1]);
  ctx.save();
  ctx.translate(o.x, (o.y === undefined ? GROUND : o.y) - (o.rot !== undefined || o.free ? 0 : feet + R.line * 0.5 * s) - (o.hover || 0));
  if (o.rot) ctx.rotate((o.rot * Math.PI) / 180);
  ctx.scale(f, o.sy || 1);
  const w = R.line * s;
  ink(J.lB, id + 2, w, color); ink(J.aB, id + 3, w, color);
  ink([J.hip, J.neck], id + 1, w, color);
  ink(J.lF, id + 4, w, color); ink(J.aF, id + 5, w, color);
  if (o.tie) ink([[J.neck[0], J.neck[1] + 8 * s], [J.neck[0] + 8 * s, J.neck[1] + 72 * s]], id + 6, w * 0.75, o.tie);
  // bosh
  const [hx, hy] = J.head, r = R.head * s;
  const [jx, jy] = jit(id + 7, 1.6);
  ctx.fillStyle = o.fill || PAPER; ctx.strokeStyle = color; ctx.lineWidth = w * 0.9;
  ctx.beginPath(); ctx.arc(hx + jx, hy + jy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (o.hair === 'bun') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(hx - r * 0.82, hy - r * 0.85, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx, hy, r + w * 0.45, Math.PI * 1.02, Math.PI * 1.72); ctx.lineWidth = w * 1.1; ctx.stroke();
  }
  if (o.hair === 'long') {
    ink([[hx - r * 0.5, hy - r * 0.8], [hx - r * 1.25, hy - r * 0.1], [hx - r * 1.2, hy + r * 1.3]], id + 8, w * 1.3, color);
  }
  if (o.hat) {
    ctx.fillStyle = color;
    ctx.fillRect(hx - r * 1.2, hy - r * 0.92, r * 2.4, 10 * s);
    ctx.fillRect(hx - r * 0.72, hy - r * 1.7, r * 1.44, r * 0.86);
  }
  face(hx, hy, r, s, o, color);
  ctx.restore();
  return { head: [o.x + hx * f, (o.y === undefined ? GROUND : o.y) - feet + hy] };
}
function face(hx, hy, r, s, o, color) {
  const mood = o.mood || 'calm', look = o.look === undefined ? 0.28 : o.look;
  const ex = hx + r * look, gap = r * 0.36, ey = hy - r * 0.12;
  ctx.fillStyle = o.eye || color; ctx.strokeStyle = color; ctx.lineCap = 'round';
  const dot = (x, y, d) => { ctx.beginPath(); ctx.arc(x, y, d, 0, Math.PI * 2); ctx.fill(); };
  if (mood === 'dizzy') {
    ctx.lineWidth = 5 * s;
    for (const k of [-1, 1]) {
      const x = ex + gap * k;
      ctx.beginPath(); ctx.moveTo(x - 9 * s, ey - 9 * s); ctx.lineTo(x + 9 * s, ey + 9 * s); ctx.moveTo(x + 9 * s, ey - 9 * s); ctx.lineTo(x - 9 * s, ey + 9 * s); ctx.stroke();
    }
  } else if (mood === 'shock') {
    dot(ex - gap, ey, 11 * s); dot(ex + gap, ey, 11 * s);
  } else {
    dot(ex - gap, ey, 6.5 * s); dot(ex + gap, ey, 6.5 * s);
  }
  if (mood === 'angry' || mood === 'sad') {
    const d = mood === 'angry' ? 1 : -1;
    ctx.lineWidth = 5 * s;
    for (const k of [-1, 1]) {
      const x = ex + gap * k;
      ctx.beginPath(); ctx.moveTo(x - 11 * s, ey - 16 * s - 5 * s * d * -k); ctx.lineTo(x + 11 * s, ey - 16 * s + 5 * s * d * -k); ctx.stroke();
    }
  }
  const mx = hx + r * look, my = hy + r * 0.46, open = o.mouth || 0;
  ctx.lineWidth = 5 * s;
  if (open > 0.06) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(mx, my, r * 0.2, r * (0.08 + 0.3 * open), 0, 0, Math.PI * 2); ctx.fill();
  } else if (mood === 'happy') {
    ctx.beginPath(); ctx.arc(mx, my - r * 0.14, r * 0.3, 0.2, Math.PI - 0.2); ctx.stroke();
  } else if (mood === 'sad' || mood === 'dizzy') {
    ctx.beginPath(); ctx.arc(mx, my + r * 0.2, r * 0.25, Math.PI + 0.3, -0.3); ctx.stroke();
  } else if (mood === 'shock') {
    ctx.beginPath(); ctx.ellipse(mx, my + 2, r * 0.13, r * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(mx - r * 0.2, my); ctx.lineTo(mx + r * 0.2, my); ctx.stroke();
  }
}

// --- sahna elementlari
function floor(color = INK, y = GROUND) {
  ink([[-3000, y + 8], [-1000, y + 4], [1000, y + 9], [3000, y + 5], [9000, y + 7]], 40, 12, color);
}
// Eshik: x = markaz; open 0..1; room — ichki yorug'lik rangi; drawIn — ichkaridagi qahramon
function door(o) {
  const w = 310, h = 720, x = o.x - w / 2, y = GROUND - h;
  const open = o.open || 0, id = o.seed || 50;
  ctx.fillStyle = o.room || '#FBDD76';
  ctx.fillRect(x, y, w, h);
  if (o.inner) { ctx.save(); ctx.beginPath(); ctx.rect(x - 200, y - 200, w + 240, h + 200); ctx.clip(); o.inner(); ctx.restore(); }
  const pw = w * (1 - open * 0.88);
  ctx.fillStyle = o.color || '#C9472B';
  ctx.fillRect(x, y, pw, h);
  ink([[x, y], [x + pw, y + 2], [x + pw, y + h], [x, y + h]], id + 1, 9);
  if (open < 0.5) {
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 7;
    ctx.strokeRect(x + pw * 0.15, y + 70, pw * 0.7, 230);
    ctx.strokeRect(x + pw * 0.15, y + 380, pw * 0.7, 250);
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.arc(x + pw - 36 * (pw / w), y + 360, 15, 0, Math.PI * 2); ctx.fill();
  }
  ink([[x - 12, GROUND], [x - 12, y - 12], [x + w + 12, y - 12], [x + w + 12, GROUND]], id + 2, 17);
  if (o.sign !== null) {
    ctx.save(); ctx.translate(o.x, y - 62); ctx.rotate(-0.015);
    ctx.font = `800 40px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.textBaseline = 'middle';
    ctx.fillText(o.sign || tr('INVESTOR', 'ИНВЕСТОР'), 0, 0);
    ctx.restore();
  }
}
function bubble(text, x, y, t, o = {}) {
  const p = ease.back(prog(t, 0, 0.14));
  if (p <= 0) return;
  const size = o.size || 92;
  ctx.save();
  ctx.font = `800 ${size}px ${FONT}`;
  const tw = ctx.measureText(text).width, pad = size * 0.55, bw = tw + pad * 2, bh = size * 1.75;
  ctx.translate(x, y); ctx.scale(p, p); ctx.rotate((o.rot || -1.5) * Math.PI / 180);
  const bx = -bw / 2 + (o.dx || 0);
  ctx.fillStyle = o.fill || '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.roundRect(bx, -bh / 2, bw, bh, 34);
  ctx.fill(); ctx.stroke();
  const tx = o.tail || 0;
  ctx.beginPath(); ctx.moveTo(tx - 28, bh / 2 - 6); ctx.lineTo(tx + (o.tailTo || 0), bh / 2 + 62); ctx.lineTo(tx + 34, bh / 2 - 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx - 28, bh / 2 - 1); ctx.lineTo(tx + (o.tailTo || 0), bh / 2 + 62); ctx.lineTo(tx + 34, bh / 2 - 1); ctx.stroke();
  ctx.fillStyle = o.color || INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, (o.dx || 0), 4);
  ctx.restore();
}
// Komiks so'zi: TUK, TARS, BUM ...
function word(text, x, y, t, o = {}) {
  const dur = o.dur || 0.5;
  if (t < 0 || t > dur) return;
  const p = ease.back(prog(t, 0, 0.1)), a = 1 - prog(t, dur - 0.12, dur);
  ctx.save();
  ctx.translate(x, y); ctx.rotate((o.rot || 0) * Math.PI / 180); ctx.scale(p, p); ctx.globalAlpha = a;
  ctx.font = `800 ${o.size || 110}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = (o.size || 110) * 0.2; ctx.strokeStyle = o.stroke || INK;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = o.color || GOLD; ctx.fillText(text, 0, 0);
  ctx.restore();
}
function burst(x, y, t, o = {}) {
  const dur = o.dur || 0.35, n = o.n || 12;
  if (t < 0 || t > dur) return;
  const p = ease.out(t / dur);
  ctx.strokeStyle = o.color || INK; ctx.lineWidth = o.w || 11; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hash(i, 3);
    const r1 = (o.r || 70) + (o.spread || 190) * p, r2 = r1 + (o.len || 70) * (1 - p);
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); ctx.stroke();
  }
}
function stars(x, y, t, o = {}) {
  for (let i = 0; i < 4; i++) {
    const a = t * 6 + (i * Math.PI) / 2;
    ctx.fillStyle = o.color || GOLD; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    const sx = x + Math.cos(a) * 92, sy = y + Math.sin(a) * 28;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 9 : 22, b = (k / 10) * Math.PI * 2 - Math.PI / 2 + a;
      ctx.lineTo(sx + Math.cos(b) * r, sy + Math.sin(b) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}
function drops(x, y, n, t, seed = 1) {
  ctx.fillStyle = '#6CC4F0';
  for (let i = 0; i < n; i++) {
    const p = (t * 1.4 + hash(i, seed)) % 1;
    ctx.beginPath(); ctx.arc(x + 40 * (i - n / 2) + p * 20, y + p * 130, 11 * (1 - p * 0.5), 0, Math.PI * 2); ctx.fill();
  }
}
function confetti(t, n = 90) {
  const colors = [GOLD, RED, '#2FB57A', '#3E8BFF', INK];
  for (let i = 0; i < n; i++) {
    const x = hash(i, 1) * W + Math.sin(t * 3 + i) * 34;
    const y = -60 + ((hash(i, 2) * 1 + t * (0.45 + hash(i, 4) * 0.4)) % 1.05) * (H - 300);
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 5 + i);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-13, -8, 26, 16 * Math.abs(Math.cos(t * 7 + i)) + 2);
    ctx.restore();
  }
}
function textBlock(lines, x, y, size, o = {}) {
  ctx.save();
  ctx.font = `800 ${size}px ${FONT}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color || INK; ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * 1.2));
  ctx.restore();
}
// Hisoblagich: qo'lda chizilgan chiziqchalar (|||| va ustidan bitta chiziq)
function tally(n, x, y, o = {}) {
  const color = o.color || INK, h = 94;
  let cx = x;
  for (let i = 0; i < n; i++) {
    if (i % 5 === 4) {
      ink([[cx - 128, y + h - 8], [cx - 2, y + 8]], 300 + i, 12, o.slash || RED);
      cx += 40;
    } else {
      ink([[cx, y], [cx - 4, y + h]], 300 + i, 12, color);
      cx += 30;
    }
  }
}
function sky(color) { ctx.fillStyle = color; ctx.fillRect(-200, -200, W + 400, H + 400); }
// Qog'oz donachalari: fon "tirik" turadi
function grain(alpha = 0.05) {
  ctx.fillStyle = `rgba(90,70,30,${alpha})`;
  for (let i = 0; i < 70; i++) ctx.fillRect(hash(i, 8) * W, hash(i, 9) * H, 3 + hash(i, 5) * 5, 3);
}

// --- ssenariy qurilishi
const S = { scenes: [], cues: [], total: 0, lines: {}, lang: 'uz' };
const tr = (uz, ru) => (S.lang === 'ru' ? ru : uz);
const scene = (dur, draw) => { S.scenes.push({ dur, draw, at: S.total }); S.total += dur; };
const cue = (t, name, gain = 1, rate = 1, cut = 0) => S.cues.push({ t, name, gain, rate, cut });
const say = (t, line, gain = 1, rate = 1) => {
  const l = S.lines[line];
  if (l && l.sound) cue(t, l.sound, gain, rate * l.rate); else S.cues.push({ t, line, gain, rate });
};
const D = (line) => (S.lines[line] ? S.lines[line].dur : 0.8);
function talk(line, t, from, rate = 1) {
  const l = S.lines[line];
  if (!l || t < from) return 0;
  const i = Math.floor((t - from) * 30 * rate);
  return i < l.env.length ? l.env[i] : 0;
}

window.build = function (spec) {
  S.lines = spec.lines || {};
  S.lang = spec.lang || 'uz';
  window.EPISODES[spec.episode]({ scene, cue, say, D });
  return { duration: S.total * 1000, cues: S.cues, bounds: S.scenes.map((s) => [s.at * 1000, (s.at + s.dur) * 1000]) };
};
window.seek = function (ms) {
  const t = ms / 1000;
  boilStep = Math.floor(t * 9);
  const sc = S.scenes.find((s) => t < s.at + s.dur) || S.scenes[S.scenes.length - 1];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  sc.draw(t - sc.at, sc.at);
  ctx.restore();
};
