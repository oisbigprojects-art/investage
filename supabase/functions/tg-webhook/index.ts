// Telegram bot webhook: yangilanishni maxfiy kalit bilan bazadagi tg_webhook funksiyasiga uzatadi.
// Kalit bazada (Vault) tekshiriladi; noto'g'ri kalitli so'rovlar e'tiborsiz qoladi.
// tg_webhook faqat service_role uchun ochiq (2026-10-26-tg-webhook-yopish.sql), shuning uchun service kalit ishlatiladi.
// SUPABASE_SERVICE_ROLE_KEY Edge Function muhitida avtomatik bor; uni kodga yozmang.
// Deploy: Supabase → Edge Functions → tg-webhook → Code (verify_jwt o'chiq qoladi: Telegram JWT yubormaydi).
const URL_BASE = Deno.env.get('SUPABASE_URL') ?? 'https://fuklumjbymmkaflzndxp.supabase.co';
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('ok');
  const secret = req.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!secret || !KEY) return new Response('ok');
  let update: unknown = null;
  try { update = await req.json(); } catch { return new Response('ok'); }
  try {
    await fetch(`${URL_BASE}/rest/v1/rpc/tg_webhook`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: secret, p_update: update }),
    });
  } catch (_) { /* Telegram qayta yubormasligi uchun baribir 200 */ }
  return new Response('ok');
});
