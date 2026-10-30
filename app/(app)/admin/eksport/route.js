import { getAuthUser } from '@/lib/supabase/server';

// Ruxsatni baza tekshiradi (admin + ikki bosqichli kirish). POST: boshqa saytdan havola bilan ishga tushmaydi.
// Excel qiymatni formula deb o'qimasligi uchun =, +, -, @ bilan boshlanganlar oldiga ' qo'yiladi.
const cell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function POST() {
  const { supabase, user } = await getAuthUser();
  if (!user) return new Response('Ruxsat yo\'q', { status: 403 });
  const { data, error } = await supabase.rpc('admin_export_users');
  if (error) return new Response('Ruxsat yo\'q', { status: 403 });

  const head = ['Ism', 'Email', 'Rol', 'Kompaniya', 'Shahar', 'Startap', "Ro'yxatdan o'tgan"];
  const rows = data.map((r) => [r.full_name, r.email, r.role, r.company, r.city, r.startup, r.created_at].map(cell).join(','));
  const csv = '﻿' + [head.map(cell).join(','), ...rows].join('\r\n');
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="investage-foydalanuvchilar-${day}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
