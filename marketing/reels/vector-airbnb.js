// 016: "7 investor «yo'q» degan startap" (Airbnb) — vektor animatsiya, 10 qator diktor bilan, ~37 s.
// Faktlar: Brian Chesky, "7 Rejections" (Medium, 2015) va 2020-yil 10-dekabr IPO kuni bahosi (~100,7 mlrd $, Reuters/CNBC).
// Airbnb logotipi chizilmaydi: umumiy uy belgisi. 014 xulosasi: asosiy raqam o'rtada (5-sahna), izoh savoli "ha/yo'q".
window.EPISODES.airbnb = function ({ scene, cue, spec }) {
  const LINES = [
    "Bu startapga 7 ta investor «yo'q» degan.",
    "Ular 150 ming dollar evaziga kompaniyaning 10 foizini olishlari mumkin edi.",
    "Lekin ulardan beshtasi rad etdi, ikkitasi javob ham bermadi.",
    "2008-yil. Startap — Airbnb.",
    "Airbnb — bu sayohatchilar mehmonxona o'rniga oddiy odamlarning uyini kunlik ijaraga oladigan sayt.",
    "12 yildan keyin esa, aksiyalari birjada sotila boshlagan kuni...",
    "Airbnb 100 milliard dollardan ortiq baholandi.",
    "1,5 milliondan — 100 milliardgacha.",
    "Investor «yo'q» desa — bu oxiri degani emas. Keyingisiga yozing.",
    "Siz o'sha paytda 150 ming dollar bergan bo'larmidingiz? Izohga «ha» yoki «yo'q» deb yozib qoldiring.",
  ];
  const DEF = [2.8, 4.2, 3.6, 3.4, 4.6, 3.6, 3.4, 3.2, 4.2, 5.4];
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
  const GREEN = '#2BD67B';
  const BLUE = { top: '#2E6BFF', bottom: '#1B2C9E', neb: '#7FB0FF', neb2: '#3A50D0' };
  const NIGHT = { top: '#0B0A2A', bottom: '#2A1A7A', neb: '#5A2AD0', neb2: '#FF2E63' };
  const CORAL = { top: '#FF5A6E', bottom: '#B0247A', neb: '#FFB0A0', neb2: '#E0247A' };
  const GOLD = { top: '#FFB21E', bottom: '#FF5A1E', neb: '#FFE27A', neb2: '#FF8A3D' };

  // Investor: kostyumli odamcha (tekis), s — o'lcham
  const investor = (x, y, s, suit, t, a, g, o = {}) => {
    const k = a === null ? 1 : pop(t, a, 0.4);
    if (k <= 0) return;
    const br = 1 + Math.sin(g * 2.4 + x * 0.01) * 0.025;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k * br);
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    rrect(-70, 0, 140, 170, 56, suit);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(0, 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(8, 8); ctx.lineTo(12, 64); ctx.lineTo(0, 80); ctx.lineTo(-12, 64); ctx.closePath(); ctx.fill();
    circle(0, -52, 52, o.skin || '#F2C9A0');
    rrect(-52, -108, 104, 34, 16, o.hair || '#3A2016');
    const blink = (g * 0.7 + x * 0.013) % 3 < 0.12 ? 0.15 : 1;
    ctx.save(); ctx.translate(0, -50); ctx.scale(1, blink); circle(-18, 0, 6.5, C.ink); circle(18, 0, 6.5, C.ink); ctx.restore();
    // og'iz: jiddiy chiziq
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, -26); ctx.lineTo(14, -26); ctx.stroke();
    ctx.restore();
  };
  // Muhr: kattadan "urilib" tushadi (k: 0..1 ko'rinish)
  const stamp = (label, x, y, k, color = C.red, o = {}) => {
    if (k <= 0) return;
    const s = lerp(2.4, 1, ease.out(Math.min(1, k * 1.25))) * (o.s || 1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot === undefined ? -0.22 : o.rot); ctx.scale(s, s);
    ctx.globalAlpha = Math.min(1, k * 2.5);
    const w = o.w || 190, h = o.h || 86;
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 16); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.beginPath(); ctx.roundRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 12); ctx.stroke();
    text(label, 0, 3, o.size || 56, { color, shadow: false });
    ctx.restore();
  };
  // Uy belgisi (umumiy, logotip emas)
  const house = (x, y, s, g, col = C.white) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    glow(0, 0, 330, C.yellow, 0.35);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-170, -10); ctx.lineTo(0, -170); ctx.lineTo(170, -10); ctx.lineTo(130, -10); ctx.lineTo(130, 150); ctx.lineTo(-130, 150); ctx.lineTo(-130, -10); ctx.closePath(); ctx.fill();
    rrect(-40, 40, 80, 110, 14, '#E0247A');
    const lit = 0.75 + 0.25 * Math.sin(g * 2);
    rrect(-105, 10, 52, 52, 8, hexA(C.yellow, lit)); rrect(53, 10, 52, 52, 8, hexA(C.yellow, lit));
    rrect(70, -140, 40, 80, 6, col);
    ctx.restore();
  };
  // Ulush doirasi: n bo'lak, ajralgan bo'lak 'pull' (0..1)
  const pie = (cx, cy, r, n, pull, g) => {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2;
      const f = i === 0 ? pull : 0;
      const dx = Math.cos(am) * f * 120, dy = Math.sin(am) * f * 120;
      ctx.save(); ctx.translate(cx + dx, cy + dy);
      if (i === 0 && f > 0) glow(Math.cos(am) * r * 0.6, Math.sin(am) * r * 0.6, 300 * f, C.yellow, 0.6);
      ctx.fillStyle = i === 0 ? C.yellow : (i % 2 ? '#6A8CFF' : '#4E6EF0');
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * (i === 0 ? 1 + f * 0.12 : 1), a0 + 0.015, a1 - 0.015); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.55, a0 + 0.015, a1 - 0.015); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  };
  // Xat (email) kartasi
  const mail = (x, y, s, k) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
    ctx.shadowColor = 'rgba(8,5,30,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    rrect(-95, -66, 190, 132, 18, C.white);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#B8C4F0'; ctx.lineWidth = 8; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-80, -50); ctx.lineTo(0, 10); ctx.lineTo(80, -50); ctx.stroke();
    ctx.restore();
  };
  const cross = (x, y, k, s = 1) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1.8, 1, ease.out(k)) * s, lerp(1.8, 1, ease.out(k)) * s);
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.strokeStyle = C.red; ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(50, 50); ctx.moveTo(50, -50); ctx.lineTo(-50, 50); ctx.stroke();
    ctx.restore();
  };
  const header = (small, big, k, y = 300, col = C.white, bigSize = 150) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(540, y); ctx.scale(k, k);
    text(small, 0, -110, 58, { color: C.yellow, letter: 8 });
    text(big, 0, 10, bigSize, { color: col });
    ctx.restore();
  };
  const SUITS = ['#1E2A5A', '#3A2A6A', '#24304F', '#4A2140', '#1F3B4D', '#2D2D3A', '#3B1F5A'];
  const SEATS = [[195, 760], [425, 760], [655, 760], [885, 760], [310, 1130], [540, 1130], [770, 1130]];

  // 0. HOOK: 7 ta investor, har biriga "YO'Q" muhri (1-kadrdan harakat)
  add(0, (t, d, g) => {
    space(g, BLUE);
    const z = lerp(1.06, 1, ease.out(prog(t, 0, 1.2)));
    ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
    header('7 TA INVESTOR', "«YO'Q»", lerp(0.85, 1, ease.back(prog(t, 0, 0.35))), 300, C.white, 170);
    const step = Math.min(0.3, (d - 0.6) / 7);
    SEATS.forEach(([x, y], i) => {
      investor(x, y, 0.82, SUITS[i], t, null, g);
      stamp("YO'Q", x, y + 70, prog(t, 0.12 + i * step, 0.3 + i * step), C.red, { s: 0.8, rot: -0.2 + hash(i, 5) * 0.3 });
    });
    ctx.restore();
  });
  cue(0, 's:impact', 0.55);
  { const step = Math.min(0.3, (dur(0) - 0.6) / 7); for (let i = 0; i < 7; i++) cue(0.12 + i * step, 's:impact', 0.22, 1.25 + i * 0.03); }

  // 1. 150 ming dollar = 10% ulush
  add(1, (t, d, g) => {
    space(g, { top: '#14C2B0', bottom: '#0A6E8A', neb: '#7FF0D8', neb2: '#0FB5A6' });
    const kp = pop(t, 0.05, 0.5);
    ctx.save(); ctx.translate(540, 900); ctx.scale(kp, kp); ctx.rotate(Math.sin(g * 0.5) * 0.03);
    pie(0, 0, 300, 10, ease.back(prog(t, wAt(1, 6), wAt(1, 6) + 0.5)), g);
    ctx.restore();
    const kl = pop(t, wAt(1, 6) + 0.15, 0.4);
    if (kl > 0) { ctx.save(); ctx.translate(740, 560); ctx.scale(kl, kl); rrect(-130, -70, 260, 140, 70, C.white); text('10%', 0, 4, 96, { color: '#0A6E8A', shadow: false }); ctx.restore(); }
    const kc = pop(t, wAt(1, 1) - 0.1, 0.45);
    if (kc > 0) {
      ctx.save(); ctx.translate(540, 330); ctx.scale(kc, kc);
      for (let i = 0; i < 6; i++) coin(-380 + i * 10, 20 - i * 16, 54, '$');
      text('$150 000', 60, 0, 130, { color: C.yellow });
      ctx.restore();
    }
  });

  // 2. 5 tasi rad etdi, 2 tasi javob bermadi
  add(2, (t, d, g) => {
    space(g, NIGHT);
    SEATS.forEach(([x, y], i) => {
      const yy = y - 120;
      mail(x, yy, 1, pop(t, 0.02 + i * 0.05, 0.35));
      if (i < 5) cross(x, yy, prog(t, wAt(2, 2) + i * 0.16, wAt(2, 2) + i * 0.16 + 0.22));
      else {
        const a = wAt(2, 5) + (i - 5) * 0.3, k = prog(t, a, a + 0.3);
        if (k > 0) {
          ctx.save(); ctx.globalAlpha = k;
          for (let j = 0; j < 3; j++) circle(x - 40 + j * 40, yy + 105, 13 * (0.7 + 0.3 * Math.abs(Math.sin(g * 3 + j))), '#B8C4F0');
          ctx.restore();
        }
      }
    });
    const k5 = pop(t, wAt(2, 4), 0.4), k2 = pop(t, wAt(2, 8), 0.4);
    if (k5 > 0) { ctx.save(); ctx.translate(330, 300); ctx.scale(k5, k5); text('5 × RAD', 0, 0, 92, { color: '#FF6B6B' }); ctx.restore(); }
    if (k2 > 0) { ctx.save(); ctx.translate(780, 300); ctx.scale(k2, k2); text('2 × JIM', 0, 0, 92, { color: '#B8C4F0' }); ctx.restore(); }
  });

  // 3. 2008 — Airbnb (startap nomi shu yerda ochiladi)
  add(3, (t, d, g) => {
    space(g, CORAL);
    const k = pop(t, 0.05, 0.4) * (1 - 0.25 * ease.io(prog(t, wAt(3, 1) - 0.2, wAt(3, 1) + 0.3)));
    ctx.save(); ctx.translate(540, lerp(560, 330, ease.io(prog(t, wAt(3, 1) - 0.2, wAt(3, 1) + 0.3)))); ctx.scale(k, k);
    rrect(-190, -130, 380, 260, 28, C.cream); rrect(-190, -130, 380, 70, 28, C.red); rrect(-190, -86, 380, 26, 0, C.red);
    text('2008', 0, 44, 124, { color: C.ink, shadow: false });
    ctx.restore();
    const kh = pop(t, wAt(3, 1), 0.5);
    if (kh > 0) house(540, 930 + Math.sin(g * 1.6) * 8, 1.1 * kh, g);
    const kn = pop(t, wAt(3, 3) - 0.05, 0.45);
    if (kn > 0) { ctx.save(); ctx.translate(540, 1270); ctx.scale(kn, kn); text('Airbnb', 0, 0, 150, { color: C.white }); ctx.restore(); }
  });

  // 4. Airbnb nima: mehmonxona o'rniga oddiy odamning uyi, kunlik ijara
  const hotel = (x, y, s, k, crossed) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
    rrect(-110, -260, 220, 400, 12, '#8A93B8'); rrect(-130, -280, 260, 40, 10, '#6E77A0');
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) rrect(-80 + c * 60, -220 + r * 66, 40, 42, 6, '#C9D0EA');
    rrect(-34, 80, 68, 60, 8, '#4A5278');
    text('HOTEL', 0, -310, 40, { color: C.white, letter: 6 });
    ctx.restore();
    if (crossed > 0) cross(x, y - 70 * s, crossed, 1.9 * s);
  };
  const traveler = (x, y, s, g, walk) => {
    const bob = Math.abs(Math.sin(g * 7)) * 10 * walk;
    ctx.save(); ctx.translate(x, y - bob); ctx.scale(s, s);
    rrect(-55, 0, 110, 150, 46, '#FF8A3D');
    circle(0, -48, 46, '#E8B48A'); rrect(-46, -98, 92, 30, 14, '#2A1A10');
    circle(-16, -46, 6, C.ink); circle(16, -46, 6, C.ink);
    ctx.restore();
    ctx.save(); ctx.translate(x + 85 * s, y + 70 * s); ctx.scale(s, s);
    rrect(-38, -20, 76, 110, 14, C.cyan); rrect(-14, -44, 28, 28, 8, 'rgba(0,0,0,0)');
    ctx.strokeStyle = '#1FA39A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-14, -20); ctx.lineTo(-14, -42); ctx.lineTo(14, -42); ctx.lineTo(14, -20); ctx.stroke();
    ctx.restore();
  };
  add(4, (t, d, g) => {
    space(g, { top: '#14C2B0', bottom: '#0A6E8A', neb: '#7FF0D8', neb2: '#0FB5A6' });
    const h0 = wAt(4, 4), h1 = wAt(4, 5), u = wAt(4, 6), kl = wAt(4, 9);
    hotel(250, 820, 0.95, pop(t, h0 - 0.1, 0.4), prog(t, h1, h1 + 0.25));
    const kh = pop(t, u - 0.1, 0.5);
    if (kh > 0) house(780, 760, 0.85 * kh, g);
    const f = ease.io(prog(t, 0.1, Math.max(1, u + 0.8)));
    traveler(lerp(-120, 640, f), 1060, 0.95, g, f < 1 ? 1 : 0);
    const kc = pop(t, kl - 0.1, 0.45);
    if (kc > 0) {
      ctx.save(); ctx.translate(540, 1370); ctx.scale(kc, kc);
      rrect(-300, -60, 600, 120, 60, C.white);
      text('KUNLIK IJARA', 0, 4, 62, { color: '#0A6E8A', shadow: false, letter: 3 });
      ctx.restore();
    }
    const kt = pop(t, 0.05, 0.4);
    if (kt > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(kt, kt); text('AIRBNB NIMA?', 0, 0, 104, { color: C.white }); ctx.restore(); }
  });

  // 5. 12 yil o'tdi: yillar sanaladi, birja grafigi ko'tariladi (taranglik)
  add(5, (t, d, g) => {
    space(g, NIGHT);
    const f = ease.io(prog(t, 0.1, d - 0.4));
    const yr = Math.round(lerp(2008, 2020, f));
    text(String(yr), 540, 330, 170, { color: yr === 2020 ? C.yellow : C.white });
    const kc = pop(t, wAt(5, 5) - 0.1, 0.4);
    if (kc > 0) { ctx.save(); ctx.translate(540, 470); ctx.scale(kc, kc); rrect(-200, -46, 400, 92, 46, GREEN); text('BIRJA · IPO', 0, 3, 50, { color: C.ink, shadow: false }); ctx.restore(); }
    // grafik
    ctx.save(); ctx.translate(0, 0);
    for (let i = 0; i <= 5; i++) rrect(100, 700 + i * 140, 880, 4, 2, 'rgba(255,255,255,.12)');
    const pts = []; const N = 60;
    for (let i = 0; i <= N; i++) { const u = i / N; pts.push([100 + u * 880, 1400 - Math.pow(u, 2.4) * 640 - Math.sin(u * 23) * 26 * (1 - u * 0.5)]); }
    const upto = Math.floor(f * N);
    ctx.strokeStyle = GREEN; ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); pts.slice(0, upto + 1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    if (upto > 0) { const [x, y] = pts[upto]; glow(x, y, 120, GREEN, 0.7); circle(x, y, 18, C.white); }
    ctx.restore();
  });

  // 6. ASOSIY RAQAM: 100 milliard dollardan ortiq (eng yorqin kadr)
  add(6, (t, d, g) => {
    space(g, GOLD);
    const a = wAt(6, 1) - 0.25;
    const f = ease.out(prog(t, a, a + 0.9));
    const boom = prog(t, a + 0.85, a + 1.3);
    glow(540, 860, 700 * (0.4 + boom * 0.6), C.white, 0.35 + 0.25 * boom);
    // tanga yomg'iri
    for (let i = 0; i < 26; i++) {
      const sp = 500 + hash(i, 41) * 500, ph = hash(i, 42) * 2;
      const y = ((t + ph) * sp) % 2200 - 200, x = hash(i, 43) * 1080 + Math.sin(t * 2 + i) * 30;
      if (y > 1380) continue;
      ctx.globalAlpha = 1 - prog(y, 1150, 1380);
      coin(x, y, 30 + hash(i, 44) * 24, '$', t * 3 + i);
      ctx.globalAlpha = 1;
    }
    const n = 1.5e6 + (1e11 - 1.5e6) * Math.pow(f, 2.5);
    const k = 1 + 0.12 * Math.sin(Math.min(1, boom) * Math.PI);
    ctx.save(); ctx.translate(540, 860); ctx.scale(k, k);
    rrect(-500, -110, 1000, 220, 60, 'rgba(90,20,0,.35)');
    text('$' + fmt(n), 0, 4, 100, { color: C.white });
    ctx.restore();
    const kp = pop(t, a + 0.95, 0.4);
    if (kp > 0) { ctx.save(); ctx.translate(540, 1080); ctx.scale(kp, kp); text('DAN ORTIQ', 0, 0, 84, { color: C.ink, shadow: false, letter: 6 }); ctx.restore(); }
    const kh = pop(t, 0.05, 0.4);
    if (kh > 0) { ctx.save(); ctx.translate(540, 330); ctx.scale(kh, kh); text('2020-YIL, 10-DEKABR', 0, -110, 54, { color: '#5A1A00', shadow: false, letter: 6 }); text('IPO', 0, 10, 140, { color: C.white }); ctx.restore(); }
  });

  // 7. 1,5 mln -> 100 mlrd taqqoslash
  add(7, (t, d, g) => {
    space(g, { top: '#5A2AD0', bottom: '#241070', neb: '#9B6BFF', neb2: '#3A1890' });
    const base = 1380;
    rrect(80, base, 920, 6, 3, 'rgba(255,255,255,.4)');
    const k1 = pop(t, 0.05, 0.4);
    if (k1 > 0) { ctx.save(); ctx.translate(290, base); ctx.scale(k1, k1); rrect(-80, -14, 160, 14, 4, C.cyan); text('$1,5 mln', 0, -70, 54, { color: C.white }); text('2008', 0, 60, 44, { color: C.cream, weight: 700 }); ctx.restore(); }
    const hb = ease.out(prog(t, wAt(7, 3) - 0.3, wAt(7, 3) + 0.6)) * 900;
    if (hb > 0) {
      glow(750, base - hb, 300, C.yellow, 0.5);
      rrect(650, base - hb, 200, hb, 14, C.yellow);
      text('$100 mlrd', 750, base - hb - 60, 64, { color: C.yellow });
      text('2020', 750, base + 60, 44, { color: C.cream, weight: 700 });
    }
    const kx = pop(t, d - 1.1, 0.45);
    if (kx > 0) { ctx.save(); ctx.translate(380, 520); ctx.scale(kx, kx); rrect(-210, -70, 420, 140, 70, C.white); text('≈ 67 000×', 0, 4, 72, { color: '#3A1890', shadow: false }); ctx.restore(); }
  });

  // 8. Saboq: eshiklar — "yo'q", "yo'q", ... oxirgisi "HA"
  add(8, (t, d, g) => {
    space(g, BLUE);
    header('«YO\'Q» —', 'OXIRI EMAS', pop(t, 0.05, 0.45), 320, C.white, 120);
    const ka = wAt(8, 8);
    for (let i = 0; i < 5; i++) {
      const x = 130 + i * 205, y = 1000;
      const kd = pop(t, 0.1 + i * 0.08, 0.35);
      if (kd <= 0) continue;
      ctx.save(); ctx.translate(x, y); ctx.scale(kd, kd);
      if (i < 4) {
        rrect(-80, -170, 160, 340, 14, '#1B2C9E'); rrect(-66, -156, 132, 312, 10, '#24369E'); circle(46, 10, 9, C.yellow);
        ctx.restore();
        stamp("YO'Q", x, y, prog(t, 0.4 + i * 0.22, 0.6 + i * 0.22), C.red, { s: 0.62, rot: -0.25 });
      } else {
        const op = ease.io(prog(t, ka - 0.1, ka + 0.6));
        glow(0, 0, 200 + 260 * op, C.yellow, 0.3 + 0.5 * op);
        rrect(-80, -170, 160, 340, 14, '#FFF4DC');
        ctx.save(); ctx.scale(1 - op * 0.85, 1); rrect(-80, -170, 160, 340, 14, '#1B2C9E'); ctx.restore();
        ctx.restore();
        stamp('HA', x, y - 260, pop(t, ka + 0.35, 0.4), '#13A85A', { s: 0.8, rot: 0.12, w: 150 });
      }
    }
  });

  // 9. Izoh savoli (bir so'zli javob) va aylanma: hook'dagi ko'k fon, investorlar
  add(9, (t, d, g) => {
    space(g, BLUE);
    SEATS.slice(0, 4).forEach(([x], i) => investor(x, 1240, 0.5, SUITS[i], t, null, g, { alpha: 0.55 }));
    header('$150 000 = 10%', 'SIZ BERARMIDINGIZ?', pop(t, 0.05, 0.45), 360, C.white, 84);
    const pa = pop(t, wAt(9, 9) - 0.1, 0.4), pb = pop(t, wAt(9, 11) - 0.1, 0.4);
    const beat = (ph) => 1 + 0.06 * Math.max(0, Math.sin(g * 6 + ph));
    if (pa > 0) { ctx.save(); ctx.translate(300, 760); ctx.scale(pa * beat(0), pa * beat(0)); rrect(-190, -100, 380, 200, 100, GREEN); text('HA', 0, 6, 110, { color: C.white }); ctx.restore(); }
    if (pb > 0) { ctx.save(); ctx.translate(780, 760); ctx.scale(pb * beat(3), pb * beat(3)); rrect(-190, -100, 380, 200, 100, C.red); text("YO'Q", 0, 6, 104, { color: C.white }); ctx.restore(); }
    const ka = prog(t, wAt(9, 8) - 0.1, wAt(9, 8) + 0.3);
    if (ka > 0) {
      ctx.save(); ctx.globalAlpha = ka; ctx.translate(540, 990 + Math.sin(g * 5) * 14);
      text('IZOHGA YOZING', 0, 0, 58, { color: C.yellow, letter: 4 });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, 150); ctx.moveTo(-36, 116); ctx.lineTo(0, 152); ctx.lineTo(36, 116); ctx.stroke();
      ctx.restore();
    }
    text('investage.uz', 540, 1790, 46, { color: C.yellow, alpha: prog(t, d - 1.6, d - 1.2) });
  });

  // ---------- tovush dizayni (s:nom = out/sfx/nom.mp3, Pixabay)
  const at = (i, k) => B[i] + wAt(i, k);
  for (let i = 1; i < B.length; i++) cue(Math.max(0, B[i] - 0.18), 's:whoosh', 0.3, 0.9 + (i % 3) * 0.08);
  cue(B[1] + 0.05, 's:pop', 0.4); cue(at(1, 1) - 0.1, 's:coin', 0.45);
  for (let i = 0; i < 4; i++) cue(at(1, 1) + i * 0.08, 's:coin', 0.22, 1 + i * 0.06);
  cue(at(1, 6), 's:pop', 0.5, 0.8);
  for (let i = 0; i < 7; i++) cue(B[2] + 0.02 + i * 0.05, 's:pop', 0.18, 1.1 + i * 0.04);
  for (let i = 0; i < 5; i++) cue(at(2, 2) + i * 0.16, 's:impact', 0.16, 1.4);
  cue(B[3] + 0.05, 's:pop', 0.4); cue(at(3, 1), 's:whoosh', 0.35, 0.8); cue(at(3, 3) - 0.05, 's:impact', 0.45);
  cue(at(4, 4) - 0.1, 's:pop', 0.4); cue(at(4, 5), 's:impact', 0.25, 1.3); cue(at(4, 6) - 0.1, 's:pop', 0.45, 0.85); cue(at(4, 9) - 0.1, 's:coin', 0.4);
  cue(B[5] + 0.1, 's:riser', 0.45);
  cue(at(6, 1) + 0.6, 's:impact', 0.7);
  for (let i = 0; i < 8; i++) cue(at(6, 1) + 0.6 + i * 0.09, 's:coin', 0.24, 0.9 + i * 0.05);
  cue(at(7, 3) - 0.3, 's:riser', 0.25, 1.4); cue(B[7] + dur(7) - 1.1, 's:pop', 0.45);
  for (let i = 0; i < 4; i++) cue(B[8] + 0.4 + i * 0.22, 's:impact', 0.14, 1.5);
  cue(at(8, 8) + 0.35, 's:impact', 0.4); cue(at(8, 8) + 0.35, 's:coin', 0.3, 1.2);
  cue(at(9, 9) - 0.1, 's:pop', 0.45); cue(at(9, 11) - 0.1, 's:pop', 0.45, 0.85);
};
