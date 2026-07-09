create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  eyebrow text not null default 'Información legal',
  intro text not null default '',
  content text not null default '',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists legal_pages_set_updated_at on public.legal_pages;
create trigger legal_pages_set_updated_at
  before update on public.legal_pages
  for each row execute function public.set_updated_at();

alter table public.legal_pages enable row level security;

drop policy if exists "Anyone can read legal pages" on public.legal_pages;
create policy "Anyone can read legal pages"
  on public.legal_pages
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Blog admins can insert legal pages" on public.legal_pages;
create policy "Blog admins can insert legal pages"
  on public.legal_pages
  for insert
  to authenticated
  with check ((select private.is_blog_admin()));

drop policy if exists "Blog admins can update legal pages" on public.legal_pages;
create policy "Blog admins can update legal pages"
  on public.legal_pages
  for update
  to authenticated
  using ((select private.is_blog_admin()))
  with check ((select private.is_blog_admin()));

drop policy if exists "Blog admins can delete legal pages" on public.legal_pages;
create policy "Blog admins can delete legal pages"
  on public.legal_pages
  for delete
  to authenticated
  using ((select private.is_blog_admin()));

revoke all on public.legal_pages from anon, authenticated;
grant select on public.legal_pages to anon, authenticated;
grant insert, update, delete on public.legal_pages to authenticated;

