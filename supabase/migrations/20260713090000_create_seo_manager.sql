create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  path text not null unique check (path ~ '^/'),
  title text not null default '',
  description text not null default '',
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  indexable boolean not null default true,
  follow_links boolean not null default true,
  schema_type text not null default 'WebPage',
  schema_json jsonb,
  status text not null default 'published' check (status in ('draft', 'published')),
  source_type text not null default 'static' check (source_type in ('static', 'blog', 'legal', 'custom')),
  source_id uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique check (from_path ~ '^/'),
  to_path text not null check (to_path ~ '^/|^https?://'),
  status_code integer not null default 301 check (status_code in (301, 302, 307, 308)),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seo_pages_status_path_idx on public.seo_pages (status, path);
create index if not exists seo_pages_source_idx on public.seo_pages (source_type, source_id);
create index if not exists seo_redirects_active_from_path_idx on public.seo_redirects (active, from_path);

create or replace function public.seo_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists seo_pages_set_updated_at on public.seo_pages;
create trigger seo_pages_set_updated_at
before update on public.seo_pages
for each row
execute function public.seo_set_updated_at();

drop trigger if exists seo_redirects_set_updated_at on public.seo_redirects;
create trigger seo_redirects_set_updated_at
before update on public.seo_redirects
for each row
execute function public.seo_set_updated_at();

alter table public.seo_pages enable row level security;
alter table public.seo_redirects enable row level security;

drop policy if exists "Published SEO pages are readable" on public.seo_pages;
create policy "Published SEO pages are readable"
on public.seo_pages
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Blog admins can read all SEO pages" on public.seo_pages;
create policy "Blog admins can read all SEO pages"
on public.seo_pages
for select
to authenticated
using (
  exists (
    select 1
    from public.blog_admins
    where blog_admins.user_id = (select auth.uid())
  )
);

drop policy if exists "Blog admins can insert SEO pages" on public.seo_pages;
create policy "Blog admins can insert SEO pages"
on public.seo_pages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.blog_admins
    where blog_admins.user_id = (select auth.uid())
  )
);

drop policy if exists "Blog admins can update SEO pages" on public.seo_pages;
create policy "Blog admins can update SEO pages"
on public.seo_pages
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

drop policy if exists "Blog admins can delete SEO pages" on public.seo_pages;
create policy "Blog admins can delete SEO pages"
on public.seo_pages
for delete
to authenticated
using (
  exists (
    select 1
    from public.blog_admins
    where blog_admins.user_id = (select auth.uid())
  )
);

drop policy if exists "Active SEO redirects are readable" on public.seo_redirects;
create policy "Active SEO redirects are readable"
on public.seo_redirects
for select
to anon, authenticated
using (active = true);

drop policy if exists "Blog admins can read all SEO redirects" on public.seo_redirects;
create policy "Blog admins can read all SEO redirects"
on public.seo_redirects
for select
to authenticated
using (
  exists (
    select 1
    from public.blog_admins
    where blog_admins.user_id = (select auth.uid())
  )
);

drop policy if exists "Blog admins can insert SEO redirects" on public.seo_redirects;
create policy "Blog admins can insert SEO redirects"
on public.seo_redirects
for insert
to authenticated
with check (
  exists (
    select 1
    from public.blog_admins
    where blog_admins.user_id = (select auth.uid())
  )
);

drop policy if exists "Blog admins can update SEO redirects" on public.seo_redirects;
create policy "Blog admins can update SEO redirects"
on public.seo_redirects
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

drop policy if exists "Blog admins can delete SEO redirects" on public.seo_redirects;
create policy "Blog admins can delete SEO redirects"
on public.seo_redirects
for delete
to authenticated
using (
  exists (
    select 1
    from public.blog_admins
    where blog_admins.user_id = (select auth.uid())
  )
);

grant select on public.seo_pages to anon, authenticated;
grant insert, update, delete on public.seo_pages to authenticated;
grant select on public.seo_redirects to anon, authenticated;
grant insert, update, delete on public.seo_redirects to authenticated;

insert into public.seo_pages (path, title, description, canonical_url, og_title, og_description, og_image, schema_type, source_type)
values
  (
    '/',
    'Karma Financiero — Finanzas compartidas con calma',
    'Organiza el dinero compartido con calma. Gestiona ingresos, gastos, objetivos y deudas en pareja o familia.',
    'https://karmafinanciero.com/',
    'Karma Financiero — Finanzas compartidas con calma',
    'Organiza el dinero que compartes con claridad y calma.',
    '/head-icon.png',
    'WebSite',
    'static'
  ),
  (
    '/lista-espera',
    'Únete a Karma Financiero — Lista de espera',
    'Déjanos tu correo y te avisaremos cuando Karma Financiero esté listo para tu hogar.',
    'https://karmafinanciero.com/lista-espera',
    'Únete a Karma Financiero',
    'Apúntate para probar la app de finanzas compartidas con calma.',
    '/head-icon.png',
    'WebPage',
    'static'
  ),
  (
    '/blog',
    'Diario de Karma — Blog de finanzas compartidas',
    'Lecturas cortas sobre hablar de dinero en pareja, presupuesto del hogar y objetivos compartidos.',
    'https://karmafinanciero.com/blog',
    'Diario de Karma — Blog',
    'Ideas prácticas sobre finanzas compartidas, presupuesto del hogar y objetivos en pareja.',
    '/head-icon.png',
    'Blog',
    'static'
  ),
  (
    '/legal/aviso-legal',
    'Aviso legal — Karma Financiero',
    'Información legal del sitio web de Karma Financiero.',
    'https://karmafinanciero.com/legal/aviso-legal',
    'Aviso legal — Karma Financiero',
    'Información legal del sitio web de Karma Financiero.',
    '/head-icon.png',
    'WebPage',
    'legal'
  ),
  (
    '/legal/privacidad',
    'Política de privacidad — Karma Financiero',
    'Cómo trata Karma Financiero los datos personales.',
    'https://karmafinanciero.com/legal/privacidad',
    'Política de privacidad — Karma Financiero',
    'Cómo trata Karma Financiero los datos personales.',
    '/head-icon.png',
    'WebPage',
    'legal'
  ),
  (
    '/legal/cookies',
    'Política de cookies — Karma Financiero',
    'Qué cookies usa Karma Financiero y cómo configurarlas.',
    'https://karmafinanciero.com/legal/cookies',
    'Política de cookies — Karma Financiero',
    'Qué cookies usa Karma Financiero y cómo configurarlas.',
    '/head-icon.png',
    'WebPage',
    'legal'
  ),
  (
    '/legal/accesibilidad',
    'Declaración de accesibilidad — Karma Financiero',
    'Compromiso de accesibilidad de Karma Financiero.',
    'https://karmafinanciero.com/legal/accesibilidad',
    'Declaración de accesibilidad — Karma Financiero',
    'Compromiso de accesibilidad de Karma Financiero.',
    '/head-icon.png',
    'WebPage',
    'legal'
  )
on conflict (path) do nothing;
