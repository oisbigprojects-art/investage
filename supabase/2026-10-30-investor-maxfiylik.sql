-- Investor maxfiyligi: startap investorning to'liq profilini (email, telegram, portfolio) faqat
-- investorning o'zi so'rov yuborgan bo'lsa ko'radi. Oldin startap taklif yuborishning o'zi bilan ham
-- shu ma'lumotni o'qiy olardi, hatto investor kontaktlarini yashirgan bo'lsa ham.
-- Taklif va chat ishlashda davom etadi: ism chat funksiyalari orqali ko'rinadi.

create or replace function private.requested_my_startup(pid uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.access_requests r
    join public.startups s on s.id = r.startup_id
    where r.investor_id = pid and s.owner_id = auth.uid() and r.initiated_by = 'investor'
  )
$function$;
