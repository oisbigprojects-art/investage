import { redirect } from 'next/navigation';
import { getT } from '@/lib/i18n/server';
import { confirmEmail } from '@/app/auth-actions';

// Email xatlaridagi havolalar shu yerga keladi (token_hash). Sahifa ochilishi hech narsani tasdiqlamaydi:
// tasdiqlash faqat tugma bosilganda (POST) bo'ladi. Yandex, Mail.ru, Outlook havolani oldindan ochib tekshiradi;
// avval GET'ning o'zida tasdiqlanardi va bir martalik token foydalanuvchidan oldin ishlatilib ketardi.
// Havola boshqa qurilma yoki brauzerda ochilsa ham ishlaydi (masalan, xat telefonda o'qilsa).
const TYPES = ['signup', 'email', 'recovery', 'email_change', 'invite', 'magiclink'];

export const metadata = { robots: { index: false, follow: false } };

export default async function ConfirmPage({ searchParams }) {
  const sp = await searchParams;
  const t = await getT();
  const token_hash = typeof sp?.token_hash === 'string' ? sp.token_hash : '';
  const type = typeof sp?.type === 'string' ? sp.type : '';
  if (!token_hash || !TYPES.includes(type)) {
    if (type === 'recovery') redirect(`/parol-tiklash?xato=${encodeURIComponent(t('reset.err_expired'))}`);
    redirect(`/kirish?xato=${encodeURIComponent(t('auth.err_link'))}&tasdiq=1`);
  }
  const kind = type === 'recovery' ? 'recovery' : type === 'email_change' ? 'change' : 'signup';

  return (
    <div className="auth">
      <h1>{t(`confirm.title_${kind}`)}</h1>
      <p className="muted">{t(`confirm.sub_${kind}`)}</p>
      <form action={confirmEmail} className="card form">
        <input type="hidden" name="token_hash" value={token_hash} />
        <input type="hidden" name="type" value={type} />
        <button className="btn btn-gold" type="submit">{t(`confirm.btn_${kind}`)}</button>
      </form>
    </div>
  );
}
