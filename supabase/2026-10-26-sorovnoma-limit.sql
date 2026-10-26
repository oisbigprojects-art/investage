-- 2026-10-26: so'rovnomada bitta manzildan kunlik chegara 3 dan 15 ga ko'tarildi.
-- Sabab: O'zbekistonda mobil operatorlar (CGNAT) bitta IP ni ko'p abonentga beradi, tadbir yoki ofisda ham
-- hamma bir tarmoqdan to'ldiradi. 3 ta bo'lsa, haqiqiy respondentlar to'silib qolardi.
-- Umumiy chegara (soatiga 300) o'zgarmaydi.

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
