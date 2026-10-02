'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin', label: "Umumiy ko'rinish", exact: true },
  { href: '/admin/startaplar', label: 'Startaplar' },
  { href: '/admin/foydalanuvchilar', label: 'Foydalanuvchilar' },
  { href: '/admin/murojaatlar', label: 'Murojaatlar' },
];

export default function AdminTabs() {
  const path = usePathname();
  return (
    <nav className="filters admin-tabs" aria-label="Admin bo'limlari">
      {TABS.map((t) => {
        const on = t.exact ? path === t.href : path === t.href || path.startsWith(t.href + '/');
        return (
          <Link key={t.href} href={t.href} className={`filter ${on ? 'is-on' : ''}`} aria-current={on ? 'page' : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
