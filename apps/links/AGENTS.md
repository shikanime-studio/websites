## Repo notes

### Non-technical knowledge

- Links is a fast links landing page for Shikanime Studio (see [README.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/README.md)).
- It’s intended as a lightweight hub for studio profiles and resources.

### Run

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

### Deploy

- Cloudflare Worker: `pnpm deploy` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/wrangler.jsonc))
- Site URL: `https://links.shikanime.studio` (see \[astro.config.mjs\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/astro.config.mjs))

### Env

- Mixpanel: `PUBLIC_MIXPANEL_TOKEN`, `PUBLIC_MIXPANEL_API_HOST` (used in \[BaseLayout.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/src/layouts/BaseLayout.astro))

### Technical knowledge

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- Analytics: Mixpanel is initialized client-side in [BaseLayout.astro](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/src/layouts/BaseLayout.astro).
