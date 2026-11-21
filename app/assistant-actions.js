'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { agentDb, aiReady } from '@/lib/ai';
import { answerQuestion } from '@/lib/assistant';

// Sayt boti tayyor javob topa olmaganda AI yordamchidan so'raydi.
// Kunlik limit bazada (ai_bot_take): mehmon 12, foydalanuvchi 40, butun sayt 400 savol.
export async function askAssistant(question, history = []) {
  const q = String(question || '').trim().slice(0, 300);
  if (q.length < 2 || !aiReady()) return { ok: false };

  const [{ user, profile }, t, h] = await Promise.all([getSession(), getT(), headers()]);
  const audience = profile?.role === 'startup' || profile?.role === 'investor' ? profile.role : 'guest';
  const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || '').split(',')[0].trim();
  // IP manzil bazaga ochiq holda yozilmaydi
  const bucket = user ? `u:${user.id}` : `ip:${createHash('sha256').update(ip || 'unknown').digest('hex').slice(0, 32)}`;

  const { data: lim, error } = await agentDb().rpc('ai_bot_take', { p_bucket: bucket, p_audience: audience });
  if (error || !lim?.ok) return { ok: false, limited: !error };

  const past = (Array.isArray(history) ? history : [])
    .slice(-6)
    .filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string')
    .map((m) => ({ role: m.role, text: m.text.slice(0, 500) }));

  try {
    const r = await answerQuestion({ question: q, audience, lang: t.lang, history: past });
    if (!r.answer) return { ok: false };
    return { ok: true, answer: r.answer, confident: r.confident };
  } catch {
    return { ok: false };
  }
}
