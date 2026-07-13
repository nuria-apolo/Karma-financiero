create or replace function public.prevent_primary_blog_admin_changes()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  locked_user_id constant uuid := '8a975a30-6e7f-4115-a736-a4ec3ceb0cfb';
  locked_emails constant text[] := array['nurlopez@icloud.com', 'nurlopz@icloud.com'];
begin
  if tg_op = 'DELETE'
    and (
      old.user_id = locked_user_id
      or lower(coalesce(old.email, '')) = any (locked_emails)
    )
  then
    raise exception 'El administrador principal no puede eliminarse de blog_admins.';
  end if;

  if tg_op = 'UPDATE'
    and (
      old.user_id = locked_user_id
      or lower(coalesce(old.email, '')) = any (locked_emails)
    )
    and (
      new.user_id is distinct from old.user_id
      or lower(coalesce(new.email, '')) is distinct from lower(coalesce(old.email, ''))
    )
  then
    raise exception 'El administrador principal no puede cambiar de usuario o email.';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists blog_admins_protect_primary_admin on public.blog_admins;
create trigger blog_admins_protect_primary_admin
before update or delete on public.blog_admins
for each row
execute function public.prevent_primary_blog_admin_changes();
