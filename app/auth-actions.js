'use server';

import { redirect } from 'next/navigation';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';
import { createClient, getSession } from '@/lib/supabase/server';
import { originUrl } from '@/lib/site-url';
import { getT } from '@/lib/i18n/server';
import { MIN_PW } from '@/lib/password';
import { QUESTIONS, REGIONS, normalizePostal, postalError, postalRegions, sanitize } from '@/lib/onboarding';


const back = (path, key, msg) => redirect(`${path}?${key}=${encodeURIComponent(msg)}`);

// Email manzilini tozalash: telefon klaviaturasi qo'shgan bo'shliq, ko'rinmas belgi, bosh harf
// ("Ism@Yandex.ru ", "ism @mail.ru") va oxiridagi nuqta olib tashlanadi. Supabase'ga doim bir xil ko'rinishda boradi.
const cleanEmail = (v) =>
  String(v || '').normalize('NFKC').replace(/[s​-‍﻿]/g, '').replace(/.+$/, '').toLowerCase().slice(0, 200);
const EMAIL_RE = /^[^@s]+@[^@s]+.[a-z]{2,}$/;

// Supabase xatosini foydalanuvchiga tushunarli matnga aylantiradi (aks holda inglizcha xom matn chiqardi)
function signupError(t, error) {
  if (error.code === 'captcha_failed') return t('auth.err_captcha');
  if (error.code === 'email_address_invalid' || error.code === 'validation_failed') return t('auth.err_email');
  if (error.code === 'user_already_exists' || error.code === 'email_exists') return t('auth.err_exists');
  if (error.code === 'weak_password') return t('auth.err_fields', { n: MIN_PW });
  if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit' || error.status === 429) return t('auth.err_rate');
  // Xat yuborilmadi (pochta serveri rad etdi va h.k.): sabab Vercel loglarida ko'rinadi
  console.error('signup failed', error.code, error.status, error.message);
  return t('auth.err_send');
}

// Turnstile tokeni: Supabase tekshiradi (Authentication → Attack Protection)
const captcha = (formData) => String(formData.get('cf-turnstile-response') || '') || undefined;

// Joriy parolni tekshirish uchun alohida mijoz: asosiy sessiyaga tegmaydi, aks holda
// ikki bosqichli kirishdan o'tgan sessiya pastga tushib, parol almashtirish rad etiladi
async function passwordOk(email, password, captchaToken) {
  const client = createPlainClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password, options: { captchaToken } });
  if (error) return false;
  await client.auth.signOut({ scope: 'local' });
  return true;
}

export async function signup(formData) {
  const t = await getT();
  const email = cleanEmail(formData.get('email'));
  const password = String(formData.get('password') || '');
  const full_name = String(formData.get('full_name') || '').trim();
  const role = formData.get('role') === 'startup' ? 'startup' : 'investor';

  if (!email || password.length < MIN_PW || !full_name) {
    back('/royxat', 'xato', t('auth.err_fields', { n: MIN_PW }));
  }
  if (!EMAIL_RE.test(email)) back('/royxat', 'xato', t('auth.err_email'));
  if (formData.get('agree') !== 'on') back('/royxat', 'xato', t('auth.err_agree'));

  const origin = await originUrl();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, full_name }, emailRedirectTo: `${origin}/auth/callback`, captchaToken: captcha(formData) },
  });
  if (error) back('/royxat', 'xato', signupError(t, error));

  // Email tasdiqlash o'chirilgan bo'lsa — darhol kabinetga
  if (data.session) redirect('/kabinet');
  back('/kirish', 'xabar', t('auth.msg_confirm'));
}

export async function login(formData) {
  const t = await getT();
  const email = cleanEmail(formData.get('email'));
  const password = String(formData.get('password') || '');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captcha(formData) } });
  if (error?.code === 'captcha_failed') back('/kirish', 'xato', t('auth.err_captcha'));
  // Email tasdiqlanmagan bo'lsa, kirish sahifasida xatni qayta yuborish formasi ochiladi (tasdiq=1)
  if (error?.code === 'email_not_confirmed') redirect(`/kirish?xato=${encodeURIComponent(t('auth.err_unconfirmed'))}&tasdiq=1`);
  if (error) back('/kirish', 'xato', t('auth.err_creds'));
  // Ikki bosqichli kirish yoqilgan bo'lsa, kod so'raladi
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') redirect('/kirish/kod');
  redirect('/kabinet');
}

// Google bilan kirish (Google'ning o'z tugmasi): brauzer Google'dan ID token oladi, biz uni Supabase'ga beramiz.
// Foydalanuvchi supabase.co sahifasiga o'tmaydi, Google oynasida investage.uz ko'rinadi.
// nonce: brauzer tasodifiy qiymatning xeshini Google'ga bergan, asl qiymatini bu yerga yuboradi (token qayta ishlatilmasin).
export async function googleIdToken(token, nonce) {
  const t = await getT();
  if (typeof token !== 'string' || token.length > 4096 || typeof nonce !== 'string' || nonce.length > 200) return { error: t('auth.err_google') };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token, nonce });
  if (error) return { error: t('auth.err_google') };
  // Ikki bosqichli kirish yoqilgan bo'lsa, middleware kabinet o'rniga kod sahifasini ochadi
  return { next: '/kabinet' };
}

