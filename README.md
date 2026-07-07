# Karma Financiero Landing

Landing y blog de Karma Financiero con CMS propio conectado a Supabase.

## CMS del blog

El panel privado esta en:

```txt
/admin/blog
```

Para entrar necesitas iniciar sesion con Supabase Auth y estar autorizada en la tabla `blog_admins`.

Si al iniciar sesion ves el mensaje de acceso pendiente, copia el SQL que aparece en pantalla y ejecutalo en Supabase SQL Editor. Tiene este formato:

```sql
insert into public.blog_admins (user_id, email)
values ('USER_ID_DE_SUPABASE', 'tu@email.com');
```

## Crear un articulo

1. Entra en `/admin/blog`.
2. Pulsa el boton `+` en la coleccion Blog.
3. Se crea un articulo en estado `Draft`.
4. Completa titulo, slug, extracto, contenido, categoria, imagen destacada y campos SEO.
5. Pulsa `Draft` para guardar sin publicar.

## Editar un articulo

1. Entra en `/admin/blog`.
2. Selecciona el articulo en el listado central.
3. Edita los campos en el panel derecho.
4. Pulsa `Draft` o `Live` para guardar los cambios.

## Publicar un articulo

1. Selecciona el articulo.
2. Revisa la vista previa.
3. Pulsa `Live`.

La web publica solo muestra articulos con `status = published`.

## Dejar un articulo como borrador

1. Selecciona el articulo.
2. Pulsa `Draft`.

El articulo desaparece de `/blog` y de `/blog/[slug]`, pero sigue editable en el CMS.

## Eliminar un articulo

1. Selecciona el articulo.
2. Baja al final del panel derecho.
3. Pulsa `Eliminar articulo`.
4. Confirma la accion.

## Categorias

En la sidebar del CMS entra en `Categorias` para crear, editar o eliminar categorias. Los articulos guardan la categoria por slug.

## Variables de entorno

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Las variables `VITE_*` se usan en cliente. Las variables sin `VITE_` se usan en servidor.
