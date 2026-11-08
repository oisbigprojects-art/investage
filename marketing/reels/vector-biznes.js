// 020 "Investor sizga 100 000 $ berdi. Qanday biznes qilasiz?" — izoh uchun savol, vektor uslubi.
// Taqsimot (40/30/20/10) — bozor narxi emas, rejaga misol. Kafe/do'kon/xizmat qismlarida raqam aytilmaydi:
// faqat pul qayerga ketishi rang bilan ko'rsatiladi.
(function () {
  const { kit, header, chip, pill, strike, CUT, BLUE, NAVY, GOLD, INK } = window.VK;
  const VIOLET = { top: '#4B2A9C', bottom: '#1E1258', neb: '#FF4F8B', neb2: '#3A2A8C' };
  const TEAL = { top: '#137C75', bottom: '#0A2F3E', neb: '#3EE0D0', neb2: '#1FA39A' };
  const GREEN = '#2FA866';

  // ---------- rasmlar
  const cash = (x, y, s, rot = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(10,30,10,.4)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
    rrect(-130, -60, 260, 120, 14, GREEN);
    ctx.shadowColor = 'transparent';
    rrect(-130, -60, 260, 24, 12, '#5DD48F');
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.strokeRect(-112, -36, 224, 78);
    rrect(-24, -60, 48, 120, 6, C.cream);
    text('$', -76, 6, 56, { color: '#E8FFF0', shadow: false });
    text('$', 76, 6, 56, { color: '#E8FFF0', shadow: false });
    ctx.restore();
  };
  const cup = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    glow(0, -40, 320, C.orange, 0.35);
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      for (let k = 0; k <= 20; k++) { const yy = -200 - k * 7, xx = i * 50 + Math.sin(k * 0.45 + g * 3 + i) * 14; if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.stroke();
    }
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.moveTo(-105, -130); ctx.lineTo(105, -130); ctx.lineTo(78, 140); ctx.lineTo(-78, 140); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8B5A2B'; ctx.beginPath(); ctx.moveTo(-97, -40); ctx.lineTo(97, -40); ctx.lineTo(89, 50); ctx.lineTo(-89, 50); ctx.closePath(); ctx.fill();
    rrect(-124, -170, 248, 46, 16, C.white);
    rrect(-90, -190, 180, 26, 10, '#E6E0D2');
    ctx.restore();
  };
  const phone = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y + Math.sin(g * 2) * 8); ctx.scale(s, s); ctx.rotate(-0.08);
    glow(0, 0, 320, C.pink, 0.35);
    rrect(-115, -210, 230, 420, 38, '#120C2E');
    const gr = ctx.createLinearGradient(0, -185, 0, 185); gr.addColorStop(0, '#FF7AA8'); gr.addColorStop(1, '#6A3FD0');
    rrect(-98, -185, 196, 370, 26, gr);
    for (let i = 0; i < 4; i++) rrect(-80 + (i % 2) * 86, -160 + Math.floor(i / 2) * 130, 74, 110, 14, 'rgba(255,255,255,.85)');
    rrect(-80, 110, 160, 50, 25, C.yellow);
    ctx.restore();
  };
  const box = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y + Math.sin(g * 2 + 1) * 6); ctx.scale(s, s); ctx.rotate(0.06);
    rrect(-110, -80, 220, 170, 12, '#C98A4A');
    ctx.fillStyle = '#A86E35'; ctx.beginPath(); ctx.moveTo(-110, -80); ctx.lineTo(110, -80); ctx.lineTo(80, -120); ctx.lineTo(-80, -120); ctx.closePath(); ctx.fill();
    rrect(-20, -120, 40, 210, 4, '#E8C48A');
    ctx.restore();
  };
  const van = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y + Math.abs(Math.sin(g * 9)) * -4); ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const o = ((g * 2 + i * 0.33) % 1) * 60; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(-230 - o, -60 + i * 45); ctx.lineTo(-290 - o, -60 + i * 45); ctx.stroke(); }
    ctx.globalAlpha = 1;
    rrect(-200, -120, 270, 180, 20, C.white);
    rrect(-200, -40, 270, 26, 0, C.yellow);
    rrect(70, -70, 120, 130, 22, C.yellow);
    rrect(96, -52, 66, 48, 10, '#9CD8FF');
    [[-120, 70], [110, 70]].forEach(([wx, wy]) => { circle(wx, wy, 38, C.ink); circle(wx, wy, 16, '#9A97B0'); });
    ctx.restore();
  };
  const doc = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y + Math.sin(g * 2) * 8); ctx.scale(s, s); ctx.rotate(0.07);
    rrect(-110, -145, 220, 290, 18, C.white);
    for (let i = 0; i < 5; i++) rrect(-80, -105 + i * 42, i % 2 ? 110 : 160, 16, 8, '#C9D6FF');
    circle(60, 95, 34, C.land);
    ctx.strokeStyle = C.white; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(44, 95); ctx.lineTo(56, 108); ctx.lineTo(78, 82); ctx.stroke();
    ctx.restore();
  };
  const bubble = (x, y, s, g) => {
    ctx.save(); ctx.translate(x, y + Math.sin(g * 2) * 8); ctx.scale(s, s);
    glow(0, 0, 360, C.yellow, 0.35);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.roundRect(-240, -150, 480, 280, 70); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-120, 110); ctx.lineTo(-170, 210); ctx.lineTo(-40, 120); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 3; i++) circle(-90 + i * 90, -10 - Math.max(0, Math.sin(g * 6 - i * 0.8)) * 22, 30, INK);
    ctx.restore();
  };
  // $100 000 qayerga ketadi: [[ulush, rang, yorliq, k 0..1], ...] chapdan o'ngga to'ladi
  const budget = (y, segs, k0) => {
    if (k0 <= 0) return;
    const x0 = 120, w = 840, h = 96;
    text('$100 000', 540, y - 92, 56, { color: C.white, alpha: k0 });
    ctx.save(); ctx.globalAlpha = k0;
    rrect(x0, y - h / 2, w, h, h / 2, 'rgba(255,255,255,.22)');
    ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, h / 2); ctx.clip();
    let x = x0;
    segs.forEach(([f, col, , k]) => { const ww = w * f * ease.out(clamp(k)); if (ww > 0) { ctx.fillStyle = col; ctx.fillRect(x, y - h / 2, ww, h); } x += w * f; });
    ctx.restore();
    x = x0;
    segs.forEach(([f, col, label, k]) => { if (k > 0.3) text(label, x + (w * f) / 2, y + h / 2 + 50, 40, { color: col, alpha: prog(k, 0.3, 1) }); x += w * f; });
  };
  const grow = (t, a) => prog(t, a - 0.1, a + 0.5);

  window.EPISODES.biznes100 = function ({ scene, cue, spec }) {
    const LINES = [
      "Investor sizga 100 ming dollar berdi. Lekin bitta sharti bor: bir yilda daromad chiqishi kerak. Nima qilgan bo'lardingiz?",
      "A variant — kafe. Hamma tushunadigan biznes, lekin pulning katta qismi ijara va ta'mirga ketib qoladi.",
      "B variant — onlayn do'kon. Ijara yo'q, lekin pul tovar va reklamaga juda ham ko'p ketadi.",
      "C variant — xizmat. Masalan, kichik bizneslarga yetkazib berish yoki hisob-kitob. Xarajat kamku, lekin mijoz topishning o'zi qiyin.",
      "Lekin investor g'oyaga emas, rejaga pul beradi. 100 ming qayerga ketishini ko'rsatishingiz kerak.",
      "Masalan, 40 mingi — mahsulot, 30 mingi — mijoz topish, 20 mingi — jamoa, 10 mingi — zaxira.",
      "Siz 100 ming dollarga nima qilardingiz? Izohga g'oyangizni yozing. Eng yaxshi g'oyani keyingi videoda tahlil qilamiz.",
    ];
    const DEF = [5.8, 5.6, 4.6, 6.8, 5.8, 6.6, 6.6];
    const { wAt, add, at, B } = kit(spec, LINES, DEF, scene);
    const PILE = [[-135, 0], [135, 0], [0, 10], [-68, -84], [68, -84], [0, -168]];

    // 0. HOOK: $100 000 tushadi → 1 yil, daromad → nima qilasiz? (A / B / C)
    add(0, (t, d, g) => {
      space(g, GOLD);
      const z = lerp(1.08, 1, ease.out(prog(t, 0, 1.2)));
      ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
      glow(540, 760, 560, C.white, 0.35);
      PILE.forEach(([px, py], i) => {
        const a = i * 0.08, k = ease.out(prog(t, a, a + 0.32));
        if (k <= 0) return;
        cash(540 + px, lerp(-200, 840 + py, k), 1.15, (hash(i, 3) - 0.5) * 0.18);
      });
      header('INVESTOR SIZGA BERDI', '$100 000', lerp(0.85, 1, ease.back(prog(t, 0, 0.35))), 280, C.white, 140);
      pill('1 YIL · DAROMAD', 540, 1060, pop(t, wAt(0, 8) - 0.1, 0.4), C.ink, C.yellow, 54);
      const kq = pop(t, wAt(0, 15) - 0.1, 0.4);
      if (kq > 0) { ctx.save(); ctx.translate(540, 1200); ctx.scale(kq, kq); text('NIMA QILASIZ?', 0, 0, 84, { color: C.white }); ctx.restore(); }
      [['A · kafe', 225], ["B · do'kon", 540], ['C · xizmat', 855]].forEach(([s, x], j) => pill(s, x, 1340, pop(t, wAt(0, 17) + j * 0.12, 0.35), C.white, INK, 40));
      ctx.restore();
    });
    cue(0, 's:impact', 0.5);
    PILE.forEach((_, i) => cue(i * 0.08 + 0.28, 's:coin', 0.28, 0.9 + i * 0.05));

    // 1. A — kafe: tanish, lekin pulning katta qismi ijara va ta'mirga
    add(1, (t, d, g) => {
      space(g, BLUE);
      chip('A', 'Kafe', 540, 250, pop(t, 0.05, 0.4));
      const kc = pop(t, 0.15, 0.5);
      if (kc > 0) cup(540, 720, 1.25 * kc, g);
      pill('tanish ✓', 820, 470, pop(t, wAt(1, 4) - 0.1, 0.4), C.land, C.ink, 42);
      budget(1180, [[0.5, C.orange, 'IJARA', grow(t, wAt(1, 11))], [0.22, C.red, "TA'MIR", grow(t, wAt(1, 13))]], prog(t, wAt(1, 8) - 0.2, wAt(1, 8) + 0.2));
    });

    // 2. B — onlayn do'kon: ijara yo'q, pul tovar va reklamaga
    add(2, (t, d, g) => {
      space(g, VIOLET);
      chip('B', "Onlayn do'kon", 540, 250, pop(t, 0.05, 0.4), { w: 660 });
      const kp = pop(t, 0.15, 0.5);
      if (kp > 0) { phone(420, 680, 1.05 * kp, g); box(720, 790, 0.95 * kp, g); }
      const ki = pop(t, wAt(2, 5) - 0.1, 0.4);
      if (ki > 0) { pill('IJARA', 540, 1000, ki, C.white, INK, 52); strike(540, 1000, 260, prog(t, wAt(2, 6) - 0.1, wAt(2, 6) + 0.25)); }
      budget(1200, [[0.45, C.yellow, 'TOVAR', grow(t, wAt(2, 9))], [0.3, C.pink, 'REKLAMA', grow(t, wAt(2, 11))]], prog(t, wAt(2, 8) - 0.2, wAt(2, 8) + 0.2));
    });

    // 3. C — xizmat: xarajat kam, lekin mijoz topish qiyin
    add(3, (t, d, g) => {
      space(g, TEAL);
      chip('C', 'Xizmat', 540, 250, pop(t, 0.05, 0.4));
      const kv = pop(t, 0.15, 0.45), kd = pop(t, wAt(3, 10) - 0.15, 0.45);
      if (kv > 0) van(390, 640, 0.95 * kv, g);
      if (kd > 0) doc(800, 620, 0.9 * kd, g);
      const km = pop(t, wAt(3, 14) - 0.1, 0.45);
      if (km > 0) { ctx.save(); ctx.translate(540, 940); ctx.scale(km * (1 + 0.04 * Math.sin(g * 6)), km * (1 + 0.04 * Math.sin(g * 6))); glow(0, 0, 300, C.red, 0.4); text('MIJOZ ?', 0, 0, 110, { color: C.yellow }); ctx.restore(); }
      budget(1200, [[0.2, C.yellow, 'XARAJAT', grow(t, wAt(3, 11))]], prog(t, wAt(3, 11) - 0.3, wAt(3, 11)));
    });

    // 4. G'oya emas — reja: $100 000 qayerga ketadi?
    add(4, (t, d, g) => {
      space(g, NAVY);
      const kg = pop(t, wAt(4, 2) - 0.1, 0.4);
      if (kg > 0) { pill("G'OYA", 290, 420, kg, C.white, INK, 72); strike(290, 420, 300, prog(t, wAt(4, 3) - 0.1, wAt(4, 3) + 0.25)); }
      const kr = pop(t, wAt(4, 4) - 0.1, 0.45);
      if (kr > 0) { glow(790, 420, 300 * kr, C.yellow, 0.5); pill('REJA ✓', 790, 420, kr * 1.1, C.yellow, C.ink, 72); }
      const km = pop(t, wAt(4, 7) - 0.1, 0.45);
      if (km > 0) { ctx.save(); ctx.translate(540, 760); ctx.scale(km, km); text('$100 000', 0, 0, 130, { color: C.white }); ctx.restore(); }
      for (let i = 0; i < 4; i++) {
        const k = pop(t, wAt(4, 9) - 0.1 + i * 0.1, 0.4);
        if (k <= 0) continue;
        const x = 210 + i * 220;
        ctx.save(); ctx.translate(x, 1080); ctx.scale(k, k);
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
        ctx.beginPath(); ctx.roundRect(-85, -85, 170, 170, 26); ctx.stroke(); ctx.setLineDash([]);
        text('?', 0, 4, 96, { color: C.yellow });
        ctx.restore();
        if (k > 0.5) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(540, 840); ctx.lineTo(x, 985); ctx.stroke(); }
      }
    });

    // 5. ASOSIY KADR: $100 000 → 40 mahsulot · 30 mijoz · 20 jamoa · 10 zaxira
    add(5, (t, d, g) => {
      space(g, NAVY);
      const SEG = [[0.4, C.yellow, '$40 000', 'mahsulot', wAt(5, 1)], [0.3, C.cyan, '$30 000', 'mijoz topish', wAt(5, 5)],
        [0.2, C.pink, '$20 000', 'jamoa', wAt(5, 10)], [0.1, C.orange, '$10 000', 'zaxira', wAt(5, 14)]];
      const cx = 540, cy = 650, r = 270;
      const full = prog(t, wAt(5, 14) + 0.3, wAt(5, 14) + 0.8);
      glow(cx, cy, 520 + 120 * full, C.yellow, 0.25 + 0.2 * full);
      ctx.lineCap = 'butt'; ctx.lineWidth = 120;
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      let a = -Math.PI / 2;
      SEG.forEach(([f, col, , , w0]) => {
        const k = ease.out(prog(t, w0 - 0.15, w0 + 0.45));
        if (k > 0) { ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, a + 0.02, a + Math.max(0.021, f * Math.PI * 2 * k) - 0.02); ctx.stroke(); }
        a += f * Math.PI * 2;
      });
      const s = 1 + 0.08 * Math.sin(Math.min(1, full) * Math.PI);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); text('$100 000', 0, 0, 74, { color: C.white }); ctx.restore();
      SEG.forEach(([f, col, money, label, w0], i) => {
        const k = pop(t, w0 - 0.1, 0.4);
        if (k <= 0) return;
        const x = i % 2 ? 790 : 290, y = 1100 + Math.floor(i / 2) * 170;
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
        circle(-150, -22, 18, col);
        text(money, -118, -24, 64, { color: col, align: 'left' });
        text(label, -118, 38, 40, { color: C.cream, weight: 700, align: 'left' });
        ctx.restore();
      });
    }, CUT);

    // 6. CTA (bitta harakat): izohga g'oyangizni yozing
    add(6, (t, d, g) => {
      space(g, BLUE);
      text('SIZ NIMA', 540, 230, 92, { color: C.white, alpha: prog(t, 0.05, 0.3) });
      text('QILARDINGIZ?', 540, 340, 92, { color: C.white, alpha: prog(t, 0.05, 0.3) });
      const kb = pop(t, 0.15, 0.5);
      if (kb > 0) bubble(540, 680, 1.05 * kb, g);
      const ki = pop(t, wAt(6, 6) - 0.1, 0.45);
      if (ki > 0) { ctx.save(); ctx.translate(540, 1000); ctx.scale(ki, ki); text('IZOHGA YOZING', 0, 0, 84, { color: C.yellow, letter: 3 }); ctx.restore(); }
      text("eng yaxshi g'oyani tahlil qilamiz", 540, 1110, 50, { color: C.cream, weight: 700, alpha: prog(t, wAt(6, 10) - 0.2, wAt(6, 10) + 0.15) });
      text('investage.uz', 540, 1790, 46, { color: C.yellow, alpha: prog(t, d - 1.6, d - 1.2) });
    });

    for (let i = 1; i < B.length; i++) cue(Math.max(0, B[i] - 0.12), 's:whoosh', 0.3, 0.9 + (i % 3) * 0.08);
    cue(at(0, 8) - 0.1, 's:pop', 0.4); cue(at(0, 15) - 0.1, 's:pop', 0.45, 0.85);
    [0, 1, 2].forEach((j) => cue(at(0, 17) + j * 0.12, 's:pop', 0.35, 0.9 + j * 0.12));
    [1, 2, 3].forEach((i) => cue(B[i] + 0.05, 's:pop', 0.4));
    cue(at(1, 4) - 0.1, 's:pop', 0.3); cue(at(1, 11) - 0.1, 's:coin', 0.35); cue(at(1, 13) - 0.1, 's:coin', 0.35, 0.9);
    cue(at(2, 5) - 0.1, 's:pop', 0.35); cue(at(2, 9) - 0.1, 's:coin', 0.35); cue(at(2, 11) - 0.1, 's:coin', 0.35, 0.9);
    cue(at(3, 10) - 0.15, 's:pop', 0.35, 0.9); cue(at(3, 14) - 0.1, 's:impact', 0.45);
    cue(at(4, 2) - 0.1, 's:pop', 0.35); cue(at(4, 4) - 0.1, 's:pop', 0.45, 1.1); cue(at(4, 7) - 0.1, 's:coin', 0.4);
    [0, 1, 2, 3].forEach((i) => cue(at(4, 9) - 0.1 + i * 0.1, 's:pop', 0.25, 0.9 + i * 0.08));
    cue(at(5, 1) - 0.6, 's:riser', 0.3, 1.3);
    [1, 5, 10, 14].forEach((k, j) => cue(at(5, k) - 0.1, 's:pop', 0.45, 0.85 + j * 0.1));
    cue(at(5, 14) + 0.3, 's:impact', 0.55);
    cue(B[6] + 0.15, 's:pop', 0.45); cue(at(6, 6) - 0.1, 's:pop', 0.5, 0.8);
  };
})();
