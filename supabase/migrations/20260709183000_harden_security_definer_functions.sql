-- Keep SECURITY DEFINER helpers internal-only and avoid exposing them as callable RPCs.

create or replace function private.enforce_blog_admin_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
begin
  -- Allow trusted maintenance contexts such as migrations and SQL editor sessions.
  if actor_id is null then
    return coalesce(new, old);
  end if;

  if not exists (
    select 1
    from public.blog_admins
    where user_id = actor_id
  ) then
    raise exception 'Not authorized to manage blog admins'
      using errcode = '42501';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function private.enforce_blog_admin_mutation() from public;
revoke execute on function private.enforce_blog_admin_mutation() from anon, authenticated;

drop trigger if exists blog_admins_enforce_mutation on public.blog_admins;
create trigger blog_admins_enforce_mutation
  before insert or update or delete on public.blog_admins
  for each row execute function private.enforce_blog_admin_mutation();

drop policy if exists "Blog admins can manage blog admins" on public.blog_admins;
drop policy if exists "Blog admins can read their own admin row" on public.blog_admins;
drop policy if exists "Users can read own blog admin row" on public.blog_admins;
drop policy if exists "Authenticated blog admin writes are trigger checked" on public.blog_admins;
drop policy if exists "Authenticated blog admin updates are trigger checked" on public.blog_admins;
drop policy if exists "Authenticated blog admin deletes are trigger checked" on public.blog_admins;
create policy "Users can read own blog admin row"
  on public.blog_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Authenticated blog admin writes are trigger checked"
  on public.blog_admins
  for insert
  to authenticated
  with check (true);

create policy "Authenticated blog admin updates are trigger checked"
  on public.blog_admins
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated blog admin deletes are trigger checked"
  on public.blog_admins
  for delete
  to authenticated
  using (true);

drop policy if exists "Blog admins can manage categories" on public.blog_categories;
create policy "Blog admins can manage categories"
  on public.blog_categories
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can read all blog posts" on public.blog_posts;
create policy "Blog admins can read all blog posts"
  on public.blog_posts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can insert blog posts" on public.blog_posts;
create policy "Blog admins can insert blog posts"
  on public.blog_posts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can update blog posts" on public.blog_posts;
create policy "Blog admins can update blog posts"
  on public.blog_posts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can delete blog posts" on public.blog_posts;
create policy "Blog admins can delete blog posts"
  on public.blog_posts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can read access requests" on public.blog_access_requests;
create policy "Admins can read access requests"
  on public.blog_access_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can update access requests" on public.blog_access_requests;
create policy "Admins can update access requests"
  on public.blog_access_requests
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can insert legal pages" on public.legal_pages;
create policy "Blog admins can insert legal pages"
  on public.legal_pages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can update legal pages" on public.legal_pages;
create policy "Blog admins can update legal pages"
  on public.legal_pages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can delete legal pages" on public.legal_pages;
create policy "Blog admins can delete legal pages"
  on public.legal_pages
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can upload blog images" on storage.objects;
create policy "Blog admins can upload blog images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can update blog images" on storage.objects;
create policy "Blog admins can update blog images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-images'
    and exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'blog-images'
    and exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Blog admins can delete blog images" on storage.objects;
create policy "Blog admins can delete blog images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-images'
    and exists (
      select 1
      from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

revoke all on function private.is_blog_admin(uuid) from public;
revoke execute on function private.is_blog_admin(uuid) from anon, authenticated;

revoke all on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon, authenticated;
