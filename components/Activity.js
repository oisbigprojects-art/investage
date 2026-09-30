import Link from 'next/link';
import { timeAgo } from '@/lib/labels';
import { CheckIcon, ClockIcon, LockIcon, BookmarkIcon, UnlockIcon } from './icons';

const ICON = { request: ClockIcon, approved: UnlockIcon, rejected: LockIcon, revoked: LockIcon, saved: BookmarkIcon };
const TONE = { request: 'warn', approved: 'ok', rejected: 'bad', revoked: 'muted', saved: 'gold' };

// Vaqt bo'yicha faollik tasmasi
export default function ActivityFeed({ events, t, limit = 6, empty, showUnread = 0 }) {
  const list = events.slice(0, limit);
  if (!list.length) return <p className="muted small">{empty || t('feed.empty')}</p>;
  return (
    <ol className="feed">
      {list.map((e) => {
        const Icon = ICON[e.kind] || CheckIcon;
        const fresh = showUnread && new Date(e.at).getTime() > showUnread && !e.mine;
        return (
          <li key={e.id} className={fresh ? 'is-fresh' : ''}>
            <span className={`feed-ico tone-${TONE[e.kind] || 'muted'}`} aria-hidden="true">
              <Icon size={15} />
            </span>
            <Link href={e.href} className="feed-body">
              <span>{e.text}</span>
              <time className="muted small" dateTime={new Date(e.at).toISOString()}>
                {timeAgo(e.at, t)}
              </time>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
