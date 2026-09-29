import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { Flash } from '@/components/ui';
import { login } from '../auth-actions';

export const metadata = { title: 'Kirish — Investage' };

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const { user } = await getSession();
  if (user) redirect('/kabinet');

  return (
    <div className="auth">
      <h1>Kirish</h1>
      <p className="muted">Kabinetingizga kirish uchun emailingiz va parolingizni kiriting.</p>
      <Flash searchParams={sp} />
      <form action={login} className="card form">
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" placeholder="name@company.com" />
        </label>
        <label>
          Parol
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <button className="btn btn-gold" type="submit">
          Kirish
        </button>
      </form>
      <p className="muted center">
        Akkauntingiz yo&apos;qmi? <Link href="/royxat">Ro&apos;yxatdan o&apos;ting</Link>
      </p>
    </div>
  );
}
