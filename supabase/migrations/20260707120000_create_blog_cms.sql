create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  featured_image text,
  category text not null default 'metodo' references public.blog_categories(slug) on update cascade,
  author text not null default 'Karma Financiero',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_slug_idx
  on public.blog_posts (slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_categories enable row level security;
alter table public.blog_admins enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "Anyone can read blog categories" on public.blog_categories;
create policy "Anyone can read blog categories"
  on public.blog_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Blog admins can manage categories" on public.blog_categories;
create policy "Blog admins can manage categories"
  on public.blog_categories
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

drop policy if exists "Blog admins can read their own admin row" on public.blog_admins;
create policy "Blog admins can read their own admin row"
  on public.blog_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read published blog posts" on public.blog_posts;
create policy "Anyone can read published blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Blog admins can read all blog posts" on public.blog_posts;
create policy "Blog admins can read all blog posts"
  on public.blog_posts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.blog_admins
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
      select 1 from public.blog_admins
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

drop policy if exists "Blog admins can delete blog posts" on public.blog_posts;
create policy "Blog admins can delete blog posts"
  on public.blog_posts
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.blog_admins
      where blog_admins.user_id = (select auth.uid())
    )
  );

grant usage on schema public to anon, authenticated;
grant select on public.blog_categories to anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant select on public.blog_admins to authenticated;
grant insert, update, delete on public.blog_categories to authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

insert into public.blog_categories (name, slug, description)
values
  ('Convivencia', 'convivencia', 'Ideas para hablar de dinero en pareja y ordenar acuerdos del hogar.'),
  ('Metodo', 'metodo', 'Sistemas sencillos para presupuestos, revisiones y habitos financieros.'),
  ('Objetivos', 'objetivos', 'Ahorro, planes compartidos y metas financieras con fecha real.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category,
  author,
  status,
  published_at,
  seo_title,
  seo_description
)
values
  (
    'Como hablar de dinero en pareja sin que se convierta en discusion',
    'hablar-de-dinero-en-pareja',
    'Tres rituales sencillos para que la conversacion financiera deje de tensar la convivencia y empiece a sumar.',
    'Hablar de dinero en pareja suele activar una mezcla incomoda de verguenza, control y miedo. No es casual: la mayoria aprendimos a gestionar las finanzas personales en silencio, sin un marco comun para decidir juntos ni una forma clara de repartir gastos compartidos.

El primer paso no es hacer un Excel perfecto, sino acordar un momento fijo. Media hora a la semana basta para mirar ingresos, gastos del hogar, ahorro y deudas con calma.

## Separa lo comun de lo personal

Conviene distinguir tres cajas: gastos comunes, dinero personal y objetivos compartidos. En lo comun entran alquiler, supermercado, recibos y gastos de convivencia. En lo personal entra lo que cada uno gasta sin rendir cuentas.

El tercero es revisar, no juzgar. Karma Financiero te da el mapa; la conversacion la sosteneis vosotros. Y si, tambien vale celebrar cuando el mes cuadra.',
    '/blog/blog-dinero-pareja-cover.jpg',
    'convivencia',
    'Karma Financiero',
    'published',
    '2026-06-12 09:00:00+00',
    'Hablar de dinero en pareja sin discutir',
    'Guia practica para hablar de dinero en pareja, repartir gastos compartidos y mejorar las finanzas del hogar.'
  ),
  (
    'Un presupuesto del hogar que no te robe el domingo',
    'presupuesto-hogar-sin-estres',
    'Olvida las hojas de calculo infinitas. Asi montas un sistema ligero que aguanta los meses raros y los gastos imprevistos.',
    'Un presupuesto del hogar util no es el que preve cada centimo, sino el que sobrevive al primer imprevisto sin que tires todo a la basura.

Empieza con cinco bloques: vivienda, vida diaria, transporte, ocio y ahorro. Esta estructura cubre la mayoria de finanzas domesticas sin convertir el control de gastos en una tarea infinita.

## Deja margen para la vida real

Reserva una parte pequena para lo que siempre aparece: regalos, farmacia, reparaciones o una cena familiar. Ese margen evita que un gasto normal se viva como fracaso.

El objetivo no es ahorrar mas este mes, sino sostener el metodo doce meses seguidos. Ahi aparece el verdadero karma financiero: menos ruido y mas decisiones compartidas.',
    '/blog/blog-presupuesto-hogar-cover.jpg',
    'metodo',
    'Karma Financiero',
    'published',
    '2026-06-05 09:00:00+00',
    'Presupuesto del hogar sin estres',
    'Metodo sencillo para organizar gastos familiares, controlar imprevistos y mejorar las finanzas domesticas.'
  ),
  (
    'Objetivos compartidos: del algun dia al primer paso real',
    'objetivos-financieros-compartidos',
    'Viajar, mudarse, formar familia, dejar un trabajo. Convierte los grandes deseos en hitos medibles que de verdad ocurren.',
    'La mayoria de los objetivos financieros compartidos se quedan en conversacion de sobremesa porque les falta una cosa: un numero y una fecha.

Define el objetivo en una frase concreta: ahorrar 6.000 euros para mudarnos en septiembre de 2027. Ahora divide entre los meses que faltan. Ese es tu aporte mensual real.

## Una meta necesita sitio propio

Crea una cuenta o categoria separada para ese objetivo. Si vive mezclado con el dia a dia, desaparece entre supermercado, ocio y recibos.

Revisa el avance una vez al mes. Ver el porcentaje subir mantiene vivo el habito cuando la motivacion inicial se apaga.',
    '/blog/blog-objetivos-compartidos-cover.jpg',
    'objetivos',
    'Karma Financiero',
    'draft',
    null,
    'Objetivos financieros compartidos',
    'Como convertir objetivos financieros compartidos en metas medibles para parejas y hogares.'
  )
on conflict (slug) do update
set title = excluded.title,
    excerpt = excluded.excerpt,
    content = excluded.content,
    featured_image = excluded.featured_image,
    category = excluded.category,
    author = excluded.author,
    status = excluded.status,
    published_at = excluded.published_at,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description;
