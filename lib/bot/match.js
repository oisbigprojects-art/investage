// Foydalanuvchi savolini bazadagi savollarga solishtirish. Hech qanday tashqi xizmat yo'q.
// O'zbekcha apostroflar ("o'", "g'") va tinish belgilari olib tashlanadi, shuning uchun
// "profilni" so'zi "profil" o'zagiga ham mos keladi.

export function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[ʻʼ‘’'`´]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set([
  'men', 'siz', 'bu', 'uchun', 'bilan', 'qanday', 'qaysi', 'nima', 'kim', 'kerak', 'mumkin', 'bormi', 'yoki', 'ham',
  'я', 'вы', 'это', 'для', 'как', 'что', 'кто', 'какой', 'нужно', 'можно', 'или', 'ещё', 'еще',
  'the', 'and', 'for', 'how', 'what', 'who', 'can', 'do', 'does', 'is', 'are', 'my', 'me', 'you', 'with', 'this',
]);

const words = (s) => norm(s).split(' ').filter((w) => w.length >= 3 && !STOP.has(w));

// So'z boshidan mos kelishi kerak: "parolni" ichidagi "rol" hisobga olinmaydi,
// lekin o'zbekcha qo'shimchalar ("profil" → "profilni") hisobga olinadi.
const hasWord = (text, w) => new RegExp(`(^|\\s)${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u').test(text);

const GREET = /^(salom|assalom|assalomu\s*alaykum|hormang|privet|zdravstvuyte|здравствуйте|привет|хай|hi|hello|hey|hola)\b/i;

export function isGreeting(q) {
  return GREET.test(norm(q)) && norm(q).split(' ').length <= 3;
}

// Eng mos javobni topadi. Topilmasa null qaytaradi — bot "bilmayman" deydi, javob to'qimaydi.
export function findAnswer(query, faq) {
  const n = norm(query);
  if (!n) return null;
  const qWords = words(query);
  let best = null;

  for (const e of faq) {
    let score = 0;

    for (const raw of e.keys) {
      const k = norm(raw);
      if (!k) continue;
      if (hasWord(n, k)) {
        const parts = k.split(' ').length;
        // Bitta umumiy so'z ("narx", "chat") o'zi yetarli emas; ibora qanchalik uzun bo'lsa, shunchalik ishonchli
        score += parts === 1 ? 3 : 4 + parts * 2;
        continue;
      }
      // Ibora to'liq mos kelmasa, uning so'zlari bo'yicha
      const kw = words(raw);
      const hit = kw.filter((w) => hasWord(n, w)).length;
      if (kw.length && hit === kw.length) score += 3;
      else score += hit;
    }

    // Savol matnining o'zi bilan ham solishtiramiz
    const titleWords = words(e.q);
    const shared = qWords.filter((w) => titleWords.some((t) => t.startsWith(w) || w.startsWith(t))).length;
    score += shared * 2;

    // Rolga xos javoblar umumiy javoblardan ustun. Bu faqat allaqachon mos kelganlar orasida
    // tanlash uchun — tasodifiy bitta so'zni javobga aylantirib yubormasligi kerak.
    if (e.own && score >= 4) score += 3;

    if (!best || score > best.score) best = { entry: e, score };
  }

  return best && best.score >= 4 ? best.entry : null;
}

// Javobdan keyin ko'rsatiladigan boshqa savollar
export function related(faq, excludeIds, n = 3) {
  return faq.filter((e) => !excludeIds.includes(e.id)).slice(0, n);
}
