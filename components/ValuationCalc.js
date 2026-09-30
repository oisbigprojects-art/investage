'use client';

import { useState } from 'react';
import { stringsT } from '@/lib/i18n/client';

export const CALC_KEYS = ['title', 'sub', 'amount', 'equity', 'pre', 'post', 'err', 'note'].map((k) => `calc.${k}`);

const LOCALES = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

// Oddiy hisob: post-money = summa / ulush, pre-money = post-money − summa
export default function ValuationCalc({ strings, lang }) {
  const t = stringsT(strings, lang);
  const [amount, setAmount] = useState(50000);
  const [equity, setEquity] = useState(10);

  const fmt = (n) => '$' + new Intl.NumberFormat(LOCALES[lang] || 'en-US', { maximumFractionDigits: 0 }).format(n);
  const a = Number(amount);
  const e = Number(equity);
  const ok = a > 0 && e >= 1 && e <= 99;
  const post = ok ? a / (e / 100) : 0;
  const pre = ok ? post - a : 0;

  return (
    <div className="calc">
      <div className="calc-copy">
        <h2>{t('calc.title')}</h2>
        <p className="muted">{t('calc.sub')}</p>
        <p className="small muted">{t('calc.note')}</p>
      </div>

      <div className="calc-box">
        <label>
          <span className="calc-lab">
            {t('calc.amount')} <b className="num">{a > 0 ? fmt(a) : '—'}</b>
          </span>
          <input
            type="range"
            min="5000"
            max="1000000"
            step="5000"
            value={Math.min(Math.max(a || 0, 5000), 1000000)}
            onChange={(ev) => setAmount(ev.target.value)}
            aria-label={t('calc.amount')}
          />
          <input type="number" inputMode="numeric" min="1" value={amount} onChange={(ev) => setAmount(ev.target.value)} />
        </label>

        <label>
          <span className="calc-lab">
            {t('calc.equity')} <b className="num">{e >= 0 ? `${e}%` : '—'}</b>
          </span>
          <input type="range" min="1" max="99" step="1" value={Math.min(Math.max(e || 1, 1), 99)} onChange={(ev) => setEquity(ev.target.value)} aria-label={t('calc.equity')} />
        </label>

        <div className="calc-out" role="status" aria-live="polite">
          {ok ? (
            <>
              <div>
                <span>{t('calc.pre')}</span>
                <b className="num">{fmt(pre)}</b>
              </div>
              <div>
                <span>{t('calc.post')}</span>
                <b className="num">{fmt(post)}</b>
              </div>
            </>
          ) : (
            <p className="small">{t('calc.err')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
