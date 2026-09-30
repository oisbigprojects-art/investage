-- =====================================================================
-- Investage — kirish so'rovi (access request) va rollar sxemasi
-- Supabase > SQL Editor ga to'liq nusxalab, bir marta "Run" bosing.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. PROFILLAR (har bir foydalanuvchi: startup yoki investor)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        text not null check (role in ('startup', 'investor')),
  full_name   text not null default '',
  email       text not null default '',
  created_at  timestamptz not null default now()
);

-- Ro'yxatdan o'tganda profil avtomatik yaratiladi (rol shu yerda qotadi)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' = 'startup' then 'startup' else 'investor' end,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. STARTAPLAR — OMMAVIY TEASER (hamma ko'radi)
-- ---------------------------------------------------------------------
create table if not exists public.startups (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null unique references public.profiles(id) on delete cascade,
  name        text not null,
  sector      text not null default '',
  short_desc  text not null default '',
  stage       text not null default 'goya' check (stage in ('goya', 'mvp', 'daromad')),
  score       int check (score between 0 and 100),       -- faqat Investage jamoasi o'zgartiradi
  verified    boolean not null default false,             -- faqat Investage jamoasi o'zgartiradi
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. STARTAPNING YOPIQ MA'LUMOTLARI (egasi + tasdiqlangan investor)
-- ---------------------------------------------------------------------
create table if not exists public.startup_private (
  startup_id        uuid primary key references public.startups(id) on delete cascade,
  funding_amount    numeric check (funding_amount >= 0),
  equity_percent    numeric check (equity_percent > 0 and equity_percent <= 100),
  team              text not null default '',
  contact_email     text not null default '',
  contact_phone     text not null default '',
  contact_telegram  text not null default '',
  -- Mirkomil belgilaydigan qo'shimcha maydonlar shu yerda saqlanadi
  extra             jsonb not null default '{}'::jsonb,
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. KIRISH SO'ROVLARI (har bir investor x startap juftligi uchun bitta qator)
-- ---------------------------------------------------------------------
create table if not exists public.access_requests (
  id           uuid primary key default gen_random_uuid(),
  startup_id   uuid not null references public.startups(id) on delete cascade,
  investor_id  uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected', 'revoked')),
  message      text not null default '',
  created_at   timestamptz not null default now(),
  decided_at   timestamptz,
  unique (startup_id, investor_id)
);

create index if not exists access_requests_investor_idx on public.access_requests (investor_id);
create index if not exists access_requests_startup_idx  on public.access_requests (startup_id);

-- ---------------------------------------------------------------------
-- 5. YORDAMCHI FUNKSIYALAR (RLS ichida ishlatiladi, API'dan yashirin)
-- ---------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function private.owns_startup(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.startups where id = sid and owner_id = auth.uid())
$$;

create or replace function private.has_access(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.access_requests
    where startup_id = sid and investor_id = auth.uid() and status = 'approved'
  )
$$;

-- Investor mening startapimga so'rov yuborganmi? (startap uning ismini ko'rishi uchun)
create or replace function private.requested_my_startup(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.access_requests r
    join public.startups s on s.id = r.startup_id
    where r.investor_id = pid and s.owner_id = auth.uid()
  )
$$;

-- ---------------------------------------------------------------------
-- 6. RLS (Row Level Security) — ruxsatlar bazaning o'zida
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.startups        enable row level security;
alter table public.startup_private enable row level security;
alter table public.access_requests enable row level security;

-- PROFILES: o'zingiznikini, yoki sizga so'rov yuborgan investornikini ko'rasiz
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or private.requested_my_startup(id));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid());

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;   -- rolni o'zgartirib bo'lmaydi

-- STARTUPS (teaser): hamma o'qiydi, faqat egasi yozadi
drop policy if exists startups_select on public.startups;
create policy startups_select on public.startups for select to anon, authenticated
  using (true);

drop policy if exists startups_insert on public.startups;
create policy startups_insert on public.startups for insert to authenticated
  with check (owner_id = auth.uid() and private.my_role() = 'startup');

drop policy if exists startups_update on public.startups;
create policy startups_update on public.startups for update to authenticated
  using (owner_id = auth.uid());

-- score va verified ni startap o'zi o'zgartira olmaydi
revoke insert, update, delete on public.startups from anon, authenticated;
grant insert (owner_id, name, sector, short_desc, stage) on public.startups to authenticated;
grant update (name, sector, short_desc, stage, updated_at) on public.startups to authenticated;

-- STARTUP_PRIVATE: faqat egasi yoki TASDIQLANGAN investor o'qiydi
drop policy if exists private_select on public.startup_private;
create policy private_select on public.startup_private for select to authenticated
  using (private.owns_startup(startup_id) or private.has_access(startup_id));

