with target_posts as (
  select *
  from (
    values
      (
        'hablar-de-dinero-en-pareja',
        'Cómo hablar de dinero en pareja sin discutir | Karma Financiero',
        'Rituales sencillos para hablar de dinero en pareja, repartir gastos compartidos y revisar el presupuesto del hogar sin discusiones.'
      ),
      (
        'presupuesto-hogar-sin-estres',
        'Presupuesto del hogar sin estrés | Karma Financiero',
        'Aprende a crear un presupuesto del hogar simple para organizar gastos familiares, imprevistos y ahorro sin depender de hojas de cálculo.'
      ),
      (
        'objetivos-financieros-compartidos',
        'Objetivos financieros compartidos en pareja | Karma Financiero',
        'Convierte metas compartidas en un plan financiero claro: ahorro en pareja, fechas, aportaciones y seguimiento mensual del hogar.'
      ),
      (
        'cuentas-comunes-sin-perder-independencia',
        'Cuentas comunes en pareja sin perder independencia',
        'Cómo decidir qué gastos van a la cuenta común, qué queda en lo personal y qué reglas ayudan a cuidar las finanzas en pareja.'
      ),
      (
        'gastos-invisibles-del-hogar',
        'Gastos invisibles del hogar: cómo detectarlos',
        'Suscripciones, recambios y pequeños pagos repetidos: una guía para detectar gastos invisibles y ordenar mejor el presupuesto familiar.'
      ),
      (
        'reunion-financiera-de-quince-minutos',
        'Reunión financiera de pareja en 15 minutos',
        'Un guion práctico para revisar cuentas compartidas, gastos del hogar y objetivos financieros sin convertirlo en una discusión.'
      )
  ) as item(slug, seo_title, seo_description)
)
update public.blog_posts as post
set
  seo_title = target_posts.seo_title,
  seo_description = target_posts.seo_description
from target_posts
where post.slug = target_posts.slug;

with static_pages as (
  select *
  from (
    values
      (
        '/',
        'Karma Financiero — Finanzas compartidas con calma',
        'Organiza gastos del hogar, presupuesto familiar, deudas y objetivos compartidos con una app pensada para parejas y familias.',
        'Karma Financiero — Finanzas compartidas con calma',
        'App para organizar gastos del hogar, presupuesto familiar y objetivos compartidos con calma.',
        '/head-icon.png',
        'WebSite',
        'static'
      ),
      (
        '/blog',
        'Blog de finanzas en pareja y gastos del hogar | Karma Financiero',
        'Guías prácticas para hablar de dinero en pareja, organizar gastos del hogar, crear presupuesto familiar y alcanzar objetivos compartidos.',
        'Blog de finanzas en pareja y gastos del hogar',
        'Ideas útiles sobre finanzas compartidas, presupuesto familiar, gastos del hogar y objetivos en pareja.',
        '/head-icon.png',
        'Blog',
        'static'
      ),
      (
        '/lista-espera',
        'App para organizar gastos en pareja — Lista de espera',
        'Apúntate para probar Karma Financiero: una app para organizar gastos compartidos, presupuesto familiar y objetivos del hogar.',
        'Únete a Karma Financiero',
        'Prueba la app para organizar finanzas compartidas en pareja o familia.',
        '/head-icon.png',
        'WebPage',
        'static'
      )
  ) as item(path, title, description, og_title, og_description, og_image, schema_type, source_type)
),
blog_pages as (
  select
    '/blog/' || post.slug as path,
    post.seo_title as title,
    post.seo_description as description,
    'https://karmafinanciero.com/blog/' || post.slug as canonical_url,
    post.seo_title as og_title,
    post.seo_description as og_description,
    coalesce(post.featured_image, '/head-icon.png') as og_image,
    'Article' as schema_type,
    'blog' as source_type,
    post.id as source_id
  from public.blog_posts post
  where post.status = 'published'
    and post.seo_title is not null
    and post.seo_description is not null
),
upsert_static as (
  insert into public.seo_pages (
    path,
    title,
    description,
    canonical_url,
    og_title,
    og_description,
    og_image,
    indexable,
    follow_links,
    schema_type,
    source_type,
    status
  )
  select
    path,
    title,
    description,
    'https://karmafinanciero.com' || case when path = '/' then '/' else path end,
    og_title,
    og_description,
    og_image,
    true,
    true,
    schema_type,
    source_type,
    'published'
  from static_pages
  on conflict (path) do update
  set
    title = excluded.title,
    description = excluded.description,
    canonical_url = excluded.canonical_url,
    og_title = excluded.og_title,
    og_description = excluded.og_description,
    og_image = excluded.og_image,
    indexable = excluded.indexable,
    follow_links = excluded.follow_links,
    schema_type = excluded.schema_type,
    source_type = excluded.source_type,
    status = excluded.status
)
insert into public.seo_pages (
  path,
  title,
  description,
  canonical_url,
  og_title,
  og_description,
  og_image,
  indexable,
  follow_links,
  schema_type,
  source_type,
  source_id,
  status
)
select
  path,
  title,
  description,
  canonical_url,
  og_title,
  og_description,
  og_image,
  true,
  true,
  schema_type,
  source_type,
  source_id,
  'published'
from blog_pages
on conflict (path) do update
set
  title = excluded.title,
  description = excluded.description,
  canonical_url = excluded.canonical_url,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  og_image = excluded.og_image,
  indexable = excluded.indexable,
  follow_links = excluded.follow_links,
  schema_type = excluded.schema_type,
  source_type = excluded.source_type,
  source_id = excluded.source_id,
  status = excluded.status;
