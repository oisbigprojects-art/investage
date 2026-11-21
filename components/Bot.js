'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SendIcon } from './icons';
import { findAnswer, isGreeting, related } from '@/lib/bot/match';
import { askAssistant } from '@/app/assistant-actions';

const MAX = 300;

// Sayt yordamchisi. Avval tayyor bazadan javob qidiriladi; topilmasa, AI yordamchi (Claude) faqat sayt
// qoidalari asosida javob beradi va bilmasa jamoaga yo'naltiradi. Rol serverda aniqlanadi.
export default function Bot({ faq, starters, greeting, labels: L }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [chips, setChips] = useState(starters);
  const listRef = useRef(null);
  const boxRef = useRef(null);
  const asked = useRef([]);
  const [busy, setBusy] = useState(false);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open]);

  useEffect(() => {
    if (!open) return;
    boxRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function ask(question) {
    const q = (question ?? text).trim().slice(0, MAX);
    if (!q || busy) return;
    setText('');
    if (boxRef.current) boxRef.current.style.height = 'auto';

    let answer = null;
    if (isGreeting(q)) {
      answer = { text: greeting, kind: 'ok' };
    } else {
      const hit = findAnswer(q, faq);
      if (hit) {
        asked.current = [...asked.current, hit.id];
        answer = { text: hit.a, kind: 'ok' };
      }
    }

    if (answer) {
      setMsgs((p) => [...p, { role: 'user', text: q }, { role: 'bot', ...answer }]);
    } else {
      // Tayyor javob yo'q: AI yordamchidan so'raymiz
      const history = msgs.slice(-6).map((m) => ({ role: m.role, text: m.text }));
      setMsgs((p) => [...p, { role: 'user', text: q }]);
      setBusy(true);
      let r = null;
      try {
        r = await askAssistant(q, history);
      } catch {}
      setBusy(false);
      setMsgs((p) => [
        ...p,
        r?.ok ? { role: 'bot', text: r.answer, kind: r.confident ? 'ok' : 'miss' } : { role: 'bot', text: L.no_match, kind: 'miss' },
      ]);
    }
    setChips(related(faq, asked.current, 3));
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
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
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

      <div id="bot-panel" className={`bot-panel ${open ? 'is-open' : ''}`} role="dialog" aria-label={L.title} aria-hidden={!open}>
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
            <div key={i} className={`bot-msg ${m.role === 'user' ? 'bot-me' : 'bot-them'} ${m.kind === 'miss' ? 'is-miss' : ''}`}>
              <p>{m.text}</p>
              {m.kind === 'miss' && (
                <p className="bot-miss-link">
                  <Link href="/yordam">{L.ask_team}</Link>
                </p>
              )}
            </div>
          ))}

          {busy && (
            <div className="bot-msg bot-them" aria-label="…">
              <p className="bot-typing"><i /><i /><i /></p>
            </div>
          )}

          {chips.length > 0 && !busy && (
            <div className="bot-chips">
              <span className="muted small">{msgs.length ? L.more : L.pick}</span>
              {chips.map((c) => (
                <button key={c.id} type="button" className="bot-chip" onClick={() => ask(c.q)}>{c.q}</button>
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
          <button className="btn btn-gold bot-send" type="submit" disabled={!text.trim() || busy} aria-label={L.send}>
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
