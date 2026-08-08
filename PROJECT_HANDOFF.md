# Karma Financiero Landing — handoff

## Deploy

La landing se despliega desde `main` al Worker de Cloudflare
`karma-financiero-landing`. La configuración está en `wrangler.jsonc` y el
workflow automático en `.github/workflows/deploy-cloudflare.yml`.

Dominios de producción:

- `https://karmafinanciero.com`
- `https://www.karmafinanciero.com`

## Variables de GitHub Actions

Configurar estos secretos en el repositorio:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

El token de Cloudflare necesita permisos para desplegar Workers y gestionar
dominios personalizados.

## Comandos locales

```bash
pnpm install
pnpm dev
pnpm build
pnpm deploy:cloudflare:dry-run
pnpm deploy:cloudflare
```

La landing usa su propio proyecto Supabase para SEO, blog y lista de espera.
No mezclarlo con la aplicación de `app.karmafinanciero.com`, que tiene otro
repositorio, Worker y base de datos.
