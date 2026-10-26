-- 2026-10-26: xavfsizlik va tezlik paketi (tekshiruv ro'yxatidagi 3, 4, 5, 7, 8, 9-bandlar).
-- 2-band (tg_webhook) alohida faylda: 2026-10-26-tg-webhook-yopish.sql, Edge Function yangilangandan KEYIN.
-- Tartib: avval shu SQL, keyin darhol kod deploy (yordam formasi endi submit_feedback orqali yozadi).

begin;

-- ============ Umumiy: so'rov tezligini cheklash ============
-- Forma va so'rovnoma Next.js server action orqali yuboriladi, shuning uchun baza foydalanuvchi IP manzilini
-- x-client-ip sarlavhasidan oladi (lib/supabase/server.js qo'yadi; Vercel x-forwarded-for ni soxtalashtirib bo'lmaydi).
-- To'g'ridan-to'g'ri API'ga yozgan bot bu sarlavhani soxtalashtirishi mumkin, shuning uchun har bir joyda umumiy chegara ham bor.
create or replace function private.client_ip()
returns text language sql stable set search_path = '' as $$
  select nullif(btrim(split_part(coalesce(h ->> 'x-client-ip', h ->> 'x-forwarded-for', ''), ',', 1)), '')
  from (select nullif(current_setting('request.headers', true), '')::json as h) x
$$;

create table if not exists private.rate_hits (
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_hits_key_at_idx on private.rate_hits (key, at);

-- Kalit bo'yicha oyna ichida p_limit tadan kam urinish bo'lsa, urinishni yozib true qaytaradi
create or replace function private.rate_ok(p_key text, p_limit int, p_window interval)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from private.rate_hits where key = p_key and at > now() - p_window) >= p_limit then
    return false;
  end if;
  insert into private.rate_hits (key) values (p_key);
  -- Eski yozuvlarni vaqti-vaqti bilan tozalaymiz (taxminan har 50-chi chaqiruvda)
  if random() < 0.02 then delete from private.rate_hits where at < now() - interval '2 days'; end if;
  return true;
end $$;
revoke all on function private.rate_ok(text, int, interval) from public, anon, authenticated;
revoke all on function private.client_ip() from public, anon, authenticated;

-- ============ 3. Fikr-mulohaza formasi ============
-- Endi jadvalga to'g'ridan-to'g'ri yozib bo'lmaydi, faqat cheklovli funksiya orqali.
create or replace function public.submit_feedback(p_kind text, p_name text, p_email text, p_message text, p_page text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_who text;
begin
  if p_kind not in ('feedback', 'support', 'bug') then raise exception 'noto''g''ri tur'; end if;
  if char_length(btrim(coalesce(p_message, ''))) < 5 or char_length(p_message) > 4000 then raise exception 'noto''g''ri xabar'; end if;
  v_who := coalesce('u:' || v_uid::text, 'ip:' || coalesce(private.client_ip(), '?'));
  if not private.rate_ok('fb:' || v_who, 5, interval '1 hour')
     or not private.rate_ok('fb-day:' || v_who, 20, interval '1 day')
     or (v_uid is null and not private.rate_ok('fb:anon', 60, interval '1 hour')) then
    raise exception 'juda ko''p murojaat';
  end if;
  insert into public.feedback (user_id, kind, name, email, message, page)
  values (v_uid, p_kind, left(coalesce(p_name, ''), 120), left(coalesce(p_email, ''), 200), p_message, left(coalesce(p_page, ''), 300));
end $$;
revoke all on function public.submit_feedback(text, text, text, text, text) from public;
grant execute on function public.submit_feedback(text, text, text, text, text) to anon, authenticated;

drop policy if exists feedback_insert on public.feedback;
revoke insert, update, delete, truncate on public.feedback from anon, authenticated;

-- Spam bo'lsa ham admin Telegram'iga soatiga 20 tadan ortiq xabar bormaydi (murojaatlar baribir saqlanadi)
create or replace function private.feedback_notify()
returns trigger language plpgsql security definer set search_path = 'public', 'extensions' as $$
declare cid text; txt text; kind_label text;
begin
  if not private.rate_ok('fb:tg', 20, interval '1 hour') then return new; end if;
  select value into cid from private.settings where key = 'telegram_chat_id';
  if cid is null then
    begin cid := private.tg_link(); exception when others then cid := null; end;
  end if;
  if cid is null then return new; end if;
  kind_label := case new.kind when 'support' then '🆘 Yordam kerak' when 'bug' then '🐞 Xatolik' else '💡 Fikr va taklif' end;
  txt := kind_label || E'\n\n'
      || '👤 ' || coalesce(nullif(new.name, ''), 'Ism yozilmagan') || E'\n'
      || '✉️ ' || coalesce(nullif(new.email, ''), 'Email yozilmagan') || E'\n'
      || case when new.user_id is null then '🔓 Mehmon' else '🔑 Ro''yxatdan o''tgan foydalanuvchi' end || E'\n\n'
      || left(new.message, 3500) || E'\n\n'
      || '🕒 ' || to_char(new.created_at at time zone 'Asia/Tashkent', 'DD.MM.YYYY HH24:MI');
  perform net.http_post(
    url := 'https://api.telegram.org/bot' || private.tg_token() || '/sendMessage',
    body := jsonb_build_object('chat_id', cid, 'text', txt, 'disable_web_page_preview', true),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
exception when others then
  return new; -- Telegram ishlamasa ham murojaat saqlanadi
end $$;

-- ============ 4. So'rovnoma ============
-- Bitta manzildan kuniga 3 ta javob. Umumiy chegara (soatiga 300) zaxira sifatida qoladi.
create or replace function public.submit_survey(p_kind text, p_answers jsonb)
returns void language plpgsql security definer set search_path = 'public' as $$
begin
  if p_kind not in ('startup', 'investor') then raise exception 'noto''g''ri tur'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then raise exception 'noto''g''ri javob'; end if;
  if octet_length(p_answers::text) > 12000 then raise exception 'javob juda katta'; end if;
  if coalesce(p_answers->>'consent', '') <> 'true' then raise exception 'rozilik kerak'; end if;
  if not private.rate_ok('sv:' || coalesce('u:' || auth.uid()::text, 'ip:' || coalesce(private.client_ip(), '?')), 3, interval '1 day') then
    raise exception 'juda ko''p so''rov, keyinroq urinib ko''ring';
  end if;
  if (select count(*) from public.survey_responses where created_at > now() - interval '1 hour') >= 300 then
    raise exception 'juda ko''p so''rov, keyinroq urinib ko''ring';
  end if;
  insert into public.survey_responses (kind, answers) values (p_kind, p_answers);
end $$;

-- ============ 5. Keraksiz ochiq funksiya ============
-- startup_doc_count saytda ishlatilmaydi
revoke execute on function public.startup_doc_count(uuid) from public, anon;

-- Qo'shimcha (mening auditimdan): xabar yuborishda vaqt va "o'qilgan" belgisini mijoz o'zi qo'ya olmasin
revoke insert, update, delete, truncate on public.messages from authenticated;
grant insert (request_id, sender_id, body) on public.messages to authenticated;

-- ============ 7. Siyosatsiz jadvallarga izoh ============
comment on table public.admin_actions    is 'RLS yoqilgan, siyosat ATAYLAB yo''q: faqat security definer funksiyalar (admin_*) orqali. Siyosat qo''shmang.';
comment on table public.agent_proposals  is 'RLS yoqilgan, siyosat ATAYLAB yo''q: faqat admin_agent_* funksiyalari orqali. Siyosat qo''shmang.';
comment on table public.bot_usage        is 'RLS yoqilgan, siyosat ATAYLAB yo''q: faqat bot_take funksiyasi orqali. Siyosat qo''shmang.';
comment on table public.survey_responses is 'RLS yoqilgan, siyosat ATAYLAB yo''q: yozish submit_survey, o''qish admin_survey_list orqali. Siyosat qo''shmang.';

-- ============ 8. auth.uid() har qator uchun qayta hisoblanmasin ============
alter policy profiles_select on public.profiles using ((id = (select auth.uid())) or private.requested_my_startup(id));
alter policy profiles_update on public.profiles using (id = (select auth.uid()));
alter policy startups_insert on public.startups with check ((owner_id = (select auth.uid())) and (private.my_role() = 'startup'));
alter policy startups_update on public.startups using (owner_id = (select auth.uid()));
alter policy requests_select on public.access_requests using ((investor_id = (select auth.uid())) or private.owns_startup(startup_id));
alter policy messages_insert on public.messages with check ((sender_id = (select auth.uid())) and private.chat_open(request_id));

-- ============ 9. Foreign key indekslari ============
create index if not exists tg_codes_user_id_idx           on private.tg_codes (user_id);
create index if not exists agent_proposals_decided_by_idx on public.agent_proposals (decided_by);
create index if not exists feedback_user_id_idx           on public.feedback (user_id);
create index if not exists messages_sender_id_idx         on public.messages (sender_id);
create index if not exists saved_startups_startup_id_idx  on public.saved_startups (startup_id);

commit;
