'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GridIcon, InboxIcon, UserIcon, SearchIcon, BookmarkIcon, GlobeIcon } from './icons';

const ICONS = { grid: GridIcon, inbox: InboxIcon, user: UserIcon, search: SearchIcon, bookmark: BookmarkIcon, globe: GlobeIcon };

// items: [{ href, label, icon, exact?, badge? }]
export default function CabinetNav({ items, name, roleLabel, hint }) {
  const path = usePathname();
  const isOn = (it) => (it.exact ? path === it.href : path === it.href || path.startsWith(it.href + '/'));

  return (
    <aside className="cab-side">
      <div className="side-user">
        <span className="side-avatar" aria-hidden="true">
          {(name || '?').trim().charAt(0).toUpperCase()}
        </span>
        <div>
          <b>{name || 'Foydalanuvchi'}</b>
          <span>{roleLabel}</span>
        </div>
      </div>
      <nav className="side-nav" aria-label="Kabinet menyusi">
        {items.map((it) => {
          const Icon = ICONS[it.icon] || GridIcon;
          const on = isOn(it);
          return (
            <Link key={it.href} href={it.href} className={`side-link ${on ? 'is-on' : ''}`} aria-current={on ? 'page' : undefined}>
              <Icon size={18} />
              <span>{it.label}</span>
              {it.badge > 0 && <em className="side-badge">{it.badge}</em>}
            </Link>
          );
        })}
      </nav>
      {hint && <p className="side-hint small muted">{hint}</p>}
    </aside>
  );
}
