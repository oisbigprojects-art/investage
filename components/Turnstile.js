'use client';

import { useEffect, useRef } from 'react';

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading;

function loadScript() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return loading;
}

// Bot tekshiruvi (Cloudflare Turnstile). Shakl ichiga "cf-turnstile-response" yashirin maydonini qo'shadi.
// Token bir martalik: sahifada key={Date.now()} berilgani uchun server javobidan keyin vidjet yangilanadi.
export default function Turnstile() {
  const box = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return undefined;
    let id;
    let gone = false;
    loadScript()
      .then(() => {
        if (!gone && box.current) id = window.turnstile.render(box.current, { sitekey: siteKey, size: 'flexible', theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light' });
      })
      .catch(() => {});
    return () => {
      gone = true;
      if (id !== undefined) window.turnstile?.remove(id);
    };
  }, [siteKey]);

  return siteKey ? <div ref={box} className="turnstile" /> : null;
}
