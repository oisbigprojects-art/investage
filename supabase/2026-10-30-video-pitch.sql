-- Video pitch: har startapda bitta ommaviy video (mp4, webm yoki mov, 50 MB gacha).
-- Fayl egasining papkasida turadi, almashtirish vaqtida vaqtincha 2 ta bo'lishi mumkin.

alter table public.startups add column if not exists video_url text;
alter table public.startups drop constraint if exists startups_video_url_check;
alter table public.startups add constraint startups_video_url_check
  check (video_url is null or video_url like 'https://fuklumjbymmkaflzndxp.supabase.co/storage/v1/object/public/videos/%');
grant update (video_url) on public.startups to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.video_slots_ok()
returns boolean
language sql
stable security definer
set search_path to ''
as $function$
  select count(*) < 2 from storage.objects o
  where o.bucket_id = 'videos' and split_part(o.name, '/', 1) = auth.uid()::text;
$function$;

drop policy if exists videos_insert on storage.objects;
create policy videos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and (storage.foldername(name))[1] = (select auth.uid())::text
              and private.my_role() = 'startup' and private.video_slots_ok());
drop policy if exists videos_select on storage.objects;
create policy videos_select on storage.objects for select to authenticated
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists videos_delete on storage.objects;
create policy videos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = (select auth.uid())::text);
