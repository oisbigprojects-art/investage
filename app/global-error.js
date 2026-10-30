'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Butun sayt (shu jumladan asosiy layout) ishlamay qolganda ko'rinadigan oxirgi zaxira sahifa.
// Layout ishlamagani uchun stil va matn shu yerda, uch tilda birga.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="uz">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F5F5F3', color: '#1d1d1b' }}>
        <div style={{ maxWidth: 520, margin: '18vh auto', padding: '0 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Investage</h1>
          <p>Nimadir noto‘g‘ri ketdi. · Что-то пошло не так. · Something went wrong.</p>
          <button type="button" onClick={() => reset()} style={{ marginTop: 12, padding: '10px 22px', borderRadius: 999, border: 0, background: '#F5BF17', fontWeight: 700, cursor: 'pointer' }}>
            Qayta urinish · Повторить · Try again
          </button>
        </div>
      </body>
    </html>
  );
}
