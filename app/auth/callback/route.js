import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Email tasdiqlash havolasi shu yerga qaytadi: kodni sessiyaga almashtiramiz
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/kabinet`);
  }
  return NextResponse.redirect(
    `${origin}/kirish?xabar=${encodeURIComponent('Email tasdiqlandi. Endi kiring.')}`
  );
}
