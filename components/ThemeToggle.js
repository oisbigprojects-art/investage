'use client';

import { useEffect, useState } from 'react';

// Yorug' / qorong'u rejim: <html data-theme> o'zgaradi va cookie'ga yoziladi (sahifa qayta yuklanmaydi)
export default function ThemeToggle({ initial = 'light', labels }) {
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    const cur = document.documentElement.dataset.theme;
    if (cur === 'dark' || cur === 'light') setTheme(cur);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax${secure}`;
    } catch {}
  }

  const dark = theme === 'dark';
  const label = dark ? labels.light : labels.dark;
  return (
    <button type="button" className="icon-btn theme-btn" onClick={toggle} aria-label={label} title={label}>
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="10" cy="10" r="3.6" />
          <path d="M10 2v1.8M10 16.2V18M2 10h1.8M16.2 10H18M4.3 4.3l1.3 1.3M14.4 14.4l1.3 1.3M4.3 15.7l1.3-1.3M14.4 5.6l1.3-1.3" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16.5 12.3A7 7 0 017.7 3.5a7 7 0 108.8 8.8z" />
        </svg>
      )}
    </button>
  );
}
