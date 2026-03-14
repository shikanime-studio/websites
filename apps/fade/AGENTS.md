## Repo notes

### Non-technical knowledge

- Fade is a local image viewer powered by WebGPU (see [README.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/README.md)).
- Core user flows:
  - Pick a local directory and browse media via a filmstrip.
  - View images fullscreen with keyboard navigation.
  - Adjust rendering/lighting and inspect image metadata (EXIF).
  - Preview Fujifilm RAF (RAW) files.

### Run

- Dev server: `pnpm dev` (Vite, port 3000)
- Unit tests: `pnpm test`
- E2E tests (Playwright): `pnpm test:e2e`
- Install Playwright browsers (one-time): `pnpm exec playwright install`

### Deploy

- Cloudflare Worker: `pnpm deploy` (see \[wrangler.jsonc\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/wrangler.jsonc))

### Env

- Required at runtime: `VITE_MIXPANEL_TOKEN`, `VITE_MIXPANEL_API_HOST` (used in \[\_\_root.tsx\](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/src/routes/\_\_root.tsx))

### Technical knowledge

- Stack: React + Tailwind, WebGPU shaders, TanStack Router + Query (see [README.md](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/README.md)).
- Runtime/deploy target: Cloudflare Workers (Wrangler deploy; see [wrangler.jsonc](file:///Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/fade/wrangler.jsonc)).
- Browser support: requires a browser with WebGPU enabled/available.
