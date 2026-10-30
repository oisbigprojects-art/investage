-- Admin: o'sish grafiklari va foydalanuvchilarni eksport qilish.
-- Namunaviy (demo) yozuvlar hisobga olinmaydi. Eksportda parol, telefon, yopiq ma'lumot va yozishmalar yo'q.

create or replace function public.admin_growth(p_days integer default 14)
returns table(day date, users bigint, startups bigint, requests bigint)
language plpgsql
stable security definer
set search_path to ''
as $function$
declare v_days integer := greatest(1, least(coalesce(p_days, 14), 90));
begin
  perform private.admin_guard();
  return query
    select d::date,
      (select count(*) from public.profiles p where not p.is_demo and (p.created_at at time zone 'Asia/Tashkent')::date = d::date),
      (select count(*) from public.startups s where not s.is_demo and (s.created_at at time zone 'Asia/Tashkent')::date = d::date),
      (select count(*) from public.access_requests r where (r.created_at at time zone 'Asia/Tashkent')::date = d::date)
    from generate_series((now() at time zone 'Asia/Tashkent')::date - (v_days - 1), (now() at time zone 'Asia/Tashkent')::date, interval '1 day') d
    order by 1;
end $function$;

revoke all on function public.admin_growth(integer) from public, anon;
grant execute on function public.admin_growth(integer) to authenticated;

-- Har bir eksport jurnalga yoziladi: kim, qachon, nechta yozuv
create or replace function public.admin_export_users()
returns table(full_name text, email text, role text, company text, city text, startup text, created_at timestamptz)
language plpgsql
security definer
set search_path to ''
as $function$
declare v_email text; v_n bigint;
begin
  perform private.admin_guard();
  select count(*) into v_n from public.profiles p where not p.is_demo;
  select u.email into v_email from auth.users u where u.id = auth.uid();
  insert into public.admin_actions (admin_id, admin_email, action, target, detail)
  values (auth.uid(), v_email, 'users_export', 'Foydalanuvchilar', jsonb_build_object('rows', v_n));
  return query
    select p.full_name, p.email, p.role, p.company, p.city, s.name, p.created_at
    from public.profiles p left join public.startups s on s.owner_id = p.id
    where not p.is_demo
    order by p.created_at desc;
end $function$;

revoke all on function public.admin_export_users() from public, anon;
grant execute on function public.admin_export_users() to authenticated;
