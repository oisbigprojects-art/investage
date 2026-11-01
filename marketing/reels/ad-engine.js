// Investage reklamasi: DOM + CSS 3D, har kadr vaqtdan hisoblanadi (window.seek), tovush cue'lari stick.py orqali sfx.py da yig'iladi.
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const out = (x) => 1 - Math.pow(1 - x, 3);
const io = (x) => x * x * (3 - 2 * x);
const back = (x) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2);
const hash = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const css = (el, o) => Object.assign(el.style, o);

const SCENES = [['s1', 0, 3], ['s2', 3, 6], ['s3', 6, 10], ['s4', 11, 16], ['s5', 16, 23], ['s6', 23, 27.5]];
const TOTAL = 27.5;
const fx = $('fx').getContext('2d');

function motes(t) {
  fx.clearRect(0, 0, 1080, 1920);
  for (let i = 0; i < 80; i++) {
    const sp = 0.012 + hash(i, 2) * 0.03;
    const y = (hash(i, 1) - t * sp) % 1;
    const x = hash(i, 3) * 1080 + Math.sin(t * 0.8 + i) * 26;
    const r = 1.5 + hash(i, 4) * 3.6;
    fx.fillStyle = `rgba(245,191,23,${0.1 + 0.4 * hash(i, 5)})`;
    fx.beginPath(); fx.arc(x, (y < 0 ? y + 1 : y) * 1920, r, 0, 7); fx.fill();
  }
}

function s1(t) {
  const p = io(prog(t, 0.05, 1.15));
  const x = lerp(-60, 1040, p), y = 880;
  const inHero = t < 1.5;
  css($('c1'), { left: x + 'px', top: y + 'px', opacity: inHero ? 1 : 1 - prog(t, 1.5, 1.7) });
  css($('tr1'), { left: Math.max(-60, x - 620) + 'px', top: y + 'px', width: Math.min(620, x + 60) + 'px', opacity: 1 - prog(t, 1.35, 1.7) });
  css($('t1'), { clipPath: `inset(-30px ${Math.max(0, 1000 - x)}px -30px -30px)` });
  const m = out(prog(t, 1.5, 1.9));
  css($('mk1'), { transform: `scaleX(${m})` });
  $('mw1').style.color = m > 0.45 ? '#15140F' : '#fff';
  css($('ru1'), { opacity: prog(t, 1.3, 1.7), transform: `translateY(${20 * (1 - out(prog(t, 1.3, 1.7)))}px)` });
}

function s2(t) {
  const ws = document.querySelectorAll('.w');
  ws.forEach((w, i) => {
    const a = [0.1, 0.55, 1.5, 1.95][i], q = prog(t, a, a + 0.24);
    css(w, { opacity: q, transform: `scale(${lerp(1.5, 1, out(q))})`, filter: `blur(${(1 - q) * 14}px)` });
  });
  css($('ru2'), { opacity: prog(t, 0.6, 1) });
  css($('q'), { opacity: prog(t, 0.1, 0.8), transform: `rotate(${lerp(-10, 8, t / 3)}deg) scale(${lerp(0.9, 1.05, t / 3)})` });
}

function s3(t) {
  css($('h3'), { opacity: prog(t, 2.9, 3.1) }); css($('ru3'), { opacity: prog(t, 3, 3.2) });
  css($('stackIn'), { transform: `rotateX(${lerp(34, 24, t / 4)}deg) rotateY(${lerp(-16, 10, t / 4)}deg) rotateZ(${lerp(-9, -5, t / 4)}deg)` });
  document.querySelectorAll('.pn').forEach((p, i) => {
    const a = [0.1, 0.85, 1.55][i], q = out(prog(t, a, a + 0.45));
    const s = prog(t, 2.9 + i * 0.2, 3.05 + i * 0.2);
    css(p, { top: `${(i - 1) * 262 - 100}px`, opacity: q * (1 - 0.55 * s), transform: `translateZ(${lerp(600, i * 70, q)}px)` });
    p.querySelector('u').style.transform = `scaleX(${s})`;
  });
  const dim = 1 - prog(t, 3.75, 3.95);
  $('s3').style.opacity = dim;
}

