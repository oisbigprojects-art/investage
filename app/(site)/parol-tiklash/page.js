import Link from 'next/link';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { requestReset } from '@/app/auth-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.reset') };
}

export default async function ResetPage({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  return (
    <div className="auth">
      <h1>{t('reset.title')}</h1>
      <p className="muted">{t('reset.sub')}</p>
      <Flash searchParams={sp} />
      <form action={requestReset} className="card form">
        <label>
          {t('form.email')}
          <input name="email" type="email" required autoComplete="email" placeholder="name@company.com" />
        </label>
        <button className="btn btn-gold" type="submit">{t('reset.submit')}</button>
      </form>
      <p className="muted center"><Link href="/kirish">{t('reset.back')}</Link></p>
    </div>
  );
}
