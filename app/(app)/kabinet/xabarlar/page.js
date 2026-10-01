import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getConversations } from '@/lib/data';
import { getT } from '@/lib/i18n/server';
import { Flash, Monogram, StatusBadge } from '@/components/ui';
import { ChatIcon } from '@/components/icons';
import { timeAgo } from '@/lib/labels';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.messages') };
}

// Barcha suhbatlar: startap ↔ investor (ruxsat berilgandan keyin ochiladi)
export default async function MessagesPage({ searchParams }) {
  const sp = await searchParams;
  const [{ user, profile }, t] = await Promise.all([getSession(), getT()]);
  if (!user) redirect('/kirish');
  const list = await getConversations();
  const isStartup = profile.role === 'startup';

  return (
    <>
      <div className="page-head">
        <span className="role-tag">{isStartup ? t('cab.startup') : t('cab.investor')}</span>
        <h1>{t('chat.title')}</h1>
        <p className="muted">{isStartup ? t('chat.sub_startup') : t('chat.sub_investor')}</p>
      </div>
      <Flash searchParams={sp} />

      {list.length === 0 ? (
        <div className="empty">
          <ChatIcon size={28} />
          <h3>{t('chat.empty_title')}</h3>
          <p>{isStartup ? t('chat.empty_startup') : t('chat.empty_investor')}</p>
          <div className="row">
            {isStartup ? (
              <>
                <Link className="btn btn-gold" href="/investorlar">{t('chat.find_investors')}</Link>
                <Link className="btn btn-ghost" href="/kabinet/startap/sorovlar">{t('shell.requests')}</Link>
              </>
            ) : (
              <Link className="btn btn-gold" href="/startaplar">{t('chat.find_startups')}</Link>
            )}
          </div>
        </div>
      ) : (
        <section className="card conv-list">
          {list.map((c) => {
            const name = isStartup ? c.investor_name || t('role.investor') : c.startup_name;
            const sub = isStartup ? c.investor_company : t('chat.startup_label');
            return (
              <Link key={c.request_id} href={`/kabinet/xabarlar/${c.request_id}`} className={`conv ${c.unread ? 'is-unread' : ''}`}>
                <Monogram name={name} logo={isStartup ? null : c.startup_logo} size={46} />
                <div className="conv-main">
                  <div className="conv-top">
                    <strong>{name}</strong>
                    {sub && <span className="muted small">{sub}</span>}
                    <time className="muted small">{timeAgo(c.last_at, t)}</time>
                  </div>
                  <div className="conv-last small">
                    {c.last_body ? (
                      <>
                        {c.last_mine && <span className="muted">{t('chat.you')}: </span>}
                        {c.last_body}
                      </>
                    ) : (
                      <span className="muted">{t('chat.start_hint')}</span>
                    )}
                  </div>
                </div>
                {c.status !== 'approved' && <StatusBadge status={c.status} t={t} />}
                {c.unread > 0 && <em className="conv-badge">{c.unread > 99 ? '99+' : c.unread}</em>}
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}
