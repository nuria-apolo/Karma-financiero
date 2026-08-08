# Karma Financiero Landing

This repository is deployed from GitHub to the Cloudflare Worker
`karma-financiero-landing`.

- Production deploys use `.github/workflows/deploy-cloudflare.yml`.
- The custom domains are `karmafinanciero.com` and `www.karmafinanciero.com`.
- Use only the GitHub and Cloudflare deployment path; do not rewrite published
  Git history.
- Keep this landing's Supabase project separate from the app repository and its
  `app.karmafinanciero.com` Worker.
