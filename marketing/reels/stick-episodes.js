// Stickman epizodlari. Har epizod sahnalarni va tovush cue'larini e'lon qiladi: scene(uzunlik, chizish), cue(vaqt, nom), say(vaqt, qator).
window.EPISODES = {
  yoq({ scene, cue, say, D }) {
    const HERO = { id: 11, tie: GOLD };
    const JASUR = { id: 21, tie: RED, flip: true };
    const LOLA = { id: 31, hair: 'long', flip: true };
    const DARK = { id: 41, hat: true, flip: true };
    const MALIKA = { id: 51, hair: 'bun', tie: '#2FB57A' };
    let tals = 0;     // shu paytgacha sanalgan "Yo'q"lar soni: har sahna oxirida ko'payadi
    const paper = () => { sky(PAPER); grain(); };
    const shake = (t, a, dur = 0.3, amp = 26) => {
      const k = 1 - prog(t, a, a + dur);
      if (t > a && k > 0) ctx.translate(Math.sin(t * 90) * amp * k, Math.cos(t * 71) * amp * k * 0.7);
    };
    // Oyoq atrofida taxtadek yiqilish: tos nuqtasi va burilish
    const fall = (rot, feet) => {
      const r = (rot * Math.PI) / 180;
      return { ...HERO, x: feet + 192 * Math.sin(r), y: GROUND - 192 * Math.cos(r) + 26 * Math.sin(r), rot, free: true };
    };
    const counter = (n, t, at) => {
      textBlock([tr('YO‘Q', 'НЕТ')], 90, 318, 66, { align: 'left', color: RED });
      const shown = t >= at ? n : n - 1;
      tally(shown, 300, 270);
    };

    // 1. Birinchi eshik: "Yo'q" va tars!
    {
      const s = (t) => {
        paper();
        shake(t, 2.02);
        const open = kf(t, [[1.02, 0], [1.26, 1, 'out'], [2.0, 1], [2.08, 0, 'in']]);
        const hook = 1 - prog(t, 2.4, 2.7);
        floor();
        door({
          x: 770, open, color: '#C9472B',
          inner: () => stick({ ...JASUR, x: 790, pose: t > 1.9 ? P.stop : P.crossed, mouth: talk('inv_yoq', t, 1.34), mood: 'angry', look: 0.34 }),
        });
        const k = Math.floor(t * 8) % 2;
        const knockP = t > 0.1 && t < 0.92 ? (k ? P.knock0 : P.knock1) : P.stand;
        if (t < 2.02) {
          stick({ ...HERO, x: 450, pose: t > 1.5 ? P.shock : knockP, mood: t > 1.5 ? 'shock' : 'calm' });
        } else {
          const p = prog(t, 2.02, 2.62);
          const x = lerp(450, 345, ease.out(p));
          const y = GROUND - 200 - Math.sin(p * Math.PI) * 240 + ease.bounce(p) * 165;
          if (p < 1) stick({ ...HERO, x, y, rot: -450 * p, pose: P.blown, mood: 'shock', free: true });
          else {
            stick({ ...HERO, x: 345, y: GROUND - 26, rot: -90, pose: P.flat, mood: 'dizzy' });
            stars(112, GROUND - 76, t);
          }
        }
        word(tr('TUK', 'ТУК'), 600, 830, t - 0.2, { rot: -9, dur: 0.22, size: 86 });
        word(tr('TUK', 'ТУК'), 636, 930, t - 0.45, { rot: 7, dur: 0.22, size: 86 });
        word(tr('TUK', 'ТУК'), 590, 1020, t - 0.7, { rot: -5, dur: 0.22, size: 86 });
        if (t > 1.34 && t < 2.02) bubble(tr('Yo‘q.', 'Нет.'), 760, 590, t - 1.34, { color: RED, tail: 20, tailTo: 16 });
        word(tr('TARS!', 'БАХ!'), 700, 780, t - 2.02, { size: 170, rot: -7, color: RED, stroke: INK, dur: 0.6 });
        burst(620, 1050, t - 2.02);
        if (hook > 0) textBlock(tr(['Investor “Yo‘q” desa,', 'nima qilasan?'], ['Инвестор говорит «Нет».', 'Что будешь делать?']), 540, 300, tr(78, 68), { alpha: hook });
        if (t > 2.7) counter(1, t, 2.7);
      };
      [0.2, 0.45, 0.7].forEach((a) => cue(a, 'knock'));
      cue(0.96, 'creak', 0.8);
      say(1.34, 'inv_yoq');
      cue(2.02, 'slam');
      cue(2.05, 'whoosh', 0.5);
      cue(2.6, 'thud');
      cue(2.72, 'tick');
      scene(3.3, s);
    }

    // 2. Ikkinchi eshik: itarib yuboradi, taxtadek orqaga yiqiladi
    {
      const a = 3.3;
      const s = (t) => {
        paper();
        shake(t, 1.72);
        const open = kf(t, [[0.62, 0], [0.8, 1, 'out']]);
        floor();
        door({
          x: 770, open, color: '#2F7DD1', seed: 60,
          inner: () => stick({ ...LOLA, x: kf(t, [[1.1, 800], [1.32, 700, 'out'], [1.8, 790]]), pose: kf(t, [[1.1, P.crossed], [1.3, P.stop, 'out'], [1.7, P.stop], [2, P.crossed]]), mood: 'angry', mouth: talk('lola_yoq', t, 0.82), look: 0.34 }),
        });
        const rot = kf(t, [[1.34, 0], [1.72, -90, 'in'], [1.86, -84, 'out'], [2, -90, 'in']]);
        const k = Math.floor(t * 10) % 2;
        if (rot === 0) stick({ ...HERO, x: 540, pose: t < 0.56 ? (k ? P.knock0 : P.knock1) : (t > 0.82 ? P.shock : P.stand), mood: t > 0.82 ? 'shock' : 'calm' });
        else stick({ ...fall(rot, 540), pose: P.stand, mood: 'shock' });
        word(tr('TUK', 'ТУК'), 700, 900, t - 0.14, { rot: -8, dur: 0.18, size: 80 });
        word(tr('TUK', 'ТУК'), 700, 1010, t - 0.36, { rot: 6, dur: 0.18, size: 80 });
        if (t > 0.82 && t < 1.8) bubble(tr('Yo‘q!', 'Нет!'), 790, 590, t - 0.82, { color: RED, tail: 10, tailTo: 12 });
        word(tr('BUM!', 'БУМ!'), 330, 1160, t - 1.72, { size: 160, rot: -10, color: GOLD, dur: 0.6 });
        burst(150, GROUND - 50, t - 1.72, { n: 10, r: 40, spread: 130 });
        if (t > 1.96) stars(136, GROUND - 90, t);
        counter(2, t, 2.1);
      };
      [0.14, 0.36].forEach((x) => cue(a + x, 'knock'));
      cue(a + 0.6, 'creak', 0.5, 1.5);
      say(a + 0.82, 'lola_yoq');
      cue(a + 1.3, 'push');
      cue(a + 1.72, 'thud', 1.2);
      cue(a + 1.74, 'slam', 0.4);
      cue(a + 2.12, 'tick', 1, 1.12);
      scene(2.5, s);
    }

    // 3. Uchinchi eshik: og'ir ovoz va uchib chiqqan papka
    {
      const a = 5.8;
      const s = (t) => {
        sky('#201A22');
        const light = kf(t, [[0.2, 0], [1, 1]]);
        ctx.fillStyle = `rgba(229,52,43,${0.16 * light})`; ctx.fillRect(0, 0, W, H);
        shake(t, 1.75, 0.25, 16);
        const open = kf(t, [[0.15, 0], [1.05, 1, 'io']]);
        floor(MOON);
        door({
          x: 770, open, color: '#3A3A44', room: '#7A1410', seed: 70, sign: null,
          inner: () => stick({ ...DARK, x: 790, color: '#0B0A08', fill: '#0B0A08', eye: RED, mood: 'angry', pose: t > 1.6 ? P.point : P.crossed, look: 0.3 }),
        });
        const p = prog(t, 1.62, 1.84);
        const down = t > 1.84;
        const rotF = kf(t, [[1.84, 0], [2.22, -90, 'in']]);
        const hx = 540;
        if (!down) stick({ ...HERO, x: hx, color: MOON, fill: '#201A22', pose: t > 0.5 ? P.shock : P.stand, mood: 'shock', eye: MOON });
        else stick({ ...fall(rotF, hx), color: MOON, fill: '#201A22', pose: P.flat, mood: 'dizzy', eye: MOON });
        if (t > 1.62) {
          const x = down ? 500 : lerp(740, 540, p), y = down ? 880 + (t - 1.84) * 1000 : lerp(1040, 880, p);
          if (y < GROUND - 10) { ctx.save(); ctx.translate(x, y); ctx.rotate(p * 8 + (t - 1.84) * 4); ctx.fillStyle = GOLD; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.fillRect(-58, -42, 116, 84); ctx.strokeRect(-58, -42, 116, 84); ctx.restore(); }
        }
        for (let i = 0; t > 1.85 && i < 7; i++) {
          const q = t - 1.85, sx = 450 + Math.sin(q * 2.5 + i) * (40 + i * 26), sy = Math.min(GROUND - 8, 960 + q * (240 + i * 60));
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(sy < GROUND - 9 ? Math.sin(q * 6 + i) * 0.8 : 0);
          ctx.fillStyle = '#fff'; ctx.fillRect(-30, -20, 60, 40); ctx.restore();
        }
        if (t > 0.92 && t < 1.7) bubble(tr('YO‘Q.', 'НЕТ.'), 770, 560, t - 0.92, { color: RED, size: 120, fill: '#0B0A08', tail: 0, tailTo: 8 });
        word(tr('SHAP!', 'ШЛЁП!'), 330, 900, t - 1.84, { size: 150, rot: 8, color: '#fff', dur: 0.5 });
        textBlock([tr('YO‘Q', 'НЕТ')], 90, 318, 66, { align: 'left', color: RED });
        tally(t >= 2.4 ? 3 : 2, 300, 270, { color: MOON });
      };
      cue(a + 0.15, 'creakLow', 1);
      say(a + 0.92, 'dark_yoq');
      cue(a + 0.92, 'boom', 0.55);
      cue(a + 1.62, 'whoosh', 0.8, 1.5);
      cue(a + 1.84, 'smack');
      cue(a + 1.9, 'paper');
      cue(a + 2.22, 'thud', 0.8);
      cue(a + 2.42, 'tick', 1, 1.25);
      scene(2.75, s);
    }

    // 4. Tezlashgan montaj: eshiklar birin-ketin, "Yo'q" tobora tez
    {
      const a = 8.55;
      const gaps = [0.62, 0.54, 0.46, 0.4, 0.34, 0.3];
      const hits = []; let c = 0.15;
      gaps.forEach((g) => { hits.push(c); c += g; });
      const end = c + 0.1;
      const colors = ['#C9472B', '#2F7DD1', '#2FB57A', '#8E44AD', '#E07A1F', '#3A3A44'];
      const voices = ['inv_yoq', 'lola_yoq', 'dark_yoq', 'inv_yoq', 'lola_yoq', 'dark_yoq'];
      const rates = [1.12, 1.18, 1.2, 1.3, 1.35, 1.25];
      const s = (t) => {
        paper();
        let idx = hits.findIndex((h, i) => t < h + gaps[i]);
        if (idx < 0) idx = hits.length - 1;
        const from = idx ? 1000 * idx : 0;
        const go = ease.io(prog(t - hits[idx], 0.0, 0.14));
        const camX = from - (idx ? 1000 : 0) * (1 - go);
        const zoom = 1 + 0.035 * idx;
        ctx.translate(W / 2, GROUND - 300); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -(GROUND - 300));
        shake(t, hits[idx] + 0.12, 0.18, 12 + idx * 3);
        ctx.save();
        ctx.translate(-camX, 0);
        floor();
        hits.forEach((h, i) => {
          const dt = t - h;
          const open = i === idx ? (dt < 0.12 ? ease.out(dt / 0.12) : 1 - prog(dt, gaps[i] - 0.09, gaps[i] - 0.02)) : 0;
          door({ x: 770 + i * 1000, open, color: colors[i], seed: 80 + i * 5, sign: null, inner: i === idx ? () => stick({ ...(i % 3 === 1 ? LOLA : i % 3 === 2 ? DARK : JASUR), x: 790 + i * 1000, pose: P.stop, mood: 'angry', mouth: 0.8 * (dt < 0.2), look: 0.34 }) : null });
        });
        stick({ ...HERO, x: 450 + camX, pose: run(t * 22), mood: 'shock' });
        ctx.restore();
        word(tr('YO‘Q!', 'НЕТ!'), 590, 720 - idx * 4, t - hits[idx], { size: 130 + idx * 16, color: RED, rot: idx % 2 ? 6 : -6, dur: gaps[idx] * 0.85 });
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const n = 3 + hits.filter((h) => t >= h + 0.08).length;
        textBlock([tr('YO‘Q', 'НЕТ')], 90, 318, 66, { align: 'left', color: RED });
        tally(n, 300, 270);
        if (t > end - 0.02) { ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); }
      };
      hits.forEach((h, i) => {
        say(a + h, voices[i], 0.95, rates[i]);
        cue(a + h + gaps[i] - 0.06, 'slam', 0.45 + i * 0.05, 1 + i * 0.05);
        cue(a + h + 0.09, 'tick', 0.8, 1 + i * 0.09);
        cue(a + h + 0.02, 'steps', 0.6);
      });
      cue(a + end - 0.04, 'slam', 1.3, 0.8);
      scene(end + 0.45, (t) => {
        if (t < end) s(t);
        else sky(INK);
      });
    }

    // 5. Yomg'ir: sukut, keyin Malika
    {
      const a = 8.55 + 2.91 + 0.45;
      const U = 3.7, H1 = U + 1.6, H2 = H1 + 1.75;   // pufakchani o'qishga vaqt qolsin
      const s = (t) => {
        const flash = t > H2 ? 1 - prog(t, H2, H2 + 0.5) : 0;
        sky(t > H2 + 0.2 ? '#F6F1E4' : NIGHT);
        const col = t > H2 + 0.2 ? INK : MOON, bg = t > H2 + 0.2 ? PAPER : NIGHT;
        floor(col);
        ctx.fillStyle = col === INK ? '#D9CDB4' : '#2C3650';
        ctx.fillRect(540, GROUND - 112, 250, 112);
        ink([[540, GROUND], [540, GROUND - 112], [790, GROUND - 112], [790, GROUND]], 90, 9, col);
        // Malika soyabon bilan keladi
        const mx = kf(t, [[1.3, -520], [3.5, 270, 'io']]);
        // yomg'ir (soyabon ostiga tushmaydi)
        if (t < H2) {
          ctx.strokeStyle = 'rgba(190,210,240,.5)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
          for (let i = 0; i < 90; i++) {
            const x = hash(i, 11) * 1300 - 100 - 30, y = ((hash(i, 12) + t * (1.5 + hash(i, 13))) % 1) * 1560 - 40;
            if (y > GROUND) continue;
            const ux = mx + 170;
            if (y > 720 && x > ux - 280 && x < ux + 280) continue;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 13, y + 54); ctx.stroke();
          }
        }
        const up = t > U + 0.3;
        const heroPose = t > H2 + 0.15 ? kf(t, [[H2 + 0.15, P.sitUp], [H2 + 0.55, P.cheer, 'back']]) : kf(t, [[U, P.sit], [U + 0.45, P.sitUp]]);
        const heroHip = GROUND - lerp(124, 192, ease.back(prog(t, H2 + 0.15, H2 + 0.55)));
        stick({ ...HERO, x: 640, y: heroHip, free: true, color: col, fill: bg, eye: col, pose: heroPose, mood: t > H2 ? 'happy' : up ? 'calm' : 'sad', look: up ? 0.3 : 0.12, flip: true });
        const pose = t > 3.5 ? P.hold : walk(t * 11);
        stick({ ...MALIKA, x: mx, color: col, fill: bg, eye: col, pose, mood: 'happy', mouth: Math.max(talk('malika_toxta', t, U), talk('malika_sabab', t, H1)) });
        // soyabon
        if (t < H2 + 0.3) {
          const ux = mx + 170, uy = 800;
          ink([[mx + 96, 1110], [ux - 6, uy]], 92, 10, col);
          ctx.fillStyle = RED; ctx.strokeStyle = col; ctx.lineWidth = 9;
          ctx.beginPath(); ctx.moveTo(ux - 280, uy); ctx.quadraticCurveTo(ux, uy - 240, ux + 280, uy);
          [-190, -95, 0, 95, 190].forEach((d, i, arr) => { const nx = ux + (i === 4 ? 280 : (arr[i + 1] || 280)); ctx.quadraticCurveTo(ux + d + 48, uy - 40, nx - 0, uy); });
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        if (t > U && t < H1 - 0.05) bubble(tr('To‘xta, Bekzod.', 'Стой, Бекзод.'), 440, 480, t - U, { size: 70, tail: -120, tailTo: -10 });
        if (t > H1 && t < H2 + 0.15) bubble(tr('Sababini so‘ra.', 'Спроси почему.'), 440, 480, t - H1, { size: 70, fill: GOLD, tail: -120, tailTo: -10 });
        if (t > H2 + 0.15) {
          const p = ease.back(prog(t, H2 + 0.15, H2 + 0.4));
          ctx.save(); ctx.translate(640, 760); ctx.scale(p, p);
          ctx.fillStyle = 'rgba(245,191,23,.3)'; ctx.beginPath(); ctx.arc(0, 0, 170, 0, 7); ctx.fill();
          ctx.fillStyle = GOLD; ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, -10, 74, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = INK; ctx.fillRect(-28, 66, 56, 32);
          ctx.restore();
          burst(640, 760, t - H2 - 0.15, { color: GOLD, r: 110, spread: 170, w: 13 });
        }
        if (flash > 0) { ctx.fillStyle = `rgba(255,250,225,${flash})`; ctx.fillRect(0, 0, W, H); }
        if (t < 1.4) { textBlock([tr('YO‘Q', 'НЕТ')], 90, 318, 66, { align: 'left', color: RED, alpha: 1 - prog(t, 1, 1.4) }); ctx.globalAlpha = 1 - prog(t, 1, 1.4); tally(9, 300, 270, { color: MOON }); ctx.globalAlpha = 1; }
      };
      cue(a + 0.05, 'rain', 1, 1, H2 + 0.15);
      [1.6, 1.98, 2.34, 2.7, 3.06, 3.42].forEach((x) => cue(a + x, 'step', 0.7));
      cue(a + 3.5, 'umbrella', 0.8);
      say(a + U, 'malika_toxta');
      say(a + H1, 'malika_sabab');
      cue(a + H2 + 0.15, 'ding');
      scene(H2 + 1.15, s);
    }

    // 6. Yana birinchi eshik: oyoq tiqib "Nega?"
    let f = 0;
    {
      const a = 11.91 + (3.7 + 1.6 + 1.75) + 1.15;
      f = a;
      const N = 2.4, O = N + D('hero_nega') + 0.55, M = O + 0.4;
      const s = (t) => {
        paper();
        shake(t, 2.12, 0.16, 12);
        const open = kf(t, [[1.34, 0], [1.54, 1, 'out'], [2.04, 1], [2.12, 0.42, 'in'], [O, 0.42], [O + 0.34, 1, 'io']]);
        floor();
        door({
          x: 770, open, color: '#C9472B',
          inner: () => stick({ ...JASUR, x: 800, pose: t > M ? P.point : P.crossed, mood: t > M ? 'calm' : 'angry', mouth: talk('inv_yoq', t, 1.6) + talk('inv_mijoz', t, M), look: 0.34 }),
        });
        const x = kf(t, [[0, -160], [0.62, 500, 'out']]);
        const k = Math.floor((t - 0.7) * 10) % 2;
        const pose = t < 0.6 ? run(t * 24) : t < 1.28 ? (k ? P.knock0 : P.knock1) : t < 2.0 ? P.stand : P.jam;
        const heroX = t > 2 ? 520 : x;
        stick({ ...HERO, x: heroX, pose: t > M + D('inv_mijoz') ? P.shock : pose, mood: t > M + D('inv_mijoz') ? 'shock' : 'happy', mouth: talk('hero_nega', t, N) });
        if (t > 0 && t < 0.6) for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(21,20,15,.18)'; ctx.beginPath(); ctx.arc(x - 90 - i * 46, GROUND - 16 - i * 7, 26 - i * 4, 0, 7); ctx.fill(); }
        word(tr('TAQ!', 'БАМ!'), 690, 1240, t - 2.12, { size: 120, rot: 6, dur: 0.5 });
        if (t > 1.6 && t < 2.1) bubble(tr('Yo‘q.', 'Нет.'), 780, 590, t - 1.6, { color: RED, tail: 20, tailTo: 16 });
        if (t > N && t < O + 0.1) bubble(tr('Nega?', 'Почему?'), tr(400, 330), 700, t - N, { fill: GOLD, tail: 0, tailTo: 10 });
        if (t > M) bubble(tr('Mijozing yo‘q.', 'Нет клиентов.'), 620, 590, t - M, { size: 72, tail: 150, tailTo: 10 });
        if (t > M + D('inv_mijoz') + 0.2) drops(500, 800, 3, t, 4);
      };
      cue(a + 0.02, 'runs', 1);
      cue(a + 0.6, 'skid', 0.8);
      [0.75, 0.95, 1.15].forEach((x) => cue(a + x, 'knock'));
      cue(a + 1.32, 'creak', 0.6, 1.3);
      say(a + 1.6, 'inv_yoq');
      cue(a + 2.12, 'thunk');
      say(a + N, 'hero_nega');
      cue(a + O, 'creak', 0.9);
      say(a + M, 'inv_mijoz');
      cue(a + M + D('inv_mijoz') + 0.15, 'slideDown', 0.9);
      scene(M + D('inv_mijoz') + 1.1, s);
      f += M + D('inv_mijoz') + 1.1;
    }

    // 7. Ishlash: noutbuk, mijozlar birma-bir qo'shiladi
    let customers;
    {
      const a = f;
      const times = [0.9, 1.5, 2.05, 2.55, 3.0, 3.4];
      customers = times.length;
      const s = (t) => {
        paper();
        floor();
        // kun o'tadi: quyosh yoy bo'ylab
        const sun = t / 4.6;
        ctx.fillStyle = GOLD; ctx.strokeStyle = INK; ctx.lineWidth = 9;
        ctx.beginPath(); ctx.arc(lerp(150, 930, sun), 640 - Math.sin(sun * Math.PI) * 150, 74, 0, 7); ctx.fill(); ctx.stroke();
        // stol
        ink([[240, GROUND - 190], [570, GROUND - 190]], 100, 17);
        ink([[270, GROUND - 190], [270, GROUND]], 101, 13);
        ink([[540, GROUND - 190], [540, GROUND]], 102, 13);
        ink([[90, GROUND - 104], [210, GROUND - 104]], 103, 15);
        ink([[150, GROUND - 104], [150, GROUND]], 104, 13);
        ctx.fillStyle = INK;
        ctx.save(); ctx.translate(430, GROUND - 206); ctx.transform(0.9, 0, -0.32, 1, 0, 0); ctx.fillRect(0, -116, 130, 116); ctx.restore();
        ctx.fillRect(300, GROUND - 212, 140, 12);
        const bob = Math.sin(t * 34) * 2;
        stick({ ...HERO, x: 150, y: GROUND - 118 + bob, free: true, pose: { ...P.type, aF: [52 + Math.sin(t * 40) * 9, 44], aB: [40 - Math.sin(t * 40) * 9, 54] }, mood: 'happy', look: 0.34 });
        times.forEach((at, i) => {
          if (t < at) return;
          const p = ease.back(prog(t, at, at + 0.18));
          const x = 620 + i * 72;
          stick({ id: 200 + i, x, s: 0.72 * p, pose: t > at + 0.2 ? walk(t * 5 + i, 0.2) : P.cheer, mood: 'happy', flip: true, tie: [GOLD, RED, '#2FB57A'][i % 3] });
          word('+1', x, 900 - (i % 2) * 80, t - at, { size: 74, color: '#2FB57A', dur: 0.4 });
        });
        textBlock([tr('MIJOZLAR', 'КЛИЕНТЫ')], 90, 318, 66, { align: 'left', color: '#1E9A66' });
        tally(times.filter((x) => t >= x).length, 470, 270, { slash: '#1E9A66' });
      };
      cue(a + 0.05, 'keys', 3);
      times.forEach((x, i) => { cue(a + x, 'pop', 1, 1 + i * 0.1); cue(a + x + 0.05, 'coin', 0.9, 1 + i * 0.09); });
      scene(4.4, s);
      f += 4.4;
    }

    // 8. Oxirgi eshik: uch marta taqillatadi, jim... "Ha."
    {
      const a = f;
      const K = 1.5, Op = K + 1.0, Ha = Op + 2.0;
      const queue = (t) => {
        for (let i = customers; i >= 1; i--) {
          const end = 470 - i * 118, x = Math.min(end, -60 + t * 460 - i * 118);
          const going = x < end;
          const jump = t > Ha ? Math.abs(Math.sin((t - Ha) * 6 + i)) * 90 : 0;
          stick({ id: 300 + i, x, s: 0.72, pose: t > Ha ? P.cheer : going ? walk(t * 12 + i) : P.stand, mood: 'happy', tie: [GOLD, RED, '#2FB57A'][i % 3], hover: jump });
        }
      };
      const s = (t) => {
        paper();
        const zoom = kf(t, [[Op, 1], [Ha, 1.1, 'io'], [Ha + 0.12, 1, 'out']]);
        ctx.translate(W * 0.6, GROUND - 400); ctx.scale(zoom, zoom); ctx.translate(-W * 0.6, -(GROUND - 400));
        const open = kf(t, [[Op, 0], [Op + 0.3, 1, 'out']]);
        const rays = t > Ha;
        if (rays) {
          ctx.save(); ctx.translate(770, 900); ctx.rotate(t * 0.5); ctx.fillStyle = 'rgba(245,191,23,.32)';
          for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-120, -1700); ctx.lineTo(120, -1700); ctx.fill(); }
          ctx.restore();
        }
        floor();
        door({
          x: 770, open, color: '#C9472B',
          inner: () => stick({ ...JASUR, x: 790, pose: t > Ha ? P.point : P.crossed, mood: t > Ha ? 'happy' : 'calm', look: t > Ha ? 0.34 : Math.sin((t - Op) * 2.6) * 0.45 + 0.1, mouth: talk('inv_ha', t, Ha) }),
        });
        queue(t);
        const k = Math.floor((t - K) * 8) % 2;
        const hop = t > Ha ? Math.abs(Math.sin((t - Ha) * 6)) * 110 : 0;
        const pose = t > Ha ? P.cheer : t > K && t < K + 0.8 ? (k ? P.knock0 : P.knock1) : t < K ? walk(t * 12) : P.stand;
        stick({ ...HERO, x: Math.min(470, -60 + t * 460), pose, mood: t > Ha ? 'happy' : t > Op ? 'shock' : 'calm', hover: hop });
        word(tr('TUK', 'ТУК'), 620, 830, t - K, { rot: -9, dur: 0.22, size: 86 });
        word(tr('TUK', 'ТУК'), 650, 930, t - K - 0.25, { rot: 7, dur: 0.22, size: 86 });
        word(tr('TUK', 'ТУК'), 610, 1020, t - K - 0.5, { rot: -5, dur: 0.22, size: 86 });
        if (t > Ha) bubble(tr('Ha.', 'Да.'), 790, 540, t - Ha, { size: 150, fill: GOLD, tail: 10, tailTo: 12 });
        if (t > Ha) { ctx.setTransform(1, 0, 0, 1, 0, 0); confetti(t - Ha); }
      };
      for (let i = 0; i < 7; i++) cue(a + 0.1 + i * 0.26, 'step', 0.75 - i * 0.04);
      [0, 0.25, 0.5].forEach((x) => cue(a + K + x, 'knock'));
      cue(a + Op - 0.04, 'creak', 0.8);
      [0.5, 1.25].forEach((x) => cue(a + Op + x, 'heart', 1));
      say(a + Ha, 'inv_ha', 1.1);
      cue(a + Ha + 0.1, 'fanfare', 1);
      scene(Ha + 2.4, s);
      f += Ha + 2.4;
    }

    // 9. Yakun: oltin fon, sayt
    {
      const a = f;
      const dur = 3.4;
      const s = (t) => {
        sky(GOLD);
        const ap = ease.back(prog(t, 0.05, 0.35));
        ctx.save(); ctx.translate(540, 520); ctx.scale(ap, ap);
        textBlock(tr(['“Yo‘q” — bu oxiri emas.', 'Sababini so‘ra.'], ['«Нет» — это не конец.', 'Спроси почему.']), 0, -60, 84);
        ctx.restore();
        stick({ ...HERO, x: 540, pose: kf((t * 2.2) % 2, [[0, P.wave], [1, { ...P.wave, aF: [118, 30] }], [2, P.wave]]), mood: 'happy', y: 1290, tie: '#fff', mouth: 0 });
        ink([[-100, 1298], [1200, 1294]], 120, 12);
        const up = ease.back(prog(t, 0.5, 0.8));
        ctx.save(); ctx.translate(540, 1425); ctx.scale(up, up);
        ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-340, -66, 680, 132, 28); ctx.fill();
        textBlock(['investage.uz'], 0, 4, 74, { color: GOLD });
        ctx.restore();
      };
      cue(a + 0.05, 'whoosh', 0.7);
      cue(a + 0.5, 'pop', 1, 1.3);
      cue(a + 0.75, 'coin', 1);
      scene(dur, s);
    }
  },
};
