import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Bir so'rov davomida bitta klient (layout va sahifa qayta yaratmaydi)
export const createClient = cache(async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, email, company, interests, bio, notifications_seen_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile) return { supabase, user: null, profile: null };
  return { supabase, user, profile };
});
