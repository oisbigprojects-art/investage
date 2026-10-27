-- 2026-10-27: sayt demo rejimidan chiqarildi. Demo ma'lumotlar O'CHIRILMAYDI, faqat yashiriladi.
-- Sabab: haqiqiy foydalanuvchilar demo investor va startaplarni haqiqiy deb o'ylab, ularga taklif va xabar yuborgan.
-- Mavjud yozishmalar saqlanadi. Butunlay o'chirish kerak bo'lsa: 2026-10-27-demo-ochirish.sql.
--
-- Qaytarish (kerak bo'lsa):
--   update public.startups set admin_hidden = false, hidden = false where is_demo;
--   update public.profiles set public_profile = true where is_demo and role = 'investor';
--   va pastdagi ikki triggerni supabase/live-schema.sql dagi ta'rifdan qayta yaratish.

begin;

-- Demo startaplar katalog, bosh sahifa va sitemap'dan yo'qoladi; admin_hidden bo'lgani uchun qayta ochilmaydi
update public.startups set admin_hidden = true, hidden = true where is_demo;

-- Demo investorlar investorlar ro'yxatida ko'rinmaydi
update public.profiles set public_profile = false, public_contacts = false where is_demo;

-- Demo rejimi: so'rovni avtomatik tasdiqlash va chatga avtomatik javob endi ishlamaydi (funksiyalar qaytarish uchun qoladi)
drop trigger if exists access_requests_demo_auto on public.access_requests;
drop trigger if exists messages_demo_reply on public.messages;

-- Startap demo investorga taklif yubora olmaydi
create or replace function public.offer_to_investor(p_investor uuid, p_message text default '')
returns uuid language plpgsql security definer set search_path = 'public' as $$
declare v_sid uuid; v_status text; v_today int; v_id uuid; v_msg text := btrim(left(coalesce(p_message, ''), 1000));
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if coalesce(private.my_role(), '') <> 'startup' then raise exception 'Faqat startaplar taklif yubora oladi'; end if;
  select id into v_sid from public.startups where owner_id = auth.uid() and listed;
  if v_sid is null then raise exception 'Avval startap profilini to''ldiring'; end if;
  if not exists (select 1 from public.profiles where id = p_investor and role = 'investor' and not is_demo) then raise exception 'Investor topilmadi'; end if;
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

-- Bosh sahifa raqamlari faqat haqiqiy foydalanuvchilarni sanaydi
create or replace function public.platform_stats()
returns json language sql stable security definer set search_path = 'public' as $$
  select json_build_object(
    'startups',  (select count(*) from public.startups where hidden = false and listed and not is_demo),
    'verified',  (select count(*) from public.startups where hidden = false and listed and verified and not is_demo),
    'investors', (select count(*) from public.profiles where role = 'investor' and not is_demo),
    'approved',  (select count(*) from public.access_requests r join public.startups s on s.id = r.startup_id
                   join public.profiles p on p.id = r.investor_id where r.status = 'approved' and not s.is_demo and not p.is_demo)
  );
$$;

-- Murojaat formasi: mehmon uchun bitta IP dan chegara yumshatildi (mobil operatorlar bitta IP ni ko'p abonentga beradi)
create or replace function public.submit_feedback(p_kind text, p_name text, p_email text, p_message text, p_page text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_who text;
begin
  if p_kind not in ('feedback', 'support', 'bug') then raise exception 'noto''g''ri tur'; end if;
  if char_length(btrim(coalesce(p_message, ''))) < 5 or char_length(p_message) > 4000 then raise exception 'noto''g''ri xabar'; end if;
  v_who := coalesce('u:' || v_uid::text, 'ip:' || coalesce(private.client_ip(), '?'));
  if not private.rate_ok('fb:' || v_who, case when v_uid is null then 15 else 5 end, interval '1 hour')
     or not private.rate_ok('fb-day:' || v_who, case when v_uid is null then 60 else 20 end, interval '1 day')
     or (v_uid is null and not private.rate_ok('fb:anon', 60, interval '1 hour')) then
    raise exception 'juda ko''p murojaat';
  end if;
  insert into public.feedback (user_id, kind, name, email, message, page)
  values (v_uid, p_kind, left(coalesce(p_name, ''), 120), left(coalesce(p_email, ''), 200), p_message, left(coalesce(p_page, ''), 300));
end $$;

commit;
