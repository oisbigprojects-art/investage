import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';

// Email tasdiqlash havolasi shu yerga qaytadi: kodni sessiyaga almashtiramiz
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Faqat saytning ichki yo'liga qaytaramiz
  const nextRaw = searchParams.get('next') || '/kabinet';
  const next = /^\/(?!\/)[\w\-/]*$/.test(nextRaw) ? nextRaw : '/kabinet';
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  const t = await getT();
  if (next === '/yangi-parol') return NextResponse.redirect(`${origin}/parol-tiklash?xato=${encodeURIComponent(t('reset.err_expired'))}`);
  return NextResponse.redirect(`${origin}/kirish?xabar=${encodeURIComponent(t('auth.msg_confirmed'))}`);
}
