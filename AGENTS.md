## Repo notes

### apps/fade

- Dev server: `pnpm -C apps/fade dev` (Vite, port 3000)
- Mixpanel env: `VITE_MIXPANEL_TOKEN` and `VITE_MIXPANEL_API_HOST` are required at runtime (see \[\_\_root.tsx\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/\_\_root.tsx))
- E2E (Playwright): `pnpm -C apps/fade test:e2e`
- Browsers install (one-time on a machine): `pnpm -C apps/fade exec playwright install`

### Non-technical knowledge

- This repo hosts multiple Shikanime Studio web properties (public sites + apps).
- www: Public-facing studio website at `https://shikanime.studio`.
- links: Link hub / landing page at `https://links.shikanime.studio`.
- fade: Local image viewer (WebGPU) at `https://fade.shikanime.studio`.
- reiya: Merch/community site at `https://reiya.shikanime.studio`.

### Technical knowledge

- Monorepo managed with pnpm workspaces.
- Each app deploys to Cloudflare via Wrangler (each app has its own `wrangler.jsonc`).
- Root `pnpm test` runs Vitest (currently exercised by tests under `apps/fade`).
- Astro apps use `PUBLIC_` env vars for client-side config; Vite/React app uses `VITE_` env vars.
