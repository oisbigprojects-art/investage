'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/supabase/server';
import { EXTRA_FIELDS } from '@/lib/labels';

const go = (path, key, msg) => redirect(`${path}?${key}=${encodeURIComponent(msg)}`);
const num = (v) => {
  const s = String(v ?? '').replace(/\s/g, '').replace(',', '.');
  return s === '' ? null : Number(s);
};

// ---------------- STARTAP: profilni saqlash ----------------
export async function saveStartup(formData) {
  const { supabase, user, profile } = await getSession();
  if (!user || profile?.role !== 'startup') redirect('/kirish');

  const pub = {
    name: String(formData.get('name') || '').trim(),
    sector: String(formData.get('sector') || '').trim(),
    short_desc: String(formData.get('short_desc') || '').trim(),
    stage: String(formData.get('stage') || 'goya'),
  };
  if (!pub.name) go('/kabinet/startap', 'xato', 'Startap nomini kiriting.');

  const { data: existing } = await supabase
    .from('startups')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  let startupId = existing?.id;
  if (startupId) {
    const { error } = await supabase
      .from('startups')
      .update({ ...pub, updated_at: new Date().toISOString() })
      .eq('id', startupId);
    if (error) go('/kabinet/startap', 'xato', error.message);
  } else {
    const { data, error } = await supabase
      .from('startups')
      .insert({ ...pub, owner_id: user.id })
      .select('id')
      .single();
    if (error) go('/kabinet/startap', 'xato', error.message);
    startupId = data.id;
  }

  const extra = {};
  for (const f of EXTRA_FIELDS) extra[f.key] = String(formData.get(`extra_${f.key}`) || '').trim();

  const funding = num(formData.get('funding_amount'));
  const equity = num(formData.get('equity_percent'));
  if (funding !== null && (isNaN(funding) || funding < 0)) go('/kabinet/startap', 'xato', "Summa noto'g'ri.");
  if (equity !== null && (isNaN(equity) || equity <= 0 || equity > 100))
    go('/kabinet/startap', 'xato', "Ulush 0 dan katta va 100 dan kichik bo'lishi kerak.");

  const { error: privErr } = await supabase.from('startup_private').upsert(
    {
      startup_id: startupId,
      funding_amount: funding,
      equity_percent: equity,
      team: String(formData.get('team') || '').trim(),
      contact_email: String(formData.get('contact_email') || '').trim(),
      contact_phone: String(formData.get('contact_phone') || '').trim(),
      contact_telegram: String(formData.get('contact_telegram') || '').trim(),
      extra,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'startup_id' }
  );
  if (privErr) go('/kabinet/startap', 'xato', privErr.message);

  revalidatePath('/', 'layout');
  go('/kabinet/startap', 'xabar', 'Saqlandi.');
}

// ---------------- STARTAP: so'rovni tasdiqlash / rad etish / yopish ----------------
export async function decideRequest(formData) {
  const { supabase } = await getSession();
  const { error } = await supabase.rpc('decide_request', {
    p_request: String(formData.get('request_id')),
    p_approve: formData.get('decision') === 'approve',
  });
  if (error) go('/kabinet/startap', 'xato', error.message);
  revalidatePath('/', 'layout');
  go('/kabinet/startap', 'xabar', formData.get('decision') === 'approve' ? 'Ruxsat berildi.' : "So'rov rad etildi.");
}

export async function revokeAccess(formData) {
  const { supabase } = await getSession();
  const { error } = await supabase.rpc('revoke_access', { p_request: String(formData.get('request_id')) });
  if (error) go('/kabinet/startap', 'xato', error.message);
  revalidatePath('/', 'layout');
  go('/kabinet/startap', 'xabar', 'Ruxsat yopildi.');
}

// ---------------- INVESTOR: so'rov yuborish ----------------
export async function requestAccess(formData) {
  const startupId = String(formData.get('startup_id'));
  const path = `/startaplar/${startupId}`;
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'investor') go(path, 'xato', "Faqat investorlar so'rov yubora oladi.");

  const { error } = await supabase.rpc('request_access', {
    p_startup: startupId,
    p_message: String(formData.get('message') || '').trim(),
  });
  if (error) go(path, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(path, 'xabar', "So'rovingiz startapga yuborildi.");
}
