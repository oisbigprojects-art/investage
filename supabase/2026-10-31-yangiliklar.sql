-- Sayt yangiliklari: admin yozadi, hamma o'qiydi. Kirgan foydalanuvchilarga bildirishnoma bo'lib ham chiqadi.

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 3 and 140),
  body text not null check (char_length(btrim(body)) between 10 and 6000),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists news_published_idx on public.news (published_at desc);

alter table public.news enable row level security;
drop policy if exists news_select on public.news;
create policy news_select on public.news for select to anon, authenticated using (true);
revoke all on public.news from anon, authenticated;
grant select on public.news to anon, authenticated;

create or replace function public.admin_news_save(p_id uuid, p_title text, p_body text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare v_id uuid; v_email text;
begin
  perform private.admin_guard();
  if p_id is null then
    insert into public.news (title, body) values (btrim(p_title), btrim(p_body)) returning id into v_id;
  else
    update public.news set title = btrim(p_title), body = btrim(p_body), updated_at = now() where id = p_id returning id into v_id;
    if v_id is null then raise exception 'Yangilik topilmadi'; end if;
  end if;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.admin_actions (admin_id, admin_email, action, target, detail)
  values (auth.uid(), v_email, 'news_save', left(btrim(p_title), 120), jsonb_build_object('id', v_id));
  return v_id;
end $function$;

create or replace function public.admin_news_delete(p_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare v_title text; v_email text;
begin
  perform private.admin_guard();
  delete from public.news where id = p_id returning title into v_title;
  if v_title is null then raise exception 'Yangilik topilmadi'; end if;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.admin_actions (admin_id, admin_email, action, target, detail)
  values (auth.uid(), v_email, 'news_delete', left(v_title, 120), jsonb_build_object('id', p_id));
end $function$;

revoke all on function public.admin_news_save(uuid, text, text) from public, anon;
grant execute on function public.admin_news_save(uuid, text, text) to authenticated;
revoke all on function public.admin_news_delete(uuid) from public, anon;
grant execute on function public.admin_news_delete(uuid) to authenticated;

insert into public.news (title, body)
select 'Investage yangilandi: video pitch va Google bilan kirish',
       E'Startaplar endi kabinetda o''z loyihasi haqida video joylashi mumkin: investorlar uni startap sahifasida ko''radi.\n\nRo''yxatdan o''tish ham osonlashdi: Google hisobingiz bilan bir bosishda kirishingiz mumkin. Investorlar katalogiga tur va bosqich bo''yicha filtrlar qo''shildi.'
where not exists (select 1 from public.news);
