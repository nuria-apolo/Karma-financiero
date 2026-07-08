drop policy if exists "Blog admins can manage blog admins" on public.blog_admins;
create policy "Blog admins can manage blog admins"
  on public.blog_admins
  for all
  to authenticated
  using (
    exists (
      select 1 from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

grant insert, update, delete on public.blog_admins to authenticated;
