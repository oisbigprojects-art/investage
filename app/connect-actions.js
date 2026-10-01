'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { TG_BOT } from '@/lib/telegram';

// Startap taklifi, Telegram ulash va hujjatlar uchun server amallari

const go = (path, key, msg) => redirect(`${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(msg)}`);
const isId = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
const internal = (v, fallback) => (/^\/(?!\/)[^\s\\#]*$/.test(String(v || '')) ? String(v) : fallback);

const DB_ERRORS = {
  'Avval tizimga kiring': 'db.login_first',
  'Faqat startaplar taklif yubora oladi': 'of.err_role',
  "Avval startap profilini to'ldiring": 'of.err_no_startup',
  'Investor topilmadi': 'of.err_investor',
  'Kunlik taklif chegarasi': 'of.err_limit',
  'Bu investorda allaqachon ruxsat bor': 'of.err_exists',
  'Taklif topilmadi': 'of.err_gone',
  'Hujjatlar soni chegarasi': 'doc.err_limit',
};
const dbMsg = (t, error) => (DB_ERRORS[error?.message] ? t(DB_ERRORS[error.message]) : error?.message || '');

// ---------------- STARTAP: investorga taklif yuborish ----------------
export async function offerToInvestor(formData) {
  const investorId = String(formData.get('investor_id') || '');
  const PATH = `/investorlar/${investorId}`;
  const t = await getT();
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (!isId(investorId)) go('/investorlar', 'xato', t('of.err_investor'));
  if (profile?.role !== 'startup') go(PATH, 'xato', t('of.err_role'));

  const message = String(formData.get('message') || '').trim().slice(0, 1000);
  const { data: requestId, error } = await supabase.rpc('offer_to_investor', { p_investor: investorId, p_message: message });
  if (error) go(PATH, 'xato', dbMsg(t, error));
  revalidatePath('/', 'layout');
  go(message ? `/kabinet/xabarlar/${requestId}` : PATH, 'xabar', t('of.sent'));
}

// ---------------- INVESTOR: taklifni rad etish ----------------
export async function declineOffer(formData) {
  const PATH = internal(formData.get('back'), '/kabinet/investor/sorovlar');
  const t = await getT();
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  const { error } = await supabase.rpc('decline_offer', { p_request: String(formData.get('request_id') || '') });
  if (error) go(PATH, 'xato', dbMsg(t, error));
  revalidatePath('/', 'layout');
  go(PATH, 'xabar', t('of.declined'));
}

// ---------------- Telegram xabarnomalarini ulash / o'chirish ----------------
export async function connectTelegram() {
  const t = await getT();
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  const { data: code, error } = await supabase.rpc('tg_link_code', { p_lang: t.lang });
  if (error || !code) go('/kabinet/sozlamalar', 'xato', t('tg.err'));
  redirect(`https://t.me/${TG_BOT}?start=${code}`);
}

export async function disconnectTelegram() {
  const t = await getT();
  const { supabase, user } = await getSession();
  if (!user) redirect('/kirish');
  await supabase.rpc('tg_unlink');
  revalidatePath('/kabinet/sozlamalar');
  go('/kabinet/sozlamalar', 'xabar', t('tg.off_done'));
}

// ---------------- STARTAP: hujjatni o'chirish ----------------
export async function deleteDocument(formData) {
  const PATH = '/kabinet/startap/hujjatlar';
  const t = await getT();
  const { supabase, user, profile } = await getSession();
  if (!user || profile?.role !== 'startup') redirect('/kirish');
  const id = String(formData.get('doc_id') || '');
  if (!isId(id)) go(PATH, 'xato', t('doc.err_gone'));

  const { data: doc } = await supabase.from('startup_documents').select('id, path').eq('id', id).maybeSingle();
  if (!doc) go(PATH, 'xato', t('doc.err_gone'));
  if (!doc.path.startsWith('/')) await supabase.storage.from('docs').remove([doc.path]);
  const { error } = await supabase.from('startup_documents').delete().eq('id', id);
  if (error) go(PATH, 'xato', error.message);
  revalidatePath('/', 'layout');
  go(PATH, 'xabar', t('doc.deleted'));
}
