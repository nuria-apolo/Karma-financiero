create table if not exists public.blog_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists blog_access_requests_status_idx
  on public.blog_access_requests (status, requested_at desc);

drop trigger if exists blog_access_requests_set_updated_at on public.blog_access_requests;
create trigger blog_access_requests_set_updated_at
  before update on public.blog_access_requests
  for each row execute function public.set_updated_at();

alter table public.blog_access_requests enable row level security;

drop policy if exists "Users can create own access request" on public.blog_access_requests;
create policy "Users can create own access request"
  on public.blog_access_requests
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and reviewed_at is null
  );

drop policy if exists "Users can read own access request" on public.blog_access_requests;
create policy "Users can read own access request"
  on public.blog_access_requests
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
  );

drop policy if exists "Admins can read access requests" on public.blog_access_requests;
create policy "Admins can read access requests"
  on public.blog_access_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.blog_admins
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

grant select, insert, update on public.blog_access_requests to authenticated;
