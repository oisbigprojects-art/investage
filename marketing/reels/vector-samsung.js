// 017: "Samsung birinchi nima sotgan?" — viktorina hook (A Telefon / B Televizor / C Ugra), vektor animatsiya, 10 qator diktor bilan.
// Faktlar: Wikipedia "Samsung" (1938, Tegu, ~40 ishchi, quritilgan baliq, oziq-ovqat va ugra; 1969 Samsung Electronics, oq-qora TV),
// Korea Times 2026-01-29 (2025 daromadi ~333,6 trln von). Samsung logotipi chizilmaydi.
(function () {
  const HOT = { top: '#FF3B4E', bottom: '#B0102C', neb: '#FF8A3D', neb2: '#FF2E63' };
  const SKY = { top: '#2E6BFF', bottom: '#1B2C9E', neb: '#7FB0FF', neb2: '#3A50D0' };
  const NIGHT = { top: '#0B0A2A', bottom: '#2A1A7A', neb: '#5A2AD0', neb2: '#FF2E63' };
  const GOLD = { top: '#FFB21E', bottom: '#FF5A1E', neb: '#FFE27A', neb2: '#FF8A3D' };
  const TEAL = { top: '#14C2B0', bottom: '#0A6E8A', neb: '#7FF0D8', neb2: '#0FB5A6' };
  const GREEN = '#2BD67B';

  // ---------- belgilar
  const header = (small, big, k, y = 300, col = C.white, bigSize = 120) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(540, y); ctx.scale(k, k);
    if (small) text(small, 0, -100, 56, { color: C.yellow, letter: 6 });
    text(big, 0, 10, bigSize, { color: col });
    ctx.restore();
  };
  // Variant chipi: harf + so'z; struck — chiziq, fall — tushib ketish, hi — yorug'lik
  const chip = (letter, word, x, y, k, o = {}) => {
    if (k <= 0) return;
    const struck = o.struck || 0, fall = o.fall || 0, hi = o.hi || 0;
    ctx.save();
    ctx.translate(x + fall * 60, y + ease.in(fall) * 900); ctx.rotate(fall * 0.9); ctx.scale(k, k);
    ctx.globalAlpha = 1 - prog(fall, 0.7, 1);
    const w = o.w || 300, h = 120;
    if (hi > 0) glow(0, 0, 320 * hi, C.yellow, 0.6 * hi);
    ctx.shadowColor = 'rgba(60,0,20,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rrect(-w / 2, -h / 2, w, h, 60, hi > 0.5 ? C.yellow : C.white);
    ctx.shadowColor = 'transparent';
    circle(-w / 2 + 62, 0, 40, '#B0102C');
    text(letter, -w / 2 + 62, 3, 52, { color: C.white, shadow: false });
    text(word, 36, 4, o.size || 54, { color: '#B0102C', shadow: false });
    if (struck > 0) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-w / 2 + 20, 0); ctx.lineTo(-w / 2 + 20 + (w - 40) * ease.out(struck), 0); ctx.stroke();
    }
    ctx.restore();
  };
  const CH = [['A', 'Telefon', 1020], ['B', 'Televizor', 1150], ['C', 'Ugra', 1280]];
  // Smartfon (umumiy, logotipsiz)
  const phone = (x, y, s, g, rot = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    glow(0, 0, 360, C.cyan, 0.35);
    rrect(-150, -300, 300, 600, 50, '#16122E');
    const sc = ctx.createLinearGradient(0, -270, 0, 270);
    sc.addColorStop(0, '#5A8CFF'); sc.addColorStop(1, '#C04BFF');
    rrect(-132, -280, 264, 560, 36, sc);
    rrect(-40, -266, 80, 20, 10, '#16122E');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) rrect(-96 + j * 72, -200 + i * 90, 50, 50, 14, hexA(C.white, 0.35 + 0.25 * Math.sin(g * 2 + i + j)));
    ctx.restore();
  };
  // Eski oq-qora televizor
  const tv = (x, y, s, g, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.glow !== false) glow(0, 0, 360, C.white, 0.25);
    ctx.strokeStyle = '#3A2A20'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, -190); ctx.lineTo(-110, -300); ctx.moveTo(30, -190); ctx.lineTo(110, -300); ctx.stroke();
    rrect(-230, -190, 460, 340, 40, '#8A5A3A');
    rrect(-200, -160, 300, 280, 50, '#2A2A2A');
    ctx.save(); ctx.beginPath(); ctx.roundRect(-188, -148, 276, 256, 44); ctx.clip();
    for (let i = 0; i < 70; i++) { const v = Math.floor(hash(i, Math.floor(g * 12)) * 200 + 40); ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(-188 + (i % 10) * 28, -148 + Math.floor(i / 10) * 37, 28, 37); }
    ctx.restore();
    circle(165, -90, 26, '#3A2A20'); circle(165, 0, 26, '#3A2A20');
    rrect(-200, 150, 30, 50, 8, '#3A2A20'); rrect(170, 150, 30, 50, 8, '#3A2A20');
    ctx.restore();
  };
  const fish = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(g * 3) * 0.12); ctx.scale(s, s);
    ctx.fillStyle = '#C98A4B';
    ctx.beginPath(); ctx.ellipse(0, 0, 150, 70, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(130, 0); ctx.lineTo(230, -70); ctx.lineTo(230, 70); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8E5A2A'; ctx.lineWidth = 7;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-20 + i * 40, 0, 46, -0.8, 0.8); ctx.stroke(); }
    circle(-95, -14, 14, C.white); circle(-95, -14, 7, C.ink);
    ctx.restore();
  };
  const carrot = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5 + Math.sin(g * 2.5) * 0.1); ctx.scale(s, s);
    ctx.fillStyle = '#3FCF8E';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(i * 26, -150, 22, 60, i * 0.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.orange;
    ctx.beginPath(); ctx.moveTo(-60, -100); ctx.lineTo(60, -100); ctx.lineTo(0, 170); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#D9651E'; ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-30 + i * 8, -40 + i * 60); ctx.lineTo(10 + i * 4, -40 + i * 60); ctx.stroke(); }
    ctx.restore();
  };
  // Ugra kosasi: bug' va tayoqchalar
  const bowl = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 3; i++) {
      const ph = (g * 0.6 + i / 3) % 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); for (let k = 0; k <= 10; k++) { const yy = -130 - ph * 120 - k * 12; const xx = -60 + i * 60 + Math.sin(k * 0.9 + g * 3 + i) * 14; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    }
    ctx.strokeStyle = '#FFE9A8'; ctx.lineWidth = 12;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); for (let k = 0; k <= 12; k++) { const xx = -160 + k * 27, yy = -40 + i * 6 + Math.sin(k * 1.3 + i * 1.7 + g * 2) * 12; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
    ctx.strokeStyle = '#8E5A2A'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(60, -40); ctx.lineTo(220, -230); ctx.moveTo(100, -30); ctx.lineTo(250, -200); ctx.stroke();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(-200, -30); ctx.lineTo(200, -30); ctx.quadraticCurveTo(190, 150, 0, 160); ctx.quadraticCurveTo(-190, 150, -200, -30); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-200, -30, 400, 22);
    rrect(-70, 150, 140, 30, 10, '#B0102C');
    ctx.restore();
  };
  const person = (x, y, s, color, name, t, a, g) => {
    const k = pop(t, a, 0.45);
    if (k <= 0) return;
    const br = 1 + Math.sin(g * 2.4 + x) * 0.025;
    ctx.save(); ctx.translate(x, y + 140 * s); ctx.scale(s * k, s * k * br); ctx.translate(0, -140);
    rrect(-60, -10, 120, 150, 50, color);
    circle(0, -60, 48, '#F2C9A0'); rrect(-48, -112, 96, 30, 14, '#1A1410');
    const blink = (g * 0.7 + x * 0.01) % 3 < 0.12 ? 0.15 : 1;
    ctx.save(); ctx.translate(0, -58); ctx.scale(1, blink); circle(-16, 0, 6, C.ink); circle(16, 0, 6, C.ink); ctx.restore();
    ctx.restore();
    if (name) text(name, x, y + 190 * s, 42, { color: C.white, weight: 700, alpha: k });
  };
  const calendar = (s, x, y, k) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    rrect(-190, -130, 380, 260, 28, C.cream); rrect(-190, -130, 380, 70, 28, C.red); rrect(-190, -86, 380, 26, 0, C.red);
    text(s, 0, 44, 124, { color: C.ink, shadow: false });
    ctx.restore();
  };
  const cross = (x, y, k) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1.8, 1, ease.out(k)) * 1.6, lerp(1.8, 1, ease.out(k)) * 1.6);
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.strokeStyle = C.white; ctx.lineWidth = 30; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(50, 50); ctx.moveTo(50, -50); ctx.lineTo(-50, 50); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(50, 50); ctx.moveTo(50, -50); ctx.lineTo(-50, 50); ctx.stroke();
    ctx.restore();
  };
