-- AI agentlar: moderatsiya va yordam (2026-11-21).
--
-- MODERATSIYA. Yangi foydalanuvchi yoki startap (va ularning matni o'zgarsa) navbatga tushadi, baza saytga signal
-- beradi (pg_net), sayt Claude bilan tekshiradi va natijani agent_mod_done() orqali qaytaradi:
--   ok         — hech narsa qilinmaydi;
--   suspicious — admin uchun taklif (agent_proposals) va Telegram'ga ogohlantirish;
--   spam       — startap bo'lsa, katalogdan yashiriladi (admin_hidden; admin bir tugma bilan qaytaradi),
--                foydalanuvchi bo'lsa, faqat taklif va ogohlantirish. Bloklash va o'chirish hech qachon avtomatik emas.
-- Signal yo'qolsa, pg_cron har 10 daqiqada navbatni qayta yuboradi.
--
-- YORDAM. Saytdagi bot tayyor javob topa olmasa, server Claude'dan so'raydi (ai_bot_take — kunlik limit).
-- Telegram botga erkin savol yozilsa, savol private.tg_questions ga yoziladi va saytga signal ketadi;
-- javobni agent_tg_answer() botning o'zi orqali yuboradi. Chat ID bazadan chiqmaydi.
--
-- XAVFSIZLIK. Baza va sayt o'rtasidagi har chaqiruv Vault'dagi tasodifiy 'agent_secret' kaliti bilan tekshiriladi:
-- kalitni baza o'zi yaratadi va signal sarlavhasida yuboradi, sayt uni faqat shu funksiyalarga qaytaradi.
-- Modelga yopiq ma'lumot (summa, kontaktlar, yozishmalar, to'liq email) yuborilmaydi.

-- 1. Maxfiy kalit
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'agent_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'agent_secret', 'AI agentlar: baza va sayt orasidagi kalit');
  end if;
end $$;

create or replace function private.agent_secret()
returns text language sql stable security definer set search_path to ''
as $$ select decrypted_secret from vault.decrypted_secrets where name = 'agent_secret' limit 1 $$;

create or replace function private.agent_check(p_secret text)
returns void language plpgsql stable security definer set search_path to ''
as $$
begin
  if p_secret is null or length(p_secret) < 32 or p_secret is distinct from private.agent_secret() then
    raise exception 'ruxsat yo''q';
  end if;
end $$;

-- Saytga signal (javobi kutilmaydi)
create or replace function private.agent_call(p_path text, p_body jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path to 'public', 'extensions'
as $$
begin
  perform net.http_post(
    url := private.tg_site() || p_path,
    body := p_body,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-agent-secret', private.agent_secret()),
    timeout_milliseconds := 60000);
exception when others then null;
end $$;

-- 2. Moderatsiya navbati
create table if not exists private.mod_queue (
  id bigint generated always as identity primary key,
  target_type text not null check (target_type in ('user', 'startup')),
  target_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'working', 'done', 'error')),
  tries int not null default 0,
  verdict text,
  note text,
  created_at timestamptz not null default now(),
  taken_at timestamptz,
  done_at timestamptz
);
create index if not exists mod_queue_status on private.mod_queue (status, id);
alter table private.mod_queue enable row level security;

create or replace function private.mod_enqueue(p_type text, p_id uuid)
returns void language plpgsql security definer set search_path to ''
as $$
begin
  if not exists (select 1 from private.mod_queue where target_type = p_type and target_id = p_id and status in ('pending', 'working')) then
    insert into private.mod_queue (target_type, target_id) values (p_type, p_id);
  end if;
  perform private.agent_call('/api/agent/moderatsiya');
exception when others then null;  -- moderatsiya xatosi ro'yxatdan o'tishni hech qachon to'xtatmasin
end $$;

create or replace function private.mod_profile_trg()
returns trigger language plpgsql security definer set search_path to ''
as $$
begin
  if new.is_demo then return null; end if;
  if tg_op = 'UPDATE' and (new.full_name, new.company, new.bio, new.website, new.linkedin, new.portfolio)
       is not distinct from (old.full_name, old.company, old.bio, old.website, old.linkedin, old.portfolio) then
    return null;
  end if;
  perform private.mod_enqueue('user', new.id);
  return null;
