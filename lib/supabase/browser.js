'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

// Brauzerdagi klient (chat va hujjat yuklash uchun). Sessiya cookie'dan olinadi, RLS himoya qiladi.
let client;
export function browserClient() {
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
