-- Investor maxfiyligi, 2-qism: startap taklif yuborishning o'zi bilan yopiq kontaktlar ochilmaydi.
-- Kontakt va yopiq profil faqat investor o'zi so'rov yuborgan yoki chatda javob yozgan bo'lsa ochiladi.

create or replace function public.investor_profile(p_id uuid)
returns table(id uuid, full_name text, company text, city text, interests text, bio text, is_demo boolean, investor_type text, check_min numeric, check_max numeric, stages text[], experience_years integer, portfolio text, website text, linkedin text, telegram text, email text, contacts_visible boolean, member_since timestamp with time zone, requests_total bigint, requests_approved bigint, last_active timestamp with time zone, requested_my_startup text, is_me boolean)
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  me uuid := auth.uid();
  rel text;
  engaged boolean;
  p public.profiles%rowtype;
  show_contacts boolean;
begin
  if me is null then return; end if;
  select * into p from public.profiles where profiles.id = p_id and role = 'investor';
  if not found then return; end if;
  select ar.status into rel from public.access_requests ar join public.startups s on s.id = ar.startup_id
    where ar.investor_id = p_id and s.owner_id = me order by ar.created_at desc limit 1;
  select exists (
    select 1 from public.access_requests ar join public.startups s on s.id = ar.startup_id
    where ar.investor_id = p_id and s.owner_id = me
      and (ar.initiated_by = 'investor'
           or exists (select 1 from public.messages m where m.request_id = ar.id and m.sender_id = p_id))
  ) into engaged;
  if not (p.id = me or p.public_profile or engaged) then return; end if;
  show_contacts := p.id = me or p.public_contacts or engaged;
  return query select p.id, p.full_name, p.company, p.city, p.interests, p.bio, p.is_demo,
    p.investor_type, p.check_min, p.check_max, p.stages, p.experience_years, p.portfolio,
    case when show_contacts then p.website else '' end,
    case when show_contacts then p.linkedin else '' end,
    case when show_contacts then p.telegram else '' end,
    case when show_contacts and not p.is_demo then p.email else '' end,
    show_contacts, p.created_at,
    (select count(*) from public.access_requests a where a.investor_id = p.id),
    (select count(*) from public.access_requests a where a.investor_id = p.id and a.status = 'approved'),
    (select max(a.created_at) from public.access_requests a where a.investor_id = p.id),
    rel, p.id = me;
end $function$;
