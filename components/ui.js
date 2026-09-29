import { STAGES, STATUS } from '@/lib/labels';

export function Flash({ searchParams }) {
  if (searchParams?.xato) return <div className="flash flash-bad">{searchParams.xato}</div>;
  if (searchParams?.xabar) return <div className="flash flash-ok">{searchParams.xabar}</div>;
  return null;
}

export function StageBadge({ stage }) {
  return <span className={`chip chip-stage-${stage}`}>{STAGES[stage] || stage}</span>;
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, tone: 'muted' };
  return <span className={`chip chip-${s.tone}`}>{s.label}</span>;
}

export function Verified({ on }) {
  if (!on) return null;
  return (
    <span className="verified" title="Hujjatlari Investage tomonidan tekshirilgan">
      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
        <path fill="currentColor" d="M10 1l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L10 19l-2.4-1.8-3 .2-.9-2.9L1.3 12.6l1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z" />
        <path fill="#fff" d="M8.6 13.2L5.8 10.4l1.1-1.1 1.7 1.7 4.5-4.5 1.1 1.1z" />
      </svg>
      Tasdiqlangan
    </span>
  );
}

export function Score({ value }) {
  if (value === null || value === undefined) {
    return <span className="score score-empty" title="Scoring hali o'tkazilmagan">Baho: —</span>;
  }
  const tone = value >= 70 ? 'ok' : value >= 40 ? 'warn' : 'bad';
  return (
    <span className={`score score-${tone}`} title="Investage scoring bali (0–100)">
      Baho: <b>{value}</b>/100
    </span>
  );
}
