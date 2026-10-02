import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { GREETING, SUGGESTIONS } from '@/lib/bot/knowledge';
import Bot from './Bot';

const KEYS = ['bot.title', 'bot.open', 'bot.close', 'bot.placeholder', 'bot.send', 'bot.thinking', 'bot.fail', 'bot.note', 'bot.help'];

// Rol shu yerda (serverda) aniqlanadi: mehmon, startap yoki investor uchun alohida bot.
export default async function BotMount() {
  // Kalit sozlanmagan bo'lsa, bot umuman ko'rsatilmaydi (bosib bo'lmaydigan tugma chiqmasin)
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const [{ profile }, t] = await Promise.all([getSession(), getT()]);
  const audience = profile?.role === 'startup' || profile?.role === 'investor' ? profile.role : 'guest';
  const lang = t.lang;

  const labels = Object.fromEntries(KEYS.map((k) => [k.replace('bot.', ''), t(k)]));
  labels.subtitle = t(`bot.sub_${audience}`);

  return (
    <Bot
      greeting={GREETING[audience][lang] || GREETING[audience].uz}
      suggestions={SUGGESTIONS[audience][lang] || SUGGESTIONS[audience].uz}
      labels={labels}
    />
  );
}
