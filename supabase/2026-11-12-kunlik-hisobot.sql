-- Kunlik hisobot: har kuni 09:00 da (Toshkent) egasining Telegram'iga kechagi kun raqamlari yuboriladi.
-- Mavjud private.tg_send() ishlatiladi (bot tokeni Vault'da, qabul qiluvchi private.settings 'telegram_chat_id'),
-- shuning uchun yangi kalit yoki tashqi xizmat kerak emas. Namunaviy (demo) yozuvlar hisobga olinmaydi.
-- Xabarda shaxsiy ma'lumot yo'q: faqat sonlar va yangi startaplarning ochiq nomlari.
-- Ishga tushirish: Supabase → SQL Editor → shu faylni to'liq qo'yib, Run. Oxirgi qator birinchi hisobotni darhol yuboradi.

create or replace function private.daily_report()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  d date := (now() at time zone 'Asia/Tashkent')::date - 1;          -- kecha (Toshkent sanasi)
  f timestamptz := d::timestamp at time zone 'Asia/Tashkent';        -- kecha 00:00
  t timestamptz := (d + 1)::timestamp at time zone 'Asia/Tashkent';  -- bugun 00:00
  w timestamptz := t - interval '7 days';
  n_st bigint; n_inv bigint; n_su bigint; n_req bigint; n_ok bigint; n_no bigint;
  n_msg bigint; n_saved bigint; n_fb bigint; n_sv bigint; n_bot bigint;
  w_u bigint; w_su bigint; w_req bigint;
  a_st bigint; a_inv bigint; a_su bigint;
  p_fb bigint; p_ver bigint; p_prop bigint; p_old bigint;
  names text; todo text := ''; txt text;
begin
  -- Kecha
  select count(*) filter (where role = 'startup'), count(*) filter (where role = 'investor')
    into n_st, n_inv from profiles where not is_demo and created_at >= f and created_at < t;
  select count(*), string_agg(left(name, 40), ', ' order by created_at)
    into n_su, names from startups where not is_demo and created_at >= f and created_at < t;
  select count(*) into n_req from access_requests where created_at >= f and created_at < t;
  select count(*) filter (where status = 'approved'), count(*) filter (where status = 'rejected')
    into n_ok, n_no from access_requests where decided_at >= f and decided_at < t;
  select count(*) into n_msg from messages where created_at >= f and created_at < t;
  select count(*) into n_saved from saved_startups where created_at >= f and created_at < t;
  select count(*) into n_fb from feedback where created_at >= f and created_at < t;
  select count(*) into n_sv from survey_responses where created_at >= f and created_at < t;
  select coalesce(sum(calls), 0) into n_bot from bot_usage where day = d;

  -- Oxirgi 7 kun (kecha bilan birga)
  select count(*) into w_u from profiles where not is_demo and created_at >= w and created_at < t;
  select count(*) into w_su from startups where not is_demo and created_at >= w and created_at < t;
  select count(*) into w_req from access_requests where created_at >= w and created_at < t;

  -- Jami
  select count(*) filter (where role = 'startup'), count(*) filter (where role = 'investor')
    into a_st, a_inv from profiles where not is_demo;
  select count(*) into a_su from startups where not is_demo;

  -- Egadan kutilayotgan ishlar
  select count(*) into p_fb from feedback where status = 'new';
  select count(*) into p_ver from startups where not is_demo and not hidden and not verified and listed;
  select count(*) into p_prop from agent_proposals where status = 'pending';
  select count(*) into p_old from access_requests where status = 'pending' and created_at < now() - interval '3 days';

  if p_fb > 0 then todo := todo || '• ' || p_fb || ' ta yangi murojaat → investage.uz/admin/murojaatlar' || E'\n'; end if;
  if p_ver > 0 then todo := todo || '• ' || p_ver || ' ta tasdiqlanmagan startap → investage.uz/admin/startaplar' || E'\n'; end if;
  if p_prop > 0 then todo := todo || '• ' || p_prop || ' ta agent taklifi → investage.uz/admin/agent' || E'\n'; end if;
  if p_old > 0 then todo := todo || '• ' || p_old || ' ta so''rov 3 kundan beri javobsiz' || E'\n'; end if;
  if todo = '' then todo := '✅ Kutilayotgan ish yo''q' || E'\n'; end if;

  txt := '📅 Investage — kunlik hisobot (' || to_char(d, 'DD.MM.YYYY') || ')' || E'\n\n'
    || 'KECHA' || E'\n'
    || '👥 Yangi foydalanuvchi: ' || (n_st + n_inv) || ' (startap ' || n_st || ', investor ' || n_inv || ')' || E'\n'
    || '🚀 Yangi startap: ' || n_su || coalesce(' — ' || names, '') || E'\n'
    || '📨 So''rovlar: ' || n_req || ' yangi, ' || n_ok || ' tasdiqlandi, ' || n_no || ' rad etildi' || E'\n'
    || '💬 Yozishmalar: ' || n_msg || ' xabar' || E'\n'
    || '🔖 Saqlangan startaplar: ' || n_saved || E'\n'
    || '🆘 Murojaatlar: ' || n_fb || E'\n'
    || '🤖 Yordamchi botga savollar: ' || n_bot || E'\n'
    || '📝 So''rovnoma javoblari: ' || n_sv || E'\n\n'
    || 'OXIRGI 7 KUN' || E'\n'
    || '👥 ' || w_u || ' foydalanuvchi, 🚀 ' || w_su || ' startap, 📨 ' || w_req || ' so''rov' || E'\n\n'
    || 'JAMI' || E'\n'
    || '👥 ' || (a_st + a_inv) || ' foydalanuvchi (startap ' || a_st || ', investor ' || a_inv || '), 🚀 ' || a_su || ' startap' || E'\n\n'
    || 'SIZDAN KUTILMOQDA' || E'\n'
    || todo;

  perform private.tg_send(left(txt, 4000));
end $function$;

-- Tashqaridan chaqirib bo'lmaydi: faqat jadval (pg_cron) va SQL Editor
revoke all on function private.daily_report() from public, anon, authenticated;

-- Jadval: har kuni 04:00 UTC = 09:00 Toshkent. Qayta ishga tushirilsa, eski jadval almashtiriladi.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'investage-daily-report') then
    perform cron.unschedule('investage-daily-report');
  end if;
  perform cron.schedule('investage-daily-report', '0 4 * * *', 'select private.daily_report()');
end $$;

-- Sinov: birinchi hisobot darhol yuboriladi
select private.daily_report();
