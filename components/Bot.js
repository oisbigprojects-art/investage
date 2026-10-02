'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SendIcon } from './icons';

const MAX = 1000;

// Sayt yordamchisi. Rol serverda aniqlanadi; bu yerda faqat ko'rinish.
// Yozishmalar hech qayerda saqlanmaydi — sahifa yangilansa, suhbat tozalanadi.
export default function Bot({ greeting, suggestions, labels: L }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const listRef = useRef(null);
  const boxRef = useRef(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy, open]);

  useEffect(() => {
    if (!open) return;
    boxRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function ask(question) {
    const q = (question ?? text).trim();
    if (!q || busy) return;
    const next = [...msgs, { role: 'user', content: q }];
    setMsgs(next);
    setText('');
    setErr('');
    setBusy(true);
    if (boxRef.current) boxRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.text) setErr(data?.error || L.fail);
      else setMsgs((p) => [...p, { role: 'assistant', content: data.text }]);
    } catch {
      setErr(L.fail);
    }
    setBusy(false);
    boxRef.current?.focus();
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask();
    }
  };

  const grow = (el) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <>
      <button
        type="button"
        className={`bot-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="bot-panel"
        aria-label={open ? L.close : L.open}
      >
        {open ? <CloseGlyph /> : <BotGlyph />}
      </button>

      <div id="bot-panel" className={`bot-panel ${open ? 'is-open' : ''}`} ref={panelRef} role="dialog" aria-label={L.title} aria-hidden={!open}>
        <header className="bot-head">
          <span className="bot-ava" aria-hidden="true"><BotGlyph small /></span>
          <div>
            <strong>{L.title}</strong>
            <span className="muted small">{L.subtitle}</span>
          </div>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={L.close}>
            <CloseGlyph />
          </button>
        </header>

        <div className="bot-list" ref={listRef} aria-live="polite">
          <div className="bot-msg bot-them">
            <p>{greeting}</p>
          </div>

          {msgs.map((m, i) => (
            <div key={i} className={`bot-msg ${m.role === 'user' ? 'bot-me' : 'bot-them'}`}>
              <p>{m.content}</p>
            </div>
          ))}

          {busy && (
            <div className="bot-msg bot-them bot-typing" aria-label={L.thinking}>
              <i /><i /><i />
            </div>
          )}

          {err && <p className="bot-err small" role="alert">{err}</p>}

          {msgs.length === 0 && !busy && (
            <div className="bot-chips">
              {suggestions.map((s) => (
                <button key={s} type="button" className="bot-chip" onClick={() => ask(s)}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <form
          className="bot-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <textarea
            ref={boxRef}
            rows={1}
            value={text}
            maxLength={MAX}
            placeholder={L.placeholder}
            aria-label={L.placeholder}
            onChange={(e) => {
              setText(e.target.value);
              grow(e.target);
            }}
            onKeyDown={onKeyDown}
          />
          <button className="btn btn-gold bot-send" type="submit" disabled={busy || !text.trim()} aria-label={L.send}>
            <SendIcon size={17} />
          </button>
        </form>
        <p className="bot-foot small muted">
          {L.note} <Link href="/yordam">{L.help}</Link>
        </p>
      </div>
    </>
  );
}

function BotGlyph({ small }) {
  const s = small ? 18 : 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="7" width="16" height="12" rx="4" />
      <path d="M12 7V4" />
      <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="13" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
