begin;

-- Retire profile-photo uploads if the earlier avatar setup was applied.
-- Existing files and legacy profile URLs are preserved, but unused by the app.
drop policy if exists avatars_public_read on storage.objects;
drop policy if exists avatars_owner_insert on storage.objects;
drop policy if exists avatars_owner_update on storage.objects;
drop policy if exists avatars_owner_delete on storage.objects;

update storage.buckets set public = false where id = 'avatars';

commit;
