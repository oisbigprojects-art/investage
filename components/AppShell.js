import Link from 'next/link';
import { getSession } from '@/lib/supabase/server';
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
  const { user, profile } = await getSession();
  const role = profile?.role;

  let sections;
  if (!user) {
    sections = [
      {
        title: 'Sayt',
        items: [
          { href: '/', label: 'Bosh sahifa', icon: 'home', exact: true },
          { href: '/startaplar', label: 'Startaplar', icon: 'search' },
        ],
      },
    ];
  } else if (role === 'startup') {
    const [requests, s] = await Promise.all([getRequests(), getMyStartup(user.id)]);
    const pending = requests.filter((r) => r.status === 'pending').length;
    const { unread } = notificationsOf(buildEvents('startup', requests), profile.notifications_seen_at);
    sections = [
      {
        title: 'Panel',
        items: [
          { href: '/kabinet/startap', label: "Umumiy ko'rinish", icon: 'grid', exact: true },
          { href: '/kabinet/startap/sorovlar', label: "So'rovlar", icon: 'inbox', badge: pending },
          { href: '/kabinet/bildirishnomalar', label: 'Bildirishnomalar', icon: 'bell', badge: unread },
        ],
      },
      {
        title: 'Startap',
        items: [
          { href: '/kabinet/startap/profil', label: 'Profil', icon: 'user' },
          ...(s ? [{ href: `/startaplar/${s.id}`, label: 'Ochiq sahifam', icon: 'globe', exact: true }] : []),
        ],
      },
      { title: 'Katalog', items: [{ href: '/startaplar', label: 'Startaplar', icon: 'search', exact: true }] },
    ];
  } else {
    const [requests, saved] = await Promise.all([getRequests(), getSaved()]);
    const pending = requests.filter((r) => r.status === 'pending').length;
    const { unread } = notificationsOf(buildEvents('investor', requests, saved), profile.notifications_seen_at);
    sections = [
      {
        title: 'Panel',
        items: [
          { href: '/kabinet/investor', label: "Umumiy ko'rinish", icon: 'grid', exact: true },
          { href: '/kabinet/investor/sorovlar', label: "So'rovlarim", icon: 'inbox', badge: pending },
          { href: '/kabinet/investor/saqlangan', label: 'Saqlanganlar', icon: 'bookmark', badge: saved.length },
          { href: '/kabinet/bildirishnomalar', label: 'Bildirishnomalar', icon: 'bell', badge: unread },
        ],
      },
      { title: 'Katalog', items: [{ href: '/startaplar', label: 'Startaplar', icon: 'search' }] },
      { title: 'Hisob', items: [{ href: '/kabinet/investor/profil', label: 'Profil', icon: 'user' }] },
    ];
  }

  return (
    <aside className="side">
      <Link href="/" className="side-logo" aria-label="Investage — bosh sahifa">
        <Logo height={24} />
      </Link>
      <AppNav sections={sections} />

      {!user ? (
        <div className="side-promo">
          <b>Investage&apos;ga qo&apos;shiling</b>
          <p className="small muted">Startap yoki investor sifatida ro&apos;yxatdan o&apos;ting va o&apos;z panelingizni oching.</p>
          <Link className="btn btn-gold btn-sm" href="/royxat">
            Ro&apos;yxatdan o&apos;tish
          </Link>
          <Link className="btn btn-ghost btn-sm" href="/kirish">
            Kirish
          </Link>
        </div>
      ) : (
        <div className="side-user">
          <span className="side-avatar" aria-hidden="true">
            {initial(profile.full_name)}
          </span>
          <div>
            <b>{profile.full_name || 'Foydalanuvchi'}</b>
            <span>{role === 'startup' ? 'Startap' : 'Investor'}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="icon-btn" aria-label="Chiqish" title="Chiqish">
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
  const { user, profile } = await getSession();
  const role = profile?.role;
  let notif = { list: [], unread: 0 };
  if (user) {
    const [requests, saved] = await Promise.all([getRequests(), getSaved()]);
    notif = notificationsOf(buildEvents(role, requests, saved), profile.notifications_seen_at);
  }

  return (
    <div className="app-top-inner">
      <form className="top-search" action="/startaplar" role="search">
        <label>
          <span className="visually-hidden">Startap qidirish</span>
          <SearchIcon size={17} />
          <input name="q" type="search" placeholder="Startap qidirish" maxLength={60} />
        </label>
      </form>

      <div className="top-right">
        {!user ? (
          <>
            <Link className="nav-link" href="/kirish">
              Kirish
            </Link>
            <Link className="btn btn-gold btn-sm" href="/royxat">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </>
        ) : (
          <>
            <details className="pop">
              <summary className="icon-btn" aria-label={`Bildirishnomalar${notif.unread ? `: ${notif.unread} ta yangi` : ''}`}>
                <BellIcon size={19} />
                {notif.unread > 0 && <em className="bell-dot">{notif.unread > 9 ? '9+' : notif.unread}</em>}
              </summary>
              <div className="pop-panel">
                <div className="pop-head">
                  <b>Bildirishnomalar</b>
                  {notif.unread > 0 && (
                    <form action={markNotificationsSeen}>
                      <input type="hidden" name="back" value="/kabinet/bildirishnomalar" />
                      <button type="submit" className="link-btn">
                        Hammasini o&apos;qildi deb belgilash
                      </button>
                    </form>
                  )}
                </div>
                {notif.list.length === 0 ? (
                  <p className="muted small pop-empty">Yangi xabar yo&apos;q.</p>
                ) : (
                  <ul className="pop-list">
                    {notif.list.slice(0, 5).map((e) => {
                      const fresh = new Date(e.at).getTime() > notif.seen;
                      return (
                        <li key={e.id} className={fresh ? 'is-fresh' : ''}>
                          <Link href={e.href}>
                            <span>{e.text}</span>
                            <time className="muted small">{timeAgo(e.at)}</time>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Link className="pop-all" href="/kabinet/bildirishnomalar">
                  Hammasini ko&apos;rish
                </Link>
              </div>
            </details>

            <Link href={role === 'startup' ? '/kabinet/startap/profil' : '/kabinet/investor/profil'} className="top-avatar" aria-label="Profilim" title={profile.full_name}>
              {initial(profile.full_name)}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
