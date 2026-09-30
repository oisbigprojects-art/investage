import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';

// Email tasdiqlash havolasi shu yerga qaytadi: kodni sessiyaga almashtiramiz
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/kabinet`);
  }
  const t = await getT();
  return NextResponse.redirect(`${origin}/kirish?xabar=${encodeURIComponent(t('auth.msg_confirmed'))}`);
}
