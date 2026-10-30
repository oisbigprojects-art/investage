'use client';

import { useEffect, useRef, useState } from 'react';
import { LockIcon, UnlockIcon, ClockIcon, SendIcon } from './icons';
import { stringsT } from '@/lib/i18n/client';

// "Ruxsat qanday ishlaydi": matn aylantirilgan sari yonidagi karta holati o'zgaradi (yopiq → so'rov → ochiq)
export default function HomeStory({ steps, strings, lang }) {
  const t = stringsT(strings, lang);
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const rows = [[t('demo.funding'), '$50,000'], [t('demo.equity'), '10%'], [t('demo.contact'), '@namuna']];
  const open = active === 2;
  return (
    <div className="story">
      <div className="story-stick">
        <div className={`story-card is-${active}`} aria-hidden="true">
          <div className="story-top">
            <b>{t('demo.name')}</b>
            <span className={`chip ${open ? 'chip-ok' : active === 1 ? 'chip-warn' : 'chip-muted'}`}>
              {open ? <UnlockIcon size={14} /> : active === 1 ? <ClockIcon size={14} /> : <LockIcon size={14} />}
              {open ? t('demo.opened') : active === 1 ? t('demo.waiting') : t('demo.closed')}
            </span>
          </div>
          {rows.map(([k, v]) => (
            <div className="srow" key={k}>
              <span>{k}</span>
              <b className={open ? '' : 'story-blur'}>{v}</b>
            </div>
          ))}
          <div className="story-bubble"><SendIcon size={15} /> {t('demo.sent')}</div>
        </div>
      </div>
      <ol className="story-steps">
        {steps.map((s, i) => (
          <li key={s.title} ref={(el) => { refs.current[i] = el; }} data-i={i} className={active === i ? 'is-on' : ''}>
            <span className="step-n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
