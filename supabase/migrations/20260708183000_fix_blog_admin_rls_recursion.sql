create schema if not exists private;

create or replace function private.is_blog_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select
    check_user_id is not null
    and exists (
      select 1
      from public.blog_admins
      where user_id = check_user_id
    );
$$;

revoke all on function private.is_blog_admin(uuid) from public;
grant execute on function private.is_blog_admin(uuid) to authenticated;

drop policy if exists "Blog admins can manage categories" on public.blog_categories;
create policy "Blog admins can manage categories"
  on public.blog_categories
  for all
  to authenticated
  using ((select private.is_blog_admin()))
  with check ((select private.is_blog_admin()));

drop policy if exists "Blog admins can read all blog posts" on public.blog_posts;
create policy "Blog admins can read all blog posts"
  on public.blog_posts
  for select
  to authenticated
  using ((select private.is_blog_admin()));

drop policy if exists "Blog admins can insert blog posts" on public.blog_posts;
create policy "Blog admins can insert blog posts"
  on public.blog_posts
  for insert
  to authenticated
  with check ((select private.is_blog_admin()));

drop policy if exists "Blog admins can update blog posts" on public.blog_posts;
create policy "Blog admins can update blog posts"
  on public.blog_posts
  for update
  to authenticated
  using ((select private.is_blog_admin()))
  with check ((select private.is_blog_admin()));

drop policy if exists "Blog admins can delete blog posts" on public.blog_posts;
create policy "Blog admins can delete blog posts"
  on public.blog_posts
  for delete
  to authenticated
  using ((select private.is_blog_admin()));

drop policy if exists "Admins can read access requests" on public.blog_access_requests;
create policy "Admins can read access requests"
  on public.blog_access_requests
  for select
  to authenticated
  using ((select private.is_blog_admin()));

drop policy if exists "Admins can update access requests" on public.blog_access_requests;
create policy "Admins can update access requests"
  on public.blog_access_requests
  for update
  to authenticated
  using ((select private.is_blog_admin()))
  with check ((select private.is_blog_admin()));

drop policy if exists "Blog admins can manage blog admins" on public.blog_admins;
create policy "Blog admins can manage blog admins"
  on public.blog_admins
  for all
  to authenticated
  using ((select private.is_blog_admin()))
  with check ((select private.is_blog_admin()));
