## Repo notes

### Purpose

- Links is a fast links landing page for Shikanime Studio (see \[README.md\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/README.md)).
- It’s a lightweight hub for studio profiles and resources.

### URLs

- Production: `https://links.shikanime.studio` (see \[astro.config.mjs\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/astro.config.mjs))

### Commands

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

### Deploy

- Cloudflare Workers: `pnpm deploy` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/wrangler.jsonc))

### Configuration

- Mixpanel: `PUBLIC_MIXPANEL_TOKEN`, `PUBLIC_MIXPANEL_API_HOST` (used in \[BaseLayout.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/src/layouts/BaseLayout.astro))

### Technical notes

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- Analytics: Mixpanel is initialized client-side in \[BaseLayout.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/links/src/layouts/BaseLayout.astro).
