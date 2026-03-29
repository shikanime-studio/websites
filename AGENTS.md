# Website

## Quick start

- Install: `pnpm install`
- Run an app: `pnpm -C apps/<app> dev`
- Run unit tests: `pnpm test` (currently runs Fade’s Vitest suite)

### Apps

#### fade

- Dev server: `pnpm -C apps/fade dev` (Vite, port 3000)
- URL: `https://fade.shikanime.studio`
- Mixpanel env: `VITE_MIXPANEL_TOKEN`, `VITE_MIXPANEL_API_HOST`
  (see \[\_\_root.tsx\](apps/fade/src/routes/\_\_root.tsx))
- E2E (Playwright): `pnpm -C apps/fade test:e2e`
- Browsers install (one-time on a machine):
  `pnpm -C apps/fade exec playwright install`

#### links

- URL: `https://links.shikanime.studio`
- Dev server: `pnpm -C apps/links dev`

#### reiya

- URL: `https://reiya.shikanime.studio`
- Dev server: `pnpm -C apps/reiya dev`

#### www

- URL: `https://shikanime.studio`
- Dev server: `pnpm -C apps/www dev`

### Non-technical knowledge

- This repo hosts multiple Shikanime Studio web properties
  (public sites + apps).
- www: public-facing studio website.
- links: link hub / landing page.
- fade: local image viewer (WebGPU).
- reiya: merch/community site.

### Technical knowledge

- Monorepo managed with pnpm workspaces.
- Each app deploys to Cloudflare via Wrangler
  (each app has its own `wrangler.jsonc`).
- Root `pnpm test` runs Vitest (currently exercised by tests under `apps/fade`).
- Astro apps use `PUBLIC_` env vars for client-side config.
- Vite/React app uses `VITE_` env vars.
