-- Migration 0004: Storage Buckets & Policies
-- Run AFTER the schema migrations.

-- Create public bucket for post cover images / inline images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Policies on storage.objects for the post-images bucket

-- Anyone can read
create policy "Public read post-images"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- Authenticated users can upload under their own uid prefix
create policy "Auth upload post-images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Only uploader can delete
create policy "Auth delete own post-images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
