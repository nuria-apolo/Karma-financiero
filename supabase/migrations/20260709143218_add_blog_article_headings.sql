with outlines (slug, headings) as (
  values
    (
      'reunion-financiera-de-quince-minutos',
      array[
        'Empieza por los hechos',
        'Toma una decisión pequeña',
        'Revisa los gastos compartidos',
        'Deja el acuerdo por escrito',
        'Cierra reconociendo un avance',
        'Convierte la revisión en un hábito'
      ]::text[]
    ),
    (
      'gastos-invisibles-del-hogar',
      array[
        'Detecta lo que se repite',
        'Revisa las suscripciones',
        'Da un lugar a las compras pequeñas',
        'Elige una acción cada semana',
        'Recupera la intención sobre el gasto'
      ]::text[]
    ),
    (
      'cuentas-comunes-sin-perder-independencia',
      array[
        'Qué debe cubrir la cuenta común',
        'Protege el espacio personal',
        'Elige una proporción justa',
        'Acordad cómo tratar los gastos mixtos',
        'Revisa las reglas cuando cambie la realidad'
      ]::text[]
    ),
    (
      'presupuesto-hogar-sin-estres',
      array[
        'Empieza con cinco bloques',
        'Reserva margen para imprevistos',
        'Separa gastos fijos y variables',
        'Registra sin convertirlo en otra tarea',
        'Revisa antes de culparte',
        'Construye un método que puedas sostener'
      ]::text[]
    ),
    (
      'objetivos-financieros-compartidos',
      array[
        'Pon una cifra y una fecha',
        'Diferencia deseo y compromiso',
        'Separa el dinero del objetivo',
        'Decide qué meta va primero',
        'Revisa el avance una vez al mes'
      ]::text[]
    ),
    (
      'hablar-de-dinero-en-pareja',
      array[
        'Acordad un momento fijo',
        'Empezad por los hechos',
        'Separad lo común, lo personal y el ahorro',
        'Elegid una regla de aportación',
        'Revisad sin juzgar'
      ]::text[]
    )
),
rebuilt as (
  select
    posts.id,
    string_agg(
      case
        when part.position = 1 then part.paragraph
        else
          '## ' ||
          outlines.headings[(part.position - 1)::integer] ||
          E'\n\n' ||
          part.paragraph
      end,
      E'\n\n'
      order by part.position
    ) as content
  from public.blog_posts as posts
  join outlines on outlines.slug = posts.slug
  cross join lateral unnest(string_to_array(posts.content, E'\n\n'))
    with ordinality as part(paragraph, position)
  where posts.content not like '%## %'
    and cardinality(outlines.headings) =
      cardinality(string_to_array(posts.content, E'\n\n')) - 1
  group by posts.id
)
update public.blog_posts as posts
set
  content = rebuilt.content,
  updated_at = now()
from rebuilt
where posts.id = rebuilt.id;
