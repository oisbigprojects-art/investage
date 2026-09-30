import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

// Har kuni Vercel Cron chaqiradi: bazaga kichik so'rov yuboriladi, shunda bepul Supabase loyihasi
// "faolsiz" deb to'xtatilmaydi. Hech qanday ma'lumot qaytarmaydi.
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies: { getAll: () => [], setAll() {} } });
  const { error } = await supabase.from('startups').select('id', { head: true, count: 'exact' }).limit(1);
  return Response.json({ ok: !error, at: new Date().toISOString() }, { status: error ? 500 : 200, headers: { 'cache-control': 'no-store' } });
}
