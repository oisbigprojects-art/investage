// 014: "Coca-Cola birinchi yili kuniga 9 stakan" — Kurzgesagt uslubidagi vektor animatsiya, 11 qator diktor bilan.
// Faktlar: coca-colacompany.com (tarix sahifasi) va kompaniyaning "kuniga ~2,2 milliard porsiya" ma'lumoti. Logotip chizilmaydi.
// spec.durations / spec.timing — prep_voice014.py diktor yozuvidan yozadi (sahna uzunligi va so'z vaqtlari).
window.EPISODES.coca = function ({ scene, cue, spec }) {
  const LINES = [
    "Coca-Cola birinchi yili kuniga nechta stakan sotgan deb o'ylaysiz?",
    'Ming emas. Yuz ham emas. Atigi 9 ta.',
    "1886-yil, Atlanta. Dorixonachi Jon Pemberton yangi ichimlik o'ylab topdi.",
    "Bir stakani 5 sent edi. Kuniga 9 stakan — bor-yo'g'i 45 sent.",
    "Pemberton biznesini bo'lak-bo'lak sotib yubordi.",
    '1888-yilda, vafotidan sal oldin, oxirgi ulushini ham sotdi.',
    "Uni sotib olgan Asa Kendler esa barcha huquqlarni yig'ib, kompaniyani to'liq o'z qo'liga oldi.",
    'Bugun bu kompaniyaning ichimliklari kuniga 2,2 milliard marta ichiladi.',
    '9 stakandan — 2,2 milliardgacha.',
    'Birinchi natija — oxirgi natija emas.',
    'Sizning loyihangiz hozir nechanchi stakanda? Izohda yozing.',
  ];
  const DEF = [4.4, 4.8, 9, 7.4, 3.2, 8, 7, 8.4, 5, 3.6, 4.4];
  const dur = (i) => (spec.durations && spec.durations[i]) || DEF[i];
  const words = (i) => (spec.timing && spec.timing[i]) || spread(LINES[i], 0.12, dur(i) - 0.25);
  const wAt = (i, k) => { const w = words(i); return w[Math.min(k, w.length - 1)][1]; };
  const B = [];
  let T = 0;
  const add = (i, draw, flags) => {
    const d = dur(i), w = words(i);
    B[i] = T;
    scene(d, (t, g) => { draw(t, d, g); subtitle(w, t); }, flags);
    T += d;
  };
  const RED = { top: '#FF3B4E', bottom: '#B0102C', neb: '#FF8A3D', neb2: '#FF2E63' };
  const zoomIn = (t, a = 1.07) => { const z = lerp(a, 1, ease.out(prog(t, 0, 0.9))); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960); };

  // Variant "chip"lari (hook): matn, joy, ko'rinish (0..1), chizilgan, tushish (0..1)
  const chip = (s, x, y, k, struck = 0, fall = 0, o = {}) => {
    if (k <= 0) return;
    ctx.save();
    ctx.translate(x + fall * 60, y + ease.in(fall) * 900); ctx.rotate(fall * 0.9); ctx.scale(k, k);
    ctx.globalAlpha = 1 - prog(fall, 0.7, 1);
    const w = o.w || 250;
    ctx.shadowColor = 'rgba(60,0,20,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rrect(-w / 2, -62, w, 124, 62, o.fill || C.white);
    ctx.shadowColor = 'transparent';
    text(s, 0, 4, o.size || 72, { color: o.color || '#B0102C', shadow: false });
    if (struck > 0) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-w / 2 + 20, 0); ctx.lineTo(-w / 2 + 20 + (w - 40) * ease.out(struck), 0); ctx.stroke();
    }
    ctx.restore();
  };
  const header = (small, big, k, y = 330, col = C.white) => {
    ctx.save(); ctx.translate(540, y); ctx.scale(k, k);
    text(small, 0, -110, 58, { color: C.yellow, letter: 8 });
    text(big, 0, 10, 150, { color: col });
    ctx.restore();
  };

  // 0. HOOK: savol — kuniga nechta?
  add(0, (t, d, g) => {
    space(g, RED);
    zoomIn(t, 1.03);
    header('KUNIGA', 'NECHTA?', lerp(0.9, 1, ease.back(prog(t, 0, 0.4))));
    const bob = Math.sin(g * 1.8) * 10;
    glass(540, 860 + bob, 1.2, g);
    for (let i = 0; i < 3; i++) {
      const an = g * 1.4 + i * 2.1;
      ctx.save(); ctx.translate(540 + Math.cos(an) * 330, 860 + Math.sin(an) * 120); ctx.rotate(Math.sin(g * 3 + i) * 0.3);
      text('?', 0, 0, 90 + i * 14, { color: [C.yellow, C.white, C.cream][i], alpha: 0.9 });
      ctx.restore();
    }
    const opts = [['9 000', 210], ['900', 540], ['9', 870]];
    opts.forEach(([s, x], k) => chip(s, x, 1230, pop(t, 0.4 + k * 0.35, 0.4), 0, 0, { w: k === 0 ? 290 : 230 }));
  });
  cue(0, 's:impact', 0.5); cue(0.05, 's:fizz', 0.3);
  [0.4, 0.75, 1.1].forEach((a) => cue(a, 's:pop', 0.5));

  // 1. Javob: ming emas, yuz ham emas, atigi 9
  add(1, (t, d, g) => {
    space(g, RED);
    const a0 = wAt(1, 0), a1 = wAt(1, 2), a2 = wAt(1, 5);
    const big = ease.back(prog(t, a2, a2 + 0.5));
    header('KUNIGA', 'NECHTA?', 1 - ease.in(prog(t, a2 - 0.2, a2 + 0.2)));
    const bob = Math.sin(g * 1.8) * 10;
    glass(540, 860 + bob - big * 60, lerp(1.2, 0.9, big), g);
    chip('9 000', 210, 1230, 1, prog(t, a0, a0 + 0.3), prog(t, a0 + 0.45, a0 + 1.2), { w: 290 });
    chip('900', 540, 1230, 1, prog(t, a1, a1 + 0.3), prog(t, a1 + 0.45, a1 + 1.2), { w: 230 });
    if (big <= 0) chip('9', 870, 1230, 1, 0, 0, { w: 230 });
    else {
      const x = lerp(870, 540, ease.out(prog(t, a2, a2 + 0.4))), y = lerp(1230, 330, ease.out(prog(t, a2, a2 + 0.4)));
      glow(x, y, 420 * big, C.yellow, 0.5);
      for (let i = 0; i < 14; i++) {
        const an = (i / 14) * Math.PI * 2, r = 120 + 360 * ease.out(prog(t, a2, a2 + 0.7));
        ctx.globalAlpha = 1 - prog(t, a2 + 0.3, a2 + 0.8);
        circle(x + Math.cos(an) * r, y + Math.sin(an) * r, 12, [C.yellow, C.white, C.cream][i % 3]);
      }
      ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1, 3.3, big), lerp(1, 3.3, big));
      text('9', 0, 4, 72, { color: C.yellow });
      ctx.restore();
      text('stakan / kun', 540, 560, 56, { color: C.cream, alpha: prog(t, a2 + 0.3, a2 + 0.6) });
    }
  });

  // 2. 1886, Atlanta: dorixona (yorqin tungi shahar)
  add(2, (t, d, g) => {
    space(g, { top: '#2A1A8C', bottom: '#9B2FBF', neb: '#FF4F8B', neb2: '#5A2AD0' });
    const z = lerp(1, 1.12, ease.io(prog(t, 0, d)));
    ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
    circle(900, 620, 62, '#FFF1C4'); glow(900, 620, 260, '#FFF1C4', 0.3);
    for (let i = 0; i < 9; i++) {
      const bw = 110 + hash(i, 2) * 60, bh = 260 + hash(i, 3) * 300, bx = i * 130 - 40;
      rrect(bx, 1260 - bh, bw, bh + 10, 10, '#4A23A8');
      for (let w = 0; w < 6; w++) if (hash(i, w) > 0.5) rrect(bx + 20 + (w % 2) * 46, 1260 - bh + 40 + Math.floor(w / 2) * 70, 26, 34, 4, hexA(C.yellow, 0.6 + 0.3 * Math.sin(g * 2 + w + i)));
    }
    rrect(-50, 1250, 1180, 700, 0, '#3A1890');
    const x = 250, y = 760, w = 580, h = 500;
    rrect(x, y, w, h, 18, '#FFF0D2');
    rrect(x - 20, y - 40, w + 40, 70, 16, '#FFD27A');
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? C.white : C.red;
      ctx.beginPath(); ctx.moveTo(x + i * (w / 8), y + 40); ctx.lineTo(x + (i + 1) * (w / 8), y + 40);
      ctx.lineTo(x + (i + 1) * (w / 8) + 6, y + 120); ctx.lineTo(x + i * (w / 8) + 6, y + 120); ctx.fill();
    }
    text('PHARMACY', x + w / 2, y - 6, 46, { color: '#A8321E', shadow: false, letter: 6 });
    rrect(x + 50, y + 160, 300, 230, 12, '#FFD98A'); glow(x + 200, y + 280, 280, C.yellow, 0.45);
    rrect(x + 50, y + 330, 300, 60, 6, '#E0894B');
    glass(x + 170, y + 300, 0.22, g, { glow: false });
    const st = Math.sin(g * 5) * 8;
    circle(x + 290, y + 240, 30, '#7A3F2A'); rrect(x + 255, y + 270, 70, 70, 22, '#7A3F2A');
    ctx.strokeStyle = '#7A3F2A'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 262, y + 290); ctx.lineTo(x + 205 + st, y + 300); ctx.stroke();
    rrect(x + 400, y + 190, 130, 310, 10, '#B0552C'); circle(x + 505, y + 350, 8, C.yellow);
    rrect(140, 900, 14, 360, 6, '#6A3CD0'); circle(147, 890, 26, '#FFE9A8'); glow(147, 890, 220, C.yellow, 0.45);
    ctx.restore();
    const k = pop(t, 0.1, 0.5);
    ctx.save(); ctx.translate(540, 360); ctx.scale(k, k);
    text('1886', 0, 0, 150, { color: C.yellow });
    text('Atlanta, AQSh', 0, 112, 48, { color: C.cream, weight: 700 });
    ctx.restore();
  });

  // 3. 5 sent va kuniga 9 stakan = 45 sent
  add(3, (t, d, g) => {
    const sw = wAt(3, 5);
    if (t < sw) {
      space(g, { top: '#14C2B0', bottom: '#0A6E8A', neb: '#7FF0D8', neb2: '#0FB5A6' });
      zoomIn(t);
      rrect(-40, 1150, 1160, 900, 0, '#F29A4B'); rrect(-40, 1150, 1160, 34, 0, '#FFC27A');
      const fl = ease.out(prog(t, 0.05, 1.1));
      if (t < 1.2) {
        const wob = Math.sin(g * 30) * 3;
        ctx.fillStyle = '#8E3A22'; ctx.fillRect(520 + wob, 0, 34, lerp(1000, 820, fl));
        ctx.fillStyle = 'rgba(255,220,190,.35)'; ctx.fillRect(526 + wob, 0, 8, lerp(1000, 820, fl));
      }
      glass(540, 1000, 1.3, g, { fill: lerp(0.05, 1, fl) });
      const k = pop(t, wAt(3, 2) - 0.1, 0.5), swg = Math.sin(g * 3) * 0.14 * (1 - prog(t, 1, sw));
      ctx.save(); ctx.translate(790, 640); ctx.rotate(swg); ctx.scale(k, k);
      ctx.strokeStyle = C.white; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, -40); ctx.stroke();
      rrect(-90, -40, 180, 120, 20, C.yellow);
      text('5¢', 0, 22, 82, { color: C.ink, shadow: false });
      ctx.restore();
    } else {
      const tt = t - sw;
      space(g, { top: '#FFB21E', bottom: '#FF6A1E', neb: '#FFE27A', neb2: '#FF8A3D' });
      for (let i = 0; i < 9; i++) {
        const k = pop(tt, 0.05 + i * 0.12, 0.35);
        if (k <= 0) continue;
        const cx = 270 + (i % 3) * 270, cy = 440 + Math.floor(i / 3) * 290;
        glass(cx, cy + Math.sin(g * 2 + i) * 6, 0.48 * k, g + i, { glow: false });
      }
      const k2 = pop(t, wAt(3, 9) - 0.1, 0.5);
      if (k2 > 0) {
        ctx.save(); ctx.translate(540, 1260); ctx.scale(k2, k2);
        rrect(-330, -100, 660, 200, 100, 'rgba(120,30,0,.25)');
        for (let i = 0; i < 5; i++) coin(-210 + i * 22, 10 - i * 14, 46, '¢');
        text('= 45¢', 90, 0, 120, { color: C.white });
        ctx.restore();
      }
    }
  });

  // Biznes doirasi (8 bo'lak)
  const pie = (cx, cy, r, off, o = {}) => {
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2;
      const f = off[i] || 0, dx = Math.cos(am) * f * 900, dy = Math.sin(am) * f * 900;
      ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(f * (hash(i) - 0.5) * 2);
      ctx.fillStyle = i % 2 ? C.yellow : C.orange;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0 + 0.02, a1 - 0.02); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.55, a0 + 0.02, a1 - 0.02); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if (o.label) text(o.label, cx, cy, 80, { color: C.ink, shadow: false });
  };
  const person = (x, y, s, color, name, t, a, g) => {
    const k = pop(t, a, 0.45);
    if (k <= 0) return;
    const br = 1 + Math.sin(g * 2.4 + x) * 0.025;
    ctx.save(); ctx.translate(x, y + 140 * s); ctx.scale(s * k, s * k * br); ctx.translate(0, -140);
    rrect(-60, -10, 120, 150, 50, color); rrect(-60, -10, 120, 40, 20, 'rgba(255,255,255,.15)');
    circle(0, -60, 48, '#F2C9A0');
    rrect(-48, -112, 96, 30, 14, '#3A2016');
    const blink = (g * 0.7 + x * 0.01) % 3 < 0.12 ? 0.15 : 1;
    ctx.save(); ctx.translate(0, -58); ctx.scale(1, blink); circle(-16, 0, 6, C.ink); circle(16, 0, 6, C.ink); ctx.restore();
    ctx.restore();
    if (name) text(name, x, y + 190 * s, 42, { color: C.white, weight: 700, alpha: k });
  };

  // 4. Pemberton biznesini bo'lak-bo'lak sotdi
  add(4, (t, d, g) => {
    space(g, { top: '#E0247A', bottom: '#6A1490', neb: '#FF8AC0', neb2: '#B0247A' });
    person(540, 1230, 1, C.cyan, 'Pemberton', t, 0, g);
    const off = [];
    for (let i = 0; i < 7; i++) off[i] = ease.in(prog(t, 0.3 + i * (d - 1) / 8, 0.9 + i * (d - 1) / 8));
    pie(540, 680, 260, off);
  });

  // 5. 1888: oxirgi bo'lak ham sotildi
  add(5, (t, d, g) => {
    space(g, { top: '#5A2AD0', bottom: '#241070', neb: '#9B6BFF', neb2: '#3A1890' });
    const k = pop(t, 0.05, 0.4);
    ctx.save(); ctx.translate(540, 360); ctx.scale(k, k);
    rrect(-170, -120, 340, 240, 26, C.cream); rrect(-170, -120, 340, 64, 26, C.red); rrect(-170, -80, 340, 24, 0, C.red);
    text('1888', 0, 40, 110, { color: C.ink, shadow: false });
    ctx.restore();
    const kn = wAt(5, 3);
    person(330, 1250, 0.95, C.cyan, 'Pemberton', t, 0, g);
    person(780, 1250, 0.95, C.pink, 'Asa Kendler', t, kn - 0.6, g);
    const f = ease.io(prog(t, kn, kn + 1.4));
    const x = lerp(330, 780, f), y = 980 - Math.sin(f * Math.PI) * 240;
    ctx.save(); ctx.translate(x, y); ctx.rotate(f * 6.28);
    glow(0, 0, 160, C.yellow, 0.4);
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 130, -Math.PI / 2, -Math.PI / 2 + Math.PI / 4); ctx.closePath(); ctx.fill();
    ctx.restore();
  });

  // 6. Kendler hamma bo'laklarni yig'di: 100%
  add(6, (t, d, g) => {
    space(g, { top: '#2E6BFF', bottom: '#1B2C9E', neb: '#7FB0FF', neb2: '#3A50D0' });
    person(540, 1270, 1, C.pink, 'Asa Kendler', t, 0, g);
    const step = (d - 2.2) / 8;
    const off = [];
    for (let i = 0; i < 8; i++) off[i] = 1 - ease.out(prog(t, 0.3 + i * step, 0.9 + i * step));
    const done = prog(t, d - 1.6, d - 1.2);
    if (done > 0) glow(540, 680, 480, C.yellow, 0.6 * done);
    pie(540, 680, 260, off, { label: done > 0.5 ? '100%' : '' });
  });

  // 7. KATTA MASSHTAB: bitta stakandan butun shaharga, keyin butun Yerga
  const land = [];
  for (let i = 0; i < 560; i++) {
    const lat = Math.asin(hash(i, 11) * 2 - 1), lon = hash(i, 12) * Math.PI * 2;
    const c = Math.floor(hash(i, 13) * 6), clat = [0.7, 0.3, -0.3, 0.9, -0.5, 0.1][c], clon = [0.5, 1.6, 2.4, 3.6, 4.6, 5.5][c];
    land.push([clat + (lat - clat) * 0.35, clon + (lon - clon) * 0.25, hash(i, 14)]);
  }
  const globe = (cx, cy, r, g, fill) => {
    glow(cx, cy, r * 1.7, C.cyan, 0.3);
    circle(cx, cy, r, C.sea);
    const rot = g * 0.35;
    for (const [la, lo, h] of land) {
      const x = Math.cos(la) * Math.sin(lo + rot), z = Math.cos(la) * Math.cos(lo + rot), y = Math.sin(la);
      if (z < 0) continue;
      const px = cx + x * r * 0.97, py = cy - y * r * 0.97;
      circle(px, py, r * 0.055 * (0.6 + z * 0.4), C.land);
      if (h < fill) { glow(px, py, r * 0.08, '#FF2E4D', 0.65); circle(px, py, r * 0.026, '#FFE0E4'); }
    }
    const sh = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r);
    sh.addColorStop(0, 'rgba(255,255,255,.2)'); sh.addColorStop(1, 'rgba(10,5,40,.45)');
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  };
  add(7, (t, d, g) => {
    space(g, { top: '#0B0A2A', bottom: '#2A1A7A', neb: '#5A2AD0', neb2: '#FF2E63' });
    const p1 = ease.io(prog(t, 0, 1.4)), p2 = ease.io(prog(t, 0.9, 3.0)), p3 = ease.io(prog(t, 2.4, 4.4));
    if (p1 < 1) glass(540, 900, lerp(1.4, 0.05, p1), g);
    if (p2 > 0 && p3 < 1) {
      ctx.save(); ctx.globalAlpha = Math.min(1, p2 * 3) * (1 - p3);
      const s = lerp(3.2, 0.35, p2);
      ctx.translate(540, 900); ctx.scale(s, s);
      for (let i = -6; i <= 6; i++) { rrect(i * 90 - 4, -600, 8, 1200, 4, 'rgba(255,255,255,.12)'); rrect(-600, i * 90 - 4, 1200, 8, 4, 'rgba(255,255,255,.12)'); }
      for (let i = 0; i < 260; i++) {
        const x = (hash(i, 31) - 0.5) * 1100, y = (hash(i, 32) - 0.5) * 1100;
        if (Math.hypot(x, y) > 560) continue;
        glow(x, y, 26, '#FF2E4D', 0.6); circle(x, y, 7, '#FFE0E4');
      }
      ctx.restore();
    }
    if (p3 > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, p3 * 2.5);
      globe(540, 900, lerp(1500, 340, p3), g, lerp(0.35, 1, ease.out(prog(t, 3.0, d - 0.6))));
      ctx.restore();
    }
    const f = ease.in(prog(t, 0.6, d - 0.7));
    const n = 9 + (2.2e9 - 9) * Math.pow(f, 2.2);
    text(fmt(n), 540, 340, 108, { color: C.yellow });
    text('porsiya / kun', 540, 432, 46, { color: C.cream, weight: 700 });
  });

  // 8. 9 dan 2,2 milliardgacha
  add(8, (t, d, g) => {
    space(g, RED);
    glass(400, 470, 0.6, g);
    text('9', 680, 470, 150, { color: C.yellow });
    const f = ease.io(prog(t, 0.5, 1.6));
    ctx.strokeStyle = C.white; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(540, 700); ctx.lineTo(540, 700 + 280 * f); ctx.stroke();
    if (f > 0.95) { ctx.beginPath(); ctx.moveTo(495, 945); ctx.lineTo(540, 990); ctx.lineTo(585, 945); ctx.stroke(); }
    const k = pop(t, wAt(8, 3) - 0.1, 0.5);
    if (k > 0) { glow(540, 1140, 420 * k, C.yellow, 0.4); ctx.save(); ctx.translate(540, 1140); ctx.scale(k, k); text('2 200 000 000', 0, 0, 112, { color: C.white }); ctx.restore(); }
  });

  // 9. Saboq
  add(9, (t, d, g) => {
    space(g, { top: '#FF4F8B', bottom: '#8E1F6B', neb: '#FFB0D0', neb2: '#C21E7A' });
    const k1 = pop(t, 0.05, 0.45), k2 = pop(t, wAt(9, 3) - 0.1, 0.45), k3 = pop(t, wAt(9, 5) - 0.1, 0.45);
    ctx.save(); ctx.translate(540, 700); ctx.scale(k1, k1); text('Birinchi natija —', 0, 0, 88, { color: C.white }); ctx.restore();
    ctx.save(); ctx.translate(540, 830); ctx.scale(k2, k2); text('hech qachon', 0, 0, 80, { color: C.cream }); ctx.restore();
    ctx.save(); ctx.translate(540, 965); ctx.scale(k3, k3); text('oxirgi natija emas.', 0, 0, 100, { color: C.yellow }); ctx.restore();
  });

  // 10. Savol va aylanma: hook'dagi kabi qizil fon va stakan
  add(10, (t, d, g) => {
    space(g, RED);
    header('SIZ HOZIR', 'NECHANCHI?', pop(t, 0.05, 0.45), 330);
    const bob = Math.sin(g * 1.8) * 10;
    glass(540, 900 + bob, 1.2, g);
    chip('stakandasiz', 540, 1250, pop(t, 0.5, 0.4), 0, 0, { w: 470, size: 62 });
    text('investage.uz', 540, 1790, 46, { color: C.yellow, alpha: prog(t, d - 1.6, d - 1.2) });
  });

  // ---------- tovush dizayni (s:nom = out/sfx/nom.mp3, Pixabay)
  const at = (i, k) => B[i] + wAt(i, k);
  for (let i = 1; i < B.length; i++) cue(Math.max(0, B[i] - 0.18), 's:whoosh', 0.3, 0.9 + (i % 3) * 0.08);
  cue(at(1, 0) + 0.05, 's:pop', 0.4, 0.8); cue(at(1, 0) + 0.5, 's:whoosh', 0.3, 1.4);
  cue(at(1, 2) + 0.05, 's:pop', 0.4, 0.8); cue(at(1, 2) + 0.5, 's:whoosh', 0.3, 1.4);
  cue(at(1, 5), 's:impact', 0.6); cue(at(1, 5) + 0.05, 's:coin', 0.4);
  cue(B[3] + 0.05, 's:pour', 0.55); cue(at(3, 2), 's:coin', 0.45);
  for (let i = 0; i < 9; i++) cue(at(3, 5) + 0.05 + i * 0.12, 's:pop', 0.3, 0.85 + i * 0.04);
  for (let i = 0; i < 5; i++) cue(at(3, 9) + i * 0.07, 's:coin', 0.26, 1 + i * 0.05);
  for (let i = 0; i < 7; i++) cue(B[4] + 0.35 + i * (dur(4) - 1) / 8, 's:whoosh', 0.16, 1.4);
  cue(B[5] + 0.05, 's:pop', 0.4); cue(at(5, 3), 's:whoosh', 0.35, 1.1); cue(at(5, 3) + 1.4, 's:pop', 0.4, 0.8);
  const st6 = (dur(6) - 2.2) / 8;
  for (let i = 0; i < 8; i++) cue(B[6] + 0.9 + i * st6, 's:pop', 0.26, 0.75 + i * 0.06);
  cue(B[6] + dur(6) - 2.6, 's:riser', 0.35); cue(B[6] + dur(6) - 1.5, 's:impact', 0.45);
  cue(B[7] + 0.2, 's:whoosh', 0.45, 0.7); cue(B[7] + 2.4, 's:whoosh', 0.4, 0.6);
  cue(at(8, 3) - 0.1, 's:impact', 0.5);
  cue(at(9, 5) - 0.1, 's:impact', 0.3);
  cue(B[10] + 0.1, 's:ice', 0.3); cue(B[10] + 0.5, 's:pop', 0.4);
};
