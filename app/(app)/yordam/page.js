import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { Flash } from '@/components/ui';
import { sendFeedback } from '@/app/cabinet-actions';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('meta.help') };
}

// Fikr, taklif yoki muammo yozib qoldirish (mehmon ham yubora oladi)
export default async function HelpPage({ searchParams }) {
  const sp = await searchParams;
  const [{ profile }, t] = await Promise.all([getSession(), getT()]);

  return (
    <>
      <div className="page-head">
        <h1>{t('help.title')}</h1>
        <p className="muted">{t('help.sub')}</p>
      </div>
      <Flash searchParams={sp} />

      <form action={sendFeedback} className="card form help-form">
        <fieldset className="role-radio">
          <legend>{t('help.kind')}</legend>
          {['support', 'bug', 'feedback'].map((k, i) => (
            <label key={k} className="radio-card">
              <input type="radio" name="kind" value={k} defaultChecked={i === 0} />
              <span>
                <strong>{t(`help.kind_${k}`)}</strong>
                <small>{t(`help.kind_${k}_d`)}</small>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="two">
          <label>
            {t('help.name')}
            <input name="name" defaultValue={profile?.full_name || ''} maxLength={120} />
          </label>
          <label>
            {t('help.email')}
            <input name="email" type="email" defaultValue={profile?.email || ''} maxLength={200} placeholder={t('help.email_ph')} />
          </label>
        </div>
        <label>
          {t('help.message')}
          <textarea name="message" rows={6} required minLength={5} maxLength={4000} placeholder={t('help.message_ph')} />
        </label>
        {/* Botlar uchun yashirin maydon */}
        <input className="visually-hidden" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button className="btn btn-gold" type="submit">
          {t('help.send')}
        </button>
        <p className="muted small">{t('help.note')}</p>
      </form>
    </>
  );
}