window.EPISODES.samsung = function ({ scene, cue, spec }) {
  const LINES = [
    "Samsung birinchi bo'lib nima sotgan? Telefonmi, televizormi yoki ugra?",
    "Taxmin qiling — javob o'rtada.",
    "1938-yil, Koreya. 28 yoshli Li Byon Chol kichik savdo firmasini ochdi.",
    "Unda bor-yo'g'i 40 ta ishchi bor edi.",
    "Telefon ham, televizor ham emas.",
    "Ular quritilgan baliq, sabzavot va ugra sotishgan!",
    "Elektronikaga esa 31 yildan keyin o'tishdi — birinchisi oq-qora televizor edi.",
    "2025-yilda Samsung Electronics 200 milliard dollardan ortiq daromad qildi.",
    "Birinchi mahsulotingiz — oxirgisi emas.",
    "Siz qaysi birini tanlagandingiz? Izohga yozing: A, B yoki C.",
  ];
  // Ruscha subtitr (rusiyzabon investor va startapchilar uchun): har qatorning to'liq tarjimasi
  const RU = [
    'Что Samsung продавал самым первым? Телефоны, телевизоры или лапшу?',
    'Угадайте — ответ в середине.',
    '1938 год, Корея. 28-летний Ли Бён Чхоль открыл маленькую торговую фирму.',
    'В ней работало всего 40 человек.',
    'Не телефоны и не телевизоры.',
    'Они продавали сушёную рыбу, овощи и лапшу!',
    'В электронику пришли лишь через 31 год — первым был чёрно-белый телевизор.',
    'В 2025 году выручка Samsung Electronics превысила 200 млрд долларов.',
    'Ваш первый продукт — не последний.',
    'А вы что выбрали? Напишите в комментариях: A, B или C.',
  ];
  const DEF = [4.6, 2.4, 5.4, 2.8, 2.6, 3.6, 5.2, 4.8, 2.8, 4.6];
  const dur = (i) => (spec.durations && spec.durations[i]) || DEF[i];
  const words = (i) => (spec.timing && spec.timing[i]) || spread(LINES[i], 0.12, dur(i) - 0.25);
  const wAt = (i, k) => { const w = words(i); return w[Math.min(k, w.length - 1)][1]; };
  const B = [];
  let T = 0;
  const add = (i, draw, flags) => {
    const d = dur(i), w = words(i);
    B[i] = T;
    scene(d, (t, g) => { draw(t, d, g); subtitle(w, t, { ru: RU[i] }); }, flags);
    T += d;
  };

  // 0. HOOK: Samsung birinchi nima sotgan? (1-kadrdan smartfon va savol)
  add(0, (t, d, g) => {
    space(g, HOT);
    const z = lerp(1.06, 1, ease.out(prog(t, 0, 1.2)));
    ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
    header('SAMSUNG', 'BIRINCHI NIMA', lerp(0.88, 1, ease.back(prog(t, 0, 0.35))), 250, C.white, 104);
    text('SOTGAN?', 540, 380, 104, { color: C.yellow });
    phone(540, 720 + Math.sin(g * 1.8) * 12, 0.56, g, Math.sin(g * 1.3) * 0.12);
    for (let i = 0; i < 3; i++) {
      const an = g * 1.4 + i * 2.1;
      ctx.save(); ctx.translate(540 + Math.cos(an) * 300, 720 + Math.sin(an) * 140); ctx.rotate(Math.sin(g * 3 + i) * 0.3);
      text('?', 0, 0, 90 + i * 14, { color: [C.yellow, C.white, C.cream][i], alpha: 0.9 });
      ctx.restore();
    }
    const at = [wAt(0, 5), wAt(0, 6), wAt(0, 8)];
    CH.forEach(([l, w, y], k) => chip(l, w, 540, y, pop(t, Math.min(at[k], 0.5 + k * 0.35) - 0.05, 0.4), { w: 460 }));
    ctx.restore();
  });
  cue(0, 's:impact', 0.5);

  // 1. Taxmin qiling — javob o'rtada (qum soati)
  add(1, (t, d, g) => {
    space(g, HOT);
    header('', 'TAXMIN QILING', pop(t, 0.02, 0.35), 330, C.white, 100);
    const r = 150, f = prog(t, 0, d);
    ctx.save(); ctx.translate(540, 760);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.yellow; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
    text('?', 0, 6, 160, { color: C.white });
    ctx.restore();
    CH.forEach(([l, w, y], k) => chip(l, w, 540, y, 1, { w: 460, hi: 0.25 * Math.max(0, Math.sin(g * 6 - k * 1.2)) }));
  });

  // 2. 1938, Koreya: kichik savdo firmasi va asoschi
  add(2, (t, d, g) => {
    space(g, { top: '#2A1A8C', bottom: '#9B2FBF', neb: '#FF4F8B', neb2: '#5A2AD0' });
    const up = ease.io(prog(t, wAt(2, 4) - 0.3, wAt(2, 4) + 0.3));
    calendar('1938', 540, lerp(560, 300, up), pop(t, 0.05, 0.4) * (1 - 0.2 * up));
    if (t > wAt(2, 1) - 0.1) text('KOREYA', 540, lerp(740, 470, up), 60, { color: C.cream, letter: 8, alpha: prog(t, wAt(2, 1) - 0.1, wAt(2, 1) + 0.2) });
    person(330, 1080, 1, C.cyan, 'Li Byon Chol, 28 yosh', t, wAt(2, 4) - 0.1, g);
    const ks = pop(t, wAt(2, 7) - 0.1, 0.5);
    if (ks > 0) {
      ctx.save(); ctx.translate(760, 1060); ctx.scale(ks, ks);
      rrect(-170, -120, 340, 300, 14, '#FFF0D2'); rrect(-190, -170, 380, 70, 16, '#FFD27A');
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? C.white : C.red; ctx.fillRect(-170 + i * (340 / 6), -100, 340 / 6, 60); }
      rrect(-130, -20, 140, 120, 10, '#FFD98A'); glow(-60, 40, 160, C.yellow, 0.45);
      rrect(40, -20, 90, 200, 10, '#B0552C');
      text('SAVDO', 0, -135, 40, { color: '#A8321E', shadow: false, letter: 6 });
      ctx.restore();
    }
  });

  // 3. 40 ta ishchi
  add(3, (t, d, g) => {
    space(g, NIGHT);
    const a = wAt(3, 2) - 0.2;
    for (let i = 0; i < 40; i++) {
      const k = pop(t, a + i * 0.025, 0.3);
      if (k <= 0) continue;
      const x = 180 + (i % 8) * 103, y = 640 + Math.floor(i / 8) * 150;
      ctx.save(); ctx.translate(x, y + Math.sin(g * 3 + i) * 4); ctx.scale(k, k);
      circle(0, -34, 22, '#F2C9A0'); rrect(-28, -8, 56, 64, 22, [C.cyan, C.pink, C.yellow, C.orange][i % 4]);
      ctx.restore();
    }
    const n = Math.round(40 * ease.out(prog(t, a, a + 1.0)));
    const kn = prog(t, a, a + 0.2);
    text(String(n), 540, 360, 200, { color: C.yellow, alpha: kn });
    text('ishchi', 540, 490, 60, { color: C.cream, weight: 700, alpha: kn });
  });

  // 4. Telefon ham, televizor ham emas: A va B chiziladi va tushib ketadi
  add(4, (t, d, g) => {
    space(g, HOT);
    header('', 'TO\'G\'RI JAVOB?', pop(t, 0.02, 0.35), 330, C.white, 100);
    phone(300, 760, 0.38, g, -0.2);
    tv(780, 780, 0.5, g, { glow: false });
    const a0 = wAt(4, 0), a1 = wAt(4, 2);
    if (t > a0) cross(300, 760, prog(t, a0, a0 + 0.25));
    if (t > a1) cross(780, 780, prog(t, a1, a1 + 0.25));
    chip('A', 'Telefon', 540, 1020, 1, { w: 460, struck: prog(t, a0, a0 + 0.3), fall: prog(t, a0 + 0.5, a0 + 1.2) });
    chip('B', 'Televizor', 540, 1150, 1, { w: 460, struck: prog(t, a1, a1 + 0.3), fall: prog(t, a1 + 0.5, a1 + 1.2) });
    chip('C', 'Ugra', 540, 1280, 1, { w: 460, hi: 0.4 + 0.3 * Math.sin(g * 6) });
  });

  // 5. JAVOB: quritilgan baliq, sabzavot va ugra (eng yorqin kadr)
  add(5, (t, d, g) => {
    space(g, GOLD);
    const a = wAt(5, 0);
    const boom = prog(t, a, a + 0.5);
    glow(540, 800, 800 * (0.3 + boom * 0.7), C.white, 0.3 + 0.2 * boom);
    for (let i = 0; i < 16; i++) {
      const an = (i / 16) * Math.PI * 2, r = 120 + 520 * ease.out(prog(t, a, a + 0.8));
      ctx.globalAlpha = 1 - prog(t, a + 0.4, a + 0.9);
      circle(540 + Math.cos(an) * r, 300 + Math.sin(an) * r, 14, [C.yellow, C.white, C.cream][i % 3]);
    }
    ctx.globalAlpha = 1;
    const kc = ease.back(prog(t, a - 0.1, a + 0.4));
    ctx.save(); ctx.translate(540, 300); ctx.scale(lerp(1, 1.5, kc), lerp(1, 1.5, kc));
    chip('C', 'Ugra', 0, 0, 1, { w: 460, hi: 1 });
    ctx.restore();
    const kf1 = pop(t, wAt(5, 2) - 0.1, 0.45), kf2 = pop(t, wAt(5, 3) - 0.1, 0.45), kf3 = pop(t, wAt(5, 5) - 0.1, 0.5);
    if (kf1 > 0) { fish(290, 720, 0.85 * kf1, g); text('baliq', 290, 860, 52, { color: C.ink, shadow: false, alpha: kf1 }); }
    if (kf2 > 0) { carrot(800, 700, 0.75 * kf2, g); text('sabzavot', 800, 860, 52, { color: C.ink, shadow: false, alpha: kf2 }); }
    if (kf3 > 0) { bowl(540, 1090, 0.95 * kf3, g); text('UGRA', 540, 1325, 90, { color: C.white, alpha: kf3 }); }
  });

  // 6. 31 yildan keyin: 1938 -> 1969, oq-qora televizor
  add(6, (t, d, g) => {
    space(g, SKY);
    const a = wAt(6, 2) - 0.2;
    const yr = Math.round(lerp(1938, 1969, ease.io(prog(t, a, a + 1.1))));
    calendar(String(yr), 540, 360, pop(t, 0.05, 0.4));
    const kp = pop(t, a + 0.3, 0.4);
    if (kp > 0) { ctx.save(); ctx.translate(540, 560); ctx.scale(kp, kp); rrect(-150, -50, 300, 100, 50, C.yellow); text('+31 YIL', 0, 4, 58, { color: C.ink, shadow: false }); ctx.restore(); }
    const kt = pop(t, wAt(6, 7) - 0.1, 0.5);
    if (kt > 0) tv(540, 1080 + Math.sin(g * 1.6) * 8, 1.05 * kt, g);
  });

  // 7. 2025: 200 milliard dollardan ortiq daromad
  add(7, (t, d, g) => {
    space(g, TEAL);
    const a = wAt(7, 1);
    const f = ease.out(prog(t, a, wAt(7, 4) + 0.2));
    const boom = prog(t, wAt(7, 4) + 0.1, wAt(7, 4) + 0.6);
    glow(540, 880, 700 * (0.4 + boom * 0.6), C.white, 0.3 + 0.2 * boom);
    for (let i = 0; i < 22; i++) {
      const sp = 500 + hash(i, 41) * 500, ph = hash(i, 42) * 2;
      const y = ((t + ph) * sp) % 2200 - 200, x = hash(i, 43) * 1080 + Math.sin(t * 2 + i) * 30;
      if (y > 1380) continue;
      ctx.globalAlpha = (1 - prog(y, 1150, 1380)) * prog(t, a, a + 0.4);
      coin(x, y, 30 + hash(i, 44) * 24, '$', t * 3 + i);
      ctx.globalAlpha = 1;
    }
    const n = 2e11 * Math.pow(f, 2.2);
    const k = 1 + 0.12 * Math.sin(Math.min(1, boom) * Math.PI);
    ctx.save(); ctx.translate(540, 880); ctx.scale(k, k);
    rrect(-500, -110, 1000, 220, 60, 'rgba(0,40,60,.35)');
    text('$' + fmt(n), 0, 4, 100, { color: C.white });
    ctx.restore();
    const kp = pop(t, wAt(7, 4) + 0.3, 0.4);
    if (kp > 0) { ctx.save(); ctx.translate(540, 1100); ctx.scale(kp, kp); text('DAN ORTIQ · 1 YILDA', 0, 0, 66, { color: C.ink, shadow: false, letter: 4 }); ctx.restore(); }
    header('SAMSUNG ELECTRONICS', '2025', pop(t, 0.05, 0.4), 330, C.white, 150);
  });

  // 8. Saboq: ugra -> televizor -> smartfon
  add(8, (t, d, g) => {
    space(g, { top: '#FF4F8B', bottom: '#8E1F6B', neb: '#FFB0D0', neb2: '#C21E7A' });
    header('', 'OXIRGISI EMAS', pop(t, wAt(8, 3) - 0.1, 0.45), 330, C.yellow, 110);
    text('Birinchi mahsulot —', 540, 200, 64, { color: C.white, alpha: prog(t, 0.05, 0.3) });
    const s1 = pop(t, 0.1, 0.4), s2 = pop(t, wAt(8, 1), 0.4), s3 = pop(t, wAt(8, 3) - 0.1, 0.45);
    if (s1 > 0) bowl(200, 920, 0.5 * s1, g);
    if (s2 > 0) tv(540, 920, 0.48 * s2, g, { glow: false });
    if (s3 > 0) phone(880, 900, 0.42 * s3, g);
    ctx.strokeStyle = C.white; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const arrow = (x, k) => { if (k <= 0) return; ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(x - 40, 1180); ctx.lineTo(x + 40, 1180); ctx.moveTo(x + 14, 1156); ctx.lineTo(x + 40, 1180); ctx.lineTo(x + 14, 1204); ctx.stroke(); ctx.globalAlpha = 1; };
    arrow(370, s2); arrow(710, s3);
    [['1938', 200, s1], ['1969', 540, s2], ['bugun', 880, s3]].forEach(([s, x, k]) => k > 0 && text(s, x, 1270, 48, { color: C.cream, weight: 700, alpha: Math.min(1, k) }));
  });

  // 9. Izoh savoli (bitta harf) va aylanma: hook'dagi qizil fon va smartfon
  add(9, (t, d, g) => {
    space(g, HOT);
    header('SIZ QAYSI BIRINI', 'TANLAGANDINGIZ?', pop(t, 0.05, 0.45), 300, C.white, 92);
    const beat = (ph) => 1 + 0.05 * Math.max(0, Math.sin(g * 6 + ph));
    const ka = prog(t, wAt(9, 4) - 0.1, wAt(9, 4) + 0.3);
    if (ka > 0) {
      ctx.save(); ctx.globalAlpha = ka; ctx.translate(540, 560 + Math.sin(g * 5) * 12);
      text('IZOHGA YOZING', 0, 0, 62, { color: C.yellow, letter: 4 });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, 150); ctx.moveTo(-36, 116); ctx.lineTo(0, 152); ctx.lineTo(36, 116); ctx.stroke();
      ctx.restore();
    }
    const at = [wAt(9, 6), wAt(9, 7), wAt(9, 9)];
    CH.forEach(([l, w], k) => { const kk = pop(t, Math.min(at[k], d - 1) - 0.1, 0.4) * beat(k * 1.5); chip(l, w, 540, 900 + k * 150, kk, { w: 460 }); });
    text('investage.uz', 540, 1790, 46, { color: C.yellow, alpha: prog(t, d - 1.6, d - 1.2) });
  });

  // ---------- tovush dizayni (s:nom = out/sfx/nom.mp3, Pixabay)
  const at = (i, k) => B[i] + wAt(i, k);
  for (let i = 1; i < B.length; i++) if (i !== 1) cue(Math.max(0, B[i] - 0.18), 's:whoosh', 0.3, 0.9 + (i % 3) * 0.08);
  [5, 6, 8].forEach((k, j) => cue(Math.min(at(0, k), 0.5 + j * 0.35) - 0.05, 's:pop', 0.5, 0.9 + j * 0.1));
  cue(B[1] + 0.05, 's:riser', 0.3, 1.3);
  cue(B[2] + 0.05, 's:pop', 0.4); cue(at(2, 4) - 0.1, 's:pop', 0.4, 0.8); cue(at(2, 7) - 0.1, 's:whoosh', 0.3, 1.2);
  for (let i = 0; i < 10; i++) cue(at(3, 2) - 0.2 + i * 0.1, 's:pop', 0.16, 1 + i * 0.05);
  cue(at(4, 0), 's:impact', 0.3, 1.3); cue(at(4, 0) + 0.5, 's:whoosh', 0.3, 1.4);
  cue(at(4, 2), 's:impact', 0.3, 1.3); cue(at(4, 2) + 0.5, 's:whoosh', 0.3, 1.4);
  cue(B[5] - 0.6, 's:riser', 0.35);
  cue(at(5, 0), 's:impact', 0.7); cue(at(5, 2) - 0.1, 's:pop', 0.45); cue(at(5, 3) - 0.1, 's:pop', 0.45, 0.9); cue(at(5, 5) - 0.1, 's:pop', 0.5, 0.8);
  cue(at(6, 2) - 0.2, 's:whoosh', 0.35, 0.8); cue(at(6, 7) - 0.1, 's:pop', 0.45, 0.8);
  cue(at(7, 1), 's:riser', 0.3, 1.2); cue(at(7, 4) + 0.1, 's:impact', 0.6);
  for (let i = 0; i < 8; i++) cue(at(7, 4) + 0.1 + i * 0.09, 's:coin', 0.24, 0.9 + i * 0.05);
  cue(B[8] + 0.1, 's:pop', 0.35); cue(at(8, 1), 's:pop', 0.35, 0.9); cue(at(8, 3) - 0.1, 's:impact', 0.35);
  [6, 7, 9].forEach((k, j) => cue(Math.min(at(9, k), B[9] + dur(9) - 1) - 0.1, 's:pop', 0.45, 0.9 + j * 0.1));
};
  // ================= 021: Samsung, 30 soniyalik versiya (020 va 021 tanqidlari bo'yicha) =================
  // Uch variant ham kutilmagan (shakar — Samsung 1953-yilda Cheil Jedang shakar zavodini ochgan, ugra — to'g'ri javob,
  // televizor); izohga chaqiriq JAVOBDAN OLDIN; hamma o'tish tiniq kesim (ghost yo'q); subtitr markazda 66 px;
  // pastki band katta rasm bilan to'la; "daromad" emas "tushum"; oxirida keyingi savol (Nokia) va loop.
  // Vizual zonalar: tepada 120–900, subtitr ~960–1190, pastki band 1210–1440.
  window.EPISODES.samsung30 = function ({ scene, cue, spec }) {
    const LINES = [
      "Samsung birinchi nima sotgan, deb o'ylaysiz?",
      "Shakarmi, ugrami yoki televizormi?",
      "Javobni ko'rishdan oldin esa, o'z fikringizni izohga yozib qoldiring.",
      "1938-yil, Koreya. 40 ta ishchili kichik do'kon.",
      "Shakar ham, televizor ham emas.",
      "Ular quritilgan baliq, sabzavot va ugra sotishgan.",
      "Shakarni 1953-yilda, elektronikaga 1969-yilda o'tishgan.",
      "2025-yilda tushum — 200 milliard dollardan ortiq.",
      "Birinchi mahsulot — oxirgisi degani emas.",
      "Endi esa siz: Nokia birinchi bo'lib nima sotgan, deb taxmin qilib ko'ring.",
    ];
    const DEF = [2.2, 2.4, 2.6, 3.4, 2.4, 3.2, 3.6, 3.2, 2.6, 3.0];
    const SUB = { y: 1075, size: 66 };
    const dur = (i) => (spec.durations && spec.durations[i]) || DEF[i];
    const words = (i) => (spec.timing && spec.timing[i]) || spread(LINES[i], 0.12, dur(i) - 0.25);
    const wAt = (i, k) => { const w = words(i); return w[Math.min(k, w.length - 1)][1]; };
    const B = [];
    let T = 0;
    // hamma o'tish tiniq kesim; yangi sahna boshida qisqa "zarb" zoom (davom etayotgan hook sahnasida yo'q)
    const add = (i, draw, punch = true) => {
      const d = dur(i), w = words(i);
      B[i] = T;
      scene(d, (t, g) => {
        const z = punch ? lerp(1.06, 1, ease.out(prog(t, 0, 0.3))) : 1;
        ctx.save(); ctx.translate(540, 700); ctx.scale(z, z); ctx.translate(-540, -700);
        draw(t, d, g);
        ctx.restore();
        subtitle(w, t, SUB);
      }, { cut: true });
      T += d;
    };
    const at = (i, k) => B[i] + wAt(i, k);
    const bump = (t, a) => Math.sin(Math.PI * prog(t, a - 0.05, a + 0.35));
    const CHR = [['A', 'Shakar', 500], ['B', 'Ugra', 630], ['C', 'Televizor', 760]];
    const PINK = { top: '#FF4F8B', bottom: '#8E1F6B', neb: '#FFB0D0', neb2: '#C21E7A' };
    const PURPLE = { top: '#2A1A8C', bottom: '#9B2FBF', neb: '#FF4F8B', neb2: '#5A2AD0' };
    const BLUE2 = { top: '#2E6BFF', bottom: '#14205A', neb: '#7FB0FF', neb2: '#2E6BFF' };
    const shop = (x, y, s) => {
      if (s <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      rrect(-170, -120, 340, 300, 14, '#FFF0D2'); rrect(-190, -170, 380, 70, 16, '#FFD27A');
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? C.white : C.red; ctx.fillRect(-170 + i * (340 / 6), -100, 340 / 6, 60); }
      rrect(-130, -20, 140, 120, 10, '#FFD98A'); rrect(40, -20, 90, 200, 10, '#B0552C');
      text('SAVDO', 0, -135, 40, { color: '#A8321E', shadow: false, letter: 6 });
      ctx.restore();
    };
    // Shakar qopi va kubiklari
    const sugar = (x, y, s, g) => {
      if (s <= 0) return;
      ctx.save(); ctx.translate(x, y + Math.sin(g * 2) * 5); ctx.scale(s, s);
      ctx.fillStyle = '#F4E9D2';
      ctx.beginPath(); ctx.moveTo(-120, -110); ctx.quadraticCurveTo(-160, 60, -130, 160); ctx.lineTo(130, 160); ctx.quadraticCurveTo(160, 60, 120, -110); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#E2D3B4'; ctx.beginPath(); ctx.moveTo(-120, -110); ctx.lineTo(120, -110); ctx.lineTo(70, -170); ctx.lineTo(-70, -170); ctx.closePath(); ctx.fill();
      rrect(-90, -132, 180, 26, 12, C.red);
      text('SHAKAR', 0, 40, 46, { color: '#8E5A2A', shadow: false, letter: 3 });
      [[-170, 150], [175, 140], [205, 90]].forEach(([cx, cy], i) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.3 * i - 0.2); rrect(-28, -28, 56, 56, 8, C.white); rrect(-28, -28, 56, 14, 6, '#E6ECFF'); ctx.restore(); });
      ctx.restore();
    };
    const tag = (s, x, y, k, bg, fg, size = 54) => {
      if (k <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      ctx.font = `800 ${size}px ${FONT}`;
      const w = ctx.measureText(s).width + 70;
      rrect(-w / 2, -size * 0.85, w, size * 1.7, size * 0.85, bg);
      text(s, 0, 3, size, { color: fg, shadow: false });
      ctx.restore();
    };
    // Hook kadri: 0-soniyada savol va uchta variant, pastda katta rasmlar
    const hook = (t, g, hi = [0, 0, 0]) => {
      space(g, HOT);
      text('SAMSUNG', 540, 170, 62, { color: C.yellow, letter: 8 });
      text('BIRINCHI NIMA', 540, 270, 100, { color: C.white });
      text('SOTGAN?', 540, 375, 100, { color: C.white });
      CHR.forEach(([l, w, y], k) => chip(l, w, 540, y, 1 + 0.1 * hi[k], { w: 460, hi: hi[k] }));
      const big = (k) => 1 + 0.15 * hi[k];
      sugar(200, 1335, 0.52 * big(0), g);
      bowl(540, 1350, 0.55 * big(1), g);
      tv(880, 1345, 0.42 * big(2), g, { glow: false });
    };

    // 0–1. Savol + variantlar (1-qatorda har variant aytilganda yonadi); 0→1 o'tishda zoom yo'q
    add(0, (t, d, g) => hook(t, g));
    add(1, (t, d, g) => hook(t, g, [bump(t, wAt(1, 0)), bump(t, wAt(1, 1)), bump(t, wAt(1, 3))]), false);

    // 2. Izohga chaqiriq javobdan OLDIN
    add(2, (t, d, g) => {
      space(g, BLUE2);
      const kb = pop(t, 0.02, 0.45);
      if (kb > 0) {
        ctx.save(); ctx.translate(540, 470 + Math.sin(g * 2) * 8); ctx.scale(kb, kb);
        glow(0, 0, 380, C.yellow, 0.35);
        ctx.fillStyle = C.white; ctx.beginPath(); ctx.roundRect(-300, -170, 600, 320, 80); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-150, 130); ctx.lineTo(-210, 250); ctx.lineTo(-50, 140); ctx.closePath(); ctx.fill();
        ['A', 'B', 'C'].forEach((l, i) => text(l, -170 + i * 170, -6 - 18 * Math.max(0, Math.sin(g * 6 - i * 0.9)), 130, { color: '#B0102C', shadow: false }));
        ctx.restore();
      }
      tag('JAVOBDAN OLDIN', 540, 800, pop(t, wAt(2, 1) - 0.1, 0.4), C.yellow, C.ink, 54);
      const ki = pop(t, wAt(2, 6) - 0.1, 0.45);
      if (ki > 0) { ctx.save(); ctx.translate(540, 1320); ctx.scale(ki, ki); text('IZOHGA YOZING', 0, 0, 96, { color: C.yellow, letter: 3 }); ctx.restore(); }
    });

    // 3. 1938-yil, Koreya; 40 ta ishchi, kichik do'kon
    add(3, (t, d, g) => {
      space(g, PURPLE);
      const a = wAt(3, 2) - 0.15;
      calendar('1938', 540, 250, pop(t, 0.02, 0.4));
      tag('KOREYA', 300, 430, pop(t, wAt(3, 1) - 0.1, 0.4), C.cream, '#2A1A8C', 52);
      for (let i = 0; i < 40; i++) {
        const k = pop(t, a + i * 0.02, 0.3);
        if (k <= 0) continue;
        const x = 180 + (i % 8) * 103, y = 580 + Math.floor(i / 8) * 75;
        ctx.save(); ctx.translate(x, y + Math.sin(g * 3 + i) * 3); ctx.scale(k * 0.7, k * 0.7);
        circle(0, -34, 22, '#F2C9A0'); rrect(-28, -8, 56, 64, 22, [C.cyan, C.pink, C.yellow, C.orange][i % 4]);
        ctx.restore();
      }
      const kn = prog(t, a, a + 0.2);
      if (kn > 0) tag(Math.round(40 * ease.out(prog(t, a, a + 0.9))) + ' ishchi', 780, 430, 1, C.yellow, C.ink, 52);
      shop(540, 1330, 0.62 * pop(t, wAt(3, 5) - 0.1, 0.45));
    });

    // 4. Shakar ham, televizor ham emas
    add(4, (t, d, g) => {
      space(g, HOT);
      text("TO'G'RI JAVOB?", 540, 200, 92, { color: C.white });
      sugar(300, 560, 0.75, g);
      tv(780, 590, 0.55, g, { glow: false });
      const a0 = wAt(4, 0), a1 = wAt(4, 2);
      if (t > a0) cross(300, 560, prog(t, a0, a0 + 0.25));
      if (t > a1) cross(780, 590, prog(t, a1, a1 + 0.25));
      chip('B', 'Ugra', 540, 1320, 1.15, { w: 460, hi: 0.4 + 0.3 * Math.sin(g * 6) });
    });

    // 5. JAVOB (o'rtada): baliq, sabzavot, ugra
    add(5, (t, d, g) => {
      space(g, GOLD);
      const boom = prog(t, 0, 0.5);
      glow(540, 500, 800 * (0.3 + boom * 0.7), C.white, 0.3 + 0.2 * boom);
      for (let i = 0; i < 16; i++) {
        const an = (i / 16) * Math.PI * 2, r = 120 + 520 * ease.out(prog(t, 0, 0.8));
        ctx.globalAlpha = 1 - prog(t, 0.4, 0.9);
        circle(540 + Math.cos(an) * r, 220 + Math.sin(an) * r, 14, [C.yellow, C.white, C.cream][i % 3]);
      }
      ctx.globalAlpha = 1;
      const kc = ease.back(prog(t, 0, 0.45));
      ctx.save(); ctx.translate(540, 220); ctx.scale(lerp(1, 1.4, kc), lerp(1, 1.4, kc)); chip('B', 'Ugra', 0, 0, 1, { w: 460, hi: 1 }); ctx.restore();
      const kf1 = pop(t, wAt(5, 2) - 0.1, 0.45), kf2 = pop(t, wAt(5, 3) - 0.1, 0.45), kf3 = pop(t, wAt(5, 5) - 0.1, 0.5);
      if (kf1 > 0) { fish(280, 580, 0.75 * kf1, g); text('baliq', 280, 720, 52, { color: C.ink, shadow: false, alpha: kf1 }); }
      if (kf2 > 0) { carrot(800, 560, 0.62 * kf2, g); text('sabzavot', 800, 720, 52, { color: C.ink, shadow: false, alpha: kf2 }); }
      if (kf3 > 0) bowl(540, 1350, 0.68 * kf3, g);
    });

    // 6. Shakar 1953, elektronika 1969
    add(6, (t, d, g) => {
      space(g, SKY);
      const k1 = pop(t, wAt(6, 0) - 0.1, 0.4), k2 = pop(t, wAt(6, 2) - 0.1, 0.4);
      calendar('1953', 290, 280, 0.75 * pop(t, wAt(6, 1) - 0.15, 0.4));
      sugar(290, 640, 0.8 * k1, g);
      calendar('1969', 790, 280, 0.75 * pop(t, wAt(6, 3) - 0.15, 0.4));
      if (k2 > 0) tv(790, 660, 0.6 * k2, g);
      text('1938 → 1953 → 1969', 540, 1330, 64, { color: C.cream, alpha: prog(t, 0.1, 0.4) });
    });

    // 7. 2025: tushum 200 milliard dollardan ortiq
    add(7, (t, d, g) => {
      space(g, TEAL);
      const a = wAt(7, 3) - 0.2, a2 = wAt(7, 6);
      const f = ease.out(prog(t, a, a2 + 0.2)), boom = prog(t, a2 + 0.1, a2 + 0.6);
      glow(540, 560, 700 * (0.4 + boom * 0.6), C.white, 0.3 + 0.2 * boom);
      for (let i = 0; i < 18; i++) {
        const sp = 500 + hash(i, 41) * 500, ph = hash(i, 42) * 2;
        const y = ((t + ph) * sp) % 640 + 360, x = hash(i, 43) * 1080 + Math.sin(t * 2 + i) * 30;
        ctx.globalAlpha = prog(y, 360, 420) * (1 - prog(y, 860, 1000)) * prog(t, a, a + 0.4);
        if (ctx.globalAlpha > 0.02) coin(x, y, 28 + hash(i, 44) * 22, '$', t * 3 + i);
        ctx.globalAlpha = 1;
      }
      text('SAMSUNG ELECTRONICS', 540, 170, 50, { color: C.cream, letter: 4 });
      text('2025', 540, 285, 140, { color: C.white });
      const k = (1 + 0.12 * Math.sin(Math.min(1, boom) * Math.PI)) * pop(t, a - 0.1, 0.35);
      if (k > 0) { ctx.save(); ctx.translate(540, 560); ctx.scale(k, k);
      rrect(-500, -100, 1000, 200, 60, 'rgba(0,40,60,.45)');
      text('$' + fmt(2e11 * Math.pow(f, 2.2)), 0, 4, 92, { color: C.white });
      ctx.restore(); }
      tag('TUSHUM · 1 YILDA', 540, 750, pop(t, wAt(7, 1) - 0.1, 0.4), C.white, '#0A6E8A', 50);
      tag('DAN ORTIQ', 540, 1320, pop(t, a2 - 0.1, 0.45), C.yellow, C.ink, 72);
    });

    // 8. Saboq (payoff): ugra → televizor → smartfon
    add(8, (t, d, g) => {
      space(g, PINK);
      text('Birinchi mahsulot —', 540, 170, 62, { color: C.white });
      const s1 = pop(t, 0.05, 0.35), s2 = pop(t, 0.35, 0.35), s3 = pop(t, 0.65, 0.4);
      const ke = pop(t, wAt(8, 3) - 0.1, 0.45);
      if (ke > 0) { ctx.save(); ctx.translate(540, 280); ctx.scale(ke, ke); text('OXIRGISI EMAS', 0, 0, 104, { color: C.yellow }); ctx.restore(); }
      if (s1 > 0) bowl(200, 640, 0.45 * s1, g);
      if (s2 > 0) tv(540, 640, 0.45 * s2, g, { glow: false });
      if (s3 > 0) phone(880, 620, 0.38 * s3, g);
      ctx.strokeStyle = C.white; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const arrow = (x, k) => { if (k <= 0) return; ctx.globalAlpha = Math.min(1, k); ctx.beginPath(); ctx.moveTo(x - 40, 640); ctx.lineTo(x + 40, 640); ctx.moveTo(x + 14, 616); ctx.lineTo(x + 40, 640); ctx.lineTo(x + 14, 664); ctx.stroke(); ctx.globalAlpha = 1; };
      arrow(370, s2); arrow(710, s3);
      [['1938', 200, s1], ['1969', 540, s2], ['bugun', 880, s3]].forEach(([s, x, k]) => k > 0 && text(s, x, 850, 50, { color: C.cream, weight: 700, alpha: Math.min(1, k) }));
      if (ke > 0) phone(540, 1330, 0.36 * ke, g, Math.sin(g * 1.3) * 0.1);
    });

    // 9. Keyingi savol (Nokia) — izoh uchun yangi taxmin; fon va tuzilishi hook bilan bir xil (loop)
    add(9, (t, d, g) => {
      space(g, HOT);
      text('KEYINGISI', 540, 170, 62, { color: C.yellow, letter: 8, alpha: prog(t, 0.02, 0.25) });
      const kn = pop(t, 0.05, 0.45);
      if (kn > 0) { ctx.save(); ctx.translate(540, 320); ctx.scale(kn, kn); text('NOKIA', 0, -50, 100, { color: C.white }); text('BIRINCHI NIMA SOTGAN?', 0, 55, 70, { color: C.white }); ctx.restore(); }
      for (let i = 0; i < 3; i++) {
        const k = pop(t, wAt(9, 6) + i * 0.12, 0.4) * (1 + 0.06 * Math.max(0, Math.sin(g * 6 - i)));
        chip(['A', 'B', 'C'][i], '?', 540, 500 + i * 130, k, { w: 460 });
      }
      const kt = pop(t, wAt(9, 9) - 0.1, 0.45);
      if (kt > 0) { ctx.save(); ctx.translate(540, 1320); ctx.scale(kt, kt); text('IZOHDA TAXMIN QILING', 0, 0, 74, { color: C.yellow, letter: 2 }); ctx.restore(); }
    });

    // ---------- tovushlar
    for (let i = 2; i < B.length; i++) cue(Math.max(0, B[i] - 0.08), 's:whoosh', 0.3, 0.9 + (i % 3) * 0.08);
    cue(0, 's:impact', 0.5);
    [0, 1, 3].forEach((k, j) => cue(at(1, k) - 0.05, 's:pop', 0.45, 0.9 + j * 0.1));
    cue(B[2] + 0.05, 's:pop', 0.45); cue(at(2, 1) - 0.1, 's:pop', 0.35, 0.9); cue(at(2, 6) - 0.1, 's:pop', 0.45, 0.8);
    cue(B[3] + 0.05, 's:pop', 0.4); cue(at(3, 1) - 0.1, 's:pop', 0.35, 0.85);
    for (let i = 0; i < 8; i++) cue(at(3, 2) - 0.15 + i * 0.1, 's:pop', 0.16, 1 + i * 0.05);
    cue(at(3, 5) - 0.1, 's:pop', 0.35, 0.8);
    cue(at(4, 0), 's:impact', 0.3, 1.3); cue(at(4, 2), 's:impact', 0.3, 1.3);
    cue(B[5] - 0.5, 's:riser', 0.35); cue(B[5], 's:impact', 0.7);
    cue(at(5, 2) - 0.1, 's:pop', 0.45); cue(at(5, 3) - 0.1, 's:pop', 0.45, 0.9); cue(at(5, 5) - 0.1, 's:pop', 0.5, 0.8);
    cue(at(6, 0) - 0.1, 's:pop', 0.4); cue(at(6, 2) - 0.1, 's:pop', 0.4, 0.85);
    cue(at(7, 1) - 0.1, 's:pop', 0.35); cue(at(7, 3) - 0.2, 's:riser', 0.3, 1.2); cue(at(7, 6) + 0.1, 's:impact', 0.6);
    for (let i = 0; i < 8; i++) cue(at(7, 6) + 0.1 + i * 0.09, 's:coin', 0.22, 0.9 + i * 0.05);
    cue(B[8] + 0.05, 's:pop', 0.35); cue(B[8] + 0.35, 's:pop', 0.35, 0.9); cue(B[8] + 0.65, 's:pop', 0.35, 0.8); cue(at(8, 3) - 0.1, 's:impact', 0.35);
    cue(at(9, 3) - 0.1, 's:impact', 0.4); [0, 1, 2].forEach((j) => cue(at(9, 6) + j * 0.12, 's:pop', 0.35, 0.9 + j * 0.1)); cue(at(9, 9) - 0.1, 's:pop', 0.45, 0.8);
  };
})();
