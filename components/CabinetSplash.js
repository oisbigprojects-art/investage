'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

// Kabinetga kirilganda ko'rinadigan animatsiya: startapga — raketa uchishi, investorga — tangalar ustuni va o'sish o'qi.
// Layout kabinet ichida sahifalar almashganda qayta yuklanmaydi, shuning uchun animatsiya faqat kirishda (va yangilaganda) chiqadi.
export default function CabinetSplash({ labels }) {
  const pathname = usePathname() || '';
  // Kirish paytidagi holat saqlanadi: keyin sahifa almashsa ham animatsiya o'zgarmaydi
  const [kind] = useState(() => (pathname.startsWith('/kabinet/startap') ? 'startup' : pathname.startsWith('/kabinet/investor') ? 'investor' : null));
  if (!kind) return null;

  return (
    <div className="csplash-host">
      <div className={`csplash csplash-${kind}`} aria-hidden="true">
        {kind === 'startup' ? (
          <div className="cs-scene">
            <svg className="cs-rocket-wrap" viewBox="0 0 80 130" fill="none" focusable="false">
              <g className="cs-rocket">
                <path className="cs-flame" d="M30 82 Q40 124 50 82 Z" />
                <path className="cs-fin" d="M22 62 L8 84 L24 78 Z M58 62 L72 84 L56 78 Z" />
                <path className="cs-body" d="M40 6 C56 24 60 52 56 82 L24 82 C20 52 24 24 40 6 Z" />
                <circle className="cs-window" cx="40" cy="44" r="8" />
                <circle className="cs-glint" cx="37.5" cy="41.5" r="2.4" />
              </g>
            </svg>
            <span className="cs-star cs-s1" />
            <span className="cs-star cs-s2" />
            <span className="cs-star cs-s3" />
            <span className="cs-star cs-s4" />
            <span className="cs-label">{labels.startup}</span>
          </div>
        ) : (
          <div className="cs-scene">
            <svg className="cs-coins" viewBox="0 0 120 120" fill="none" focusable="false">
              <rect className="cs-coin cs-c1" x="20" y="98" width="80" height="16" rx="8" />
              <rect className="cs-coin cs-c2" x="20" y="80" width="80" height="16" rx="8" />
              <rect className="cs-coin cs-c3" x="20" y="62" width="80" height="16" rx="8" />
              <rect className="cs-coin cs-c4" x="20" y="44" width="80" height="16" rx="8" />
              <path className="cs-arrow" pathLength="1" d="M30 30 L56 18 L72 24 L100 6 M100 6 L88 6 M100 6 L100 18" />
            </svg>
            <span className="cs-label">{labels.investor}</span>
          </div>
        )}
      </div>
    </div>
  );
}
