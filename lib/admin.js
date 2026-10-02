import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';

// Admin ekanligi bazada tekshiriladi (tasdiqlangan email + ruxsat ro'yxati). Sahifa kodi bunga ishonmaydi:
// har bir admin funksiyasi bazada o'zi ham tekshiradi.
export const getIsAdmin = cache(async () => {
  const { supabase, user } = await getAuthUser();
  if (!user) return false;
  const { data } = await supabase.rpc('is_admin');
  return data === true;
});

// Admin bo'lmaganlarga sahifa umuman yo'qdek ko'rinadi (404)
export async function adminContext() {
  const { supabase, user } = await getAuthUser();
  if (!user) notFound();
  const { data } = await supabase.rpc('is_admin');
  if (data !== true) notFound();
  return { supabase, user };
}

export const PAGE_SIZE = 25;

export function pageOf(sp) {
  const n = parseInt(sp?.sahifa, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 1000) : 1;
}

export function qs(base, params) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '' && !(k === 'sahifa' && Number(v) <= 1)) u.set(k, String(v));
  const s = u.toString();
  return s ? `${base}?${s}` : base;
}
