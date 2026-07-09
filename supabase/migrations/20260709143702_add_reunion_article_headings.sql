with outline as (
  select array[
    'Empieza por los hechos',
    'Toma una decisión pequeña',
    'Revisa los gastos compartidos',
    'Deja el acuerdo por escrito',
    'Cierra reconociendo un avance'
  ]::text[] as headings
),
rebuilt as (
  select
    posts.id,
    string_agg(
      case
        when part.position = 1 then part.paragraph
        else
          '## ' ||
          outline.headings[(part.position - 1)::integer] ||
          E'\n\n' ||
          part.paragraph
      end,
      E'\n\n'
      order by part.position
    ) as content
  from public.blog_posts as posts
  cross join outline
  cross join lateral unnest(string_to_array(posts.content, E'\n\n'))
    with ordinality as part(paragraph, position)
  where posts.slug = 'reunion-financiera-de-quince-minutos'
    and posts.content not like '%## %'
    and cardinality(outline.headings) =
      cardinality(string_to_array(posts.content, E'\n\n')) - 1
  group by posts.id
)
update public.blog_posts as posts
set
  content = rebuilt.content,
  updated_at = now()
from rebuilt
where posts.id = rebuilt.id;
