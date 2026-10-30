-- Admin huquqi endi faqat ikki bosqichli kirish (aal2) bilan ishlaydi.
-- Parol o'g'irlansa ham, kodsiz sessiya bazada oddiy foydalanuvchi hisoblanadi.
--
-- Xavfsizlik: har bir adminda tasdiqlangan ilova bo'lmasa, migratsiya to'xtaydi.
-- Telefon yo'qolsa (SQL muharririda, admin user_id bilan):
--   delete from auth.mfa_factors where user_id = '<admin user_id>';

do $$
begin
  if exists (
    select 1 from private.admin_ids a
    where not exists (select 1 from auth.mfa_factors f where f.user_id = a.user_id and f.status = 'verified')
  ) then
    raise exception 'Ikki bosqichli kirish ulanmagan admin bor. Avval ilovani ulang.';
  end if;
end $$;

create or replace function private.is_admin()
returns boolean
language sql
stable security definer
set search_path to ''
as $function$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (select 1 from private.admin_ids where user_id = auth.uid());
$function$;
