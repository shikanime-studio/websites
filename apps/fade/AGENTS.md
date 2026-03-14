## Repo notes

### Run

- Dev server: `pnpm dev` (Vite, port 3000)
- Unit tests: `pnpm test`
- E2E tests (Playwright): `pnpm test:e2e`
- Install Playwright browsers (one-time): `pnpm exec playwright install`

### Deploy

- Cloudflare Worker: `pnpm deploy` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/wrangler.jsonc))

### Env

- Required at runtime: `VITE_MIXPANEL_TOKEN`, `VITE_MIXPANEL_API_HOST` (used in \[\_\_root.tsx\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/\_\_root.tsx))
