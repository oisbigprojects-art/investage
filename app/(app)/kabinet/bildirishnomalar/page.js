import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getRequests, getSaved } from '@/lib/data';
import { buildEvents, notificationsOf } from '@/lib/events';
import { markNotificationsSeen } from '@/app/cabinet-actions';
import ActivityFeed from '@/components/Activity';
import { Flash } from '@/components/ui';

export const metadata = { title: 'Bildirishnomalar — Investage' };

export default async function Notifications({ searchParams }) {
  const sp = await searchParams;
  const { user, profile } = await getSession();
  if (!user) redirect('/kirish');
  const [requests, saved] = await Promise.all([getRequests(), getSaved()]);

  const role = profile.role;
  const events = buildEvents(role, requests, saved);
  const { list, unread, seen } = notificationsOf(events, profile.notifications_seen_at);

  return (
    <>
      <div className="page-head cab-head">
        <div className="cab-head-text">
          <span className="role-tag">{role === 'startup' ? 'Startap kabineti' : 'Investor kabineti'}</span>
          <h1>Bildirishnomalar</h1>
          <p className="muted">
            {role === 'startup'
              ? "Investorlar yuborgan yangi so'rovlar shu yerda ko'rinadi."
              : "Startaplarning so'rovlaringizga javoblari shu yerda ko'rinadi."}
          </p>
        </div>
        {unread > 0 && (
          <form action={markNotificationsSeen}>
            <input type="hidden" name="back" value="/kabinet/bildirishnomalar" />
            <button className="btn btn-ghost btn-sm" type="submit">
              Hammasini o&apos;qildi deb belgilash ({unread})
            </button>
          </form>
        )}
      </div>
      <Flash searchParams={sp} />

      <section className="card">
        <ActivityFeed
          events={list}
          limit={50}
          showUnread={seen}
          empty={role === 'startup' ? "Hali hech kim so'rov yubormagan." : "Hali startaplardan javob kelmagan."}
        />
      </section>

      <section className="card">
        <div className="section-head sm">
          <h2>Barcha faollik</h2>
          <span className="muted small">sizning va boshqa tomonning harakatlari</span>
        </div>
        <ActivityFeed events={events} limit={50} />
      </section>
    </>
  );
}
