drop policy if exists "Admins can see their own record" on public.blog_admins;

revoke all on public.blog_posts from anon, authenticated;
revoke all on public.blog_categories from anon, authenticated;
revoke all on public.blog_admins from anon, authenticated;
revoke all on public.blog_access_requests from anon, authenticated;

grant select on public.blog_categories to anon, authenticated;
grant select on public.blog_posts to anon, authenticated;

grant select on public.blog_admins to authenticated;
grant insert, update, delete on public.blog_admins to authenticated;

grant select, insert, update, delete on public.blog_categories to authenticated;
grant select, insert, update, delete on public.blog_posts to authenticated;
grant select, insert, update on public.blog_access_requests to authenticated;
