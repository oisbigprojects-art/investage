import Link from 'next/link';
import { qs, PAGE_SIZE } from '@/lib/admin';

export default function AdminPager({ base, params, page, total }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <nav className="admin-pager small" aria-label="Sahifalar">
      {page > 1 ? <Link className="btn btn-ghost btn-sm" href={qs(base, { ...params, sahifa: page - 1 })}>← Oldingi</Link> : <span />}
      <span className="muted">{page} / {pages} · jami {total}</span>
      {page < pages ? <Link className="btn btn-ghost btn-sm" href={qs(base, { ...params, sahifa: page + 1 })}>Keyingi →</Link> : <span />}
    </nav>
  );
}
