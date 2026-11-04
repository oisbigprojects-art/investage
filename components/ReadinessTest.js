'use client';

import Link from 'next/link';
import { useState } from 'react';
import { QUESTIONS, LEVELS, evaluate, levelOf } from '@/lib/readiness';

const pick = (x, lang) => x[lang] || x.uz;

// Ball doirasi (0-100)
export function ScoreRing({ score, size = 168 }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const tone = score >= 70 ? 'ok' : score >= 40 ? 'mid' : 'low';
  return (
    <div className={`rt-ring rt-${tone}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r={r} className="rt-ring-bg" />
        <circle cx="80" cy="80" r={r} className="rt-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="rt-ring-num">
        <b>{score}</b>
        <span>/100</span>
      </div>
    </div>
  );
}

// "Startapingiz investorga tayyormi?" testi. Hamma hisob brauzerda, javoblar hech qayerga yuborilmaydi.
export default function ReadinessTest({ s, lang }) {
  const [step, setStep] = useState(-1); // -1: kirish, 0..9: savollar, 10: natija
  const [answers, setAnswers] = useState({});
  const [copied, setCopied] = useState(false);
  const total = QUESTIONS.length;

  const choose = (qid, i) => {
    setAnswers((a) => ({ ...a, [qid]: i }));
    setTimeout(() => setStep((n) => n + 1), 180);
  };

  if (step < 0) {
    return (
      <div className="card rt-card rt-intro">
        <p className="rt-kicker">{s.home_kicker}</p>
        <h1>{s.title}</h1>
        <p className="muted">{s.sub}</p>
        <button className="btn btn-gold" type="button" onClick={() => setStep(0)}>{s.start}</button>
        <p className="muted small">{s.private}</p>
      </div>
    );
  }

  if (step < total) {
    const q = QUESTIONS[step];
    return (
      <div className="card rt-card" key={q.id}>
        <div className="rt-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step + 1}>
          <span style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        <div className="rt-meta">
          <span>{pick(q.topic, lang)}</span>
          <span>{step + 1} / {total}</span>
        </div>
        <h2 className="rt-q">{pick(q.q, lang)}</h2>
        <div className="rt-opts">
          {q.options.map((o, i) => (
            <button key={i} type="button" className={`rt-opt${answers[q.id] === i ? ' on' : ''}`} onClick={() => choose(q.id, i)}>
              {pick(o, lang)}
            </button>
          ))}
        </div>
        <button className="rt-back" type="button" onClick={() => setStep((n) => n - 1)}>
          ← {s.back}
        </button>
      </div>
    );
  }

  const { score, tips } = evaluate(answers);
  const level = levelOf(score) || LEVELS[LEVELS.length - 1];
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/test/natija?b=${score}` : '';
  const shareText = s.share_text.replace('{n}', score);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: s.title, text: shareText, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Foydalanuvchi ulashishni bekor qildi
    }
  };

  return (
    <div className="rt-result">
      <div className="card rt-card rt-score">
        <p className="rt-kicker">{s.result}</p>
        <ScoreRing score={score} />
        <h1>{pick(level.title, lang)}</h1>
        <p className="muted">{pick(level.text, lang)}</p>
        <div className="row rt-actions">
          <button className="btn btn-gold" type="button" onClick={share}>{copied ? s.copied : s.share}</button>
          <a className="btn btn-ghost" href={`/api/test-rasm?b=${score}&til=${lang}`} download={`investage-test-${score}.png`}>{s.story}</a>
        </div>
      </div>

      <div className="card rt-card">
        <h2>{s.steps}</h2>
        {tips.length ? (
          <ol className="rt-tips">
            {tips.map((q) => (
              <li key={q.id}>
                <strong>{pick(q.topic, lang)}</strong>
                <p>{pick(q.tip, lang)}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">{s.perfect}</p>
        )}
        <button className="rt-back" type="button" onClick={() => { setAnswers({}); setStep(0); }}>
          ↻ {s.retry}
        </button>
      </div>

      <div className="cta rt-cta">
        <div>
          <h2>{s.cta_title}</h2>
          <p>{s.cta_text}</p>
        </div>
        <Link className="btn btn-gold" href="/royxat?rol=startup">{s.cta_btn}</Link>
      </div>
      <p className="muted small center">{s.note}</p>
    </div>
  );
}
