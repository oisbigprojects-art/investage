'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

const OPTIONS = [
  { code: 'uz', short: 'UZ', name: "O'zbekcha" },
  { code: 'ru', short: 'RU', name: 'Русский' },
  { code: 'en', short: 'EN', name: 'English' },
];

// Til tanlash: cookie yoziladi va sahifa serverda qayta chiziladi (manzil va filtrlar saqlanadi)
export default function LangSwitch({ current, label }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(code) {
    if (code === current) return;
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `lang=${code}; path=/; max-age=31536000; SameSite=Lax${secure}`;
    } catch {
      return;
    }
    start(() => router.refresh());
  }

  return (
    <div className={`lang-switch ${pending ? 'is-busy' : ''}`} role="group" aria-label={label}>
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          className={o.code === current ? 'is-on' : ''}
          onClick={() => choose(o.code)}
          aria-pressed={o.code === current}
          title={o.name}
          lang={o.code}
        >
          {o.short}
        </button>
      ))}
    </div>
  );
}
