insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Blog admins can upload blog images" on storage.objects;
create policy "Blog admins can upload blog images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and (select private.is_blog_admin())
  );

drop policy if exists "Blog admins can update blog images" on storage.objects;
create policy "Blog admins can update blog images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-images'
    and (select private.is_blog_admin())
  )
  with check (
    bucket_id = 'blog-images'
    and (select private.is_blog_admin())
  );

drop policy if exists "Blog admins can delete blog images" on storage.objects;
create policy "Blog admins can delete blog images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-images'
    and (select private.is_blog_admin())
  );
