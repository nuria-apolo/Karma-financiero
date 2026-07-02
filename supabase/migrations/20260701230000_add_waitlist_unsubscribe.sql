alter table public.waitlist_leads
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz;

create unique index if not exists waitlist_leads_unsubscribe_token_unique
  on public.waitlist_leads (unsubscribe_token);
