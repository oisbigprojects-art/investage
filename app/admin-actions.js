'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAuthUser } from '@/lib/supabase/server';

// Admin amallari. Ruxsat bazada tekshiriladi; bu yerda faqat natijani ko'rsatamiz.
const isId = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
const internal = (v, fallback) => (/^\/admin(?:\/[a-z]+)?(?:\?[^\s#\\]*)?$/.test(String(v || '')) ? String(v) : fallback);
const go = (path, key, msg) => redirect(`${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(msg)}`);

async function ctx() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect('/kirish');
  return supabase;
}

export async function setStartup(formData) {
  const back = internal(formData.get('back'), '/admin/startaplar');
  const supabase = await ctx();
  const id = String(formData.get('id') || '');
  if (!isId(id)) go(back, 'xato', 'Startap topilmadi');

  const flag = (name) => (formData.has(name) ? formData.get(name) === '1' : null);
  let score = null;
  if (formData.has('score')) {
    score = Number(String(formData.get('score')).trim());
    if (!Number.isInteger(score) || score < 0 || score > 100) go(back, 'xato', "Ball 0 dan 100 gacha butun son bo'lishi kerak");
  }
  const { error } = await supabase.rpc('admin_set_startup', { p_id: id, p_verified: flag('verified'), p_hidden: flag('hidden'), p_score: score });
  if (error) go(back, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(back, 'xabar', 'Saqlandi');
}

export async function setFeedback(formData) {
  const back = internal(formData.get('back'), '/admin/murojaatlar');
  const supabase = await ctx();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!isId(id)) go(back, 'xato', 'Murojaat topilmadi');
  const { error } = await supabase.rpc('admin_set_feedback', { p_id: id, p_status: status });
  if (error) go(back, 'xato', error.message);
  revalidatePath('/admin', 'layout');
  go(back, 'xabar', 'Saqlandi');
}
