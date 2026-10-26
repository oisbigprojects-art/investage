import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';

// Email shablonlaridagi havolalar shu yerga keladi (token_hash). /auth/callback dan farqi:
// havola boshqa qurilma yoki brauzerda ochilsa ham ishlaydi (masalan, xat telefonda o'qilsa).
const NEXT = { recovery: '/yangi-parol', email_change: '/kabinet/sozlamalar' };
const TYPES = ['signup', 'email', 'recovery', 'email_change', 'invite', 'magiclink'];

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const t = await getT();

  if (token_hash && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      if (type === 'email_change') return NextResponse.redirect(`${origin}${NEXT.email_change}?xabar=${encodeURIComponent(t('auth.msg_email_changed'))}`);
      return NextResponse.redirect(`${origin}${NEXT[type] || '/kabinet'}`);
    }
  }
  if (type === 'recovery') return NextResponse.redirect(`${origin}/parol-tiklash?xato=${encodeURIComponent(t('reset.err_expired'))}`);
  return NextResponse.redirect(`${origin}/kirish?xato=${encodeURIComponent(t('auth.err_link'))}&tasdiq=1`);
}
