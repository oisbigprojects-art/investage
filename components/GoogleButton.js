'use client';

import { useEffect, useRef, useState } from 'react';
import { googleIdToken } from '@/app/auth-actions';

// Google OAuth mijoz identifikatori ochiq ma'lumot (sir emas). Supabase'dagi Google sozlamasidagi bilan bir xil.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '674908567819-gjio61t5c3ucfnr9milbara47cr1936o.apps.googleusercontent.com';
const SRC = 'https://accounts.google.com/gsi/client';
let loading;

function loadScript() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => {
        loading = null;
        reject(new Error('gsi'));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

async function makeNonce() {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return [raw, [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')];
}

// Google'ning o'z tugmasi: oyna Google'da ochiladi va unda investage.uz ko'rinadi (supabase.co emas).
// Google sozlanmaguncha (NEXT_PUBLIC_GOOGLE_AUTH=1) tugma ko'rinmaydi.
export default function GoogleButton({ orLabel, errLabel, lang = 'uz' }) {
  const box = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const on = process.env.NEXT_PUBLIC_GOOGLE_AUTH === '1';

  useEffect(() => {
    if (!on) return undefined;
    let gone = false;
    let ro;
    (async () => {
      try {
        const [[raw, hashed]] = await Promise.all([makeNonce(), loadScript()]);
        if (gone || !box.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          nonce: hashed,
          ux_mode: 'popup',
          context: 'signin',
          callback: async ({ credential }) => {
            setBusy(true);
            setError('');
            const r = await googleIdToken(credential, raw).catch(() => ({ error: errLabel }));
            if (r?.next) {
              window.location.assign(r.next);
              return;
            }
            setBusy(false);
            setError(r?.error || errLabel);
          },
        });
        // Google tugmasining kengligi pikselda beriladi: konteynerga moslab chiziladi va ekran o'lchami o'zgarsa qayta chiziladi
        let drawn = 0;
        const draw = () => {
          const w = Math.round(Math.min(400, Math.max(200, box.current?.clientWidth || 320)));
          if (gone || !box.current || Math.abs(w - drawn) < 8) return;
          drawn = w;
          window.google.accounts.id.renderButton(box.current, {
            type: 'standard',
            theme: document.documentElement.dataset.theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'center',
            width: w,
            locale: lang,
          });
        };
        draw();
        ro = new ResizeObserver(draw);
        ro.observe(box.current);
      } catch {
        if (!gone) setError(errLabel);
      }
    })();
    return () => {
      gone = true;
      ro?.disconnect();
    };
  }, [on, lang, errLabel]);

  if (!on) return null;
  return (
    <div className="google-form">
      <div ref={box} className="google-gsi" aria-busy={busy} />
      {error && <p className="small center google-err" role="alert">{error}</p>}
      <p className="muted small center google-or">{orLabel}</p>
    </div>
  );
}
