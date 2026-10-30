-- Google bilan kirish: rol va shartlarga rozilik birinchi kirishda alohida sahifada so'raladi.
-- Google foydalanuvchi rolini bilmaydi, shuning uchun u jimgina "investor" bo'lib qolmasin.

alter table public.profiles add column if not exists onboarded boolean not null default true;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_email_signup boolean := coalesce(new.raw_app_meta_data->>'provider', 'email') = 'email';
begin
  insert into public.profiles (id, role, full_name, email, onboarded)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' = 'startup' then 'startup' else 'investor' end,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    v_email_signup
  );
  return new;
end $function$;

-- Faqat bir marta: rol tanlangach o'zgartirib bo'lmaydi
create or replace function public.finish_onboarding(p_role text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if p_role not in ('startup', 'investor') then raise exception 'Noto''g''ri rol'; end if;
  update public.profiles set role = p_role, onboarded = true where id = auth.uid() and not onboarded;
end $function$;

revoke all on function public.finish_onboarding(text) from public, anon;
grant execute on function public.finish_onboarding(text) to authenticated;
