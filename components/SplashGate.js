'use client';

import { useLayoutEffect, useRef } from 'react';
import { SPLASH_KEY } from '@/lib/splash-key';

// Saytning ichida bosh sahifaga qaytilganda (sahifa yangilanmay) kirish animatsiyasini qayta ko'rsatmaydi.
// Sahifa birinchi yuklanishini Splash ichidagi kichik skript hal qiladi; bu yerda faqat keyingi o'tishlar.
export default function SplashGate() {
  const decided = useRef(false);
  useLayoutEffect(() => {
    // Qaror bir marta qabul qilinadi (React effektni qayta ishga tushirsa ham)
    if (decided.current) return;
    decided.current = true;
    const d = document.documentElement;
    // Birinchi yuklanish: skript allaqachon qaror qildi (animatsiya hozir o'ynayapti yoki yashirilgan)
    if (window.__invSplash === 1) { window.__invSplash = 2; return; }
    try {
      if (sessionStorage.getItem(SPLASH_KEY)) { d.classList.add('no-splash'); return; }
      sessionStorage.setItem(SPLASH_KEY, '1');
    } catch { d.classList.add('no-splash'); }
  }, []);
  return null;
}