drop policy if exists private_insert on public.startup_private;
create policy private_insert on public.startup_private for insert to authenticated
  with check (private.owns_startup(startup_id));

drop policy if exists private_update on public.startup_private;
create policy private_update on public.startup_private for update to authenticated
  using (private.owns_startup(startup_id));

revoke all on public.startup_private from anon;

-- ACCESS_REQUESTS: investor o'z so'rovlarini, startap o'ziga kelganlarini ko'radi.
-- To'g'ridan-to'g'ri yozish taqiqlangan — faqat quyidagi funksiyalar orqali.
drop policy if exists requests_select on public.access_requests;
create policy requests_select on public.access_requests for select to authenticated
  using (investor_id = auth.uid() or private.owns_startup(startup_id));

revoke insert, update, delete on public.access_requests from anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. SO'ROV JARAYONI FUNKSIYALARI
-- ---------------------------------------------------------------------

-- Investor so'rov yuboradi. Rad etilgan yoki bekor qilingan bo'lsa — qayta yuborishi mumkin.
create or replace function public.request_access(p_startup uuid, p_message text default '')
returns text language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if coalesce(private.my_role(), '') <> 'investor' then raise exception 'Faqat investorlar so''rov yubora oladi'; end if;
  if not exists (select 1 from public.startups where id = p_startup) then
    raise exception 'Startap topilmadi';
  end if;

  insert into public.access_requests (startup_id, investor_id, status, message)
  values (p_startup, auth.uid(), 'pending', left(coalesce(p_message, ''), 1000))
  on conflict (startup_id, investor_id) do update
    set status = 'pending', message = excluded.message, created_at = now(), decided_at = null
    where public.access_requests.status in ('rejected', 'revoked');

  select status into v_status from public.access_requests
  where startup_id = p_startup and investor_id = auth.uid();
  return v_status;
end $$;