end $$;

create or replace function private.mod_startup_trg()
returns trigger language plpgsql security definer set search_path to ''
as $$
begin
  if new.is_demo then return null; end if;
  if tg_op = 'UPDATE' and (new.name, new.sector, new.short_desc) is not distinct from (old.name, old.sector, old.short_desc) then
    return null;
  end if;
  perform private.mod_enqueue('startup', new.id);
  return null;
end $$;

drop trigger if exists profiles_ai_moderation on public.profiles;
create trigger profiles_ai_moderation after insert or update on public.profiles
  for each row execute function private.mod_profile_trg();
drop trigger if exists startups_ai_moderation on public.startups;
create trigger startups_ai_moderation after insert or update on public.startups
  for each row execute function private.mod_startup_trg();

-- Sayt navbatdan olib tekshiradi (faqat ochiq ma'lumot va email domeni)
create or replace function public.agent_mod_take(p_secret text, p_limit int default 3)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v jsonb := '[]'::jsonb; r record; v_item jsonb;
begin
  perform private.agent_check(p_secret);
  update private.mod_queue set status = 'pending' where status = 'working' and taken_at < now() - interval '10 minutes';
  update private.mod_queue set status = 'error', done_at = now(), note = '3 marta urinildi' where status = 'pending' and tries >= 3;
  for r in
    update private.mod_queue q set status = 'working', tries = q.tries + 1, taken_at = now()
     where q.id in (select id from private.mod_queue where status = 'pending' order by id
                    limit greatest(1, least(coalesce(p_limit, 3), 5)) for update skip locked)
    returning q.id, q.target_type, q.target_id
  loop
    v_item := null;
    if r.target_type = 'user' then
      select jsonb_build_object('id', r.id, 'type', 'user', 'data', jsonb_build_object(
               'role', p.role, 'full_name', left(p.full_name, 120), 'company', left(p.company, 120),
               'city', left(p.city, 80), 'region', p.region, 'bio', left(p.bio, 800), 'website', left(p.website, 200),
               'linkedin', left(p.linkedin, 200), 'portfolio', left(p.portfolio, 600), 'investor_type', p.investor_type,
               'email_domain', split_part(p.email, '@', 2), 'joined', p.created_at::date))
        into v_item from profiles p where p.id = r.target_id;
    else
      select jsonb_build_object('id', r.id, 'type', 'startup', 'data', jsonb_build_object(
               'name', left(s.name, 120), 'sector', left(s.sector, 100), 'stage', s.stage,
               'short_desc', left(s.short_desc, 1000), 'has_logo', s.logo_url is not null,
               'owner_name', left(p.full_name, 120), 'owner_company', left(p.company, 120)))
        into v_item from startups s join profiles p on p.id = s.owner_id where s.id = r.target_id;
    end if;
    if v_item is null then
      update private.mod_queue set status = 'done', done_at = now(), note = 'topilmadi' where id = r.id;
    else
      v := v || jsonb_build_array(v_item);
    end if;
  end loop;
  return v;
end $$;

-- Natija: harakat faqat shu yerda (bazada) bajariladi
create or replace function public.agent_mod_done(p_secret text, p_id bigint, p_verdict text, p_severity text, p_reason text)
returns void language plpgsql security definer set search_path to 'public'
as $$
declare
  q record; v_label text; nl text := chr(10);
  v_reason text := left(btrim(coalesce(p_reason, '')), 400);
  v_sev text := case when p_severity in ('low', 'medium', 'high') then p_severity else 'medium' end;
begin
  perform private.agent_check(p_secret);
  if p_verdict not in ('ok', 'suspicious', 'spam', 'error') then raise exception 'noto''g''ri xulosa'; end if;
  select * into q from private.mod_queue where id = p_id and status = 'working';
  if not found then return; end if;

  if p_verdict = 'error' then
    update private.mod_queue set status = 'pending', note = v_reason where id = p_id;
    return;
  end if;
  update private.mod_queue set status = 'done', verdict = p_verdict, note = v_reason, done_at = now() where id = p_id;
  if p_verdict = 'ok' then return; end if;
  if v_reason = '' then v_reason := 'Sabab ko''rsatilmagan'; end if;

  if q.target_type = 'startup' then
    select name into v_label from startups where id = q.target_id;
    if p_verdict = 'spam' then
      update startups set admin_hidden = true, hidden = true, updated_at = now() where id = q.target_id and not admin_hidden;
      if found then
        insert into agent_proposals (kind, target_type, target_id, target_label, severity, reason, suggested, status, decided_at)
        values ('hide_startup', 'startup', q.target_id, coalesce(v_label, ''), 'high',
                'AI moderator avtomatik yashirdi: ' || v_reason, '{"hidden": true}'::jsonb, 'approved', now());
        perform private.tg_send('🛡 AI moderator startapni katalogdan yashirdi: ' || coalesce(v_label, '?') || nl
          || 'Sabab: ' || v_reason || nl || nl
          || 'Xato bo''lsa, qaytaring: ' || private.tg_site() || '/admin/startaplar');
      end if;
    else
      if not exists (select 1 from agent_proposals where target_id = q.target_id and kind = 'hide_startup' and status = 'pending') then
        insert into agent_proposals (kind, target_type, target_id, target_label, severity, reason, suggested)
        values ('hide_startup', 'startup', q.target_id, coalesce(v_label, ''), v_sev,
                'AI moderator: shubhali — ' || v_reason, '{"hidden": true}'::jsonb);
        perform private.tg_send('⚠️ AI moderator shubhali startap topdi: ' || coalesce(v_label, '?') || nl
          || 'Sabab: ' || v_reason || nl || nl || 'Ko''rib chiqing: ' || private.tg_site() || '/admin/agent');
      end if;
    end if;
  else
    select coalesce(nullif(full_name, ''), 'Ismsiz') into v_label from profiles where id = q.target_id;
    if not exists (select 1 from agent_proposals where target_id = q.target_id and kind = 'review_user' and status = 'pending') then
      insert into agent_proposals (kind, target_type, target_id, target_label, severity, reason, suggested)
      values ('review_user', 'user', q.target_id, coalesce(v_label, ''),
              case when p_verdict = 'spam' then 'high' else v_sev end,
              'AI moderator: ' || case when p_verdict = 'spam' then 'spam yoki soxta akkaunt ehtimoli yuqori — ' else 'shubhali — ' end || v_reason,
              '{}'::jsonb);
      perform private.tg_send(case when p_verdict = 'spam' then '🚫 AI moderator: spam yoki soxta akkaunt ehtimoli yuqori' else '⚠️ AI moderator: shubhali akkaunt' end
        || nl || 'Foydalanuvchi: ' || coalesce(v_label, '?') || nl || 'Sabab: ' || v_reason || nl || nl
        || 'Bloklash faqat sizning qaroringiz: ' || private.tg_site() || '/admin/foydalanuvchilar/' || q.target_id);
    end if;
  end if;
end $$;

-- Zaxira: signal yo'qolsa, har 10 daqiqada qayta
create or replace function private.mod_cron()
returns void language plpgsql security definer set search_path to ''
as $$
begin
  if exists (select 1 from private.mod_queue where status = 'pending'
             or (status = 'working' and taken_at < now() - interval '10 minutes')) then
    perform private.agent_call('/api/agent/moderatsiya');
  end if;
  if exists (select 1 from private.tg_questions where answered_at is null and tries < 3
             and created_at > now() - interval '1 hour' and created_at < now() - interval '2 minutes') then
    perform private.agent_call('/api/agent/telegram', '{}'::jsonb);
  end if;
end $$;

-- 3. Yordam: saytdagi bot limiti (kunlik: mehmon 12, foydalanuvchi 40, butun sayt 400 savol)
create or replace function public.ai_bot_take(p_bucket text, p_audience text)
returns jsonb language sql security definer set search_path to ''
as $$ select public.bot_take(p_bucket, p_audience) $$;

-- 4. Yordam: Telegram savollari
create table if not exists private.tg_questions (
  id bigint generated always as identity primary key,
  chat_id bigint not null,
  question text not null,
  lang text not null default 'uz',
  audience text not null default 'guest',
  tries int not null default 0,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);
create index if not exists tg_questions_open on private.tg_questions (answered_at, id);
alter table private.tg_questions enable row level security;

create or replace function private.tg_ask(p_chat bigint, p_text text, p_lang text, p_uid uuid)
returns void language plpgsql security definer set search_path to 'public', 'extensions'
as $$
declare v_aud text := 'guest'; v_lim jsonb; v_id bigint;
begin
  if p_uid is not null then
    select case when role in ('startup', 'investor') then role else 'guest' end into v_aud from profiles where id = p_uid;
  end if;
  v_lim := public.bot_take('tg:' || p_chat, coalesce(v_aud, 'guest'));
  if not coalesce((v_lim ->> 'ok')::boolean, false) then
    perform private.tg_msg(p_chat, case p_lang
      when 'ru' then 'Сегодня лимит вопросов исчерпан. Задайте вопрос команде на сайте:'
      when 'en' then 'The question limit for today is reached. You can write to our team on the site:'
      else 'Bugungi savollar limiti tugadi. Jamoamizga saytda yozishingiz mumkin:' end,
      jsonb_build_array(jsonb_build_array(private.tg_url_btn(case p_lang when 'ru' then 'Помощь' when 'en' then 'Help' else 'Yordam' end, '/yordam'))));
    return;
  end if;
  insert into private.tg_questions (chat_id, question, lang, audience)
  values (p_chat, left(p_text, 500), coalesce(p_lang, 'uz'), coalesce(v_aud, 'guest')) returning id into v_id;
  perform private.tg_api('sendChatAction', jsonb_build_object('chat_id', p_chat, 'action', 'typing'));
  perform private.agent_call('/api/agent/telegram', jsonb_build_object('id', v_id));
exception when others then
  perform private.tg_menu(p_chat);
end $$;

create or replace function public.agent_tg_take(p_secret text, p_id bigint default null)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare r record;
begin
  perform private.agent_check(p_secret);
  update private.tg_questions q set tries = q.tries + 1
   where q.id = (select id from private.tg_questions
                  where answered_at is null and tries < 3 and created_at > now() - interval '1 hour'
                    and (p_id is null or id = p_id)
                  order by id limit 1 for update skip locked)
  returning q.id, q.question, q.lang, q.audience into r;
  if not found then return null; end if;
  return jsonb_build_object('id', r.id, 'question', r.question, 'lang', r.lang, 'audience', r.audience);
end $$;

create or replace function public.agent_tg_answer(p_secret text, p_id bigint, p_answer text, p_confident boolean)
returns void language plpgsql security definer set search_path to 'public'
as $$
declare q record; v_btn text;
begin
  perform private.agent_check(p_secret);
  select * into q from private.tg_questions where id = p_id and answered_at is null;
  if not found then return; end if;
  update private.tg_questions set answered_at = now() where id = p_id;
  v_btn := case q.lang when 'ru' then 'Написать команде' when 'en' then 'Write to the team' else 'Jamoaga yozish' end;
  perform private.tg_msg(q.chat_id, private.tg_esc(left(coalesce(p_answer, ''), 3500)),
    case when coalesce(p_confident, false) then null
         else jsonb_build_array(jsonb_build_array(private.tg_url_btn(v_btn, '/yordam'))) end);
end $$;

-- 5. Telegram webhook: erkin matn endi AI yordamchiga ketadi (oldin faqat menyu chiqardi). Qolgani o'zgarmagan.
CREATE OR REPLACE FUNCTION public.tg_webhook(p_secret text, p_update jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_secret text; v_msg jsonb; v_cb jsonb; v_chat bigint; v_txt text; v_code text; v_lang text; v_uname text;
  v_uid uuid; v_rid uuid; v_data text; v_ok boolean; v_res text; v_other text; rec record;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'telegram_webhook_secret' limit 1;
  if v_secret is null or p_secret is distinct from v_secret then return; end if;

  v_cb := p_update -> 'callback_query';
  if v_cb is not null then
    if coalesce(v_cb -> 'message' -> 'chat' ->> 'type', '') <> 'private' then return; end if;
    v_chat := (v_cb -> 'message' -> 'chat' ->> 'id')::bigint;
    v_data := coalesce(v_cb ->> 'data', '');
    v_lang := private.tg_lang(v_chat);
    select user_id into v_uid from private.tg_chats where chat_id = v_chat;

    if v_data in ('lang:uz', 'lang:ru', 'lang:en') then
      v_lang := substr(v_data, 6);
      insert into private.tg_prefs (chat_id, lang) values (v_chat, v_lang)
        on conflict (chat_id) do update set lang = excluded.lang, updated_at = now();
      update private.tg_chats set lang = v_lang where chat_id = v_chat;
      perform private.tg_answer(v_cb ->> 'id', private.tg_t('lang_set', v_lang));
      perform private.tg_menu(v_chat);

    elsif v_data = 'lang' then
      perform private.tg_answer(v_cb ->> 'id', null);
      perform private.tg_lang_picker(v_chat);

    elsif v_data ~ '^(ap|rj):[0-9a-f-]{36}$' then
      if v_uid is null then
        perform private.tg_answer(v_cb ->> 'id', private.tg_t('not_linked', v_lang));
        return;
      end if;
      v_rid := substr(v_data, 4)::uuid;
      update public.access_requests r
         set status = case when v_data like 'ap:%' then 'approved' else 'rejected' end, decided_at = now()
       where r.id = v_rid and r.status = 'pending'
         and exists (select 1 from public.startups s where s.id = r.startup_id and s.owner_id = v_uid);
      v_ok := found;
      v_res := private.tg_t(case when not v_ok then 'req_gone' when v_data like 'ap:%' then 'done_approved' else 'done_rejected' end, v_lang);
      perform private.tg_answer(v_cb ->> 'id', v_res);
      perform private.tg_api('editMessageText', jsonb_build_object(
        'chat_id', v_chat, 'message_id', (v_cb -> 'message' ->> 'message_id')::bigint,
        'parse_mode', 'HTML', 'disable_web_page_preview', true,
        'text', left(private.tg_esc(v_cb -> 'message' ->> 'text'), 3800) || chr(10) || chr(10) || '<b>' || v_res || '</b>'));

    elsif v_data ~ '^rp:[0-9a-f-]{36}$' then
      v_rid := substr(v_data, 4)::uuid;
      v_other := case when v_uid is not null then private.tg_chat_partner(v_rid, v_uid) end;
      if v_other is null then
        perform private.tg_answer(v_cb ->> 'id', private.tg_t(case when v_uid is null then 'not_linked' else 'reply_closed' end, v_lang));
        return;
      end if;
      perform private.tg_answer(v_cb ->> 'id', null);
      perform private.tg_api('sendMessage', jsonb_build_object(
        'chat_id', v_chat, 'parse_mode', 'HTML', 'disable_web_page_preview', true,
        'text', private.tg_t('reply_prompt', v_lang, v_other) || chr(10) || '<a href="' || private.tg_site() || '/kabinet/xabarlar/' || v_rid || '">'
                || private.tg_t('btn_open_chat', v_lang) || '</a>',
        'reply_markup', jsonb_build_object('force_reply', true)));

    else
      perform private.tg_answer(v_cb ->> 'id', null);
    end if;
    return;
  end if;

  v_msg := p_update -> 'message';
  if v_msg is null or coalesce(v_msg -> 'chat' ->> 'type', '') <> 'private' then return; end if;
  v_chat := (v_msg -> 'chat' ->> 'id')::bigint;
  v_txt := btrim(coalesce(v_msg ->> 'text', ''));
  v_uname := coalesce(v_msg -> 'from' ->> 'username', '');
  v_lang := private.tg_lang(v_chat);
  select user_id into v_uid from private.tg_chats where chat_id = v_chat;

  if v_txt ~ '^/start\s+[0-9a-f]{24}$' then
    v_code := substring(v_txt from '[0-9a-f]{24}$');
    select c.user_id, c.lang, p.full_name into rec
      from private.tg_codes c join public.profiles p on p.id = c.user_id
     where c.code = v_code and c.created_at > now() - interval '1 day';
    if found then
      delete from private.tg_chats where chat_id = v_chat or user_id = rec.user_id;
      insert into private.tg_chats (user_id, chat_id, username, lang) values (rec.user_id, v_chat, v_uname, rec.lang);
      insert into private.tg_prefs (chat_id, lang) values (v_chat, rec.lang)
        on conflict (chat_id) do update set lang = excluded.lang, updated_at = now();
      delete from private.tg_codes where user_id = rec.user_id;
      perform private.tg_msg(v_chat, private.tg_t('linked', rec.lang, coalesce(nullif(rec.full_name, ''), v_uname)));
      perform private.tg_menu(v_chat);
    else
      perform private.tg_msg(v_chat, private.tg_t('bad_code', v_lang),
        jsonb_build_array(jsonb_build_array(private.tg_url_btn(private.tg_t('btn_link', v_lang), '/kabinet/sozlamalar'))));
    end if;

  elsif v_txt ~ '^/stop' then
    delete from private.tg_chats where chat_id = v_chat;
    perform private.tg_msg(v_chat, private.tg_t('unlinked', v_lang));

  elsif v_txt ~ '^/(til|lang|language)' then
    perform private.tg_lang_picker(v_chat);

  elsif v_txt ~ '^/start' then
    if v_uid is null and not exists (select 1 from private.tg_prefs where chat_id = v_chat) then
      perform private.tg_lang_picker(v_chat);
    else
      perform private.tg_menu(v_chat);
    end if;

  elsif v_msg ? 'reply_to_message' then
    v_rid := substring((v_msg -> 'reply_to_message')::text from '/kabinet/xabarlar/([0-9a-f-]{36})')::uuid;
    if v_rid is null then
      perform private.tg_menu(v_chat);
    elsif v_uid is null or private.tg_chat_partner(v_rid, v_uid) is null then
      perform private.tg_msg(v_chat, private.tg_t(case when v_uid is null then 'not_linked' else 'reply_closed' end, v_lang));
    elsif v_txt = '' then
      perform private.tg_msg(v_chat, private.tg_t('reply_empty', v_lang));
    else
      insert into public.messages (request_id, sender_id, body) values (v_rid, v_uid, left(v_txt, 4000));
      update public.messages set read_at = now() where request_id = v_rid and sender_id <> v_uid and read_at is null;
      perform private.tg_msg(v_chat, private.tg_t('reply_sent', v_lang),
        jsonb_build_array(jsonb_build_array(private.tg_url_btn(private.tg_t('btn_open_chat', v_lang), '/kabinet/xabarlar/' || v_rid))));
    end if;

  elsif char_length(v_txt) >= 3 and left(v_txt, 1) <> '/' then
    -- Erkin savol: AI yordamchi javob beradi
    perform private.tg_ask(v_chat, v_txt, v_lang, v_uid);

  else
    perform private.tg_menu(v_chat);
  end if;
end $function$;

-- 6. Ruxsatlar: ichki funksiyalar yopiq; sayt chaqiradiganlari kalit bilan tekshiriladi
revoke all on function private.agent_secret() from public, anon, authenticated;
revoke all on function private.agent_check(text) from public, anon, authenticated;
revoke all on function private.agent_call(text, jsonb) from public, anon, authenticated;
revoke all on function private.mod_enqueue(text, uuid) from public, anon, authenticated;
revoke all on function private.mod_cron() from public, anon, authenticated;
revoke all on function private.tg_ask(bigint, text, text, uuid) from public, anon, authenticated;
revoke all on function public.agent_mod_take(text, int) from public;
revoke all on function public.agent_mod_done(text, bigint, text, text, text) from public;
revoke all on function public.agent_tg_take(text, bigint) from public;
revoke all on function public.agent_tg_answer(text, bigint, text, boolean) from public;
revoke all on function public.ai_bot_take(text, text) from public;
grant execute on function public.agent_mod_take(text, int) to anon, authenticated;
grant execute on function public.agent_mod_done(text, bigint, text, text, text) to anon, authenticated;
grant execute on function public.agent_tg_take(text, bigint) to anon, authenticated;
grant execute on function public.agent_tg_answer(text, bigint, text, boolean) to anon, authenticated;
grant execute on function public.ai_bot_take(text, text) to anon, authenticated;
revoke execute on function public.tg_webhook(text, jsonb) from public, anon, authenticated;
grant execute on function public.tg_webhook(text, jsonb) to service_role;

-- 7. Jadval
do $$
begin
  if exists (select 1 from cron.job where jobname = 'investage_ai_moderation') then
    perform cron.unschedule('investage_ai_moderation');
  end if;
  perform cron.schedule('investage_ai_moderation', '*/10 * * * *', 'select private.mod_cron()');
end $$;
