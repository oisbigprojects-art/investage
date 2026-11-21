import { agentDb, aiReady } from '@/lib/ai';
import { answerQuestion } from '@/lib/assistant';

// Telegram botga yozilgan erkin savol: baza signal beradi, sayt Claude'dan javob oladi va uni
// agent_tg_answer orqali botning o'zi yuboradi. Chat ID bu yerga kelmaydi.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

const FALLBACK = {
  uz: "Kechirasiz, hozir javob bera olmadim. Savolingizni saytdagi «Yordam» sahifasi orqali jamoamizga yuboring.",
  ru: 'Извините, сейчас не получилось ответить. Отправьте вопрос нашей команде через страницу «Помощь» на сайте.',
  en: 'Sorry, I could not answer right now. Please send your question to our team via the Help page on the site.',
};

export async function POST(request) {
  const secret = request.headers.get('x-agent-secret') || '';
  if (secret.length < 32) return json({ ok: false }, 401);
  let body = {};
  try { body = await request.json(); } catch {}
  const id = Number.isSafeInteger(body?.id) ? body.id : null;

  const db = agentDb();
  let answered = 0;
  // Signal bitta savol uchun keladi; zaxira (cron) chaqiruvida bir nechta ochiq savol bo'lishi mumkin
  for (let i = 0; i < (id ? 1 : 3); i++) {
    const { data: q, error } = await db.rpc('agent_tg_take', { p_secret: secret, p_id: id });
    if (error) return json({ ok: false }, 401);
    if (!q) break;
    let answer = FALLBACK[q.lang] || FALLBACK.uz;
    let confident = false;
    if (aiReady()) {
      try {
        const r = await answerQuestion({ question: q.question, audience: q.audience, lang: q.lang });
        if (r.answer) ({ answer, confident } = r);
      } catch {}
    }
    await db.rpc('agent_tg_answer', { p_secret: secret, p_id: q.id, p_answer: answer, p_confident: confident });
    answered++;
  }
  return json({ ok: true, answered });
}
