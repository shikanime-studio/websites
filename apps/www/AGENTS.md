# www

## Purpose

- This is the public-facing website for Shikanime Studio
  (see \[README.md\](README.md)).
- Primary content: studio story, projects, and links to channels/apps.

## URLs

- Production: `https://shikanime.studio`
  (see \[astro.config.mjs\](astro.config.mjs))

## Commands

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

## Deploy

- Cloudflare Workers: `pnpm deploy` (see \[wrangler.jsonc\](wrangler.jsonc))

## Configuration

- Mixpanel: `PUBLIC_MIXPANEL_TOKEN`, `PUBLIC_MIXPANEL_API_HOST`
  (used in \[BaseLayout.astro\](src/layouts/BaseLayout.astro))

## Technical notes

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- SEO: uses `@astrojs/sitemap` and a custom robots route
  (see \[robots.txt.ts\](src/pages/robots.txt.ts)).
- Analytics: Mixpanel is initialized client-side in
  \[BaseLayout.astro\](src/layouts/BaseLayout.astro).
