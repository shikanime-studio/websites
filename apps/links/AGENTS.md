# links

## Purpose

- Links is a fast links landing page for Shikanime Studio (see
  \[README.md\](README.md)).
- It’s a lightweight hub for studio profiles and resources.

## URLs

- Production: `https://links.shikanime.studio` (see
  \[astro.config.mjs\](astro.config.mjs))

## Commands

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

## Deploy

- Cloudflare Workers: `pnpm deploy` (see \[wrangler.jsonc\](wrangler.jsonc))

## Configuration

- Mixpanel: `PUBLIC_MIXPANEL_TOKEN`, `PUBLIC_MIXPANEL_API_HOST` (used in
  \[BaseLayout.astro\](src/layouts/BaseLayout.astro))

## Technical notes

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- Analytics: Mixpanel is initialized client-side in
  \[BaseLayout.astro\](src/layouts/BaseLayout.astro).