-- Startap kutilayotgan so'rovni tasdiqlaydi yoki rad etadi
create or replace function public.decide_request(p_request uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.access_requests
     set status = case when p_approve then 'approved' else 'rejected' end,
         decided_at = now()
   where id = p_request and status = 'pending' and private.owns_startup(startup_id);
  if not found then raise exception 'So''rov topilmadi yoki allaqachon ko''rib chiqilgan'; end if;
end $$;

-- Startap berilgan ruxsatni istalgan paytda yopadi
create or replace function public.revoke_access(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.access_requests
     set status = 'revoked', decided_at = now()
   where id = p_request and status = 'approved' and private.owns_startup(startup_id);
  if not found then raise exception 'Faol ruxsat topilmadi'; end if;
end $$;

revoke execute on function public.request_access(uuid, text)   from public, anon;
revoke execute on function public.decide_request(uuid, boolean) from public, anon;
revoke execute on function public.revoke_access(uuid)           from public, anon;
grant  execute on function public.request_access(uuid, text)   to authenticated;
grant  execute on function public.decide_request(uuid, boolean) to authenticated;
grant  execute on function public.revoke_access(uuid)           to authenticated;

-- Trigger funksiyasini API orqali chaqirib bo'lmasin
revoke execute on function public.handle_new_user() from public, anon, authenticated;


-- =====================================================================
-- 8. KABINET FUNKSIYALARI (logotip, yashirish, investor profili, saqlanganlar, qaytarib olish)
-- Bu qism allaqachon "cabinet_features" migratsiyasi sifatida bazaga qo'llangan.
-- =====================================================================
alter table public.startups
  add column if not exists logo_url text,
  add column if not exists hidden boolean not null default false;

alter table public.startups drop constraint if exists startups_logo_url_check;
alter table public.startups add constraint startups_logo_url_check
  check (logo_url is null or logo_url like 'https://fuklumjbymmkaflzndxp.supabase.co/storage/v1/object/public/logos/%');

alter table public.profiles
  add column if not exists company   text not null default '',
  add column if not exists interests text not null default '',
  add column if not exists bio       text not null default '';

alter table public.profiles drop constraint if exists profiles_len_check;
alter table public.profiles add constraint profiles_len_check
  check (char_length(company) <= 120 and char_length(interests) <= 200 and char_length(bio) <= 600);

grant update (full_name, company, interests, bio) on public.profiles to authenticated;
grant insert (logo_url) on public.startups to authenticated;
grant update (logo_url, hidden) on public.startups to authenticated;

-- Yashirilgan startap: faqat egasiga ko'rinadi, yopiq ma'lumot ham yopiladi
drop policy if exists startups_select on public.startups;
create policy startups_select on public.startups for select to anon, authenticated
  using (hidden = false or owner_id = (select auth.uid()));

create or replace function private.has_access(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.access_requests r
    join public.startups s on s.id = r.startup_id
    where r.startup_id = sid and r.investor_id = auth.uid() and r.status = 'approved' and s.hidden = false
  )
$$;

create or replace function public.request_access(p_startup uuid, p_message text default '')
returns text language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if coalesce(private.my_role(), '') <> 'investor' then raise exception 'Faqat investorlar so''rov yubora oladi'; end if;
  if not exists (select 1 from public.startups where id = p_startup and hidden = false) then
    raise exception 'Startap topilmadi';
  end if;

  insert into public.access_requests (startup_id, investor_id, status, message)
  values (p_startup, auth.uid(), 'pending', left(coalesce(p_message, ''), 1000))
  on conflict (startup_id, investor_id) do update
    set status = 'pending', message = excluded.message, created_at = now(), decided_at = null
    where public.access_requests.status in ('rejected', 'revoked');

  select status into v_status from public.access_requests
  where startup_id = p_startup and investor_id = auth.uid();
  return v_status;
end $$;

-- Investor javob kelmagan so'rovini qaytarib oladi
create or replace function public.withdraw_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.access_requests
   where id = p_request and investor_id = auth.uid() and status = 'pending';
  if not found then raise exception 'Kutilayotgan so''rov topilmadi'; end if;
end $$;

revoke execute on function public.withdraw_request(uuid) from public, anon;
grant  execute on function public.withdraw_request(uuid) to authenticated;

-- Saqlangan startaplar
create table if not exists public.saved_startups (
  investor_id uuid not null references public.profiles(id) on delete cascade,
  startup_id  uuid not null references public.startups(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (investor_id, startup_id)
);
alter table public.saved_startups enable row level security;

drop policy if exists saved_select on public.saved_startups;
create policy saved_select on public.saved_startups for select to authenticated
  using (investor_id = (select auth.uid()));
drop policy if exists saved_insert on public.saved_startups;
create policy saved_insert on public.saved_startups for insert to authenticated
  with check (investor_id = (select auth.uid()) and private.my_role() = 'investor');
drop policy if exists saved_delete on public.saved_startups;
create policy saved_delete on public.saved_startups for delete to authenticated
  using (investor_id = (select auth.uid()));

revoke all on public.saved_startups from anon;
revoke update on public.saved_startups from authenticated;

-- Logotiplar uchun ochiq bucket (1 MB, faqat rasm)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

drop policy if exists logos_insert on storage.objects;
create policy logos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text and private.my_role() = 'startup');
drop policy if exists logos_select on storage.objects;
create policy logos_select on storage.objects for select to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists logos_delete on storage.objects;
create policy logos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Bildirishnomalar: foydalanuvchi ularni oxirgi marta qachon ko'rgani (migratsiya "notifications_seen_at")
alter table public.profiles add column if not exists notifications_seen_at timestamptz not null default now();
grant update (notifications_seen_at) on public.profiles to authenticated;


-- =====================================================================
-- 9. Bosh sahifa ko'rsatkichlari (faqat yig'ma sonlar, hamma o'qiy oladi)
-- =====================================================================
create or replace function public.platform_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'startups',  (select count(*) from public.startups where hidden = false),
    'verified',  (select count(*) from public.startups where hidden = false and verified = true),
    'investors', (select count(*) from public.profiles where role = 'investor'),
    'approved',  (select count(*) from public.access_requests where status = 'approved')
  );
$$;
revoke all on function public.platform_stats() from public;
grant execute on function public.platform_stats() to anon, authenticated;

-- 10. Fikr/yordam, investorlar katalogi, namuna belgilari (migratsiya "feedback_investor_directory_demo_flags")
-- profiles: city, public_profile, is_demo; startups: is_demo, logo_url endi '/demo-logos/%' ham bo'lishi mumkin;
-- jadval feedback (RLS: hamma yozadi, faqat o'zinikini o'qiydi); funksiya investor_directory() (faqat kirganlarga).
-- Namuna ma'lumotlar: supabase/demo-seed.sql
-- 11. Namuna startapga yuborilgan so'rov avtomatik tasdiqlanadi: trigger access_requests_demo_auto -> private.demo_auto_approve()
-- 12. Yangi murojaat (feedback) Telegram'ga: trigger feedback_telegram -> private.feedback_notify() (pg_net).
-- Bot: @Investagee_bot. Token Vault'da ('telegram_bot_token'), qabul qiluvchi private.settings ('telegram_username', 'telegram_chat_id').
-- Qabul qiluvchi botga /start bosishi kerak; chat id private.tg_link() bilan avtomatik topiladi.