// Birinchi kirishdagi majburiy anketa: hudud, pochta indeksi, rolga qarab qisqa savollar va shartlarga rozilik
export async function finishOnboarding(_prev, formData) {
  const t = await getT();
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  const google = (user.app_metadata?.provider || 'email') !== 'email';
  const role = google ? String(formData.get('role') || '') : profile.role;
  if (!QUESTIONS[role]) return { error: t('ob.err_role') };
  const region = String(formData.get('region') || '');
  const postal = normalizePostal(region, formData.get('postal'));
  const perr = postalError(region, postal);
  if (perr === 'ob.err_postal_region') {
    // Indeks qaysi viloyatniki ekanini aytamiz: foydalanuvchi nimani tuzatishni darhol ko'radi
    const r = REGIONS.find((x) => x.v === postalRegions(postal)[0]);
    return { error: t('ob.err_postal_region_is', { r: r?.[t.lang] || r?.uz || '' }) };
  }
  if (perr) return { error: t(perr) };
  const raw = Object.fromEntries(QUESTIONS[role].map((q) => [q.id, q.type === 'multi' ? formData.getAll(q.id).map(String) : String(formData.get(q.id) || '')]));
  const answers = sanitize(role, raw);
  if (!answers) return { error: t('ob.err_answers') };
  if (formData.get('agree') !== 'on') return { error: t('auth.err_agree') };
  const { error } = await supabase.rpc('finish_onboarding', { p_role: role, p_region: region, p_postal: postal, p_answers: answers });
  if (error) return { error: /indeksi/.test(error.message) ? t('ob.err_postal_region') : t('ob.err_save') };
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
  const after = formData.get('keyin') === 'yangi-parol' ? '/yangi-parol' : '/kabinet';
  if (error) redirect(`/kirish/kod?${after === '/yangi-parol' ? 'keyin=yangi-parol&' : ''}xato=${encodeURIComponent(t('mfa.err_code'))}`);
  redirect(after);
}

// Tasdiqlash xatini qayta yuborish. Javob har doim bir xil: bunday email bor-yo'qligini oshkor qilmaymiz
export async function resendConfirmation(formData) {
  const t = await getT();
  const email = cleanEmail(formData.get('email'));
  if (!email.includes('@')) redirect(`/kirish?xato=${encodeURIComponent(t('reset.err_email'))}&tasdiq=1`);
  const origin = await originUrl();
  const supabase = await createClient();
  await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${origin}/auth/callback`, captchaToken: captcha(formData) } });
  back('/kirish', 'xabar', t('auth.resend_sent'));
}

// Xatdagi tasdiqlash havolasi (/auth/confirm) faqat sahifa ochadi, tasdiqlash shu tugma bosilganda bo'ladi.
// Sabab: Yandex, Mail.ru, Outlook kabi pochtalar xatdagi havolani xavfsizlik uchun oldindan ochib ko'radi
// va bir martalik token foydalanuvchi bosmasdan oldin ishlatilib bo'lardi ("havola eskirgan" xatosi).
const CONFIRM_NEXT = { recovery: '/yangi-parol', email_change: '/kabinet/sozlamalar' };
const CONFIRM_TYPES = ['signup', 'email', 'recovery', 'email_change', 'invite', 'magiclink'];

export async function confirmEmail(formData) {
  const t = await getT();
  const token_hash = String(formData.get('token_hash') || '').slice(0, 300);
  const type = String(formData.get('type') || '');
  if (token_hash && CONFIRM_TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      if (type === 'email_change') back(CONFIRM_NEXT.email_change, 'xabar', t('auth.msg_email_changed'));
      redirect(CONFIRM_NEXT[type] || '/kabinet');
    }
    console.error('verifyOtp failed', type, error.code, error.message);
  }
  if (type === 'recovery') back('/parol-tiklash', 'xato', t('reset.err_expired'));
  redirect(`/kirish?xato=${encodeURIComponent(t('auth.err_link'))}&tasdiq=1`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// ---------------- Parolni tiklash: havola emailga yuboriladi ----------------
export async function requestReset(formData) {
  const t = await getT();
  const email = cleanEmail(formData.get('email'));
  if (!email.includes('@')) back('/parol-tiklash', 'xato', t('reset.err_email'));
  const origin = await originUrl();
  const supabase = await createClient();
  // Natija har doim bir xil ko'rsatiladi: bunday email bor-yo'qligini oshkor qilmaymiz
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/yangi-parol`, captchaToken: captcha(formData) });
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
  // Ikki bosqichli kirish yoqilgan hisobda parolni faqat kod bilan almashtirish mumkin
  if (error?.code === 'insufficient_aal') redirect('/kirish/kod?keyin=yangi-parol');
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
  if (!(await passwordOk(user.email, current, captcha(formData)))) back(SETTINGS, 'xato', t('set.err_current'));
  // current_password ham yuboriladi: Supabase'da "joriy parolni talab qilish" yoqilgan bo'lsa ham ishlaydi
  const { error } = await supabase.auth.updateUser({ password: p1, current_password: current });
  if (error) back(SETTINGS, 'xato', error.message);
  back(SETTINGS, 'xabar', t('set.pw_changed'));
}

export async function changeEmail(formData) {
  const t = await getT();
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  const email = cleanEmail(formData.get('email'));
  if (!EMAIL_RE.test(email) || email === user.email) back(SETTINGS, 'xato', t('set.err_email'));
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
  if (!(await passwordOk(user.email, String(formData.get('password') || ''), captcha(formData)))) back(SETTINGS, 'xato', t('set.err_current'));
  // Yuklangan logotiplarni o'chiramiz, keyin hisobning o'zini (bog'liq ma'lumotlar bazada birga o'chadi)
  const { data: files } = await supabase.storage.from('logos').list(user.id);
  if (files?.length) await supabase.storage.from('logos').remove(files.map((f) => `${user.id}/${f.name}`));
  const { data: videos } = await supabase.storage.from('videos').list(user.id);
  if (videos?.length) await supabase.storage.from('videos').remove(videos.map((f) => `${user.id}/${f.name}`));
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
