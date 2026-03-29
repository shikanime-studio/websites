# reiya

## Purpose

- Reiya is a Shikanime Studio site focused on merch discovery and
  community-driven wishlists (see \[Hero.astro\](src/components/Hero.astro)).
- The UI copy/tagline in the base layout is: “Let’s bankrupt together”
  (see \[BaseLayout.astro\](src/layouts/BaseLayout.astro)).
- Logged-in users get additional navigation (e.g., Following)
  (see \[Navbar.astro\](src/components/Navbar.astro)).

## URLs

- Production: `https://reiya.shikanime.studio`
  (see \[astro.config.mjs\](astro.config.mjs))

## Commands

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

## Deploy

- Cloudflare Workers: `pnpm deploy` (see \[wrangler.jsonc\](wrangler.jsonc))

## Data

- D1 binding: `DB` (see \[wrangler.jsonc\](wrangler.jsonc))
- Migrations: `pnpm db:migrate`

## Configuration

- Server secrets (Cloudflare): `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`
  (see \[env.d.ts\](src/env.d.ts))
- Client env: `PUBLIC_GOOGLE_CLIENT_ID`

## Technical notes

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- Auth: Google One Tap is triggered client-side
  (see \[BaseLayout.astro\](src/layouts/BaseLayout.astro)).
- Persistence: D1 database binding `DB`
  (see \[wrangler.jsonc\](wrangler.jsonc)).
