'use client';

import { useEffect, useRef, useState } from 'react';
import { LockIcon, UnlockIcon, ClockIcon, CheckIcon } from './icons';
import { Monogram, ScoreRing, StageBadge, Verified } from './ui';
import { stringsT } from '@/lib/i18n/client';


// Bosh sahifadagi namuna: yopiq ma'lumot so'rov → tasdiq orqali ochiladi.
// Namuna startaplar (har 3 soniyada almashadi). Bular haqiqiy startap emas.
const SAMPLES = [
  { keys: ['name', 'sector', 'desc'], score: 78, stage: 'mvp', verified: true, funding: '$50,000', equity: '10%', contact: '@namuna_agro' },
  { keys: ['s1_name', 's1_sector', 's1_desc'], score: 64, stage: 'goya', verified: false, funding: '$25,000', equity: '8%', contact: '@namuna_edu' },
  { keys: ['s2_name', 's2_sector', 's2_desc'], score: 71, stage: 'daromad', verified: true, funding: '$120,000', equity: '12%', contact: '@namuna_logistika' },
  { keys: ['s3_name', 's3_sector', 's3_desc'], score: 55, stage: 'mvp', verified: false, funding: '$80,000', equity: '15%', contact: '@namuna_fintech' },
];
const ROTATE_MS = 3000;

// Bu haqiqiy startap emas — faqat jarayonni ko'rsatadi.
export default function SealedDemo({ strings, lang }) {
  const t = stringsT(strings, lang);
  const [phase, setPhase] = useState('locked'); // locked | pending | open
  const timer = useRef(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Har 3 soniyada keyingi namuna; foydalanuvchi so'rov yuborayotgan yoki kursor ustida bo'lsa to'xtaydi
  useEffect(() => {
    if (phase !== 'locked' || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SAMPLES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [phase, paused]);

  function send() {
    if (phase !== 'locked') return;
    setPhase('pending');
    timer.current = setTimeout(() => setPhase('open'), 1800);
  }

  function reset() {
    clearTimeout(timer.current);
    setPhase('locked');
  }

  const sm = SAMPLES[idx];
  const [kName, kSector, kDesc] = sm.keys.map((k) => `demo.${k}`);
  const open = phase === 'open';
  const status = phase === 'locked' ? t('demo.st_none') : phase === 'pending' ? t('demo.st_wait') : t('demo.st_ok');

  return (
    <div
      className="demo"
      aria-label={t('demo.aria')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="demo-swap" key={idx}>
        <div className="demo-top">
          <Monogram name={t(kName)} size={48} />
          <div className="grow">
            <h3>{t(kName)}</h3>
            <span className="muted small">{t(kSector)}</span>
          </div>
          <ScoreRing value={sm.score} size={48} t={t} />
        </div>

        <p className="demo-desc">{t(kDesc)}</p>

        <div className="demo-meta">
          <StageBadge stage={sm.stage} t={t} />
          <Verified on={sm.verified} t={t} />
          <span className="chip chip-muted">{t('demo.badge')}</span>
        </div>
      </div>

      <div className={`sealed ${open ? 'is-open' : ''}`}>
        <div className="sealed-head">
          <b>{t('demo.sealed')}</b>
          <span className={`chip ${open ? 'chip-ok' : phase === 'pending' ? 'chip-warn' : 'chip-muted'}`}>
            <i aria-hidden="true" />
            {open ? t('demo.opened') : phase === 'pending' ? t('demo.waiting') : t('demo.closed')}
          </span>
        </div>

        <div className="srow">
          <span>{t('demo.funding')}</span>
          <b className="val" aria-hidden={!open}>
            {sm.funding}
          </b>
        </div>
        <div className="srow">
          <span>{t('demo.equity')}</span>
          <b className="val" aria-hidden={!open}>
            {sm.equity}
          </b>
        </div>
        <div className="srow">
          <span>{t('demo.contact')}</span>
          <b className="val" aria-hidden={!open}>
            {sm.contact}
          </b>
        </div>

        <div className="seal-cap" aria-hidden="true">
          {phase === 'pending' ? <ClockIcon size={18} /> : <LockIcon size={18} />}
          <span>{phase === 'pending' ? t('demo.cap_pending') : t('demo.cap_locked')}</span>
        </div>
      </div>

      <div className="demo-dots" role="tablist" aria-hidden={phase !== 'locked'}>
        {SAMPLES.map((_, i) => (
          <button key={i} type="button" className={i === idx ? 'is-on' : ''} onClick={() => phase === 'locked' && setIdx(i)} aria-label={`${i + 1}`} tabIndex={-1} />
        ))}
      </div>

      <div className="demo-foot">
        {open ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            {t('demo.again')}
          </button>
        ) : (
          <button type="button" className="btn btn-gold btn-sm" onClick={send} aria-disabled={phase === 'pending'}>
            {phase === 'pending' ? (
              <>
                <ClockIcon size={16} /> {t('demo.sent')}
              </>
            ) : (
              t('demo.send')
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
