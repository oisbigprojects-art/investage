import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { Flash } from '@/components/ui';
import { signup } from '@/app/auth-actions';

export const metadata = { title: "Ro'yxatdan o'tish — Investage" };

export default async function SignupPage({ searchParams }) {
  const sp = await searchParams;
  const { user } = await getSession();
  if (user) redirect('/kabinet');
  const preset = sp?.rol === 'investor' ? 'investor' : sp?.rol === 'startup' ? 'startup' : null;

  return (
    <div className="auth">
      <h1>Ro&apos;yxatdan o&apos;tish</h1>
      <p className="muted">Rolingizni tanlang. Keyin uni o&apos;zgartirib bo&apos;lmaydi.</p>
      <Flash searchParams={sp} />
      <form action={signup} className="card form">
        <fieldset className="role-radio">
          <legend>Siz kimsiz?</legend>
          <label className="radio-card">
            <input type="radio" name="role" value="startup" defaultChecked={preset === 'startup'} required />
            <span>
              <strong>Startap</strong>
              <small>Mablag&apos; izlayman</small>
            </span>
          </label>
          <label className="radio-card">
            <input type="radio" name="role" value="investor" defaultChecked={preset === 'investor'} required />
            <span>
              <strong>Investor yoki tadbirkor</strong>
              <small>Loyiha izlayman</small>
            </span>
          </label>
        </fieldset>
        <label>
          Ism familiya
          <input name="full_name" required autoComplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" placeholder="name@company.com" />
        </label>
        <label>
          Parol (kamida 6 belgi)
          <input name="password" type="password" minLength={6} required autoComplete="new-password" />
        </label>
        <button className="btn btn-gold" type="submit">
          Ro&apos;yxatdan o&apos;tish
        </button>
      </form>
      <p className="muted center">
        Akkauntingiz bormi? <Link href="/kirish">Kirish</Link>
      </p>
    </div>
  );
}
