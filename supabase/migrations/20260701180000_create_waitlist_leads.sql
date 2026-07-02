create table if not exists public.waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  profile text not null check (profile in ('pareja', 'familia', 'compartido', 'personal')),
  goal text,
  consent boolean not null default false,
  consent_at timestamptz,
  source text not null default 'lista-espera',
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz,
  welcome_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_leads_email_unique
  on public.waitlist_leads (lower(email));

create unique index if not exists waitlist_leads_unsubscribe_token_unique
  on public.waitlist_leads (unsubscribe_token);

alter table public.waitlist_leads enable row level security;

revoke all on table public.waitlist_leads from anon, authenticated;
grant select, insert, update on table public.waitlist_leads to service_role;

comment on table public.waitlist_leads is
  'Leads que han dado su consentimiento para recibir novedades de Karma Financiero.';