insert into public.legal_pages (
  title,
  slug,
  eyebrow,
  intro,
  content,
  seo_title,
  seo_description
)
values
  (
    'Aviso legal',
    'aviso-legal',
    'Información legal',
    'Información sobre la titularidad, las condiciones de uso y las responsabilidades aplicables al sitio web de Karma Financiero.',
    $legal$
## 1. Titular del sitio

Este sitio web (en adelante, "el Sitio") está gestionado por **Karma Financiero**. Para cualquier comunicación puedes escribirnos a hola@karmafinanciero.com.

## 2. Objeto

El presente aviso legal regula el uso del Sitio. La navegación por el mismo atribuye la condición de usuario e implica la aceptación plena de las disposiciones aquí incluidas.

## 3. Propiedad intelectual e industrial

Todos los contenidos del Sitio (textos, imágenes, marca, logotipo, diseño y código) son titularidad de Karma Financiero o de terceros que han autorizado su uso. Queda prohibida su reproducción total o parcial sin autorización expresa.

## 4. Responsabilidad

Karma Financiero no se hace responsable de los daños derivados del uso indebido del Sitio ni de la indisponibilidad temporal del servicio por causas técnicas o de fuerza mayor.

## 5. Legislación y jurisdicción

Las presentes condiciones se rigen por la legislación española. Para la resolución de controversias las partes se someten a los Juzgados y Tribunales del domicilio del usuario cuando este actúe como consumidor.
$legal$,
    'Aviso legal — Karma Financiero',
    'Información legal, condiciones de uso y titularidad del sitio web de Karma Financiero.'
  ),
  (
    'Política de privacidad',
    'privacidad',
    'Privacidad y datos',
    'Te explicamos de forma clara qué datos tratamos, para qué los utilizamos y cómo puedes ejercer tus derechos.',
    $privacy$
## 1. Responsable del tratamiento

El responsable del tratamiento de tus datos es **Karma Financiero**. Contacto: hola@karmafinanciero.com.

## 2. Datos que tratamos

Tratamos los datos que nos facilitas voluntariamente al darte de alta en la app, al suscribirte a la newsletter o al contactarnos: nombre, correo electrónico y la información necesaria para prestar el servicio.

## 3. Finalidades

- Prestar y mantener el servicio de Karma Financiero.
- Enviar comunicaciones sobre el producto y novedades cuando lo autorices.
- Atender consultas, soporte y obligaciones legales.

## 4. Legitimación

La base legal del tratamiento es la ejecución del contrato (uso del servicio), el consentimiento (newsletter y cookies no esenciales) y el interés legítimo para la mejora y seguridad de la plataforma.

## 5. Conservación

Conservamos tus datos mientras mantengas la relación con nosotros y, posteriormente, durante los plazos legalmente exigibles.

## 6. Derechos

Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hola@karmafinanciero.com. También puedes reclamar ante la Agencia Española de Protección de Datos.
$privacy$,
    'Política de privacidad — Karma Financiero',
    'Cómo trata Karma Financiero los datos personales y cómo puedes ejercer tus derechos.'
  ),
  (
    'Política de cookies',
    'cookies',
    'Preferencias y cookies',
    'Conoce qué cookies utiliza Karma Financiero, para qué sirven y cómo puedes cambiar tus preferencias.',
    $cookies$
## 1. ¿Qué son las cookies?

Las cookies son pequeños archivos que un sitio web almacena en tu dispositivo para recordar información sobre tu visita, como tus preferencias o el inicio de sesión.

## 2. Cookies que utilizamos

- **Técnicas (necesarias):** imprescindibles para que el sitio funcione y recuerde tus preferencias de consentimiento.
- **Analíticas:** nos ayudan a entender cómo se usa el sitio y a mejorarlo. Solo se activan si las aceptas.

## 3. Gestión del consentimiento

La primera vez que visitas el sitio mostramos un banner para que aceptes o rechaces las cookies no esenciales. Puedes cambiar tu decisión en cualquier momento con el botón de preferencias disponible en esta página.

## 4. Cómo desactivarlas en el navegador

También puedes bloquear o eliminar las cookies desde la configuración de tu navegador. Ten en cuenta que algunas partes del sitio pueden dejar de funcionar correctamente.
$cookies$,
    'Política de cookies — Karma Financiero',
    'Qué cookies usa Karma Financiero, para qué sirven y cómo configurarlas.'
  ),
  (
    'Declaración de accesibilidad',
    'accesibilidad',
    'Compromiso accesible',
    'En Karma Financiero queremos que ordenar la economía del hogar sea fácil para todas las personas, con independencia de sus capacidades, tecnología o contexto de uso.',
    $accessibility$
## 1. Situación de cumplimiento

Este sitio web es **parcialmente conforme** con WCAG 2.1 nivel AA y aspira a cumplir los requisitos aplicables de la norma UNE-EN 301549.

- Navegación por teclado y foco visible.
- Contraste legible en textos, controles y estados.
- Texto ampliable sin pérdida de información esencial.
- Diseño adaptable a móvil, tableta y escritorio.

## 2. Medidas adoptadas

- Estructura de encabezados y regiones semánticas para facilitar la navegación.
- Acceso mediante teclado y estilos de foco claramente visibles.
- Textos alternativos en imágenes informativas y ocultación de las decorativas.
- Etiquetas e instrucciones comprensibles en formularios.
- Respeto a la preferencia de movimiento reducido.
- Revisión continua del contraste, el contenido y los componentes interactivos.

## 3. Limitaciones conocidas

- Algunas imágenes o contenidos antiguos del blog pueden necesitar una descripción más detallada.
- Determinados servicios de terceros pueden no ofrecer el mismo nivel de accesibilidad.
- Algunas combinaciones de navegador y tecnología de asistencia aún no se han verificado.

No se invoca ninguna excepción por carga desproporcionada. Trabajamos para corregir las barreras detectadas de manera progresiva.

## 4. Comunicación y contacto

Si encuentras una barrera, necesitas un contenido en otro formato o quieres proponer una mejora, escríbenos a hola@karmafinanciero.com indicando la página, el problema y, si es posible, el navegador o tecnología de asistencia utilizada.

## 5. Procedimiento de reclamación

Si la respuesta no resulta satisfactoria, puedes acudir a los organismos competentes en materia de consumo, igualdad de oportunidades y derechos de las personas con discapacidad. También puedes presentar una consulta o queja ante la Oficina de Atención a la Discapacidad.

## 6. Preparación y actualización

Esta declaración se preparó el 8 de julio de 2026 mediante una autoevaluación inicial. Se revisará cuando haya cambios relevantes y de forma periódica.

**Marco de referencia:** WCAG 2.1 nivel AA, UNE-EN 301549, Real Decreto 193/2023 y Ley 11/2023. El Real Decreto 1112/2018 y el modelo europeo de declaración se utilizan como guía de estructura y transparencia, aunque su ámbito principal es el sector público.
$accessibility$,
    'Declaración de accesibilidad — Karma Financiero',
    'Compromiso, situación de cumplimiento y contacto sobre la accesibilidad de Karma Financiero.'
  )
on conflict (slug) do nothing;
