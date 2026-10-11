'use server';

import { createClient } from '@/lib/supabase/server';
import { QUESTIONS, sanitize } from '@/lib/survey';

// Ommaviy so'rovnoma javobini saqlaydi. Javob bazaga faqat submit_survey funksiyasi orqali tushadi.
export async function submitSurvey(kind, raw, honeypot) {
  // Yashirin maydonni to'ldirgan bo'lsa, bu bot: jim "muvaffaqiyat" qaytaramiz va saqlamaymiz
  if (honeypot) return { ok: true };
  if (!QUESTIONS[kind]) return { ok: false, error: "So'rovnoma topilmadi" };
  const r = sanitize(kind, raw);
  if (!r.ok) return { ok: false, error: r.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc('submit_survey', { p_kind: kind, p_answers: r.answers });
  if (error) {
    const busy = /juda ko/.test(String(error.message));
    return { ok: false, error: busy ? "Hozir so'rovlar juda ko'p. Birozdan keyin qayta urinib ko'ring." : "Yuborib bo'lmadi. Keyinroq qayta urinib ko'ring." };
  }
  return { ok: true };
}
