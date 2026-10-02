import { createHash } from 'node:crypto';
import { getSession } from '@/lib/supabase/server';
import { getLang } from '@/lib/i18n/server';
import { systemPrompt } from '@/lib/bot/knowledge';

// Yordamchi bot. Rol SERVERDA aniqlanadi (brauzerdan kelgan ma'lumotga ishonilmaydi),
// shunda startap va investor mavzulari aralashmaydi. Yozishmalar saqlanmaydi.
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TURNS = 12; // brauzerdan keladigan suhbat tarixi shundan uzun bo'lsa, oxirgilari olinadi
const MAX_CHARS = 1000;

const ERR = {
  uz: {
    off: "Bot hozir ishlamayapti. Savolingizni /yordam sahifasi orqali yuboring.",
    limit: "Bugungi savollar chegarasiga yetdingiz. Ertaga davom etamiz yoki /yordam orqali yozing.",
    busy: "Bot bugun juda band. Birozdan keyin urinib ko'ring yoki /yordam orqali yozing.",
    fail: "Javob olib bo'lmadi. Birozdan keyin qayta urinib ko'ring.",
  },
  ru: {
    off: 'Бот сейчас не работает. Отправьте вопрос через страницу /yordam.',
    limit: 'Вы исчерпали дневной лимит вопросов. Продолжим завтра или напишите через /yordam.',
    busy: 'Бот сегодня перегружен. Попробуйте позже или напишите через /yordam.',
    fail: 'Не удалось получить ответ. Попробуйте ещё раз чуть позже.',
  },
  en: {
    off: 'The bot is currently unavailable. Send your question via the /yordam page.',
    limit: 'You have reached today’s question limit. Let us continue tomorrow, or write via /yordam.',
    busy: 'The bot is very busy today. Try later or write via /yordam.',
    fail: 'Could not get an answer. Please try again shortly.',
  },
};

const say = (lang, key, status = 200) =>
  Response.json({ error: (ERR[lang] || ERR.uz)[key] }, { status, headers: { 'cache-control': 'no-store' } });

// Mehmonlarni IP bo'yicha cheklaymiz. IP saqlanmaydi — faqat uning qaytarib bo'lmaydigan izi.
function guestBucket(req) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  return 'g:' + createHash('sha256').update(ip + '|investage-bot').digest('hex').slice(0, 32);
}

export async function POST(req) {
  const lang = await getLang();
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return say(lang, 'off', 503);

  let body;
  try {
    body = await req.json();
  } catch {
    return say(lang, 'fail', 400);
  }

  // Rol serverda aniqlanadi
  const { supabase, profile } = await getSession();
  const audience = profile?.role === 'startup' || profile?.role === 'investor' ? profile.role : 'guest';
  const bucket = profile?.id ? `u:${profile.id}` : guestBucket(req);

  // Suhbat tarixini tozalash: faqat matn, cheklangan uzunlik va navbat
  const raw = Array.isArray(body?.messages) ? body.messages : [];
  const messages = raw
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') return say(lang, 'fail', 400);

  // Kunlik chegara (xarajat nazorati)
  const { data: quota, error: qErr } = await supabase.rpc('bot_take', { p_bucket: bucket, p_audience: audience });
  if (qErr) return say(lang, 'fail', 500);
  if (!quota?.ok) return say(lang, quota?.reason === 'site' ? 'busy' : 'limit', 429);

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: systemPrompt(audience, lang),
        messages,
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    return say(lang, 'fail', 502);
  }

  if (!res.ok) return say(lang, res.status === 429 ? 'busy' : 'fail', 502);

  const data = await res.json().catch(() => null);
  const text = (data?.content || [])
    .filter((b) => b?.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  if (!text) return say(lang, 'fail', 502);

  return Response.json({ text, left: quota.left }, { headers: { 'cache-control': 'no-store' } });
}
