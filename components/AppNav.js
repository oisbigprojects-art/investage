'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GridIcon, InboxIcon, UserIcon, SearchIcon, BookmarkIcon, GlobeIcon, BellIcon, HomeIcon, PlusIcon } from './icons';

const ICONS = { grid: GridIcon, inbox: InboxIcon, user: UserIcon, search: SearchIcon, bookmark: BookmarkIcon, globe: GlobeIcon, bell: BellIcon, home: HomeIcon, plus: PlusIcon };

// sections: [{ title, items: [{ href, label, icon, exact?, badge? }] }]
export default function AppNav({ sections }) {
  const path = usePathname();
  const isOn = (it) => (it.exact ? path === it.href : path === it.href || path.startsWith(it.href + '/'));

  return (
    <nav className="side-nav" aria-label="Asosiy menyu">
      {sections.map((sec) => (
        <div className="side-sec" key={sec.title}>
          <span className="side-title">{sec.title}</span>
          {sec.items.map((it) => {
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
        </div>
      ))}
    </nav>
  );
}
