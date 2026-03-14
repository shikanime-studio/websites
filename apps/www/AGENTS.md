## Repo notes

### Purpose

- This is the public-facing website for Shikanime Studio (see \[README.md\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/www/README.md)).
- Primary content: studio story, projects, and links to channels/apps.

### URLs

- Production: `https://shikanime.studio` (see \[astro.config.mjs\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/www/astro.config.mjs))

### Commands

- Dev server: `pnpm dev` (Astro)
- Typecheck: `pnpm check` (Astro check)
- Preview: `pnpm preview`

### Deploy

- Cloudflare Workers: `pnpm deploy` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/www/wrangler.jsonc))

### Configuration

- Mixpanel: `PUBLIC_MIXPANEL_TOKEN`, `PUBLIC_MIXPANEL_API_HOST` (used in \[BaseLayout.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/www/src/layouts/BaseLayout.astro))

### Technical notes

- Stack: Astro app deployed to Cloudflare Workers (Wrangler deploy).
- SEO: uses `@astrojs/sitemap` and a custom robots route (see \[robots.txt.ts\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/www/src/pages/robots.txt.ts)).
- Analytics: Mixpanel is initialized client-side in \[BaseLayout.astro\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/www/src/layouts/BaseLayout.astro).
