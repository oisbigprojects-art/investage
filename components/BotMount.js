import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { faqFor, STARTERS } from '@/lib/bot/faq';
import Bot from './Bot';

const KEYS = ['bot.title', 'bot.open', 'bot.close', 'bot.placeholder', 'bot.send', 'bot.no_match', 'bot.ask_team', 'bot.pick', 'bot.more', 'bot.note', 'bot.help'];

const GREETING = {
  guest: {
    uz: "Salom! Men Investage yordamchisiman. Platforma qanday ishlashi, ro'yxatdan o'tish yoki rollar haqida so'rang.",
    ru: 'Здравствуйте! Я помощник Investage. Спросите, как работает платформа, о регистрации или ролях.',
    en: 'Hello! I am the Investage assistant. Ask me how the platform works, about signing up, or about roles.',
  },
  startup: {
    uz: "Salom! Startap kabineti bo'yicha yordam beraman: profil, so'rovlar, hujjatlar, investorga taklif.",
    ru: 'Здравствуйте! Помогу по кабинету стартапа: профиль, запросы, документы, предложение инвестору.',
    en: 'Hello! I can help with the startup cabinet: profile, requests, documents, offers to investors.',
  },
  investor: {
    uz: "Salom! Investor kabineti bo'yicha yordam beraman: so'rov yuborish, profil, saqlanganlar, xabarlar.",
    ru: 'Здравствуйте! Помогу по кабинету инвестора: запросы, профиль, сохранённые, сообщения.',
    en: 'Hello! I can help with the investor cabinet: access requests, profile, saved startups, messages.',
  },
};

// Rol shu yerda (serverda) aniqlanadi: mehmon, startap va investor uchun alohida savol-javob doirasi.
// Brauzerga faqat shu auditoriya va shu tildagi javoblar yuboriladi.
export default async function BotMount() {
  const [{ profile }, t] = await Promise.all([getSession(), getT()]);
  const audience = profile?.role === 'startup' || profile?.role === 'investor' ? profile.role : 'guest';
  const lang = t.lang;

  const faq = faqFor(audience, lang);
  const ids = STARTERS[audience];
  const starters = ids.map((id) => faq.find((e) => e.id === id)).filter(Boolean);

  const labels = Object.fromEntries(KEYS.map((k) => [k.replace('bot.', ''), t(k)]));
  labels.subtitle = t(`bot.sub_${audience}`);

  return <Bot faq={faq} starters={starters} greeting={GREETING[audience][lang] || GREETING[audience].uz} labels={labels} />;
}
