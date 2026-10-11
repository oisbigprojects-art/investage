'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { submitSurvey } from '@/app/survey-actions';
import s from './survey.module.css';

const isEmpty = (v) => v === undefined || v === null || v === false || v === 0 || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);

// Typeform uslubidagi so'rovnoma: har ekranda bitta savol, progress, klaviatura (A-Z, 1-5, Enter)
export default function Survey({ kind, title, questions }) {
  const total = questions.length;
  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [err, setErr] = useState('');
  const [phase, setPhase] = useState('ask'); // ask | sending | done
  const [hp, setHp] = useState('');
  const stage = useRef(null);
  const q = questions[i];
  const last = i === total - 1;
  const cur = ans[q.id];

  function set(v) {
    setAns((a) => ({ ...a, [q.id]: v }));
    setErr('');
  }

  function pickSingle(opt) {
    set(opt);
    if (!last) {
      const idx = i;
      setTimeout(() => setI((x) => (x === idx ? idx + 1 : x)), 260);
    }
  }

  function toggle(opt) {
    const list = Array.isArray(cur) ? cur : [];
    if (list.includes(opt)) set(list.filter((x) => x !== opt));
    else if (q.max && list.length >= q.max) setErr("Eng ko'pi bilan " + q.max + ' ta tanlang');
    else set([...list, opt]);
  }

  async function send() {
    setPhase('sending');
    let res;
    try {
      res = await submitSurvey(kind, ans, hp);
    } catch {
      res = { ok: false, error: "Yuborib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring." };
    }
    if (res && res.ok) setPhase('done');
    else {
      setPhase('ask');
      setErr((res && res.error) || "Yuborib bo'lmadi.");
    }
  }

  function go() {
    if (phase !== 'ask') return;
    if (q.required && isEmpty(cur)) {
      setErr(q.type === 'consent' ? "Davom etish uchun rozilik belgisini qo'ying" : 'Bu savolga javob berish majburiy');
      return;
    }
    setErr('');
    if (last) send();
    else setI((x) => x + 1);
  }

  function back() {
    setErr('');
    setI((x) => Math.max(0, x - 1));
  }

  useEffect(() => {
    if (phase !== 'ask') return undefined;
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target && e.target.tagName;
      const typing = tag === 'TEXTAREA' || (tag === 'INPUT' && e.target.type === 'text');
      if (e.key === 'Enter' && tag !== 'TEXTAREA' && tag !== 'BUTTON') {
        e.preventDefault();
        go();
        return;
      }
      if (typing) return;
      if ((q.type === 'single' || q.type === 'multi') && /^[a-z]$/i.test(e.key)) {
        const opt = q.options[e.key.toUpperCase().charCodeAt(0) - 65];
        if (opt) {
          if (q.type === 'single') pickSingle(opt);
          else toggle(opt);
        }
      }
      if (q.type === 'scale' && /^[1-5]$/.test(e.key)) set(Number(e.key));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const el = stage.current && stage.current.querySelector('input[type="text"], textarea');
    if (el) el.focus({ preventScroll: true });
  }, [i, phase]);

  if (phase === 'done') {
    return (
      <div className={s.page}>
        <header className={s.top}>
          <Link href="/" aria-label="Investage">
            <img src="/logo-dark.webp" alt="Investage" />
          </Link>
        </header>
        <main className={s.main}>
          <div className={`${s.stage} ${s.done}`}>
            <h1>Rahmat!</h1>
            <p>Javoblaringiz qabul qilindi. Bu bizga platformani haqiqiy ehtiyojga moslab qurishga yordam beradi.</p>
            <div className={s.doneBtns}>
              <Link className="btn btn-gold" href="/royxat">Investage'da ro'yxatdan o'tish</Link>
              <Link className="btn btn-ghost" href="/">Bosh sahifa</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const list = Array.isArray(cur) ? cur : [];
  const nextLabel = last ? 'Yuborish' : q.required || !isEmpty(cur) ? 'Davom etish' : "O'tkazib yuborish";

  return (
    <div className={s.page}>
      <header className={s.top}>
        <Link href="/sorovnoma" aria-label="Chiqish">
          <img src="/logo-dark.webp" alt="Investage" />
        </Link>
        <span className={s.count} aria-label={title}>
          {i + 1} / {total}
        </span>
      </header>
      <div className={s.bar} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i + 1}>
        <i style={{ width: ((i + 1) / total) * 100 + '%' }} />
      </div>
      <main className={s.main}>
        <div key={i} ref={stage} className={s.stage}>
          <p className={s.num}>
            {i + 1}
            {q.required ? ' *' : ''}
          </p>
          <h1 className={s.q}>{q.q}</h1>
          {q.hint && <p className={s.hint}>{q.hint}</p>}

          {(q.type === 'text' || q.type === 'contact') && (
            <input type="text" className={s.input} value={cur || ''} maxLength={q.max || 120} placeholder={q.placeholder || 'Javobingizni yozing...'} onChange={(e) => set(e.target.value)} aria-label={q.q} />
          )}

          {q.type === 'long' && (
            <textarea className={s.area} value={cur || ''} maxLength={q.max || 1500} rows={5} placeholder="Javobingizni yozing..." onChange={(e) => set(e.target.value)} aria-label={q.q} />
          )}

          {q.type === 'single' && (
            <div className={s.opts} role="group" aria-label={q.q}>
              {q.options.map((o, n) => (
                <button key={o} type="button" className={s.opt} aria-pressed={cur === o} onClick={() => pickSingle(o)}>
                  <span className={s.k}>{String.fromCharCode(65 + n)}</span>
                  {o}
                </button>
              ))}
            </div>
          )}

          {q.type === 'multi' && (
            <div className={s.opts} role="group" aria-label={q.q}>
              {q.options.map((o, n) => (
                <button key={o} type="button" className={s.opt} aria-pressed={list.includes(o)} onClick={() => toggle(o)}>
                  <span className={s.k}>{String.fromCharCode(65 + n)}</span>
                  {o}
                </button>
              ))}
            </div>
          )}

          {q.type === 'scale' && (
            <>
              <div className={s.scale} role="group" aria-label={q.q}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" className={s.scaleBtn} aria-pressed={cur === n} onClick={() => set(n)}>
                    {n}
                  </button>
                ))}
              </div>
              <div className={s.scaleLbl}>
                <span>{q.low}</span>
                <span>{q.high}</span>
              </div>
            </>
          )}

          {q.type === 'consent' && (
            <label className={s.consent}>
              <input type="checkbox" checked={cur === true} onChange={(e) => set(e.target.checked)} />
              <span>{q.label}</span>
            </label>
          )}

          {err && (
            <p className={s.err} role="alert">
              {err}
            </p>
          )}

          <div className={s.nav}>
            {i > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={back} disabled={phase === 'sending'}>
                Orqaga
              </button>
            )}
            <button type="button" className="btn btn-gold" onClick={go} disabled={phase === 'sending'}>
              {phase === 'sending' ? 'Yuborilmoqda...' : nextLabel}
            </button>
            <span className={s.keys}>Enter bosing</span>
          </div>
        </div>
      </main>
      <input type="text" name="website" className={s.hp} value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" />
    </div>
  );
}
