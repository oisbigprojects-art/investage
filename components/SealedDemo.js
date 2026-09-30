'use client';

import { useEffect, useRef, useState } from 'react';
import { LockIcon, UnlockIcon, ClockIcon, CheckIcon } from './icons';
import { Monogram, ScoreRing, StageBadge, Verified } from './ui';
import { stringsT } from '@/lib/i18n/client';


// Bosh sahifadagi namuna: yopiq ma'lumot so'rov → tasdiq orqali ochiladi.
// Bu haqiqiy startap emas — faqat jarayonni ko'rsatadi.
export default function SealedDemo({ strings, lang }) {
  const t = stringsT(strings, lang);
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
  const status = phase === 'locked' ? t('demo.st_none') : phase === 'pending' ? t('demo.st_wait') : t('demo.st_ok');

  return (
    <div className="demo" aria-label={t('demo.aria')}>
      <div className="demo-top">
        <Monogram name={t('demo.name')} size={48} />
        <div className="grow">
          <h3>{t('demo.name')}</h3>
          <span className="muted small">{t('demo.sector')}</span>
        </div>
        <ScoreRing value={78} size={48} t={t} />
      </div>

      <p className="demo-desc">{t('demo.desc')}</p>

      <div className="demo-meta">
        <StageBadge stage="mvp" t={t} />
        <Verified on t={t} />
        <span className="chip chip-muted">{t('demo.badge')}</span>
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
            $50,000
          </b>
        </div>
        <div className="srow">
          <span>{t('demo.equity')}</span>
          <b className="val" aria-hidden={!open}>
            10%
          </b>
        </div>
        <div className="srow">
          <span>{t('demo.contact')}</span>
          <b className="val" aria-hidden={!open}>
            @namuna_startap
          </b>
        </div>

        <div className="seal-cap" aria-hidden="true">
          {phase === 'pending' ? <ClockIcon size={18} /> : <LockIcon size={18} />}
          <span>{phase === 'pending' ? t('demo.cap_pending') : t('demo.cap_locked')}</span>
        </div>
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
