-- 2026-10-26: Telegram bot 2-versiya.
-- 1-bosqich: o'zbekcha standart til + til tanlash, asosiy menyu (tugmalar, statistika), buyruqlar menyusi, HTML formatlash.
-- 2-bosqich: yangi so'rovni Telegram'dan tasdiqlash / rad etish, chat xabariga Telegram'dan javob berish.
-- Edge Function (supabase/functions/tg-webhook) o'zgarmaydi: u butun update'ni tg_webhook ga uzatadi.

begin;

-- Bot tugmalaridagi havolalar asosiy domenga
insert into private.settings (key, value) values ('site_url', 'https://investage.uz')
  on conflict (key) do update set value = excluded.value;

-- Hisobini ulamagan chatlar ham tanlagan tilini eslab qoladi
create table if not exists private.tg_prefs (
  chat_id bigint primary key,
  lang text not null default 'uz' check (lang in ('uz', 'ru', 'en')),
  updated_at timestamptz not null default now()
);
alter table private.tg_prefs enable row level security;

-- ============ Yordamchi funksiyalar ============
create or replace function private.tg_esc(t text)
returns text language sql immutable set search_path = '' as $$
  select replace(replace(replace(coalesce(t, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;')
$$;

create or replace function private.tg_api(p_method text, p_body jsonb)
returns void language plpgsql security definer set search_path = 'public', 'extensions' as $$
begin
  perform net.http_post(url := 'https://api.telegram.org/bot' || private.tg_token() || '/' || p_method,
                        body := p_body, headers := '{"Content-Type": "application/json"}'::jsonb);
end $$;

create or replace function private.tg_site()
returns text language sql stable security definer set search_path = '' as $$
  select coalesce((select value from private.settings where key = 'site_url'), 'https://investage.uz')
$$;

create or replace function private.tg_url_btn(p_text text, p_path text)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('text', p_text, 'url', private.tg_site() || p_path)
$$;

create or replace function private.tg_cb_btn(p_text text, p_data text)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object('text', p_text, 'callback_data', p_data)
$$;

-- Chat tili: ulangan hisob tili, keyin tanlangan til, aks holda o'zbekcha
create or replace function private.tg_lang(p_chat bigint)
returns text language sql stable security definer set search_path = '' as $$
  select coalesce((select lang from private.tg_chats where chat_id = p_chat),
                  (select lang from private.tg_prefs where chat_id = p_chat), 'uz')
$$;

create or replace function private.tg_msg(p_chat bigint, p_text text, p_keyboard jsonb default null)
returns void language plpgsql security definer set search_path = '' as $$
declare b jsonb := jsonb_build_object('chat_id', p_chat, 'text', left(p_text, 4000), 'parse_mode', 'HTML', 'disable_web_page_preview', true);
begin
  if p_keyboard is not null then b := b || jsonb_build_object('reply_markup', jsonb_build_object('inline_keyboard', p_keyboard)); end if;
  perform private.tg_api('sendMessage', b);
end $$;

create or replace function private.tg_answer(p_id text, p_text text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.tg_api('answerCallbackQuery', jsonb_strip_nulls(jsonb_build_object('callback_query_id', p_id, 'text', p_text)));
end $$;

-- Eski chaqiruvlar uchun (tg_unlink va boshqalar): endi HTML bilan
create or replace function private.tg_reply(p_chat bigint, p_text text, p_path text default null, p_lang text default 'uz')
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.tg_msg(p_chat, p_text,
    case when p_path is not null then jsonb_build_array(jsonb_build_array(private.tg_url_btn(private.tg_t('open', p_lang), p_path))) end);
end $$;

-- ============ Matnlar (uz / ru / en). {a}, {b} avtomatik HTML-escape qilinadi ============
create or replace function private.tg_t(k text, lang text, a text default '', b text default '')
returns text language sql immutable set search_path = '' as $$
  select replace(replace(coalesce(d -> lang ->> k, d -> 'uz' ->> k, k), '{a}', private.tg_esc(a)), '{b}', private.tg_esc(b))
  from (select $j$ {
   "uz": {
     "open": "Ochish",
     "linked": "✅ <b>Telegram ulandi</b>\n\nInvestage hisobi: <b>{a}</b>\n\nEndi yangi so'rovlar, takliflar va xabarlar shu yerga keladi. So'rovlarni shu yerning o'zida tasdiqlashingiz va xabarlarga javob berishingiz mumkin.",
     "bad_code": "⚠️ Havola eskirgan yoki noto'g'ri. Investage'dagi «Sozlamalar» sahifasidan Telegramni qaytadan ulang.",
     "unlinked": "🔕 Telegram xabarnomalari o'chirildi. Qayta ulash uchun Investage'dagi «Sozlamalar» sahifasiga kiring.",
     "welcome": "👋 <b>Investage botiga xush kelibsiz!</b>\n\nInvestage — O'zbekistondagi startaplar va investorlarni bog'laydigan platforma.\n\nHisobingizni ulasangiz, bot:\n• yangi so'rov va takliflarni darhol yuboradi;\n• so'rovni shu yerning o'zida tasdiqlash imkonini beradi;\n• chat xabarlariga shu yerdan javob berishga yordam beradi.",
     "menu": "🏠 <b>{a}</b>, Investage menyusi",
     "stats_startup": "📨 Kutilayotgan so'rovlar: <b>{a}</b>\n💬 O'qilmagan xabarlar: <b>{b}</b>",
     "stats_investor": "⏳ Javob kutayotgan so'rovlaringiz: <b>{a}</b>\n💬 O'qilmagan xabarlar: <b>{b}</b>",
     "lang_set": "✅ Til: O'zbekcha",
     "new_request": "🔔 <b>Yangi so'rov</b>\n\n<b>{a}</b> «{b}» startapingizning yopiq ma'lumotlariga kirishni so'radi.",
     "approved": "✅ <b>So'rovingiz tasdiqlandi</b>\n\n«{a}» startapi yopiq ma'lumotlarini sizga ochdi.",
     "rejected": "So'rovingiz rad etildi\n\n«{a}» startapi hozircha ma'lumotlarini ochmadi.",
     "offer": "📩 <b>Yangi taklif</b>\n\n«{a}» startapi sizga o'z loyihasini taklif qildi va yopiq ma'lumotlarini ochdi.",
     "new_message": "💬 <b>{a}</b>dan yangi xabar\n\n{b}\n\n<i>Javob berish uchun shu xabarga «Reply» qiling.</i>",
     "done_approved": "✅ Tasdiqlandi. Investor xabardor qilindi.",
     "done_rejected": "❌ Rad etildi.",
     "req_gone": "Bu so'rov allaqachon ko'rib chiqilgan.",
     "not_linked": "Avval hisobingizni ulang: Investage → «Sozlamalar» → «Telegramni ulash».",
     "reply_prompt": "✍️ <b>{a}</b>ga javobingizni yozing. Javob saytdagi suhbatga tushadi.",
     "reply_sent": "✅ Javobingiz yuborildi.",
     "reply_closed": "Bu suhbat yopilgan yoki sizga tegishli emas, javob yuborilmadi.",
     "reply_empty": "Hozircha faqat matnli javob yuborish mumkin.",
     "btn_approve": "✅ Tasdiqlash",
     "btn_reject": "❌ Rad etish",
     "btn_reply": "✍️ Javob yozish",
     "btn_open_chat": "💬 Suhbatni ochish",
     "btn_requests": "📨 So'rovlar",
     "btn_my_requests": "📨 So'rovlarim",
     "btn_messages": "💬 Xabarlar",
     "btn_startups": "🚀 Startaplar",
     "btn_cabinet": "🏠 Kabinet",
     "btn_link": "🔗 Hisobni ulash",
     "btn_help": "❓ Yordam",
     "btn_lang": "🌐 Til"
   },
   "ru": {
     "open": "Открыть",
     "linked": "✅ <b>Telegram подключён</b>\n\nАккаунт Investage: <b>{a}</b>\n\nТеперь новые запросы, предложения и сообщения будут приходить сюда. Запросы можно одобрять прямо здесь, а на сообщения — отвечать.",
     "bad_code": "⚠️ Ссылка устарела или неверна. Подключите Telegram заново на странице «Настройки» в Investage.",
     "unlinked": "🔕 Уведомления в Telegram отключены. Чтобы подключить снова, откройте «Настройки» в Investage.",
     "welcome": "👋 <b>Добро пожаловать в бот Investage!</b>\n\nInvestage — платформа, которая соединяет стартапы и инвесторов Узбекистана.\n\nЕсли подключить аккаунт, бот:\n• сразу присылает новые запросы и предложения;\n• позволяет одобрять запросы прямо здесь;\n• помогает отвечать на сообщения чата прямо отсюда.",
     "menu": "🏠 <b>{a}</b>, меню Investage",
     "stats_startup": "📨 Запросы в ожидании: <b>{a}</b>\n💬 Непрочитанные сообщения: <b>{b}</b>",
     "stats_investor": "⏳ Ваши запросы в ожидании ответа: <b>{a}</b>\n💬 Непрочитанные сообщения: <b>{b}</b>",
     "lang_set": "✅ Язык: Русский",
     "new_request": "🔔 <b>Новый запрос</b>\n\n<b>{a}</b> запросил(а) доступ к закрытым данным стартапа «{b}».",
     "approved": "✅ <b>Запрос одобрен</b>\n\nСтартап «{a}» открыл вам закрытые данные.",
     "rejected": "Запрос отклонён\n\nСтартап «{a}» пока не открыл свои данные.",
     "offer": "📩 <b>Новое предложение</b>\n\nСтартап «{a}» предложил вам свой проект и открыл закрытые данные.",
     "new_message": "💬 Новое сообщение от <b>{a}</b>\n\n{b}\n\n<i>Чтобы ответить, сделайте «Reply» на это сообщение.</i>",
     "done_approved": "✅ Одобрено. Инвестор получил уведомление.",
     "done_rejected": "❌ Отклонено.",
     "req_gone": "Этот запрос уже рассмотрен.",
     "not_linked": "Сначала подключите аккаунт: Investage → «Настройки» → «Подключить Telegram».",
     "reply_prompt": "✍️ Напишите ответ для <b>{a}</b>. Он попадёт в чат на сайте.",
     "reply_sent": "✅ Ответ отправлен.",
     "reply_closed": "Этот чат закрыт или не принадлежит вам, ответ не отправлен.",
     "reply_empty": "Пока можно отправлять только текстовые ответы.",
     "btn_approve": "✅ Одобрить",
     "btn_reject": "❌ Отклонить",
     "btn_reply": "✍️ Ответить",
     "btn_open_chat": "💬 Открыть чат",
     "btn_requests": "📨 Запросы",
     "btn_my_requests": "📨 Мои запросы",
     "btn_messages": "💬 Сообщения",
     "btn_startups": "🚀 Стартапы",
     "btn_cabinet": "🏠 Кабинет",
     "btn_link": "🔗 Подключить аккаунт",
     "btn_help": "❓ Помощь",
     "btn_lang": "🌐 Язык"
   },
   "en": {
     "open": "Open",
     "linked": "✅ <b>Telegram linked</b>\n\nInvestage account: <b>{a}</b>\n\nNew requests, offers and messages will arrive here. You can approve requests and reply to messages right here.",
     "bad_code": "⚠️ This link has expired or is invalid. Please link Telegram again from the Settings page on Investage.",
     "unlinked": "🔕 Telegram notifications are turned off. To link again, open Settings on Investage.",
     "welcome": "👋 <b>Welcome to the Investage bot!</b>\n\nInvestage connects startups and investors in Uzbekistan.\n\nOnce you link your account, the bot:\n• sends new requests and offers instantly;\n• lets you approve requests right here;\n• lets you reply to chat messages from here.",
     "menu": "🏠 <b>{a}</b>, Investage menu",
     "stats_startup": "📨 Pending requests: <b>{a}</b>\n💬 Unread messages: <b>{b}</b>",
     "stats_investor": "⏳ Your requests awaiting a reply: <b>{a}</b>\n💬 Unread messages: <b>{b}</b>",
     "lang_set": "✅ Language: English",
     "new_request": "🔔 <b>New request</b>\n\n<b>{a}</b> asked for access to the private details of your startup “{b}”.",
     "approved": "✅ <b>Request approved</b>\n\nThe startup “{a}” has shared its private details with you.",
     "rejected": "Request declined\n\nThe startup “{a}” has not shared its details for now.",
     "offer": "📩 <b>New offer</b>\n\nThe startup “{a}” has pitched its project to you and shared its private details.",
     "new_message": "💬 New message from <b>{a}</b>\n\n{b}\n\n<i>Reply to this message to answer.</i>",
     "done_approved": "✅ Approved. The investor has been notified.",
     "done_rejected": "❌ Declined.",
     "req_gone": "This request has already been handled.",
     "not_linked": "Link your account first: Investage → Settings → Link Telegram.",
     "reply_prompt": "✍️ Write your reply to <b>{a}</b>. It will appear in the chat on the website.",
     "reply_sent": "✅ Your reply has been sent.",
     "reply_closed": "This chat is closed or is not yours, so the reply was not sent.",
     "reply_empty": "Only text replies are supported for now.",
     "btn_approve": "✅ Approve",
     "btn_reject": "❌ Decline",
     "btn_reply": "✍️ Reply",
     "btn_open_chat": "💬 Open chat",
     "btn_requests": "📨 Requests",
     "btn_my_requests": "📨 My requests",
     "btn_messages": "💬 Messages",
     "btn_startups": "🚀 Startups",
     "btn_cabinet": "🏠 Dashboard",
     "btn_link": "🔗 Link account",
     "btn_help": "❓ Help",
     "btn_lang": "🌐 Language"
   }
  }$j$::jsonb d) x
$$;

-- ============ Menyu va til tanlash ============
create or replace function private.tg_lang_picker(p_chat bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.tg_msg(p_chat, '🌐 <b>Tilni tanlang · Выберите язык · Choose language</b>',
    jsonb_build_array(jsonb_build_array(private.tg_cb_btn('🇺🇿 O''zbekcha', 'lang:uz'),
                                        private.tg_cb_btn('🇷🇺 Русский', 'lang:ru'),
                                        private.tg_cb_btn('🇬🇧 English', 'lang:en'))));
end $$;

create or replace function private.tg_menu(p_chat bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare v_lang text := private.tg_lang(p_chat); v_uid uuid; v_role text; v_name text; v_pend int; v_unread int; v_text text; v_kb jsonb;
begin
  select c.user_id, p.role, coalesce(nullif(p.full_name, ''), 'Investage') into v_uid, v_role, v_name
    from private.tg_chats c join public.profiles p on p.id = c.user_id where c.chat_id = p_chat;
  if v_uid is null then
    v_text := private.tg_t('welcome', v_lang);
    v_kb := jsonb_build_array(
      jsonb_build_array(private.tg_url_btn(private.tg_t('btn_link', v_lang), '/kabinet/sozlamalar')),
      jsonb_build_array(private.tg_url_btn(private.tg_t('btn_startups', v_lang), '/startaplar'),
                        private.tg_url_btn(private.tg_t('btn_help', v_lang), '/yordam')),
      jsonb_build_array(private.tg_cb_btn(private.tg_t('btn_lang', v_lang), 'lang')));
  else
    select count(*) into v_unread from public.messages m
      join public.access_requests r on r.id = m.request_id join public.startups s on s.id = r.startup_id
     where (r.investor_id = v_uid or s.owner_id = v_uid) and m.sender_id <> v_uid and m.read_at is null;
    if v_role = 'startup' then
      select count(*) into v_pend from public.access_requests r join public.startups s on s.id = r.startup_id
       where s.owner_id = v_uid and r.status = 'pending';
      v_kb := jsonb_build_array(
        jsonb_build_array(private.tg_url_btn(private.tg_t('btn_requests', v_lang), '/kabinet/startap/sorovlar?holat=kutilmoqda'),
                          private.tg_url_btn(private.tg_t('btn_messages', v_lang), '/kabinet/xabarlar')),
        jsonb_build_array(private.tg_url_btn(private.tg_t('btn_cabinet', v_lang), '/kabinet'),
                          private.tg_cb_btn(private.tg_t('btn_lang', v_lang), 'lang')));
    else
      select count(*) into v_pend from public.access_requests where investor_id = v_uid and status = 'pending';
      v_kb := jsonb_build_array(
        jsonb_build_array(private.tg_url_btn(private.tg_t('btn_startups', v_lang), '/startaplar'),
                          private.tg_url_btn(private.tg_t('btn_messages', v_lang), '/kabinet/xabarlar')),
        jsonb_build_array(private.tg_url_btn(private.tg_t('btn_my_requests', v_lang), '/kabinet/investor/sorovlar'),
                          private.tg_cb_btn(private.tg_t('btn_lang', v_lang), 'lang')));
    end if;
    v_text := private.tg_t('menu', v_lang, v_name) || E'\n\n'
           || private.tg_t(case when v_role = 'startup' then 'stats_startup' else 'stats_investor' end, v_lang, v_pend::text, v_unread::text);
  end if;
  perform private.tg_msg(p_chat, v_text, v_kb);
end $$;

-- Suhbatdagi ikkinchi tomon nomi; suhbat ochiq va foydalanuvchiga tegishli bo'lmasa null
create or replace function private.tg_chat_partner(p_rid uuid, p_uid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case when s.owner_id = p_uid then coalesce(nullif(p.full_name, ''), 'Investor') else s.name end
    from public.access_requests r
    join public.startups s on s.id = r.startup_id
    join public.profiles p on p.id = r.investor_id
   where r.id = p_rid and r.status = 'approved' and (r.investor_id = p_uid or s.owner_id = p_uid)
$$;

-- ============ Bildirishnomalar ============
-- Chat xabari bildirishnomasiga "Javob yozish" tugmasi qo'shiladi
create or replace function private.tg_notify(p_user uuid, k text, a text, b text, p_path text)
returns void language plpgsql security definer set search_path = '' as $$
declare c record; v_rid uuid; v_kb jsonb;
begin
  select chat_id, lang into c from private.tg_chats where user_id = p_user;
  if not found then return; end if;
  v_rid := substring(coalesce(p_path, '') from '/kabinet/xabarlar/([0-9a-f-]{36})')::uuid;
  if k = 'new_message' and v_rid is not null then
    v_kb := jsonb_build_array(jsonb_build_array(private.tg_cb_btn(private.tg_t('btn_reply', c.lang), 'rp:' || v_rid),
                                                private.tg_url_btn(private.tg_t('btn_open_chat', c.lang), p_path)));
  elsif p_path is not null then
    v_kb := jsonb_build_array(jsonb_build_array(private.tg_url_btn(private.tg_t('open', c.lang), p_path)));
  end if;
  perform private.tg_msg(c.chat_id, private.tg_t(k, c.lang, a, b), v_kb);
exception when others then null; -- Telegram ishlamasa ham asosiy amal bajariladi
end $$;

-- Yangi so'rov: investor izohi va Tasdiqlash / Rad etish tugmalari bilan
create or replace function private.tg_notify_request(p_owner uuid, p_rid uuid, p_who text, p_name text, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare c record; v_text text;
begin
  select chat_id, lang into c from private.tg_chats where user_id = p_owner;
  if not found then return; end if;
  v_text := private.tg_t('new_request', c.lang, p_who, p_name)
         || case when btrim(coalesce(p_note, '')) <> '' then E'\n\n💬 <i>' || private.tg_esc(left(p_note, 300)) || '</i>' else '' end;
  perform private.tg_msg(c.chat_id, v_text, jsonb_build_array(
    jsonb_build_array(private.tg_cb_btn(private.tg_t('btn_approve', c.lang), 'ap:' || p_rid),
                      private.tg_cb_btn(private.tg_t('btn_reject', c.lang), 'rj:' || p_rid)),
    jsonb_build_array(private.tg_url_btn(private.tg_t('btn_requests', c.lang), '/kabinet/startap/sorovlar?holat=kutilmoqda'))));
exception when others then null;
end $$;

create or replace function private.request_notify()
returns trigger language plpgsql security definer set search_path = 'public' as $$
declare s record; inv record; v_who text;
begin
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then return null; end if;
  select id, name, owner_id into s from public.startups where id = new.startup_id;
  if new.status = 'pending' then
    select full_name, company into inv from public.profiles where id = new.investor_id;
    v_who := coalesce(nullif(inv.full_name, ''), 'Investor') || case when coalesce(inv.company, '') <> '' then ' (' || inv.company || ')' else '' end;
    perform private.tg_notify_request(s.owner_id, new.id, v_who, s.name, new.message);
  elsif new.status = 'approved' and new.initiated_by = 'startup' and (tg_op = 'INSERT' or old.status <> 'pending') then
    perform private.tg_notify(new.investor_id, 'offer', s.name, '', '/startaplar/' || s.id);
  elsif new.status = 'approved' then
    perform private.tg_notify(new.investor_id, 'approved', s.name, '', '/startaplar/' || s.id);
  elsif new.status = 'rejected' and tg_op = 'UPDATE' and old.status = 'pending' then
    perform private.tg_notify(new.investor_id, 'rejected', s.name, '', '/startaplar/' || s.id);
  end if;
  return null;
end $$;

-- ============ Webhook: xabarlar va tugma bosilishi ============
create or replace function public.tg_webhook(p_secret text, p_update jsonb)
returns void language plpgsql security definer set search_path = 'public', 'extensions' as $$
declare
  v_secret text; v_msg jsonb; v_cb jsonb; v_chat bigint; v_txt text; v_code text; v_lang text; v_uname text;
  v_uid uuid; v_rid uuid; v_data text; v_ok boolean; v_res text; v_other text; rec record;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'telegram_webhook_secret' limit 1;
  if v_secret is null or p_secret is distinct from v_secret then return; end if;

  -- ----- Tugma bosildi -----
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
      -- Faqat shu startap egasi va faqat kutilayotgan so'rov (decide_request bilan bir xil shart)
      update public.access_requests r
         set status = case when v_data like 'ap:%' then 'approved' else 'rejected' end, decided_at = now()
       where r.id = v_rid and r.status = 'pending'
         and exists (select 1 from public.startups s where s.id = r.startup_id and s.owner_id = v_uid);
      v_ok := found;
      v_res := private.tg_t(case when not v_ok then 'req_gone' when v_data like 'ap:%' then 'done_approved' else 'done_rejected' end, v_lang);
      perform private.tg_answer(v_cb ->> 'id', v_res);
      -- Tugmalarni olib tashlab, natijani xabar ostiga yozamiz
      perform private.tg_api('editMessageText', jsonb_build_object(
        'chat_id', v_chat, 'message_id', (v_cb -> 'message' ->> 'message_id')::bigint,
        'parse_mode', 'HTML', 'disable_web_page_preview', true,
        'text', left(private.tg_esc(v_cb -> 'message' ->> 'text'), 3800) || E'\n\n<b>' || v_res || '</b>'));

    elsif v_data ~ '^rp:[0-9a-f-]{36}$' then
      v_rid := substr(v_data, 4)::uuid;
      v_other := case when v_uid is not null then private.tg_chat_partner(v_rid, v_uid) end;
      if v_other is null then
        perform private.tg_answer(v_cb ->> 'id', private.tg_t(case when v_uid is null then 'not_linked' else 'reply_closed' end, v_lang));
        return;
      end if;
      perform private.tg_answer(v_cb ->> 'id', null);
      -- Javob shu xabarga "reply" qilinadi; havoladagi suhbat ID si orqali qaysi suhbat ekanini bilamiz
      perform private.tg_api('sendMessage', jsonb_build_object(
        'chat_id', v_chat, 'parse_mode', 'HTML', 'disable_web_page_preview', true,
        'text', private.tg_t('reply_prompt', v_lang, v_other) || E'\n<a href="' || private.tg_site() || '/kabinet/xabarlar/' || v_rid || '">'
                || private.tg_t('btn_open_chat', v_lang) || '</a>',
        'reply_markup', jsonb_build_object('force_reply', true)));

    else
      perform private.tg_answer(v_cb ->> 'id', null);
    end if;
    return;
  end if;

  -- ----- Oddiy xabar -----
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
    -- Birinchi marta kelgan va tilni tanlamagan bo'lsa, avval til so'raladi
    if v_uid is null and not exists (select 1 from private.tg_prefs where chat_id = v_chat) then
      perform private.tg_lang_picker(v_chat);
    else
      perform private.tg_menu(v_chat);
    end if;

  elsif v_msg ? 'reply_to_message' then
    -- Bildirishnomaga yoki "Javob yozish" so'roviga reply: suhbat ID si xabardagi havoladan olinadi
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

  else
    perform private.tg_menu(v_chat);
  end if;
end $$;
revoke execute on function public.tg_webhook(text, jsonb) from public, anon, authenticated;
grant execute on function public.tg_webhook(text, jsonb) to service_role;

-- Ichki funksiyalar tashqaridan chaqirilmasin
revoke all on function private.tg_api(text, jsonb) from public, anon, authenticated;
revoke all on function private.tg_msg(bigint, text, jsonb) from public, anon, authenticated;
revoke all on function private.tg_answer(text, text) from public, anon, authenticated;
revoke all on function private.tg_menu(bigint) from public, anon, authenticated;
revoke all on function private.tg_lang_picker(bigint) from public, anon, authenticated;
revoke all on function private.tg_notify_request(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function private.tg_chat_partner(uuid, uuid) from public, anon, authenticated;

-- ============ Telegram sozlamalari (commit'dan keyin yuboriladi) ============
do $$
begin
  -- Buyruqlar menyusi: standart o'zbekcha, rus va ingliz Telegram uchun alohida
  perform private.tg_api('setMyCommands', jsonb_build_object('commands', jsonb_build_array(
    jsonb_build_object('command', 'menu', 'description', 'Asosiy menyu'),
    jsonb_build_object('command', 'til', 'description', 'Tilni o''zgartirish'),
    jsonb_build_object('command', 'stop', 'description', 'Xabarnomalarni o''chirish'))));
  perform private.tg_api('setMyCommands', jsonb_build_object('language_code', 'ru', 'commands', jsonb_build_array(
    jsonb_build_object('command', 'menu', 'description', 'Главное меню'),
    jsonb_build_object('command', 'til', 'description', 'Сменить язык'),
    jsonb_build_object('command', 'stop', 'description', 'Отключить уведомления'))));
  perform private.tg_api('setMyCommands', jsonb_build_object('language_code', 'en', 'commands', jsonb_build_array(
    jsonb_build_object('command', 'menu', 'description', 'Main menu'),
    jsonb_build_object('command', 'til', 'description', 'Change language'),
    jsonb_build_object('command', 'stop', 'description', 'Turn off notifications'))));
  -- Tugma bosilishi (callback_query) ham webhook'ga kelsin. Maxfiy kalit Vault'dan, o'zgarmaydi.
  perform private.tg_api('setWebhook', jsonb_build_object(
    'url', 'https://fuklumjbymmkaflzndxp.supabase.co/functions/v1/tg-webhook',
    'secret_token', (select decrypted_secret from vault.decrypted_secrets where name = 'telegram_webhook_secret' limit 1),
    'allowed_updates', jsonb_build_array('message', 'callback_query')));
end $$;

commit;
