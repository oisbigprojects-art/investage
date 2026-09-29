import { formatMoney, EXTRA_FIELDS } from '@/lib/labels';

// Yopiq ma'lumotlar bloki — faqat egasi yoki tasdiqlangan investor ko'radi
export default function PrivateDetails({ p }) {
  const extra = p.extra || {};
  return (
    <div className="private-grid">
      <div className="kv">
        <span>Kerakli mablag&apos;</span>
        <strong>{formatMoney(p.funding_amount)}</strong>
      </div>
      <div className="kv">
        <span>Taklif qilinayotgan ulush</span>
        <strong>{p.equity_percent != null ? `${p.equity_percent}%` : '—'}</strong>
      </div>
      {EXTRA_FIELDS.map((f) => (
        <div className="kv" key={f.key}>
          <span>{f.label}</span>
          <strong>{extra[f.key] || '—'}</strong>
        </div>
      ))}
      <div className="kv kv-wide">
        <span>Jamoa</span>
        <p className="pre">{p.team || '—'}</p>
      </div>
      <div className="kv kv-wide">
        <span>Kontaktlar</span>
        <ul className="contacts">
          {p.contact_email && <li>Email: <a href={`mailto:${p.contact_email}`}>{p.contact_email}</a></li>}
          {p.contact_phone && <li>Telefon: <a href={`tel:${p.contact_phone}`}>{p.contact_phone}</a></li>}
          {p.contact_telegram && <li>Telegram: {p.contact_telegram}</li>}
          {!p.contact_email && !p.contact_phone && !p.contact_telegram && <li>—</li>}
        </ul>
      </div>
    </div>
  );
}
