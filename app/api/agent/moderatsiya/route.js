import { agentDb, aiReady } from '@/lib/ai';
import { moderate } from '@/lib/moderation';

// Baza (pg_net) yangi profil navbatga tushganda shu yerga signal beradi. Kalit sarlavhada keladi va
// har bir baza funksiyasida qayta tekshiriladi, shuning uchun bu yo'lni tashqaridan ishga tushirib bo'lmaydi.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export async function POST(request) {
  const secret = request.headers.get('x-agent-secret') || '';
  if (secret.length < 32) return json({ ok: false }, 401);
  if (!aiReady()) return json({ ok: false, error: 'ANTHROPIC_API_KEY sozlanmagan' }, 503);

  const db = agentDb();
  const { data: items, error } = await db.rpc('agent_mod_take', { p_secret: secret, p_limit: 3 });
  if (error) return json({ ok: false }, 401);

  const results = await Promise.all(
    (items || []).map(async (it) => {
      let r;
      try {
        r = await moderate(it);
      } catch (e) {
        r = { verdict: 'error', severity: 'low', reason: String(e?.message || 'xato').slice(0, 200) };
      }
      const { error: e2 } = await db.rpc('agent_mod_done', {
        p_secret: secret, p_id: it.id, p_verdict: r.verdict, p_severity: r.severity, p_reason: r.reason,
      });
      return { id: it.id, verdict: r.verdict, saved: !e2 };
    })
  );
  return json({ ok: true, checked: results.length, results });
}