function s4(t) {
  const g = out(prog(t, 0, 0.3));
  css($('logo'), { opacity: g, transform: `scale(${lerp(1.5, 1, g)})` });
  const q = prog(t, 0.95, 1.3);
  css($('sub4'), { opacity: q, transform: `translateY(${30 * (1 - out(q))}px)` });
  $('nA').style.opacity = 0; $('nB').style.opacity = 0; $('link').style.opacity = 0;
}

function nodes(t) {
  // Zarbadan oldingi jimlikda Startap va Investor bir-biriga tortiladi
  const p = Math.pow(prog(t, 10.1, 11), 3);
  const a = lerp(200, 540, p), b = lerp(880, 540, p);
  css($('nA'), { left: a + 'px', opacity: prog(t, 10, 10.2) });
  css($('nB'), { left: b + 'px', opacity: prog(t, 10, 10.2) });
  css($('link'), { left: a + 'px', width: b - a + 'px', opacity: prog(t, 10.05, 10.35) });
}

function s5(t) {
  const ln = (id, a, b) => {
    const q = out(prog(t, a, a + 0.3)), z = 1 - prog(t, b - 0.2, b);
    css($(id), { opacity: q * z, transform: `translateY(${(1 - q) * 40}px)` });
  };
  ln('la', 0.05, 2); ln('lb', 2.05, 4.2); ln('lc', 4.25, 8);
  const c = back(prog(t, 0, 0.6));
  const ry = lerp(-20, 12, io(prog(t, 0, 7))), rx = lerp(12, 5, io(prog(t, 0, 7)));
  const ok = prog(t, 4.7, 4.8);
  css($('card'), {
    transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${0.9 * c * (1 + 0.03 * ok * (1 - prog(t, 4.7, 5.3)))})`,
    borderColor: ok ? '#F5BF17' : 'rgba(245,191,23,.45)',
    boxShadow: `0 70px 110px rgba(0,0,0,.65), 0 0 ${90 + 120 * ok}px rgba(245,191,23,${0.16 + 0.4 * ok})`,
  });
  css($('ring'), { transform: `rotate(${t * 14}deg)`, opacity: c }); css($('ring2'), { transform: `rotate(${-t * 9}deg)`, opacity: c });

  // So'rov kartochkasi uchib keladi
  const f = prog(t, 2.2, 2.9), fe = io(f);
  css($('req'), { left: lerp(330, 640, fe) + 'px', top: lerp(1580, 720, fe) + 'px', opacity: f > 0 && f < 1 ? 1 : 0, transform: `rotate(${(1 - fe) * -8}deg) scale(${lerp(1.2, 0.5, fe)})` });
  const b = back(prog(t, 2.9, 3.15));
  css($('bdg'), { opacity: t > 2.9 ? 1 : 0, transform: `scale(${b})` });

  // Tugma va kursor
  const btn = back(prog(t, 3.3, 3.7));
  $('bt').innerHTML = ok ? '✓ Tasdiqlandi<span>Одобрено</span>' : 'Tasdiqlash<span>Одобрить</span>';
  css($('bt'), { opacity: t > 3.3 ? 1 : 0, transform: `scale(${btn * (t > 4.6 && t < 4.8 ? 0.95 : 1)})`, background: ok ? '#fff' : '#F5BF17' });
  const m = io(prog(t, 3.9, 4.6));
  css($('cur'), { left: lerp(980, 560, m) + 'px', top: lerp(1600, 1290, m) + 'px', opacity: t > 3.8 && t < 5.6 ? 1 : 0 });

  // Yashirin qatorlar birma-bir ochiladi
  document.querySelectorAll('.sec .val').forEach((v, i) => {
    const q = prog(t, 4.9 + i * 0.24, 5.05 + i * 0.24);
    if (q >= 0.5) { v.textContent = '✓ Ruxsat · Доступ'; v.classList.remove('lock'); css(v, { background: '#F5BF17', color: '#17170F', transform: `scale(${back(q)})` }); }
    else { v.textContent = '●●●●●●●●'; v.classList.add('lock'); css(v, { background: '', color: '', transform: '' }); }
  });
  css($('note5'), { opacity: prog(t, 5.4, 5.8) });
  $('bdg').style.display = t > 4.8 ? 'none' : 'grid';
}

function s6(t) {
  const r = io(prog(t, 0, 0.5));
  css($('gold'), { clipPath: `circle(${r * 1300}px at 540px 960px)` });
  const up = (id, a) => { const q = out(prog(t, a, a + 0.35)); css($(id), { opacity: q, transform: `translateY(${(1 - q) * 46}px)` }); };
  up('logo6', 0.1); up('h6', 0.15); up('ru6', 0.3); up('for6', 2.6);
  const u = back(prog(t, 1.85, 2.25));
  const beat = 1 + 0.018 * Math.max(0, Math.cos((t - 2.5) * Math.PI * 2)) * (t > 2.6 ? 1 : 0);
  css($('url'), { transform: `scale(${u * beat})` });
}

window.build = function () {
  const cues = [];
  const c = (t, name, gain = 1, rate = 1, cut = 0) => cues.push({ t, name, gain, rate, cut });
  const v = (t, line) => cues.push({ t, line, gain: 1, rate: 1 });
  c(0, 'bed');
  c(0.1, 'sweep', 0.9);
  c(1.4, 'pop', 1, 0.7);
  v(0.2, 'v1');
  c(3, 'hit', 0.8);
  [3.1, 3.55, 4.5, 4.95].forEach((a, i) => c(a, 'slamText', 0.8, 1 + i * 0.06));
  v(3.1, 'v2');
  c(6, 'whoosh', 1);
  [6.1, 6.85, 7.55].forEach((a) => c(a, 'whoosh', 0.45, 1.5));
  v(6.1, 'v3');
  [8.9, 9.1, 9.3].forEach((a) => c(a, 'strike', 1));
  v(8.9, 'v4');
  c(8.8, 'riser', 0.9);
  c(11, 'hit', 1.5);
  c(11.03, 'shimmer', 1);
  v(11.02, 'v5');
  v(12.1, 'v6');
  c(16, 'whoosh', 0.9);
  c(16.4, 'pop', 0.8, 1.2);
  v(16.1, 'v7');
  v(18.1, 'v8');
  c(18.2, 'whoosh', 0.8, 1.3);
  c(18.9, 'ding', 0.8, 1.4);
  c(19.3, 'pop', 1, 1.1);
  v(20.3, 'v9');
  c(20.7, 'click', 1.4);
  [20.9, 21.14, 21.38].forEach((a, i) => c(a, 'coin', 0.9, 1 + i * 0.12));
  c(23, 'hit', 1.2);
  c(23, 'whoosh', 1);
  v(23.15, 'v10');
  c(24.85, 'ding', 0.8);
  v(24.9, 'v11');
  return { duration: TOTAL * 1000, cues, bounds: SCENES.map(([, a, b]) => [a * 1000, b * 1000]) };
};

window.seek = function (ms) {
  const t = ms / 1000;
  motes(t);
  css($('floor'), { backgroundPosition: `0 ${t * 90}px`, opacity: t < 23 ? 1 : 0 });
  SCENES.forEach(([id, a, b]) => {
    if (id === 's3' || id === 's4') return;
    $(id).style.opacity = t >= a && t < b ? 1 : 0;
  });
  if (t >= 3 && t < 6) s2(t - 3);
  if (t < 3) s1(t);
    $('s3').style.opacity = t >= 6 && t < 10 ? 1 : 0;
  if (t >= 6 && t < 10) s3(t - 6);
  $('s4').style.opacity = t >= 10 && t < 16 ? 1 : 0;
  if (t >= 10 && t < 11) { css($('logo'), { opacity: 0 }); css($('sub4'), { opacity: 0 }); nodes(t); }
  if (t >= 11 && t < 16) s4(t - 11);
  if (t >= 16 && t < 23) s5(t - 16);
  if (t >= 23) s6(t - 23);
  $('flash').style.opacity = t >= 11 ? 1 - prog(t, 11, 11.35) : 0;
  // Sekin kamera yaqinlashishi: har sahna tirik turadi
  SCENES.forEach(([id, a, b]) => {
    if (id !== 's6' && id !== 's5') $(id).style.transform = `scale(${1 + 0.05 * prog(t, a, b)})`;
  });
};
