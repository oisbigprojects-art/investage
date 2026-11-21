import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

// Claude bilan ishlash uchun umumiy yordamchi (moderatsiya va yordam agentlari).
// Kalit faqat serverda: Vercel → Settings → Environment Variables → ANTHROPIC_API_KEY.
export const AI_MODEL = 'claude-opus-5-5';

export const aiReady = () => !!process.env.ANTHROPIC_API_KEY;

let client;
const getClient = () => (client ||= new Anthropic({ timeout: 45_000, maxRetries: 1 }));

// Cookie'siz anonim baza klienti: agent funksiyalari maxfiy kalit bilan tekshiriladi
export const agentDb = () =>
  createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies: { getAll: () => [], setAll() {} } });

// Bitta so'rov, javob JSON sxema bo'yicha. Rad etilsa (refusal) { refused: true } qaytadi.
export async function askJson({ system, user, schema, effort = 'low', maxTokens = 2000 }) {
  const res = await getClient().beta.messages.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    // Tizim ko'rsatmasi har so'rovda bir xil: keshlanadi va keyingi so'rovlar arzonroq bo'ladi
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: user }],
    output_config: { effort, format: { type: 'json_schema', schema } },
    // Model rad etsa, API so'rovni o'zi boshqa mos modelda qayta bajaradi
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });
  if (res.stop_reason === 'refusal') return { refused: true };
  if (res.stop_reason === 'max_tokens') throw new Error('AI javobi kesilib qoldi');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return { data: JSON.parse(text) };
}

export const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
