## Repo notes

### Purpose

- Reiya is a Shikanime Studio site focused on merch discovery and community-driven wishlists (see \[Hero.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Hero.astro)).
- The UI copy/tagline in the base layout is: “Let’s bankrupt together” (see \[BaseLayout.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/layouts/BaseLayout.astro)).
- Logged-in users get additional navigation (e.g., Following) (see \[Navbar.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Navbar.astro)).

### URLs

- Production: `https://reiya.shikanime.studio` (see \[astro.config.mjs\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/astro.config.mjs))

### Commands

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

### Deploy

- Cloudflare Workers: `pnpm deploy` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/wrangler.jsonc))

### Data

- D1 binding: `DB` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/wrangler.jsonc))
- Migrations: `pnpm db:migrate`

### Configuration

- Server secrets (Cloudflare): `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET` (see \[env.d.ts\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/env.d.ts))
- Client env: `PUBLIC_GOOGLE_CLIENT_ID`

### Technical notes

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- Auth: Google One Tap is triggered client-side (see \[BaseLayout.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/layouts/BaseLayout.astro)).
- Persistence: D1 database binding `DB` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/wrangler.jsonc)).
