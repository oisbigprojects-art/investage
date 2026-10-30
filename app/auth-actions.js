'use server';

import { redirect } from 'next/navigation';
import { createClient, getSession } from '@/lib/supabase/server';
import { originUrl } from '@/lib/site-url';
import { getT } from '@/lib/i18n/server';
import { MIN_PW } from '@/lib/password';


const back = (path, key, msg) => redirect(`${path}?${key}=${encodeURIComponent(msg)}`);

export async function signup(formData) {
  const t = await getT();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const full_name = String(formData.get('full_name') || '').trim();
  const role = formData.get('role') === 'startup' ? 'startup' : 'investor';

  if (!email || password.length < MIN_PW || !full_name) {
    back('/royxat', 'xato', t('auth.err_fields', { n: MIN_PW }));
  }
  if (formData.get('agree') !== 'on') back('/royxat', 'xato', t('auth.err_agree'));

  const origin = await originUrl();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, full_name }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) back('/royxat', 'xato', error.message);

  // Email tasdiqlash o'chirilgan bo'lsa — darhol kabinetga
  if (data.session) redirect('/kabinet');
  back('/kirish', 'xabar', t('auth.msg_confirm'));
}

export async function login(formData) {
  const t = await getT();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Email tasdiqlanmagan bo'lsa, kirish sahifasida xatni qayta yuborish formasi ochiladi (tasdiq=1)
  if (error?.code === 'email_not_confirmed') redirect(`/kirish?xato=${encodeURIComponent(t('auth.err_unconfirmed'))}&tasdiq=1`);
  if (error) back('/kirish', 'xato', t('auth.err_creds'));
  // Ikki bosqichli kirish yoqilgan bo'lsa, kod so'raladi
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') redirect('/kirish/kod');
  redirect('/kabinet');
}

// Ikkinchi bosqich: ilovadagi kodni tekshiradi (urinishlar sonini Supabase cheklaydi)
export async function verifyMfa(formData) {
  const t = await getT();
  const code = String(formData.get('code') || '').trim();
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.[0];
  if (!factor) redirect('/kabinet');
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) back('/kirish/kod', 'xato', t('mfa.err_code'));
  redirect('/kabinet');
}

// Tasdiqlash xatini qayta yuborish. Javob har doim bir xil: bunday email bor-yo'qligini oshkor qilmaymiz
export async function resendConfirmation(formData) {
  const t = await getT();
  const email = String(formData.get('email') || '').trim().slice(0, 200);
  if (!email.includes('@')) redirect(`/kirish?xato=${encodeURIComponent(t('reset.err_email'))}&tasdiq=1`);
  const origin = await originUrl();
  const supabase = await createClient();
  await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${origin}/auth/callback` } });
  back('/kirish', 'xabar', t('auth.resend_sent'));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// ---------------- Parolni tiklash: havola emailga yuboriladi ----------------
export async function requestReset(formData) {
  const t = await getT();
  const email = String(formData.get('email') || '').trim().slice(0, 200);
  if (!email.includes('@')) back('/parol-tiklash', 'xato', t('reset.err_email'));
  const origin = await originUrl();
  const supabase = await createClient();
  // Natija har doim bir xil ko'rsatiladi: bunday email bor-yo'qligini oshkor qilmaymiz
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/yangi-parol` });
  back('/parol-tiklash', 'xabar', t('reset.sent'));
}

// Havoladan kelgan (yoki kirgan) foydalanuvchi yangi parol o'rnatadi
export async function setNewPassword(formData) {
  const t = await getT();
  const p1 = String(formData.get('password') || '');
  const p2 = String(formData.get('password2') || '');
  if (p1.length < MIN_PW) back('/yangi-parol', 'xato', t('reset.err_short', { n: MIN_PW }));
  if (p1 !== p2) back('/yangi-parol', 'xato', t('reset.err_match'));
  const { supabase, user } = await getSession();
  if (!user) back('/parol-tiklash', 'xato', t('reset.err_expired'));
  const { error } = await supabase.auth.updateUser({ password: p1 });
  if (error) back('/yangi-parol', 'xato', error.message);
  redirect(`/kabinet/sozlamalar?xabar=${encodeURIComponent(t('reset.done'))}`);
}

// ---------------- Hisob sozlamalari ----------------
const SETTINGS = '/kabinet/sozlamalar';

export async function changePassword(formData) {
  const t = await getT();
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  const current = String(formData.get('current') || '');
  const p1 = String(formData.get('password') || '');
  const p2 = String(formData.get('password2') || '');
  if (p1.length < MIN_PW) back(SETTINGS, 'xato', t('reset.err_short', { n: MIN_PW }));
  if (p1 !== p2) back(SETTINGS, 'xato', t('reset.err_match'));
  // Joriy parolni tekshiramiz (sessiya o'g'irlangan bo'lsa ham parol almashtirib bo'lmasin)
  const { error: e1 } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (e1) back(SETTINGS, 'xato', t('set.err_current'));
  // current_password ham yuboriladi: Supabase'da "joriy parolni talab qilish" yoqilgan bo'lsa ham ishlaydi
  const { error } = await supabase.auth.updateUser({ password: p1, current_password: current });
  if (error) back(SETTINGS, 'xato', error.message);
  back(SETTINGS, 'xabar', t('set.pw_changed'));
}

export async function changeEmail(formData) {
  const t = await getT();
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  const email = String(formData.get('email') || '').trim().slice(0, 200);
  if (!email.includes('@') || email === user.email) back(SETTINGS, 'xato', t('set.err_email'));
  const origin = await originUrl();
  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${origin}/auth/callback?next=/kabinet/sozlamalar` });
  if (error) back(SETTINGS, 'xato', error.message);
  back(SETTINGS, 'xabar', t('set.email_sent'));
}

export async function deleteAccount(formData) {
  const t = await getT();
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  if (String(formData.get('confirm') || '').trim().toUpperCase() !== t('set.del_word').toUpperCase()) back(SETTINGS, 'xato', t('set.err_del_word'));
  const { error: e1 } = await supabase.auth.signInWithPassword({ email: user.email, password: String(formData.get('password') || '') });
  if (e1) back(SETTINGS, 'xato', t('set.err_current'));
  // Yuklangan logotiplarni o'chiramiz, keyin hisobning o'zini (bog'liq ma'lumotlar bazada birga o'chadi)
  const { data: files } = await supabase.storage.from('logos').list(user.id);
  if (files?.length) await supabase.storage.from('logos').remove(files.map((f) => `${user.id}/${f.name}`));
  // Maxfiy hujjatlar (pitch, moliyaviy...) ham o'chadi: baza qatorlari cascade bilan o'chadi, storage fayllari esa o'zicha qolardi.
  // O'chmasa, hisob ham o'chirilmaydi: egasiz maxfiy fayl qolib ketmasin.
  const { data: own } = await supabase.from('startups').select('id').eq('owner_id', user.id).maybeSingle();
  if (own) {
    const { data: docs, error: le } = await supabase.storage.from('docs').list(own.id, { limit: 1000 });
    const { error: re } = docs?.length ? await supabase.storage.from('docs').remove(docs.map((f) => `${own.id}/${f.name}`)) : {};
    if (le || re) back(SETTINGS, 'xato', t('set.err_docs'));
  }
  const { error } = await supabase.rpc('delete_my_account');
  if (error) back(SETTINGS, 'xato', error.message);
  await supabase.auth.signOut();
  redirect(`/kirish?xabar=${encodeURIComponent(t('set.deleted'))}`);
}
