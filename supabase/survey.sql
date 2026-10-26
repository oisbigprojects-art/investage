-- Investage: ommaviy so'rovnoma uchun baza (/sorovnoma). Qayta ishga tushirish xavfsiz.
--
-- DIQQAT: jonli bazada bular ALLAQACHON bor (2026-10-26 holati). Bu fayl yangi bazani noldan qurish uchun
-- va jonli bazadagi holatni ko'rsatadi. submit_survey endi private.rate_ok ga tayanadi, shuning uchun avval
-- 2026-10-26-xavfsizlik-va-tezlik.sql ishga tushirilgan bo'lishi kerak.
--
-- survey_responses jadvaliga hech kim to'g'ridan-to'g'ri kira olmaydi (RLS yoqilgan, siyosat ATAYLAB yo'q).
-- Javob yuborish: submit_survey (hamma chaqira oladi: ichida tekshiruv, bitta manzildan kuniga 15 ta
-- va hamma uchun soatiga 300 ta chegara). Natijalarni ko'rish: admin_survey_list (faqat admin).
-- Eslatma: O'zbekistonda mobil operatorlar bitta IP ni ko'p abonentga beradi, shuning uchun manzil chegarasi
-- (15) ataylab katta; tadbirda yoki ofisda bir tarmoqdan ko'pchilik to'ldirsa ham to'sib qo'ymasin.

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('startup','investor')),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists survey_responses_kind_idx on public.survey_responses (kind, created_at desc);

alter table public.survey_responses enable row level security;
revoke all on public.survey_responses from anon, authenticated;
comment on table public.survey_responses is 'RLS yoqilgan, siyosat ATAYLAB yo''q: yozish submit_survey, o''qish admin_survey_list orqali. Siyosat qo''shmang.';

create or replace function public.submit_survey(p_kind text, p_answers jsonb)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_kind not in ('startup', 'investor') then raise exception 'noto''g''ri tur'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then raise exception 'noto''g''ri javob'; end if;
  if octet_length(p_answers::text) > 12000 then raise exception 'javob juda katta'; end if;
  if coalesce(p_answers->>'consent', '') <> 'true' then raise exception 'rozilik kerak'; end if;
  if not private.rate_ok('sv:' || coalesce('u:' || auth.uid()::text, 'ip:' || coalesce(private.client_ip(), '?')), 15, interval '1 day') then
    raise exception 'juda ko''p so''rov, keyinroq urinib ko''ring';
  end if;
  if (select count(*) from public.survey_responses where created_at > now() - interval '1 hour') >= 300 then
    raise exception 'juda ko''p so''rov, keyinroq urinib ko''ring';
  end if;
  insert into public.survey_responses (kind, answers) values (p_kind, p_answers);
end $$;

create or replace function public.admin_survey_list(p_kind text default '', p_limit int default 500)
returns setof public.survey_responses
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select * from public.survey_responses
    where (coalesce(p_kind, '') = '' or kind = p_kind)
    order by created_at desc
    limit least(greatest(coalesce(p_limit, 500), 1), 1000);
end $$;

revoke all on function public.submit_survey(text, jsonb) from public;
revoke all on function public.admin_survey_list(text, int) from public, anon;
grant execute on function public.submit_survey(text, jsonb) to anon, authenticated;
grant execute on function public.admin_survey_list(text, int) to authenticated;
