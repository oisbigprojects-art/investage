'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MobileMenu from './MobileMenu';
import { GridIcon, InboxIcon, UserIcon, SearchIcon, BookmarkIcon, HomeIcon, UsersIcon, ChatIcon, HelpIcon } from './icons';

const ICONS = { grid: GridIcon, inbox: InboxIcon, user: UserIcon, search: SearchIcon, bookmark: BookmarkIcon, home: HomeIcon, users: UsersIcon, chat: ChatIcon, help: HelpIcon };

// Telefonda ilova sahifalarining pastki navigatsiya paneli: 4 ta asosiy bo'lim + "Menyu" (qolgan hamma narsa).
// tabs: [{ href, label, icon, exact?, badge? }]; children — menyu ichidagi kontent (serverda chiziladi).
export default function MobileNav({ tabs, label, menuLabel, closeLabel, children }) {
  const path = usePathname();
  const isOn = (it) => (it.exact ? path === it.href : path === it.href || path.startsWith(it.href + '/'));

  return (
    <nav className="tabbar" aria-label={label}>
      {tabs.map((it) => {
        const Icon = ICONS[it.icon] || GridIcon;
        const on = isOn(it);
        return (
          <Link key={it.href} href={it.href} className={`tab ${on ? 'is-on' : ''}`} aria-current={on ? 'page' : undefined}>
            <span className="tab-ico">
              <Icon size={22} />
              {it.badge > 0 && <em className="tab-badge">{it.badge > 9 ? '9+' : it.badge}</em>}
            </span>
            <span>{it.label}</span>
          </Link>
        );
      })}
      <MobileMenu variant="tab" label={menuLabel} closeLabel={closeLabel}>
        {children}
      </MobileMenu>
    </nav>
  );
}
