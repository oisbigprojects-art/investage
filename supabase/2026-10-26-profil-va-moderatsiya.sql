-- 2026-10-26: investor profili saqlanmasligi va admin yashirishini chetlab o'tish tuzatildi.
-- SQL Editor'da bir marta ishga tushiriladi. Qayta ishga tushirsa ham zarar qilmaydi.

begin;

-- ============ 1. Investor profili ============
-- Profil formasi bu maydonlarni ham yuboradi, lekin ularga ruxsat berilmagan edi:
-- baza butun saqlashni "permission denied" bilan rad etardi. Qiymatlar profiles_investor_details_check bilan tekshiriladi.
-- role va is_demo ataylab ro'yxatda yo'q.
grant update (city, public_profile, investor_type, check_min, check_max, stages, experience_years,
              portfolio, website, linkedin, telegram, public_contacts)
  on public.profiles to authenticated;

-- ============ 2. Admin yashirishi ============
-- hidden ni startap egasi ham o'zgartira oladi ("katalogdan yashirish"), shuning uchun admin yashirgan
-- startapni egasi qayta ocha olardi. Endi admin qarori alohida ustunda turadi va egasiga yozish ruxsati berilmaydi.
alter table public.startups add column if not exists admin_hidden boolean not null default false;

-- Admin yashirgan startap egasi nima qilsa ham yashirin qoladi
create or replace function private.keep_admin_hidden()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.admin_hidden then new.hidden := true; end if;
  return new;
end $$;

drop trigger if exists startups_keep_admin_hidden on public.startups;
create trigger startups_keep_admin_hidden before update on public.startups
  for each row execute function private.keep_admin_hidden();

-- Hozir yashirin turgan startaplardan oxirgi marta admin yashirganlarini belgilaymiz (jurnal bo'yicha)
update public.startups s set admin_hidden = true
 where s.hidden
   and (select (a.detail -> 'hidden' ->> 1)::boolean
          from public.admin_actions a
         where a.action = 'startup_update' and a.detail ->> 'id' = s.id::text
           and (a.detail -> 'hidden' ->> 0) is distinct from (a.detail -> 'hidden' ->> 1)
         order by a.created_at desc limit 1) is true;

-- Admin "yashirish" endi admin_hidden ni boshqaradi. Admin ochganda faqat o'zi yashirgan bo'lsa ochiladi:
-- egasi o'zi yashirgan startapni admin ochib yubormaydi.
create or replace function public.admin_set_startup(p_id uuid, p_verified boolean default null, p_hidden boolean default null, p_score integer default null)
returns void language plpgsql security definer set search_path = '' as $$
declare old public.startups%rowtype; v_email text;
begin
  perform private.admin_guard();
  if p_score is not null and (p_score < 0 or p_score > 100) then raise exception 'Ball 0 dan 100 gacha bo''lishi kerak'; end if;
  select * into old from public.startups where id = p_id;
  if not found then raise exception 'Startap topilmadi'; end if;
  update public.startups set
    verified     = coalesce(p_verified, verified),
    admin_hidden = coalesce(p_hidden, admin_hidden),
    hidden       = case when p_hidden then true when p_hidden = false and admin_hidden then false else hidden end,
    score        = coalesce(p_score, score),
    updated_at   = now()
  where id = p_id;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.admin_actions (admin_id, admin_email, action, target, detail)
  values (auth.uid(), v_email, 'startup_update', old.name,
          jsonb_build_object('id', p_id,
            'verified', jsonb_build_array(old.verified,     coalesce(p_verified, old.verified)),
            'hidden',   jsonb_build_array(old.admin_hidden, coalesce(p_hidden,   old.admin_hidden)),
            'score',    jsonb_build_array(old.score,        coalesce(p_score,    old.score))));
end $$;

-- Admin ro'yxati admin_hidden ni ham qaytaradi (qaytish turi o'zgargani uchun avval o'chiriladi)
drop function if exists public.admin_startups(text, text, integer, integer);
create function public.admin_startups(p_q text default '', p_filter text default '', p_limit integer default 25, p_offset integer default 0)
returns table(total bigint, id uuid, name text, sector text, stage text, score integer, verified boolean, hidden boolean, admin_hidden boolean,
              is_demo boolean, created_at timestamp with time zone, owner_name text, owner_email text, requests bigint)
language plpgsql stable security definer set search_path = '' as $$
declare q text := '%' || lower(btrim(coalesce(p_q, ''))) || '%';
begin
  perform private.admin_guard();
  return query
    select count(*) over (), s.id, s.name, s.sector, s.stage, s.score, s.verified, s.hidden, s.admin_hidden, s.is_demo, s.created_at,
           p.full_name, p.email, (select count(*) from public.access_requests ar where ar.startup_id = s.id)
    from public.startups s
    left join public.profiles p on p.id = s.owner_id
    where (btrim(coalesce(p_q, '')) = '' or lower(s.name) like q or lower(coalesce(s.sector, '')) like q or lower(coalesce(p.email, '')) like q or lower(coalesce(p.full_name, '')) like q)
      and case coalesce(p_filter, '')
            when 'verified'   then s.verified
            when 'unverified' then not s.verified and not s.is_demo
            when 'hidden'     then s.hidden
            when 'demo'       then s.is_demo
            when 'real'       then not s.is_demo
            else true end
    order by s.is_demo asc, s.created_at desc
    limit greatest(1, least(coalesce(p_limit, 25), 100)) offset greatest(0, coalesce(p_offset, 0));
end $$;
revoke all on function public.admin_startups(text, text, integer, integer) from public, anon;
grant execute on function public.admin_startups(text, text, integer, integer) to authenticated;

commit;
