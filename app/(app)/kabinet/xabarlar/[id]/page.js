import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getConversations } from '@/lib/data';
import { getT } from '@/lib/i18n/server';
import { Flash, Monogram, StatusBadge } from '@/components/ui';
import Chat from '@/components/Chat';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.messages') };
}

const KEYS = ['chat.placeholder', 'chat.send', 'chat.sending', 'chat.err_send', 'chat.today', 'chat.yesterday', 'chat.empty_thread', 'chat.read', 'chat.hint_enter', 'chat.new_below'];

export default async function ThreadPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ supabase, user, profile }, t] = await Promise.all([getSession(), getT()]);
  if (!user) redirect('/kirish');

  const [list, { data: messages }] = await Promise.all([
    getConversations(),
    supabase.from('messages').select('id, sender_id, body, created_at, read_at').eq('request_id', id).order('created_at', { ascending: true }).limit(500),
  ]);
  const c = list.find((x) => x.request_id === id);
  if (!c) notFound();
  if (c.unread > 0) await supabase.rpc('mark_chat_read', { p_request: id });

  const isStartup = profile.role === 'startup';
  const name = isStartup ? c.investor_name || t('role.investor') : c.startup_name;
  const href = isStartup ? `/investorlar/${c.investor_id}` : `/startaplar/${c.startup_id}`;
  const open = c.status === 'approved';
  const labels = Object.fromEntries(KEYS.map((k) => [k, t(k)]));

  return (
    <>
      <Link href="/kabinet/xabarlar" className="back">{t('chat.back')}</Link>
      <Flash searchParams={sp} />
      <section className="card chat-card">
        <header className="chat-head">
          <Monogram name={name} logo={isStartup ? null : c.startup_logo} size={44} />
          <div className="chat-who">
            <Link href={href}><strong>{name}</strong></Link>
            <span className="muted small">
              {isStartup ? c.investor_company || t('role.investor') : t('chat.startup_label')}
              {c.initiated_by === 'startup' && <> · {isStartup ? t('chat.you_offered') : t('chat.they_offered')}</>}
            </span>
          </div>
          {!open && <StatusBadge status={c.status} t={t} />}
          <Link className="btn btn-ghost btn-sm" href={href}>{isStartup ? t('chat.view_investor') : t('chat.view_startup')}</Link>
        </header>
        {c.is_demo && <p className="chat-note small">{t('chat.demo_note')}</p>}
        <Chat
          requestId={id}
          me={user.id}
          initial={messages || []}
          canSend={open}
          closedText={t('chat.closed')}
          lang={t.lang}
          labels={labels}
        />
      </section>
    </>
  );
}
