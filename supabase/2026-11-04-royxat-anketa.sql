-- Ro'yxatdan o'tishda majburiy anketa: hudud, pochta indeksi va rolga qarab qisqa savollar.
-- Endi har bir YANGI hisob (email bilan ham, Google bilan ham) kabinetdan oldin /xush-kelibsiz sahifasida
-- anketani to'ldiradi. Eski hisoblarga tegilmaydi (onboarded = true bo'lib qoladi).
-- Qayta ishga tushirish xavfsiz.

alter table public.profiles add column if not exists region text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists anketa jsonb;

-- Yangi foydalanuvchi: profil yaratiladi, lekin anketa to'ldirilmaguncha onboarded = false
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, role, full_name, email, onboarded)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' = 'startup' then 'startup' else 'investor' end,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    false
  );
  return new;
end $function$;

-- Hudud kodi va indeksning birinchi ikki raqami (lib/onboarding.js dagi REGIONS bilan bir xil)
create or replace function private.postal_ok(p_region text, p_postal text)
returns boolean
language sql immutable
set search_path to ''
as $function$
  select case
    when p_region = 'chet' then p_postal ~ '^[A-Z0-9][A-Z0-9 -]{1,8}[A-Z0-9]$'
    when p_postal !~ '^\d{6}$' then false
    else left(p_postal, 2) = any (case p_region
      when 'toshkent_sh' then array['10','11'] when 'toshkent_v' then array['10','11']
      when 'sirdaryo' then array['12'] when 'jizzax' then array['13'] when 'samarqand' then array['14']
      when 'fargona' then array['15'] when 'namangan' then array['16'] when 'andijon' then array['17']
      when 'qashqadaryo' then array['18'] when 'surxondaryo' then array['19'] when 'buxoro' then array['20']
      when 'navoiy' then array['21'] when 'xorazm' then array['22'] when 'qoraqalpogiston' then array['23']
      else array[]::text[] end)
  end
$function$;

-- Anketani saqlaydi va kabinetni ochadi. Faqat bir marta.
-- Email bilan ro'yxatdan o'tganlar rolni avval tanlagan: ularning roli o'zgarmaydi.
-- Google bilan kirganlar rolni shu yerda tanlaydi.
create or replace function public.finish_onboarding(p_role text, p_region text, p_postal text, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_google boolean;
  v_postal text := upper(btrim(coalesce(p_postal, '')));
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if p_role not in ('startup', 'investor') then raise exception 'Noto''g''ri rol'; end if;
  if not private.postal_ok(p_region, v_postal) then raise exception 'Pochta indeksi hududga mos emas'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or octet_length(p_answers::text) > 2000 then
    raise exception 'Anketa noto''g''ri';
  end if;
  select coalesce(raw_app_meta_data->>'provider', 'email') <> 'email' into v_google from auth.users where id = auth.uid();
  update public.profiles
     set role = case when v_google then p_role else role end,
         region = p_region, postal_code = v_postal, anketa = p_answers, onboarded = true
   where id = auth.uid() and not onboarded;
end $function$;

revoke all on function public.finish_onboarding(text, text, text, jsonb) from public, anon;
grant execute on function public.finish_onboarding(text, text, text, jsonb) to authenticated;

-- Eski (faqat rol tanlaydigan) variant: anketani chetlab o'tishga yo'l qoldirmaslik uchun o'chiriladi
drop function if exists public.finish_onboarding(text);

-- Admin: foydalanuvchining anketasi (foydalanuvchi sahifasida ko'rsatiladi)
create or replace function public.admin_user_anketa(p_id uuid)
returns jsonb
language plpgsql
stable security definer
set search_path to ''
as $function$
declare v jsonb;
begin
  perform private.admin_guard();
  select jsonb_build_object('role', p.role, 'region', p.region, 'postal_code', p.postal_code, 'anketa', p.anketa, 'onboarded', p.onboarded)
    into v from public.profiles p where p.id = p_id;
  return v;
end $function$;

revoke all on function public.admin_user_anketa(uuid) from public, anon;
grant execute on function public.admin_user_anketa(uuid) to authenticated;
