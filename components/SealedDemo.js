'use client';

import { useEffect, useRef, useState } from 'react';
import { LockIcon, UnlockIcon, ClockIcon, CheckIcon } from './icons';
import { Monogram, ScoreRing, StageBadge, Verified } from './ui';

// Bosh sahifadagi namuna: yopiq ma'lumot so'rov → tasdiq orqali ochiladi.
// Bu haqiqiy startap emas — faqat jarayonni ko'rsatadi.
export default function SealedDemo() {
  const [phase, setPhase] = useState('locked'); // locked | pending | open
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function send() {
    if (phase !== 'locked') return;
    setPhase('pending');
    timer.current = setTimeout(() => setPhase('open'), 1800);
  }

  function reset() {
    clearTimeout(timer.current);
    setPhase('locked');
  }

  const open = phase === 'open';
  const status =
    phase === 'locked'
      ? "So'rov yuborilmagan"
      : phase === 'pending'
        ? 'Startap javobini kutyapsiz'
        : 'Startap ruxsat berdi';

  return (
    <div className="demo" aria-label="Namuna: yopiq ma'lumot qanday ochiladi">
      <div className="demo-top">
        <Monogram name="N" size={48} />
        <div className="grow">
          <h3>Namunaviy startap</h3>
          <span className="muted small">Agrotexnologiya</span>
        </div>
        <ScoreRing value={78} size={48} />
      </div>

      <p className="demo-desc">Tuproq namligini kuzatuvchi datchiklar va fermerlar uchun ilova.</p>

      <div className="demo-meta">
        <StageBadge stage="mvp" />
        <Verified on />
        <span className="chip chip-muted">Namuna</span>
      </div>

      <div className={`sealed ${open ? 'is-open' : ''}`}>
        <div className="sealed-head">
          <b>Yopiq ma&apos;lumot</b>
          <span className={`chip ${open ? 'chip-ok' : phase === 'pending' ? 'chip-warn' : 'chip-muted'}`}>
            <i aria-hidden="true" />
            {open ? 'Ochildi' : phase === 'pending' ? 'Kutilmoqda' : 'Yopiq'}
          </span>
        </div>

        <div className="srow">
          <span>Kerakli mablag&apos;</span>
          <b className="val" aria-hidden={!open}>
            $50,000
          </b>
        </div>
        <div className="srow">
          <span>Ulush</span>
          <b className="val" aria-hidden={!open}>
            10%
          </b>
        </div>
        <div className="srow">
          <span>Kontakt</span>
          <b className="val" aria-hidden={!open}>
            @namuna_startap
          </b>
        </div>

        <div className="seal-cap" aria-hidden="true">
          {phase === 'pending' ? <ClockIcon size={18} /> : <LockIcon size={18} />}
          <span>{phase === 'pending' ? "So'rov ko'rib chiqilmoqda" : "Ruxsatsiz ko'rinmaydi"}</span>
        </div>
      </div>

      <div className="demo-foot">
        {open ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            Qaytadan ko&apos;rish
          </button>
        ) : (
          <button type="button" className="btn btn-gold btn-sm" onClick={send} aria-disabled={phase === 'pending'}>
            {phase === 'pending' ? (
              <>
                <ClockIcon size={16} /> So&apos;rov yuborildi
              </>
            ) : (
              "Kirish so'rovini yuborish"
            )}
          </button>
        )}
        <span className="demo-status" role="status" aria-live="polite">
          {open ? <UnlockIcon size={15} /> : phase === 'pending' ? <CheckIcon size={15} /> : <LockIcon size={15} />}
          {status}
        </span>
      </div>
    </div>
  );
}
