# Karma Financiero Landing - Handoff

Ultima actualizacion: 2026-07-01

## Carpeta local

Proyecto local:

```txt
/Users/srtaserifa/Documents/Karma Financiero Landing
```

Preview local habitual:

```txt
http://localhost:8080/
http://localhost:8080/blog
```

Servidor usado:

```bash
PATH=/Users/srtaserifa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/srtaserifa/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/srtaserifa/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm run dev -- --host 0.0.0.0 --port 5176
```

Aunque se pidio el puerto 5176, Vite eligio `http://localhost:8080/`.

## Repositorios GitHub

Repo principal:

```txt
https://github.com/nuria-apolo/Karma-financiero.git
```

Repo conectado/sincronizado con Lovable:

```txt
https://github.com/nuria-apolo/pixel-pretty-build.git
```

Configuracion local actual:

```bash
origin              https://github.com/nuria-apolo/Karma-financiero.git
pixel-pretty-build  https://github.com/nuria-apolo/pixel-pretty-build.git
```

Commit principal local en `Karma-financiero`:

```txt
412cb79 Initial Karma Financiero landing
```

Commit creado en `pixel-pretty-build` para que Lovable actualizara la preview:

```txt
ee54b4c Sync from Karma Financiero landing
```

Ese commit se hizo encima del historial remoto existente de `pixel-pretty-build`, sin forzar historial.

## Estado de Lovable

Proyecto Lovable abierto:

```txt
Landing Karma Financiero
https://lovable.dev/projects/bd362deb-31c9-4ee6-bb28-d4ef669fb4b9
```

Lo importante que se descubrio:

- Lovable no estaba aplicando el zip subido manualmente.
- El evento `Pushed from GitHub Add files via upload` solo creo/subio el archivo `karma-financiero-para-pixel-pretty-build.zip`.
- Ese zip no reemplazo el codigo activo del proyecto.
- La solucion que funciono fue subir a `pixel-pretty-build/main` un commit real con el contenido de `Karma-financiero`.
- Despues de subir `ee54b4c`, Lovable actualizo la preview.

## Como sincronizar futuros cambios hacia Lovable

Flujo recomendado:

1. Trabajar en local dentro de `Karma Financiero Landing`.
2. Probar en `http://localhost:8080/`.
3. Hacer commit normal en `Karma-financiero`.
4. Para actualizar Lovable, crear un commit en `pixel-pretty-build` con el mismo contenido, sin forzar historial.

Nota: no usar `Add files via upload` con un zip dentro de Lovable si se quiere reemplazar la app. Lovable lo trata como un archivo adjunto, no como codigo activo.

## Comandos utiles

Ver estado:

```bash
git status --short --branch
git remote -v
git log --oneline --decorate -5 --all
```

Build:

```bash
PATH=/Users/srtaserifa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/srtaserifa/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH /Users/srtaserifa/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm run build
```

Crear zip limpio del repo actual:

```bash
git archive --format=zip --output=karma-financiero-para-pixel-pretty-build.zip HEAD
```

## Plantillas de email Supabase

Plantillas creadas:

```txt
supabase/templates/confirmation.html
supabase/templates/recovery.html
supabase/templates/magic_link.html
supabase/templates/email_change.html
supabase/templates/logo-karma.svg
supabase/templates/preview.html
```

Preview local de emails:

```txt
http://localhost:5180/preview.html
```

Servidor usado para emails:

```bash
python3 -m http.server 5180 --bind 0.0.0.0
```

Nota para Supabase: cambiar `src="logo-karma.svg"` por una URL publica del logo si las plantillas se usan en produccion.

## Assets y cambios importantes

- Logo de cabecera y footer integrado.
- Botones unificados con estilo pill negro sin flechas.
- Pagina/lista de espera creada como flujo para leads.
- Blog ampliado con posts, CTA bajo posts y contenido SEO.
- Imagenes de blog generadas y diferenciadas.
- Animaciones y mejoras visuales en bloques/imagenes.
- Icono de loto integrado en la seccion de quote.
- Footer ajustado al ancho visual de las pastillas/secciones.
- Plantillas Supabase preparadas.

## Cuidado

El archivo `AGENTS.md` incluye instruccion de Lovable:

- No reescribir historial publicado.
- Evitar force push, rebase/amend/squash de commits ya subidos.
- Mantener la rama en estado funcional.

Por eso, para sincronizar con `pixel-pretty-build`, se uso un commit nuevo encima del historial remoto en vez de forzar.
