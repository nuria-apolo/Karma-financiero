alter table public.blog_posts
  alter column category set default 'consejos';

insert into public.blog_categories (name, slug, description)
values
  (
    'Consejos',
    'consejos',
    'Ideas practicas para ordenar gastos, conversaciones y decisiones financieras del hogar.'
  ),
  (
    'Recursos',
    'recursos',
    'Guias, metodos y herramientas para gestionar mejor las finanzas compartidas.'
  ),
  (
    'Noticias',
    'noticias',
    'Novedades de Karma Financiero y actualidad sobre finanzas compartidas.'
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description;

update public.blog_posts
set category = case
  when category in ('metodo', 'objetivos') then 'recursos'
  when category in ('convivencia', 'pareja', 'ahorro') then 'consejos'
  when category = 'noticias' then 'noticias'
  else 'consejos'
end;

delete from public.blog_categories
where slug not in ('consejos', 'recursos', 'noticias');

alter table public.blog_categories
  drop constraint if exists blog_categories_allowed_slugs_check;

alter table public.blog_categories
  add constraint blog_categories_allowed_slugs_check
  check (slug in ('consejos', 'recursos', 'noticias'));
