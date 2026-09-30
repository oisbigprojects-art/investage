import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import LangSwitch from '@/components/LangSwitch';
import ThemeToggle from '@/components/ThemeToggle';
import { getTheme } from '@/lib/i18n/server';
import { getRequests, getSaved, getMyStartup } from '@/lib/data';
import { buildEvents, notificationsOf } from '@/lib/events';
import { logout } from '@/app/auth-actions';
import { markNotificationsSeen } from '@/app/cabinet-actions';
import Logo from '@/components/Logo';
import AppNav from '@/components/AppNav';
import { BellIcon, SearchIcon, LogoutIcon } from '@/components/icons';
import { timeAgo } from '@/lib/labels';

function initial(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

// ---------------- Chap menyu ----------------
export function SidebarFallback() {
  return (
    <aside className="side" aria-hidden="true">
      <Link href="/" className="side-logo">
        <Logo height={24} />
      </Link>
      <div className="side-nav">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="skel skel-side" />
        ))}
      </div>
    </aside>
  );
}

export async function Sidebar() {
  const [{ user, profile }, t] = await Promise.all([getSession(), getT()]);
  const role = profile?.role;

  let sections;
  if (!user) {
    sections = [
      {
        title: t('shell.sec_site'),
        items: [
          { href: '/', label: t('nav.home'), icon: 'home', exact: true },
          { href: '/startaplar', label: t('nav.startups'), icon: 'search' },
          { href: '/investorlar', label: t('nav.investors'), icon: 'users' },
          { href: '/yordam', label: t('nav.help'), icon: 'help' },
        ],
      },
    ];
  } else if (role === 'startup') {
    const [requests, s] = await Promise.all([getRequests(), getMyStartup(user.id)]);
    const pending = requests.filter((r) => r.status === 'pending').length;
    const { unread } = notificationsOf(buildEvents('startup', requests, [], t), profile.notifications_seen_at);
    sections = [
      {
        title: t('shell.sec_panel'),
        items: [
          { href: '/kabinet/startap', label: t('shell.overview'), icon: 'grid', exact: true },
          { href: '/kabinet/startap/sorovlar', label: t('shell.requests'), icon: 'inbox', badge: pending },
          { href: '/kabinet/bildirishnomalar', label: t('shell.notifications'), icon: 'bell', badge: unread },
        ],
      },
      {
        title: t('shell.sec_startup'),
        items: [
          { href: '/kabinet/startap/profil', label: t('shell.profile'), icon: 'user' },
          ...(s ? [{ href: `/startaplar/${s.id}`, label: t('shell.public_page'), icon: 'globe', exact: true }] : []),
        ],
      },
      {
        title: t('shell.sec_catalog'),
        items: [
          { href: '/startaplar', label: t('nav.startups'), icon: 'search', exact: true },
          { href: '/investorlar', label: t('nav.investors'), icon: 'users' },
        ],
      },
      { title: t('shell.sec_support'), items: [{ href: '/yordam', label: t('nav.help'), icon: 'help' }] },
    ];
  } else {
    const [requests, saved] = await Promise.all([getRequests(), getSaved()]);
    const pending = requests.filter((r) => r.status === 'pending').length;
    const { unread } = notificationsOf(buildEvents('investor', requests, saved, t), profile.notifications_seen_at);
    sections = [
      {
        title: t('shell.sec_panel'),
        items: [
          { href: '/kabinet/investor', label: t('shell.overview'), icon: 'grid', exact: true },
          { href: '/kabinet/investor/sorovlar', label: t('shell.my_requests'), icon: 'inbox', badge: pending },
          { href: '/kabinet/investor/saqlangan', label: t('shell.saved'), icon: 'bookmark', badge: saved.length },
          { href: '/kabinet/bildirishnomalar', label: t('shell.notifications'), icon: 'bell', badge: unread },
        ],
      },
      {
        title: t('shell.sec_catalog'),
        items: [
          { href: '/startaplar', label: t('nav.startups'), icon: 'search' },
          { href: '/investorlar', label: t('nav.investors'), icon: 'users' },
        ],
      },
      {
        title: t('shell.sec_account'),
        items: [
          { href: '/kabinet/investor/profil', label: t('shell.profile'), icon: 'user' },
          { href: '/yordam', label: t('nav.help'), icon: 'help' },
        ],
      },
    ];
  }

  return (
    <aside className="side">
      <Link href="/" className="side-logo" aria-label={t('brand.home_aria')}>
        <Logo height={24} />
      </Link>
      <AppNav sections={sections} label={t('nav.main')} />

      {!user ? (
        <div className="side-promo">
          <b>{t('shell.promo_title')}</b>
          <p className="small muted">{t('shell.promo_text')}</p>
          <Link className="btn btn-gold btn-sm" href="/royxat">
            {t('nav.signup')}
          </Link>
          <Link className="btn btn-ghost btn-sm" href="/kirish">
            {t('nav.login')}
          </Link>
        </div>
      ) : (
        <div className="side-user">
          <span className="side-avatar" aria-hidden="true">
            {initial(profile.full_name)}
          </span>
          <div>
            <b>{profile.full_name || t('shell.user_default')}</b>
            <span>{role === 'startup' ? t('role.startup') : t('role.investor')}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="icon-btn" aria-label={t('nav.logout')} title={t('nav.logout')}>
              <LogoutIcon size={18} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}

// ---------------- Yuqori qator: qidiruv, qo'ng'iroqcha, foydalanuvchi ----------------
export function TopFallback() {
  return <div className="app-top-inner" aria-hidden="true" />;
}

export async function TopActions() {
  const [{ user, profile }, t] = await Promise.all([getSession(), getT()]);
  const role = profile?.role;
  let notif = { list: [], unread: 0 };
  if (user) {
    const [requests, saved] = await Promise.all([getRequests(), getSaved()]);
    notif = notificationsOf(buildEvents(role, requests, saved, t), profile.notifications_seen_at);
  }

  return (
    <div className="app-top-inner">
      <form className="top-search" action="/startaplar" role="search">
        <label>
          <span className="visually-hidden">{t('top.search')}</span>
          <SearchIcon size={17} />
          <input name="q" type="search" placeholder={t('top.search')} maxLength={60} />
        </label>
      </form>

      <div className="top-right">
        <LangSwitch current={t.lang} label={t('lang.label')} />
        <ThemeToggle initial={await getTheme()} labels={{ dark: t('theme.dark'), light: t('theme.light') }} />
        {!user ? (
          <>
            <Link className="nav-link" href="/kirish">
              {t('nav.login')}
            </Link>
            <Link className="btn btn-gold btn-sm" href="/royxat">
              {t('nav.signup')}
            </Link>
          </>
        ) : (
          <>
            <details className="pop">
              <summary className="icon-btn" aria-label={notif.unread ? t('top.bell_new', { n: notif.unread }) : t('top.bell')}>
                <BellIcon size={19} />
                {notif.unread > 0 && <em className="bell-dot">{notif.unread > 9 ? '9+' : notif.unread}</em>}
              </summary>
              <div className="pop-panel">
                <div className="pop-head">
                  <b>{t('top.bell')}</b>
                  {notif.unread > 0 && (
                    <form action={markNotificationsSeen}>
                      <input type="hidden" name="back" value="/kabinet/bildirishnomalar" />
                      <button type="submit" className="link-btn">
                        {t('top.mark_all')}
                      </button>
                    </form>
                  )}
                </div>
                {notif.list.length === 0 ? (
                  <p className="muted small pop-empty">{t('top.empty')}</p>
                ) : (
                  <ul className="pop-list">
                    {notif.list.slice(0, 5).map((e) => {
                      const fresh = new Date(e.at).getTime() > notif.seen;
                      return (
                        <li key={e.id} className={fresh ? 'is-fresh' : ''}>
                          <Link href={e.href}>
                            <span>{e.text}</span>
                            <time className="muted small">{timeAgo(e.at, t)}</time>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Link className="pop-all" href="/kabinet/bildirishnomalar">
                  {t('top.see_all')}
                </Link>
              </div>
            </details>

            <Link href={role === 'startup' ? '/kabinet/startap/profil' : '/kabinet/investor/profil'} className="top-avatar" aria-label={t('top.profile')} title={profile.full_name}>
              {initial(profile.full_name)}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
