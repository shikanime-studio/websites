## Repo notes

### Run

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

### Deploy

- Cloudflare Worker: `pnpm deploy` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/wrangler.jsonc))
- Site URL: `https://reiya.shikanime.studio` (see \[astro.config.mjs\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/astro.config.mjs))

### Data

- D1 binding: `DB` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/wrangler.jsonc))
- Migrations: `pnpm db:migrate`

### Env

- Server secrets (Cloudflare): `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET` (see \[env.d.ts\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/env.d.ts))
- Client env: `PUBLIC_GOOGLE_CLIENT_ID`
