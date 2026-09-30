'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/supabase/server';
import { EXTRA_FIELDS } from '@/lib/labels';

const go = (path, key, msg) => redirect(`${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(msg)}`);

// Formadan kelgan "qaytish manzili": faqat saytning ichki yo'li (tashqi saytga yo'naltirib bo'lmaydi)
const back = (formData, fallback) => {
  const b = String(formData.get('back') || '');
  return /^\/(?!\/)[^\s\\#]*$/.test(b) ? b : fallback;
};

const num = (v) => {
  const s = String(v ?? '').replace(/\s/g, '').replace(',', '.');
  return s === '' ? null : Number(s);
};

// Dollar summasi: "$50,000", "50 000", "50000" — hammasi 50000 bo'ladi
const money = (v) => {
  const s = String(v ?? '').replace(/[\s$,_]/g, '');
  return s === '' ? null : Number(s);
};

const text = (formData, key) => String(formData.get(key) || '').trim();

const LOGO_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const LOGO_MAX = 1024 * 1024;
const LOGO_PREFIX = '/storage/v1/object/public/logos/';

// Ommaviy URL dan bucket ichidagi yo'lni ajratadi
const logoPath = (url) => (url && url.includes(LOGO_PREFIX) ? url.split(LOGO_PREFIX)[1] : null);

// ---------------- STARTAP: profilni saqlash ----------------
export async function saveStartup(formData) {
  const PATH = '/kabinet/startap/profil';
  const { supabase, user, profile } = await getSession();
  if (!user || profile?.role !== 'startup') redirect('/kirish');

  const pub = {
    name: text(formData, 'name'),
    sector: text(formData, 'sector'),
    short_desc: text(formData, 'short_desc'),
    stage: text(formData, 'stage') || 'goya',
  };
  if (!pub.name) go(PATH, 'xato', 'Startap nomini kiriting.');

  const funding = money(formData.get('funding_amount'));
  const equity = num(formData.get('equity_percent'));
  if (funding !== null && (isNaN(funding) || funding < 0)) go(PATH, 'xato', "Summa noto'g'ri. Faqat raqam kiriting (AQSH dollarida).");
  if (equity !== null && (isNaN(equity) || equity <= 0 || equity > 100))
    go(PATH, 'xato', "Ulush 0 dan katta va 100 dan kichik bo'lishi kerak.");

  // Logotipni oldindan tekshiramiz (xato bo'lsa hech narsa saqlanmaydi)
  const file = formData.get('logo');
  const hasFile = file && typeof file === 'object' && file.size > 0;
  if (hasFile) {
    if (!LOGO_TYPES[file.type]) go(PATH, 'xato', 'Logotip PNG, JPG yoki WebP formatida bo‘lishi kerak.');
    if (file.size > LOGO_MAX) go(PATH, 'xato', 'Logotip hajmi 1 MB dan oshmasin.');
  }

  const { data: existing } = await supabase
    .from('startups')
    .select('id, logo_url')
    .eq('owner_id', user.id)
    .maybeSingle();

  let startupId = existing?.id;
  if (startupId) {
    const { error } = await supabase
      .from('startups')
      .update({ ...pub, updated_at: new Date().toISOString() })
      .eq('id', startupId);
    if (error) go(PATH, 'xato', error.message);
  } else {
    const { data, error } = await supabase
      .from('startups')
      .insert({ ...pub, owner_id: user.id })
      .select('id')
      .single();
    if (error) go(PATH, 'xato', error.message);
    startupId = data.id;
  }

  // Logotip: yangisini yuklash yoki olib tashlash
  const removeLogo = formData.get('remove_logo') === 'on';
  if (hasFile) {
    const path = `${user.id}/logo-${Date.now()}.${LOGO_TYPES[file.type]}`;
    const { error: upErr } = await supabase.storage
      .from('logos')
      .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    if (upErr) go(PATH, 'xato', `Logotipni yuklab bo'lmadi: ${upErr.message}`);
    const {
      data: { publicUrl },
    } = supabase.storage.from('logos').getPublicUrl(path);
    const { error: e2 } = await supabase.from('startups').update({ logo_url: publicUrl }).eq('id', startupId);
    if (e2) go(PATH, 'xato', e2.message);
    const old = logoPath(existing?.logo_url);
    if (old) await supabase.storage.from('logos').remove([old]);
  } else if (removeLogo && existing?.logo_url) {
    await supabase.from('startups').update({ logo_url: null }).eq('id', startupId);
    const old = logoPath(existing.logo_url);
    if (old) await supabase.storage.from('logos').remove([old]);
  }

  const extra = {};
  for (const f of EXTRA_FIELDS) extra[f.key] = text(formData, `extra_${f.key}`);

  const { error: privErr } = await supabase.from('startup_private').upsert(
    {
      startup_id: startupId,
      funding_amount: funding,
      equity_percent: equity,
      team: text(formData, 'team'),
      contact_email: text(formData, 'contact_email'),
      contact_phone: text(formData, 'contact_phone'),
      contact_telegram: text(formData, 'contact_telegram'),
      extra,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'startup_id' }
  );
  if (privErr) go(PATH, 'xato', privErr.message);

  revalidatePath('/', 'layout');
  go(PATH, 'xabar', 'Saqlandi.');
}

// ---------------- STARTAP: katalogda ko'rinish (yashirish / qayta ko'rsatish) ----------------
export async function setVisibility(formData) {
  const PATH = back(formData, '/kabinet/startap');
  const { supabase, user, profile } = await getSession();
  if (!user || profile?.role !== 'startup') redirect('/kirish');
  const hidden = formData.get('hidden') === 'true';
  const { error } = await supabase.from('startups').update({ hidden }).eq('owner_id', user.id);
  if (error) go(PATH, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(PATH, 'xabar', hidden ? 'Profil yashirildi: katalogda ko‘rinmaydi.' : 'Profil katalogda yana ko‘rinadi.');
}

// ---------------- STARTAP: so'rovni tasdiqlash / rad etish / yopish ----------------
export async function decideRequest(formData) {
  const PATH = back(formData, '/kabinet/startap/sorovlar');
  const { supabase } = await getSession();
  const approve = formData.get('decision') === 'approve';
  const { error } = await supabase.rpc('decide_request', {
    p_request: String(formData.get('request_id')),
    p_approve: approve,
  });
  if (error) go(PATH, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(PATH, 'xabar', approve ? 'Ruxsat berildi.' : "So'rov rad etildi.");
}

export async function revokeAccess(formData) {
  const PATH = back(formData, '/kabinet/startap/sorovlar');
  const { supabase } = await getSession();
  const { error } = await supabase.rpc('revoke_access', { p_request: String(formData.get('request_id')) });
  if (error) go(PATH, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(PATH, 'xabar', 'Ruxsat yopildi.');
}

// ---------------- INVESTOR: so'rov yuborish / qaytarib olish ----------------
export async function requestAccess(formData) {
  const startupId = String(formData.get('startup_id'));
  const path = `/startaplar/${startupId}`;
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'investor') go(path, 'xato', "Faqat investorlar so'rov yubora oladi.");

  const { error } = await supabase.rpc('request_access', {
    p_startup: startupId,
    p_message: text(formData, 'message'),
  });
  if (error) go(path, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(path, 'xabar', "So'rovingiz startapga yuborildi.");
}

export async function withdrawRequest(formData) {
  const PATH = back(formData, '/kabinet/investor/sorovlar');
  const { supabase } = await getSession();
  const { error } = await supabase.rpc('withdraw_request', { p_request: String(formData.get('request_id')) });
  if (error) go(PATH, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(PATH, 'xabar', "So'rov qaytarib olindi.");
}

// ---------------- INVESTOR: startapni saqlash / saqlanganlardan olib tashlash ----------------
export async function toggleSaved(formData) {
  const PATH = back(formData, '/startaplar');
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.role !== 'investor') go(PATH, 'xato', 'Faqat investorlar startaplarni saqlay oladi.');

  const startupId = String(formData.get('startup_id'));
  const { error } =
    formData.get('op') === 'unsave'
      ? await supabase.from('saved_startups').delete().eq('investor_id', user.id).eq('startup_id', startupId)
      : await supabase.from('saved_startups').upsert(
          { investor_id: user.id, startup_id: startupId },
          { onConflict: 'investor_id,startup_id', ignoreDuplicates: true }
        );
  if (error) go(PATH, 'xato', error.message);
  revalidatePath('/', 'layout');
  redirect(PATH);
}

// ---------------- INVESTOR: o'z profilini saqlash ----------------
export async function saveInvestorProfile(formData) {
  const PATH = '/kabinet/investor/profil';
  const { supabase, user, profile } = await getSession();
  if (!user || profile?.role !== 'investor') redirect('/kirish');

  const patch = {
    full_name: text(formData, 'full_name'),
    company: text(formData, 'company'),
    interests: text(formData, 'interests'),
    bio: text(formData, 'bio'),
  };
  if (!patch.full_name) go(PATH, 'xato', 'Ismingizni kiriting.');
  if (patch.company.length > 120) go(PATH, 'xato', 'Kompaniya nomi 120 belgidan oshmasin.');
  if (patch.interests.length > 200) go(PATH, 'xato', 'Qiziqish sohalari 200 belgidan oshmasin.');
  if (patch.bio.length > 600) go(PATH, 'xato', 'O‘zingiz haqingizda matn 600 belgidan oshmasin.');

  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
  if (error) go(PATH, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(PATH, 'xabar', 'Saqlandi.');
}

// ---------------- Bildirishnomalarni o'qilgan deb belgilash ----------------
export async function markNotificationsSeen(formData) {
  const PATH = back(formData, '/kabinet/bildirishnomalar');
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  await supabase.from('profiles').update({ notifications_seen_at: new Date().toISOString() }).eq('id', user.id);
  revalidatePath('/', 'layout');
  redirect(PATH);
}
