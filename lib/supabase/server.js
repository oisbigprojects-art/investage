import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';
import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

// Bir so'rov davomida bitta klient (layout va sahifa qayta yaratmaydi)
export const createClient = cache(async () => {
  const [cookieStore, h] = await Promise.all([cookies(), headers()]);
  // Foydalanuvchining haqiqiy IP manzili bazadagi tezlik cheklovlari uchun (private.client_ip).
  // Vercel x-forwarded-for ni o'zi qo'yadi, mijoz uni soxtalashtira olmaydi.
  const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || '').split(',')[0].trim();
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: { headers: ip ? { 'x-client-ip': ip } : {} },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component ichida cookie yozib bo'lmaydi — middleware yangilaydi
          }
        },
      },
    }
  );
});

// Joriy foydalanuvchi va uning profili (rol bilan).
// Tezlik uchun sessiya cookie'dan o'qiladi (Supabase'ga qo'shimcha so'rov yo'q).
// Xavfsizlik: profil so'rovi foydalanuvchi JWT'si bilan yuboriladi, baza uni tekshiradi;
// soxta yoki eskirgan sessiyada profil qaytmaydi va foydalanuvchi "kirmagan" hisoblanadi.
// Barcha ma'lumotlar baribir RLS orqali himoyalangan.
// Faqat cookie'dan o'qiladi (tarmoq so'rovi yo'q): ma'lumot so'rovlarini profil bilan bir vaqtda boshlash uchun
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { supabase, user: session?.user ?? null };
});

export const getSession = cache(async () => {
  const { supabase, user } = await getAuthUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, onboarded, full_name, email, company, interests, bio, notifications_seen_at, city, public_profile, investor_type, check_min, check_max, stages, experience_years, portfolio, website, linkedin, telegram, public_contacts')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile) return { supabase, user: null, profile: null };
  return { supabase, user, profile };
});
