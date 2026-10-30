-- Admin noo'rin video pitchni o'chira oladi: fayl va startapdagi havola birga o'chadi, amal jurnalga yoziladi.

drop policy if exists videos_delete on storage.objects;
create policy videos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin()));

-- Eski manzilni qaytaradi: yashirilgan startap qatorini admin o'qiy olmasligi mumkin, fayl esa o'chishi kerak
create or replace function public.admin_clear_video(p_startup uuid)
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare v_email text; v_name text; v_url text;
begin
  perform private.admin_guard();
  select name, video_url into v_name, v_url from public.startups where id = p_startup;
  if not found then raise exception 'Startap topilmadi'; end if;
  update public.startups set video_url = null, updated_at = now() where id = p_startup;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.admin_actions (admin_id, admin_email, action, target, detail)
  values (auth.uid(), v_email, 'video_remove', v_name, jsonb_build_object('id', p_startup));
  return v_url;
end $function$;

revoke all on function public.admin_clear_video(uuid) from public, anon;
grant execute on function public.admin_clear_video(uuid) to authenticated;

-- Foydalanuvchi sahifasiga startap videosi qo'shiladi
create or replace function public.admin_user_detail(p_id uuid)
returns jsonb
language plpgsql
stable security definer
set search_path to ''
as $function$
declare v jsonb;
begin
  perform private.admin_guard();
  select jsonb_build_object(
    'id', p.id, 'full_name', p.full_name, 'email', p.email, 'role', p.role, 'company', p.company, 'city', p.city,
    'is_demo', p.is_demo, 'created_at', p.created_at,
    'confirmed', u.email_confirmed_at is not null,
    'last_sign_in_at', u.last_sign_in_at,
    'blocked', u.banned_until is not null and u.banned_until > now(),
    'mfa', exists (select 1 from auth.mfa_factors f where f.user_id = p.id and f.status = 'verified'),
    'is_admin', exists (select 1 from private.admin_ids a where a.user_id = p.id),
    'requests', (select count(*) from public.access_requests r left join public.startups s2 on s2.id = r.startup_id
                 where r.investor_id = p.id or s2.owner_id = p.id),
    'startup', (select jsonb_build_object('id', s.id, 'name', s.name, 'verified', s.verified, 'hidden', s.hidden, 'listed', s.listed, 'score', s.score, 'video_url', s.video_url)
                from public.startups s where s.owner_id = p.id)
  ) into v
  from public.profiles p join auth.users u on u.id = p.id
  where p.id = p_id;
  if v is null then raise exception 'Foydalanuvchi topilmadi'; end if;
  return v;
end $function$;
