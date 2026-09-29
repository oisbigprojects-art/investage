'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const back = (path, key, msg) => redirect(`${path}?${key}=${encodeURIComponent(msg)}`);

export async function signup(formData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const full_name = String(formData.get('full_name') || '').trim();
  const role = formData.get('role') === 'startup' ? 'startup' : 'investor';

  if (!email || password.length < 6 || !full_name) {
    back('/royxat', 'xato', "Barcha maydonlarni to'ldiring (parol kamida 6 belgi).");
  }

  const h = await headers();
  const origin = h.get('origin') || `https://${h.get('host')}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, full_name }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) back('/royxat', 'xato', error.message);

  // Email tasdiqlash o'chirilgan bo'lsa — darhol kabinetga
  if (data.session) redirect('/kabinet');
  back('/kirish', 'xabar', "Ro'yxatdan o'tdingiz. Emailingizga kelgan havolani bosing, so'ng kiring.");
}

export async function login(formData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) back('/kirish', 'xato', "Email yoki parol noto'g'ri.");
  redirect('/kabinet');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
