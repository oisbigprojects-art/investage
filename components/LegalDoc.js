import Link from 'next/link';
import { formatDate } from '@/lib/labels';

// Shartlar / Maxfiylik sahifalari uchun umumiy ko'rinish
export default function LegalDoc({ title, sections, updated, t, other }) {
  return (
    <article className="legal">
      <h1>{title}</h1>
      <p className="small updated">
        {t('legal.updated')}: {formatDate(updated, t)}
      </p>
      {sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {s.p?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.list && (
            <ul>
              {s.list.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="small muted">
        {t('legal.see_also')} <Link href={other.href}>{other.label}</Link>
      </p>
    </article>
  );
}
