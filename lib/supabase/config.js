// Supabase manzili va publishable (ochiq) kaliti.
// Bu kalit brauzerga ham yuboriladi va maxfiy emas: ma'lumotlarni RLS qoidalari himoya qiladi.
// Hosting sozlamasida (env) berilsa o'sha ishlatiladi, bo'lmasa shu qiymatlar.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuklumjbymmkaflzndxp.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_eEbZF65rAP2VvH5pcdV2WA_tDOATRNG';
