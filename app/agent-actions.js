'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { adminContext } from '@/lib/admin';
import { collectSnapshot, analyze } from '@/lib/agent';

// Admin agenti amallari. Ruxsat bazada tekshiriladi (adminContext + admin_* funksiyalar).
const BACK = '/admin/agent';
const isId = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
const go = (key, msg) => redirect(`${BACK}?${key}=${encodeURIComponent(msg)}`);
const friendly = (e) => (/admin_agent|agent_proposals/.test(String(e?.message)) ? "Avval supabase/agent.sql faylini Supabase SQL Editor'da ishga tushiring" : e?.message || 'Xato');

export async function runAgent() {
  const { supabase } = await adminContext();
  if (!process.env.ANTHROPIC_API_KEY) go('xato', "ANTHROPIC_API_KEY sozlanmagan (Vercel > Settings > Environment Variables)");

  let added = 0;
  let err = null;
  try {
    const snap = await collectSnapshot(supabase);
    if (snap.users.length + snap.startups.length + snap.feedback.length) {
      const items = await analyze(snap);
      if (items.length) {
        const { data, error } = await supabase.rpc('admin_agent_add', { p_items: items });
        if (error) throw error;
        added = Number(data) || 0;
      }
    }
  } catch (e) {
    err = friendly(e);
  }
  revalidatePath(BACK);
  if (err) go('xato', err);
  go('xabar', added ? `${added} ta yangi taklif qo'shildi` : "Yangi taklif yo'q");
}

export async function decideProposal(formData) {
  const { supabase } = await adminContext();
  const id = String(formData.get('id') || '');
  const decision = formData.get('decision') === 'approve' ? 'approved' : 'dismissed';
  if (!isId(id)) go('xato', 'Taklif topilmadi');

  let err = null;
  try {
    if (decision === 'approved') {
      const { data: list, error: e1 } = await supabase.rpc('admin_agent_list', { p_status: 'pending', p_limit: 200 });
      if (e1) throw e1;
      const p = (list || []).find((x) => x.id === id);
      if (!p) throw new Error("Taklif topilmadi yoki allaqachon ko'rilgan");
      // Amal faqat taklif turidan olinadi (modelning "suggested" maydoniga ishonilmaydi)
      if (p.target_type === 'startup' && (p.kind === 'verify_startup' || p.kind === 'hide_startup')) {
        const { error } = await supabase.rpc('admin_set_startup', {
          p_id: p.target_id,
          p_verified: p.kind === 'verify_startup' ? true : null,
          p_hidden: p.kind === 'hide_startup' ? true : null,
          p_score: null,
        });
        if (error) throw error;
      }
    }
    const { error } = await supabase.rpc('admin_agent_decide', { p_id: id, p_decision: decision });
    if (error) throw error;
  } catch (e) {
    err = friendly(e);
  }
  revalidatePath('/', 'layout');
  if (err) go('xato', err);
  go('xabar', decision === 'approved' ? 'Bajarildi' : 'Rad etildi');
}
