// 018 "70 emas, 72" va 019 "10% uchun $100 ming" — asoschilar uchun amaliy seriya (bitta video — bitta savol).
// Soddalashtirilgan model: investor pulini kompaniyaga YANGI investitsiya sifatida kiritadi (yangi aksiyalar chiqariladi)
// va bitimdan keyingi jami ulushdan foiz oladi; opsion puli va boshqa shartlar hisobga olinmaydi.
//   post-money = investitsiya / ulush;  pre-money = post-money − investitsiya;  eski egalar × (1 − yangi ulush).
// Raqamli sahnalar orasida tiniq kesim (cut): eski raqam yangisining ustiga tushmaydi.
(function () {
  const BLUE = { top: '#2E6BFF', bottom: '#1B2C9E', neb: '#7FB0FF', neb2: '#3A50D0' };
  const NAVY = { top: '#14205A', bottom: '#070D2A', neb: '#2E6BFF', neb2: '#1B2C9E' };
  const GOLD = { top: '#FFB21E', bottom: '#FF5A1E', neb: '#FFE27A', neb2: '#FF8A3D' };
  const INV = '#4E6EF0', NEW = '#3EE0D0', INK = '#1B2C9E';

  function kit(spec, LINES, DEF, scene) {
    const dur = (i) => (spec.durations && spec.durations[i]) || DEF[i];
    const words = (i) => (spec.timing && spec.timing[i]) || spread(LINES[i], 0.12, dur(i) - 0.25);
    const wAt = (i, k) => { const w = words(i); return w[Math.min(k, w.length - 1)][1]; };
    const B = [];
    let T = 0;
    const add = (i, draw, flags) => {
      const d = dur(i), w = words(i);
      B[i] = T;
      scene(d, (t, g) => { draw(t, d, g); subtitle(w, t, { ru: spec.ru && spec.ru[i] }); }, flags);
      T += d;
    };
    const at = (i, k) => B[i] + wAt(i, k);
    return { dur, wAt, add, at, B };
  }
  const header = (small, big, k, y = 300, col = C.white, bigSize = 110) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(540, y); ctx.scale(k, k);
    if (small) text(small, 0, -100, 56, { color: C.yellow, letter: 6 });
    text(big, 0, 10, bigSize, { color: col });
    ctx.restore();
  };
  const chip = (letter, word, x, y, k, o = {}) => {
    if (k <= 0) return;
    const hi = o.hi || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    const w = o.w || 520, h = 116;
    if (hi > 0) glow(0, 0, 340 * hi, C.yellow, 0.6 * hi);
    ctx.shadowColor = 'rgba(10,10,60,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rrect(-w / 2, -h / 2, w, h, 58, hi > 0.5 ? C.yellow : C.white);
    ctx.shadowColor = 'transparent';
    circle(-w / 2 + 60, 0, 40, INK);
    text(letter, -w / 2 + 60, 3, 52, { color: C.white, shadow: false });
    text(word, 40, 4, 58, { color: INK, shadow: false });
    ctx.restore();
  };
  // Doira: [[ulush, rang, yorliq], ...]
  const pie = (cx, cy, r, slices, o = {}) => {
    let a = -Math.PI / 2;
    slices.forEach(([f, col, label], i) => {
      if (f <= 0.0005) return;
      const a0 = a, a1 = a + f * Math.PI * 2, am = (a0 + a1) / 2; a = a1;
      const pull = (o.pull && o.pull[i]) || 0;
      ctx.save(); ctx.translate(cx + Math.cos(am) * pull * 60, cy + Math.sin(am) * pull * 60);
      if (pull > 0) glow(Math.cos(am) * r * 0.6, Math.sin(am) * r * 0.6, 260 * pull, C.yellow, 0.55 * pull);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0 + 0.012, a1 - 0.012); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.55, a0 + 0.012, a1 - 0.012); ctx.closePath(); ctx.fill();
      if (label && f > 0.06) text(label, Math.cos(am) * r * 0.64, Math.sin(am) * r * 0.64, o.size || 52, { color: o.labelColor || C.white });
      ctx.restore();
    });
  };
  const pill = (s, x, y, k, bg = C.white, fg = INK, size = 56) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = `800 ${size}px ${FONT}`;
    const ww = ctx.measureText(s).width + 70;
    rrect(-ww / 2, -size * 0.85, ww, size * 1.7, size * 0.85, bg);
    text(s, 0, 3, size, { color: fg, shadow: false });
    ctx.restore();
  };
  const strike = (x, y, w, k) => {
    if (k <= 0) return;
    ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - w / 2, y + 6); ctx.lineTo(x - w / 2 + w * ease.out(k), y - 6); ctx.stroke();
  };
  const plane = (x, y, s, g) => {
    ctx.save(); ctx.translate(x + Math.sin(g * 2) * 16, y + Math.cos(g * 2.4) * 10); ctx.scale(s, s); ctx.rotate(-0.2);
    glow(0, 0, 200, NEW, 0.45);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(-110, 10); ctx.lineTo(120, -80); ctx.lineTo(40, 90); ctx.lineTo(10, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#C9D6FF'; ctx.beginPath(); ctx.moveTo(10, 30); ctx.lineTo(120, -80); ctx.lineTo(0, 70); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  const bookmark = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y + Math.sin(g * 2) * 10); ctx.scale(s, s);
    glow(0, 0, 220, C.yellow, 0.4);
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.moveTo(-80, -120); ctx.lineTo(80, -120); ctx.lineTo(80, 130); ctx.lineTo(0, 70); ctx.lineTo(-80, 130); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-80, -120, 160, 30);
    ctx.restore();
  };
  const CUT = { cut: true };
  // boshqa epizodlar (masalan vector-biznes.js) ham shu yordamchilardan foydalanadi
  window.VK = { kit, header, chip, pie, pill, strike, plane, bookmark, CUT, BLUE, NAVY, GOLD, INK };

  // ================= 018: "90% bo'lsa, 20% bersangiz — 70% emas, 72%" =================
  window.EPISODES.ulush72 = function ({ scene, cue, spec }) {
    const LINES = [
      'Sizda 90 foiz ulush bor. Yangi investor 20 foiz olsa, sizga 70 foiz qoladimi?',
      "Yo'q. U bitimdan keyingi jami ulushning 20 foizini olsa — sizda 72 foiz qoladi.",
      "Chunki eski egalarning hammasi endi yangi jami ulushning 80 foizini bo'lishadi.",
      '90 foizning 80 foizi — 72. Siz 72, oldingi investor 8, yangi investor 20 foiz.',
      'Keyingi raunddan oldin hisoblang. Ulush kelishayotgan sherigingizga yuboring.',
    ];
    const DEF = [5.0, 5.0, 4.6, 5.6, 4.8];
    const { wAt, add, at, B } = kit(spec, LINES, DEF, scene);

    // 0. HOOK: 90% − 20% = 70%?
    add(0, (t, d, g) => {
      space(g, BLUE);
      const z = lerp(1.06, 1, ease.out(prog(t, 0, 1.2)));
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
      header('SIZDA 90% ULUSH', '−20% = 70%?', lerp(0.88, 1, ease.back(prog(t, 0, 0.35))), 270, C.white, 120);
      pie(540, 760, 240, [[0.9, C.yellow, 'Siz 90%'], [0.1, INV, '']], { labelColor: C.ink, size: 56 });
      pill('investor 10%', 540, 1090, pop(t, 0.2, 0.4), INV, C.white, 44);
      pill('+ yangi investor 20%', 540, 1200, pop(t, wAt(0, 7) - 0.1, 0.45), NEW, C.ink, 44);
      ctx.restore();
    });
    cue(0, 's:impact', 0.5); cue(0.2, 's:pop', 0.4);

    // 1. JAVOB: 70% emas — 72%
    add(1, (t, d, g) => {
      space(g, NAVY);
      const a72 = wAt(1, 11) - 0.1;
      const k70 = pop(t, 0.05, 0.35);
      if (k70 > 0) { ctx.save(); ctx.translate(300, 430); ctx.scale(k70, k70); text('70%', 0, 0, 140, { color: C.white, alpha: 0.85 }); strike(0, 0, 260, prog(t, 0.25, 0.55)); ctx.restore(); }
      const k = pop(t, a72, 0.45);
      if (k > 0) { glow(780, 430, 320 * k, C.yellow, 0.55); ctx.save(); ctx.translate(780, 430); ctx.scale(k * 1.15, k * 1.15); text('72%', 0, 0, 160, { color: C.yellow }); ctx.restore(); }
      pill('jami ulushning 20% i', 540, 780, pop(t, wAt(1, 4) - 0.1, 0.4), NEW, C.ink, 54);
      pill('yangi aksiyalar chiqariladi', 540, 930, pop(t, wAt(1, 6) - 0.1, 0.4), C.white, INK, 44);
    }, CUT);

    // 2. Nega: eski egalar endi jami ulushning 80% i
    add(2, (t, d, g) => {
      space(g, NAVY);
      const k = ease.io(prog(t, 0.2, 1.2));
      ctx.save(); ctx.translate(540, 760);
      pie(0, 0, 280, [[0.9 * (1 - 0.2 * k), C.yellow, ''], [0.1 * (1 - 0.2 * k), INV, ''], [0.2 * k, NEW, '20%']], { labelColor: C.ink, size: 56 });
      ctx.restore();
      const ka = prog(t, wAt(2, 8) - 0.2, wAt(2, 8) + 0.4);
      if (ka > 0) {
        ctx.save(); ctx.translate(540, 760); ctx.globalAlpha = ka;
        ctx.strokeStyle = C.white; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0, 320, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.8 * ka); ctx.stroke();
        ctx.restore();
      }
      header('ESKI EGALAR', '= 80%', pop(t, wAt(2, 8) - 0.1, 0.45), 300, C.white, 130);
    }, CUT);

    // 3. Hisob: 90% × 80% = 72%; siz 72 / oldingi 8 / yangi 20
    add(3, (t, d, g) => {
      space(g, NAVY);
      pill('90% × 80% = 72%', 540, 300, pop(t, 0.05, 0.45), C.yellow, C.ink, 70);
      const rows = [['Siz', 72, C.yellow, wAt(3, 6)], ['Oldingi investor', 8, INV, wAt(3, 8)], ['Yangi investor', 20, NEW, wAt(3, 11)]];
      rows.forEach(([name, v, col, a], i) => {
        const k = ease.out(prog(t, a - 0.15, a + 0.45));
        if (k <= 0) return;
        const y = 620 + i * 210, w = Math.max(40, 700 * (v / 72) * k);
        text(name, 160, y - 52, 46, { color: C.cream, weight: 700, align: 'left' });
        rrect(160, y - 20, w, 80, 40, col);
        text(v + '%', 160 + w + 24, y + 22, 60, { color: C.white, align: 'left', alpha: k });
      });
    }, CUT);

    // 4. CTA (bitta harakat): ulush kelishayotgan sherigingizga yuboring
    add(4, (t, d, g) => {
      space(g, BLUE);
      const kp = pop(t, 0.05, 0.45);
      if (kp > 0) plane(540, 420, 1.3 * kp, g);
      text('SHERIGINGIZGA YUBORING', 540, 660, 66, { color: C.yellow, alpha: prog(t, wAt(4, 6) - 0.2, wAt(4, 6) + 0.1), letter: 3 });
      text('keyingi raunddan oldin hisoblang', 540, 760, 48, { color: C.cream, weight: 700, alpha: prog(t, 0.1, 0.4) });
      text('investage.uz', 540, 1790, 46, { color: C.yellow, alpha: prog(t, d - 1.6, d - 1.2) });
    });

    for (let i = 1; i < B.length; i++) cue(Math.max(0, B[i] - 0.12), 's:whoosh', 0.3, 0.9 + (i % 3) * 0.08);
    cue(at(0, 7) - 0.1, 's:pop', 0.45, 0.85);
    cue(B[1] + 0.3, 's:whoosh', 0.3, 1.4); cue(at(1, 4) - 0.1, 's:pop', 0.35); cue(at(1, 6) - 0.1, 's:pop', 0.3, 0.9);
    cue(at(1, 11) - 0.6, 's:riser', 0.3, 1.3); cue(at(1, 11) - 0.1, 's:impact', 0.6);
    cue(B[2] + 0.2, 's:whoosh', 0.3, 0.8); cue(at(2, 8) - 0.1, 's:pop', 0.45);
    cue(B[3] + 0.05, 's:pop', 0.45); cue(at(3, 6) - 0.15, 's:pop', 0.35); cue(at(3, 8) - 0.15, 's:pop', 0.35, 0.9); cue(at(3, 11) - 0.15, 's:pop', 0.35, 0.8);
    cue(B[4] + 0.1, 's:whoosh', 0.45, 1.2);
  };

  // ================= 019: "10% uchun $100 ming — kompaniya qancha baholanyapti?" =================
  window.EPISODES.baho = function ({ scene, cue, spec }) {
    const LINES = [
      'Investor kompaniyaga 100 ming dollar kiritib, 10 foiz ulush olmoqchi. Bu kelishuvda kompaniya qancha baholanyapti?',
      'Pul kirgandan keyin — 1 million dollar. Bu post-money.',
      'Pul kirishidan oldin — 900 ming. Bu pre-money.',
      "Taklifni solishtirganda qaysi baho aytilayotganini aniqlang. Muzokaradan oldin saqlab qo'ying.",
    ];
    const DEF = [6.4, 4.0, 3.6, 5.6];
    const { wAt, add, at, B } = kit(spec, LINES, DEF, scene);
    const CH = [['A', '$100 000', 960], ['B', '$1 000 000', 1085], ['C', '$10 000 000', 1210]];

    // 0. HOOK: 10% uchun $100 ming — baho qancha? (variantlar savol bilan birga)
    add(0, (t, d, g) => {
      space(g, BLUE);
      const z = lerp(1.06, 1, ease.out(prog(t, 0, 1.2)));
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
      header('10% UCHUN $100 MING', 'BAHO QANCHA?', lerp(0.88, 1, ease.back(prog(t, 0, 0.35))), 270, C.white, 112);
      const ten = []; for (let i = 0; i < 10; i++) ten.push([0.1, i === 0 ? C.yellow : (i % 2 ? '#6A8CFF' : INV), '']);
      ctx.save(); ctx.translate(540, 640); ctx.rotate(Math.sin(g * 0.8) * 0.06); pie(0, 0, 180, ten, { pull: [0.6 + 0.4 * Math.sin(g * 3)] }); ctx.restore();
      pill('10%', 740, 510, pop(t, 0.15, 0.4), C.yellow, C.ink, 50);
      CH.forEach(([l, w, y], k) => chip(l, w, 540, y, pop(t, 0.5 + k * 0.3, 0.4)));
      ctx.restore();
    });
    cue(0, 's:impact', 0.5); [0.5, 0.8, 1.1].forEach((a, j) => cue(a - 0.05, 's:pop', 0.5, 0.9 + j * 0.1));

    // 1. Post-money: $100 000 ÷ 10% = $1 000 000 (eng yorqin kadr)
    add(1, (t, d, g) => {
      space(g, GOLD);
      const a = wAt(1, 4) - 0.2, f = ease.out(prog(t, a, a + 0.6)), boom = prog(t, a + 0.5, a + 0.9);
      glow(540, 520, 700 * (0.3 + boom * 0.7), C.white, 0.3 + 0.25 * boom);
      pill('$100 000 ÷ 10%', 540, 260, pop(t, 0.05, 0.4), C.ink, C.yellow, 60);
      ctx.save(); ctx.translate(540, 470); const s = 1 + 0.1 * Math.sin(Math.min(1, boom) * Math.PI); ctx.scale(s, s);
      text('= $' + fmt(1e5 + 9e5 * Math.pow(f, 1.6)), 0, 0, 104, { color: C.white });
      ctx.restore();
      pill('POST-MONEY · puldan keyin', 540, 650, pop(t, wAt(1, 7) - 0.1, 0.4), C.white, INK, 46);
      chip('B', '$1 000 000', 540, 900, 1 + 0.08 * ease.back(prog(t, a + 0.5, a + 0.9)), { hi: prog(t, a + 0.5, a + 0.8) });
    }, CUT);

    // 2. Pre-money: $900 000 + $100 000 = $1 000 000
    add(2, (t, d, g) => {
      space(g, NAVY);
      const base = 1260, sc = 0.00068;
      const h1 = 9e5 * sc * ease.out(prog(t, 0.1, 0.7)), h2 = 1e5 * sc * ease.out(prog(t, 0.6, 1.0));
      rrect(120, base, 840, 6, 3, 'rgba(255,255,255,.4)');
      rrect(330, base - h1, 420, h1, 18, '#FFF4DC');
      if (h1 > 120) text('$900 000', 540, base - h1 / 2 - 20, 76, { color: INK, shadow: false });
      if (h1 > 120) text('PRE-MONEY · pulgacha', 540, base - h1 / 2 + 50, 34, { color: INK, shadow: false, weight: 800, alpha: prog(t, wAt(2, 6) - 0.1, wAt(2, 6) + 0.2) });
      if (h2 > 4) { rrect(330, base - h1 - h2 - 10, 420, h2, 14, C.yellow); text('+$100 000', 890, base - h1 - h2 / 2 - 10, 50, { color: C.yellow }); text('investor', 890, base - h1 - h2 / 2 + 42, 38, { color: C.cream, weight: 700 }); }
      text('$1 000 000', 540, 330, 96, { color: C.white, alpha: prog(t, 0.9, 1.2) });
      text('post-money', 540, 420, 44, { color: C.cream, weight: 700, alpha: prog(t, 0.9, 1.2) });
    }, CUT);

    // 3. CTA (bitta harakat): saqlab qo'ying
    add(3, (t, d, g) => {
      space(g, BLUE);
      const kb = pop(t, wAt(3, 8) - 0.1, 0.45);
      text('Taklifda qaysi baho?', 540, 300, 76, { color: C.white, alpha: prog(t, 0.05, 0.3) });
      pill('pre-money  yoki  post-money', 540, 440, pop(t, wAt(3, 3) - 0.1, 0.4), C.yellow, C.ink, 50);
      if (kb > 0) bookmark(540, 820, 1.2 * kb, g);
      text("SAQLAB QO'YING", 540, 1080, 70, { color: C.yellow, alpha: kb, letter: 3 });
      text('investage.uz', 540, 1790, 46, { color: C.yellow, alpha: prog(t, d - 1.6, d - 1.2) });
    });

    for (let i = 1; i < B.length; i++) cue(Math.max(0, B[i] - 0.12), 's:whoosh', 0.3, 0.9 + (i % 3) * 0.08);
    cue(B[1] + 0.05, 's:pop', 0.4); cue(at(1, 4) - 0.6, 's:riser', 0.3, 1.3); cue(at(1, 4) + 0.3, 's:impact', 0.65);
    for (let i = 0; i < 6; i++) cue(at(1, 4) + 0.3 + i * 0.09, 's:coin', 0.22, 0.9 + i * 0.05);
    cue(at(1, 7) - 0.1, 's:pop', 0.4);
    cue(B[2] + 0.1, 's:pop', 0.35); cue(B[2] + 0.6, 's:coin', 0.4); cue(at(2, 6) - 0.1, 's:pop', 0.4, 0.85);
    cue(at(3, 3) - 0.1, 's:pop', 0.4); cue(at(3, 8) - 0.1, 's:pop', 0.5, 0.8);
  };
})();
