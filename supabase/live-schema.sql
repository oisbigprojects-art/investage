-- Jonli bazaning nusxasi (Supabase, loyiha fuklumjbymmkaflzndxp), 2026-10-26 holatiga.
-- Faqat ma'lumot uchun: bazada aslida nima turganini ko'rsatadi (schema.sql va agent.sql bundan orqada qolgan).
-- Bu faylni SQL Editor'da to'g'ridan-to'g'ri ishga tushirmang.
-- Kalitlar va parollar bu yerda yo'q: Telegram tokeni va webhook siri Supabase Vault'da saqlanadi.
-- Nusxa olingandan keyin qo'llangan: 2026-10-26-profil-va-moderatsiya.sql (admin_hidden, investor profili ruxsatlari),
-- 2026-10-26-xavfsizlik-va-tezlik.sql (submit_feedback, tezlik cheklovlari, indekslar), 2026-10-26-tg-webhook-yopish.sql.

-- TABLES

create table private.admin_emails (email text not null, constraint admin_emails_email_check CHECK ((email = lower(btrim(email)))), constraint admin_emails_pkey PRIMARY KEY (email));
create table private.admin_ids (user_id uuid not null, added_at timestamp with time zone not null default now(), note text, constraint admin_ids_pkey PRIMARY KEY (user_id));
create table private.settings (key text not null, value text not null, constraint settings_pkey PRIMARY KEY (key));
create table private.tg_chats (user_id uuid not null, chat_id bigint not null, username text not null default ''::text, lang text not null default 'uz'::text, linked_at timestamp with time zone not null default now(), constraint tg_chats_chat_id_key UNIQUE (chat_id), constraint tg_chats_pkey PRIMARY KEY (user_id), constraint tg_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE);
create table private.tg_codes (code text not null, user_id uuid not null, lang text not null default 'uz'::text, created_at timestamp with time zone not null default now(), constraint tg_codes_pkey PRIMARY KEY (code), constraint tg_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE);
create table public.access_requests (id uuid not null default gen_random_uuid(), startup_id uuid not null, investor_id uuid not null, status text not null default 'pending'::text, message text not null default ''::text, created_at timestamp with time zone not null default now(), decided_at timestamp with time zone, initiated_by text not null default 'investor'::text, constraint access_requests_initiated_by_check CHECK ((initiated_by = ANY (ARRAY['investor'::text, 'startup'::text]))), constraint access_requests_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES profiles(id) ON DELETE CASCADE, constraint access_requests_pkey PRIMARY KEY (id), constraint access_requests_startup_id_fkey FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE, constraint access_requests_startup_id_investor_id_key UNIQUE (startup_id, investor_id), constraint access_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'revoked'::text]))));
create table public.admin_actions (id uuid not null default gen_random_uuid(), admin_id uuid not null, admin_email text, action text not null, target text, detail jsonb, created_at timestamp with time zone not null default now(), constraint admin_actions_pkey PRIMARY KEY (id));
create table public.agent_proposals (id uuid not null default gen_random_uuid(), kind text not null, target_type text not null, target_id uuid not null, target_label text not null default ''::text, severity text not null default 'low'::text, reason text not null, suggested jsonb not null default '{}'::jsonb, status text not null default 'pending'::text, created_at timestamp with time zone not null default now(), decided_by uuid, decided_at timestamp with time zone, constraint agent_proposals_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES auth.users(id) ON DELETE SET NULL, constraint agent_proposals_kind_check CHECK ((kind = ANY (ARRAY['verify_startup'::text, 'hide_startup'::text, 'review_user'::text, 'incomplete_profile'::text, 'feedback_note'::text]))), constraint agent_proposals_pkey PRIMARY KEY (id), constraint agent_proposals_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))), constraint agent_proposals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'dismissed'::text]))), constraint agent_proposals_target_type_check CHECK ((target_type = ANY (ARRAY['startup'::text, 'user'::text, 'feedback'::text]))));
create table public.bot_usage (bucket text not null, day date not null default ((now() AT TIME ZONE 'Asia/Tashkent'::text))::date, audience text not null, calls integer not null default 0, constraint bot_usage_pkey PRIMARY KEY (bucket, day));
create table public.feedback (id uuid not null default gen_random_uuid(), user_id uuid, kind text not null default 'feedback'::text, name text not null default ''::text, email text not null default ''::text, message text not null, page text not null default ''::text, status text not null default 'new'::text, created_at timestamp with time zone not null default now(), constraint feedback_email_check CHECK ((char_length(email) <= 200)), constraint feedback_kind_check CHECK ((kind = ANY (ARRAY['feedback'::text, 'support'::text, 'bug'::text]))), constraint feedback_message_check CHECK (((char_length(message) >= 5) AND (char_length(message) <= 4000))), constraint feedback_name_check CHECK ((char_length(name) <= 120)), constraint feedback_page_check CHECK ((char_length(page) <= 300)), constraint feedback_pkey PRIMARY KEY (id), constraint feedback_status_check CHECK ((status = ANY (ARRAY['new'::text, 'seen'::text, 'done'::text]))), constraint feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL);
create table public.messages (id uuid not null default gen_random_uuid(), request_id uuid not null, sender_id uuid not null, body text not null, created_at timestamp with time zone not null default now(), read_at timestamp with time zone, constraint messages_body_check CHECK (((char_length(btrim(body)) >= 1) AND (char_length(btrim(body)) <= 4000))), constraint messages_pkey PRIMARY KEY (id), constraint messages_request_id_fkey FOREIGN KEY (request_id) REFERENCES access_requests(id) ON DELETE CASCADE, constraint messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE);
create table public.profiles (id uuid not null, role text not null, full_name text not null default ''::text, email text not null default ''::text, created_at timestamp with time zone not null default now(), company text not null default ''::text, interests text not null default ''::text, bio text not null default ''::text, notifications_seen_at timestamp with time zone not null default now(), city text not null default ''::text, public_profile boolean not null default false, is_demo boolean not null default false, investor_type text not null default ''::text, check_min numeric, check_max numeric, stages text[] not null default '{}'::text[], experience_years integer, portfolio text not null default ''::text, website text not null default ''::text, linkedin text not null default ''::text, telegram text not null default ''::text, public_contacts boolean not null default false, constraint profiles_city_len CHECK ((char_length(city) <= 80)), constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE, constraint profiles_investor_details_check CHECK (((investor_type = ANY (ARRAY[''::text, 'angel'::text, 'fund'::text, 'corporate'::text, 'family'::text, 'other'::text])) AND ((check_min IS NULL) OR (check_min >= (0)::numeric)) AND ((check_max IS NULL) OR (check_max >= (0)::numeric)) AND ((check_min IS NULL) OR (check_max IS NULL) OR (check_min <= check_max)) AND (stages <@ ARRAY['goya'::text, 'mvp'::text, 'daromad'::text]) AND ((experience_years IS NULL) OR ((experience_years >= 0) AND (experience_years <= 80))) AND (char_length(portfolio) <= 1500) AND (char_length(website) <= 200) AND (char_length(linkedin) <= 200) AND (char_length(telegram) <= 64))), constraint profiles_len_check CHECK (((char_length(company) <= 120) AND (char_length(interests) <= 200) AND (char_length(bio) <= 600))), constraint profiles_pkey PRIMARY KEY (id), constraint profiles_role_check CHECK ((role = ANY (ARRAY['startup'::text, 'investor'::text]))));
create table public.saved_startups (investor_id uuid not null, startup_id uuid not null, created_at timestamp with time zone not null default now(), constraint saved_startups_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES profiles(id) ON DELETE CASCADE, constraint saved_startups_pkey PRIMARY KEY (investor_id, startup_id), constraint saved_startups_startup_id_fkey FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE);
create table public.startup_documents (id uuid not null default gen_random_uuid(), startup_id uuid not null, kind text not null default 'other'::text, title text not null, path text not null, size integer not null default 0, mime text not null default ''::text, created_at timestamp with time zone not null default now(), constraint startup_documents_kind_check CHECK ((kind = ANY (ARRAY['pitch'::text, 'finance'::text, 'legal'::text, 'other'::text]))), constraint startup_documents_path_check CHECK (((path ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,120}$'::text) OR (path ~~ '/demo-docs/%'::text))), constraint startup_documents_path_key UNIQUE (path), constraint startup_documents_pkey PRIMARY KEY (id), constraint startup_documents_size_check CHECK (((size >= 0) AND (size <= 10485760))), constraint startup_documents_startup_id_fkey FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE, constraint startup_documents_title_check CHECK (((char_length(btrim(title)) >= 1) AND (char_length(btrim(title)) <= 120))));
create table public.startup_private (startup_id uuid not null, funding_amount numeric, equity_percent numeric, team text not null default ''::text, contact_email text not null default ''::text, contact_phone text not null default ''::text, contact_telegram text not null default ''::text, extra jsonb not null default '{}'::jsonb, updated_at timestamp with time zone not null default now(), constraint startup_private_equity_percent_check CHECK (((equity_percent > (0)::numeric) AND (equity_percent <= (100)::numeric))), constraint startup_private_funding_amount_check CHECK ((funding_amount >= (0)::numeric)), constraint startup_private_pkey PRIMARY KEY (startup_id), constraint startup_private_startup_id_fkey FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE);
create table public.startups (id uuid not null default gen_random_uuid(), owner_id uuid not null, name text not null, sector text not null default ''::text, short_desc text not null default ''::text, stage text not null default 'goya'::text, score integer, verified boolean not null default false, created_at timestamp with time zone not null default now(), updated_at timestamp with time zone not null default now(), logo_url text, hidden boolean not null default false, is_demo boolean not null default false, constraint startups_logo_url_check CHECK (((logo_url IS NULL) OR (logo_url ~~ 'https://fuklumjbymmkaflzndxp.supabase.co/storage/v1/object/public/logos/%'::text) OR (logo_url ~~ '/demo-logos/%'::text))), constraint startups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE, constraint startups_owner_id_key UNIQUE (owner_id), constraint startups_pkey PRIMARY KEY (id), constraint startups_score_check CHECK (((score >= 0) AND (score <= 100))), constraint startups_stage_check CHECK ((stage = ANY (ARRAY['goya'::text, 'mvp'::text, 'daromad'::text]))));
create table public.survey_responses (id uuid not null default gen_random_uuid(), kind text not null, answers jsonb not null, created_at timestamp with time zone not null default now(), constraint survey_responses_kind_check CHECK ((kind = ANY (ARRAY['startup'::text, 'investor'::text]))), constraint survey_responses_pkey PRIMARY KEY (id));

-- RLS

alter table public.access_requests enable row level security;
alter table public.admin_actions enable row level security;
alter table public.agent_proposals enable row level security;
alter table public.bot_usage enable row level security;
alter table public.feedback enable row level security;
alter table public.messages enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_startups enable row level security;
alter table public.startup_documents enable row level security;
alter table public.startup_private enable row level security;
alter table public.startups enable row level security;
alter table public.survey_responses enable row level security;

-- POLICIES

create policy requests_select on public.access_requests as PERMISSIVE for SELECT to authenticated using (((investor_id = auth.uid()) OR private.owns_startup(startup_id)));
create policy feedback_insert on public.feedback as PERMISSIVE for INSERT to anon, authenticated with check (((user_id IS NULL) OR (user_id = ( SELECT auth.uid() AS uid))));
create policy feedback_select_own on public.feedback as PERMISSIVE for SELECT to authenticated using ((user_id = ( SELECT auth.uid() AS uid)));
create policy messages_insert on public.messages as PERMISSIVE for INSERT to authenticated with check (((sender_id = auth.uid()) AND private.chat_open(request_id)));
create policy messages_select on public.messages as PERMISSIVE for SELECT to authenticated using (private.chat_member(request_id));
create policy profiles_select on public.profiles as PERMISSIVE for SELECT to authenticated using (((id = auth.uid()) OR private.requested_my_startup(id)));
create policy profiles_update on public.profiles as PERMISSIVE for UPDATE to authenticated using ((id = auth.uid()));
create policy saved_delete on public.saved_startups as PERMISSIVE for DELETE to authenticated using ((investor_id = ( SELECT auth.uid() AS uid)));
create policy saved_insert on public.saved_startups as PERMISSIVE for INSERT to authenticated with check (((investor_id = ( SELECT auth.uid() AS uid)) AND (private.my_role() = 'investor'::text)));
create policy saved_select on public.saved_startups as PERMISSIVE for SELECT to authenticated using ((investor_id = ( SELECT auth.uid() AS uid)));
create policy docs_delete on public.startup_documents as PERMISSIVE for DELETE to authenticated using (private.owns_startup(startup_id));
create policy docs_insert on public.startup_documents as PERMISSIVE for INSERT to authenticated with check ((private.owns_startup(startup_id) AND (path ~~ ((startup_id)::text || '/%'::text))));
create policy docs_select on public.startup_documents as PERMISSIVE for SELECT to authenticated using ((private.owns_startup(startup_id) OR private.has_access(startup_id)));
create policy private_insert on public.startup_private as PERMISSIVE for INSERT to authenticated with check (private.owns_startup(startup_id));
create policy private_select on public.startup_private as PERMISSIVE for SELECT to authenticated using ((private.owns_startup(startup_id) OR private.has_access(startup_id)));
create policy private_update on public.startup_private as PERMISSIVE for UPDATE to authenticated using (private.owns_startup(startup_id));
create policy startups_insert on public.startups as PERMISSIVE for INSERT to authenticated with check (((owner_id = auth.uid()) AND (private.my_role() = 'startup'::text)));
create policy startups_select on public.startups as PERMISSIVE for SELECT to anon, authenticated using (((hidden = false) OR (owner_id = ( SELECT auth.uid() AS uid))));
create policy startups_update on public.startups as PERMISSIVE for UPDATE to authenticated using ((owner_id = auth.uid()));
create policy docs_obj_delete on storage.objects as PERMISSIVE for DELETE to authenticated using (((bucket_id = 'docs'::text) AND private.owns_startup(private.doc_startup(name))));
create policy docs_obj_insert on storage.objects as PERMISSIVE for INSERT to authenticated with check (((bucket_id = 'docs'::text) AND private.owns_startup(private.doc_startup(name))));
create policy docs_obj_select on storage.objects as PERMISSIVE for SELECT to authenticated using (((bucket_id = 'docs'::text) AND (private.owns_startup(private.doc_startup(name)) OR private.has_access(private.doc_startup(name)))));
create policy logos_delete on storage.objects as PERMISSIVE for DELETE to authenticated using (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));
create policy logos_insert on storage.objects as PERMISSIVE for INSERT to authenticated with check (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) AND (private.my_role() = 'startup'::text)));
create policy logos_select on storage.objects as PERMISSIVE for SELECT to authenticated using (((bucket_id = 'logos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

-- COLUMN GRANTS (anon/authenticated, INSERT/UPDATE)

grant INSERT (created_at, email, id, kind, message, name, page, status, user_id) on public.feedback to anon;
grant UPDATE (created_at, email, id, kind, message, name, page, status, user_id) on public.feedback to anon;
grant INSERT (created_at, email, id, kind, message, name, page, status, user_id) on public.feedback to authenticated;
grant UPDATE (created_at, email, id, kind, message, name, page, status, user_id) on public.feedback to authenticated;
grant INSERT (body, created_at, id, read_at, request_id, sender_id) on public.messages to authenticated;
grant UPDATE (body, created_at, id, read_at, request_id, sender_id) on public.messages to authenticated;
grant UPDATE (bio, company, full_name, interests, notifications_seen_at) on public.profiles to authenticated;
grant INSERT (created_at, investor_id, startup_id) on public.saved_startups to authenticated;
grant INSERT (created_at, id, kind, mime, path, size, startup_id, title) on public.startup_documents to authenticated;
grant UPDATE (created_at, id, kind, mime, path, size, startup_id, title) on public.startup_documents to authenticated;
grant INSERT (contact_email, contact_phone, contact_telegram, equity_percent, extra, funding_amount, startup_id, team, updated_at) on public.startup_private to authenticated;
grant UPDATE (contact_email, contact_phone, contact_telegram, equity_percent, extra, funding_amount, startup_id, team, updated_at) on public.startup_private to authenticated;
grant INSERT (logo_url, name, owner_id, sector, short_desc, stage) on public.startups to authenticated;
grant UPDATE (hidden, logo_url, name, sector, short_desc, stage, updated_at) on public.startups to authenticated;

-- STORAGE BUCKETS

-- bucket logos: public=t, size=1048576, mime={image/png,image/jpeg,image/webp}
-- bucket docs: public=f, size=10485760, mime={application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,image/png,image/jpeg}

-- FUNCTIONS

CREATE OR REPLACE FUNCTION private.admin_guard()
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ begin
  if not private.is_admin() then raise exception 'Ruxsat yo''q'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION private.bot_usage_cleanup()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ delete from public.bot_usage where day < (now() at time zone 'Asia/Tashkent')::date - 30; $function$
;
CREATE OR REPLACE FUNCTION private.chat_member(rid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.access_requests r join public.startups s on s.id = r.startup_id
                 where r.id = rid and (r.investor_id = auth.uid() or s.owner_id = auth.uid()))
$function$
;
CREATE OR REPLACE FUNCTION private.chat_open(rid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.access_requests r join public.startups s on s.id = r.startup_id
                 where r.id = rid and r.status = 'approved' and (r.investor_id = auth.uid() or s.owner_id = auth.uid()))
$function$
;
CREATE OR REPLACE FUNCTION private.demo_auto_approve()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.status = 'pending' and exists (select 1 from public.startups s where s.id = new.startup_id and s.is_demo) then
    new.status := 'approved';
    new.decided_at := now();
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION private.demo_chat_reply()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_owner uuid; v_demo boolean;
begin
  select s.owner_id, s.is_demo into v_owner, v_demo
    from public.access_requests r join public.startups s on s.id = r.startup_id where r.id = new.request_id;
  if v_demo and new.sender_id <> v_owner and not exists (
       select 1 from public.messages where request_id = new.request_id and sender_id = v_owner and created_at > now() - interval '1 day') then
    insert into public.messages (request_id, sender_id, body) values (new.request_id, v_owner,
      'Assalomu alaykum! Bu — Investage''dagi namuna startap, shuning uchun xabarlaringizga haqiqiy jamoa javob bermaydi. Chat qanday ishlashini bemalol sinab ko''ring.' || E'\n\n' ||
      'Hello! This is a sample startup on Investage, so no real team will reply. Feel free to try out how the chat works.');
  end if;
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION private.doc_startup(p_name text)
 RETURNS uuid
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select case when split_part(p_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              then split_part(p_name, '/', 1)::uuid end
$function$
;
CREATE OR REPLACE FUNCTION private.docs_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if (select count(*) from public.startup_documents where startup_id = new.startup_id) >= 15 then
    raise exception 'Hujjatlar soni chegarasi';
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION private.feedback_notify()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare cid text; txt text; kind_label text;
begin
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
end $function$
;
CREATE OR REPLACE FUNCTION private.has_access(sid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.access_requests r
    join public.startups s on s.id = r.startup_id
    where r.startup_id = sid and r.investor_id = auth.uid() and r.status = 'approved' and s.hidden = false
  )
$function$
;
CREATE OR REPLACE FUNCTION private.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select exists (select 1 from private.admin_ids where user_id = auth.uid()); $function$
;
CREATE OR REPLACE FUNCTION private.message_notify()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r record; s record; v_to uuid; v_from text;
begin
  select * into r from public.access_requests where id = new.request_id;
  select id, name, owner_id into s from public.startups where id = r.startup_id;
  if exists (select 1 from public.messages where request_id = new.request_id and sender_id = new.sender_id and id <> new.id
               and read_at is null and created_at > now() - interval '10 minutes') then
    return null;
  end if;
  if new.sender_id = s.owner_id then
    v_to := r.investor_id; v_from := s.name;
  else
    v_to := s.owner_id;
    select coalesce(nullif(full_name, ''), 'Investor') into v_from from public.profiles where id = new.sender_id;
  end if;
  perform private.tg_notify(v_to, 'new_message', v_from, left(new.body, 300), '/kabinet/xabarlar/' || new.request_id);
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION private.my_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select role from public.profiles where id = auth.uid()
$function$
;
CREATE OR REPLACE FUNCTION private.owns_startup(sid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.startups where id = sid and owner_id = auth.uid())
$function$
;
CREATE OR REPLACE FUNCTION private.request_notify()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare s record; inv record; v_who text;
begin
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then return null; end if;
  select id, name, owner_id into s from public.startups where id = new.startup_id;
  if new.status = 'pending' then
    select full_name, company into inv from public.profiles where id = new.investor_id;
    v_who := coalesce(nullif(inv.full_name, ''), 'Investor') || case when coalesce(inv.company, '') <> '' then ' (' || inv.company || ')' else '' end;
    perform private.tg_notify(s.owner_id, 'new_request', v_who, s.name, '/kabinet/startap/sorovlar?holat=kutilmoqda');
  elsif new.status = 'approved' and new.initiated_by = 'startup' and (tg_op = 'INSERT' or old.status <> 'pending') then
    perform private.tg_notify(new.investor_id, 'offer', s.name, '', '/startaplar/' || s.id);
  elsif new.status = 'approved' then
    perform private.tg_notify(new.investor_id, 'approved', s.name, '', '/startaplar/' || s.id);
  elsif new.status = 'rejected' and tg_op = 'UPDATE' and old.status = 'pending' then
    perform private.tg_notify(new.investor_id, 'rejected', s.name, '', '/startaplar/' || s.id);
  end if;
  return null;
end $function$
;
CREATE OR REPLACE FUNCTION private.requested_my_startup(pid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.access_requests r
    join public.startups s on s.id = r.startup_id
    where r.investor_id = pid and s.owner_id = auth.uid()
  )
$function$
;
CREATE OR REPLACE FUNCTION private.tg_link()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare body jsonb; uname text; cid text;
begin
  select value into uname from private.settings where key = 'telegram_username';
  select content::jsonb into body from extensions.http_get('https://api.telegram.org/bot' || private.tg_token() || '/getUpdates');
  select (u->'message'->'chat'->>'id') into cid
  from jsonb_array_elements(coalesce(body->'result', '[]'::jsonb)) u
  where lower(u->'message'->'from'->>'username') = lower(uname)
  order by (u->>'update_id')::bigint desc limit 1;
  if cid is not null then
    insert into private.settings(key, value) values ('telegram_chat_id', cid)
    on conflict (key) do update set value = excluded.value;
  end if;
  return cid;
end $function$
;
CREATE OR REPLACE FUNCTION private.tg_notify(p_user uuid, k text, a text, b text, p_path text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare c record;
begin
  select chat_id, lang into c from private.tg_chats where user_id = p_user;
  if not found then return; end if;
  perform private.tg_reply(c.chat_id, private.tg_t(k, c.lang, a, b), p_path, c.lang);
exception when others then null; -- Telegram ishlamasa ham asosiy amal bajariladi
end $function$
;
CREATE OR REPLACE FUNCTION private.tg_reply(p_chat bigint, p_text text, p_path text DEFAULT NULL::text, p_lang text DEFAULT 'uz'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare v_body jsonb; v_site text;
begin
  v_body := jsonb_build_object('chat_id', p_chat, 'text', left(p_text, 4000), 'disable_web_page_preview', true);
  if p_path is not null then
    select value into v_site from private.settings where key = 'site_url';
    v_body := v_body || jsonb_build_object('reply_markup', jsonb_build_object('inline_keyboard',
      jsonb_build_array(jsonb_build_array(jsonb_build_object('text', private.tg_t('open', p_lang), 'url', coalesce(v_site, 'https://investage.vercel.app') || p_path)))));
  end if;
  perform net.http_post(url := 'https://api.telegram.org/bot' || private.tg_token() || '/sendMessage',
                        body := v_body, headers := '{"Content-Type": "application/json"}'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION private.tg_send(p_text text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare cid text;
begin
  select value into cid from private.settings where key = 'telegram_chat_id';
  if cid is null then return; end if;
  perform net.http_post(
    url := 'https://api.telegram.org/bot' || private.tg_token() || '/sendMessage',
    body := jsonb_build_object('chat_id', cid, 'text', p_text, 'disable_web_page_preview', true),
    headers := '{"Content-Type": "application/json"}'::jsonb);
end $function$
;
CREATE OR REPLACE FUNCTION private.tg_t(k text, lang text, a text DEFAULT ''::text, b text DEFAULT ''::text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select replace(replace(coalesce(d -> lang ->> k, d -> 'uz' ->> k, k), '{a}', coalesce(a, '')), '{b}', coalesce(b, ''))
  from (select $j${
   "uz": {
     "open": "Ochish",
     "linked": "✅ Telegram Investage hisobingizga ulandi: {a}\n\nEndi yangi so'rovlar, javoblar, takliflar va xabarlar shu yerga keladi. O'chirish uchun /stop yozing.",
     "bad_code": "Havola eskirgan yoki noto'g'ri. Investage'dagi «Sozlamalar» sahifasidan Telegramni qaytadan ulang.",
     "unlinked": "Telegram xabarnomalari o'chirildi. Qayta ulash uchun Investage'dagi «Sozlamalar» sahifasiga kiring.",
     "welcome": "Assalomu alaykum! Bu — Investage boti.\n\nXabarnomalarni olish uchun saytdagi «Sozlamalar» sahifasida «Telegramni ulash» tugmasini bosing.",
     "help": "Men faqat Investage xabarnomalarini yuboraman. Savol yoki muammo bo'lsa, saytdagi «Yordam va fikr» bo'limiga yozing.",
     "new_request": "🔔 Yangi so'rov\n\n{a} «{b}» startapingizning yopiq ma'lumotlariga kirish so'radi.",
     "approved": "✅ So'rovingiz tasdiqlandi\n\n«{a}» startapi yopiq ma'lumotlarini sizga ochdi.",
     "rejected": "So'rovingiz rad etildi\n\n«{a}» startapi hozircha ma'lumotlarini ochmadi.",
     "offer": "📩 Yangi taklif\n\n«{a}» startapi sizga o'z loyihasini taklif qildi va yopiq ma'lumotlarini ochdi.",
     "new_message": "💬 {a}dan yangi xabar\n\n{b}"
   },
   "ru": {
     "open": "Открыть",
     "linked": "✅ Telegram подключён к аккаунту Investage: {a}\n\nТеперь новые запросы, ответы, предложения и сообщения будут приходить сюда. Чтобы отключить, напишите /stop.",
     "bad_code": "Ссылка устарела или неверна. Подключите Telegram заново на странице «Настройки» в Investage.",
     "unlinked": "Уведомления в Telegram отключены. Чтобы подключить снова, откройте «Настройки» в Investage.",
     "welcome": "Здравствуйте! Это бот Investage.\n\nЧтобы получать уведомления, нажмите «Подключить Telegram» на странице «Настройки» на сайте.",
     "help": "Я отправляю только уведомления Investage. С вопросами пишите в раздел «Помощь и отзывы» на сайте.",
     "new_request": "🔔 Новый запрос\n\n{a} запросил(а) доступ к закрытым данным стартапа «{b}».",
     "approved": "✅ Запрос одобрен\n\nСтартап «{a}» открыл вам закрытые данные.",
     "rejected": "Запрос отклонён\n\nСтартап «{a}» пока не открыл свои данные.",
     "offer": "📩 Новое предложение\n\nСтартап «{a}» предложил вам свой проект и открыл закрытые данные.",
     "new_message": "💬 Новое сообщение от {a}\n\n{b}"
   },
   "en": {
     "open": "Open",
     "linked": "✅ Telegram is now linked to your Investage account: {a}\n\nNew requests, replies, offers and messages will arrive here. Send /stop to turn it off.",
     "bad_code": "This link has expired or is invalid. Please link Telegram again from the Settings page on Investage.",
     "unlinked": "Telegram notifications are turned off. To link again, open Settings on Investage.",
     "welcome": "Hello! This is the Investage bot.\n\nTo get notifications, click “Link Telegram” on the Settings page of the website.",
     "help": "I only send Investage notifications. For questions, use the Help & feedback page on the website.",
     "new_request": "🔔 New request\n\n{a} asked for access to the private details of your startup “{b}”.",
     "approved": "✅ Request approved\n\nThe startup “{a}” has shared its private details with you.",
     "rejected": "Request declined\n\nThe startup “{a}” has not shared its details for now.",
     "offer": "📩 New offer\n\nThe startup “{a}” has pitched its project to you and shared its private details.",
     "new_message": "💬 New message from {a}\n\n{b}"
   }
  }$j$::jsonb d) x
$function$
;
CREATE OR REPLACE FUNCTION private.tg_token()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select decrypted_secret from vault.decrypted_secrets where name = 'telegram_bot_token' limit 1;
$function$
;
CREATE OR REPLACE FUNCTION private.usage_alert()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare u record;
begin
  select * into u from private.usage_numbers();
  if u.db_mb > 400 or u.storage_mb > 820 then
    perform private.tg_send('⚠️ Investage: bepul tarif chegarasiga yaqinlashildi!' || E'\n\n'
      || 'Baza: ' || u.db_mb || ' / 500 MB' || E'\n' || 'Fayllar: ' || u.storage_mb || ' / 1024 MB' || E'\n\n'
      || 'Supabase tarifini oshirish yoki eski fayllarni tozalash kerak.');
  end if;
end $function$
;
CREATE OR REPLACE FUNCTION private.usage_numbers(OUT db_mb numeric, OUT storage_mb numeric)
 RETURNS record
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select round(pg_database_size(current_database()) / 1048576.0, 1),
         round(coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0) / 1048576.0, 1);
$function$
;
CREATE OR REPLACE FUNCTION private.usage_report()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare u record; txt text;
begin
  select * into u from private.usage_numbers();
  txt := '📊 Investage — oylik hisobot' || E'\n\n'
    || '🗄 Baza: ' || u.db_mb || ' MB / 500 MB (' || round(u.db_mb / 5, 0) || '%)' || E'\n'
    || '🖼 Fayllar: ' || u.storage_mb || ' MB / 1024 MB (' || round(u.storage_mb / 10.24, 0) || '%)' || E'\n\n'
    || '👥 Foydalanuvchilar: ' || (select count(*) from profiles where not is_demo)
    || ' (startap: ' || (select count(*) from profiles where role = 'startup' and not is_demo)
    || ', investor: ' || (select count(*) from profiles where role = 'investor' and not is_demo) || ')' || E'\n'
    || '🚀 Haqiqiy startaplar: ' || (select count(*) from startups where not is_demo) || E'\n'
    || '📨 Kirish so''rovlari (30 kun): ' || (select count(*) from access_requests where created_at > now() - interval '30 days') || E'\n'
    || '💬 Murojaatlar (30 kun): ' || (select count(*) from feedback where created_at > now() - interval '30 days') || E'\n\n'
    || 'Vercel limitlari: vercel.com → investage → Usage';
  perform private.tg_send(txt);
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_agent_add(p_items jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_agent_decide(p_id uuid, p_decision text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  if p_decision not in ('approved', 'dismissed') then raise exception 'noto''g''ri qaror'; end if;
  update public.agent_proposals
    set status = p_decision, decided_by = auth.uid(), decided_at = now()
    where id = p_id and status = 'pending';
  if not found then raise exception 'taklif topilmadi yoki allaqachon ko''rilgan'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_agent_list(p_status text DEFAULT 'pending'::text, p_limit integer DEFAULT 50)
 RETURNS SETOF agent_proposals
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select * from public.agent_proposals
    where (coalesce(p_status, '') = '' or status = p_status)
    order by case severity when 'high' then 0 when 'medium' then 1 else 2 end, created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200);
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_feedback(p_status text DEFAULT ''::text, p_limit integer DEFAULT 25, p_offset integer DEFAULT 0)
 RETURNS TABLE(total bigint, id uuid, kind text, name text, email text, message text, page text, status text, created_at timestamp with time zone, user_id uuid)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  perform private.admin_guard();
  return query
    select count(*) over (), f.id, f.kind, f.name, f.email, f.message, f.page, f.status, f.created_at, f.user_id
    from public.feedback f
    where coalesce(p_status, '') = '' or f.status = p_status
    order by (f.status = 'done') asc, f.created_at desc
    limit greatest(1, least(coalesce(p_limit, 25), 100)) offset greatest(0, coalesce(p_offset, 0));
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_log(p_limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, admin_email text, action text, target text, detail jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  perform private.admin_guard();
  return query select a.id, a.admin_email, a.action, a.target, a.detail, a.created_at
    from public.admin_actions a order by a.created_at desc limit greatest(1, least(coalesce(p_limit, 20), 100));
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_overview()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r jsonb;
begin
  perform private.admin_guard();
  select jsonb_build_object(
    'users',            (select count(*) from public.profiles where not is_demo),
    'startup_users',    (select count(*) from public.profiles where not is_demo and role = 'startup'),
    'investor_users',   (select count(*) from public.profiles where not is_demo and role = 'investor'),
    'users_7d',         (select count(*) from public.profiles where not is_demo and created_at > now() - interval '7 days'),
    'users_30d',        (select count(*) from public.profiles where not is_demo and created_at > now() - interval '30 days'),
    'startups',         (select count(*) from public.startups where not is_demo),
    'startups_verified',(select count(*) from public.startups where not is_demo and verified),
    'startups_hidden',  (select count(*) from public.startups where not is_demo and hidden),
    'demo_startups',    (select count(*) from public.startups where is_demo),
    'demo_investors',   (select count(*) from public.profiles where is_demo and role = 'investor'),
    'req_pending',      (select count(*) from public.access_requests ar join public.startups s on s.id = ar.startup_id where not s.is_demo and ar.status = 'pending'),
    'req_approved',     (select count(*) from public.access_requests ar join public.startups s on s.id = ar.startup_id where not s.is_demo and ar.status = 'approved'),
    'req_rejected',     (select count(*) from public.access_requests ar join public.startups s on s.id = ar.startup_id where not s.is_demo and ar.status in ('rejected','revoked')),
    'messages',         (select count(*) from public.messages m join public.access_requests ar on ar.id = m.request_id join public.startups s on s.id = ar.startup_id where not s.is_demo),
    'documents',        (select count(*) from public.startup_documents d join public.startups s on s.id = d.startup_id where not s.is_demo),
    'feedback_new',     (select count(*) from public.feedback where status = 'new'),
    'feedback_total',   (select count(*) from public.feedback)
  ) into r;
  return r;
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_set_feedback(p_id uuid, p_status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  perform private.admin_guard();
  if p_status not in ('new', 'seen', 'done') then raise exception 'Holat noto''g''ri'; end if;
  update public.feedback set status = p_status where id = p_id;
  if not found then raise exception 'Murojaat topilmadi'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_set_startup(p_id uuid, p_verified boolean DEFAULT NULL::boolean, p_hidden boolean DEFAULT NULL::boolean, p_score integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare old public.startups%rowtype; v_email text;
begin
  perform private.admin_guard();
  if p_score is not null and (p_score < 0 or p_score > 100) then raise exception 'Ball 0 dan 100 gacha bo''lishi kerak'; end if;
  select * into old from public.startups where id = p_id;
  if not found then raise exception 'Startap topilmadi'; end if;
  update public.startups set
    verified = coalesce(p_verified, verified),
    hidden   = coalesce(p_hidden, hidden),
    score    = coalesce(p_score, score),
    updated_at = now()
  where id = p_id;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.admin_actions (admin_id, admin_email, action, target, detail)
  values (auth.uid(), v_email, 'startup_update', old.name,
          jsonb_build_object('id', p_id,
            'verified', jsonb_build_array(old.verified, coalesce(p_verified, old.verified)),
            'hidden',   jsonb_build_array(old.hidden,   coalesce(p_hidden,   old.hidden)),
            'score',    jsonb_build_array(old.score,    coalesce(p_score,    old.score))));
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_startups(p_q text DEFAULT ''::text, p_filter text DEFAULT ''::text, p_limit integer DEFAULT 25, p_offset integer DEFAULT 0)
 RETURNS TABLE(total bigint, id uuid, name text, sector text, stage text, score integer, verified boolean, hidden boolean, is_demo boolean, created_at timestamp with time zone, owner_name text, owner_email text, requests bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare q text := '%' || lower(btrim(coalesce(p_q, ''))) || '%';
begin
  perform private.admin_guard();
  return query
    select count(*) over (), s.id, s.name, s.sector, s.stage, s.score, s.verified, s.hidden, s.is_demo, s.created_at,
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
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_survey_list(p_kind text DEFAULT ''::text, p_limit integer DEFAULT 500)
 RETURNS SETOF survey_responses
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select * from public.survey_responses
    where (coalesce(p_kind, '') = '' or kind = p_kind)
    order by created_at desc
    limit least(greatest(coalesce(p_limit, 500), 1), 1000);
end $function$
;
CREATE OR REPLACE FUNCTION public.admin_users(p_q text DEFAULT ''::text, p_role text DEFAULT ''::text, p_limit integer DEFAULT 25, p_offset integer DEFAULT 0)
 RETURNS TABLE(total bigint, id uuid, full_name text, email text, role text, company text, created_at timestamp with time zone, is_demo boolean, startup_id uuid, startup_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare q text := '%' || lower(btrim(coalesce(p_q, ''))) || '%';
begin
  perform private.admin_guard();
  return query
    select count(*) over (), p.id, p.full_name, p.email, p.role, p.company, p.created_at, p.is_demo, s.id, s.name
    from public.profiles p
    left join public.startups s on s.owner_id = p.id
    where (coalesce(p_role, '') = '' or p.role = p_role)
      and (btrim(coalesce(p_q, '')) = '' or lower(coalesce(p.full_name, '')) like q or lower(coalesce(p.email, '')) like q or lower(coalesce(p.company, '')) like q or lower(coalesce(s.name, '')) like q)
    order by p.created_at desc
    limit greatest(1, least(coalesce(p_limit, 25), 100)) offset greatest(0, coalesce(p_offset, 0));
end $function$
;
CREATE OR REPLACE FUNCTION public.bot_take(p_bucket text, p_audience text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_day date := (now() at time zone 'Asia/Tashkent')::date;
  v_limit int := case when p_audience = 'guest' then 12 else 40 end;
  v_site_limit int := 400;
  v_calls int;
  v_site int;
begin
  if p_bucket is null or btrim(p_bucket) = '' then raise exception 'Noto''g''ri so''rov'; end if;
  if p_audience not in ('guest', 'startup', 'investor') then raise exception 'Noto''g''ri so''rov'; end if;

  select coalesce(sum(calls), 0) into v_site from public.bot_usage where day = v_day;
  if v_site >= v_site_limit then
    return jsonb_build_object('ok', false, 'reason', 'site', 'left', 0);
  end if;

  insert into public.bot_usage (bucket, day, audience, calls)
  values (left(p_bucket, 120), v_day, p_audience, 1)
  on conflict (bucket, day) do update set calls = public.bot_usage.calls + 1, audience = excluded.audience
  returning calls into v_calls;

  if v_calls > v_limit then
    return jsonb_build_object('ok', false, 'reason', 'user', 'left', 0);
  end if;
  return jsonb_build_object('ok', true, 'left', v_limit - v_calls);
end $function$
;
CREATE OR REPLACE FUNCTION public.decide_request(p_request uuid, p_approve boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.access_requests
     set status = case when p_approve then 'approved' else 'rejected' end,
         decided_at = now()
   where id = p_request and status = 'pending' and private.owns_startup(startup_id);
  if not found then raise exception 'So''rov topilmadi yoki allaqachon ko''rib chiqilgan'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.decline_offer(p_request uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.access_requests set status = 'rejected', decided_at = now()
   where id = p_request and investor_id = auth.uid() and initiated_by = 'startup' and status = 'approved';
  if not found then raise exception 'Taklif topilmadi'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.delete_my_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  delete from auth.users where id = auth.uid();
end $function$
;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' = 'startup' then 'startup' else 'investor' end,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.investor_directory()
 RETURNS TABLE(id uuid, full_name text, company text, city text, interests text, bio text, is_demo boolean, investor_type text, check_min numeric, check_max numeric, stages text[], experience_years integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p.id, p.full_name, p.company, p.city, p.interests, p.bio, p.is_demo,
         p.investor_type, p.check_min, p.check_max, p.stages, p.experience_years
  from public.profiles p
  where p.role = 'investor' and p.public_profile = true and auth.uid() is not null
  order by p.is_demo asc, p.created_at desc;
$function$
;
CREATE OR REPLACE FUNCTION public.investor_profile(p_id uuid)
 RETURNS TABLE(id uuid, full_name text, company text, city text, interests text, bio text, is_demo boolean, investor_type text, check_min numeric, check_max numeric, stages text[], experience_years integer, portfolio text, website text, linkedin text, telegram text, email text, contacts_visible boolean, member_since timestamp with time zone, requests_total bigint, requests_approved bigint, last_active timestamp with time zone, requested_my_startup text, is_me boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  me uuid := auth.uid();
  rel text;
  p public.profiles%rowtype;
  show_contacts boolean;
begin
  if me is null then return; end if;
  select * into p from public.profiles where profiles.id = p_id and role = 'investor';
  if not found then return; end if;
  select ar.status into rel from public.access_requests ar join public.startups s on s.id = ar.startup_id
    where ar.investor_id = p_id and s.owner_id = me order by ar.created_at desc limit 1;
  if not (p.id = me or p.public_profile or rel is not null) then return; end if;
  show_contacts := p.id = me or p.public_contacts or rel is not null;
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
end $function$
;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select private.is_admin(); $function$
;
CREATE OR REPLACE FUNCTION public.mark_chat_read(p_request uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  update public.messages set read_at = now()
   where request_id = p_request and sender_id <> auth.uid() and read_at is null and private.chat_member(p_request)
$function$
;
CREATE OR REPLACE FUNCTION public.my_conversations()
 RETURNS TABLE(request_id uuid, status text, initiated_by text, startup_id uuid, startup_name text, startup_logo text, startup_owner uuid, investor_id uuid, investor_name text, investor_company text, last_body text, last_at timestamp with time zone, last_mine boolean, unread integer, is_demo boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select r.id, r.status, r.initiated_by, s.id, s.name, s.logo_url, s.owner_id, r.investor_id, p.full_name, p.company,
         lm.body, coalesce(lm.created_at, r.decided_at, r.created_at), lm.sender_id = auth.uid(),
         (select count(*)::int from public.messages m where m.request_id = r.id and m.sender_id <> auth.uid() and m.read_at is null),
         s.is_demo
    from public.access_requests r
    join public.startups s on s.id = r.startup_id
    join public.profiles p on p.id = r.investor_id
    left join lateral (select m.body, m.created_at, m.sender_id from public.messages m
                        where m.request_id = r.id order by m.created_at desc limit 1) lm on true
   where (r.investor_id = auth.uid() or s.owner_id = auth.uid())
     and (r.status = 'approved' or lm.body is not null)
   order by 12 desc
$function$
;
CREATE OR REPLACE FUNCTION public.offer_to_investor(p_investor uuid, p_message text DEFAULT ''::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_sid uuid; v_status text; v_today int; v_id uuid; v_msg text := btrim(left(coalesce(p_message, ''), 1000));
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  if coalesce(private.my_role(), '') <> 'startup' then raise exception 'Faqat startaplar taklif yubora oladi'; end if;
  select id into v_sid from public.startups where owner_id = auth.uid();
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
end $function$
;
CREATE OR REPLACE FUNCTION public.platform_stats()
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select json_build_object(
    'startups',  (select count(*) from public.startups where hidden = false),
    'verified',  (select count(*) from public.startups where hidden = false and verified = true),
    'investors', (select count(*) from public.profiles where role = 'investor'),
    'approved',  (select count(*) from public.access_requests where status = 'approved')
  );
$function$
;
CREATE OR REPLACE FUNCTION public.request_access(p_startup uuid, p_message text DEFAULT ''::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
end $function$
;
CREATE OR REPLACE FUNCTION public.revoke_access(p_request uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.access_requests
     set status = 'revoked', decided_at = now()
   where id = p_request and status = 'approved' and private.owns_startup(startup_id);
  if not found then raise exception 'Faol ruxsat topilmadi'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.startup_doc_count(p_startup uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select count(*)::int from public.startup_documents d join public.startups s on s.id = d.startup_id
   where d.startup_id = p_startup and s.hidden = false
$function$
;
CREATE OR REPLACE FUNCTION public.submit_survey(p_kind text, p_answers jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_kind not in ('startup', 'investor') then raise exception 'noto''g''ri tur'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then raise exception 'noto''g''ri javob'; end if;
  if octet_length(p_answers::text) > 12000 then raise exception 'javob juda katta'; end if;
  if coalesce(p_answers->>'consent', '') <> 'true' then raise exception 'rozilik kerak'; end if;
  if (select count(*) from public.survey_responses where created_at > now() - interval '1 hour') >= 300 then
    raise exception 'juda ko''p so''rov, keyinroq urinib ko''ring';
  end if;
  insert into public.survey_responses (kind, answers) values (p_kind, p_answers);
end $function$
;
CREATE OR REPLACE FUNCTION public.tg_link_code(p_lang text DEFAULT 'uz'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare v_code text;
begin
  if auth.uid() is null then raise exception 'Avval tizimga kiring'; end if;
  delete from private.tg_codes where user_id = auth.uid() or created_at < now() - interval '1 day';
  v_code := encode(extensions.gen_random_bytes(12), 'hex');
  insert into private.tg_codes(code, user_id, lang)
  values (v_code, auth.uid(), case when p_lang in ('uz','ru','en') then p_lang else 'uz' end);
  return v_code;
end $function$
;
CREATE OR REPLACE FUNCTION public.tg_status()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce((select jsonb_build_object('linked', true, 'username', username, 'linked_at', linked_at)
                     from private.tg_chats where user_id = auth.uid()), '{"linked": false}'::jsonb)
$function$
;
CREATE OR REPLACE FUNCTION public.tg_unlink()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_chat bigint; v_lang text;
begin
  delete from private.tg_chats where user_id = auth.uid() returning chat_id, lang into v_chat, v_lang;
  if v_chat is not null then perform private.tg_reply(v_chat, private.tg_t('unlinked', v_lang)); end if;
exception when others then null;
end $function$
;
CREATE OR REPLACE FUNCTION public.tg_webhook(p_secret text, p_update jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare v_secret text; v_msg jsonb; v_chat bigint; v_txt text; v_code text; v_lang text; v_uname text; rec record;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'telegram_webhook_secret' limit 1;
  if v_secret is null or p_secret is distinct from v_secret then return; end if;
  v_msg := p_update -> 'message';
  if v_msg is null or coalesce(v_msg -> 'chat' ->> 'type', '') <> 'private' then return; end if;
  v_chat := (v_msg -> 'chat' ->> 'id')::bigint;
  v_txt := btrim(coalesce(v_msg ->> 'text', ''));
  v_uname := coalesce(v_msg -> 'from' ->> 'username', '');
  v_lang := case when coalesce(v_msg -> 'from' ->> 'language_code', '') like 'ru%' then 'ru'
                 when coalesce(v_msg -> 'from' ->> 'language_code', '') like 'en%' then 'en' else 'uz' end;

  if v_txt ~ '^/start\s+[0-9a-f]{24}$' then
    v_code := substring(v_txt from '[0-9a-f]{24}$');
    select c.user_id, c.lang, p.full_name into rec
      from private.tg_codes c join public.profiles p on p.id = c.user_id
     where c.code = v_code and c.created_at > now() - interval '1 day';
    if found then
      delete from private.tg_chats where chat_id = v_chat or user_id = rec.user_id;
      insert into private.tg_chats(user_id, chat_id, username, lang) values (rec.user_id, v_chat, v_uname, rec.lang);
      delete from private.tg_codes where user_id = rec.user_id;
      perform private.tg_reply(v_chat, private.tg_t('linked', rec.lang, coalesce(nullif(rec.full_name, ''), v_uname)), '/kabinet', rec.lang);
    else
      perform private.tg_reply(v_chat, private.tg_t('bad_code', v_lang), '/kabinet/sozlamalar', v_lang);
    end if;
  elsif v_txt ~ '^/stop' then
    select lang into v_lang from private.tg_chats where chat_id = v_chat;
    delete from private.tg_chats where chat_id = v_chat;
    perform private.tg_reply(v_chat, private.tg_t('unlinked', coalesce(v_lang, 'uz')));
  elsif v_txt ~ '^/start' then
    perform private.tg_reply(v_chat, private.tg_t('welcome', v_lang), '/kabinet/sozlamalar', v_lang);
  else
    perform private.tg_reply(v_chat, private.tg_t('help', v_lang), '/yordam', v_lang);
  end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.unread_messages()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select count(*)::int from public.messages m
    join public.access_requests r on r.id = m.request_id
    join public.startups s on s.id = r.startup_id
   where (r.investor_id = auth.uid() or s.owner_id = auth.uid())
     and m.sender_id <> auth.uid() and m.read_at is null
$function$
;
CREATE OR REPLACE FUNCTION public.withdraw_request(p_request uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  delete from public.access_requests
   where id = p_request and investor_id = auth.uid() and status = 'pending';
  if not found then raise exception 'Kutilayotgan so''rov topilmadi'; end if;
end $function$
;

-- TRIGGERS

CREATE TRIGGER access_requests_demo_auto BEFORE INSERT OR UPDATE OF status ON public.access_requests FOR EACH ROW EXECUTE FUNCTION private.demo_auto_approve();
CREATE TRIGGER access_requests_notify AFTER INSERT OR UPDATE OF status ON public.access_requests FOR EACH ROW EXECUTE FUNCTION private.request_notify();
CREATE TRIGGER feedback_telegram AFTER INSERT ON public.feedback FOR EACH ROW EXECUTE FUNCTION private.feedback_notify();
CREATE TRIGGER messages_demo_reply AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION private.demo_chat_reply();
CREATE TRIGGER messages_notify AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION private.message_notify();
CREATE TRIGGER startup_documents_limit BEFORE INSERT ON public.startup_documents FOR EACH ROW EXECUTE FUNCTION private.docs_limit();
