'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { browserClient } from '@/lib/supabase/browser';
import { LOCALES } from '@/lib/i18n/format';
import { SendIcon } from './icons';

const COLS = 'id, sender_id, body, created_at, read_at';
const MAX = 4000;

// Startap ↔ investor suhbati: xabarlar darhol keladi (Supabase Realtime), ulanish uzilsa har 15 soniyada tekshiriladi.
// Huquqlar bazada (RLS): faqat suhbat ishtirokchilari o'qiydi, faqat ruxsat ochiq bo'lsa yoza oladi.
export default function Chat({ requestId, me, initial, canSend, closedText, lang, labels: L }) {
  const [msgs, setMsgs] = useState(() => sortMsgs(initial));
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [below, setBelow] = useState(0);
  const listRef = useRef(null);
  const boxRef = useRef(null);
  const stick = useRef(true);
  const readTimer = useRef(null);

  const supabase = useMemo(() => browserClient(), []);
  const locale = LOCALES[lang] || 'uz-UZ';

  const merge = useCallback((rows) => {
    if (!rows?.length) return;
    setMsgs((prev) => {
      const map = new Map(prev.filter((m) => !m.temp).map((m) => [m.id, m]));
      for (const r of rows) map.set(r.id, { ...map.get(r.id), ...r });
      const temps = prev.filter((m) => m.temp && !rows.some((r) => r.sender_id === m.sender_id && r.body === m.body));
      return sortMsgs([...map.values(), ...temps]);
    });
  }, []);

  // Boshqa tomondan kelgan xabarlarni "o'qildi" deb belgilash (sahifa ko'rinib turganda)
  const markRead = useCallback(() => {
    clearTimeout(readTimer.current);
    readTimer.current = setTimeout(() => {
      if (document.visibilityState === 'visible') supabase.rpc('mark_chat_read', { p_request: requestId }).then(() => {});
    }, 600);
  }, [supabase, requestId]);

  // Realtime obuna + zaxira tekshiruv
  useEffect(() => {
    let alive = true;
    let live = false;
    const ch = supabase
      .channel(`chat:${requestId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${requestId}` }, ({ new: m }) => {
        merge([m]);
        if (m.sender_id !== me) {
          markRead();
          if (!stick.current) setBelow((n) => n + 1);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `request_id=eq.${requestId}` }, ({ new: m }) => merge([m]))
      .subscribe((status) => {
        live = status === 'SUBSCRIBED';
      });

    const poll = setInterval(async () => {
      if (live || document.visibilityState !== 'visible') return;
      const { data } = await supabase.from('messages').select(COLS).eq('request_id', requestId).order('created_at', { ascending: false }).limit(50);
      if (alive && data) {
        merge(data);
        if (data.some((m) => m.sender_id !== me && !m.read_at)) markRead();
      }
    }, 15000);

    const onVis = () => document.visibilityState === 'visible' && markRead();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      clearInterval(poll);
      clearTimeout(readTimer.current);
      document.removeEventListener('visibilitychange', onVis);
      supabase.removeChannel(ch);
    };
  }, [supabase, requestId, me, merge, markRead]);

  // Yangi xabar kelganda pastga tushirish (foydalanuvchi yuqorini o'qiyotgan bo'lmasa)
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const onScroll = () => {
    const el = listRef.current;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (stick.current) setBelow(0);
  };

  const toBottom = () => {
    const el = listRef.current;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    stick.current = true;
    setBelow(0);
  };

  const grow = (el) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  async function send(e) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || busy || !canSend) return;
    setBusy(true);
    setErr('');
    const temp = { id: `temp-${Date.now()}`, temp: true, sender_id: me, body, created_at: new Date().toISOString(), read_at: null };
    stick.current = true;
    setMsgs((p) => [...p, temp]);
    setText('');
    if (boxRef.current) boxRef.current.style.height = 'auto';

    const { data, error } = await supabase.from('messages').insert({ request_id: requestId, sender_id: me, body }).select(COLS).single();
    if (error) {
      setMsgs((p) => p.filter((m) => m.id !== temp.id));
      setText(body);
      setErr(L['chat.err_send']);
    } else {
      setMsgs((p) => sortMsgs([...p.filter((m) => m.id !== temp.id && m.id !== data.id), data]));
    }
    setBusy(false);
    boxRef.current?.focus();
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) send(e);
  };

  // Kun ajratgichlari bilan guruhlash
  const lastReadMine = [...msgs].reverse().find((m) => m.sender_id === me && m.read_at)?.id;
  const rows = [];
  let day = '';
  for (const m of msgs) {
    const d = dayLabel(m.created_at, locale, L);
    if (d !== day) {
      rows.push(<div className="chat-day" key={`d-${m.id}`}><span suppressHydrationWarning>{d}</span></div>);
      day = d;
    }
    const mine = m.sender_id === me;
    rows.push(
      <div key={m.id} className={`msg ${mine ? 'msg-me' : 'msg-them'} ${m.temp ? 'is-temp' : ''}`}>
        <p>{m.body}</p>
        <span className="msg-meta" suppressHydrationWarning>
          {m.temp ? L['chat.sending'] : timeOf(m.created_at, locale)}
          {mine && m.id === lastReadMine && <> · {L['chat.read']}</>}
        </span>
      </div>
    );
  }

  return (
    <div className="chat">
      <div className="chat-list" ref={listRef} onScroll={onScroll} aria-live="polite">
        {msgs.length === 0 ? <p className="chat-empty muted small">{L['chat.empty_thread']}</p> : rows}
      </div>
      {below > 0 && (
        <button type="button" className="chat-below" onClick={toBottom}>
          {L['chat.new_below']} ({below})
        </button>
      )}
      {canSend ? (
        <form className="chat-form" onSubmit={send}>
          <textarea
            ref={boxRef}
            rows={1}
            value={text}
            maxLength={MAX}
            placeholder={L['chat.placeholder']}
            aria-label={L['chat.placeholder']}
            onChange={(e) => {
              setText(e.target.value);
              grow(e.target);
            }}
            onKeyDown={onKey}
          />
          <button className="btn btn-gold chat-send" type="submit" disabled={busy || !text.trim()} aria-label={L['chat.send']}>
            <SendIcon size={18} />
            <span>{L['chat.send']}</span>
          </button>
        </form>
      ) : (
        <p className="chat-closed small">{closedText}</p>
      )}
      {canSend && <p className="chat-hint muted">{err ? <span className="chat-err">{err}</span> : L['chat.hint_enter']}</p>}
    </div>
  );
}

function sortMsgs(list) {
  return [...(list || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

function timeOf(iso, locale) {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tashkent' });
}

function dayKey(d) {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' });
}

function dayLabel(iso, locale, L) {
  const d = new Date(iso);
  const now = new Date();
  if (dayKey(d) === dayKey(now)) return L['chat.today'];
  if (dayKey(d) === dayKey(new Date(now.getTime() - 864e5))) return L['chat.yesterday'];
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric', timeZone: 'Asia/Tashkent' });
}
