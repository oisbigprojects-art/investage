-- Investage: admin agenti uchun baza.
-- Supabase -> SQL Editor -> shu faylni to'liq nusxalab Run qiling. Qayta ishga tushirish xavfsiz (idempotent).
--
-- Agent hech narsani o'zi o'zgartirmaydi: takliflarni yozadi, admin tasdiqlaydi yoki rad etadi.
-- Jadvalga to'g'ridan-to'g'ri hech kim kira olmaydi (RLS yoqilgan, siyosat yo'q).
-- Faqat admin_agent_* funksiyalar orqali kiriladi, ular har safar public.is_admin() ni tekshiradi.

create table if not exists public.agent_proposals (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('verify_startup','hide_startup','review_user','incomplete_profile','feedback_note')),
  target_type text not null check (target_type in ('startup','user','feedback')),
  target_id uuid not null,
  target_label text not null default '',
  severity text not null default 'low' check (severity in ('low','medium','high')),
  reason text not null,
  suggested jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','dismissed')),
  created_at timestamptz not null default now(),
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz
);

create index if not exists agent_proposals_status_idx on public.agent_proposals (status, created_at desc);

alter table public.agent_proposals enable row level security;
revoke all on public.agent_proposals from anon, authenticated;

-- Takliflar ro'yxati (p_status = '' bo'lsa hammasi)
create or replace function public.admin_agent_list(p_status text default 'pending', p_limit int default 50)
returns setof public.agent_proposals
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select * from public.agent_proposals
    where (coalesce(p_status, '') = '' or status = p_status)
    order by case severity when 'high' then 0 when 'medium' then 1 else 2 end, created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200);
end $$;

-- Yangi takliflar qo'shish. Bir xil (kind + target) bo'yicha kutilayotgan yoki
-- oxirgi 14 kunda rad etilgan taklif bo'lsa, qayta qo'shilmaydi.
create or replace function public.admin_agent_add(p_items jsonb)
returns int
language plpgsql security definer set search_path = public as $$
declare it jsonb; n int := 0;
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  for it in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    insert into public.agent_proposals (kind, target_type, target_id, target_label, severity, reason, suggested)
    select it->>'kind', it->>'target_type', (it->>'target_id')::uuid, left(coalesce(it->>'target_label', ''), 120),
           coalesce(it->>'severity', 'low'), left(it->>'reason', 600), coalesce(it->'suggested', '{}'::jsonb)
    where not exists (
      select 1 from public.agent_proposals p
      where p.kind = it->>'kind' and p.target_id = (it->>'target_id')::uuid
        and (p.status = 'pending' or (p.status = 'dismissed' and p.decided_at > now() - interval '14 days'))
    );
    if found then n := n + 1; end if;
  end loop;
  return n;
end $$;

-- Taklifni tasdiqlash yoki rad etish (amalning o'zi ilovada mavjud admin_set_startup orqali bajariladi va jurnalga yoziladi)
create or replace function public.admin_agent_decide(p_id uuid, p_decision text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  if p_decision not in ('approved', 'dismissed') then raise exception 'noto''g''ri qaror'; end if;
  update public.agent_proposals
    set status = p_decision, decided_by = auth.uid(), decided_at = now()
    where id = p_id and status = 'pending';
  if not found then raise exception 'taklif topilmadi yoki allaqachon ko''rilgan'; end if;
end $$;

revoke all on function public.admin_agent_list(text, int) from public, anon;
revoke all on function public.admin_agent_add(jsonb) from public, anon;
revoke all on function public.admin_agent_decide(uuid, text) from public, anon;
grant execute on function public.admin_agent_list(text, int) to authenticated;
grant execute on function public.admin_agent_add(jsonb) to authenticated;
grant execute on function public.admin_agent_decide(uuid, text) to authenticated;
