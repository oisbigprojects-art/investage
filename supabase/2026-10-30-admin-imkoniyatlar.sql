-- Admin: foydalanuvchi sahifasi, bloklash, yangi ro'yxatdan o'tish haqida Telegram xabari.
-- Yopiq startap ma'lumotlari va yozishmalar bu yerda ham ochilmaydi.

-- Bitta foydalanuvchi haqida umumiy ma'lumot
create or replace function public.admin_user_detail(p_id uuid)
returns jsonb
language plpgsql
stable security definer
set search_path to ''
as $function$
declare v jsonb;
begin
  perform private.admin_guard();
  select jsonb_build_object(
    'id', p.id, 'full_name', p.full_name, 'email', p.email, 'role', p.role, 'company', p.company, 'city', p.city,
    'is_demo', p.is_demo, 'created_at', p.created_at,
    'confirmed', u.email_confirmed_at is not null,
    'last_sign_in_at', u.last_sign_in_at,
    'blocked', u.banned_until is not null and u.banned_until > now(),
    'mfa', exists (select 1 from auth.mfa_factors f where f.user_id = p.id and f.status = 'verified'),
    'is_admin', exists (select 1 from private.admin_ids a where a.user_id = p.id),
    'requests', (select count(*) from public.access_requests r left join public.startups s2 on s2.id = r.startup_id
                 where r.investor_id = p.id or s2.owner_id = p.id),
    'startup', (select jsonb_build_object('id', s.id, 'name', s.name, 'verified', s.verified, 'hidden', s.hidden, 'listed', s.listed, 'score', s.score)
                from public.startups s where s.owner_id = p.id)
  ) into v
  from public.profiles p join auth.users u on u.id = p.id
  where p.id = p_id;
  if v is null then raise exception 'Foydalanuvchi topilmadi'; end if;
  return v;
end $function$;

revoke all on function public.admin_user_detail(uuid) from public, anon;
grant execute on function public.admin_user_detail(uuid) to authenticated;

-- Bloklash: kirish yopiladi, joriy sessiyalar o'chadi, startapi katalogdan yashiriladi.
-- Blokdan chiqarish startapni avtomatik qaytarmaydi: admin ko'rib chiqib o'zi ochadi.
create or replace function public.admin_set_blocked(p_id uuid, p_blocked boolean)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare v_email text; v_target text;
begin
  perform private.admin_guard();
  if p_id = auth.uid() then raise exception 'O''zingizni bloklab bo''lmaydi'; end if;
  if exists (select 1 from private.admin_ids where user_id = p_id) then raise exception 'Adminni bloklab bo''lmaydi'; end if;
  select email into v_target from auth.users where id = p_id;
  if not found then raise exception 'Foydalanuvchi topilmadi'; end if;

  update auth.users set banned_until = case when p_blocked then 'infinity'::timestamptz else null end where id = p_id;
  if p_blocked then
    delete from auth.sessions where user_id = p_id;
    update public.startups set hidden = true, updated_at = now() where owner_id = p_id;
  end if;

  select email into v_email from auth.users where id = auth.uid();
  insert into public.admin_actions (admin_id, admin_email, action, target, detail)
  values (auth.uid(), v_email, case when p_blocked then 'user_block' else 'user_unblock' end, v_target, jsonb_build_object('id', p_id));
end $function$;

revoke all on function public.admin_set_blocked(uuid, boolean) from public, anon;
grant execute on function public.admin_set_blocked(uuid, boolean) to authenticated;

-- Yangi ro'yxatdan o'tish: Telegram xabari. Xato ro'yxatdan o'tishga xalaqit bermasligi kerak.
create or replace function private.signup_notify()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
begin
  if new.is_demo then return null; end if;
  begin
    perform private.tg_send('🎉 Yangi foydalanuvchi: ' || coalesce(nullif(new.full_name, ''), 'Ismsiz')
      || ' (' || case new.role when 'startup' then 'startap' else 'investor' end || ')');
  exception when others then null;
  end;
  return null;
end $function$;

drop trigger if exists profiles_signup_notify on public.profiles;
create trigger profiles_signup_notify after insert on public.profiles
  for each row execute function private.signup_notify();
