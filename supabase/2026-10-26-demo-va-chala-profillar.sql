-- 2026-10-26: demo startaplarda "Tasdiqlangan" belgisi yo'q; chala profillar katalogda ko'rinmaydi.

begin;

-- ============ A. Demo startap tasdiqlangan bo'la olmaydi ============
-- "Tasdiqlangan" = hujjatlari Investage tomonidan tekshirilgan. Demo startapda bu investorni chalg'itadi.
update public.startups set verified = false where is_demo and verified;
alter table public.startups drop constraint if exists startups_demo_not_verified;
alter table public.startups add constraint startups_demo_not_verified check (not (is_demo and verified));

-- ============ B. Katalogga faqat to'liq profillar ============
-- Minimal talab: soha, qisqa tavsif, kerakli mablag', ulush va kamida bitta kontakt.
-- listed ustunini faqat trigger yozadi (egasida yozish ruxsati yo'q).
alter table public.startups add column if not exists listed boolean not null default false;

create or replace function private.startups_set_listed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.listed := btrim(coalesce(new.sector, '')) <> '' and btrim(coalesce(new.short_desc, '')) <> ''
    and exists (select 1 from public.startup_private p
                 where p.startup_id = new.id and p.funding_amount is not null and p.equity_percent is not null
                   and btrim(coalesce(p.contact_email, '') || coalesce(p.contact_phone, '') || coalesce(p.contact_telegram, '')) <> '');
  return new;
end $$;

drop trigger if exists startups_set_listed on public.startups;
create trigger startups_set_listed before insert or update on public.startups
  for each row execute function private.startups_set_listed();

-- Yopiq qism o'zgarsa, startap qatori qayta hisoblanadi
create or replace function private.startup_private_sync_listed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.startups set listed = listed where id = coalesce(new.startup_id, old.startup_id);
  return null;
end $$;

drop trigger if exists startup_private_sync_listed on public.startup_private;
create trigger startup_private_sync_listed after insert or update or delete on public.startup_private
  for each row execute function private.startup_private_sync_listed();

-- Mavjud startaplar uchun hisoblash
update public.startups set listed = listed;

-- Investor o'zi so'rov yuborgan (yoki taklif olgan) startapni chala bo'lsa ham ko'rishda davom etadi.
-- Admin esa barcha startaplarni (yashirin va chalalarni ham) ochib ko'ra oladi: admin paneldagi havolalar 404 bermasin.
create or replace function private.has_request(sid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.access_requests where startup_id = sid and investor_id = auth.uid())
$$;

alter policy startups_select on public.startups
  using (((hidden = false) and (listed or private.has_request(id))) or (owner_id = (select auth.uid())));
-- Alohida siyosat: mehmonda (anon) is_admin ga ruxsat yo'q, bitta siyosatda bo'lsa katalog mehmonlar uchun sinardi
drop policy if exists startups_select_admin on public.startups;
create policy startups_select_admin on public.startups for select to authenticated using (private.is_admin());

-- Chala startapga yangi so'rov yuborib bo'lmaydi
create or replace function public.request_access(p_startup uuid, p_message text default '')
returns text language plpgsql security definer set search_path = 'public' as $$
declare v_status text;
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if coalesce(private.my_role(), '') <> 'investor' then raise exception 'Faqat investorlar so''rov yubora oladi'; end if;
  if not exists (select 1 from public.startups where id = p_startup and hidden = false and listed) then
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

-- Chala startap investorga taklif yubora olmaydi (avval profilni to'ldirishi kerak)
create or replace function public.offer_to_investor(p_investor uuid, p_message text default '')
returns uuid language plpgsql security definer set search_path = 'public' as $$
declare v_sid uuid; v_status text; v_today int; v_id uuid; v_msg text := btrim(left(coalesce(p_message, ''), 1000));
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if coalesce(private.my_role(), '') <> 'startup' then raise exception 'Faqat startaplar taklif yubora oladi'; end if;
  select id into v_sid from public.startups where owner_id = auth.uid() and listed;
  if v_sid is null then raise exception 'Avval startap profilini to''ldiring'; end if;
  if not exists (select 1 from public.profiles where id = p_investor and role = 'investor') then raise exception 'Investor topilmadi'; end if;
  select count(*) into v_today from public.access_requests
   where startup_id = v_sid and initiated_by = 'startup' and decided_at > now() - interval '1 day';
  if v_today >= 20 then raise exception 'Kunlik taklif chegarasi'; end if;
  select status into v_status from public.access_requests where startup_id = v_sid and investor_id = p_investor;
  if v_status = 'approved' then raise exception 'Bu investorda allaqachon ruxsat bor'; end if;

  insert into public.access_requests (startup_id, investor_id, status, message, initiated_by, created_at, decided_at)
  values (v_sid, p_investor, 'approved', v_msg, 'startup', now(), now())
  on conflict (startup_id, investor_id) do update set
    status = 'approved', decided_at = now(),
    initiated_by = case when public.access_requests.status = 'pending' then public.access_requests.initiated_by else 'startup' end,
    message = case when public.access_requests.status = 'pending' then public.access_requests.message else excluded.message end,
    created_at = case when public.access_requests.status = 'pending' then public.access_requests.created_at else now() end
  returning id into v_id;

  if v_msg <> '' then
    insert into public.messages (request_id, sender_id, body) values (v_id, auth.uid(), v_msg);
  end if;
  return v_id;
end $$;

-- Bosh sahifadagi raqamlar faqat katalogda ko'rinadiganlarni sanaydi
create or replace function public.platform_stats()
returns json language sql stable security definer set search_path = 'public' as $$
  select json_build_object(
    'startups',  (select count(*) from public.startups where hidden = false and listed),
    'verified',  (select count(*) from public.startups where hidden = false and listed and verified = true),
    'investors', (select count(*) from public.profiles where role = 'investor'),
    'approved',  (select count(*) from public.access_requests where status = 'approved')
  );
$$;

commit;
