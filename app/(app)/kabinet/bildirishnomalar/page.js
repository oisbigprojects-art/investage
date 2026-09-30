import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { getRequests, getSaved } from '@/lib/data';
import { buildEvents, notificationsOf } from '@/lib/events';
import { markNotificationsSeen } from '@/app/cabinet-actions';
import ActivityFeed from '@/components/Activity';
import { Flash } from '@/components/ui';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.notifications') };
}

export default async function Notifications({ searchParams }) {
  const sp = await searchParams;
  const [{ user, profile }, t] = await Promise.all([getSession(), getT()]);
  if (!user) redirect('/kirish');
  const [requests, saved] = await Promise.all([getRequests(), getSaved()]);

  const role = profile.role;
  const events = buildEvents(role, requests, saved, t);
  const { list, unread, seen } = notificationsOf(events, profile.notifications_seen_at);

  return (
    <>
      <div className="page-head cab-head">
        <div className="cab-head-text">
          <span className="role-tag">{role === 'startup' ? t('cab.startup') : t('cab.investor')}</span>
          <h1>{t('nt.title')}</h1>
          <p className="muted">{role === 'startup' ? t('nt.sub_startup') : t('nt.sub_investor')}</p>
        </div>
        {unread > 0 && (
          <form action={markNotificationsSeen}>
            <input type="hidden" name="back" value="/kabinet/bildirishnomalar" />
            <button className="btn btn-ghost btn-sm" type="submit">
              {t('nt.mark_all', { n: unread })}
            </button>
          </form>
        )}
      </div>
      <Flash searchParams={sp} />

      <section className="card">
        <ActivityFeed
          events={list}
          t={t}
          limit={50}
          showUnread={seen}
          empty={role === 'startup' ? t('nt.empty_startup') : t('nt.empty_investor')}
        />
      </section>

      <section className="card">
        <div className="section-head sm">
          <h2>{t('nt.all')}</h2>
          <span className="muted small">{t('nt.all_sub')}</span>
        </div>
        <ActivityFeed events={events} t={t} limit={50} />
      </section>
    </>
  );
}
